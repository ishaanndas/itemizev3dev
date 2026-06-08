import { useCallback, useMemo, useState } from "react";
import {
  Sparkles,
  CalendarClock,
  CreditCard,
  Banknote,
  FileCheck,
  Send,
  Filter,
  ChevronDown,
  ChevronRight,
  Check,
  Eye,
  Pause,
  X,
  Landmark,
  Wallet,
  TrendingDown,
  Building2,
  Mail,
  ArrowUpRight,
} from "lucide-react";
import TopBar from "./TopBar";
import { DataTable, DataTableColumn } from "@/components/data-table/DataTable";
import RowActions from "@/components/data-table/RowActions";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";

// ------- Mock data -------
type Method = "ACH" | "Check" | "Wire" | "Card" | "Virtual Card";
type PayStatus = "Ready" | "Scheduled" | "Processing" | "Paid" | "Hold" | "Failed";
type AiSuggestion = "Pay now" | "Schedule" | "Hold" | "Capture discount" | "Batch";

interface Invoice {
  id: string;
  vendor: string;
  vendorEmail: string;
  invoiceNo: string;
  poNo?: string;
  dueDate: string;
  daysToDue: number;
  amount: number;
  discountAmount?: number;
  discountUntil?: string;
  method: Method;
  account: string;
  status: PayStatus;
  aiSuggestion: AiSuggestion;
  aiReason: string;
  confidence: number;
  approver: string;
}

const fmtUSD = (n: number) =>
  n.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 2 });

const invoices: Invoice[] = [
  { id: "1", vendor: "Capitol Building Supply", vendorEmail: "ar@capitolbs.com", invoiceNo: "128267-00", poNo: "PO-2024-0123", dueDate: "Jun 12, 2026", daysToDue: 4, amount: 1544.10, discountAmount: 30.88, discountUntil: "Jun 10", method: "ACH", account: "Operating ··4521", status: "Ready", aiSuggestion: "Capture discount", aiReason: "2% NET10 discount expires in 2 days — save $30.88", confidence: 0.96, approver: "M. Patel" },
  { id: "2", vendor: "Wilson Sonsini Goodrich", vendorEmail: "billing@wsgr.com", invoiceNo: "2362888", dueDate: "Jun 18, 2026", daysToDue: 10, amount: 27_720.00, method: "Wire", account: "Operating ··4521", status: "Ready", aiSuggestion: "Schedule", aiReason: "Optimal pay date: Jun 17 to preserve cash float", confidence: 0.92, approver: "S. Liu" },
  { id: "3", vendor: "Apple", vendorEmail: "ap@apple.com", invoiceNo: "AF32656303", poNo: "PO-2024-0098", dueDate: "Jun 22, 2026", daysToDue: 14, amount: 1_402.29, method: "Virtual Card", account: "Rewards ··9912", status: "Ready", aiSuggestion: "Pay now", aiReason: "Vendor accepts vCard — earn 1.5% rebate ($21.03)", confidence: 0.88, approver: "M. Patel" },
  { id: "4", vendor: "TechPro Inc", vendorEmail: "finance@techpro.io", invoiceNo: "TP-44182", poNo: "PO-2024-0123", dueDate: "Jun 9, 2026", daysToDue: 1, amount: 11_600.69, method: "ACH", account: "Operating ··4521", status: "Ready", aiSuggestion: "Pay now", aiReason: "Due in 1 day — past grace window risks late fee", confidence: 0.99, approver: "M. Patel" },
  { id: "5", vendor: "CloudHost Co", vendorEmail: "ar@cloudhost.co", invoiceNo: "REC-0055", dueDate: "Jun 30, 2026", daysToDue: 22, amount: 17_000.00, method: "ACH", account: "Operating ··4521", status: "Scheduled", aiSuggestion: "Schedule", aiReason: "Scheduled for Jun 28 in Run #248", confidence: 0.95, approver: "S. Liu" },
  { id: "6", vendor: "Office Depot", vendorEmail: "ap@officedepot.com", invoiceNo: "OD-99821", dueDate: "Jun 15, 2026", daysToDue: 7, amount: 3_250.00, method: "Card", account: "Amex ··1003", status: "Processing", aiSuggestion: "Pay now", aiReason: "Card auth submitted to Stripe", confidence: 0.94, approver: "M. Patel" },
  { id: "7", vendor: "Acme Logistics", vendorEmail: "billing@acmelogi.com", invoiceNo: "ACM-77123", dueDate: "Jun 5, 2026", daysToDue: -3, amount: 8_440.00, method: "ACH", account: "Operating ··4521", status: "Hold", aiSuggestion: "Hold", aiReason: "Vendor W-9 on file is stale — refresh before paying", confidence: 0.71, approver: "S. Liu" },
  { id: "8", vendor: "Northwind Traders", vendorEmail: "ar@northwind.com", invoiceNo: "NW-5521", dueDate: "May 28, 2026", daysToDue: -11, amount: 4_215.50, method: "Check", account: "Operating ··4521", status: "Paid", aiSuggestion: "Pay now", aiReason: "Paid via check #10248 on May 27", confidence: 1, approver: "M. Patel" },
  { id: "9", vendor: "Globex Energy", vendorEmail: "ap@globex.energy", invoiceNo: "GLX-2026-04", dueDate: "Jun 20, 2026", daysToDue: 12, amount: 22_300.00, method: "Wire", account: "Operating ··4521", status: "Ready", aiSuggestion: "Batch", aiReason: "Group with 2 other Globex invoices to save $25 in wire fees", confidence: 0.89, approver: "S. Liu" },
  { id: "10", vendor: "Initech Software", vendorEmail: "billing@initech.com", invoiceNo: "INT-9942", dueDate: "Jun 14, 2026", daysToDue: 6, amount: 6_780.40, method: "ACH", account: "Operating ··4521", status: "Failed", aiSuggestion: "Pay now", aiReason: "ACH rejected: invalid routing — confirm bank details", confidence: 0.32, approver: "M. Patel" },
];

