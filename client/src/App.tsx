import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { HomePage } from "@/pages/home";
import { Dashboard } from "@/pages/dashboard";
import NotFound from "@/pages/not-found";
import { useWebSocket } from "@/hooks/use-websocket";

function AppRouter() {
  return (
    <Switch>
      <Route path="/" component={HomePage} />
      <Route path="/dashboard" component={Dashboard} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <InnerApp />
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

function InnerApp() {
  // Keeps a single WebSocket subscription at app root so purchase/alert events
  // invalidate query caches anywhere in the tree.
  useWebSocket();
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="container mx-auto px-4 lg:px-8 py-8 flex-1 w-full">
        <AppRouter />
      </main>
      <Footer />
    </div>
  );
}

export default App;
