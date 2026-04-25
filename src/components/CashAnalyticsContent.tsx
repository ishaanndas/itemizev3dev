import { ArrowDown, ArrowUp, TrendingUp } from "lucide-react";
import TopBar from "./TopBar";
import { formatUSD } from "./cash/data";

const kpis = [
  { label: "Auto-match Rate", value: "78%", change: "+6%", positive: true, sub: "vs last month" },
  { label: "Avg Time to Apply", value: "1.2h", change: "-0.4h", positive: true, sub: "vs last month" },
  { label: "Exception Rate", value: "9%", change: "-2%", positive: true, sub: "vs last month" },
  { label: "Unapplied Aging", value: "$12.4k", change: "+$2k", positive: false, sub: "vs last month" },
];

const matchTrend = [62, 65, 68, 70, 72, 73, 76, 78];
const weeks = ["W1", "W2", "W3", "W4", "W5", "W6", "W7", "W8"];

const matchTypes = [
  { name: "Exact (invoice + amount)", count: 412, pct: 58, color: "bg-emerald-500" },
  { name: "Fuzzy (partial reference)", count: 142, pct: 20, color: "bg-blue-500" },
  { name: "Aggregate (1 → many)", count: 89, pct: 12, color: "bg-violet-500" },
  { name: "Split (many → 1)", count: 38, pct: 5, color: "bg-amber-500" },
  { name: "Manual override", count: 32, pct: 5, color: "bg-muted-foreground" },
];

const topPayers = [
  { name: "Massive Dynamic", autoRate: 96, volume: 248000 },
  { name: "Stark Enterprises", autoRate: 92, volume: 189000 },
  { name: "Acme Manufacturing Co.", autoRate: 88, volume: 152000 },
  { name: "Soylent Corp", autoRate: 85, volume: 98000 },
  { name: "Hooli Inc.", autoRate: 71, volume: 76000 },
  { name: "Umbrella Corp", autoRate: 54, volume: 64000 },
];

export default function CashAnalyticsContent() {
  return (
    <div className="flex-1 flex flex-col min-h-0 bg-background">
      <TopBar />
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-foreground tracking-tight">Cash Analytics</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Match performance, exception trends, and payer behavior
            </p>
          </div>

          {/* KPIs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {kpis.map((k) => (
              <div key={k.label} className="stat-card">
                <div className="text-xs font-medium text-muted-foreground mb-2">{k.label}</div>
                <div className="text-3xl font-bold tabular-nums text-foreground mb-1">{k.value}</div>
                <div className={`flex items-center gap-1 text-xs ${k.positive ? "text-emerald-600" : "text-amber-600"}`}>
                  {k.positive ? <ArrowDown className="h-3 w-3 rotate-180" /> : <ArrowUp className="h-3 w-3" />}
                  <span>{k.change}</span>
                  <span className="text-muted-foreground">{k.sub}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
            {/* Match rate trend */}
            <div className="stat-card lg:col-span-2">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-foreground">Match Rate Trend</h3>
                <span className="text-xs text-muted-foreground flex items-center gap-1">
                  <TrendingUp className="h-3 w-3" /> 8 weeks
                </span>
              </div>
              <div className="flex items-end gap-3 h-40">
                {matchTrend.map((val, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center gap-2">
                    <div className="w-full flex-1 flex items-end">
                      <div
                        className={`w-full rounded-t-md ${i === matchTrend.length - 1 ? "bg-primary" : "bg-primary/30"}`}
                        style={{ height: `${val}%` }}
                      />
                    </div>
                    <span className="text-[10px] text-muted-foreground">{weeks[i]}</span>
                    <span className="text-[10px] tabular-nums text-foreground font-medium">{val}%</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Match types */}
            <div className="stat-card">
              <h3 className="text-sm font-semibold text-foreground mb-4">Match Type Breakdown</h3>
              <div className="space-y-3">
                {matchTypes.map((m) => (
                  <div key={m.name}>
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="text-foreground">{m.name}</span>
                      <span className="text-muted-foreground tabular-nums">{m.count}</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-secondary overflow-hidden">
                      <div className={`h-full ${m.color}`} style={{ width: `${m.pct}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Top payers */}
          <div className="stat-card mb-6">
            <h3 className="text-sm font-semibold text-foreground mb-4">Payer Match Performance</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground border-b border-border">
                    <th className="text-left py-2">Payer</th>
                    <th className="text-right py-2">30d Volume</th>
                    <th className="text-left py-2 pl-6">Auto Match Rate</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {topPayers.map((p) => (
                    <tr key={p.name}>
                      <td className="py-3 font-medium text-foreground">{p.name}</td>
                      <td className="py-3 text-right tabular-nums text-foreground">{formatUSD(p.volume)}</td>
                      <td className="py-3 pl-6">
                        <div className="flex items-center gap-3">
                          <div className="flex-1 max-w-xs h-2 rounded-full bg-secondary overflow-hidden">
                            <div
                              className={`h-full ${
                                p.autoRate >= 85 ? "bg-emerald-500" : p.autoRate >= 70 ? "bg-amber-500" : "bg-destructive"
                              }`}
                              style={{ width: `${p.autoRate}%` }}
                            />
                          </div>
                          <span className="text-xs tabular-nums font-medium text-foreground w-10">{p.autoRate}%</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
