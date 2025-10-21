import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Download, AlertCircle, CheckCircle2, Sparkles } from "lucide-react";
import { type BotTemplate } from "@shared/schema";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { exampleBotTemplates, templateDescriptions } from "@/data/bot-templates";

interface ImportBotDialogProps {
  walletId: string;
  disabled?: boolean;
}

export function ImportBotDialog({ walletId, disabled }: ImportBotDialogProps) {
  const [open, setOpen] = useState(false);
  const [jsonInput, setJsonInput] = useState("");
  const [parsedTemplate, setParsedTemplate] = useState<BotTemplate | null>(null);
  const [parseError, setParseError] = useState<string | null>(null);
  const { toast } = useToast();

  const importMutation = useMutation({
    mutationFn: async (template: BotTemplate) => {
      const res = await apiRequest("POST", "/api/arbitrage-bots/import", { template, walletId });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/arbitrage-bots", walletId] });
      toast({
        title: "Bot imported successfully",
        description: "Your new arbitrage bot has been created and is ready to configure.",
      });
      setOpen(false);
      setJsonInput("");
      setParsedTemplate(null);
    },
    onError: (error: any) => {
      toast({
        title: "Import failed",
        description: error.message || "Failed to import bot template",
        variant: "destructive",
      });
    },
  });

  const handleJsonChange = (value: string) => {
    setJsonInput(value);
    setParseError(null);
    setParsedTemplate(null);

    if (!value.trim()) return;

    try {
      const parsed = JSON.parse(value);
      setParsedTemplate(parsed as BotTemplate);
    } catch (e) {
      setParseError("Invalid JSON format");
    }
  };

  const handleImport = () => {
    if (parsedTemplate) {
      importMutation.mutate(parsedTemplate);
    }
  };

  const handleClose = () => {
    setOpen(false);
    setJsonInput("");
    setParsedTemplate(null);
    setParseError(null);
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => isOpen ? setOpen(true) : handleClose()}>
      <DialogTrigger asChild>
        <Button 
          variant="outline" 
          size="sm"
          disabled={disabled}
          data-testid="button-import-bot"
        >
          <Download className="w-4 h-4 mr-2" />
          Import Bot Template
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Import Bot Template</DialogTitle>
          <DialogDescription>
            Paste a validated bot configuration JSON from the official Wallet Buddhi marketplace.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Example Templates */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-solana-purple" />
              <label className="text-sm font-medium">Example Templates</label>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {Object.entries(exampleBotTemplates).map(([key, template]) => (
                <Button
                  key={key}
                  variant="outline"
                  size="sm"
                  onClick={() => handleJsonChange(JSON.stringify(template, null, 2))}
                  className="text-xs h-auto py-3 flex flex-col items-start gap-1"
                  data-testid={`button-template-${key}`}
                >
                  <span className="font-semibold">{template.name}</span>
                  <span className="text-muted-foreground font-normal text-wrap text-left">
                    {templateDescriptions[key]}
                  </span>
                </Button>
              ))}
            </div>
          </div>

          {/* JSON Input */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Bot Template JSON</label>
            <Textarea
              value={jsonInput}
              onChange={(e) => handleJsonChange(e.target.value)}
              placeholder='Paste your bot template JSON here or click an example template above...'
              className="font-mono text-xs min-h-[200px]"
              data-testid="textarea-bot-json"
            />
          </div>

          {/* Parse Error */}
          {parseError && (
            <Alert variant="destructive" data-testid="alert-parse-error">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{parseError}</AlertDescription>
            </Alert>
          )}

          {/* Template Preview */}
          {parsedTemplate && !parseError && (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-success" />
                <span className="text-sm font-medium">Template Preview</span>
              </div>
              
              <div className="bg-muted rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-semibold">{parsedTemplate.name}</div>
                    <Badge variant="outline" className="mt-1">
                      {parsedTemplate.strategy.replace(/_/g, " ").toUpperCase()}
                    </Badge>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 text-sm pt-2 border-t">
                  <div>
                    <span className="text-muted-foreground">Min Profit:</span>
                    <span className="ml-2 font-medium">{(parsedTemplate.minProfitThreshold * 100).toFixed(1)}%</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Max Risk Score:</span>
                    <span className="ml-2 font-medium">{parsedTemplate.maxRiskScore}/100</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Max Trade Size:</span>
                    <span className="ml-2 font-medium">{parsedTemplate.maxTradeSize} SOL</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Slippage:</span>
                    <span className="ml-2 font-medium">{parsedTemplate.slippageTolerance}%</span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-muted-foreground">DEX Allowlist:</span>
                    <div className="flex gap-1 mt-1 flex-wrap">
                      {parsedTemplate.dexAllowlist.map((dex) => (
                        <Badge key={dex} variant="secondary" className="text-xs">
                          {dex}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div className="col-span-2">
                    <span className="text-muted-foreground">Target Pairs:</span>
                    <div className="flex gap-1 mt-1 flex-wrap">
                      {parsedTemplate.targetPairs.map((pair) => (
                        <Badge key={pair} variant="secondary" className="text-xs">
                          {pair}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  {parsedTemplate.autoPause && (
                    <div className="col-span-2">
                      <span className="text-muted-foreground">Auto-Pause:</span>
                      <div className="text-xs mt-1 space-y-1">
                        <div>Max Daily Loss: {parsedTemplate.autoPause.maxDailyLoss} SOL</div>
                        <div>Volatility Threshold: {parsedTemplate.autoPause.volatilityThreshold}%</div>
                        <div>Max Consecutive Losses: {parsedTemplate.autoPause.maxConsecutiveLosses}</div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <Alert data-testid="alert-import-ready">
                <AlertDescription className="text-sm">
                  Bot will be created with the <strong>inactive</strong> status for safety. 
                  Activate it after reviewing the configuration.
                </AlertDescription>
              </Alert>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button 
            variant="outline" 
            onClick={handleClose}
            disabled={importMutation.isPending}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleImport}
            disabled={!parsedTemplate || !!parseError || importMutation.isPending}
            data-testid="button-confirm-import"
          >
            {importMutation.isPending ? "Importing..." : "Import Bot"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
