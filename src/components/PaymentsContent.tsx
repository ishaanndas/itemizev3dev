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
import FilterDropdown from "@/components/data-table/FilterDropdown";
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
  const [approverFilter, setApproverFilter] = useState<string>("All approvers");
  const [dueWindowFilter, setDueWindowFilter] = useState<string>("Any time");
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
          <div className="text-xs text-muted-foreground truncate">{r.vendorEmail}</div>
        </div>
      ),
    },
    {
      key: "invoiceNo", label: "Invoice", width: 150,
      render: (r) => (
        <div className="min-w-0">
          <div className="font-mono text-xs text-foreground">{r.invoiceNo}</div>
          {r.poNo && <div className="text-xs text-muted-foreground font-mono">{r.poNo}</div>}
        </div>
      ),
    },
    {
      key: "dueDate", label: "Due", width: 130,
      render: (r) => (
        <div>
          <div className="text-xs text-foreground">{r.dueDate}</div>
          <div className={`text-xs ${r.daysToDue < 0 ? "text-destructive font-medium" : r.daysToDue <= 3 ? "text-amber-600 dark:text-amber-400" : "text-muted-foreground"}`}>
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
            <div className="text-xs text-emerald-600 dark:text-emerald-400 tabular-nums">
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
          <span className="inline-flex items-center gap-1 text-xs font-medium rounded-full px-2 py-0.5 bg-secondary text-foreground/80 border border-border">
            {methodIcon[r.method]} {r.method}
          </span>
          <div className="text-xs text-muted-foreground mt-0.5">{r.account}</div>
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
              <span className="ml-1.5 text-xs font-normal text-muted-foreground tabular-nums">
                {Math.round(r.confidence * 100)}%
              </span>
            </div>
            <div className="text-xs text-muted-foreground line-clamp-2">{r.aiReason}</div>
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
        <span className={`inline-flex text-xs font-medium border rounded-full px-2 py-0.5 ${statusStyles[r.status]}`}>
          {r.status}
        </span>
      ),
    },
  ];

  const methodFilters: (Method | "All")[] = ["All", "ACH", "Wire", "Check", "Card", "Virtual Card"];

  return (
    <div className="flex-1 flex flex-col min-h-0 min-w-0 bg-background">
      <TopBar />
      <div className="flex-1 overflow-y-auto overflow-x-hidden min-w-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 min-w-0">

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
                  <span className="ml-2 inline-flex items-center gap-1 text-xs font-medium uppercase tracking-wide text-primary bg-primary/10 px-1.5 py-0.5 rounded">
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
                  <span className={`text-xs tabular-nums rounded-full px-1.5 py-0.5 ${tab === t.key ? "bg-primary/10 text-primary" : "bg-secondary text-muted-foreground"}`}>
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
                  className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${
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
                    <span className="text-sm text-muted-foreground">
                      {selectedRows.size} selected · <span className="font-semibold text-foreground tabular-nums">{fmtUSD(selectedTotal)}</span>
                      {selectedDiscount > 0 && (
                        <span className="text-emerald-600 dark:text-emerald-400 ml-1">
                          (capture {fmtUSD(selectedDiscount)})
                        </span>
                      )}
                    </span>
                    <button
                      onClick={() => setRunSheetOpen(true)}
                      className="text-sm font-medium px-3 py-1.5 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors flex items-center gap-1.5"
                    >
                      <Send className="h-3 w-3" /> Pay {selectedRows.size}
                    </button>
                    <button className="text-sm font-medium px-3 py-1.5 rounded-md border border-border hover:bg-secondary transition-colors flex items-center gap-1.5">
                      <CalendarClock className="h-3 w-3" /> Schedule
                    </button>
                    <button className="text-sm font-medium px-3 py-1.5 rounded-md border border-border hover:bg-secondary transition-colors flex items-center gap-1.5">
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
              <span className="inline-flex items-center gap-1 text-xs font-medium uppercase tracking-wide text-primary bg-primary/10 px-1.5 py-0.5 rounded">
                <Sparkles className="h-3 w-3" /> AI suggested
              </span>
              <span className="text-xs text-muted-foreground">Run #249 · auto-generated</span>
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
            <div className="text-xs uppercase tracking-wide text-muted-foreground mb-1">Funding account</div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Landmark className="h-4 w-4 text-muted-foreground" />
                <div>
                  <div className="text-sm font-medium text-foreground">SVB Operating ··4521</div>
                  <div className="text-xs text-muted-foreground">Available: <span className="tabular-nums">$1,284,012.55</span></div>
                </div>
              </div>
              <button className="text-xs text-primary font-medium hover:underline">Change</button>
            </div>
          </div>

          {/* Line items */}
          <div className="space-y-1.5 mb-4">
            <div className="flex items-center justify-between text-xs uppercase tracking-wide text-muted-foreground mb-1">
              <span>Invoices in this run</span>
              <button className="text-primary hover:underline normal-case tracking-normal">Add invoice</button>
            </div>
            {aiRecommended.map((r) => (
              <div key={r.id} className="flex items-center gap-2 rounded-md border border-border px-3 py-2 hover:bg-secondary/40 transition-colors">
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-foreground truncate">{r.vendor}</div>
                  <div className="text-xs text-muted-foreground font-mono truncate">{r.invoiceNo} · {r.method}</div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-semibold tabular-nums text-foreground">{fmtUSD(r.amount)}</div>
                  {r.discountAmount && (
                    <div className="text-xs tabular-nums text-emerald-600 dark:text-emerald-400">−{fmtUSD(r.discountAmount)}</div>
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
      <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{label}</div>
      <div className={`text-lg font-bold tabular-nums mt-0.5 ${accent ?? "text-foreground"}`}>{value}</div>
      {sub && (
        <div className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
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
      <div className="text-xs uppercase tracking-wide text-muted-foreground">{label}</div>
      <div className={`text-sm font-semibold tabular-nums mt-0.5 ${accent ?? "text-foreground"}`}>{value}</div>
      {sub && <div className="text-xs text-muted-foreground mt-0.5">{sub}</div>}
    </div>
  );
}

// =================== Transactions tab ===================

type TxStatus = "Settled" | "In flight" | "Failed" | "Voided" | "Returned";

interface Transaction {
  id: string;
  txId: string;
  vendor: string;
  amount: number;
  fee: number;
  method: Method;
  account: string;
  reference: string;
  rail: string;
  initiated: string;
  settled?: string;
  status: TxStatus;
  invoices: number;
  aiNote?: string;
}

const transactions: Transaction[] = [
  { id: "t1", txId: "tx_8a3kf02", vendor: "Capitol Building Supply", amount: 1513.22, fee: 0.25, method: "ACH", account: "Operating ··4521", reference: "REM-2026-0612", rail: "ACH · Same-day", initiated: "Jun 8, 9:14 AM", settled: "Jun 8, 3:02 PM", status: "Settled", invoices: 1, aiNote: "Discount captured: $30.88" },
  { id: "t2", txId: "tx_8a3kf03", vendor: "Apple", amount: 1402.29, fee: 0, method: "Virtual Card", account: "Rewards ··9912", reference: "vcc_44291", rail: "Mastercard vCard", initiated: "Jun 8, 9:14 AM", settled: "Jun 8, 9:18 AM", status: "Settled", invoices: 1, aiNote: "Rebate earned: $21.03" },
  { id: "t3", txId: "tx_8a3kf04", vendor: "TechPro Inc", amount: 11600.69, fee: 0.25, method: "ACH", account: "Operating ··4521", reference: "REM-2026-0609", rail: "ACH · Next-day", initiated: "Jun 8, 9:14 AM", status: "In flight", invoices: 1 },
  { id: "t4", txId: "tx_8a3kf05", vendor: "Office Depot", amount: 3250.00, fee: 96.13, method: "Card", account: "Amex ··1003", reference: "stripe_ch_3Nq2", rail: "Stripe", initiated: "Jun 8, 9:15 AM", status: "In flight", invoices: 1 },
  { id: "t5", txId: "tx_8a3kez9", vendor: "Initech Software", amount: 6780.40, fee: 0, method: "ACH", account: "Operating ··4521", reference: "—", rail: "ACH · Next-day", initiated: "Jun 7, 5:01 PM", status: "Failed", invoices: 1, aiNote: "R03 · Invalid routing — vendor record updated by AI, ready to retry" },
  { id: "t6", txId: "tx_8a3kex2", vendor: "Northwind Traders", amount: 4215.50, fee: 1.50, method: "Check", account: "Operating ··4521", reference: "chk #10248", rail: "Check · Mailed", initiated: "May 27, 11:02 AM", settled: "Jun 2, 8:30 AM", status: "Settled", invoices: 1 },
  { id: "t7", txId: "tx_8a3kew8", vendor: "Wilson Sonsini Goodrich", amount: 27720.00, fee: 15.00, method: "Wire", account: "Operating ··4521", reference: "FED-44120893", rail: "FedWire", initiated: "Jun 6, 2:14 PM", settled: "Jun 6, 2:31 PM", status: "Settled", invoices: 1 },
  { id: "t8", txId: "tx_8a3kev1", vendor: "Stale Vendor LLC", amount: 990.00, fee: 0.25, method: "ACH", account: "Operating ··4521", reference: "REM-2026-0531", rail: "ACH · Next-day", initiated: "May 31, 10:00 AM", settled: "Jun 3, 9:00 AM", status: "Returned", invoices: 1, aiNote: "R01 · Insufficient funds at receiving bank" },
  { id: "t9", txId: "tx_8a3keu5", vendor: "Duplicate Charge Co", amount: 480.00, fee: 0.25, method: "ACH", account: "Operating ··4521", reference: "—", rail: "ACH · Same-day", initiated: "Jun 4, 1:00 PM", status: "Voided", invoices: 1, aiNote: "AI flagged duplicate of tx_8a3keu4 and voided automatically" },
];

const txStatusStyles: Record<TxStatus, string> = {
  Settled: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/30",
  "In flight": "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/30",
  Failed: "bg-destructive/10 text-destructive border-destructive/20",
  Voided: "bg-secondary text-foreground/60 border-border",
  Returned: "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-500/10 dark:text-rose-400 dark:border-rose-500/30",
};

function TransactionsView() {
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [statusFilter, setStatusFilter] = useState<TxStatus | "All">("All");


  const toggleRow = (i: number) => {
    setSelected((p) => {
      const n = new Set(p);
      n.has(i) ? n.delete(i) : n.add(i);
      return n;
    });
  };
  const toggleAll = () => {
    if (selected.size === transactions.length) setSelected(new Set());
    else setSelected(new Set(transactions.map((_, i) => i)));
  };

  const failedCount = transactions.filter((t) => t.status === "Failed").length;
  const totalSettled = transactions.filter((t) => t.status === "Settled").reduce((s, t) => s + t.amount, 0);
  const totalFees = transactions.reduce((s, t) => s + t.fee, 0);

  const columns: DataTableColumn<Transaction>[] = [
    {
      key: "txId", label: "Transaction", width: 200,
      render: (r) => (
        <div className="min-w-0">
          <div className="font-mono text-xs text-foreground">{r.txId}</div>
          <div className="text-xs text-muted-foreground truncate">{r.rail}</div>
        </div>
      ),
    },
    {
      key: "vendor", label: "Vendor", width: 200,
      render: (r) => (
        <div className="min-w-0">
          <div className="font-medium text-foreground truncate">{r.vendor}</div>
          <div className="text-xs text-muted-foreground">{r.invoices} invoice{r.invoices === 1 ? "" : "s"}</div>
        </div>
      ),
    },
    {
      key: "amount", label: "Amount", align: "right", width: 130,
      render: (r) => (
        <div className="text-right">
          <div className="font-semibold tabular-nums text-foreground">{fmtUSD(r.amount)}</div>
          {r.fee > 0 && <div className="text-xs text-muted-foreground tabular-nums">fee {fmtUSD(r.fee)}</div>}
        </div>
      ),
    },
    {
      key: "method", label: "Method", width: 150,
      render: (r) => (
        <div>
          <span className="inline-flex items-center gap-1 text-xs font-medium rounded-full px-2 py-0.5 bg-secondary text-foreground/80 border border-border">
            {methodIcon[r.method]} {r.method}
          </span>
          <div className="text-xs text-muted-foreground mt-0.5">{r.account}</div>
        </div>
      ),
    },
    {
      key: "reference", label: "Reference", width: 160,
      render: (r) => <span className="font-mono text-xs text-foreground/70">{r.reference}</span>,
    },
    {
      key: "initiated", label: "Initiated", width: 140,
      render: (r) => <span className="text-xs text-foreground/80">{r.initiated}</span>,
    },
    {
      key: "settled", label: "Settled", width: 140,
      render: (r) => <span className="text-xs text-foreground/80">{r.settled ?? "—"}</span>,
    },
    {
      key: "status", label: "Status", width: 200,
      render: (r) => (
        <div className="min-w-0">
          <span className={`inline-flex text-xs font-medium border rounded-full px-2 py-0.5 ${txStatusStyles[r.status]}`}>
            {r.status}
          </span>
          {r.aiNote && (
            <div className="flex items-start gap-1 mt-1">
              <Sparkles className="h-2.5 w-2.5 text-primary mt-0.5 shrink-0" />
              <span className="text-xs text-muted-foreground line-clamp-2">{r.aiNote}</span>
            </div>
          )}
        </div>
      ),
    },
  ];

  return (
    <div>
      {failedCount > 0 && (
        <div className="mb-3 rounded-lg border border-destructive/20 bg-destructive/5 p-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 min-w-0">
            <Sparkles className="h-4 w-4 text-destructive shrink-0" />
            <div className="min-w-0">
              <div className="text-sm font-medium text-foreground">
                {failedCount} failed payment{failedCount === 1 ? "" : "s"} ready for retry
              </div>
              <div className="text-xs text-muted-foreground">AI updated vendor banking and validated routing for {failedCount} record{failedCount === 1 ? "" : "s"}.</div>
            </div>
          </div>
          <button className="text-sm font-medium px-3 py-1.5 rounded-md bg-destructive text-destructive-foreground hover:opacity-90 transition-opacity flex items-center gap-1.5 shrink-0">
            <RefreshIcon /> Retry all
          </button>
        </div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
        <RunStat label="Settled (MTD)" value={fmtUSD(totalSettled)} sub={`${transactions.filter(t=>t.status==="Settled").length} payments`} accent="text-emerald-600 dark:text-emerald-400" />
        <RunStat label="In flight" value={String(transactions.filter(t=>t.status==="In flight").length)} sub="ACH / card / wire" accent="text-amber-600 dark:text-amber-400" />
        <RunStat label="Failed / returned" value={String(transactions.filter(t=>["Failed","Returned"].includes(t.status)).length)} sub="needs attention" accent="text-destructive" />
        <RunStat label="Fees (MTD)" value={fmtUSD(totalFees)} sub="rebates +$21.03" />
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
        <div className="flex flex-wrap items-center gap-1 bg-secondary/60 border border-border rounded-lg p-1">
          {(["All","Settled","In flight","Failed","Returned","Voided"] as const).map((s) => {
            const count = s === "All" ? transactions.length : transactions.filter((t) => t.status === s).length;
            return (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`px-3 py-1 text-sm font-medium rounded-md transition-colors inline-flex items-center gap-1.5 ${
                  statusFilter === s ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {s}
                <span className="text-xs tabular-nums opacity-70">{count}</span>
              </button>
            );
          })}
        </div>
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-1.5 text-sm border border-border rounded-lg px-3 py-1.5 hover:bg-secondary transition-colors text-foreground">
            <Filter className="h-3.5 w-3.5" /> Account <ChevronDown className="h-3 w-3" />
          </button>
          <button className="flex items-center gap-1.5 text-sm border border-border rounded-lg px-3 py-1.5 hover:bg-secondary transition-colors text-foreground">
            <RefreshIcon /> Sync now
          </button>
        </div>
      </div>

      <DataTable<Transaction>
        storageKey="ap-payments-transactions"
        columns={columns}
        data={statusFilter === "All" ? transactions : transactions.filter((t) => t.status === statusFilter)}
        rowKey={(t) => t.id}

        selectable
        searchable
        searchPlaceholder="Search by tx id, vendor, reference…"
        selectedRows={selected}
        onToggleRow={toggleRow}
        onToggleAll={toggleAll}
        toolbarLeft={
          selected.size > 0 ? (
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">{selected.size} selected</span>
              <button className="text-sm font-medium px-3 py-1.5 rounded-md border border-border hover:bg-secondary transition-colors flex items-center gap-1.5">
                <RefreshIcon /> Retry
              </button>
              <button className="text-sm font-medium px-3 py-1.5 rounded-md border border-border hover:bg-secondary transition-colors flex items-center gap-1.5">
                <RefreshIcon /> Sync
              </button>
              <button className="text-sm font-medium px-3 py-1.5 rounded-md border border-destructive/30 text-destructive hover:bg-destructive/10 transition-colors flex items-center gap-1.5">
                <X className="h-3 w-3" /> Void
              </button>
            </div>
          ) : null
        }
        renderRowActions={(r) => (
          <RowActions
            review={{ label: "View", onClick: () => {}, icon: <Eye className="h-3.5 w-3.5" /> }}
            primary={
              r.status === "Failed"
                ? { label: "Retry", onClick: () => {}, icon: <Check className="h-3.5 w-3.5" /> }
                : { label: "Receipt", onClick: () => {}, icon: <FileCheck className="h-3.5 w-3.5" /> }
            }
            more={[
              { label: "Send remittance", onClick: () => {}, icon: <Mail className="h-3.5 w-3.5" /> },
              { label: "Sync to ledger", onClick: () => {} },
              { label: "Void transaction", onClick: () => {}, icon: <X className="h-3.5 w-3.5" />, destructive: true },
            ]}
          />
        )}
      />
    </div>
  );
}

// =================== Activity tab ===================

type ActivityKind = "payment" | "approval" | "ai" | "sync" | "vendor" | "system";

interface ActivityEvent {
  id: string;
  at: string;
  date: string;
  actor: string;
  actorRole: string;
  kind: ActivityKind;
  message: string;
  detail?: string;
  source: "Itemize" | "AI" | "Bank" | "ERP";
  ref?: string;
}

const activityEvents: ActivityEvent[] = [
  { id: "a1", at: "9:18 AM", date: "Jun 8, 2026", actor: "AI Agent", actorRole: "Auto-policy", kind: "ai", source: "AI", message: "Captured early-pay discount on Capitol Building Supply", detail: "Routed via ACH same-day to lock in 2% NET10 ($30.88 saved). Confidence 96%.", ref: "tx_8a3kf02" },
  { id: "a2", at: "9:15 AM", date: "Jun 8, 2026", actor: "Maya Patel", actorRole: "Controller", kind: "approval", source: "Itemize", message: "Approved pay run #248 · 3 invoices · $14,547.00", ref: "run_248" },
  { id: "a3", at: "9:14 AM", date: "Jun 8, 2026", actor: "AI Agent", actorRole: "Run optimizer", kind: "ai", source: "AI", message: "Generated suggested pay run", detail: "Grouped 3 invoices into run #248 to capture $30.88 in discounts and preserve $11.6K cash float through Jun 14.", ref: "run_248" },
  { id: "a4", at: "8:42 AM", date: "Jun 8, 2026", actor: "Bank Webhook", actorRole: "SVB", kind: "payment", source: "Bank", message: "ACH settled · Capitol Building Supply $1,513.22", ref: "tx_8a3kf02" },
  { id: "a5", at: "5:32 PM", date: "Jun 7, 2026", actor: "System", actorRole: "Sync", kind: "sync", source: "ERP", message: "Pushed 18 payments to NetSuite GL", detail: "Journal entries posted to account 2010 — Accounts Payable.", ref: "sync_18221" },
  { id: "a6", at: "5:01 PM", date: "Jun 7, 2026", actor: "Initech Software", actorRole: "Vendor record", kind: "vendor", source: "AI", message: "AI auto-corrected routing number from W-9 update", detail: "Detected R03 reject on tx_8a3kez9 → matched corrected ABA from latest W-9 form ingested Jun 6.", ref: "vendor_44" },
  { id: "a7", at: "3:14 PM", date: "Jun 7, 2026", actor: "Sam Liu", actorRole: "AP Manager", kind: "approval", source: "Itemize", message: "Placed Acme Logistics invoice on hold pending W-9 refresh", ref: "inv_ACM-77123" },
  { id: "a8", at: "1:00 PM", date: "Jun 4, 2026", actor: "AI Agent", actorRole: "Duplicate guard", kind: "ai", source: "AI", message: "Voided duplicate ACH to Duplicate Charge Co", detail: "Matched 99.4% to tx_8a3keu4 sent 3 min earlier. Auto-void executed per policy.", ref: "tx_8a3keu5" },
  { id: "a9", at: "11:02 AM", date: "May 27, 2026", actor: "Maya Patel", actorRole: "Controller", kind: "payment", source: "Itemize", message: "Issued check #10248 to Northwind Traders", ref: "tx_8a3kex2" },
];

const activityKindMeta: Record<ActivityKind, { icon: JSX.Element; color: string; bg: string; label: string }> = {
  ai: { icon: <Sparkles className="h-3 w-3" />, color: "text-primary", bg: "bg-primary/10", label: "AI" },
  payment: { icon: <Banknote className="h-3 w-3" />, color: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-500/10", label: "Payment" },
  approval: { icon: <Check className="h-3 w-3" />, color: "text-blue-600 dark:text-blue-400", bg: "bg-blue-500/10", label: "Approval" },
  sync: { icon: <ArrowUpRight className="h-3 w-3" />, color: "text-violet-600 dark:text-violet-400", bg: "bg-violet-500/10", label: "Sync" },
  vendor: { icon: <Building2 className="h-3 w-3" />, color: "text-amber-600 dark:text-amber-400", bg: "bg-amber-500/10", label: "Vendor" },
  system: { icon: <RefreshIcon />, color: "text-muted-foreground", bg: "bg-secondary", label: "System" },
};

function ActivityView() {
  const [vendorQ, setVendorQ] = useState("");
  const [txIdQ, setTxIdQ] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [action, setAction] = useState<ActivityKind | "all">("all");
  const [source, setSource] = useState<"all" | ActivityEvent["source"]>("all");
  const [search, setSearch] = useState("");

  const filtered = activityEvents.filter((e) => {
    const q = search.toLowerCase();
    return (
      (action === "all" || e.kind === action) &&
      (source === "all" || e.source === source) &&
      (!vendorQ || e.message.toLowerCase().includes(vendorQ.toLowerCase()) || e.actor.toLowerCase().includes(vendorQ.toLowerCase())) &&
      (!txIdQ || (e.ref ?? "").toLowerCase().includes(txIdQ.toLowerCase())) &&
      (!q || e.message.toLowerCase().includes(q) || e.actor.toLowerCase().includes(q) || (e.ref ?? "").toLowerCase().includes(q))
    );
  });

  const groups = filtered.reduce<Record<string, ActivityEvent[]>>((acc, e) => {
    (acc[e.date] = acc[e.date] || []).push(e);
    return acc;
  }, {});

  const reset = () => {
    setVendorQ(""); setTxIdQ(""); setFromDate(""); setToDate(""); setAction("all"); setSource("all"); setSearch("");
  };
  const activeFilters = [vendorQ, txIdQ, fromDate, toDate, search].filter(Boolean).length + (action !== "all" ? 1 : 0) + (source !== "all" ? 1 : 0);

  return (
    <div>
      <div className="rounded-lg border border-border bg-card p-3 mb-3">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2 text-xs font-medium text-foreground">
            <Filter className="h-3.5 w-3.5 text-muted-foreground" /> Filters
            {activeFilters > 0 && (
              <span className="text-xs font-semibold uppercase tracking-wide text-primary bg-primary/10 px-1.5 py-0.5 rounded">
                {activeFilters} active
              </span>
            )}
          </div>
          {activeFilters > 0 && (
            <button onClick={reset} className="text-xs text-muted-foreground hover:text-foreground">Clear</button>
          )}
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2">
          <FilterField label="Vendor">
            <input value={vendorQ} onChange={(e)=>setVendorQ(e.target.value)} placeholder="Vendor name" className="filter-input" />
          </FilterField>
          <FilterField label="Transaction ID">
            <input value={txIdQ} onChange={(e)=>setTxIdQ(e.target.value)} placeholder="tx id" className="filter-input font-mono" />
          </FilterField>
          <FilterField label="From">
            <input type="date" value={fromDate} onChange={(e)=>setFromDate(e.target.value)} className="filter-input" />
          </FilterField>
          <FilterField label="To">
            <input type="date" value={toDate} onChange={(e)=>setToDate(e.target.value)} className="filter-input" />
          </FilterField>
          <FilterField label="Action">
            <select value={action} onChange={(e)=>setAction(e.target.value as ActivityKind | "all")} className="filter-input">
              <option value="all">All</option>
              <option value="ai">AI</option>
              <option value="payment">Payment</option>
              <option value="approval">Approval</option>
              <option value="vendor">Vendor</option>
              <option value="sync">Sync</option>
              <option value="system">System</option>
            </select>
          </FilterField>
          <FilterField label="Source">
            <select value={source} onChange={(e)=>setSource(e.target.value as "all" | ActivityEvent["source"])} className="filter-input">
              <option value="all">All</option>
              <option value="Itemize">Itemize</option>
              <option value="AI">AI</option>
              <option value="Bank">Bank</option>
              <option value="ERP">ERP</option>
            </select>
          </FilterField>
        </div>
        <div className="mt-2">
          <FilterField label="Search">
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="message / payment / tx"
              className="filter-input"
            />
          </FilterField>
        </div>
        <div className="mt-2 text-xs text-muted-foreground">
          Showing <span className="tabular-nums text-foreground font-medium">{filtered.length}</span> of {activityEvents.length} events
        </div>
      </div>

      <div className="rounded-lg border border-border bg-card overflow-hidden">
        {Object.entries(groups).map(([date, events]) => (
          <div key={date}>
            <div className="px-4 py-2 text-xs font-medium uppercase tracking-wide text-muted-foreground bg-secondary/40 border-b border-border">
              {date}
            </div>
            <ol className="divide-y divide-border">
              {events.map((e) => {
                const meta = activityKindMeta[e.kind];
                return (
                  <li key={e.id} className="px-4 py-3 flex items-start gap-3 hover:bg-secondary/30 transition-colors">
                    <div className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-md ${meta.bg} ${meta.color}`}>
                      {meta.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-baseline gap-2 flex-wrap">
                        <span className="text-sm text-foreground">{e.message}</span>
                        {e.ref && (
                          <span className="font-mono text-xs text-muted-foreground bg-secondary px-1.5 py-0.5 rounded">
                            {e.ref}
                          </span>
                        )}
                      </div>
                      {e.detail && (
                        <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{e.detail}</p>
                      )}
                      <div className="text-xs text-muted-foreground mt-1 flex items-center gap-2">
                        <span className="font-medium text-foreground/70">{e.actor}</span>
                        <span>·</span>
                        <span>{e.actorRole}</span>
                        <span>·</span>
                        <span>{e.source}</span>
                      </div>
                    </div>
                    <div className="text-xs text-muted-foreground tabular-nums shrink-0">{e.at}</div>
                  </li>
                );
              })}
            </ol>
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="px-4 py-10 text-center text-sm text-muted-foreground">No activity matches the current filters.</div>
        )}
      </div>
    </div>
  );
}

// tiny refresh icon to avoid an extra import
function RefreshIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-3 w-3">
      <path d="M3 12a9 9 0 0 1 15.5-6.3L21 8" />
      <path d="M21 3v5h-5" />
      <path d="M21 12a9 9 0 0 1-15.5 6.3L3 16" />
      <path d="M3 21v-5h5" />
    </svg>
  );
}


function FilterField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block min-w-0">
      <span className="block text-xs font-medium uppercase tracking-wide text-muted-foreground mb-1">{label}</span>
      {children}
    </label>
  );
}
