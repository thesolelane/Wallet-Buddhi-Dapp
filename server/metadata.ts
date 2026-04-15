import type { TokenMetadata } from "@shared/schema";
import { Connection, PublicKey } from "@solana/web3.js";

const RPC_URL = process.env.SOLANA_RPC_URL || "https://api.mainnet-beta.solana.com";
const METAPLEX_PROGRAM_ID = new PublicKey("metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s");

const connection = new Connection(RPC_URL, "confirmed");

// ---------- DexScreener ----------
// https://docs.dexscreener.com/api/reference
async function fetchDexscreener(mint: string): Promise<Partial<TokenMetadata>> {
  try {
    const res = await fetch(`https://api.dexscreener.com/latest/dex/tokens/${mint}`);
    if (!res.ok) return {};
    const data: any = await res.json();
    const pairs: any[] = Array.isArray(data?.pairs) ? data.pairs : [];
    if (pairs.length === 0) return {};
    // Use the Solana pair with highest liquidity
    const solPairs = pairs.filter((p) => p.chainId === "solana");
    const pick = (solPairs.length ? solPairs : pairs).sort(
      (a, b) => (b?.liquidity?.usd ?? 0) - (a?.liquidity?.usd ?? 0),
    )[0];
    if (!pick) return {};
    const baseToken = pick.baseToken ?? {};
    const info = pick.info ?? {};
    const websites: any[] = Array.isArray(info.websites) ? info.websites : [];
    const socials: any[] = Array.isArray(info.socials) ? info.socials : [];
    const findSocial = (t: string) =>
      socials.find((s) => String(s?.type || "").toLowerCase() === t)?.url ?? null;
    return {
      symbol: baseToken.symbol ?? null,
      name: baseToken.name ?? null,
      priceUsd: pick.priceUsd ? Number(pick.priceUsd) : null,
      marketCapUsd: pick.marketCap ?? pick.fdv ?? null,
      website: websites[0]?.url ?? null,
      twitter: findSocial("twitter"),
      telegram: findSocial("telegram"),
      discord: findSocial("discord"),
      imageUrl: info.imageUrl ?? null,
    };
  } catch {
    return {};
  }
}

// ---------- Jupiter ----------
// https://tokens.jup.ag/token/<mint>
async function fetchJupiter(mint: string): Promise<Partial<TokenMetadata>> {
  try {
    const res = await fetch(`https://tokens.jup.ag/token/${mint}`);
    if (!res.ok) return {};
    const data: any = await res.json();
    return {
      symbol: data.symbol ?? null,
      name: data.name ?? null,
      imageUrl: data.logoURI ?? null,
    };
  } catch {
    return {};
  }
}

// ---------- Metaplex on-chain ----------
function findMetadataPda(mint: PublicKey): PublicKey {
  const [pda] = PublicKey.findProgramAddressSync(
    [Buffer.from("metadata"), METAPLEX_PROGRAM_ID.toBuffer(), mint.toBuffer()],
    METAPLEX_PROGRAM_ID,
  );
  return pda;
}

// Minimal Metaplex Metadata account decoder.
// Layout reference: https://docs.metaplex.com/programs/token-metadata/accounts
function decodeMetadata(data: Buffer): {
  updateAuthority: string;
  mint: string;
  name: string;
  symbol: string;
  uri: string;
  creators: string[];
} | null {
  try {
    let o = 1; // key (1 byte)
    const updateAuthority = new PublicKey(data.slice(o, o + 32)).toBase58();
    o += 32;
    const mint = new PublicKey(data.slice(o, o + 32)).toBase58();
    o += 32;
    const readStr = () => {
      const len = data.readUInt32LE(o);
      o += 4;
      const s = data.slice(o, o + len).toString("utf8").replace(/\0+$/, "");
      o += len;
      return s;
    };
    const name = readStr();
    const symbol = readStr();
    const uri = readStr();
    o += 2; // seller_fee_basis_points (u16)
    const hasCreators = data.readUInt8(o) === 1;
    o += 1;
    const creators: string[] = [];
    if (hasCreators) {
      const count = data.readUInt32LE(o);
      o += 4;
      for (let i = 0; i < count; i++) {
        creators.push(new PublicKey(data.slice(o, o + 32)).toBase58());
        o += 32;
        o += 1; // verified
        o += 1; // share
      }
    }
    return { updateAuthority, mint, name, symbol, uri, creators };
  } catch {
    return null;
  }
}

async function fetchMetaplex(mint: string): Promise<Partial<TokenMetadata>> {
  try {
    const mintPk = new PublicKey(mint);
    const pda = findMetadataPda(mintPk);
    const info = await connection.getAccountInfo(pda);
    if (!info?.data) return {};
    const decoded = decodeMetadata(info.data as Buffer);
    if (!decoded) return {};
    const base: Partial<TokenMetadata> = {
      symbol: decoded.symbol || null,
      name: decoded.name || null,
      updateAuthority: decoded.updateAuthority,
      creator: decoded.creators[0] ?? null,
    };
    // Fetch off-chain JSON for richer socials / image
    if (decoded.uri) {
      try {
        const ctrl = new AbortController();
        const tid = setTimeout(() => ctrl.abort(), 4000);
        const r = await fetch(decoded.uri, { signal: ctrl.signal });
        clearTimeout(tid);
        if (r.ok) {
          const j: any = await r.json();
          base.imageUrl = j.image ?? base.imageUrl ?? null;
          const ext = j.extensions ?? {};
          base.website = ext.website ?? j.external_url ?? null;
          base.twitter = ext.twitter ?? null;
          base.telegram = ext.telegram ?? null;
          base.discord = ext.discord ?? null;
        }
      } catch {
        // ignore off-chain fetch failure
      }
    }
    return base;
  } catch {
    return {};
  }
}

// ---------- Merge ----------
function pick<T>(...vals: (T | null | undefined)[]): T | null {
  for (const v of vals) if (v !== null && v !== undefined && v !== "") return v as T;
  return null;
}

export async function fetchTokenMetadata(mint: string): Promise<TokenMetadata> {
  const [dex, jup, mp] = await Promise.all([
    fetchDexscreener(mint),
    fetchJupiter(mint),
    fetchMetaplex(mint),
  ]);
  const sources: string[] = [];
  if (Object.keys(dex).length) sources.push("dexscreener");
  if (Object.keys(jup).length) sources.push("jupiter");
  if (Object.keys(mp).length) sources.push("metaplex");

  return {
    mint,
    symbol: pick(dex.symbol, jup.symbol, mp.symbol),
    name: pick(dex.name, jup.name, mp.name),
    marketCapUsd: (dex.marketCapUsd as number | null) ?? null,
    priceUsd: (dex.priceUsd as number | null) ?? null,
    website: pick(dex.website, mp.website),
    twitter: pick(dex.twitter, mp.twitter),
    telegram: pick(dex.telegram, mp.telegram),
    discord: pick(dex.discord, mp.discord),
    imageUrl: pick(dex.imageUrl, jup.imageUrl, mp.imageUrl),
    creator: pick(mp.creator),
    updateAuthority: pick(mp.updateAuthority),
    sources,
  };
}
