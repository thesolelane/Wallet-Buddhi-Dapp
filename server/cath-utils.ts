import type { Wallet, NftPass } from "@shared/schema";
import { isPassValid } from "./payment-utils";

/**
 * Price constants (will be fetched from oracle in production)
 */
export const PRICES = {
  APP_PURCHASE_USD: 0.99,
  BASE_FEE_USD: 0.99,
  PRO_TIER_USD: 9.99,
  PRO_PLUS_TIER_USD: 29.99,
};

/**
 * CATH holding thresholds
 */
export const CATH_THRESHOLDS = {
  BASE_FEE_WAIVER_SOL: 0.1, // Hold CATH worth ≥ 0.1 SOL to waive base fee
  PRO_TIER_TOKENS: 50, // Hold 50 CATH to get Pro tier
  PRO_PLUS_TIER_TOKENS: 100, // Hold 100 CATH to get Pro+ tier
};

// Cache for price data (TTL: 60 seconds)
interface PriceCache {
  cathPriceInSol: number;
  solPriceInUsd: number;
  updatedAt: Date;
}

let priceCache: PriceCache | null = null;
const PRICE_CACHE_TTL_MS = 60000; // 60 seconds

/**
 * Fetch CATH price in SOL
 * In production: Use Jupiter/Raydium API or price oracle
 * For now: Mock price
 */
export async function fetchCathPriceInSol(): Promise<number> {
  // Check cache
  if (priceCache && Date.now() - priceCache.updatedAt.getTime() < PRICE_CACHE_TTL_MS) {
    return priceCache.cathPriceInSol;
  }

  // TODO: Fetch from Jupiter/Raydium API
  // const response = await fetch('https://price.jup.ag/v4/price?ids=CATH');
  // const data = await response.json();
  // const cathPriceInSol = data.data.CATH.price;

  // Mock price for development: 1 CATH = 0.005 SOL
  const cathPriceInSol = 0.005;

  // Update cache
  priceCache = {
    cathPriceInSol,
    solPriceInUsd: priceCache?.solPriceInUsd || 100, // Keep SOL price if cached
    updatedAt: new Date(),
  };

  return cathPriceInSol;
}

/**
 * Fetch SOL price in USD
 * In production: Use price oracle/API
 * For now: Mock price
 */
export async function fetchSolPriceInUsd(): Promise<number> {
  // Check cache
  if (priceCache && Date.now() - priceCache.updatedAt.getTime() < PRICE_CACHE_TTL_MS) {
    return priceCache.solPriceInUsd;
  }

  // TODO: Fetch from price API
  // const response = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=solana&vs_currencies=usd');
  // const data = await response.json();
  // const solPriceInUsd = data.solana.usd;

  // Mock price for development
  const solPriceInUsd = 100;

  // Update cache
  priceCache = {
    cathPriceInSol: priceCache?.cathPriceInSol || 0.005, // Keep CATH price if cached
    solPriceInUsd,
    updatedAt: new Date(),
  };

  return solPriceInUsd;
}

/**
 * Get CATH token holdings for a wallet
 * In production: Fetch on-chain SPL token balance
 * For now: Use cached balance from wallet
 */
export async function getCathHoldings(walletAddress: string, cachedBalance?: string): Promise<number> {
  // TODO: Fetch on-chain balance via Solana RPC
  // const connection = new Connection(SOLANA_RPC_URL);
  // const tokenAccounts = await connection.getParsedTokenAccountsByOwner(
  //   new PublicKey(walletAddress),
  //   { mint: new PublicKey(CATH_MINT_ADDRESS) }
  // );
  // const balance = tokenAccounts.value[0]?.account.data.parsed.info.tokenAmount.uiAmount || 0;

  // Use cached balance for development
  return parseFloat(cachedBalance || "0");
}

/**
 * Check if base monthly fee should be waived based on CATH holdings
 * @param cathBalance CATH token balance
 * @param cathPriceInSol CATH price in SOL
 * @returns True if holdings ≥ 0.1 SOL value
 */
export function isBaseFeeWaived(cathBalance: number, cathPriceInSol: number): boolean {
  const cathValueInSol = cathBalance * cathPriceInSol;
  return cathValueInSol >= CATH_THRESHOLDS.BASE_FEE_WAIVER_SOL;
}

/**
 * Tier source enum
 */