const tabs = [
  { key: "queue", label: "Pay queue", count: invoices.filter(i => ["Ready","Hold","Failed"].includes(i.status)).length, desc: "Approved invoices awaiting payment" },
  { key: "scheduled", label: "Scheduled", count: invoices.filter(i => i.status === "Scheduled").length, desc: "Upcoming payment runs" },
  { key: "transactions", label: "Transactions", count: invoices.filter(i => ["Paid","Processing"].includes(i.status)).length, desc: "Sent payments & receipts" },
  { key: "activity", label: "Activity", count: 124, desc: "Full audit log" },
] as const;

type TabKey = typeof tabs[number]["key"];

const methodIcon: Record<Method, JSX.Element> = {
  ACH: <Landmark className="h-3 w-3" />,
  Check: <FileCheck className="h-3 w-3" />,
  Wire: <Send className="h-3 w-3" />,
  Card: <CreditCard className="h-3 w-3" />,
  "Virtual Card": <Wallet className="h-3 w-3" />,
};

const statusStyles: Record<PayStatus, string> = {
  Ready: "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/30",
  Scheduled: "bg-violet-50 text-violet-700 border-violet-200 dark:bg-violet-500/10 dark:text-violet-400 dark:border-violet-500/30",
  Processing: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/30",
  Paid: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/30",
  Hold: "bg-secondary text-foreground/70 border-border",
  Failed: "bg-destructive/10 text-destructive border-destructive/20",
};

const suggestionStyles: Record<AiSuggestion, string> = {
  "Pay now": "text-emerald-700 dark:text-emerald-400",
  "Capture discount": "text-emerald-700 dark:text-emerald-400",
  Schedule: "text-blue-700 dark:text-blue-400",
  Batch: "text-violet-700 dark:text-violet-400",
  Hold: "text-amber-700 dark:text-amber-400",
};

