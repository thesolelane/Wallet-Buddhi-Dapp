import { Card, CardContent } from "@/components/ui/card";
import { TierCard } from "@/components/tier-card";
import { UserTier } from "@shared/schema";
import { Shield, Sparkles, Zap, Wallet } from "lucide-react";

interface TiersPageProps {
  currentTier: UserTier;
  onUpgrade: (tier: UserTier) => void;
}

export function TiersPage({ currentTier, onUpgrade }: TiersPageProps) {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="inline-flex items-center justify-center p-4 bg-primary/10 rounded-full">
          <Shield className="w-12 h-12 text-primary" />
        </div>
        <div>
          <h1 className="text-4xl font-bold mb-2">Choose Your Protection Level</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Upgrade your wallet security with advanced AI threat detection and automated arbitrage trading
          </p>
        </div>
      </div>
      
      {/* Tier Comparison */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
        <TierCard
          tier={UserTier.BASIC}
          currentTier={currentTier}
        />
        <TierCard
          tier={UserTier.PRO}
          currentTier={currentTier}
          onUpgrade={() => onUpgrade(UserTier.PRO)}
        />
        <TierCard
          tier={UserTier.PRO_PLUS}
          currentTier={currentTier}
          onUpgrade={() => onUpgrade(UserTier.PRO_PLUS)}
        />
      </div>
      
      {/* FAQ / Features explanation */}
      <Card className="max-w-4xl mx-auto">
        <CardContent className="p-8 space-y-6">
          <h2 className="text-2xl font-bold">How Wallet Buddhi Protects You</h2>
          
          <div className="space-y-4">
            <div className="flex gap-3">
              <Shield className="w-5 h-5 text-primary shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold mb-2">Local Spam Classifier</h3>
                <p className="text-sm text-muted-foreground">
                  Our CA-first (Contract Analysis) rules examine every incoming token for common spam patterns, 
                  malicious contracts, and known scam signatures. Available on all tiers.
                </p>
              </div>
            </div>
            
            <div className="flex gap-3">
              <Sparkles className="w-5 h-5 text-primary shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold mb-2">Deep3 Labs AI Integration (Pro)</h3>
                <p className="text-sm text-muted-foreground">
                  Advanced AI-powered threat detection analyzes token metadata, holder patterns, liquidity depth, 
                  and social signals to identify sophisticated scams. The local classifier decision always takes 
                  precedence, but Deep3 can elevate threat levels.
                </p>
              </div>
            </div>
            
            <div className="flex gap-3">
              <Zap className="w-5 h-5 text-primary shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold mb-2">Arbitrage Bots (Pro+)</h3>
                <p className="text-sm text-muted-foreground">
                  Activate up to 2 automated arbitrage bots with dedicated cooperanth.sol wallet addresses. 
                  Bots scan DEX pairs for profitable opportunities while respecting Deep3 risk scores to avoid 
                  trading manipulated tokens.
                </p>
              </div>
            </div>
            
            <div className="flex gap-3">
              <Wallet className="w-5 h-5 text-primary shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold mb-2">Wallet Naming System</h3>
                <p className="text-sm text-muted-foreground">
                  All Pro and Pro+ wallets get a unique wbuddi.cooperanth.sol subdomain for easy identification 
                  and sharing.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
