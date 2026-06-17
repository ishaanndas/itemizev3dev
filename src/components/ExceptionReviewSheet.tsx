import { useNavigate } from "react-router-dom";
import {
  AlertTriangle,
  ArrowRight,
  Brain,
  Building2,
  Check,
  ChevronRight,
  ExternalLink,
  FileText,
  Flag,
  Hash,
  History,
  MessageSquare,
  Receipt,
  ShieldAlert,
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
import type { ExceptionRow } from "./ExceptionReviewContent";

const severityStyles: Record<ExceptionRow["severity"], string> = {
  "High": "bg-destructive/10 text-destructive border-destructive/20",
  "Medium": "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/30",
  "Low": "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/30",
};

const findingTone: Record<string, string> = {
  high: "border-destructive/30 bg-destructive/5",
  medium: "border-amber-300/60 bg-amber-50/60 dark:border-amber-500/30 dark:bg-amber-500/5",
  low: "border-border bg-secondary/40",
};

interface ExceptionReviewSheetProps {
  exception: ExceptionRow | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function ExceptionReviewSheet({
  exception,
  open,
  onOpenChange,
}: ExceptionReviewSheetProps) {
  const navigate = useNavigate();
  if (!exception) return null;

  const findings = exception.findings;
  const aiConfidence = exception.aiConfidence;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-xl overflow-y-auto p-0">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-background/95 backdrop-blur border-b border-border px-6 py-5">
          <SheetHeader className="text-left">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <div className="h-10 w-10 rounded-lg bg-destructive/10 text-destructive flex items-center justify-center shrink-0">
                  <ShieldAlert className="h-5 w-5" />
                </div>
                <div className="min-w-0">
                  <SheetTitle className="text-lg flex items-center gap-2">
                    <span className="truncate">{exception.docNumber}</span>
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${severityStyles[exception.severity]}`}>
                      {exception.severity} risk
                    </span>
                  </SheetTitle>
                  <SheetDescription className="text-xs flex items-center gap-1.5 mt-0.5">
                    <Building2 className="h-3 w-3" />
                    {exception.vendor} · {exception.docType}
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
                  <div className="text-xs font-semibold text-foreground">AI Triage Summary</div>
                  <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                    <Sparkles className="h-3 w-3 text-primary" />
                    {aiConfidence}% confidence
                  </div>
                </div>
                <p className="text-sm text-foreground/80 leading-relaxed mt-1.5">
                  {exception.aiSummary}
                </p>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {exception.aiActions.map((a) => (
                    <button
                      key={a}
                      className="text-[11px] font-medium px-2.5 py-1 rounded-full bg-primary/10 text-primary border border-primary/20 hover:bg-primary/15 transition-colors inline-flex items-center gap-1"
                    >
                      <Sparkles className="h-3 w-3" />
                      {a}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Key facts grid */}
          <div className="grid grid-cols-3 gap-3">
            <Fact label="Total" value={exception.total} mono />
            <Fact label="Open Findings" value={String(exception.openFindings)} />
            <Fact label="Days Open" value={`${exception.daysOpen}d`} tone={exception.daysOpen > 3 ? "destructive" : "default"} />
            <Fact label="Exception Type" value={exception.exceptionType} />
            <Fact label="Document Date" value={exception.documentDate} />
            <Fact label="Uploaded" value={exception.uploaded} />
          </div>

          {/* Findings */}
          <Section
            icon={<AlertTriangle className="h-4 w-4 text-amber-600" />}
            title="Findings"
            count={findings.length}
          >
            <div className="space-y-2">
              {findings.map((f, i) => (
                <div
                  key={i}
                  className={`rounded-lg border p-3 ${findingTone[f.severity] ?? findingTone.low}`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="text-sm font-medium text-foreground">{f.title}</div>
                      <div className="text-xs text-muted-foreground mt-0.5">{f.detail}</div>
                    </div>
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground shrink-0">
                      {f.severity}
                    </span>
                  </div>
                  {f.suggestion && (
                    <div className="mt-2 pt-2 border-t border-border/60 flex items-center justify-between gap-2">
                      <div className="text-xs text-foreground/80 flex items-center gap-1.5">
                        <Sparkles className="h-3 w-3 text-primary" />
                        <span>{f.suggestion}</span>
                      </div>
                      <button className="text-[11px] font-medium text-primary hover:underline shrink-0 inline-flex items-center gap-0.5">
                        Apply
                        <ChevronRight className="h-3 w-3" />
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </Section>

          {/* PO / Match context */}
          {exception.poMatch && (
            <Section
              icon={<Receipt className="h-4 w-4 text-blue-600" />}
              title="PO Match"
            >
              <div className="rounded-lg border border-border bg-card p-3 text-xs space-y-2">
                <Row label="PO Number" value={exception.poMatch.poNumber} mono />
                <Row label="PO Total" value={exception.poMatch.poTotal} mono />
                <Row label="Invoice Total" value={exception.total} mono />
                <Row
                  label="Variance"
                  value={exception.poMatch.variance}
                  mono
                  tone="destructive"
                />
              </div>
            </Section>
          )}

          {/* Activity */}
          <Section
            icon={<History className="h-4 w-4 text-muted-foreground" />}
            title="Activity"
          >
            <ol className="relative border-l border-border ml-1.5 space-y-3 pl-4">
              {exception.activity.map((a, i) => (
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
                onClick={() => navigate(`/documents/${exception.docNumber}`)}
                className="text-xs font-medium border border-border rounded-lg px-3 py-1.5 hover:bg-secondary text-foreground inline-flex items-center gap-1.5"
              >
                Open document
                <ExternalLink className="h-3 w-3" />
              </button>
              <button
                onClick={() => onOpenChange(false)}
                className="text-xs font-medium rounded-lg px-3.5 py-1.5 bg-primary text-primary-foreground hover:bg-primary/90 inline-flex items-center gap-1.5"
              >
                <Check className="h-3.5 w-3.5" />
                Resolve & Next
              </button>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}

function Fact({
  label,
  value,
  mono,
  tone,
}: {
  label: string;
  value: string;
  mono?: boolean;
  tone?: "default" | "destructive";
}) {
  return (
    <div className="rounded-lg border border-border bg-card px-3 py-2.5">
      <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
        {label}
      </div>
      <div
        className={`text-sm font-medium mt-1 ${mono ? "tabular-nums" : ""} ${
          tone === "destructive" ? "text-destructive" : "text-foreground"
        }`}
      >
        {value}
      </div>
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

function Row({
  label,
  value,
  mono,
  tone,
}: {
  label: string;
  value: string;
  mono?: boolean;
  tone?: "default" | "destructive";
}) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-muted-foreground">{label}</span>
      <span
        className={`${mono ? "tabular-nums" : ""} font-medium ${
          tone === "destructive" ? "text-destructive" : "text-foreground"
        }`}
      >
        {value}
      </span>
    </div>
  );
}

function FooterIconButton({
  icon,
  label,
}: {
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <button className="h-8 px-2.5 rounded-md text-xs text-muted-foreground hover:text-foreground hover:bg-secondary inline-flex items-center gap-1.5">
      {icon}
      {label}
    </button>
  );
}
