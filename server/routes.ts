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
  UserTier,
  TokenClassification,
  ThreatLevel,
} from "@shared/schema";
import { z } from "zod";

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
      
      // Check bot limit (max 2)
      const existingBots = await storage.getArbitrageBotsByWallet(data.walletId);
      if (existingBots.length >= 2) {
        return res.status(400).json({ error: "Maximum 2 bots allowed per wallet" });
      }
      
      const bot = await storage.createArbitrageBot(data);
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
      const bot = await storage.updateArbitrageBot(req.params.id, updates);
      
      if (!bot) {
        return res.status(404).json({ error: "Bot not found" });
      }
      
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
