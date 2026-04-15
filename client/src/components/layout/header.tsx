import mascotUrl from "@assets/ChatGPT Image Oct 20, 2025, 01_13_52 PM (1)_1761084669346.png";
import { Link } from "wouter";

export function Header() {
  return (
    <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 lg:px-8 h-16 flex items-center justify-between gap-4">
        <Link href="/" className="flex items-center gap-3 hover-elevate rounded-lg px-2 py-1">
          <img
            src={mascotUrl}
            alt="Wallet Buddhi"
            className="w-10 h-10 object-contain"
          />
          <div>
            <h1 className="text-xl font-bold">Wallet Buddhi</h1>
            <p className="text-xs text-muted-foreground hidden sm:block">
              Phantom companion · copycat alerts
            </p>
          </div>
        </Link>
        <nav className="flex items-center gap-2 text-sm">
          <Link href="/" className="px-3 py-1.5 rounded-md hover-elevate">Home</Link>
          <Link href="/dashboard" className="px-3 py-1.5 rounded-md hover-elevate">Dashboard</Link>
        </nav>
      </div>
    </header>
  );
}
