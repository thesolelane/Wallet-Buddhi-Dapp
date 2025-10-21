import { Badge } from "@/components/ui/badge";
import { Shield, AlertTriangle, XCircle, CheckCircle } from "lucide-react";
import { ThreatLevel } from "@shared/schema";

interface ThreatBadgeProps {
  level: ThreatLevel;
  size?: "sm" | "default" | "lg";
}

const THREAT_CONFIG = {
  [ThreatLevel.SAFE]: {
    label: "Safe",
    icon: CheckCircle,
    className: "bg-success/20 text-success border-success/30 hover:bg-success/25",
  },
  [ThreatLevel.SUSPICIOUS]: {
    label: "Suspicious",
    icon: AlertTriangle,
    className: "bg-warning/20 text-warning border-warning/30 hover:bg-warning/25",
  },
  [ThreatLevel.DANGER]: {
    label: "High Risk",
    icon: XCircle,
    className: "bg-danger/20 text-danger border-danger/30 hover:bg-danger/25",
  },
  [ThreatLevel.BLOCKED]: {
    label: "Blocked",
    icon: Shield,
    className: "bg-danger text-danger-foreground border-danger hover:bg-danger/90",
  },
};

export function ThreatBadge({ level, size = "default" }: ThreatBadgeProps) {
  const config = THREAT_CONFIG[level];
  const Icon = config.icon;
  
  const sizeClasses = {
    sm: "text-xs px-2 py-0.5",
    default: "text-sm px-3 py-1",
    lg: "text-base px-4 py-1.5",
  };
  
  return (
    <Badge 
      variant="outline" 
      className={`${config.className} ${sizeClasses[size]} font-medium gap-1.5 no-default-hover-elevate no-default-active-elevate`}
      data-testid={`badge-threat-${level}`}
    >
      <Icon className="w-3.5 h-3.5" />
      {config.label}
    </Badge>
  );
}
