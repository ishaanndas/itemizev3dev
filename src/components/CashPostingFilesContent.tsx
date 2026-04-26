import { Download, FileSpreadsheet, Clock, CheckCircle2, ScrollText, Eye } from "lucide-react";
import TopBar from "./TopBar";
import { formatUSD } from "./cash/data";
import { ConfidenceBadge, type Confidence } from "./cash/confidence";
import { DataTable, DataTableColumn } from "@/components/data-table/DataTable";
import RowActions from "@/components/data-table/RowActions";

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

const glColumns: DataTableColumn<JournalLine>[] = [
  { key: "journalId", label: "Journal", accessor: (l) => l.journalId, render: (l) => <span className="font-mono text-xs text-foreground">{l.journalId}</span>, width: 110 },
  { key: "line", label: "Ln", accessor: (l) => String(l.line), align: "right", render: (l) => <span className="text-muted-foreground">{l.line}</span>, width: 60 },
  { key: "customerId", label: "Customer", accessor: (l) => l.customerId, render: (l) => <span className="font-mono text-xs text-muted-foreground">{l.customerId}</span>, width: 120 },
  { key: "invoice", label: "Invoice", accessor: (l) => l.invoice, render: (l) => <span className="font-mono text-xs text-foreground">{l.invoice}</span>, width: 110 },
  { key: "account", label: "Account", accessor: (l) => l.account, render: (l) => <span className="text-foreground">{l.account}</span>, width: 180 },
  { key: "debit", label: "Debit", accessor: (l) => (l.debit > 0 ? formatUSD(l.debit) : "—"), align: "right", render: (l) => <span className="tabular-nums text-foreground">{l.debit > 0 ? formatUSD(l.debit) : "—"}</span>, width: 120 },
  { key: "credit", label: "Credit", accessor: (l) => (l.credit > 0 ? formatUSD(l.credit) : "—"), align: "right", render: (l) => <span className="tabular-nums text-foreground">{l.credit > 0 ? formatUSD(l.credit) : "—"}</span>, width: 120 },
  { key: "description", label: "Description", accessor: (l) => l.description, render: (l) => <span className="text-muted-foreground truncate">{l.description}</span>, width: 220 },
  { key: "match", label: "Match", accessor: (l) => `${Math.round(l.confidenceScore * 100)}%`, render: (l) => <ConfidenceBadge level={l.confidenceFlag} score={l.confidenceScore} />, width: 130 },
];

const historyColumns: DataTableColumn<PostingFile>[] = [
  { key: "batchId", label: "Batch ID", accessor: (f) => f.batchId, render: (f) => <span className="font-mono text-xs text-foreground">{f.batchId}</span>, width: 170 },
  { key: "date", label: "Date", accessor: (f) => f.date, render: (f) => <span className="text-muted-foreground text-xs">{f.date}</span>, width: 120 },
  { key: "journalCount", label: "Journals", accessor: (f) => String(f.journalCount), align: "right", render: (f) => <span className="tabular-nums text-foreground">{f.journalCount}</span>, width: 100 },
  { key: "lineCount", label: "Lines", accessor: (f) => String(f.lineCount), align: "right", render: (f) => <span className="tabular-nums text-foreground">{f.lineCount}</span>, width: 90 },
  { key: "totalAmount", label: "Total", accessor: (f) => formatUSD(f.totalAmount), align: "right", render: (f) => <span className="tabular-nums font-semibold text-foreground">{formatUSD(f.totalAmount)}</span>, width: 140 },
  {
    key: "composition",
    label: "Composition",
    accessor: (f) => `${f.autoPct}/${f.manualPct}/${f.exceptionPct}`,
    render: (f) => (
      <div className="flex items-center gap-1 w-32 h-1.5 rounded-full overflow-hidden bg-secondary">
        <div className="h-full bg-emerald-500" style={{ width: `${f.autoPct}%` }} />
        <div className="h-full bg-amber-500" style={{ width: `${f.manualPct}%` }} />
        <div className="h-full bg-destructive" style={{ width: `${f.exceptionPct}%` }} />
      </div>
    ),
    width: 160,
  },
  {
    key: "status",
    label: "Status",
    accessor: (f) => f.status,
    render: (f) => (
      <span className={`inline-flex items-center gap-1 text-[11px] font-medium border rounded-full px-2 py-0.5 ${statusStyles[f.status]}`}>
        {f.status === "Sent to Bank" && <CheckCircle2 className="h-3 w-3" />}
        {f.status === "Generating" && <Clock className="h-3 w-3" />}
        {f.status}
      </span>
    ),
    width: 160,
  },
];

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
          <div className="mb-6">
            <div className="flex items-center justify-between mb-3">
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
            <DataTable<JournalLine>
              storageKey="cash-gl-preview"
              columns={glColumns}
              data={previewLines}
              rowKey={(l, i) => `${l.journalId}-${l.line}-${i}`}
            />
          </div>

          {/* History */}
          <h3 className="text-sm font-semibold text-foreground mb-3">History</h3>
          <DataTable<PostingFile>
            storageKey="cash-posting-history"
            columns={historyColumns}
            data={files}
            rowKey={(f) => f.batchId}
            renderRowActions={(f) => (
              <RowActions
                review={{ label: "View batch", onClick: () => {}, icon: <Eye className="h-3.5 w-3.5" /> }}
                primary={{ label: "Download", onClick: () => {}, icon: <Download className="h-3.5 w-3.5" /> }}
              />
            )}
          />
        </div>
      </div>
    </div>
  );
}
