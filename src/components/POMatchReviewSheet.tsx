import { useNavigate } from "react-router-dom";
import {
  ArrowRight,
  Brain,
  Building2,
  Check,
  ChevronRight,
  ExternalLink,
  FileText,
  Flag,
  GitCompare,
  History,
  Link2,
  MessageSquare,
  Package,
  Receipt,
  Sparkles,
  UserCheck,
  X,
} from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import type { POMatchRow, MatchStatus } from "./POMatchingContent";

const statusStyles: Record<MatchStatus, string> = {
  "Auto-matched":
    "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/30",
  "Needs review":
    "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/30",
  Variance: "bg-destructive/10 text-destructive border-destructive/20",
  Unmatched:
    "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-500/10 dark:text-rose-400 dark:border-rose-500/30",
  Approved:
    "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/30",
};

const lineTone: Record<string, string> = {
  ok: "border-border bg-card",
  warn: "border-amber-300/60 bg-amber-50/40 dark:border-amber-500/30 dark:bg-amber-500/5",
  bad: "border-destructive/30 bg-destructive/5",
};

interface POMatchReviewSheetProps {
  match: POMatchRow | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function POMatchReviewSheet({ match, open, onOpenChange }: POMatchReviewSheetProps) {
  const navigate = useNavigate();
  if (!match) return null;

  const hasReceipt = !!match.receipt;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-2xl overflow-y-auto p-0">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-background/95 backdrop-blur border-b border-border px-6 py-5">
          <SheetHeader className="text-left">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <div className="h-10 w-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                  <Link2 className="h-5 w-5" />
                </div>
                <div className="min-w-0">
                  <SheetTitle className="text-lg flex items-center gap-2 flex-wrap">
                    <span className="font-mono truncate">{match.poNumber}</span>
                    <ArrowRight className="h-3.5 w-3.5 text-muted-foreground" />
                    <span className="font-mono truncate">{match.invoiceNumber}</span>
                    <span
                      className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${statusStyles[match.status]}`}
                    >
                      {match.status}
                    </span>
                  </SheetTitle>
                  <SheetDescription className="text-xs flex items-center gap-1.5 mt-0.5">
                    <Building2 className="h-3 w-3" />
                    {match.vendor} · {match.matchType} match
                  </SheetDescription>
                </div>
              </div>
              <button
                onClick={() => onOpenChange(false)}
                className="h-8 w-8 rounded-md hover:bg-secondary flex items-center justify-center text-muted-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </SheetHeader>
        </div>

        <div className="px-6 py-5 space-y-6">
          {/* AI summary */}
          <div className="rounded-xl border border-primary/20 bg-gradient-to-br from-primary/[0.04] to-transparent p-4">
            <div className="flex items-start gap-3">
              <div className="h-8 w-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                <Brain className="h-4 w-4" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <div className="text-xs font-semibold text-foreground">AI Match Analysis</div>
                  <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                    <Sparkles className="h-3 w-3 text-primary" />
                    {match.aiConfidence}% confidence
                  </div>
                </div>
                <p className="text-sm text-foreground/80 leading-relaxed mt-1.5">
                  {match.aiSummary}
                </p>
                {match.aiActions.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {match.aiActions.map((a) => (
                      <button
                        key={a}
                        className="text-[11px] font-medium px-2.5 py-1 rounded-full bg-primary/10 text-primary border border-primary/20 hover:bg-primary/15 transition-colors inline-flex items-center gap-1"
                      >
                        <Sparkles className="h-3 w-3" />
                        {a}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* 3-way totals */}
          <Section
            icon={<GitCompare className="h-4 w-4 text-primary" />}
            title={hasReceipt ? "3-way totals" : "2-way totals"}
          >
            <div className={`grid ${hasReceipt ? "grid-cols-3" : "grid-cols-2"} gap-2`}>
              <TotalCard
                icon={<FileText className="h-3.5 w-3.5" />}
                label="Purchase Order"
                ref={match.poNumber}
                total={match.poTotal}
              />
              <TotalCard
                icon={<Receipt className="h-3.5 w-3.5" />}
                label="Invoice"
                ref={match.invoiceNumber}
                total={match.invoiceTotal}
                highlight
              />
              {hasReceipt && (
                <TotalCard
                  icon={<Package className="h-3.5 w-3.5" />}
                  label="Goods Receipt"
                  ref={match.receipt!.number}
                  total={match.receipt!.total}
                />
              )}
            </div>
            {match.variance !== "—" && match.variance !== "$0.00" && (
              <div className="mt-2 rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2 flex items-center justify-between">
                <span className="text-xs text-muted-foreground">PO ↔ Invoice variance</span>
                <span className="text-sm font-semibold tabular-nums text-destructive">
                  {match.variance}{" "}
                  <span className="text-[11px] font-normal text-destructive/70">
                    ({match.variancePct}%)
                  </span>
                </span>
              </div>
            )}
          </Section>

          {/* Line comparison */}
          <Section
            icon={<Link2 className="h-4 w-4 text-violet-600" />}
            title="Line comparison"
            count={match.lines.length}
          >
            <div className="rounded-lg border border-border overflow-hidden">
              <div className="grid grid-cols-12 gap-2 px-3 py-2 bg-secondary/50 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                <div className="col-span-4">Item</div>
                <div className="col-span-2 text-right">PO qty</div>
                <div className="col-span-2 text-right">Inv qty</div>
                <div className="col-span-2 text-right">Unit</div>
                <div className="col-span-2 text-right">Variance</div>
              </div>
              <div className="divide-y divide-border">
                {match.lines.map((l, i) => (
                  <div
                    key={i}
                    className={`grid grid-cols-12 gap-2 px-3 py-2.5 text-xs ${lineTone[l.status]}`}
                  >
                    <div className="col-span-4 min-w-0">
                      <div className="font-medium text-foreground truncate">{l.description}</div>
                      <div className="text-[10px] font-mono text-muted-foreground mt-0.5">
                        {l.sku}
                      </div>
                    </div>
                    <div className="col-span-2 text-right tabular-nums text-muted-foreground">
                      {l.poQty}
                    </div>
                    <div
                      className={`col-span-2 text-right tabular-nums ${
                        l.poQty !== l.invoiceQty ? "text-destructive font-semibold" : "text-foreground"
                      }`}
                    >
                      {l.invoiceQty}
                    </div>
                    <div className="col-span-2 text-right tabular-nums text-foreground">
                      {l.invoiceUnit}
                    </div>
                    <div
                      className={`col-span-2 text-right tabular-nums font-semibold ${
                        l.status === "bad"
                          ? "text-destructive"
                          : l.status === "warn"
                            ? "text-amber-600 dark:text-amber-400"
                            : "text-muted-foreground"
                      }`}
                    >
                      {l.variance}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="mt-2 flex items-center justify-between gap-2 px-1">
              <div className="text-[11px] text-muted-foreground flex items-center gap-1.5">
                <Sparkles className="h-3 w-3 text-primary" />
                <span>AI can auto-apply tolerance overrides on safe lines.</span>
              </div>
              <button className="text-[11px] font-medium text-primary hover:underline inline-flex items-center gap-0.5">
                Apply all
                <ChevronRight className="h-3 w-3" />
              </button>
            </div>
          </Section>

          {/* Activity */}
          <Section icon={<History className="h-4 w-4 text-muted-foreground" />} title="Activity">
            <ol className="relative border-l border-border ml-1.5 space-y-3 pl-4">
              {match.activity.map((a, i) => (
                <li key={i} className="relative">
                  <span className="absolute -left-[21px] top-1 h-2.5 w-2.5 rounded-full bg-card border-2 border-primary/40" />
                  <div className="text-xs text-foreground">{a.text}</div>
                  <div className="text-[11px] text-muted-foreground mt-0.5">
                    {a.actor} · {a.when}
                  </div>
                </li>
              ))}
            </ol>
          </Section>
        </div>

        {/* Sticky footer */}
        <div className="sticky bottom-0 z-10 bg-background/95 backdrop-blur border-t border-border px-6 py-3">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-1">
              <FooterIconButton icon={<Flag className="h-3.5 w-3.5" />} label="Flag" />
              <FooterIconButton icon={<MessageSquare className="h-3.5 w-3.5" />} label="Note" />
              <FooterIconButton icon={<UserCheck className="h-3.5 w-3.5" />} label="Assign" />
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => navigate(`/documents/${match.invoiceNumber}`)}
                className="text-xs font-medium border border-border rounded-lg px-3 py-1.5 hover:bg-secondary text-foreground inline-flex items-center gap-1.5"
              >
                Open invoice
                <ExternalLink className="h-3 w-3" />
              </button>
              <button
                onClick={() => onOpenChange(false)}
                className="text-xs font-medium rounded-lg px-3.5 py-1.5 bg-primary text-primary-foreground hover:bg-primary/90 inline-flex items-center gap-1.5"
              >
                <Check className="h-3.5 w-3.5" />
                Approve & Next
              </button>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}

function TotalCard({
  icon,
  label,
  ref: refLabel,
  total,
  highlight,
}: {
  icon: React.ReactNode;
  label: string;
  ref: string;
  total: string;
  highlight?: boolean;
}) {
  return (
    <div
      className={`rounded-lg border px-3 py-2.5 ${
        highlight ? "border-primary/30 bg-primary/[0.03]" : "border-border bg-card"
      }`}
    >
      <div className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
        {icon}
        {label}
      </div>
      <div className="font-mono text-[11px] text-muted-foreground mt-1 truncate">{refLabel}</div>
      <div className="text-sm font-semibold tabular-nums text-foreground mt-0.5">{total}</div>
    </div>
  );
}

function Section({
  icon,
  title,
  count,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  count?: number;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-2.5">
        {icon}
        <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          {title}
        </h3>
        {count !== undefined && (
          <span className="text-[10px] font-semibold text-muted-foreground bg-secondary rounded-full px-2 py-0.5 tabular-nums">
            {count}
          </span>
        )}
      </div>
      {children}
    </div>
  );
}

function FooterIconButton({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <button className="h-8 px-2.5 rounded-md text-xs text-muted-foreground hover:text-foreground hover:bg-secondary inline-flex items-center gap-1.5">
      {icon}
      {label}
    </button>
  );
}
