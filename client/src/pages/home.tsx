import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Shield, Sparkles, Zap, CheckCircle } from "lucide-react";
import mascotUrl from "@assets/ChatGPT Image Oct 20, 2025, 01_13_52 PM_1761005062750.png";

interface HomePageProps {
  onConnect: () => void;
}

export function HomePage({ onConnect }: HomePageProps) {
  const handleConnect = () => {
    onConnect();
  };
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary/10 via-solana-purple/10 to-background py-20 lg:py-32">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full text-sm font-medium">
                <Shield className="w-4 h-4" />
                Trusted by Solana Community
              </div>
              
              <h1 className="text-5xl lg:text-6xl font-bold leading-tight">
                Protect Your
                <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-solana-purple">
                  Solana Wallet
                </span>
              </h1>
              
              <p className="text-xl text-muted-foreground max-w-xl">
                Advanced spam detection and AI-powered threat analysis for Phantom, Solflare, 
                and Backpack wallets. Block malicious tokens before they can harm you.
              </p>
              
              <div className="flex flex-wrap gap-4">
                <Button size="lg" onClick={handleConnect} data-testid="button-hero-connect">
                  <Shield className="w-5 h-5 mr-2" />
                  Connect Wallet
                </Button>
                <Button size="lg" variant="outline" asChild>
                  <a href="#features">Learn More</a>
                </Button>
              </div>
              
              <div className="flex flex-wrap gap-6 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-success" />
                  Free Basic Protection
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-success" />
                  No Transaction Fees
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-success" />
                  Real-time Monitoring
                </div>
              </div>
            </div>
            
            <div className="flex justify-center lg:justify-end">
              <img 
                src={mascotUrl} 
                alt="Wallet Buddhi Mascot" 
                className="w-full max-w-md animate-pulse"
              />
            </div>
          </div>
        </div>
      </section>
      
      {/* Features Section */}
      <section id="features" className="py-20">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Three Tiers of Protection</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              From basic spam filtering to advanced AI analysis and automated trading
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <FeatureCard
              icon={<Shield className="w-8 h-8" />}
              title="Basic"
              price="Free"
              description="Local spam classifier with CA-first rules"
              features={[
                "Real-time transaction monitoring",
                "Contract analysis",
                "Known scam detection",
                "Basic threat classification",
              ]}
            />
            
            <FeatureCard
              icon={<Sparkles className="w-8 h-8" />}
              title="Pro"
              price="$9.99/mo"
              description="AI-powered threat detection"
              features={[
                "Everything in Basic",
                "Deep3 Labs AI integration",
                "Advanced risk scoring",
                "Token metadata analysis",
                "Historical data access",
              ]}
              highlighted
            />
            
            <FeatureCard
              icon={<Zap className="w-8 h-8" />}
              title="Pro+"
              price="$29.99/mo"
              description="Full protection + arbitrage bots"
              features={[
                "Everything in Pro",
                "2 arbitrage bots included",
                "cooperanth.sol wallets",
                "Automated MEV protection",
                "Priority support",
              ]}
            />
          </div>
        </div>
      </section>
      
      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-primary/5 to-solana-purple/5">
        <div className="container mx-auto px-4 lg:px-8 text-center">
          <h2 className="text-4xl font-bold mb-6">Ready to Protect Your Wallet?</h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Join thousands of Solana users who trust Wallet Buddhi to keep their assets safe
          </p>
          <Button size="lg" onClick={handleConnect} data-testid="button-cta-connect">
            <Shield className="w-5 h-5 mr-2" />
            Get Started for Free
          </Button>
        </div>
      </section>
    </div>
  );
}

function FeatureCard({ icon, title, price, description, features, highlighted }: {
  icon: React.ReactNode;
  title: string;
  price: string;
  description: string;
  features: string[];
  highlighted?: boolean;
}) {
  return (
    <Card className={highlighted ? "ring-2 ring-primary" : ""}>
      <CardContent className="p-8 space-y-6">
        <div className="space-y-4">
          <div className="p-3 bg-primary/10 rounded-lg w-fit text-primary">
            {icon}
          </div>
          <div>
            <h3 className="text-2xl font-bold mb-1">{title}</h3>
            <div className="text-3xl font-bold mb-2">{price}</div>
            <p className="text-muted-foreground">{description}</p>
          </div>
        </div>
        
        <ul className="space-y-3">
          {features.map((feature, index) => (
            <li key={index} className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-success shrink-0 mt-0.5" />
              <span className="text-sm">{feature}</span>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