export type TierSource = "cath_holdings" | "subscription" | "nft_pass" | "default";

/**
 * Resolved tier result
 */
export interface ResolvedTier {
  tier: "basic" | "pro" | "pro_plus";
  source: TierSource;
  cathBalance: number;
  cathValueInSol: number;
  meetsProThreshold: boolean;
  meetsProPlusThreshold: boolean;
  hasPaidSubscription: boolean;
}

/**
 * Resolve user's tier based on CATH holdings, subscriptions, and passes
 * Priority: CATH holdings > NFT passes > Paid subscription > Default (basic)
 * 
 * @param wallet Wallet data
 * @param cathBalance Current CATH balance
 * @param cathPriceInSol Current CATH price in SOL
 * @param activePasses Active NFT passes (for tier upgrades)
 * @returns Resolved tier information
 */
export async function resolveTier(
  wallet: Wallet,
  cathBalance: number,
  cathPriceInSol: number,
  activePasses: NftPass[] = []
): Promise<ResolvedTier> {
  const cathValueInSol = cathBalance * cathPriceInSol;
  const meetsProPlusThreshold = cathBalance >= CATH_THRESHOLDS.PRO_PLUS_TIER_TOKENS;
  const meetsProThreshold = cathBalance >= CATH_THRESHOLDS.PRO_TIER_TOKENS;
  
  // Check paid subscription status
  const hasPaidSubscription = wallet.paidTierStatus === "current" && wallet.paidTier !== "none";

  // Priority 1: CATH holdings
  if (meetsProPlusThreshold) {
    return {
      tier: "pro_plus",
      source: "cath_holdings",
      cathBalance,
      cathValueInSol,
      meetsProThreshold: true,
      meetsProPlusThreshold: true,
      hasPaidSubscription,
    };
  }

  if (meetsProThreshold) {
    return {
      tier: "pro",
      source: "cath_holdings",
      cathBalance,
      cathValueInSol,
      meetsProThreshold: true,
      meetsProPlusThreshold: false,
      hasPaidSubscription,
    };
  }

  // Priority 2: NFT pass tier upgrades
  const validTierUpgradePasses = activePasses.filter(
    (pass) => pass.benefitType === "tier_upgrade" && pass.tierUpgrade && isPassValid(pass)
  );

  if (validTierUpgradePasses.length > 0) {
    // Find highest tier from passes
    const hasProPlusPass = validTierUpgradePasses.some((p) => p.tierUpgrade === "pro_plus");
    const hasProPass = validTierUpgradePasses.some((p) => p.tierUpgrade === "pro");

    if (hasProPlusPass) {
      return {
        tier: "pro_plus",
        source: "nft_pass",
        cathBalance,
        cathValueInSol,
        meetsProThreshold: false,
        meetsProPlusThreshold: false,
        hasPaidSubscription,
      };
    }

    if (hasProPass) {
      return {
        tier: "pro",
        source: "nft_pass",
        cathBalance,
        cathValueInSol,
        meetsProThreshold: false,
        meetsProPlusThreshold: false,
        hasPaidSubscription,
      };
    }
  }

  // Priority 3: Paid subscription
  if (hasPaidSubscription) {
    return {
      tier: wallet.paidTier as "pro" | "pro_plus",
      source: "subscription",
      cathBalance,
      cathValueInSol,
      meetsProThreshold: false,
      meetsProPlusThreshold: false,
      hasPaidSubscription: true,
    };
  }

  // Default: Basic tier
  return {
    tier: "basic",
    source: "default",
    cathBalance,
    cathValueInSol,
    meetsProThreshold: false,
    meetsProPlusThreshold: false,
    hasPaidSubscription: false,
  };
}

/**
 * Convert USD amount to SOL
 */
export async function convertUsdToSol(usdAmount: number): Promise<number> {
  const solPrice = await fetchSolPriceInUsd();
  return usdAmount / solPrice;
}

/**
 * Convert SOL amount to CATH tokens
 */
export async function convertSolToCath(solAmount: number): Promise<number> {
  const cathPrice = await fetchCathPriceInSol();
  return solAmount / cathPrice;
}

/**
 * Convert USD amount to CATH tokens
 */
export async function convertUsdToCath(usdAmount: number): Promise<number> {
  const solAmount = await convertUsdToSol(usdAmount);
  return convertSolToCath(solAmount);
}
