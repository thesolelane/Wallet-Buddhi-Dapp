import type { PurchasedToken } from "@shared/schema";
import { ExternalLink, Twitter, Send, Globe, MessageCircle } from "lucide-react";

function shortMint(m: string) {
  return `${m.slice(0, 4)}…${m.slice(-4)}`;
}

function formatMcap(n: number | null) {
  if (n == null) return "—";
  if (n >= 1e9) return `$${(n / 1e9).toFixed(2)}B`;
  if (n >= 1e6) return `$${(n / 1e6).toFixed(2)}M`;
  if (n >= 1e3) return `$${(n / 1e3).toFixed(1)}K`;
  return `$${n.toFixed(0)}`;
}

function SocialIcon({ url, icon: Icon, label }: { url: string | null; icon: any; label: string }) {
  if (!url) return null;
  return (
    <a
      href={url.startsWith("http") ? url : `https://${url}`}
      target="_blank"
      rel="noopener noreferrer"
      title={label}
      className="text-muted-foreground hover:text-foreground"
    >
      <Icon className="w-4 h-4" />
    </a>
  );
}

export function TokenTable({ tokens }: { tokens: PurchasedToken[] }) {
  if (tokens.length === 0) {
    return (
      <p className="text-sm text-muted-foreground py-8 text-center">
        No tokens recorded yet. The monitor polls every 30 seconds.
      </p>
    );
  }
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="text-xs uppercase text-muted-foreground border-b">
          <tr>
            <th className="text-left py-2 px-2">Token</th>
            <th className="text-left py-2 px-2">Mint</th>
            <th className="text-right py-2 px-2">Mcap @ buy</th>
            <th className="text-left py-2 px-2">Socials</th>
            <th className="text-left py-2 px-2">Sources</th>
            <th className="text-left py-2 px-2">Recorded</th>
          </tr>
        </thead>
        <tbody>
          {tokens.map((t) => (
            <tr key={t.id} className="border-b hover-elevate">
              <td className="py-2 px-2">
                <div className="flex items-center gap-2">
                  {t.imageUrl && (
                    <img src={t.imageUrl} alt="" className="w-6 h-6 rounded-full" />
                  )}
                  <div>
                    <div className="font-semibold">{t.symbol ?? "—"}</div>
                    <div className="text-xs text-muted-foreground">{t.name ?? ""}</div>
                  </div>
                </div>
              </td>
              <td className="py-2 px-2 font-mono text-xs">
                <a
                  href={`https://solscan.io/token/${t.mint}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 hover:underline"
                >
                  {shortMint(t.mint)} <ExternalLink className="w-3 h-3" />
                </a>
              </td>
              <td className="py-2 px-2 text-right">{formatMcap(t.marketCapUsd)}</td>
              <td className="py-2 px-2">
                <div className="flex items-center gap-3">
                  <SocialIcon url={t.website} icon={Globe} label="Website" />
                  <SocialIcon url={t.twitter} icon={Twitter} label="Twitter" />
                  <SocialIcon url={t.telegram} icon={Send} label="Telegram" />
                  <SocialIcon url={t.discord} icon={MessageCircle} label="Discord" />
                </div>
              </td>
              <td className="py-2 px-2 text-xs text-muted-foreground">
                {t.sources.join(", ") || "—"}
              </td>
              <td className="py-2 px-2 text-xs text-muted-foreground">
                {new Date(t.purchasedAt).toLocaleString()}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
