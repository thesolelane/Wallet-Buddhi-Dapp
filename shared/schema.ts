import { z } from "zod";

// ============== Watched Wallet ==============

export const watchedWalletSchema = z.object({
  id: z.string(),
  pubkey: z.string().min(32).max(44),
  label: z.string().optional(),
  addedAt: z.string(), // ISO
});
export type WatchedWallet = z.infer<typeof watchedWalletSchema>;

export const insertWatchedWalletSchema = z.object({
  pubkey: z.string().min(32).max(44),
  label: z.string().optional(),
});
export type InsertWatchedWallet = z.infer<typeof insertWatchedWalletSchema>;

// ============== Token Metadata ==============

export const tokenMetadataSchema = z.object({
  mint: z.string(),
  symbol: z.string().nullable(),
  name: z.string().nullable(),
  marketCapUsd: z.number().nullable(),
  priceUsd: z.number().nullable(),
  website: z.string().nullable(),
  twitter: z.string().nullable(),
  telegram: z.string().nullable(),
  discord: z.string().nullable(),
  imageUrl: z.string().nullable(),
  creator: z.string().nullable(),
  updateAuthority: z.string().nullable(),
  sources: z.array(z.string()), // ["dexscreener", "jupiter", "metaplex"]
});
export type TokenMetadata = z.infer<typeof tokenMetadataSchema>;

// ============== Purchased Token ==============

export const purchasedTokenSchema = z.object({
  id: z.string(),
  watchedWalletId: z.string(),
  mint: z.string(),
  symbol: z.string().nullable(),
  name: z.string().nullable(),
  marketCapUsd: z.number().nullable(),
  priceUsd: z.number().nullable(),
  website: z.string().nullable(),
  twitter: z.string().nullable(),
  telegram: z.string().nullable(),
  discord: z.string().nullable(),
  imageUrl: z.string().nullable(),
  creator: z.string().nullable(),
  updateAuthority: z.string().nullable(),
  sources: z.array(z.string()),
  purchasedAt: z.string(),
});
export type PurchasedToken = z.infer<typeof purchasedTokenSchema>;

// ============== Copycat Alert ==============

export const signalTypeSchema = z.enum([
  "ticker_exact",
  "name_fuzzy",
  "social_overlap",
  "creator_match",
]);
export type SignalType = z.infer<typeof signalTypeSchema>;

export const signalSchema = z.object({
  type: signalTypeSchema,
  confidence: z.number().min(0).max(1),
  detail: z.string(),
});
export type Signal = z.infer<typeof signalSchema>;

export const verdictSchema = z.enum(["SUSPICIOUS", "DANGER"]);
export type Verdict = z.infer<typeof verdictSchema>;

export const alertSchema = z.object({
  id: z.string(),
  watchedWalletId: z.string(),
  newMint: z.string(),
  newSymbol: z.string().nullable(),
  newName: z.string().nullable(),
  matchedTokenId: z.string(),
  matchedMint: z.string(),
  matchedSymbol: z.string().nullable(),
  matchedName: z.string().nullable(),
  signals: z.array(signalSchema),
  verdict: verdictSchema,
  createdAt: z.string(),
});
export type Alert = z.infer<typeof alertSchema>;
