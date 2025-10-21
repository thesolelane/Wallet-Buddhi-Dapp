import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, timestamp, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User tiers enum
export enum UserTier {
  BASIC = "basic",
  PRO = "pro",
  PRO_PLUS = "pro_plus",
}

// Threat severity levels
export enum ThreatLevel {
  SAFE = "safe",
  SUSPICIOUS = "suspicious",
  DANGER = "danger",
  BLOCKED = "blocked",
}

// Token classification result
export enum TokenClassification {
  ALLOW = "allow",
  WARN = "warn",
  BLOCK = "block",
}

// Users/Wallets
export const wallets = pgTable("wallets", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  address: text("address").notNull().unique(),
  tier: text("tier").notNull().default("basic"), // basic, pro, pro_plus
  nickname: text("nickname"),
  solanaName: text("solana_name"), // e.g., "wbuddi.cooperanth.sol"
  connectedAt: timestamp("connected_at").notNull().defaultNow(),
});

export const insertWalletSchema = createInsertSchema(wallets).omit({
  id: true,
  connectedAt: true,
}).extend({
  tier: z.enum(["basic", "pro", "pro_plus"]).default("basic"),
});

export type InsertWallet = z.infer<typeof insertWalletSchema>;
export type Wallet = typeof wallets.$inferSelect;

// Detected tokens/transactions
export const transactions = pgTable("transactions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  walletId: varchar("wallet_id").notNull(),
  signature: text("signature").notNull().unique(),
  tokenAddress: text("token_address").notNull(),
  tokenName: text("token_name"),
  tokenSymbol: text("token_symbol"),
  amount: text("amount"),
  timestamp: timestamp("timestamp").notNull().defaultNow(),
  
  // Classification results
  localClassification: text("local_classification").notNull(), // allow, warn, block
  localThreatLevel: text("local_threat_level").notNull(), // safe, suspicious, danger, blocked
  localReason: text("local_reason"),
  
  // Deep3 AI results (Pro tier)
  deep3Classification: text("deep3_classification"),
  deep3ThreatScore: integer("deep3_threat_score"), // 0-100
  deep3Reason: text("deep3_reason"),
  deep3Metadata: text("deep3_metadata"), // JSON string
  
  // Final decision
  finalClassification: text("final_classification").notNull(),
  finalThreatLevel: text("final_threat_level").notNull(),
  
  // Action taken
  blocked: boolean("blocked").notNull().default(false),
});

export const insertTransactionSchema = createInsertSchema(transactions).omit({
  id: true,
  timestamp: true,
});

export type InsertTransaction = z.infer<typeof insertTransactionSchema>;
export type Transaction = typeof transactions.$inferSelect;

// Bot strategy types
export enum BotStrategy {
  DEX_ARBITRAGE = "dex_arbitrage",
  LIQUIDITY_PROVISION = "liquidity_provision",
  MARKET_MAKING = "market_making",
}

// Arbitrage bot configuration (Pro+ tier)
export const arbitrageBots = pgTable("arbitrage_bots", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  walletId: varchar("wallet_id").notNull(),
  botName: text("bot_name").notNull(),
  active: boolean("active").notNull().default(false),
  walletAddress: text("wallet_address").notNull(), // cooperanth.sol wallet
  strategy: text("strategy").notNull(), // dex_arbitrage, liquidity_provision, market_making
  minProfitThreshold: text("min_profit_threshold").notNull().default("0.01"), // 1%
  maxRiskScore: integer("max_risk_score").notNull().default(50), // 0-100 Deep3 score
  maxTradeSize: text("max_trade_size").notNull().default("10"), // SOL
  slippageTolerance: text("slippage_tolerance").notNull().default("0.5"), // 0.5%
  targetPairs: text("target_pairs").notNull().default("SOL/USDC,SOL/USDT"), // comma-separated
  dexAllowlist: text("dex_allowlist").notNull().default("raydium,orca,jupiter"), // comma-separated
  autoPauseConfig: text("auto_pause_config"), // JSON string
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertArbitrageBotSchema = createInsertSchema(arbitrageBots).omit({
  id: true,
  createdAt: true,
});

export type InsertArbitrageBot = z.infer<typeof insertArbitrageBotSchema>;
export type ArbitrageBot = typeof arbitrageBots.$inferSelect;

// Bot template schema for import validation
export const botTemplateSchema = z.object({
  name: z.string().min(1).max(100),
  strategy: z.enum(["dex_arbitrage", "liquidity_provision", "market_making"]),
  minProfitThreshold: z.number().min(0.001).max(1).default(0.01), // 0.1% to 100%
  maxRiskScore: z.number().int().min(0).max(100).default(50),
  maxTradeSize: z.number().positive().max(1000).default(10), // Max 1000 SOL
  slippageTolerance: z.number().min(0).max(10).default(0.5), // 0% to 10%
  targetPairs: z.array(z.string()).min(1).default(["SOL/USDC", "SOL/USDT"]),
  dexAllowlist: z.array(z.enum(["raydium", "orca", "jupiter", "phoenix"])).min(1).default(["raydium", "orca"]),
  autoPause: z.object({
    enabled: z.boolean().default(true),
    volatilityThreshold: z.number().min(0).max(100).default(20), // %
    maxDailyLoss: z.number().min(0).max(100).default(5), // SOL
    maxConsecutiveLosses: z.number().int().min(1).max(20).default(5),
  }).optional(),
});

export type BotTemplate = z.infer<typeof botTemplateSchema>;

// Arbitrage bot stats
export interface BotStats {
  totalTrades: number;
  profitableTrades: number;
  totalProfit: string;
  avgProfitPerTrade: string;
  uptime: number; // percentage
}

// Deep3 Labs API response types
export interface Deep3AnalysisResponse {
  tokenAddress: string;
  riskScore: number; // 0-100
  classification: "safe" | "suspicious" | "malicious";
  confidence: number; // 0-100
  metadata: {
    contractAge: number; // days
    holderCount: number;
    liquidityUSD: number;
    isHoneypot: boolean;
    isMintable: boolean;
    hasBlacklist: boolean;
    rugPullRisk: number; // 0-100
    socialScore: number; // 0-100
  };
  recommendations: string[];
}

// WebSocket message types
export interface WSMessage {
  type: "transaction" | "threat_detected" | "bot_update" | "tier_update";
  data: any;
}

// Tier feature flags
export interface TierFeatures {
  localClassifier: boolean;
  deep3Integration: boolean;
  arbitrageBots: boolean;
  maxBotsAllowed: number;
  realtimeMonitoring: boolean;
  historicalData: boolean; // days
  customRules: boolean;
}

export const TIER_FEATURES: Record<UserTier, TierFeatures> = {
  [UserTier.BASIC]: {
    localClassifier: true,
    deep3Integration: false,
    arbitrageBots: false,
    maxBotsAllowed: 0,
    realtimeMonitoring: true,
    historicalData: false,
    customRules: false,
  },
  [UserTier.PRO]: {
    localClassifier: true,
    deep3Integration: true,
    arbitrageBots: false,
    maxBotsAllowed: 0,
    realtimeMonitoring: true,
    historicalData: true,
    customRules: true,
  },
  [UserTier.PRO_PLUS]: {
    localClassifier: true,
    deep3Integration: true,
    arbitrageBots: true,
    maxBotsAllowed: 2,
    realtimeMonitoring: true,
    historicalData: true,
    customRules: true,
  },
};
