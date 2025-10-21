import { useState, useEffect } from "react";
import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Header } from "@/components/layout/header";
import { Navigation } from "@/components/layout/navigation";
import { WalletConnectModal } from "@/components/wallet-connect-modal";
import { HomePage } from "@/pages/home";
import { Dashboard } from "@/pages/dashboard";
import { TiersPage } from "@/pages/tiers";
import NotFound from "@/pages/not-found";
import { UserTier } from "@shared/schema";
import { type WalletInfo } from "@/lib/solana-mock";

function Router({ wallet, tier, onUpgrade, onShowConnect }: { wallet: WalletInfo | null; tier: UserTier; onUpgrade: (tier: UserTier) => void; onShowConnect: () => void }) {
  return (
    <Switch>
      <Route path="/">
        {wallet ? <Dashboard walletAddress={wallet.address} tier={tier} /> : <HomePage onConnect={onShowConnect} />}
      </Route>
      <Route path="/tiers">
        <TiersPage currentTier={tier} onUpgrade={onUpgrade} />
      </Route>
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  const [wallet, setWallet] = useState<WalletInfo | null>(null);
  const [tier, setTier] = useState<UserTier>(UserTier.BASIC);
  const [showConnectModal, setShowConnectModal] = useState(false);
  const [solanaName, setSolanaName] = useState<string>();
  
  // Load wallet from localStorage on mount
  useEffect(() => {
    const savedWallet = localStorage.getItem("wallet_connected");
    const savedTier = localStorage.getItem("wallet_tier") as UserTier;
    const savedName = localStorage.getItem("solana_name");
    
    if (savedWallet) {
      setWallet(JSON.parse(savedWallet));
      if (savedTier) setTier(savedTier);
      if (savedName) setSolanaName(savedName);
    }
  }, []);
  
  const handleConnect = (walletInfo: WalletInfo) => {
    setWallet(walletInfo);
    localStorage.setItem("wallet_connected", JSON.stringify(walletInfo));
    
    // Generate solana name for Pro/Pro+ tiers
    const name = `${walletInfo.address.slice(0, 8)}.wbuddi.cooperanth.sol`;
    setSolanaName(name);
    localStorage.setItem("solana_name", name);
  };
  
  const handleDisconnect = () => {
    setWallet(null);
    setTier(UserTier.BASIC);
    setSolanaName(undefined);
    localStorage.removeItem("wallet_connected");
    localStorage.removeItem("wallet_tier");
    localStorage.removeItem("solana_name");
  };
  
  const handleUpgrade = (newTier: UserTier) => {
    setTier(newTier);
    localStorage.setItem("wallet_tier", newTier);
    
    // Update solana name for Pro+ tiers
    if (wallet && (newTier === UserTier.PRO || newTier === UserTier.PRO_PLUS)) {
      const name = `${wallet.address.slice(0, 8)}.wbuddi.cooperanth.sol`;
      setSolanaName(name);
      localStorage.setItem("solana_name", name);
    }
  };
  
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <div className="min-h-screen bg-background">
          <Header
            walletAddress={wallet?.address}
            solanaName={solanaName}
            tier={tier}
            onDisconnect={handleDisconnect}
            onConnect={() => setShowConnectModal(true)}
          />
          
          {wallet && <Navigation />}
          
          <main className="container mx-auto px-4 lg:px-8 py-8">
            <Router wallet={wallet} tier={tier} onUpgrade={handleUpgrade} onShowConnect={() => setShowConnectModal(true)} />
          </main>
          
          <WalletConnectModal
            open={showConnectModal}
            onOpenChange={setShowConnectModal}
            onConnect={handleConnect}
          />
        </div>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
