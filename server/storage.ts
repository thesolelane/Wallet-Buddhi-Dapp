import { randomUUID } from "crypto";
import type {
  WatchedWallet,
  InsertWatchedWallet,
  PurchasedToken,
  Alert,
  TokenMetadata,
} from "@shared/schema";

class MemStorage {
  private wallets = new Map<string, WatchedWallet>();
  private tokens = new Map<string, PurchasedToken>();
  private alerts = new Map<string, Alert>();

  // ===== Watched Wallets =====
  listWallets(): WatchedWallet[] {
    return Array.from(this.wallets.values()).sort((a, b) =>
      a.addedAt.localeCompare(b.addedAt),
    );
  }

  getWallet(id: string): WatchedWallet | undefined {
    return this.wallets.get(id);
  }

  getWalletByPubkey(pubkey: string): WatchedWallet | undefined {
    return Array.from(this.wallets.values()).find((w) => w.pubkey === pubkey);
  }

  createWallet(data: InsertWatchedWallet): WatchedWallet {
    const existing = this.getWalletByPubkey(data.pubkey);
    if (existing) return existing;
    const wallet: WatchedWallet = {
      id: randomUUID(),
      pubkey: data.pubkey,
      label: data.label,
      addedAt: new Date().toISOString(),
    };
    this.wallets.set(wallet.id, wallet);
    return wallet;
  }

  deleteWallet(id: string): boolean {
    // Also clean up tokens + alerts tied to this wallet
    for (const [tid, t] of this.tokens) {
      if (t.watchedWalletId === id) this.tokens.delete(tid);
    }
    for (const [aid, a] of this.alerts) {
      if (a.watchedWalletId === id) this.alerts.delete(aid);
    }
    return this.wallets.delete(id);
  }

  // ===== Purchased Tokens =====
  listTokens(walletId?: string): PurchasedToken[] {
    const all = Array.from(this.tokens.values());
    const filtered = walletId ? all.filter((t) => t.watchedWalletId === walletId) : all;
    return filtered.sort((a, b) => b.purchasedAt.localeCompare(a.purchasedAt));
  }

  findToken(walletId: string, mint: string): PurchasedToken | undefined {
    return Array.from(this.tokens.values()).find(
      (t) => t.watchedWalletId === walletId && t.mint === mint,
    );
  }

  recordPurchase(walletId: string, meta: TokenMetadata): PurchasedToken {
    const existing = this.findToken(walletId, meta.mint);
    if (existing) return existing;
    const token: PurchasedToken = {
      id: randomUUID(),
      watchedWalletId: walletId,
      mint: meta.mint,
      symbol: meta.symbol,
      name: meta.name,
      marketCapUsd: meta.marketCapUsd,
      priceUsd: meta.priceUsd,
      website: meta.website,
      twitter: meta.twitter,
      telegram: meta.telegram,
      discord: meta.discord,
      imageUrl: meta.imageUrl,
      creator: meta.creator,
      updateAuthority: meta.updateAuthority,
      sources: meta.sources,
      purchasedAt: new Date().toISOString(),
    };
    this.tokens.set(token.id, token);
    return token;
  }

  // ===== Alerts =====
  listAlerts(walletId?: string): Alert[] {
    const all = Array.from(this.alerts.values());
    const filtered = walletId ? all.filter((a) => a.watchedWalletId === walletId) : all;
    return filtered.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }

  createAlert(alert: Omit<Alert, "id" | "createdAt">): Alert {
    const row: Alert = {
      ...alert,
      id: randomUUID(),
      createdAt: new Date().toISOString(),
    };
    this.alerts.set(row.id, row);
    return row;
  }
}

export const storage = new MemStorage();
