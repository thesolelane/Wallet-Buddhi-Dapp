import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Shield, Activity, Layers } from "lucide-react";

export function Navigation() {
  const [location] = useLocation();
  
  const links = [
    { path: "/", label: "Dashboard", icon: Activity },
    { path: "/tiers", label: "Tiers", icon: Layers },
  ];
  
  return (
    <nav className="border-b bg-card">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="flex gap-2">
          {links.map((link) => {
            const Icon = link.icon;
            const isActive = location === link.path;
            
            return (
              <Link key={link.path} href={link.path}>
                <Button
                  variant={isActive ? "default" : "ghost"}
                  className={`rounded-b-none ${isActive ? "" : "hover-elevate"}`}
                  data-testid={`nav-${link.label.toLowerCase()}`}
                >
                  <Icon className="w-4 h-4 mr-2" />
                  {link.label}
                </Button>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
