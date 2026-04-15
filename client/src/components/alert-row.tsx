import type { Alert } from "@shared/schema";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, XCircle, ExternalLink } from "lucide-react";

function shortMint(m: string) {
  return `${m.slice(0, 4)}…${m.slice(-4)}`;
}

export function AlertRow({ alert }: { alert: Alert }) {
  const danger = alert.verdict === "DANGER";
  return (
    <div className={`rounded-lg border p-4 ${danger ? "border-danger/40 bg-danger/5" : "border-warning/40 bg-warning/5"}`}>
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          {danger ? (
            <XCircle className="w-5 h-5 text-danger mt-0.5" />
          ) : (
            <AlertTriangle className="w-5 h-5 text-warning mt-0.5" />
          )}
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <Badge
                variant="outline"
                className={danger ? "bg-danger/10 text-danger border-danger/30" : "bg-warning/10 text-warning border-warning/30"}
              >
                {alert.verdict}
              </Badge>
              <span className="font-semibold">{alert.newSymbol ?? "Unknown"}</span>
              <span className="text-sm text-muted-foreground">{alert.newName ?? ""}</span>
            </div>
            <a
              href={`https://solscan.io/token/${alert.newMint}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs font-mono text-muted-foreground inline-flex items-center gap-1 hover:underline"
            >
              {shortMint(alert.newMint)} <ExternalLink className="w-3 h-3" />
            </a>
            <div className="mt-2 text-sm">
              Mimics token you hold:{" "}
              <span className="font-semibold">{alert.matchedSymbol ?? "?"}</span>{" "}
              <span className="text-muted-foreground">({alert.matchedName ?? ""})</span>{" "}
              <a
                href={`https://solscan.io/token/${alert.matchedMint}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs font-mono text-muted-foreground inline-flex items-center gap-1 hover:underline ml-1"
              >
                {shortMint(alert.matchedMint)} <ExternalLink className="w-3 h-3" />
              </a>
            </div>
            <ul className="mt-2 text-xs text-muted-foreground list-disc ml-5 space-y-0.5">
              {alert.signals.map((s, i) => (
                <li key={i}>
                  <span className="font-medium uppercase tracking-wide mr-1">{s.type.replace("_", " ")}</span>
                  · {s.detail} · conf {s.confidence.toFixed(2)}
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div className="text-xs text-muted-foreground whitespace-nowrap">
          {new Date(alert.createdAt).toLocaleString()}
        </div>
      </div>
    </div>
  );
}
