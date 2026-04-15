import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Shield, Eye, Bell, CheckCircle } from "lucide-react";
import { Link } from "wouter";
import mascotUrl from "@assets/ChatGPT Image Oct 20, 2025, 01_13_52 PM (1)_1761084669346.png";

export function HomePage() {
  return (
    <div>
      <section className="relative overflow-hidden rounded-xl bg-gradient-to-br from-primary/10 via-solana-purple/10 to-background py-16 lg:py-24 px-6 lg:px-12">
        <div className="grid lg:grid-cols-2 gap-10 items-center">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-primary/10 rounded-full text-sm font-medium">
              <Shield className="w-4 h-4" /> Read-only companion for Phantom & Solana
            </div>
            <h1 className="text-4xl lg:text-5xl font-bold leading-tight">
              Catch copycat tokens
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-solana-purple">
                before they catch you.
              </span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-xl">
              Paste the public key of any Solana wallet you own. Wallet Buddhi watches it
              read-only, records every token you buy — contract, ticker, market cap, Telegram,
              Twitter, Discord, website, creator — and alerts you when a new token shows up
              that impersonates one you already hold.
            </p>
            <div className="flex flex-wrap gap-4">
              <Button size="lg" asChild>
                <Link href="/dashboard">
                  <Eye className="w-5 h-5 mr-2" /> Open Dashboard
                </Link>
              </Button>
            </div>
            <div className="grid sm:grid-cols-3 gap-3 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-success" /> No wallet connect needed
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-success" /> Watches pubkeys read-only
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-success" /> Alerts on ticker copycats
              </div>
            </div>
          </div>
          <div className="flex justify-center lg:justify-end">
            <img src={mascotUrl} alt="Wallet Buddhi" className="w-full max-w-sm" />
          </div>
        </div>
      </section>

      <section className="py-14">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold mb-3">How it works</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Three steps. No signatures, no approvals, no key custody.
          </p>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          <Step
            icon={<Eye className="w-6 h-6" />}
            title="Paste a pubkey"
            body="Add the public address of any wallet you want to watch. The app never touches your wallet."
          />
          <Step
            icon={<Shield className="w-6 h-6" />}
            title="Registry builds itself"
            body="Every new SPL token that lands in the watched wallet gets recorded with full metadata pulled from DexScreener, Jupiter, and on-chain Metaplex."
          />
          <Step
            icon={<Bell className="w-6 h-6" />}
            title="Copycat alerts"
            body="When a new token shares a ticker, near-identical name, matching socials, or the same creator, you get an alert with the signals that fired."
          />
        </div>
      </section>
    </div>
  );
}

function Step({ icon, title, body }: { icon: React.ReactNode; title: string; body: string }) {
  return (
    <Card>
      <CardContent className="p-6 space-y-3">
        <div className="p-2.5 bg-primary/10 rounded-lg w-fit text-primary">{icon}</div>
        <h3 className="text-lg font-semibold">{title}</h3>
        <p className="text-sm text-muted-foreground">{body}</p>
      </CardContent>
    </Card>
  );
}
