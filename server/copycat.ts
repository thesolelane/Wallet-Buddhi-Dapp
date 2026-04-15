import type {
  Alert,
  PurchasedToken,
  Signal,
  TokenMetadata,
  Verdict,
} from "@shared/schema";

// Jaro-Winkler string similarity (0..1). Inline, no dep.
function jaroWinkler(a: string, b: string): number {
  if (a === b) return 1;
  if (!a || !b) return 0;
  const aLen = a.length;
  const bLen = b.length;
  const matchWindow = Math.max(0, Math.floor(Math.max(aLen, bLen) / 2) - 1);
  const aMatch = new Array(aLen).fill(false);
  const bMatch = new Array(bLen).fill(false);
  let matches = 0;
  for (let i = 0; i < aLen; i++) {
    const start = Math.max(0, i - matchWindow);
    const end = Math.min(i + matchWindow + 1, bLen);
    for (let j = start; j < end; j++) {
      if (bMatch[j]) continue;
      if (a[i] !== b[j]) continue;
      aMatch[i] = true;
      bMatch[j] = true;
      matches++;
      break;
    }
  }
  if (matches === 0) return 0;
  let t = 0;
  let k = 0;
  for (let i = 0; i < aLen; i++) {
    if (!aMatch[i]) continue;
    while (!bMatch[k]) k++;
    if (a[i] !== b[k]) t++;
    k++;
  }
  t /= 2;
  const m = matches;
  const jaro = (m / aLen + m / bLen + (m - t) / m) / 3;
  // Winkler prefix bonus
  let prefix = 0;
  for (let i = 0; i < Math.min(4, aLen, bLen); i++) {
    if (a[i] === b[i]) prefix++;
    else break;
  }
  return jaro + prefix * 0.1 * (1 - jaro);
}

function norm(s: string | null): string {
  return (s ?? "").trim().toLowerCase();
}

function urlHost(u: string | null): string | null {
  if (!u) return null;
  try {
    const url = new URL(u.startsWith("http") ? u : `https://${u}`);
    return url.host.replace(/^www\./, "").toLowerCase();
  } catch {
    return u.toLowerCase();
  }
}

function socialsOf(t: { website: string | null; twitter: string | null; telegram: string | null; discord: string | null }) {
  return [t.website, t.twitter, t.telegram, t.discord]
    .map(urlHost)
    .filter((x): x is string => !!x);
}

export type ScoreResult = {
  matchedToken: PurchasedToken;
  signals: Signal[];
  verdict: Verdict;
};

export function scoreAgainstRegistry(
  incoming: TokenMetadata,
  registry: PurchasedToken[],
): ScoreResult | null {
  let best: ScoreResult | null = null;

  for (const reg of registry) {
    if (reg.mint === incoming.mint) continue; // same token, not a copycat

    const signals: Signal[] = [];

    const regSym = norm(reg.symbol);
    const inSym = norm(incoming.symbol);
    if (regSym && inSym && regSym === inSym) {
      signals.push({
        type: "ticker_exact",
        confidence: 0.95,
        detail: `Identical ticker "${reg.symbol}" on a different contract`,
      });
    }

    const regName = norm(reg.name);
    const inName = norm(incoming.name);
    if (regName && inName && regName !== regSym) {
      const sim = jaroWinkler(regName, inName);
      if (sim >= 0.9 && regName !== inName) {
        signals.push({
          type: "name_fuzzy",
          confidence: 0.7,
          detail: `Name "${incoming.name}" ~= "${reg.name}" (sim ${sim.toFixed(2)})`,
        });
      } else if (sim === 1) {
        signals.push({
          type: "name_fuzzy",
          confidence: 0.85,
          detail: `Identical name "${reg.name}" on different contract`,
        });
      }
    }

    const regSocials = new Set(socialsOf(reg));
    const inSocials = socialsOf(incoming);
    const shared = inSocials.filter((h) => regSocials.has(h));
    if (shared.length > 0) {
      signals.push({
        type: "social_overlap",
        confidence: 0.8,
        detail: `Shared social host(s): ${shared.join(", ")}`,
      });
    }

    if (reg.creator && incoming.creator && reg.creator === incoming.creator) {
      signals.push({
        type: "creator_match",
        confidence: 0.9,
        detail: `Same creator ${reg.creator}`,
      });
    }

    if (signals.length === 0) continue;

    const maxConf = Math.max(...signals.map((s) => s.confidence));
    const sumConf = signals.reduce((acc, s) => acc + s.confidence, 0);
    let verdict: Verdict | null = null;
    if (maxConf >= 0.9) verdict = "DANGER";
    else if (sumConf >= 0.9) verdict = "SUSPICIOUS";
    if (!verdict) continue;

    const result: ScoreResult = { matchedToken: reg, signals, verdict };
    if (!best || (verdict === "DANGER" && best.verdict !== "DANGER") || sumConf > best.signals.reduce((a, s) => a + s.confidence, 0)) {
      best = result;
    }
  }

  return best;
}

export function buildAlert(
  walletId: string,
  incoming: TokenMetadata,
  result: ScoreResult,
): Omit<Alert, "id" | "createdAt"> {
  return {
    watchedWalletId: walletId,
    newMint: incoming.mint,
    newSymbol: incoming.symbol,
    newName: incoming.name,
    matchedTokenId: result.matchedToken.id,
    matchedMint: result.matchedToken.mint,
    matchedSymbol: result.matchedToken.symbol,
    matchedName: result.matchedToken.name,
    signals: result.signals,
    verdict: result.verdict,
  };
}
