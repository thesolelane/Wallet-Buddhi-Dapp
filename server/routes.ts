import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { storage } from "./storage";
import { classifier } from "./classifier";
import { deep3Service } from "./deep3-mock";
import { 
  insertWalletSchema, 
  insertTransactionSchema, 
  insertArbitrageBotSchema,
  insertNftPassSchema,
  botTemplateSchema,
  UserTier,
  TokenClassification,
  ThreatLevel,
  PaymentStatus,
  type InsertArbitrageBot,
} from "@shared/schema";
import { z } from "zod";
import {
  calculateBotMonthlyFee,
  calculateTransactionFee,
  calculateNextPaymentDue,
  getPaymentSummary,
  shouldAutoPauseBot,
  shouldDeleteBot,
  MONTHLY_FEE_SOL,
  TRANSACTION_FEE_PERCENT,
} from "./payment-utils";
import {
  fetchCathPriceInSol,
  fetchSolPriceInUsd,
  getCathHoldings,
  isBaseFeeWaived,
  resolveTier,
  convertUsdToSol,
  convertUsdToCath,
  PRICES,
  CATH_THRESHOLDS,
} from "./cath-utils";

export async function registerRoutes(app: Express): Promise<Server> {
  const httpServer = createServer(app);
  
  // WebSocket server for real-time monitoring
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });
  
  wss.on('connection', (ws: WebSocket) => {
    console.log('WebSocket client connected');
    
    ws.on('message', (message: string) => {
      console.log('Received:', message);
    });
    
    ws.on('close', () => {
      console.log('WebSocket client disconnected');
    });
  });
  
  // Broadcast to all connected clients
  function broadcast(data: any) {
    wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify(data));
      }
    });
  }
  
  // ============= WALLET ROUTES =============
  
  // Get wallet by address
  app.get("/api/wallets/:address", async (req: Request, res: Response) => {
    try {
      const wallet = await storage.getWalletByAddress(req.params.address);
      if (!wallet) {
        return res.status(404).json({ error: "Wallet not found" });
      }
      res.json(wallet);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch wallet" });
    }
  });
  
  // Create or update wallet
  app.post("/api/wallets", async (req: Request, res: Response) => {
    try {
      const data = insertWalletSchema.parse(req.body);
      
      // Check if wallet already exists
      const existing = await storage.getWalletByAddress(data.address);
      if (existing) {
        // Update tier if it has changed
        if (existing.tier !== data.tier) {
          const updated = await storage.updateWallet(existing.id, { tier: data.tier });
          return res.json(updated);
        }
        return res.json(existing);
      }
      
      const wallet = await storage.createWallet(data);
      res.json(wallet);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: "Failed to create wallet" });
    }
  });
  
  // Update wallet tier
  app.patch("/api/wallets/:id/tier", async (req: Request, res: Response) => {
    try {
      const { tier } = req.body;
      if (!Object.values(UserTier).includes(tier)) {
        return res.status(400).json({ error: "Invalid tier" });
      }
      
      const wallet = await storage.updateWallet(req.params.id, { tier });
      if (!wallet) {
        return res.status(404).json({ error: "Wallet not found" });
      }
      
      res.json(wallet);
    } catch (error) {
      res.status(500).json({ error: "Failed to update wallet tier" });
    }
  });
  
  // ============= TRANSACTION ROUTES =============
  
  // Get transactions for wallet
  app.get("/api/transactions/:walletAddress", async (req: Request, res: Response) => {
    try {
      const wallet = await storage.getWalletByAddress(req.params.walletAddress);
      if (!wallet) {
        return res.status(404).json({ error: "Wallet not found" });
      }
      
      const transactions = await storage.getTransactionsByWallet(wallet.id);
      res.json(transactions);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch transactions" });
    }
  });
  
  // Simulate incoming transaction (for testing)
  app.post("/api/transactions/simulate", async (req: Request, res: Response) => {
    try {
      const { walletAddress, tokenAddress, tokenName, tokenSymbol, amount } = req.body;
      
      const wallet = await storage.getWalletByAddress(walletAddress);
      if (!wallet) {
        return res.status(404).json({ error: "Wallet not found" });
      }
      
      // Local classification
      const localResult = classifier.classify({
        address: tokenAddress,
        name: tokenName,
        symbol: tokenSymbol,
      });
      
      // Deep3 analysis (Pro/Pro+ only)
      let deep3Result = null;
      let finalClassification = localResult.classification;
      let finalThreatLevel = localResult.threatLevel;
      
      // CRITICAL: CA-first rule - Local BLOCK always wins
      // Deep3 can only raise severity, never lower it
      if (wallet.tier === UserTier.PRO || wallet.tier === UserTier.PRO_PLUS) {
        deep3Result = await deep3Service.analyzeToken(tokenAddress);
        
        // Merge results using CA-first rule
        const merged = classifier.mergeWithDeep3(localResult, deep3Result.riskScore);
        finalClassification = merged.classification;
        finalThreatLevel = merged.threatLevel;
      }
      
      // Final safety check: If local blocked, final must be blocked
      if (localResult.classification === TokenClassification.BLOCK) {
        finalClassification = TokenClassification.BLOCK;
        finalThreatLevel = ThreatLevel.BLOCKED;
      }
      
      // Create transaction record
      const transaction = await storage.createTransaction({
        walletId: wallet.id,
        signature: `sig_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        tokenAddress,
        tokenName: tokenName || "Unknown Token",
        tokenSymbol: tokenSymbol || "???",
        amount: amount || "0",
        localClassification: localResult.classification,
        localThreatLevel: localResult.threatLevel,
        localReason: localResult.reason,
        deep3Classification: deep3Result?.classification,
        deep3ThreatScore: deep3Result?.riskScore,
        deep3Reason: deep3Result?.recommendations[0],
        deep3Metadata: deep3Result ? JSON.stringify(deep3Result.metadata) : null,
        finalClassification,
        finalThreatLevel,
        blocked: finalClassification === TokenClassification.BLOCK,
      });
      
      // Broadcast to WebSocket clients
      broadcast({
        type: "transaction",
        data: transaction,
      });
      
      if (finalThreatLevel !== ThreatLevel.SAFE) {
        broadcast({
          type: "threat_detected",
          data: {
            transaction,
            threatLevel: finalThreatLevel,
          },
        });
      }
      
      res.json(transaction);
    } catch (error) {
      console.error("Transaction simulation error:", error);
      res.status(500).json({ error: "Failed to process transaction" });
    }
  });
  
  // ============= ARBITRAGE BOT ROUTES =============
  
  // Get bots for wallet
  app.get("/api/arbitrage-bots/:walletAddress", async (req: Request, res: Response) => {
    try {
      const wallet = await storage.getWalletByAddress(req.params.walletAddress);
      if (!wallet) {
        return res.status(404).json({ error: "Wallet not found" });
      }
      
      if (wallet.tier !== UserTier.PRO_PLUS) {
        return res.json([]); // Only Pro+ has access
      }
      
      const bots = await storage.getArbitrageBotsByWallet(wallet.id);
      res.json(bots);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch bots" });
    }
  });
  
  // Create arbitrage bot
  app.post("/api/arbitrage-bots", async (req: Request, res: Response) => {
    try {
      const data = insertArbitrageBotSchema.parse(req.body);
      
      // Verify wallet exists and has Pro+ tier
      const wallet = await storage.getWallet(data.walletId);
      if (!wallet) {
        return res.status(404).json({ error: "Wallet not found" });
      }
      
      if (wallet.tier !== UserTier.PRO_PLUS) {
        return res.status(403).json({ error: "Pro+ tier required for arbitrage bots" });
      }
      
      // Check bot limit (2 included + 3 additional = 5 max)
      const existingBots = await storage.getArbitrageBotsByWallet(data.walletId);
      if (existingBots.length >= 5) {
        return res.status(400).json({ error: "Maximum 5 bots allowed per wallet" });
      }
      
      // First 2 bots are included (free monthly fee)
      const isIncludedBot = existingBots.length < 2;
      
      const bot = await storage.createArbitrageBot({
        ...data,
        isIncludedBot,
        paymentStatus: isIncludedBot ? PaymentStatus.WAIVED : PaymentStatus.CURRENT,
        nextPaymentDue: isIncludedBot ? null : calculateNextPaymentDue(),
      });
      
      res.json(bot);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: "Failed to create bot" });
    }
  });
  
  // Update bot (toggle active, change config)
  app.patch("/api/arbitrage-bots/:id", async (req: Request, res: Response) => {
    try {
      const updates = req.body;
      const currentBot = await storage.getArbitrageBot(req.params.id);
      
      if (!currentBot) {
        return res.status(404).json({ error: "Bot not found" });
      }
      
      // Track inactiveSince for lifecycle management
      if ('active' in updates) {
        if (updates.active === false && currentBot.active === true) {
          // Bot being deactivated
          updates.inactiveSince = new Date();
        } else if (updates.active === true && currentBot.active === false) {
          // Bot being reactivated
          updates.inactiveSince = null;
        }
      }
      
      const bot = await storage.updateArbitrageBot(req.params.id, updates);
      
      // Broadcast bot update
      broadcast({
        type: "bot_update",
        data: bot,
      });
      
      res.json(bot);
    } catch (error) {
      res.status(500).json({ error: "Failed to update bot" });
    }
  });
  
  // Delete bot
  app.delete("/api/arbitrage-bots/:id", async (req: Request, res: Response) => {
    try {
      const success = await storage.deleteArbitrageBot(req.params.id);
      if (!success) {
        return res.status(404).json({ error: "Bot not found" });
      }
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete bot" });
    }
  });
  
  // Import bot from template
  app.post("/api/arbitrage-bots/import", async (req: Request, res: Response) => {
    try {
      const { template, walletId } = req.body;
      
      // Validate wallet
      const wallet = await storage.getWallet(walletId);
      if (!wallet) {
        return res.status(404).json({ error: "Wallet not found" });
      }
      
      if (wallet.tier !== UserTier.PRO_PLUS) {
        return res.status(403).json({ error: "Pro+ tier required for arbitrage bots" });
      }
      
      // Check bot limit (2 included + 3 additional = 5 max)
      const existingBots = await storage.getArbitrageBotsByWallet(walletId);
      if (existingBots.length >= 5) {
        return res.status(400).json({ error: "Maximum 5 bots allowed per wallet" });
      }
      
      // Validate template against schema
      const validatedTemplate = botTemplateSchema.parse(template);
      
      // Generate unique bot wallet address
      const botAddress = `bot_${Math.random().toString(36).substr(2, 9)}.cooperanth.sol`;
      
      // First 2 bots are included (free monthly fee)
      const isIncludedBot = existingBots.length < 2;
      
      // Convert template to bot config
      const botData: InsertArbitrageBot = {
        walletId,
        botName: validatedTemplate.name,
        walletAddress: botAddress,
        active: false, // Start inactive for safety
        strategy: validatedTemplate.strategy,
        minProfitThreshold: validatedTemplate.minProfitThreshold.toString(),
        maxRiskScore: validatedTemplate.maxRiskScore,
        maxTradeSize: validatedTemplate.maxTradeSize.toString(),
        slippageTolerance: validatedTemplate.slippageTolerance.toString(),
        targetPairs: validatedTemplate.targetPairs.join(","),
        dexAllowlist: validatedTemplate.dexAllowlist.join(","),
        autoPauseConfig: validatedTemplate.autoPause ? JSON.stringify(validatedTemplate.autoPause) : null,
        isIncludedBot,
        paymentStatus: isIncludedBot ? PaymentStatus.WAIVED : PaymentStatus.CURRENT,
        nextPaymentDue: isIncludedBot ? null : calculateNextPaymentDue(),
      };
      
      // Create bot
      const bot = await storage.createArbitrageBot(botData);
      
      // Broadcast bot creation
      broadcast({
        type: "bot_update",
        data: bot,
      });
      
      res.json(bot);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          error: "Invalid bot template", 
          details: error.errors 
        });
      }
      console.error("Bot import error:", error);
      res.status(500).json({ error: "Failed to import bot template" });
    }
  });
  
  // ============= NFT PASS ROUTES =============
  
  // Get all activated passes for a wallet
  app.get("/api/passes/wallet/:walletId", async (req: Request, res: Response) => {
    try {
      const passes = await storage.getNftPassesByWallet(req.params.walletId);
      res.json(passes);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch passes" });
    }
  });
  
  // Get active (non-expired) passes for a wallet
  app.get("/api/passes/wallet/:walletId/active", async (req: Request, res: Response) => {
    try {
      const passes = await storage.getActivePassesByWallet(req.params.walletId);
      res.json(passes);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch active passes" });
    }
  });
  
  // Activate an NFT pass from user's wallet
  app.post("/api/passes/activate", async (req: Request, res: Response) => {
    try {
      const { walletId, nftMintAddress } = req.body;
      
      if (!walletId || !nftMintAddress) {
        return res.status(400).json({ error: "Missing required fields" });
      }
      
      // Verify wallet exists
      const wallet = await storage.getWallet(walletId);
      if (!wallet) {
        return res.status(404).json({ error: "Wallet not found" });
      }
      
      // Check if NFT mint address already activated
      const existing = await storage.getNftPassByMintAddress(nftMintAddress);
      if (existing) {
        return res.status(400).json({ error: "Pass already activated" });
      }
      
      // TODO: SECURITY - Verify NFT ownership in Solana wallet
      // In production: Use Solana RPC to verify wallet owns this NFT
      // const isOwner = await verifySolanaNFTOwnership(wallet.address, nftMintAddress);
      // if (!isOwner) {
      //   return res.status(403).json({ error: "Wallet does not own this NFT" });
      // }
      
      // TODO: SECURITY - Verify NFT was issued by DAO
      // In production: Check NFT creator/update authority matches DAO address
      // const nftMetadata = await fetchNFTMetadata(nftMintAddress);
      // if (nftMetadata.updateAuthority !== DAO_AUTHORITY_ADDRESS) {
      //   return res.status(403).json({ error: "NFT not issued by authorized DAO" });
      // }
      
      // TODO: Parse NFT metadata to extract pass details
      // For now, use placeholder data - will be replaced with actual NFT metadata
      const passData = {
        walletId,
        nftMintAddress,
        passName: "Wallet Buddhi Pass", // From NFT metadata
        rarity: "common", // From NFT metadata
        benefitType: "fee_waiver", // From NFT metadata
        traits: JSON.stringify({ power: "medium" }), // From NFT metadata
        isActive: true,
        expiresAt: null, // From NFT metadata (null = permanent)
        freeBotSlots: 0, // From NFT metadata
        feeWaiverMonths: null, // From NFT metadata (null = permanent)
        tierUpgrade: null, // From NFT metadata
      };
      
      const pass = await storage.createNftPass(passData);
      res.json({ 
        success: true, 
        pass,
        message: "Pass activated successfully" 
      });
    } catch (error) {
      console.error("Pass activation error:", error);
      res.status(500).json({ error: "Failed to activate pass" });
    }
  });
  
  // Deactivate/remove a pass (if user transfers NFT out of wallet)
  app.post("/api/passes/deactivate", async (req: Request, res: Response) => {
    try {
      const { nftMintAddress } = req.body;
      
      if (!nftMintAddress) {
        return res.status(400).json({ error: "Missing NFT mint address" });
      }
      
      const pass = await storage.getNftPassByMintAddress(nftMintAddress);
      if (!pass) {
        return res.status(404).json({ error: "Pass not found" });
      }
      
      // TODO: SECURITY - Verify NFT is no longer in wallet before deactivating
      // In production: Use Solana RPC to verify wallet no longer owns this NFT
      // const isOwner = await verifySolanaNFTOwnership(pass.walletId, nftMintAddress);
      // if (isOwner) {
      //   return res.status(400).json({ error: "NFT still owned by wallet - cannot deactivate" });
      // }
      
      await storage.updateNftPass(pass.id, { isActive: false });
      res.json({ success: true, message: "Pass deactivated" });
    } catch (error) {
      res.status(500).json({ error: "Failed to deactivate pass" });
    }
  });
  
  // ============= PAYMENT ROUTES =============
  
  // Get payment calculation summary for a wallet
  app.get("/api/payments/calculate/:walletId", async (req: Request, res: Response) => {
    try {
      const wallet = await storage.getWallet(req.params.walletId);
      if (!wallet) {
        return res.status(404).json({ error: "Wallet not found" });
      }
      
      const bots = await storage.getArbitrageBotsByWallet(req.params.walletId);
      const activePasses = await storage.getActivePassesByWallet(req.params.walletId);
      
      // Get CATH pricing and holdings
      const cathBalance = await getCathHoldings(wallet.address, wallet.cathBalance);
      const cathPriceInSol = await fetchCathPriceInSol();
      const cathValueInSol = cathBalance * cathPriceInSol;
      
      // Resolve tier
      const resolved = await resolveTier(wallet, cathBalance, cathPriceInSol, activePasses);
      
      // Check base fee waiver
      const baseFeeWaived = isBaseFeeWaived(cathBalance, cathPriceInSol);
      
      const summary = getPaymentSummary(bots, activePasses);
      
      res.json({
        // Existing bot fee summary
        ...summary,
        monthlyFeePerBot: MONTHLY_FEE_SOL,
        transactionFeePercent: TRANSACTION_FEE_PERCENT * 100,
        
        // App purchase info
        appPurchased: wallet.appPurchased,
        appPurchaseCostUsd: PRICES.APP_PURCHASE_USD,
        
        // Base fee info
        baseFeeStatus: wallet.baseFeeStatus,
        baseFeeCostUsd: PRICES.BASE_FEE_USD,
        baseFeeWaived,
        baseFeeWaivedReason: baseFeeWaived ? "cath_holdings" : wallet.baseFeeWaivedReason,
        baseFeeNextDue: wallet.baseFeeNextDue,
        
        // Tier info
        resolvedTier: resolved.tier,
        tierSource: resolved.source,
        paidTier: wallet.paidTier,
        paidTierStatus: wallet.paidTierStatus,
        proCostUsd: PRICES.PRO_TIER_USD,
        proPlusCostUsd: PRICES.PRO_PLUS_TIER_USD,
        
        // CATH holdings info
        cathBalance,
        cathValueInSol,
        cathPriceInSol,
        meetsProThreshold: resolved.meetsProThreshold,
        meetsProPlusThreshold: resolved.meetsProPlusThreshold,
        cathThresholds: CATH_THRESHOLDS,
        
        // Payment preferences
        paymentPreference: wallet.paymentPreference,
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to calculate payments" });
    }
  });
  
  // Process monthly bot payment
  app.post("/api/payments/bot-monthly", async (req: Request, res: Response) => {
    try {
      const { botId, paymentAmount, currency } = req.body;
      
      if (!botId || !paymentAmount || !currency) {
        return res.status(400).json({ error: "Missing required fields" });
      }
      
      const bot = await storage.getArbitrageBot(botId);
      if (!bot) {
        return res.status(404).json({ error: "Bot not found" });
      }
      
      // Get all bots for wallet to determine bot index
      const allBots = await storage.getArbitrageBotsByWallet(bot.walletId);
      const sortedBots = [...allBots].sort((a, b) => 
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      );
      const botIndex = sortedBots.findIndex((b) => b.id === botId);
      
      const activePasses = await storage.getActivePassesByWallet(bot.walletId);
      const requiredFee = calculateBotMonthlyFee(bot, activePasses, allBots.length, botIndex);
      
      // Validate payment amount (allow small buffer for conversion rates)
      if (paymentAmount < requiredFee * 0.95) {
        return res.status(400).json({ 
          error: "Insufficient payment", 
          required: requiredFee,
          provided: paymentAmount,
        });
      }
      
      // TODO: Process actual Solana payment via smart contract
      // For now, just update payment status
      
      const nextDue = calculateNextPaymentDue();
      await storage.updateArbitrageBot(botId, {
        paymentStatus: "current",
        lastPaymentDate: new Date(),
        nextPaymentDue: nextDue,
      });
      
      res.json({ 
        success: true, 
        nextPaymentDue: nextDue,
        message: "Payment processed successfully" 
      });
    } catch (error) {
      console.error("Payment processing error:", error);
      res.status(500).json({ error: "Failed to process payment" });
    }
  });
  
  // Calculate transaction fee
  app.post("/api/payments/transaction-fee", async (req: Request, res: Response) => {
    try {
      const { walletId, amount } = req.body;
      
      if (!walletId || amount === undefined) {
        return res.status(400).json({ error: "Missing required fields" });
      }
      
      const activePasses = await storage.getActivePassesByWallet(walletId);
      const fee = calculateTransactionFee(parseFloat(amount), activePasses);
      
      res.json({ 
        amount: parseFloat(amount),
        fee,
        feePercent: TRANSACTION_FEE_PERCENT * 100,
        total: parseFloat(amount) + fee,
        waived: fee === 0,
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to calculate transaction fee" });
    }
  });
  
  // ============= TIER RESOLUTION & CATH ROUTES =============
  
  // Resolve tier based on CATH holdings, subscriptions, and passes
  app.get("/api/tiers/resolve/:walletId", async (req: Request, res: Response) => {
    try {
      const wallet = await storage.getWallet(req.params.walletId);
      if (!wallet) {
        return res.status(404).json({ error: "Wallet not found" });
      }
      
      // Get CATH holdings (on-chain or cached)
      const cathBalance = await getCathHoldings(wallet.address, wallet.cathBalance);
      const cathPriceInSol = await fetchCathPriceInSol();
      const activePasses = await storage.getActivePassesByWallet(wallet.id);
      
      // Resolve tier
      const resolved = await resolveTier(wallet, cathBalance, cathPriceInSol, activePasses);
      
      // Update cached values
      await storage.updateWallet(wallet.id, {
        cathBalance: cathBalance.toString(),
        cathValueInSol: resolved.cathValueInSol.toString(),
        holdingsCheckedAt: new Date(),
      });
      
      // Broadcast tier update if changed
      if (wallet.tier !== resolved.tier) {
        broadcast({
          type: "tier_update",
          walletId: wallet.id,
          tier: resolved.tier,
          source: resolved.source,
        });
      }
      
      res.json(resolved);
    } catch (error) {
      console.error("Tier resolution error:", error);
      res.status(500).json({ error: "Failed to resolve tier" });
    }
  });
  
  // App purchase endpoint
  app.post("/api/payments/app-purchase", async (req: Request, res: Response) => {
    try {
      const { walletId, method, txSignature } = req.body;
      
      if (!walletId || !method) {
        return res.status(400).json({ error: "Missing required fields" });
      }
      
      const wallet = await storage.getWallet(walletId);
      if (!wallet) {
        return res.status(404).json({ error: "Wallet not found" });
      }
      
      if (wallet.appPurchased) {
        return res.status(400).json({ error: "App already purchased" });
      }
      
      // Calculate app purchase cost
      const costSol = await convertUsdToSol(PRICES.APP_PURCHASE_USD);
      const costCath = method === "CATH" ? await convertUsdToCath(PRICES.APP_PURCHASE_USD) : 0;
      
      // TODO: Process actual Solana payment via smart contract
      // Verify txSignature and deduct from wallet balance
      
      await storage.updateWallet(walletId, {
        appPurchased: true,
        appPurchasedAt: new Date(),
        appPurchaseTxSignature: txSignature || null,
      });
      
      res.json({
        success: true,
        costSol,
        costCath: method === "CATH" ? costCath : undefined,
        message: "App purchased successfully",
      });
    } catch (error) {
      console.error("App purchase error:", error);
      res.status(500).json({ error: "Failed to process app purchase" });
    }
  });
  
  // Base monthly fee payment
  app.post("/api/payments/base-monthly", async (req: Request, res: Response) => {
    try {
      const { walletId, method } = req.body;
      
      if (!walletId) {
        return res.status(400).json({ error: "Missing wallet ID" });
      }
      
      const wallet = await storage.getWallet(walletId);
      if (!wallet) {
        return res.status(404).json({ error: "Wallet not found" });
      }
      
      // Check if base fee is waived by CATH holdings
      const cathBalance = await getCathHoldings(wallet.address, wallet.cathBalance);
      const cathPriceInSol = await fetchCathPriceInSol();
      const waived = isBaseFeeWaived(cathBalance, cathPriceInSol);
      
      if (waived) {
        await storage.updateWallet(walletId, {
          baseFeeStatus: "waived",
          baseFeeWaivedReason: "cath_holdings",
          baseFeeNextDue: calculateNextPaymentDue(),
        });
        
        return res.json({
          success: true,
          waived: true,
          reason: "cath_holdings",
          message: "Base fee waived due to CATH holdings",
        });
      }
      
      // Calculate base fee
      const costSol = await convertUsdToSol(PRICES.BASE_FEE_USD);
      const costCath = method === "CATH" ? await convertUsdToCath(PRICES.BASE_FEE_USD) : 0;
      
      // TODO: Process actual Solana payment via smart contract
      
      await storage.updateWallet(walletId, {
        baseFeeStatus: "current",
        baseFeeLastPaidAt: new Date(),
        baseFeeNextDue: calculateNextPaymentDue(),
        baseFeeWaivedReason: null,
      });
      
      res.json({
        success: true,
        waived: false,
        costSol,
        costCath: method === "CATH" ? costCath : undefined,
        nextDue: calculateNextPaymentDue(),
        message: "Base fee payment processed",
      });
    } catch (error) {
      console.error("Base fee payment error:", error);
      res.status(500).json({ error: "Failed to process base fee payment" });
    }
  });
  
  // Tier subscription payment (Pro/Pro+)
  app.post("/api/payments/tier-subscription", async (req: Request, res: Response) => {
    try {
      const { walletId, tier, method } = req.body;
      
      if (!walletId || !tier || !method) {
        return res.status(400).json({ error: "Missing required fields" });
      }
      
      if (!["pro", "pro_plus"].includes(tier)) {
        return res.status(400).json({ error: "Invalid tier" });
      }
      
      const wallet = await storage.getWallet(walletId);
      if (!wallet) {
        return res.status(404).json({ error: "Wallet not found" });
      }
      
      // Calculate tier cost
      const tierCostUsd = tier === "pro_plus" ? PRICES.PRO_PLUS_TIER_USD : PRICES.PRO_TIER_USD;
      const costSol = await convertUsdToSol(tierCostUsd);
      const costCath = method === "CATH" ? await convertUsdToCath(tierCostUsd) : 0;
      
      // TODO: Process actual Solana payment via smart contract
      
      const nextDue = calculateNextPaymentDue();
      await storage.updateWallet(walletId, {
        paidTier: tier,
        paidTierStatus: "current",
        paidTierMethod: method,
        paidTierLastPaidAt: new Date(),
        paidTierNextDue: nextDue,
      });
      
      // Broadcast tier update
      broadcast({
        type: "tier_update",
        walletId: wallet.id,
        tier: tier,
        source: "subscription",
      });
      
      res.json({
        success: true,
        tier,
        costSol,
        costCath: method === "CATH" ? costCath : undefined,
        nextDue,
        message: `${tier.toUpperCase()} subscription activated`,
      });
    } catch (error) {
      console.error("Tier subscription error:", error);
      res.status(500).json({ error: "Failed to process tier subscription" });
    }
  });
  
  // Update payment preference
  app.patch("/api/wallets/:id/payment-preference", async (req: Request, res: Response) => {
    try {
      const { method } = req.body;
      
      if (!method || !["SOL", "CATH"].includes(method)) {
        return res.status(400).json({ error: "Invalid payment method" });
      }
      
      const wallet = await storage.updateWallet(req.params.id, { paymentPreference: method });
      if (!wallet) {
        return res.status(404).json({ error: "Wallet not found" });
      }
      
      res.json({ success: true, paymentPreference: method });
    } catch (error) {
      res.status(500).json({ error: "Failed to update payment preference" });
    }
  });
  
  // ============= DEEP3 ANALYSIS ROUTE =============
  
  // Get Deep3 analysis for specific token
  app.get("/api/deep3/analyze/:tokenAddress", async (req: Request, res: Response) => {
    try {
      const analysis = await deep3Service.analyzeToken(req.params.tokenAddress);
      res.json(analysis);
    } catch (error) {
      res.status(500).json({ error: "Failed to analyze token" });
    }
  });
  
  return httpServer;
}
