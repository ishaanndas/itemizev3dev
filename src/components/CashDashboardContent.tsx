import {
  RefreshCw, Upload, Banknote, AlertTriangle, Wallet, ArrowDown, Clock,
  ArrowRight, FileSpreadsheet, ScrollText, Mail,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import TopBar from "./TopBar";
import { samplePayments, formatUSD } from "./cash/data";
import { ConfidenceBadge } from "./cash/confidence";

const cards = [
  { label: "Matched Today", value: "82", subtitle: "$184,250.50 auto-applied", accent: "border-l-emerald-500", route: "/cash/matching" },
  { label: "Awaiting Review", value: "27", subtitle: "Medium confidence matches", accent: "border-l-amber-500", route: "/cash/matching" },
  { label: "Exceptions", value: "9", subtitle: "Short-pay, unmatched, dupes", accent: "border-l-destructive", route: "/cash/exceptions" },
  { label: "Unapplied Cash", value: "$12,480", subtitle: "6 payments · oldest 4 days", accent: "border-l-primary", route: "/cash/open-ar" },
];

const aging = [
  { bucket: "Current", amount: 184250, pct: 56 },
  { bucket: "1–30", amount: 92140, pct: 28 },
  { bucket: "31–60", amount: 32500, pct: 10 },
  { bucket: "61–90", amount: 12800, pct: 4 },
  { bucket: "90+", amount: 6420, pct: 2 },
];

const sources = [
  { name: "Lockbox (WLBX)", count: 28, icon: ScrollText },
  { name: "ACH / BAI2", count: 41, icon: Banknote },
  { name: "Wire / RTP", count: 7, icon: ArrowRight },
  { name: "Email Remittance", count: 16, icon: Mail },
];

export default function CashDashboardContent() {
  const navigate = useNavigate();
  const recent = samplePayments.slice(0, 6);

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-background">
      <TopBar />
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-6xl mx-auto px-6 py-8">
          <div className="flex items-start justify-between mb-8">
            <div>
              <h1 className="text-2xl font-bold text-foreground tracking-tight">Cash Application</h1>
              <p className="text-sm text-muted-foreground mt-1">
                Match incoming payments to invoices, resolve exceptions, and post to your ERP
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button className="flex items-center gap-2 text-sm font-medium border border-border rounded-lg px-3.5 py-2 hover:bg-secondary transition-colors text-foreground">
                <Upload className="h-3.5 w-3.5" />
                Upload Open AR
              </button>
              <button className="flex items-center gap-2 text-sm font-medium border border-border rounded-lg px-3.5 py-2 hover:bg-secondary transition-colors text-foreground">
                <RefreshCw className="h-3.5 w-3.5" />
                Refresh
              </button>
            </div>
          </div>

          {/* Daily deadline banner */}
          <div className="mb-6 stat-card border-l-4 border-l-primary flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Clock className="h-5 w-5 text-primary" />
              </div>
              <div>
                <div className="text-sm font-semibold text-foreground">Today's posting cutoff: 4:00 PM EST</div>
                <div className="text-xs text-muted-foreground mt-0.5">
                  27 matches awaiting review · file generates automatically at cutoff
                </div>
              </div>
            </div>
            <button
              onClick={() => navigate("/cash/matching")}
              className="flex items-center gap-2 text-sm font-medium bg-primary text-primary-foreground rounded-lg px-3.5 py-2 hover:opacity-90 transition-opacity"
            >
              Review queue
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>

          {/* Stat cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {cards.map((c) => (
              <div key={c.label} className={`stat-card border-l-4 ${c.accent}`}>
                <div className="text-xs font-medium text-muted-foreground mb-2">{c.label}</div>
                <div className="text-3xl font-bold tabular-nums text-foreground mb-1">{c.value}</div>
                <div className="text-[12px] text-muted-foreground">{c.subtitle}</div>
              </div>
            ))}
          </div>

          {/* Row: Match rate + AR aging + Sources */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
            {/* Auto-match rate */}
            <div className="stat-card flex flex-col justify-between">
              <h3 className="text-sm font-semibold text-foreground mb-4">Auto-match Rate</h3>
              <div className="flex items-center justify-center flex-1">
                <div className="relative h-28 w-28">
                  <svg className="h-28 w-28 -rotate-90" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="40" fill="none" stroke="hsl(var(--border))" strokeWidth="8" />
                    <circle cx="50" cy="50" r="40" fill="none" stroke="hsl(var(--primary))" strokeWidth="8"
                      strokeDasharray={`${78 * 2.51} ${100 * 2.51}`} strokeLinecap="round" />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-2xl font-bold tabular-nums text-foreground">78%</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-center gap-1.5 text-xs text-emerald-600 mt-2">
                <ArrowDown className="h-3 w-3 rotate-180" />
                <span>+6% vs last week · learning improving</span>
              </div>
            </div>

            {/* AR Aging */}
            <div className="stat-card lg:col-span-2">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-foreground">AR Aging</h3>
                <span className="text-xs text-muted-foreground">Total open: $328,110</span>
              </div>
              <div className="space-y-3">
                {aging.map((a) => (
                  <div key={a.bucket} className="flex items-center gap-3">
                    <div className="w-16 text-xs text-muted-foreground">{a.bucket}</div>
                    <div className="flex-1 h-6 rounded-md bg-secondary/60 overflow-hidden relative">
                      <div
                        className={`h-full rounded-md ${
                          a.bucket === "Current" ? "bg-emerald-500/70" :
                          a.bucket === "1–30" ? "bg-primary/70" :
                          a.bucket === "31–60" ? "bg-amber-500/70" :
                          "bg-destructive/70"
                        }`}
                        style={{ width: `${a.pct}%` }}
                      />
                    </div>
                    <div className="w-24 text-right text-sm font-medium tabular-nums text-foreground">
                      {formatUSD(a.amount)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Payment sources */}
          <div className="stat-card mb-6">
            <h3 className="text-sm font-semibold text-foreground mb-4">Today's Payment Capture</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {sources.map((s) => (
                <div key={s.name} className="flex items-center gap-3 p-3 rounded-lg border border-border bg-card">
                  <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                    <s.icon className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold tabular-nums text-foreground leading-none">{s.count}</div>
                    <div className="text-[11px] text-muted-foreground mt-1">{s.name}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent matches */}
          <div className="stat-card">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-foreground">Recent Activity</h3>
              <button
                onClick={() => navigate("/cash/matching")}
                className="text-xs font-medium text-primary hover:underline"
              >
                View all
              </button>
            </div>
            <div className="divide-y divide-border">
              {recent.map((p) => (
                <button
                  key={p.id}
                  onClick={() => navigate(`/cash/matching/${p.id}`)}
                  className="w-full flex items-center justify-between py-3 hover:bg-accent/20 -mx-2 px-2 rounded-lg transition-colors text-left"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                      <Banknote className="h-4 w-4 text-primary" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-sm font-medium text-foreground truncate">
                        {p.payer} · {p.paymentId}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {p.method} · {p.receivedDate} · {p.invoiceCount} invoice{p.invoiceCount !== 1 ? "s" : ""}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <ConfidenceBadge level={p.confidence} score={p.matchScore} />
                    <span className="text-sm font-semibold tabular-nums text-foreground w-24 text-right">
                      {formatUSD(p.amount)}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
