import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check, Lock, Sparkles, Zap, Shield } from "lucide-react";
import { UserTier, TIER_FEATURES } from "@shared/schema";

interface TierCardProps {
  tier: UserTier;
  currentTier: UserTier;
  onUpgrade?: () => void;
}

const TIER_CONFIG = {
  [UserTier.BASIC]: {
    name: "Basic",
    price: "Free",
    description: "Essential protection for your wallet",
    Icon: Shield,
    gradient: "from-muted/50 to-muted/30",
  },
  [UserTier.PRO]: {
    name: "Pro",
    price: "$9.99/mo",
    description: "AI-powered threat detection",
    Icon: Sparkles,
    gradient: "from-primary/20 to-solana-purple/20",
  },
  [UserTier.PRO_PLUS]: {
    name: "Pro+",
    price: "$29.99/mo",
    description: "Full protection with arbitrage bots",
    Icon: Zap,
    gradient: "from-solana-purple/20 to-primary/30",
  },
};

export function TierCard({ tier, currentTier, onUpgrade }: TierCardProps) {
  const config = TIER_CONFIG[tier];
  const features = TIER_FEATURES[tier];
  const isCurrentTier = tier === currentTier;
  const isLowerTier = getTierLevel(tier) < getTierLevel(currentTier);
  
  const featureList = [
    { label: "Local spam classifier", enabled: features.localClassifier },
    { label: "Real-time monitoring", enabled: features.realtimeMonitoring },
    { label: "Deep3 Labs AI analysis", enabled: features.deep3Integration },
    { label: "Custom security rules", enabled: features.customRules },
    { label: `${features.maxBotsAllowed} arbitrage bots`, enabled: features.arbitrageBots },
    { label: "Historical data access", enabled: features.historicalData },
  ];
  
  return (
    <Card 
      className={`relative overflow-hidden ${isCurrentTier ? 'ring-2 ring-primary' : ''}`}
      data-testid={`card-tier-${tier}`}
    >
      {isCurrentTier && (
        <div className="absolute top-0 right-0 px-3 py-1 bg-primary text-primary-foreground text-xs font-medium rounded-bl-md">
          Current Plan
        </div>
      )}
      
      <CardHeader className={`bg-gradient-to-br ${config.gradient} pb-6`}>
        <div className="flex items-center justify-between gap-4">
          <div>
            <CardTitle className="text-2xl font-bold flex items-center gap-2">
              <config.Icon className="w-7 h-7" />
              {config.name}
            </CardTitle>
            <CardDescription className="mt-1">{config.description}</CardDescription>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold">{config.price}</div>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="pt-6 space-y-3">
        {featureList.map((feature, index) => (
          <div 
            key={index} 
            className="flex items-center gap-3"
            data-testid={`feature-${tier}-${index}`}
          >
            {feature.enabled ? (
              <Check className="w-5 h-5 text-success shrink-0" />
            ) : (
              <Lock className="w-5 h-5 text-muted-foreground shrink-0" />
            )}
            <span className={feature.enabled ? "text-foreground" : "text-muted-foreground"}>
              {feature.label}
            </span>
          </div>
        ))}
      </CardContent>
      
      <CardFooter>
        {isCurrentTier ? (
          <Button className="w-full" disabled>
            <Check className="w-4 h-4 mr-2" />
            Current Plan
          </Button>
        ) : isLowerTier ? (
          <Button className="w-full" variant="outline" disabled>
            Lower Tier
          </Button>
        ) : (
          <Button 
            className="w-full" 
            onClick={onUpgrade}
            data-testid={`button-upgrade-${tier}`}
          >
            {tier === UserTier.PRO ? (
              <>
                <Sparkles className="w-4 h-4 mr-2" />
                Upgrade to Pro
              </>
            ) : (
              <>
                <Zap className="w-4 h-4 mr-2" />
                Upgrade to Pro+
              </>
            )}
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}

function getTierLevel(tier: UserTier): number {
  return { [UserTier.BASIC]: 0, [UserTier.PRO]: 1, [UserTier.PRO_PLUS]: 2 }[tier];
}
