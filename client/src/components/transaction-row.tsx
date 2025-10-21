import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp, ExternalLink, Copy, Check } from "lucide-react";
import { ThreatBadge } from "./threat-badge";
import { Transaction, ThreatLevel } from "@shared/schema";
import { formatDistanceToNow } from "date-fns";
import { truncateAddress } from "@/lib/solana-mock";

interface TransactionRowProps {
  transaction: Transaction;
  onViewDeep3?: () => void;
}

export function TransactionRow({ transaction, onViewDeep3 }: TransactionRowProps) {
  const [expanded, setExpanded] = useState(false);
  const [copied, setCopied] = useState(false);
  
  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  
  const getThreatColor = (level: string) => {
    switch (level) {
      case ThreatLevel.SAFE: return "border-l-success";
      case ThreatLevel.SUSPICIOUS: return "border-l-warning";
      case ThreatLevel.DANGER:
      case ThreatLevel.BLOCKED: return "border-l-danger";
      default: return "border-l-muted";
    }
  };
  
  return (
    <Card 
      className="hover-elevate transition-all"
      data-testid={`transaction-${transaction.id}`}
    >
      <div className="p-4">
        <div className="flex items-center gap-2 mb-3">
          <ThreatBadge level={transaction.finalThreatLevel as ThreatLevel} size="sm" />
        </div>
        
        <div className="flex items-center justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 mb-2">
              <h4 className="font-semibold truncate" data-testid="text-token-name">
                {transaction.tokenName || "Unknown Token"}
              </h4>
              {transaction.tokenSymbol && (
                <span className="text-sm text-muted-foreground">
                  {transaction.tokenSymbol}
                </span>
              )}
            </div>
            
            <div className="flex items-center gap-2 text-sm text-muted-foreground font-mono">
              <span className="truncate">{truncateAddress(transaction.tokenAddress, 6)}</span>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={() => handleCopy(transaction.tokenAddress)}
                data-testid="button-copy-address"
              >
                {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
              </Button>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="text-right">
              <div className="text-sm font-medium">{transaction.amount || "N/A"}</div>
              <div className="text-xs text-muted-foreground">
                {formatDistanceToNow(new Date(transaction.timestamp), { addSuffix: true })}
              </div>
            </div>
            
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setExpanded(!expanded)}
              data-testid="button-expand-transaction"
            >
              {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </Button>
          </div>
        </div>
        
        {expanded && (
          <div className="mt-4 pt-4 border-t space-y-3">
            <div>
              <h5 className="text-xs font-semibold text-muted-foreground mb-2">Local Classification</h5>
              <p className="text-sm">{transaction.localReason || "No issues detected"}</p>
            </div>
            
            {transaction.deep3Classification && (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h5 className="text-xs font-semibold text-muted-foreground">Deep3 Labs AI Analysis</h5>
                  {onViewDeep3 && (
                    <Button
                      variant="link"
                      size="sm"
                      className="h-auto p-0 text-xs"
                      onClick={onViewDeep3}
                      data-testid="button-view-deep3"
                    >
                      View Details
                      <ExternalLink className="w-3 h-3 ml-1" />
                    </Button>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-sm">
                    Risk Score: <span className="font-semibold">{transaction.deep3ThreatScore}/100</span>
                  </div>
                  <div className="text-sm text-muted-foreground">{transaction.deep3Reason}</div>
                </div>
              </div>
            )}
            
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                className="text-xs"
                asChild
                data-testid="button-view-solscan"
              >
                <a 
                  href={`https://solscan.io/tx/${transaction.signature}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <ExternalLink className="w-3 h-3 mr-1" />
                  View on Solscan
                </a>
              </Button>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}
