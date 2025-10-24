import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { LogOut, Settings, Menu } from "lucide-react";
import { UserTier } from "@shared/schema";
import { truncateAddress } from "@/lib/solana-mock";
import mascotUrl from "@assets/ChatGPT Image Oct 20, 2025, 01_13_52 PM (1)_1761084669346.png";

interface HeaderProps {
  walletAddress?: string;
  solanaName?: string;
  tier: UserTier;
  onDisconnect: () => void;
  onConnect: () => void;
}

const TIER_COLORS = {
  [UserTier.BASIC]: "bg-muted text-muted-foreground",
  [UserTier.PRO]: "bg-primary text-primary-foreground",
  [UserTier.PRO_PLUS]: "bg-gradient-to-r from-primary to-solana-purple text-white",
};

export function Header({ walletAddress, solanaName, tier, onDisconnect, onConnect }: HeaderProps) {
  return (
    <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <img 
            src={mascotUrl} 
            alt="Wallet Buddhi" 
            className="w-10 h-10 object-contain"
            data-testid="img-header-logo"
          />
          <div>
            <h1 className="text-xl font-bold">Wallet Buddhi</h1>
            <p className="text-xs text-muted-foreground hidden sm:block">Solana Protection</p>
          </div>
        </div>
        
        {/* Wallet Info */}
        <div className="flex items-center gap-3">
          {walletAddress ? (
            <>
              <div className="hidden md:block text-right">
                {solanaName && (
                  <div className="text-sm font-medium">{solanaName}</div>
                )}
                <div className="text-xs text-muted-foreground font-mono">
                  {truncateAddress(walletAddress, 6)}
                </div>
              </div>
              
              <Badge 
                className={`${TIER_COLORS[tier]} font-semibold`}
                data-testid="badge-tier"
              >
                {tier === UserTier.BASIC ? "Basic" : tier === UserTier.PRO ? "Pro" : "Pro+"}
              </Badge>
              
              <Button
                variant="outline"
                size="icon"
                onClick={onDisconnect}
                data-testid="button-disconnect"
                title="Disconnect Wallet"
              >
                <LogOut className="w-4 h-4" />
              </Button>
            </>
          ) : (
            <Button onClick={onConnect} data-testid="button-connect-wallet">
              Connect Wallet
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
