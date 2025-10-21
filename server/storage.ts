import { 
  type Wallet, 
  type InsertWallet,
  type Transaction,
  type InsertTransaction,
  type ArbitrageBot,
  type InsertArbitrageBot,
  type NftPass,
  type InsertNftPass,
  UserTier,
} from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // Wallets
  getWallet(id: string): Promise<Wallet | undefined>;
  getWalletByAddress(address: string): Promise<Wallet | undefined>;
  createWallet(wallet: InsertWallet): Promise<Wallet>;
  updateWallet(id: string, updates: Partial<Wallet>): Promise<Wallet | undefined>;
  deleteWallet(id: string): Promise<boolean>;
  
  // Transactions
  getTransaction(id: string): Promise<Transaction | undefined>;
  getTransactionsByWallet(walletId: string): Promise<Transaction[]>;
  createTransaction(transaction: InsertTransaction): Promise<Transaction>;
  
  // Arbitrage Bots
  getArbitrageBot(id: string): Promise<ArbitrageBot | undefined>;
  getArbitrageBotsByWallet(walletId: string): Promise<ArbitrageBot[]>;
  createArbitrageBot(bot: InsertArbitrageBot): Promise<ArbitrageBot>;
  updateArbitrageBot(id: string, updates: Partial<ArbitrageBot>): Promise<ArbitrageBot | undefined>;
  deleteArbitrageBot(id: string): Promise<boolean>;
  
  // NFT Passes
  getNftPass(id: string): Promise<NftPass | undefined>;
  getNftPassByMintAddress(mintAddress: string): Promise<NftPass | undefined>;
  getNftPassesByWallet(walletId: string): Promise<NftPass[]>;
  getActivePassesByWallet(walletId: string): Promise<NftPass[]>;
  createNftPass(pass: InsertNftPass): Promise<NftPass>;
  updateNftPass(id: string, updates: Partial<NftPass>): Promise<NftPass | undefined>;
  deleteNftPass(id: string): Promise<boolean>;
}

export class MemStorage implements IStorage {
  private wallets: Map<string, Wallet>;
  private transactions: Map<string, Transaction>;
  private arbitrageBots: Map<string, ArbitrageBot>;
  private nftPasses: Map<string, NftPass>;

  constructor() {
    this.wallets = new Map();
    this.transactions = new Map();
    this.arbitrageBots = new Map();
    this.nftPasses = new Map();
  }

  // Wallets
  async getWallet(id: string): Promise<Wallet | undefined> {
    return this.wallets.get(id);
  }

  async getWalletByAddress(address: string): Promise<Wallet | undefined> {
    return Array.from(this.wallets.values()).find(
      (wallet) => wallet.address === address,
    );
  }

  async createWallet(insertWallet: InsertWallet): Promise<Wallet> {
    const id = randomUUID();
    const wallet: Wallet = { 
      ...insertWallet,
      nickname: insertWallet.nickname ?? null,
      solanaName: insertWallet.solanaName ?? null,
      solBalance: insertWallet.solBalance ?? "0",
      cathBalance: insertWallet.cathBalance ?? "0",
      id,
      connectedAt: new Date(),
    };
    this.wallets.set(id, wallet);
    return wallet;
  }

  async updateWallet(id: string, updates: Partial<Wallet>): Promise<Wallet | undefined> {
    const wallet = this.wallets.get(id);
    if (!wallet) return undefined;
    
    const updated = { ...wallet, ...updates };
    this.wallets.set(id, updated);
    return updated;
  }

  async deleteWallet(id: string): Promise<boolean> {
    return this.wallets.delete(id);
  }

  // Transactions
  async getTransaction(id: string): Promise<Transaction | undefined> {
    return this.transactions.get(id);
  }

  async getTransactionsByWallet(walletId: string): Promise<Transaction[]> {
    return Array.from(this.transactions.values())
      .filter((tx) => tx.walletId === walletId)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }

  async createTransaction(insertTransaction: InsertTransaction): Promise<Transaction> {
    const id = randomUUID();
    const transaction: Transaction = {
      ...insertTransaction,
      tokenName: insertTransaction.tokenName ?? null,
      tokenSymbol: insertTransaction.tokenSymbol ?? null,
      amount: insertTransaction.amount ?? null,
      localReason: insertTransaction.localReason ?? null,
      deep3Classification: insertTransaction.deep3Classification ?? null,
      deep3ThreatScore: insertTransaction.deep3ThreatScore ?? null,
      deep3Reason: insertTransaction.deep3Reason ?? null,
      deep3Metadata: insertTransaction.deep3Metadata ?? null,
      blocked: insertTransaction.blocked ?? false,
      id,
      timestamp: new Date(),
    };
    this.transactions.set(id, transaction);
    return transaction;
  }

