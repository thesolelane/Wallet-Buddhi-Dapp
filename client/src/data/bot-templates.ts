import { type BotTemplate } from "@shared/schema";

export const exampleBotTemplates: Record<string, BotTemplate> = {
  conservativeArbitrage: {
    name: "Conservative DEX Arbitrage",
    strategy: "dex_arbitrage",
    minProfitThreshold: 0.02, // 2%
    maxRiskScore: 40,
    maxTradeSize: 5,
    slippageTolerance: 0.5,
    targetPairs: ["SOL/USDC", "SOL/USDT"],
    dexAllowlist: ["raydium", "orca"],
    autoPause: {
      enabled: true,
      volatilityThreshold: 15,
      maxDailyLoss: 3,
      maxConsecutiveLosses: 3,
    },
  },
  
  liquidityProvider: {
    name: "Stable Liquidity Provider",
    strategy: "liquidity_provision",
    minProfitThreshold: 0.005, // 0.5%
    maxRiskScore: 30,
    maxTradeSize: 20,
    slippageTolerance: 1.0,
    targetPairs: ["SOL/USDC", "SOL/USDT", "USDC/USDT"],
    dexAllowlist: ["raydium", "orca", "phoenix"],
    autoPause: {
      enabled: true,
      volatilityThreshold: 25,
      maxDailyLoss: 10,
      maxConsecutiveLosses: 5,
    },
  },
  
  aggressiveMarketMaker: {
    name: "Aggressive Market Maker",
    strategy: "market_making",
    minProfitThreshold: 0.01, // 1%
    maxRiskScore: 60,
    maxTradeSize: 15,
    slippageTolerance: 2.0,
    targetPairs: ["SOL/USDC", "SOL/USDT", "SOL/RAY", "SOL/BONK"],
    dexAllowlist: ["raydium", "orca", "jupiter"],
    autoPause: {
      enabled: true,
      volatilityThreshold: 30,
      maxDailyLoss: 8,
      maxConsecutiveLosses: 4,
    },
  },
};

export const templateDescriptions: Record<string, string> = {
  conservativeArbitrage: "Low-risk strategy focusing on safe arbitrage opportunities between major DEXes. 2% minimum profit with strict risk controls.",
  liquidityProvider: "Provide liquidity to stable pairs with minimal impermanent loss. Lower profit requirements but higher volume.",
  aggressiveMarketMaker: "Active market making across multiple pairs. Higher risk tolerance for greater profit potential.",
};
