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
    badgeClass: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/30",
    dotClass: "bg-emerald-500",
    borderClass: "border-l-emerald-500",
    icon: Check,
    scoreLabel: "Auto-apply",
  },
  yellow: {
    label: "Medium",
    badgeClass: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/30",
    dotClass: "bg-amber-500",
    borderClass: "border-l-amber-500",
    icon: AlertTriangle,
    scoreLabel: "Review required",
  },
  red: {
    label: "Low",
    badgeClass: "bg-destructive/10 text-destructive border-destructive/20",
    dotClass: "bg-destructive",
    borderClass: "border-l-destructive",
    icon: X,
    scoreLabel: "Manual intervention",
  },
};

export function ConfidenceBadge({ level, score }: { level: Confidence; score?: number }) {
  const meta = CONFIDENCE[level];
  const Icon = meta.icon;
  return (
    <span className={`inline-flex items-center gap-1 text-[11px] font-semibold border rounded-full px-2 py-0.5 ${meta.badgeClass}`}>
      <Icon className="h-3 w-3" />
      {meta.label}
      {score !== undefined && <span className="tabular-nums opacity-70">· {(score * 100).toFixed(0)}%</span>}
    </span>
  );
}

export function ConfidenceDot({ level }: { level: Confidence }) {
  return <span className={`inline-block h-2 w-2 rounded-full ${CONFIDENCE[level].dotClass}`} />;
}
