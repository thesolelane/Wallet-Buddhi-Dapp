export function Footer() {
  return (
    <footer className="border-t bg-background/50 backdrop-blur-sm">
      <div className="container mx-auto px-4 lg:px-8 py-6 flex flex-col md:flex-row justify-between items-center gap-4">
        <p className="text-sm text-muted-foreground">
          © {new Date().getFullYear()} Wallet Buddhi · read-only companion for Solana wallets
        </p>
        <p className="text-xs text-muted-foreground">
          The app never connects to your wallet. It only watches public keys you paste in.
        </p>
      </div>
    </footer>
  );
}
