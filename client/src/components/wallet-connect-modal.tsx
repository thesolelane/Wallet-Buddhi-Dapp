import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { SUPPORTED_WALLETS, connectWallet, type WalletInfo } from "@/lib/solana-mock";

interface WalletConnectModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConnect: (wallet: WalletInfo) => void;
}

export function WalletConnectModal({ open, onOpenChange, onConnect }: WalletConnectModalProps) {
  const [connecting, setConnecting] = useState<string | null>(null);

  const handleConnect = async (walletType: keyof typeof SUPPORTED_WALLETS) => {
    setConnecting(walletType);
    try {
      const wallet = await connectWallet(walletType);
      onConnect(wallet);
      onOpenChange(false);
    } catch (error) {
      console.error("Failed to connect wallet:", error);
    } finally {
      setConnecting(null);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md" data-testid="modal-wallet-connect">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">Connect Your Wallet</DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Choose your Solana wallet to start protecting your assets
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-3 mt-6">
          {Object.entries(SUPPORTED_WALLETS).map(([key, wallet]) => (
            <Button
              key={key}
              variant="outline"
              size="lg"
              className="justify-start h-auto py-4 px-6 hover-elevate"
              onClick={() => handleConnect(key as keyof typeof SUPPORTED_WALLETS)}
              disabled={connecting !== null}
              data-testid={`button-connect-${key}`}
            >
              {connecting === key ? (
                <>
                  <Loader2 className="w-6 h-6 mr-3 animate-spin" />
                  <span className="text-base font-medium">Connecting...</span>
                </>
              ) : (
                <>
                  <span className="text-2xl mr-3">{wallet.icon}</span>
                  <span className="text-base font-medium">{wallet.name}</span>
                </>
              )}
            </Button>
          ))}
        </div>
        
        <p className="text-xs text-center text-muted-foreground mt-4">
          By connecting, you agree to Wallet Buddhi's Terms of Service
        </p>
      </DialogContent>
    </Dialog>
  );
}
