import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { PublicKey } from "@solana/web3.js";
import { storage } from "./storage";
import { fetchTokenMetadata } from "./metadata";
import { scoreAgainstRegistry, buildAlert } from "./copycat";
import { monitor } from "./monitor";
import { insertWatchedWalletSchema } from "@shared/schema";

function validatePubkey(s: string): boolean {
  try {
    new PublicKey(s);
    return true;
  } catch {
    return false;
  }
}

export async function registerRoutes(app: Express): Promise<Server> {
  const httpServer = createServer(app);
  const wss = new WebSocketServer({ server: httpServer, path: "/ws" });

  wss.on("connection", (ws) => {
    ws.send(JSON.stringify({ type: "hello" }));
  });

  function broadcast(payload: unknown) {
    const msg = JSON.stringify(payload);
    for (const client of wss.clients) {
      if (client.readyState === WebSocket.OPEN) client.send(msg);
    }
  }

  monitor.onEvent((event) => {
    broadcast(event);
  });

  // ===== Watched wallets =====
  app.get("/api/wallets", (_req: Request, res: Response) => {
    res.json(storage.listWallets());
  });

  app.post("/api/wallets", async (req: Request, res: Response) => {
    try {
      const parsed = insertWatchedWalletSchema.parse(req.body);
      if (!validatePubkey(parsed.pubkey)) {
        return res.status(400).json({ error: "Invalid Solana public key" });
      }
      const wallet = storage.createWallet(parsed);
      // Kick off an immediate baseline scan in the background
      monitor.checkWallet(wallet).catch((e) =>
        console.error("initial scan failed", e),
      );
      res.status(201).json(wallet);
    } catch (e: any) {
      res.status(400).json({ error: e?.message ?? "Invalid request" });
    }
  });

  app.delete("/api/wallets/:id", (req: Request, res: Response) => {
    const ok = storage.deleteWallet(req.params.id);
    if (!ok) return res.status(404).json({ error: "Not found" });
    res.status(204).end();
  });

  app.get("/api/wallets/:id/tokens", (req: Request, res: Response) => {
    const wallet = storage.getWallet(req.params.id);
    if (!wallet) return res.status(404).json({ error: "Wallet not found" });
    res.json(storage.listTokens(req.params.id));
  });

  app.get("/api/wallets/:id/alerts", (req: Request, res: Response) => {
    const wallet = storage.getWallet(req.params.id);
    if (!wallet) return res.status(404).json({ error: "Wallet not found" });
    res.json(storage.listAlerts(req.params.id));
  });

  // Manual check: given a mint, return its metadata and (optionally) a copycat
  // match against the specified watched wallet's registry.
  app.post("/api/tokens/check/:mint", async (req: Request, res: Response) => {
    const mint = req.params.mint;
    if (!validatePubkey(mint)) {
      return res.status(400).json({ error: "Invalid mint address" });
    }
    const walletId = typeof req.body?.walletId === "string" ? req.body.walletId : null;
    try {
      const metadata = await fetchTokenMetadata(mint);
      let match = null;
      if (walletId) {
        const wallet = storage.getWallet(walletId);
        if (!wallet) return res.status(404).json({ error: "Wallet not found" });
        const registry = storage.listTokens(walletId);
        const m = scoreAgainstRegistry(metadata, registry);
        if (m) {
          match = buildAlert(walletId, metadata, m);
        }
      }
      res.json({ metadata, match });
    } catch (e: any) {
      res.status(500).json({ error: e?.message ?? "Failed to fetch metadata" });
    }
  });

  // Start background monitoring
  monitor.start();

  return httpServer;
}