export default function PaymentsContent() {
  const [tab, setTab] = useState<TabKey>("queue");
  const [methodFilter, setMethodFilter] = useState<Method | "All">("All");
  const [selectedRows, setSelectedRows] = useState<Set<number>>(new Set());
  const [runSheetOpen, setRunSheetOpen] = useState(false);

  const tabRows = useMemo(() => {
    if (tab === "queue") return invoices.filter(i => ["Ready","Hold","Failed"].includes(i.status));
    if (tab === "scheduled") return invoices.filter(i => i.status === "Scheduled");
    if (tab === "transactions") return invoices.filter(i => ["Paid","Processing"].includes(i.status));
    return invoices;
  }, [tab]);

  const filtered = methodFilter === "All" ? tabRows : tabRows.filter(i => i.method === methodFilter);

  const toggleRow = useCallback((i: number) => {
    setSelectedRows(prev => {
      const next = new Set(prev);
      next.has(i) ? next.delete(i) : next.add(i);
      return next;
    });
  }, []);

  const toggleAll = useCallback(() => {
    if (selectedRows.size === filtered.length) setSelectedRows(new Set());
    else setSelectedRows(new Set(filtered.map((_, i) => i)));
  }, [selectedRows.size, filtered]);

  const selectedInvoices = Array.from(selectedRows).map(i => filtered[i]).filter(Boolean);
  const selectedTotal = selectedInvoices.reduce((s, i) => s + i.amount, 0);
  const selectedDiscount = selectedInvoices.reduce((s, i) => s + (i.discountAmount ?? 0), 0);

  // AI-recommended payment run
  const aiRecommended = invoices.filter(i =>
    i.status === "Ready" && (i.aiSuggestion === "Pay now" || i.aiSuggestion === "Capture discount"),
  );
  const aiRunTotal = aiRecommended.reduce((s, i) => s + i.amount, 0);
  const aiRunSavings = aiRecommended.reduce((s, i) => s + (i.discountAmount ?? 0), 0);

  const columns: DataTableColumn<Invoice>[] = [
    {
      key: "vendor", label: "Vendor", width: 220,
      render: (r) => (
        <div className="min-w-0">
          <div className="font-medium text-foreground truncate">{r.vendor}</div>
          <div className="text-[11px] text-muted-foreground truncate">{r.vendorEmail}</div>
        </div>
      ),
    },
    {
      key: "invoiceNo", label: "Invoice", width: 150,
      render: (r) => (
        <div className="min-w-0">
          <div className="font-mono text-xs text-foreground">{r.invoiceNo}</div>
          {r.poNo && <div className="text-[11px] text-muted-foreground font-mono">{r.poNo}</div>}
        </div>
      ),
    },
    {
      key: "dueDate", label: "Due", width: 130,
      render: (r) => (
        <div>
          <div className="text-xs text-foreground">{r.dueDate}</div>
          <div className={`text-[11px] ${r.daysToDue < 0 ? "text-destructive font-medium" : r.daysToDue <= 3 ? "text-amber-600 dark:text-amber-400" : "text-muted-foreground"}`}>
            {r.daysToDue < 0 ? `${Math.abs(r.daysToDue)}d overdue` : r.daysToDue === 0 ? "due today" : `in ${r.daysToDue}d`}
          </div>
        </div>
      ),
    },
    {
      key: "amount", label: "Amount", align: "right", width: 140,
      render: (r) => (
        <div className="text-right">
          <div className="font-semibold tabular-nums text-foreground">{fmtUSD(r.amount)}</div>
          {r.discountAmount && (
            <div className="text-[11px] text-emerald-600 dark:text-emerald-400 tabular-nums">
              −{fmtUSD(r.discountAmount)} disc
            </div>
          )}
        </div>
      ),
    },
    {
      key: "method", label: "Method", width: 150,
      render: (r) => (
        <div>
          <span className="inline-flex items-center gap-1 text-[11px] font-medium rounded-full px-2 py-0.5 bg-secondary text-foreground/80 border border-border">
            {methodIcon[r.method]} {r.method}
          </span>
          <div className="text-[11px] text-muted-foreground mt-0.5">{r.account}</div>
        </div>
      ),
    },
    {
      key: "ai", label: "AI suggestion", width: 280,
      render: (r) => (
        <div className="flex items-start gap-1.5 min-w-0">
          <Sparkles className={`h-3 w-3 mt-0.5 shrink-0 ${suggestionStyles[r.aiSuggestion]}`} />
          <div className="min-w-0">
            <div className={`text-xs font-medium ${suggestionStyles[r.aiSuggestion]}`}>
              {r.aiSuggestion}
              <span className="ml-1.5 text-[10px] font-normal text-muted-foreground tabular-nums">
                {Math.round(r.confidence * 100)}%
              </span>
            </div>
            <div className="text-[11px] text-muted-foreground line-clamp-2">{r.aiReason}</div>
          </div>
        </div>
      ),
    },
    {
      key: "approver", label: "Approver", width: 110,
      render: (r) => <span className="text-xs text-foreground/80">{r.approver}</span>,
      defaultVisible: false,
    },
    {
      key: "status", label: "Status", width: 110,
      render: (r) => (
        <span className={`inline-flex text-[11px] font-medium border rounded-full px-2 py-0.5 ${statusStyles[r.status]}`}>
          {r.status}
        </span>
      ),
    },
  ];

  const methodFilters: (Method | "All")[] = ["All", "ACH", "Wire", "Check", "Card", "Virtual Card"];

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-background">
      <TopBar />
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-7xl mx-auto px-6 py-6 min-w-0">
          {/* Header */}
          <div className="flex flex-wrap items-start justify-between gap-3 mb-5">
            <div className="min-w-0">
              <h1 className="text-2xl font-bold text-foreground tracking-tight">Payments</h1>
              <p className="text-sm text-muted-foreground mt-1">
                Pay approved invoices, schedule runs, and monitor activity across your bank and card accounts.
              </p>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <button className="flex items-center gap-1.5 text-sm border border-border rounded-lg px-3 py-2 hover:bg-secondary transition-colors text-foreground">
                <Building2 className="h-3.5 w-3.5" />
                Bank accounts
              </button>
              <button
                onClick={() => setRunSheetOpen(true)}
                className="flex items-center gap-1.5 text-sm font-medium bg-primary text-primary-foreground rounded-lg px-3.5 py-2 hover:opacity-90 transition-opacity"
              >
                <CalendarClock className="h-3.5 w-3.5" />
                Schedule payment run
              </button>
            </div>
          </div>


          {/* AI insight banner */}
          <button
            onClick={() => setRunSheetOpen(true)}
            className="group w-full text-left mb-4 rounded-lg border border-primary/20 bg-gradient-to-r from-primary/5 via-primary/[0.03] to-transparent p-3 hover:border-primary/40 hover:from-primary/10 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
                <Sparkles className="h-4 w-4" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-foreground">
                  AI grouped <span className="tabular-nums">{aiRecommended.length}</span> invoices into a recommended run
                  <span className="ml-2 inline-flex items-center gap-1 text-[10px] font-medium uppercase tracking-wide text-primary bg-primary/10 px-1.5 py-0.5 rounded">
                    Suggested
                  </span>
                </div>
                <div className="text-xs text-muted-foreground mt-0.5">
                  Total <span className="tabular-nums text-foreground font-medium">{fmtUSD(aiRunTotal)}</span> • Capture{" "}
                  <span className="tabular-nums text-emerald-600 dark:text-emerald-400 font-medium">{fmtUSD(aiRunSavings)}</span>{" "}
                  in early-pay discounts • optimized for cash float
                </div>
              </div>
              <div className="flex items-center gap-1 text-sm font-medium text-primary group-hover:gap-1.5 transition-all">
                Review run <ChevronRight className="h-4 w-4" />
              </div>
            </div>
          </button>

          {/* Compact stat row */}
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-3 mb-4">
            <StatTile label="Ready to pay" value={fmtUSD(123_540.18)} sub="42 invoices" accent="text-foreground" />
            <StatTile label="Scheduled" value={fmtUSD(58_200.00)} sub="3 runs" accent="text-violet-600 dark:text-violet-400" />
            <StatTile label="Processing" value={fmtUSD(9_440.69)} sub="6 in flight" accent="text-amber-600 dark:text-amber-400" />
            <StatTile label="Paid (MTD)" value={fmtUSD(412_801.22)} sub="184 payments" accent="text-emerald-600 dark:text-emerald-400" />
            <StatTile label="Discounts captured" value={fmtUSD(3_842.10)} sub="MTD · +$612 vs last" accent="text-emerald-600 dark:text-emerald-400" icon={<TrendingDown className="h-3 w-3" />} />
          </div>


          {/* Tabs */}
          <div className="flex items-center gap-1 border-b border-border mb-4 overflow-x-auto">
            {tabs.map(t => (
              <button
                key={t.key}
                onClick={() => { setTab(t.key); setSelectedRows(new Set()); }}
                className={`relative px-3 py-2 text-sm font-medium whitespace-nowrap transition-colors ${
                  tab === t.key ? "text-foreground" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <span className="flex items-center gap-2">
                  {t.label}
                  <span className={`text-[11px] tabular-nums rounded-full px-1.5 py-0.5 ${tab === t.key ? "bg-primary/10 text-primary" : "bg-secondary text-muted-foreground"}`}>
                    {t.count}
                  </span>
                </span>
                {tab === t.key && <span className="absolute inset-x-0 -bottom-px h-0.5 bg-primary" />}
              </button>
            ))}
          </div>

          {/* Filter pills */}
          <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
            <div className="flex flex-wrap items-center gap-1 bg-secondary/60 border border-border rounded-lg p-1">
              {methodFilters.map(f => (
                <button
                  key={f}
                  onClick={() => setMethodFilter(f)}
                  className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                    methodFilter === f ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <button className="flex items-center gap-1.5 text-sm border border-border rounded-lg px-3 py-1.5 hover:bg-secondary transition-colors text-foreground">
                <Filter className="h-3.5 w-3.5" />
                Approver
                <ChevronDown className="h-3 w-3" />
              </button>
              <button className="flex items-center gap-1.5 text-sm border border-border rounded-lg px-3 py-1.5 hover:bg-secondary transition-colors text-foreground">
                <Filter className="h-3.5 w-3.5" />
                Due window
                <ChevronDown className="h-3 w-3" />
              </button>
            </div>
          </div>


          {tab === "transactions" ? (
            <TransactionsView />
          ) : tab === "activity" ? (
            <ActivityView />
          ) : (
            <DataTable<Invoice>
              storageKey="ap-payments"
              columns={columns}
              data={filtered}
              rowKey={(i) => i.id}
              selectable
              searchable
              searchPlaceholder="Search vendor, invoice, PO…"
              selectedRows={selectedRows}
              onToggleRow={toggleRow}
              onToggleAll={toggleAll}
              toolbarLeft={
                selectedRows.size > 0 ? (
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">
                      {selectedRows.size} selected · <span className="font-semibold text-foreground tabular-nums">{fmtUSD(selectedTotal)}</span>
                      {selectedDiscount > 0 && (
                        <span className="text-emerald-600 dark:text-emerald-400 ml-1">
                          (capture {fmtUSD(selectedDiscount)})
                        </span>
                      )}
                    </span>
                    <button
                      onClick={() => setRunSheetOpen(true)}
                      className="text-xs font-medium px-3 py-1.5 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors flex items-center gap-1.5"
                    >
                      <Send className="h-3 w-3" /> Pay {selectedRows.size}
                    </button>
                    <button className="text-xs font-medium px-3 py-1.5 rounded-md border border-border hover:bg-secondary transition-colors flex items-center gap-1.5">
                      <CalendarClock className="h-3 w-3" /> Schedule
                    </button>
                    <button className="text-xs font-medium px-3 py-1.5 rounded-md border border-border hover:bg-secondary transition-colors flex items-center gap-1.5">
                      <Pause className="h-3 w-3" /> Hold
                    </button>
                  </div>
                ) : null
              }
              renderRowActions={(r) => (
                <RowActions
                  review={{ label: "View", onClick: () => {}, icon: <Eye className="h-3.5 w-3.5" /> }}
                  primary={{
                    label: r.status === "Failed" ? "Retry" : "Pay",
                    onClick: () => setRunSheetOpen(true),
                    icon: <Check className="h-3.5 w-3.5" />,
                  }}
                  more={[
                    { label: "Schedule", onClick: () => {}, icon: <CalendarClock className="h-3.5 w-3.5" /> },
                    { label: "Send remittance", onClick: () => {}, icon: <Mail className="h-3.5 w-3.5" /> },
                    { label: "Mark paid externally", onClick: () => {}, icon: <FileCheck className="h-3.5 w-3.5" /> },
                    { label: "Place on hold", onClick: () => {}, icon: <Pause className="h-3.5 w-3.5" />, destructive: true },
                  ]}
                />
              )}
            />
          )}

        </div>
      </div>

      {/* Side popout sheet for AI-recommended run */}
      <Sheet open={runSheetOpen} onOpenChange={setRunSheetOpen}>
        <SheetContent side="right" className="w-full sm:max-w-xl overflow-y-auto">
          <SheetHeader className="space-y-2 pb-4 border-b">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1 text-[10px] font-medium uppercase tracking-wide text-primary bg-primary/10 px-1.5 py-0.5 rounded">
                <Sparkles className="h-3 w-3" /> AI suggested
              </span>
              <span className="text-[11px] text-muted-foreground">Run #249 · auto-generated</span>
            </div>
            <SheetTitle>Pay run · {aiRecommended.length} invoices</SheetTitle>
            <SheetDescription>
              Optimized to capture early-pay discounts and preserve cash float through the next forecast window.
            </SheetDescription>
          </SheetHeader>

          {/* Summary */}
          <div className="grid grid-cols-3 gap-2 py-4">
            <RunStat label="Total" value={fmtUSD(aiRunTotal)} />
            <RunStat label="Discounts" value={fmtUSD(aiRunSavings)} accent="text-emerald-600 dark:text-emerald-400" />
            <RunStat label="Funding date" value="Jun 9" sub="ACH cutoff 5 PM" />
          </div>

          {/* From account */}
          <div className="rounded-md border border-border p-3 mb-4">
            <div className="text-[11px] uppercase tracking-wide text-muted-foreground mb-1">Funding account</div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Landmark className="h-4 w-4 text-muted-foreground" />
                <div>
                  <div className="text-sm font-medium text-foreground">SVB Operating ··4521</div>
                  <div className="text-[11px] text-muted-foreground">Available: <span className="tabular-nums">$1,284,012.55</span></div>
                </div>
              </div>
              <button className="text-xs text-primary font-medium hover:underline">Change</button>
            </div>
          </div>

          {/* Line items */}
          <div className="space-y-1.5 mb-4">
            <div className="flex items-center justify-between text-[11px] uppercase tracking-wide text-muted-foreground mb-1">
              <span>Invoices in this run</span>
              <button className="text-primary hover:underline normal-case tracking-normal">Add invoice</button>
            </div>
            {aiRecommended.map((r) => (
              <div key={r.id} className="flex items-center gap-2 rounded-md border border-border px-3 py-2 hover:bg-secondary/40 transition-colors">
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-foreground truncate">{r.vendor}</div>
                  <div className="text-[11px] text-muted-foreground font-mono truncate">{r.invoiceNo} · {r.method}</div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-semibold tabular-nums text-foreground">{fmtUSD(r.amount)}</div>
                  {r.discountAmount && (
                    <div className="text-[11px] tabular-nums text-emerald-600 dark:text-emerald-400">−{fmtUSD(r.discountAmount)}</div>
                  )}
                </div>
                <button className="text-muted-foreground hover:text-foreground p-1" title="Remove">
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
          </div>

          {/* AI explanation */}
          <div className="rounded-md border border-primary/20 bg-primary/5 p-3 mb-4">
            <div className="flex items-start gap-2">
              <Sparkles className="h-3.5 w-3.5 text-primary mt-0.5 shrink-0" />
              <div className="text-xs text-foreground/80 leading-relaxed">
                <span className="font-medium text-foreground">Why this run.</span> Capitol BS NET10 discount expires Jun 10. TechPro is due Jun 9 with no grace. Apple accepts virtual card so we route through the rewards account for a 1.5% rebate. Globex is held back to batch with two later invoices.
                <button className="ml-1 text-primary hover:underline font-medium">See details</button>
              </div>
            </div>
          </div>

          {/* Footer actions */}
          <div className="sticky bottom-0 -mx-6 -mb-6 px-6 py-3 border-t bg-background flex items-center justify-between">
            <button className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1">
              <ArrowUpRight className="h-3.5 w-3.5" /> Export remittance
            </button>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setRunSheetOpen(false)}
                className="text-sm font-medium px-3 py-2 rounded-md border border-border hover:bg-secondary transition-colors"
              >
                Save as draft
              </button>
              <button
                onClick={() => setRunSheetOpen(false)}
                className="text-sm font-medium px-4 py-2 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors flex items-center gap-1.5"
              >
                <Banknote className="h-3.5 w-3.5" />
                Approve & send
              </button>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}

function StatTile({
  label,
  value,
  sub,
  accent,
  icon,
}: {
  label: string;
  value: string;
  sub?: string;
  accent?: string;
  icon?: JSX.Element;
}) {
  return (
    <div className="rounded-lg border border-border bg-card px-3 py-2.5">
      <div className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide">{label}</div>
      <div className={`text-lg font-bold tabular-nums mt-0.5 ${accent ?? "text-foreground"}`}>{value}</div>
      {sub && (
        <div className="text-[11px] text-muted-foreground flex items-center gap-1 mt-0.5">
          {icon}
          {sub}
        </div>
      )}
    </div>
  );
}

function RunStat({ label, value, sub, accent }: { label: string; value: string; sub?: string; accent?: string }) {
  return (
    <div className="rounded-md border border-border bg-card px-3 py-2">
      <div className="text-[10px] uppercase tracking-wide text-muted-foreground">{label}</div>
      <div className={`text-sm font-semibold tabular-nums mt-0.5 ${accent ?? "text-foreground"}`}>{value}</div>
      {sub && <div className="text-[10px] text-muted-foreground mt-0.5">{sub}</div>}
    </div>
  );
}
