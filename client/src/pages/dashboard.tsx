import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ThreatBadge } from "@/components/threat-badge";
import { TransactionRow } from "@/components/transaction-row";
import { Deep3Modal } from "@/components/deep3-modal";
import { ArbitrageBotPanel } from "@/components/arbitrage-bot-panel";
import { ImportBotDialog } from "@/components/import-bot-dialog";
import { DemoControls } from "@/components/demo-controls";
import { Shield, Activity, AlertTriangle, CheckCircle, Zap, Wifi, WifiOff } from "lucide-react";
import { type Transaction, type Deep3AnalysisResponse, UserTier, ThreatLevel, type ArbitrageBot, type BotStats } from "@shared/schema";
import { useWebSocket } from "@/hooks/use-websocket";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface DashboardProps {
  walletAddress: string;
  tier: UserTier;
}

export function Dashboard({ walletAddress, tier }: DashboardProps) {
  const [selectedDeep3, setSelectedDeep3] = useState<Deep3AnalysisResponse | null>(null);
  const [creatingBot, setCreatingBot] = useState(false);
  const { connected } = useWebSocket(walletAddress);
  const { toast } = useToast();
  
  // Fetch transactions
  const { data: transactions = [], isLoading: loadingTransactions } = useQuery<Transaction[]>({
    queryKey: ["/api/transactions", walletAddress],
  });
  
  // Fetch wallet to get ID
  const { data: wallet } = useQuery<{ id: string; address: string; tier: string }>({
    queryKey: ["/api/wallets", walletAddress],
    queryFn: async () => {
      const res = await fetch(`/api/wallets/${walletAddress}`);
      if (!res.ok) throw new Error("Failed to fetch wallet");
      return res.json();
    },
  });
  
  // Fetch arbitrage bots (Pro+ only)
  const { data: bots = [], isLoading: loadingBots } = useQuery<ArbitrageBot[]>({
    queryKey: ["/api/arbitrage-bots", walletAddress],
    enabled: tier === UserTier.PRO_PLUS,
  });
  
  // Initialize wallet on mount
  useEffect(() => {
    apiRequest("POST", "/api/wallets", {
      address: walletAddress,
      tier,
    }).catch(console.error);
  }, [walletAddress, tier]);
  
  // Create arbitrage bot
  const handleCreateBot = async () => {
    if (!wallet?.id) {
      toast({
        title: "Error",
        description: "Wallet not found",
        variant: "destructive",
      });
      return;
    }
    
    if (bots.length >= 2) {
      toast({
        title: "Bot Limit Reached",
        description: "Maximum 2 bots allowed per wallet",
        variant: "destructive",
      });
      return;
    }
    
    setCreatingBot(true);
    try {
      const botAddress = `bot_${Math.random().toString(36).substr(2, 9)}.cooperanth.sol`;
      await apiRequest("POST", "/api/arbitrage-bots", {
        walletId: wallet.id,
        walletAddress: botAddress,
        minProfitThreshold: 0.01,
        maxRiskScore: 50,
        targetPairs: ["SOL/USDC", "SOL/USDT"],
      });
      
      // Invalidate bots query to refetch
      await queryClient.invalidateQueries({ queryKey: ["/api/arbitrage-bots", walletAddress] });
      
      toast({
        title: "Bot Created",
        description: "Arbitrage bot created successfully",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to create bot",
        variant: "destructive",
      });
    } finally {
      setCreatingBot(false);
    }
  };
  
  const stats = {
    totalScanned: transactions.length,
    blocked: transactions.filter(t => t.blocked).length,
    suspicious: transactions.filter(t => t.finalThreatLevel === ThreatLevel.SUSPICIOUS).length,
    safe: transactions.filter(t => t.finalThreatLevel === ThreatLevel.SAFE).length,
  };
  
  return (
    <div className="space-y-6">
      {/* Connection Status & Demo Controls */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-sm">
          {connected ? (
            <>
              <Wifi className="w-4 h-4 text-success" />
              <span className="text-success">Live Monitoring Active</span>
            </>
          ) : (
            <>
              <WifiOff className="w-4 h-4 text-muted-foreground" />
              <span className="text-muted-foreground">Connecting...</span>
            </>
          )}
        </div>
      </div>
      
      {/* Demo Controls */}
      <DemoControls walletAddress={walletAddress} />
      
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          icon={<Activity className="w-5 h-5" />}
          label="Total Scanned"
          value={stats.totalScanned}
          iconBg="bg-primary/10"
          iconColor="text-primary"
          data-testid="stat-total-scanned"
        />
        <StatsCard
          icon={<Shield className="w-5 h-5" />}
          label="Blocked"
          value={stats.blocked}
          iconBg="bg-danger/10"
          iconColor="text-danger"
          data-testid="stat-blocked"
        />
        <StatsCard
          icon={<AlertTriangle className="w-5 h-5" />}
          label="Suspicious"
          value={stats.suspicious}
          iconBg="bg-warning/10"
          iconColor="text-warning"
          data-testid="stat-suspicious"
        />
        <StatsCard
          icon={<CheckCircle className="w-5 h-5" />}
          label="Safe"
          value={stats.safe}
          iconBg="bg-success/10"
          iconColor="text-success"
          data-testid="stat-safe"
        />
      </div>
      
      {/* Main Content Tabs */}
      <Tabs defaultValue="transactions" className="space-y-4">
        <TabsList className="grid w-full grid-cols-2 lg:w-auto">
          <TabsTrigger value="transactions">Transactions</TabsTrigger>
          {tier === UserTier.PRO_PLUS && (
            <TabsTrigger value="bots" data-testid="tab-bots">
              <Zap className="w-4 h-4 mr-2" />
              Arbitrage Bots
            </TabsTrigger>
          )}
        </TabsList>
        
        <TabsContent value="transactions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Transactions</CardTitle>
              <CardDescription>
                Real-time monitoring of incoming tokens and transactions
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loadingTransactions ? (
                <div className="space-y-3">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="h-24 bg-muted animate-pulse rounded-lg" />
                  ))}
                </div>
              ) : transactions.length === 0 ? (
                <div className="text-center py-12">
                  <Shield className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No transactions yet</h3>
                  <p className="text-muted-foreground">
                    Your wallet is being monitored. Transactions will appear here as they occur.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {transactions.map((transaction) => (
                    <TransactionRow
                      key={transaction.id}
                      transaction={transaction}
                      onViewDeep3={
                        transaction.deep3Classification && tier !== UserTier.BASIC
                          ? () => setSelectedDeep3({
                              tokenAddress: transaction.tokenAddress,
                              riskScore: transaction.deep3ThreatScore || 0,
                              classification: transaction.deep3Classification as any,
                              confidence: 85,
                              metadata: transaction.deep3Metadata ? JSON.parse(transaction.deep3Metadata) : {},
                              recommendations: transaction.deep3Reason ? [transaction.deep3Reason] : [],
                            })
                          : undefined
                      }
                    />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        {tier === UserTier.PRO_PLUS && (
          <TabsContent value="bots" className="space-y-4">
            {loadingBots ? (
              <div className="space-y-4">
                {[...Array(2)].map((_, i) => (
                  <div key={i} className="h-64 bg-muted animate-pulse rounded-lg" />
                ))}
              </div>
            ) : bots.length === 0 ? (
              <Card>
                <CardContent className="text-center py-12">
                  <Zap className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No arbitrage bots configured</h3>
                  <p className="text-muted-foreground mb-4">
                    Create a custom bot or import a template from the marketplace
                  </p>
                  <div className="flex gap-3 justify-center">
                    <Button 
                      data-testid="button-add-bot" 
                      onClick={handleCreateBot}
                      disabled={creatingBot}
                    >
                      <Zap className="w-4 h-4 mr-2" />
                      {creatingBot ? "Creating..." : "Add Arbitrage Bot"}
                    </Button>
                    <ImportBotDialog walletId={wallet?.id || ""} disabled={!wallet?.id} />
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold">Active Bots ({bots.length}/2)</h3>
                  <div className="flex gap-2">
                    <Button 
                      size="sm"
                      onClick={handleCreateBot}
                      disabled={creatingBot || bots.length >= 2}
                      data-testid="button-add-bot-header"
                    >
                      <Zap className="w-4 h-4 mr-2" />
                      {creatingBot ? "Creating..." : "Add Bot"}
                    </Button>
                    <ImportBotDialog 
                      walletId={wallet?.id || ""} 
                      disabled={!wallet?.id || bots.length >= 2} 
                    />
                  </div>
                </div>
                {bots.map((bot) => (
                  <ArbitrageBotPanel
                    key={bot.id}
                    bot={bot}
                    stats={{
                      totalTrades: 142,
                      profitableTrades: 98,
                      totalProfit: "12.45",
                      avgProfitPerTrade: "0.087",
                      uptime: 98.7,
                    }}
                    onToggle={(active) => {
                      apiRequest("PATCH", `/api/arbitrage-bots/${bot.id}`, { active })
                        .catch(console.error);
                    }}
                    onUpdate={(updates) => {
                      apiRequest("PATCH", `/api/arbitrage-bots/${bot.id}`, updates)
                        .catch(console.error);
                    }}
                  />
                ))}
              </div>
            )}
          </TabsContent>
        )}
      </Tabs>
      
      {/* Deep3 Modal */}
      {tier !== UserTier.BASIC && (
        <Deep3Modal
          open={selectedDeep3 !== null}
          onOpenChange={(open) => !open && setSelectedDeep3(null)}
          analysis={selectedDeep3}
        />
      )}
    </div>
  );
}

function StatsCard({ icon, label, value, iconBg, iconColor, ...props }: {
  icon: React.ReactNode;
  label: string;
  value: number;
  iconBg: string;
  iconColor: string;
  [key: string]: any;
}) {
  return (
    <Card {...props}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground mb-1">{label}</p>
            <p className="text-3xl font-bold">{value}</p>
          </div>
          <div className={`p-3 rounded-lg ${iconBg}`}>
            <div className={iconColor}>{icon}</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