  // Arbitrage Bots
  async getArbitrageBot(id: string): Promise<ArbitrageBot | undefined> {
    return this.arbitrageBots.get(id);
  }

  async getArbitrageBotsByWallet(walletId: string): Promise<ArbitrageBot[]> {
    return Array.from(this.arbitrageBots.values())
      .filter((bot) => bot.walletId === walletId);
  }

  async createArbitrageBot(insertBot: InsertArbitrageBot): Promise<ArbitrageBot> {
    const id = randomUUID();
    const bot: ArbitrageBot = {
      ...insertBot,
      active: insertBot.active ?? false,
      minProfitThreshold: insertBot.minProfitThreshold ?? "0.01",
      maxRiskScore: insertBot.maxRiskScore ?? 50,
      maxTradeSize: insertBot.maxTradeSize ?? "10",
      slippageTolerance: insertBot.slippageTolerance ?? "0.5",
      targetPairs: insertBot.targetPairs ?? "SOL/USDC,SOL/USDT",
      dexAllowlist: insertBot.dexAllowlist ?? "raydium,orca,jupiter",
      autoPauseConfig: insertBot.autoPauseConfig ?? null,
      isIncludedBot: insertBot.isIncludedBot ?? false,
      paymentStatus: insertBot.paymentStatus ?? "current",
      lastPaymentDate: insertBot.lastPaymentDate ?? null,
      nextPaymentDue: insertBot.nextPaymentDue ?? null,
      inactiveSince: insertBot.inactiveSince ?? null,
      id,
      createdAt: new Date(),
    };
    this.arbitrageBots.set(id, bot);
    return bot;
  }

  async updateArbitrageBot(id: string, updates: Partial<ArbitrageBot>): Promise<ArbitrageBot | undefined> {
    const bot = this.arbitrageBots.get(id);
    if (!bot) return undefined;
    
    const updated = { ...bot, ...updates };
    this.arbitrageBots.set(id, updated);
    return updated;
  }

  async deleteArbitrageBot(id: string): Promise<boolean> {
    return this.arbitrageBots.delete(id);
  }

  // NFT Passes
  async getNftPass(id: string): Promise<NftPass | undefined> {
    return this.nftPasses.get(id);
  }

  async getNftPassByMintAddress(mintAddress: string): Promise<NftPass | undefined> {
    return Array.from(this.nftPasses.values()).find(
      (pass) => pass.nftMintAddress === mintAddress
    );
  }

  async getNftPassesByWallet(walletId: string): Promise<NftPass[]> {
    return Array.from(this.nftPasses.values())
      .filter((pass) => pass.walletId === walletId);
  }

  async getActivePassesByWallet(walletId: string): Promise<NftPass[]> {
    const now = new Date();
    return Array.from(this.nftPasses.values())
      .filter((pass) => 
        pass.walletId === walletId && 
        pass.isActive && 
        (pass.expiresAt === null || new Date(pass.expiresAt) > now)
      );
  }

  async createNftPass(insertPass: InsertNftPass): Promise<NftPass> {
    const id = randomUUID();
    const pass: NftPass = {
      ...insertPass,
      traits: insertPass.traits ?? null,
      isActive: insertPass.isActive ?? true,
      expiresAt: insertPass.expiresAt ?? null,
      freeBotSlots: insertPass.freeBotSlots ?? 0,
      feeWaiverMonths: insertPass.feeWaiverMonths ?? null,
      tierUpgrade: insertPass.tierUpgrade ?? null,
      id,
      claimedAt: new Date(),
    };
    this.nftPasses.set(id, pass);
    return pass;
  }

  async updateNftPass(id: string, updates: Partial<NftPass>): Promise<NftPass | undefined> {
    const pass = this.nftPasses.get(id);
    if (!pass) return undefined;
    
    const updated = { ...pass, ...updates };
    this.nftPasses.set(id, updated);
    return updated;
  }

  async deleteNftPass(id: string): Promise<boolean> {
    return this.nftPasses.delete(id);
  }
}

export const storage = new MemStorage();
