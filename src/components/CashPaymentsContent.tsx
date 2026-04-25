import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Upload, Filter, ChevronDown } from "lucide-react";
import TopBar from "./TopBar";
import { samplePayments, formatUSD } from "./cash/data";
import { ConfidenceBadge } from "./cash/confidence";

const statusStyles: Record<string, string> = {
  Matched: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/30",
  Partial: "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/30",
  Exception: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/30",
  Unmatched: "bg-destructive/10 text-destructive border-destructive/20",
  Posted: "bg-violet-50 text-violet-700 border-violet-200 dark:bg-violet-500/10 dark:text-violet-400 dark:border-violet-500/30",
};

const sourceStyles: Record<string, string> = {
  "Lockbox": "bg-secondary text-foreground/70",
  "ACH Addenda": "bg-secondary text-foreground/70",
  "Email": "bg-secondary text-foreground/70",
  "Portal": "bg-secondary text-foreground/70",
};

export default function CashPaymentsContent() {
  const navigate = useNavigate();
  const [filter, setFilter] = useState<string>("All");

  const filters = ["All", "Matched", "Partial", "Exception", "Unmatched"];
  const filtered = filter === "All" ? samplePayments : samplePayments.filter((p) => p.status === filter);

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-background">
      <TopBar />
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex items-start justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-foreground tracking-tight">Payments Inbox</h1>
              <p className="text-sm text-muted-foreground mt-1">
                Incoming payments from lockbox, ACH, wire, and email remittance
              </p>
            </div>
            <button className="flex items-center gap-2 text-sm font-medium bg-primary text-primary-foreground rounded-lg px-3.5 py-2 hover:opacity-90 transition-opacity">
              <Upload className="h-3.5 w-3.5" />
              Upload payment file
            </button>
          </div>

          {/* Filters */}
          <div className="flex items-center justify-between gap-3 mb-4">
            <div className="flex items-center gap-2 flex-1">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search by payer, payment ID, reference..."
                  className="w-full bg-card border border-border rounded-lg pl-9 pr-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/60 outline-none focus:border-primary/40"
                />
              </div>
              <button className="flex items-center gap-1.5 text-sm border border-border rounded-lg px-3 py-2 hover:bg-secondary transition-colors text-foreground">
                <Filter className="h-3.5 w-3.5" />
                Method
                <ChevronDown className="h-3 w-3" />
              </button>
              <button className="flex items-center gap-1.5 text-sm border border-border rounded-lg px-3 py-2 hover:bg-secondary transition-colors text-foreground">
                Source
                <ChevronDown className="h-3 w-3" />
              </button>
            </div>
            <div className="flex items-center gap-1 bg-secondary/60 border border-border rounded-lg p-1">
              {filters.map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                    filter === f ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>

          {/* Table */}
          <div className="bg-card border border-border rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-secondary/40 border-b border-border">
                  <tr className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                    <th className="text-left px-4 py-3">Payment ID</th>
                    <th className="text-left px-4 py-3">Payer</th>
                    <th className="text-left px-4 py-3">Method</th>
                    <th className="text-left px-4 py-3">Source</th>
                    <th className="text-left px-4 py-3">Reference</th>
                    <th className="text-right px-4 py-3">Amount</th>
                    <th className="text-left px-4 py-3">Received</th>
                    <th className="text-left px-4 py-3">Confidence</th>
                    <th className="text-left px-4 py-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filtered.map((p) => (
                    <tr
                      key={p.id}
                      onClick={() => navigate(`/cash/matching/${p.id}`)}
                      className="hover:bg-accent/20 cursor-pointer transition-colors"
                    >
                      <td className="px-4 py-3 font-mono text-xs text-foreground">{p.paymentId}</td>
                      <td className="px-4 py-3 font-medium text-foreground">{p.payer}</td>
                      <td className="px-4 py-3 text-foreground/80">{p.method}</td>
                      <td className="px-4 py-3">
                        <span className={`text-[11px] font-medium rounded-full px-2 py-0.5 ${sourceStyles[p.remittanceSource] || "bg-secondary"}`}>
                          {p.remittanceSource}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-foreground/70 text-xs font-mono truncate max-w-[180px]">{p.reference}</td>
                      <td className="px-4 py-3 text-right font-semibold tabular-nums text-foreground">{formatUSD(p.amount)}</td>
                      <td className="px-4 py-3 text-muted-foreground text-xs">{p.receivedDate}</td>
                      <td className="px-4 py-3"><ConfidenceBadge level={p.confidence} score={p.matchScore} /></td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex text-[11px] font-medium border rounded-full px-2 py-0.5 ${statusStyles[p.status]}`}>
                          {p.status}
                        </span>
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
