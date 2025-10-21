import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Zap, TrendingUp, Activity, Wallet } from "lucide-react";
import { type ArbitrageBot, type BotStats } from "@shared/schema";

interface ArbitrageBotPanelProps {
  bot: ArbitrageBot;
  stats: BotStats;
  onToggle: (active: boolean) => void;
  onUpdate: (updates: Partial<ArbitrageBot>) => void;
}

export function ArbitrageBotPanel({ bot, stats, onToggle, onUpdate }: ArbitrageBotPanelProps) {
  const [editing, setEditing] = useState(false);
  const [config, setConfig] = useState({
    minProfitThreshold: bot.minProfitThreshold,
    maxTradeSize: bot.maxTradeSize,
    strategy: bot.strategy,
  });
  
  const handleSave = () => {
    onUpdate(config);
    setEditing(false);
  };
  
  return (
    <Card className="border-2 border-solana-purple/30" data-testid={`bot-panel-${bot.id}`}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-solana-purple/20 rounded-lg">
              <Zap className="w-5 h-5 text-solana-purple" />
            </div>
            <div>
              <CardTitle className="text-lg">{bot.botName}</CardTitle>
              <CardDescription className="font-mono text-xs mt-1">
                {bot.walletAddress}
              </CardDescription>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <Badge variant={bot.active ? "default" : "outline"} className={bot.active ? "bg-success" : ""}>
              {bot.active ? "Active" : "Inactive"}
            </Badge>
            <Switch
              checked={bot.active}
              onCheckedChange={onToggle}
              data-testid="switch-bot-active"
            />
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-4 gap-4">
          <StatCard
            icon={<Activity className="w-4 h-4" />}
            label="Total Trades"
            value={stats.totalTrades.toString()}
            data-testid="stat-total-trades"
          />
          <StatCard
            icon={<TrendingUp className="w-4 h-4" />}
            label="Win Rate"
            value={`${stats.totalTrades > 0 ? ((stats.profitableTrades / stats.totalTrades) * 100).toFixed(1) : 0}%`}
            data-testid="stat-win-rate"
          />
          <StatCard
            icon={<Wallet className="w-4 h-4" />}
            label="Total Profit"
            value={`${stats.totalProfit} SOL`}
            valueClassName="text-success"
            data-testid="stat-profit"
          />
          <StatCard
            icon={<Zap className="w-4 h-4" />}
            label="Uptime"
            value={`${stats.uptime}%`}
            data-testid="stat-uptime"
          />
        </div>
        
        {/* Configuration */}
        <div className="space-y-4 pt-4 border-t">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-semibold">Bot Configuration</h4>
            {editing ? (
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={() => setEditing(false)}>
                  Cancel
                </Button>
                <Button size="sm" onClick={handleSave} data-testid="button-save-config">
                  Save
                </Button>
              </div>
            ) : (
              <Button size="sm" variant="outline" onClick={() => setEditing(true)} data-testid="button-edit-config">
                Edit
              </Button>
            )}
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="strategy" className="text-xs">Strategy</Label>
              <Select
                value={config.strategy}
                onValueChange={(value) => setConfig({ ...config, strategy: value })}
                disabled={!editing}
              >
                <SelectTrigger id="strategy" data-testid="select-strategy">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="dex_arbitrage">DEX Arbitrage</SelectItem>
                  <SelectItem value="liquidity_provision">Liquidity Provision</SelectItem>
                  <SelectItem value="market_making">Market Making</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="minProfit" className="text-xs">Min Profit (%)</Label>
              <Input
                id="minProfit"
                type="number"
                step="0.1"
                value={config.minProfitThreshold}
                onChange={(e) => setConfig({ ...config, minProfitThreshold: e.target.value })}
                disabled={!editing}
                data-testid="input-min-profit"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="maxTrade" className="text-xs">Max Trade Size (SOL)</Label>
              <Input
                id="maxTrade"
                type="number"
                step="1"
                value={config.maxTradeSize}
                onChange={(e) => setConfig({ ...config, maxTradeSize: e.target.value })}
                disabled={!editing}
                data-testid="input-max-trade"
              />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function StatCard({ icon, label, value, valueClassName, ...props }: { icon: React.ReactNode; label: string; value: string; valueClassName?: string; [key: string]: any }) {
  return (
    <div className="space-y-1" {...props}>
      <div className="flex items-center gap-2 text-muted-foreground">
        {icon}
        <span className="text-xs">{label}</span>
      </div>
      <div className={`text-xl font-bold ${valueClassName || ""}`}>{value}</div>
    </div>
  );
}
