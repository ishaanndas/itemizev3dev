import { Download, FileSpreadsheet, Clock, CheckCircle2, ScrollText } from "lucide-react";
import TopBar from "./TopBar";
import { formatUSD } from "./cash/data";
import { ConfidenceBadge, type Confidence } from "./cash/confidence";

interface PostingFile {
  batchId: string;
  date: string;
  status: "Generating" | "Ready" | "Sent to Bank";
  journalCount: number;
  lineCount: number;
  totalAmount: number;
  autoPct: number;
  manualPct: number;
  exceptionPct: number;
}

const files: PostingFile[] = [
  { batchId: "BATCH-20260406", date: "Apr 6, 2026", status: "Generating", journalCount: 24, lineCount: 58, totalAmount: 184250.5, autoPct: 78, manualPct: 18, exceptionPct: 4 },
  { batchId: "BATCH-20260405", date: "Apr 5, 2026", status: "Sent to Bank", journalCount: 31, lineCount: 74, totalAmount: 221480.0, autoPct: 81, manualPct: 15, exceptionPct: 4 },
  { batchId: "BATCH-20260404", date: "Apr 4, 2026", status: "Sent to Bank", journalCount: 28, lineCount: 65, totalAmount: 195320.75, autoPct: 76, manualPct: 19, exceptionPct: 5 },
  { batchId: "BATCH-20260403", date: "Apr 3, 2026", status: "Sent to Bank", journalCount: 35, lineCount: 82, totalAmount: 248910.0, autoPct: 83, manualPct: 13, exceptionPct: 4 },
  { batchId: "BATCH-20260402", date: "Apr 2, 2026", status: "Sent to Bank", journalCount: 22, lineCount: 51, totalAmount: 162400.5, autoPct: 74, manualPct: 22, exceptionPct: 4 },
];

interface JournalLine {
  journalId: string;
  line: number;
  customerId: string;
  invoice: string;
  paymentId: string;
  account: string;
  debit: number;
  credit: number;
  description: string;
  matchStatus: "AUTO" | "MANUAL" | "EXCEPTION";
  confidenceFlag: Confidence;
  confidenceScore: number;
}

const previewLines: JournalLine[] = [
  { journalId: "JRN-1001", line: 1, customerId: "CUST-1001", invoice: "INV-9001", paymentId: "PAY-5001", account: "Cash - Bank", debit: 5000, credit: 0, description: "Payment received via ACH", matchStatus: "AUTO", confidenceFlag: "green", confidenceScore: 0.96 },
  { journalId: "JRN-1001", line: 2, customerId: "CUST-1001", invoice: "INV-9001", paymentId: "PAY-5001", account: "Accounts Receivable", debit: 0, credit: 5000, description: "Invoice fully paid", matchStatus: "AUTO", confidenceFlag: "green", confidenceScore: 0.91 },
  { journalId: "JRN-1003", line: 1, customerId: "CUST-3003", invoice: "INV-9201", paymentId: "PAY-5003", account: "Cash - Bank", debit: 5500, credit: 0, description: "Overpayment received", matchStatus: "AUTO", confidenceFlag: "green", confidenceScore: 0.95 },
  { journalId: "JRN-1003", line: 2, customerId: "CUST-3003", invoice: "INV-9201", paymentId: "PAY-5003", account: "Accounts Receivable", debit: 0, credit: 5000, description: "Invoice fully paid", matchStatus: "AUTO", confidenceFlag: "green", confidenceScore: 0.90 },
  { journalId: "JRN-1003", line: 3, customerId: "CUST-3003", invoice: "—", paymentId: "PAY-5003", account: "Unapplied Cash", debit: 0, credit: 500, description: "Overpayment balance", matchStatus: "AUTO", confidenceFlag: "green", confidenceScore: 0.98 },
  { journalId: "JRN-1004", line: 1, customerId: "CUST-4004", invoice: "INV-9301", paymentId: "PAY-5004", account: "Cash - Bank", debit: 4800, credit: 0, description: "Short payment received", matchStatus: "MANUAL", confidenceFlag: "yellow", confidenceScore: 0.61 },
  { journalId: "JRN-1004", line: 2, customerId: "CUST-4004", invoice: "INV-9301", paymentId: "PAY-5004", account: "Accounts Receivable", debit: 0, credit: 5000, description: "Invoice expected amount", matchStatus: "MANUAL", confidenceFlag: "yellow", confidenceScore: 0.77 },
  { journalId: "JRN-1004", line: 3, customerId: "CUST-4004", invoice: "INV-9301", paymentId: "PAY-5004", account: "Deductions / Write-offs", debit: 200, credit: 0, description: "Short pay adjustment", matchStatus: "MANUAL", confidenceFlag: "yellow", confidenceScore: 0.81 },
];

const statusStyles: Record<PostingFile["status"], string> = {
  "Generating": "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/30",
  "Ready": "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/30",
  "Sent to Bank": "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/30",
};

