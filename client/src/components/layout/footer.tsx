import mascotUrl from "@assets/ChatGPT Image Oct 20, 2025, 01_13_52 PM (1)_1761084669346.png";

export function Footer() {
  return (
    <footer className="border-t bg-background/50 backdrop-blur-sm">
      <div className="container mx-auto px-4 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo & Branding */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <img 
                src={mascotUrl} 
                alt="Wallet Buddhi" 
                className="w-12 h-12 object-contain"
                data-testid="img-footer-logo"
              />
              <div>
                <h3 className="font-bold text-lg">Wallet Buddhi</h3>
                <p className="text-sm text-muted-foreground">Solana Security</p>
              </div>
            </div>
            <p className="text-sm text-muted-foreground">
              AI-powered wallet protection for the Solana ecosystem
            </p>
          </div>

          {/* Product */}
          <div>
            <h4 className="font-semibold mb-4">Product</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><a href="/tiers" className="hover:text-foreground transition-colors">Pricing</a></li>
              <li><a href="/#features" className="hover:text-foreground transition-colors">Features</a></li>
              <li><a href="/dashboard" className="hover:text-foreground transition-colors">Dashboard</a></li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h4 className="font-semibold mb-4">Resources</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><a href="#" className="hover:text-foreground transition-colors">Documentation</a></li>
              <li><a href="#" className="hover:text-foreground transition-colors">API</a></li>
              <li><a href="#" className="hover:text-foreground transition-colors">Support</a></li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="font-semibold mb-4">Legal</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><a href="#" className="hover:text-foreground transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-foreground transition-colors">Terms of Service</a></li>
              <li><a href="#" className="hover:text-foreground transition-colors">Security</a></li>
            </ul>
          </div>
        </div>

        <div className="border-t mt-8 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} Wallet Buddhi. All rights reserved.
          </p>
          <div className="flex gap-6 text-sm text-muted-foreground">
            <a href="#" className="hover:text-foreground transition-colors">Twitter</a>
            <a href="#" className="hover:text-foreground transition-colors">Discord</a>
            <a href="#" className="hover:text-foreground transition-colors">GitHub</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
