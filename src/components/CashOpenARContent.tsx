import { Upload, Search, FileSpreadsheet, CheckCircle2, AlertCircle } from "lucide-react";
import TopBar from "./TopBar";
import { sampleOpenAR, formatUSD } from "./cash/data";

const statusStyles: Record<string, string> = {
  Open: "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/30",
  Partial: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/30",
  Paid: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/30",
};

export default function CashOpenARContent() {
  const totalOpen = sampleOpenAR.filter((i) => i.status !== "Paid").reduce((s, i) => s + i.openBalance, 0);

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-background">
      <TopBar />
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex items-start justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-foreground tracking-tight">Open AR</h1>
              <p className="text-sm text-muted-foreground mt-1">
                Customer invoices available for matching against incoming payments
              </p>
            </div>
            <button className="flex items-center gap-2 text-sm font-medium bg-primary text-primary-foreground rounded-lg px-3.5 py-2 hover:opacity-90 transition-opacity">
              <Upload className="h-3.5 w-3.5" />
              Upload AR file
            </button>
          </div>

          {/* Upload status card */}
          <div className="stat-card mb-6 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                <CheckCircle2 className="h-5 w-5 text-emerald-500" />
              </div>
              <div>
                <div className="text-sm font-semibold text-foreground">acme_open_ar_20260406.csv</div>
                <div className="text-xs text-muted-foreground mt-0.5">
                  Uploaded today at 8:14 AM · 124 invoices · normalized to standard schema
                </div>
              </div>
            </div>
            <div className="flex items-center gap-6">
              <div className="text-right">
                <div className="text-xs text-muted-foreground">Total open</div>
                <div className="text-lg font-bold tabular-nums text-foreground">{formatUSD(totalOpen)}</div>
              </div>
              <button className="text-sm font-medium text-primary hover:underline">View mapping</button>
            </div>
          </div>

          {/* Search */}
          <div className="relative max-w-md mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search invoice or customer..."
              className="w-full bg-card border border-border rounded-lg pl-9 pr-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/60 outline-none focus:border-primary/40"
            />
          </div>

          {/* Table */}
          <div className="bg-card border border-border rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-secondary/40 border-b border-border">
                  <tr className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                    <th className="text-left px-4 py-3">Customer ID</th>
                    <th className="text-left px-4 py-3">Customer</th>
                    <th className="text-left px-4 py-3">Invoice #</th>
                    <th className="text-left px-4 py-3">Invoice Date</th>
                    <th className="text-left px-4 py-3">Due Date</th>
                    <th className="text-right px-4 py-3">Open Balance</th>
                    <th className="text-right px-4 py-3">Days Past Due</th>
                    <th className="text-left px-4 py-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {sampleOpenAR.map((inv) => (
                    <tr key={inv.invoiceNumber} className="hover:bg-accent/20 transition-colors">
                      <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{inv.customerId}</td>
                      <td className="px-4 py-3 font-medium text-foreground">{inv.customer}</td>
                      <td className="px-4 py-3 font-mono text-xs text-foreground">{inv.invoiceNumber}</td>
                      <td className="px-4 py-3 text-muted-foreground text-xs">{inv.invoiceDate}</td>
                      <td className="px-4 py-3 text-muted-foreground text-xs">{inv.dueDate}</td>
                      <td className="px-4 py-3 text-right font-semibold tabular-nums text-foreground">{formatUSD(inv.openBalance)}</td>
                      <td className={`px-4 py-3 text-right tabular-nums text-xs ${inv.daysPastDue > 0 ? "text-destructive font-semibold" : "text-muted-foreground"}`}>
                        {inv.daysPastDue > 0 ? `+${inv.daysPastDue}` : "—"}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex text-[11px] font-medium border rounded-full px-2 py-0.5 ${statusStyles[inv.status]}`}>
                          {inv.status}
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