export default function CashPostingFilesContent() {
  return (
    <div className="flex-1 flex flex-col min-h-0 bg-background">
      <TopBar />
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex items-start justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-foreground tracking-tight">Posting Files</h1>
              <p className="text-sm text-muted-foreground mt-1">
                Daily ERP posting batches generated at 4:00 PM EST cutoff
              </p>
            </div>
            <button className="flex items-center gap-2 text-sm font-medium bg-primary text-primary-foreground rounded-lg px-3.5 py-2 hover:opacity-90">
              <Download className="h-3.5 w-3.5" />
              Download today's batch
            </button>
          </div>

          {/* Today's batch detail */}
          <div className="stat-card border-l-4 border-l-primary mb-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-start gap-3">
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <FileSpreadsheet className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <div className="text-base font-semibold text-foreground">{files[0].batchId}</div>
                  <div className="text-xs text-muted-foreground mt-0.5">
                    {files[0].journalCount} journals · {files[0].lineCount} lines · {formatUSD(files[0].totalAmount)} total
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className={`inline-flex items-center gap-1 text-xs font-medium border rounded-full px-2.5 py-1 ${statusStyles[files[0].status]}`}>
                  <Clock className="h-3 w-3" />
                  {files[0].status} · cutoff in 2h 14m
                </span>
              </div>
            </div>

            {/* Composition bar */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Composition</span>
                <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
                  <span><span className="inline-block h-2 w-2 rounded-full bg-emerald-500 mr-1" />Auto {files[0].autoPct}%</span>
                  <span><span className="inline-block h-2 w-2 rounded-full bg-amber-500 mr-1" />Manual {files[0].manualPct}%</span>
                  <span><span className="inline-block h-2 w-2 rounded-full bg-destructive mr-1" />Exception {files[0].exceptionPct}%</span>
                </div>
              </div>
              <div className="h-2 rounded-full bg-secondary overflow-hidden flex">
                <div className="bg-emerald-500" style={{ width: `${files[0].autoPct}%` }} />
                <div className="bg-amber-500" style={{ width: `${files[0].manualPct}%` }} />
                <div className="bg-destructive" style={{ width: `${files[0].exceptionPct}%` }} />
              </div>
            </div>
          </div>

          {/* GL Preview */}
          <div className="bg-card border border-border rounded-xl overflow-hidden mb-6">
            <div className="px-4 py-3 border-b border-border flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ScrollText className="h-4 w-4 text-muted-foreground" />
                <h3 className="text-sm font-semibold text-foreground">GL Posting Preview</h3>
                <span className="text-[11px] text-muted-foreground">— first 8 lines of {files[0].lineCount}</span>
              </div>
              <button className="text-xs font-medium text-primary hover:underline flex items-center gap-1">
                <Download className="h-3 w-3" />
                Download CSV
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead className="bg-secondary/40 border-b border-border">
                  <tr className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                    <th className="text-left px-3 py-2">Journal</th>
                    <th className="text-left px-3 py-2">Ln</th>
                    <th className="text-left px-3 py-2">Customer</th>
                    <th className="text-left px-3 py-2">Invoice</th>
                    <th className="text-left px-3 py-2">Account</th>
                    <th className="text-right px-3 py-2">Debit</th>
                    <th className="text-right px-3 py-2">Credit</th>
                    <th className="text-left px-3 py-2">Description</th>
                    <th className="text-left px-3 py-2">Match</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {previewLines.map((l, i) => (
                    <tr key={i} className="hover:bg-accent/20">
                      <td className="px-3 py-2 font-mono text-foreground">{l.journalId}</td>
                      <td className="px-3 py-2 text-muted-foreground">{l.line}</td>
                      <td className="px-3 py-2 font-mono text-muted-foreground">{l.customerId}</td>
                      <td className="px-3 py-2 font-mono text-foreground">{l.invoice}</td>
                      <td className="px-3 py-2 text-foreground">{l.account}</td>
                      <td className="px-3 py-2 text-right tabular-nums text-foreground">{l.debit > 0 ? formatUSD(l.debit) : "—"}</td>
                      <td className="px-3 py-2 text-right tabular-nums text-foreground">{l.credit > 0 ? formatUSD(l.credit) : "—"}</td>
                      <td className="px-3 py-2 text-muted-foreground truncate max-w-[200px]">{l.description}</td>
                      <td className="px-3 py-2"><ConfidenceBadge level={l.confidenceFlag} score={l.confidenceScore} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* History */}
          <h3 className="text-sm font-semibold text-foreground mb-3">History</h3>
          <div className="bg-card border border-border rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-secondary/40 border-b border-border">
                <tr className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  <th className="text-left px-4 py-3">Batch ID</th>
                  <th className="text-left px-4 py-3">Date</th>
                  <th className="text-right px-4 py-3">Journals</th>
                  <th className="text-right px-4 py-3">Lines</th>
                  <th className="text-right px-4 py-3">Total</th>
                  <th className="text-left px-4 py-3">Composition</th>
                  <th className="text-left px-4 py-3">Status</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {files.map((f) => (
                  <tr key={f.batchId} className="hover:bg-accent/20 transition-colors">
                    <td className="px-4 py-3 font-mono text-xs text-foreground">{f.batchId}</td>
                    <td className="px-4 py-3 text-muted-foreground text-xs">{f.date}</td>
                    <td className="px-4 py-3 text-right tabular-nums text-foreground">{f.journalCount}</td>
                    <td className="px-4 py-3 text-right tabular-nums text-foreground">{f.lineCount}</td>
                    <td className="px-4 py-3 text-right tabular-nums font-semibold text-foreground">{formatUSD(f.totalAmount)}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1 w-32 h-1.5 rounded-full overflow-hidden bg-secondary">
                        <div className="h-full bg-emerald-500" style={{ width: `${f.autoPct}%` }} />
                        <div className="h-full bg-amber-500" style={{ width: `${f.manualPct}%` }} />
                        <div className="h-full bg-destructive" style={{ width: `${f.exceptionPct}%` }} />
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center gap-1 text-[11px] font-medium border rounded-full px-2 py-0.5 ${statusStyles[f.status]}`}>
                        {f.status === "Sent to Bank" && <CheckCircle2 className="h-3 w-3" />}
                        {f.status === "Generating" && <Clock className="h-3 w-3" />}
                        {f.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button className="text-muted-foreground hover:text-foreground">
                        <Download className="h-3.5 w-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
