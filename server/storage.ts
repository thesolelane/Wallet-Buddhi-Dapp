import { 
  type Wallet, 
  type InsertWallet,
  type Transaction,
  type InsertTransaction,
  type ArbitrageBot,
  type InsertArbitrageBot,
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
}

export class MemStorage implements IStorage {
  private wallets: Map<string, Wallet>;
  private transactions: Map<string, Transaction>;
  private arbitrageBots: Map<string, ArbitrageBot>;

  constructor() {
    this.wallets = new Map();
    this.transactions = new Map();
    this.arbitrageBots = new Map();
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
}

export const storage = new MemStorage();
