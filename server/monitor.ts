import { Connection, PublicKey } from "@solana/web3.js";
import { storage } from "./storage";
import { fetchTokenMetadata } from "./metadata";
import { scoreAgainstRegistry, buildAlert } from "./copycat";
import type { Alert, PurchasedToken, WatchedWallet } from "@shared/schema";

const TOKEN_PROGRAM_ID = new PublicKey("TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA");
const TOKEN_2022_PROGRAM_ID = new PublicKey("TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb");
const RPC_URL = process.env.SOLANA_RPC_URL || "https://api.mainnet-beta.solana.com";
const POLL_INTERVAL_MS = 30_000;

const connection = new Connection(RPC_URL, "confirmed");

type EventHandler = (event:
  | { type: "purchase"; walletId: string; token: PurchasedToken }
  | { type: "alert"; walletId: string; alert: Alert }
) => void;

class Monitor {
  private lastSeen = new Map<string, Set<string>>(); // walletId -> mints
  private timer: NodeJS.Timeout | null = null;
  private handlers: EventHandler[] = [];
  private running = false;

  onEvent(h: EventHandler) {
    this.handlers.push(h);
  }

  private emit(e: Parameters<EventHandler>[0]) {
    for (const h of this.handlers) {
      try {
        h(e);
      } catch (err) {
        console.error("monitor handler error", err);
      }
    }
  }

  start() {
    if (this.running) return;
    this.running = true;
    this.tick().catch((e) => console.error("monitor tick error", e));
    this.timer = setInterval(() => {
      this.tick().catch((e) => console.error("monitor tick error", e));
    }, POLL_INTERVAL_MS);
  }

  stop() {
    this.running = false;
    if (this.timer) clearInterval(this.timer);
    this.timer = null;
  }

  /** Force-check a single wallet immediately (e.g. right after user adds it). */
  async checkWallet(wallet: WatchedWallet) {
    await this.scanWallet(wallet, /*initial*/ false);
  }

  private async tick() {
    const wallets = storage.listWallets();
    for (const w of wallets) {
      await this.scanWallet(w, false).catch((e) =>
        console.error(`scan ${w.pubkey} failed`, e),
      );
    }
  }

  private async scanWallet(wallet: WatchedWallet, _initial: boolean) {
    const owner = new PublicKey(wallet.pubkey);
    const [r1, r2] = await Promise.all([
      connection.getParsedTokenAccountsByOwner(owner, { programId: TOKEN_PROGRAM_ID }),
      connection.getParsedTokenAccountsByOwner(owner, { programId: TOKEN_2022_PROGRAM_ID }).catch(() => ({ value: [] as any[] })),
    ]);
    const accounts = [...r1.value, ...r2.value];
    const currentMints = new Set<string>();
    for (const acc of accounts) {
      const info: any = acc.account.data.parsed?.info;
      const amount = Number(info?.tokenAmount?.uiAmount ?? 0);
      if (amount > 0 && info?.mint) currentMints.add(info.mint as string);
    }

    const prior = this.lastSeen.get(wallet.id);
    this.lastSeen.set(wallet.id, currentMints);

    if (!prior) {
      // First scan: treat all current holdings as "already purchased" baseline.
      // Record them in the registry but do not fire copycat alerts for the initial batch.
      for (const mint of currentMints) {
        if (!storage.findToken(wallet.id, mint)) {
          try {
            const meta = await fetchTokenMetadata(mint);
            const token = storage.recordPurchase(wallet.id, meta);
            this.emit({ type: "purchase", walletId: wallet.id, token });
          } catch (e) {
            console.error(`metadata fetch ${mint} failed`, e);
          }
        }
      }
      return;
    }

    // New mints since last scan
    const newMints = [...currentMints].filter((m) => !prior.has(m));
    for (const mint of newMints) {
      try {
        const meta = await fetchTokenMetadata(mint);
        // Score against existing registry BEFORE inserting this token
        const registry = storage.listTokens(wallet.id);
        const match = scoreAgainstRegistry(meta, registry);
        const token = storage.recordPurchase(wallet.id, meta);
        this.emit({ type: "purchase", walletId: wallet.id, token });
        if (match) {
          const alert = storage.createAlert(buildAlert(wallet.id, meta, match));
          this.emit({ type: "alert", walletId: wallet.id, alert });
        }
      } catch (e) {
        console.error(`process new mint ${mint} failed`, e);
      }
    }
  }
}

export const monitor = new Monitor();
