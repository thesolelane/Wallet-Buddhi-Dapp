import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Play, Loader2 } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { generateMockTransaction } from "@/lib/mock-data";
import { useToast } from "@/hooks/use-toast";

interface DemoControlsProps {
  walletAddress: string;
}

export function DemoControls({ walletAddress }: DemoControlsProps) {
  const [simulating, setSimulating] = useState(false);
  const { toast } = useToast();
  
  const handleSimulate = async () => {
    setSimulating(true);
    try {
      const mockData = await generateMockTransaction(walletAddress);
      await apiRequest("POST", "/api/transactions/simulate", mockData);
      
      toast({
        title: "Transaction Simulated",
        description: `Analyzed incoming ${mockData.tokenName} (${mockData.tokenSymbol})`,
      });
    } catch (error) {
      toast({
        title: "Simulation Failed",
        description: "Could not simulate transaction",
        variant: "destructive",
      });
    } finally {
      setSimulating(false);
    }
  };
  
  return (
    <Card className="border-dashed">
      <CardHeader>
        <CardTitle className="text-base">Demo Controls</CardTitle>
        <CardDescription className="text-xs">
          Simulate incoming token transactions to see threat detection in action
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Button
          onClick={handleSimulate}
          disabled={simulating}
          className="w-full"
          data-testid="button-simulate-transaction"
        >
          {simulating ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Simulating...
            </>
          ) : (
            <>
              <Play className="w-4 h-4 mr-2" />
              Simulate Transaction
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
