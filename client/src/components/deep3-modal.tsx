import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { AlertTriangle, Shield, TrendingUp, Users, Droplets } from "lucide-react";
import { type Deep3AnalysisResponse } from "@shared/schema";

interface Deep3ModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  analysis: Deep3AnalysisResponse | null;
}

export function Deep3Modal({ open, onOpenChange, analysis }: Deep3ModalProps) {
  if (!analysis) return null;
  
  const getRiskColor = (score: number) => {
    if (score >= 70) return "text-danger";
    if (score >= 40) return "text-warning";
    return "text-success";
  };
  
  const getProgressColor = (score: number) => {
    if (score >= 70) return "bg-danger";
    if (score >= 40) return "bg-warning";
    return "bg-success";
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto" data-testid="modal-deep3">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Shield className="w-6 h-6 text-primary" />
            </div>
            <div>
              <DialogTitle className="text-2xl">Deep3 Labs AI Analysis</DialogTitle>
              <DialogDescription className="font-mono text-xs mt-1">
                {analysis.tokenAddress.slice(0, 12)}...{analysis.tokenAddress.slice(-12)}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>
        
        <div className="space-y-6 mt-4">
          {/* Risk Score */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-lg">Overall Risk Score</h3>
              <span className={`text-4xl font-bold ${getRiskColor(analysis.riskScore)}`}>
                {analysis.riskScore}
                <span className="text-base text-muted-foreground">/100</span>
              </span>
            </div>
            
            <Progress 
              value={analysis.riskScore} 
              className={`h-3 ${getProgressColor(analysis.riskScore)}`}
            />
            
            <div className="flex items-center justify-between mt-3">
              <Badge variant="outline" className={analysis.classification === "safe" ? "border-success text-success" : analysis.classification === "suspicious" ? "border-warning text-warning" : "border-danger text-danger"}>
                {analysis.classification.toUpperCase()}
              </Badge>
              <span className="text-sm text-muted-foreground">
                Confidence: {analysis.confidence}%
              </span>
            </div>
          </Card>
          
          {/* Tabs for detailed info */}
          <Tabs defaultValue="metadata" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="metadata">Token Metadata</TabsTrigger>
              <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
            </TabsList>
            
            <TabsContent value="metadata" className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-4">
                <MetricCard
                  icon={<TrendingUp className="w-5 h-5" />}
                  label="Contract Age"
                  value={`${analysis.metadata.contractAge} days`}
                  data-testid="metric-contract-age"
                />
                <MetricCard
                  icon={<Users className="w-5 h-5" />}
                  label="Holder Count"
                  value={analysis.metadata.holderCount.toLocaleString()}
                  data-testid="metric-holders"
                />
                <MetricCard
                  icon={<Droplets className="w-5 h-5" />}
                  label="Liquidity"
                  value={`$${(analysis.metadata.liquidityUSD / 1000).toFixed(1)}K`}
                  data-testid="metric-liquidity"
                />
                <MetricCard
                  icon={<Shield className="w-5 h-5" />}
                  label="Social Score"
                  value={`${analysis.metadata.socialScore}/100`}
                  data-testid="metric-social"
                />
              </div>
              
              <Card className="p-4 space-y-3">
                <h4 className="font-semibold text-sm">Security Flags</h4>
                <div className="space-y-2">
                  <FlagItem 
                    label="Honeypot Detection" 
                    value={analysis.metadata.isHoneypot}
                    danger
                  />
                  <FlagItem 
                    label="Mintable Token" 
                    value={analysis.metadata.isMintable}
                    warning
                  />
                  <FlagItem 
                    label="Has Blacklist Function" 
                    value={analysis.metadata.hasBlacklist}
                    warning
                  />
                  <FlagItem 
                    label="Rug Pull Risk" 
                    value={analysis.metadata.rugPullRisk > 50}
                    danger
                    extra={`${analysis.metadata.rugPullRisk}%`}
                  />
                </div>
              </Card>
            </TabsContent>
            
            <TabsContent value="recommendations" className="space-y-3 mt-4">
              {analysis.recommendations.map((rec, index) => (
                <Card key={index} className="p-4">
                  <div className="flex gap-3">
                    <AlertTriangle className="w-5 h-5 text-warning shrink-0 mt-0.5" />
                    <p className="text-sm">{rec}</p>
                  </div>
                </Card>
              ))}
            </TabsContent>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function MetricCard({ icon, label, value, ...props }: { icon: React.ReactNode; label: string; value: string; [key: string]: any }) {
  return (
    <Card className="p-4" {...props}>
      <div className="flex items-center gap-3 mb-2 text-muted-foreground">
        {icon}
        <span className="text-xs font-medium">{label}</span>
      </div>
      <div className="text-2xl font-bold">{value}</div>
    </Card>
  );
}

function FlagItem({ label, value, danger, warning, extra }: { label: string; value: boolean; danger?: boolean; warning?: boolean; extra?: string }) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-muted-foreground">{label}</span>
      <div className="flex items-center gap-2">
        {extra && <span className="text-muted-foreground text-xs">{extra}</span>}
        <Badge 
          variant="outline" 
          className={value ? (danger ? "border-danger text-danger" : warning ? "border-warning text-warning" : "") : "border-success text-success"}
        >
          {value ? "Yes" : "No"}
        </Badge>
      </div>
    </div>
  );
}
