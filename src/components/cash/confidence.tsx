import { Check, AlertTriangle, X } from "lucide-react";
import type { LucideIcon } from "lucide-react";

export type Confidence = "green" | "yellow" | "red";

export interface ConfidenceMeta {
  label: string;
  badgeClass: string;
  dotClass: string;
  borderClass: string;
  icon: LucideIcon;
  scoreLabel: string;
}

export const CONFIDENCE: Record<Confidence, ConfidenceMeta> = {
  green: {
    label: "High",
    badgeClass: "text-emerald-600 dark:text-emerald-400",
    dotClass: "bg-emerald-500",
    borderClass: "border-l-emerald-500",
    icon: Check,
    scoreLabel: "Auto-apply",
  },
  yellow: {
    label: "Medium",
    badgeClass: "text-amber-600 dark:text-amber-400",
    dotClass: "bg-amber-500",
    borderClass: "border-l-amber-500",
    icon: AlertTriangle,
    scoreLabel: "Review required",
  },
  red: {
    label: "Low",
    badgeClass: "text-destructive",
    dotClass: "bg-destructive",
    borderClass: "border-l-destructive",
    icon: X,
    scoreLabel: "Manual intervention",
  },
};

export function ConfidenceBadge({ level, score }: { level: Confidence; score?: number }) {
  const meta = CONFIDENCE[level];
  return (
    <span className={`inline-flex items-center gap-1.5 text-xs font-medium tabular-nums ${meta.badgeClass}`}>
      <span className={`inline-block h-1.5 w-1.5 rounded-full ${meta.dotClass}`} />
      {meta.label}
      {score !== undefined && <span className="text-muted-foreground font-normal">{(score * 100).toFixed(0)}%</span>}
    </span>
  );
}

export function ConfidenceDot({ level }: { level: Confidence }) {
  return <span className={`inline-block h-2 w-2 rounded-full ${CONFIDENCE[level].dotClass}`} />;
}
