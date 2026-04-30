import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Filter, ChevronDown, Sparkles, ArrowRight } from "lucide-react";
import TopBar from "./TopBar";
import { samplePayments, sampleOpenAR, formatUSD, type Payment } from "./cash/data";
import { ConfidenceBadge, type Confidence } from "./cash/confidence";

function MatchRow({ payment }: { payment: Payment }) {
  const navigate = useNavigate();
  const candidate = sampleOpenAR.find((i) => payment.reference?.includes(i.invoiceNumber));
  const diff = candidate ? payment.amount - candidate.openBalance : 0;

  return (
    <button
      onClick={() => navigate(`/cash/matching/${payment.id}`)}
      className="w-full text-left grid grid-cols-12 gap-3 items-center px-4 py-3 hover:bg-accent/20 transition-colors"
    >
      {/* Payment side */}
      <div className="col-span-5 min-w-0">
        <div className="text-sm font-medium text-foreground truncate">{payment.payer}</div>
        <div className="text-[11px] text-muted-foreground font-mono mt-0.5">
          {payment.paymentId} · {payment.method} · {payment.receivedDate}
        </div>
      </div>
      <div className="col-span-2 text-right">
        <div className="text-sm font-semibold tabular-nums text-foreground">{formatUSD(payment.amount)}</div>
        <div className="text-[11px] text-muted-foreground">{payment.remittanceSource}</div>
      </div>
      {/* Arrow */}
      <div className="col-span-1 flex justify-center">
        <ArrowRight className="h-3.5 w-3.5 text-muted-foreground/60" />
      </div>
      {/* Invoice side */}
      <div className="col-span-3 min-w-0">
        {candidate ? (
          <>
            <div className="text-sm font-medium text-foreground truncate">{candidate.invoiceNumber}</div>
            <div className="text-[11px] text-muted-foreground truncate">
              {candidate.customer}
              {payment.invoiceCount > 1 && ` +${payment.invoiceCount - 1} more`}
            </div>
          </>
        ) : (
          <>
            <div className="text-sm font-medium text-muted-foreground italic">No candidate found</div>
            <div className="text-[11px] text-muted-foreground/70 truncate">Needs manual research</div>
          </>
        )}
      </div>
      <div className="col-span-1 flex flex-col items-end">
        {candidate ? (
          <ConfidenceBadge level={payment.confidence} score={payment.matchScore} />
        ) : (
          <span className="text-xs font-medium text-muted-foreground/70">N/A</span>
        )}
        {diff !== 0 && candidate && (
          <span className={`text-[10px] mt-1 tabular-nums font-medium ${diff < 0 ? "text-rose-700 dark:text-rose-400" : "text-teal-700 dark:text-teal-400"}`}>
            {diff > 0 ? "+" : ""}{formatUSD(diff)}
          </span>
        )}
      </div>
    </button>
  );
}

export default function CashMatchingContent() {
  const [filter, setFilter] = useState<Confidence | "all">("all");

  const grouped = {
    green: samplePayments.filter((p) => p.confidence === "green"),
    yellow: samplePayments.filter((p) => p.confidence === "yellow"),
    red: samplePayments.filter((p) => p.confidence === "red"),
  };

  const filtered =
    filter === "all" ? samplePayments : samplePayments.filter((p) => p.confidence === filter);

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-background">
      <TopBar />
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex items-start justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-foreground tracking-tight">Matching Queue</h1>
              <p className="text-sm text-muted-foreground mt-1">
                AI-suggested matches between incoming payments and open invoices
              </p>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground bg-secondary border border-border rounded-lg px-2.5 py-1.5">
                <Sparkles className="h-3 w-3 text-primary" />
                Model: <span className="font-semibold text-foreground">v3.2</span> · learning from 2,341 actions
              </div>
            </div>
          </div>

          {/* Confidence buckets */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
            {(["green", "yellow", "red"] as Confidence[]).map((level) => {
              const count = grouped[level].length;
              const total = grouped[level].reduce((s, p) => s + p.amount, 0);
              const labels = { green: "High Confidence", yellow: "Medium · Review", red: "Low · Manual" };
              const subtitle = { green: "Auto-apply ready", yellow: "Confirm or adjust", red: "Find a match" };
              return (
                <button
                  key={level}
                  onClick={() => setFilter(filter === level ? "all" : level)}
                  className={`stat-card text-left transition-all border-l-4 ${
                    level === "green" ? "border-l-emerald-500" :
                    level === "yellow" ? "border-l-amber-500" :
                    "border-l-destructive"
                  } ${filter === level ? "ring-2 ring-primary/20" : ""}`}
                >
                  <div className="text-xs font-medium text-muted-foreground mb-2">{labels[level]}</div>
                  <div className="flex items-baseline justify-between">
                    <div className="text-3xl font-bold tabular-nums text-foreground">{count}</div>
                    <div className="text-sm font-medium tabular-nums text-muted-foreground">{formatUSD(total)}</div>
                  </div>
                  <div className="text-[12px] text-muted-foreground mt-1">{subtitle[level]}</div>
                </button>
              );
            })}
          </div>

          {/* Toolbar */}
          <div className="flex items-center justify-between gap-3 mb-3">
            <div className="flex items-center gap-2 flex-1">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search by payer or invoice..."
                  className="w-full bg-card border border-border rounded-lg pl-9 pr-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/60 outline-none focus:border-primary/40"
                />
              </div>
              <button className="flex items-center gap-1.5 text-sm border border-border rounded-lg px-3 py-2 hover:bg-secondary transition-colors text-foreground">
                <Filter className="h-3.5 w-3.5" />
                Match type
                <ChevronDown className="h-3 w-3" />
              </button>
            </div>
            <div className="flex items-center gap-2">
              <button className="text-sm font-medium border border-border rounded-lg px-3.5 py-2 hover:bg-secondary text-foreground">
                Bulk approve high
              </button>
              <button className="text-sm font-medium bg-primary text-primary-foreground rounded-lg px-3.5 py-2 hover:opacity-90">
                Generate posting file
              </button>
            </div>
          </div>

          {/* Match table */}
          <div className="bg-card border border-border rounded-xl overflow-hidden">
            {/* Header */}
            <div className="grid grid-cols-12 gap-3 px-4 py-3 bg-secondary/40 border-b border-border text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              <div className="col-span-5">Payment</div>
              <div className="col-span-2 text-right">Amount</div>
              <div className="col-span-1" />
              <div className="col-span-3">Suggested Invoice</div>
              <div className="col-span-1 text-right">Match</div>
            </div>
            <div className="divide-y divide-border">
              {filtered.map((p) => (
                <MatchRow key={p.id} payment={p} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
