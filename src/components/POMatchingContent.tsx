import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Brain,
  Check,
  ExternalLink,
  Flag,
  Link2,
  RefreshCcw,
  Sparkles,
  Zap,
  ScanSearch,
  GitCompare,
} from "lucide-react";
import TopBar from "./TopBar";
import { DataTable, DataTableColumn } from "@/components/data-table/DataTable";
import RowActions from "@/components/data-table/RowActions";
import FilterDropdown from "@/components/data-table/FilterDropdown";
import POMatchingSheet from "./POMatchingSheet";

export type MatchStatus = "Auto-matched" | "Needs review" | "Variance" | "Unmatched" | "Approved";
export type MatchType = "3-way" | "2-way" | "Manual";

export interface MatchLine {
  sku: string;
  description: string;
  poQty: number;
  invoiceQty: number;
  receiptQty?: number;
  poUnit: string;
  invoiceUnit: string;
  variance: string;
  status: "ok" | "warn" | "bad";
}

export interface POMatchRow {
  id: string;
  poNumber: string;
  invoiceNumber: string;
  vendor: string;
  poTotal: string;
  invoiceTotal: string;
  variance: string;
  variancePct: number;
  status: MatchStatus;
  matchType: MatchType;
  receivedAt: string;
  daysOpen: number;
  aiConfidence: number;
  aiSummary: string;
  aiActions: string[];
  lines: MatchLine[];
  receipt?: { number: string; date: string; total: string };
  activity: { text: string; actor: string; when: string }[];
}

const statusStyles: Record<MatchStatus, string> = {
  "Auto-matched":
    "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/30",
  "Needs review":
    "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/30",
  Variance: "bg-destructive/10 text-destructive border-destructive/20",
  Unmatched:
    "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-500/10 dark:text-rose-400 dark:border-rose-500/30",
  Approved:
    "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/30",
};

const matchTypeStyles: Record<MatchType, string> = {
  "3-way":
    "bg-violet-50 text-violet-700 border-violet-200 dark:bg-violet-500/10 dark:text-violet-400 dark:border-violet-500/30",
  "2-way":
    "bg-cyan-50 text-cyan-700 border-cyan-200 dark:bg-cyan-500/10 dark:text-cyan-400 dark:border-cyan-500/30",
  Manual: "bg-secondary text-foreground border-border",
};

const matches: POMatchRow[] = [
  {
    id: "1",
    poNumber: "PO-7720",
    invoiceNumber: "INV-38982",
    vendor: "Metrobuild Construction",
    poTotal: "$2,500.00",
    invoiceTotal: "$2,841.21",
    variance: "+$341.21",
    variancePct: 13.7,
    status: "Variance",
    matchType: "3-way",
    receivedAt: "Jun 14, 2026",
    daysOpen: 3,
    aiConfidence: 92,
    aiSummary:
      "Invoice total exceeds PO-7720 by $341.21 (13.7%). Line 2 quantity is 12 vs PO 10. Vendor, tax, and receipt date all consistent.",
    aiActions: ["Request credit memo", "Approve with override", "Route to PM"],
    lines: [
      {
        sku: "CMT-100",
        description: "Portland Cement, 94 lb bag",
        poQty: 40,
        invoiceQty: 40,
        receiptQty: 40,
        poUnit: "$12.50",
        invoiceUnit: "$12.50",
        variance: "$0.00",
        status: "ok",
      },
      {
        sku: "CMT-220",
        description: "Mortar Mix Type S, 60 lb",
        poQty: 10,
        invoiceQty: 12,
        receiptQty: 12,
        poUnit: "$170.00",
        invoiceUnit: "$170.10",
        variance: "+$341.21",
        status: "bad",
      },
    ],
    receipt: { number: "GR-2231", date: "Jun 13, 2026", total: "$2,841.21" },
    activity: [
      { text: "PO matched by 3-way engine", actor: "System", when: "3d ago" },
      { text: "Variance flagged > 5% policy", actor: "Workflow", when: "3d ago" },
      { text: "AI proposed credit memo path", actor: "Itemize AI", when: "2d ago" },
    ],
  },
  {
    id: "2",
    poNumber: "PO-7733",
    invoiceNumber: "INV-19012",
    vendor: "Acme Office Supplies",
    poTotal: "$4,000.00",
    invoiceTotal: "$4,000.00",
    variance: "$0.00",
    variancePct: 0,
    status: "Auto-matched",
    matchType: "3-way",
    receivedAt: "Jun 17, 2026",
    daysOpen: 0,
    aiConfidence: 99,
    aiSummary:
      "Exact line-level match across PO, invoice, and goods receipt. All tolerances within policy. Safe to auto-approve.",
    aiActions: ["Auto-approve", "Post to GL"],
    lines: [
      {
        sku: "PAPER-A4",
        description: "Premium A4 Paper, 500 sheets",
        poQty: 200,
        invoiceQty: 200,
        receiptQty: 200,
        poUnit: "$20.00",
        invoiceUnit: "$20.00",
        variance: "$0.00",
        status: "ok",
      },
    ],
    receipt: { number: "GR-2240", date: "Jun 16, 2026", total: "$4,000.00" },
    activity: [
      { text: "Auto-matched by AI", actor: "Itemize AI", when: "2h ago" },
      { text: "Ready for batch post", actor: "Workflow", when: "2h ago" },
    ],
  },
  {
    id: "3",
    poNumber: "PO-7708",
    invoiceNumber: "INV-AB-553",
    vendor: "California Drywall",
    poTotal: "$23,500.00",
    invoiceTotal: "$23,951.27",
    variance: "+$451.27",
    variancePct: 1.9,
    status: "Needs review",
    matchType: "3-way",
    receivedAt: "Jul 18, 2026",
    daysOpen: 5,
    aiConfidence: 78,
    aiSummary:
      "Variance is 1.9% (within 2% tolerance). Freight line $451.27 is on invoice but absent from PO. Recommend approving with freight accrual.",
    aiActions: ["Approve with freight", "Add line to PO"],
    lines: [
      {
        sku: "DW-58",
        description: "5/8\" Drywall Sheet 4x8",
        poQty: 500,
        invoiceQty: 500,
        receiptQty: 500,
        poUnit: "$47.00",
        invoiceUnit: "$47.00",
        variance: "$0.00",
        status: "ok",
      },
      {
        sku: "FRT",
        description: "Freight & handling",
        poQty: 0,
        invoiceQty: 1,
        poUnit: "—",
        invoiceUnit: "$451.27",
        variance: "+$451.27",
        status: "warn",
      },
    ],
    receipt: { number: "GR-2218", date: "Jul 17, 2026", total: "$23,500.00" },
    activity: [
      { text: "Match created from email upload", actor: "System", when: "5d ago" },
      { text: "AI suggested freight accrual", actor: "Itemize AI", when: "4d ago" },
    ],
  },
  {
    id: "4",
    poNumber: "—",
    invoiceNumber: "INV-77821",
    vendor: "Summit Equipment Rental",
    poTotal: "—",
    invoiceTotal: "$2,000.00",
    variance: "—",
    variancePct: 0,
    status: "Unmatched",
    matchType: "Manual",
    receivedAt: "Jun 3, 2026",
    daysOpen: 21,
    aiConfidence: 64,
    aiSummary:
      "No PO referenced on invoice. AI suggests PO-7619 (Summit Equipment, similar amount, same week). 64% match confidence.",
    aiActions: ["Link to PO-7619", "Mark non-PO"],
    lines: [
      {
        sku: "RENT-EXC",
        description: "Excavator weekly rental",
        poQty: 0,
        invoiceQty: 1,
        poUnit: "—",
        invoiceUnit: "$2,000.00",
        variance: "—",
        status: "warn",
      },
    ],
    activity: [
      { text: "No PO match found", actor: "System", when: "21d ago" },
      { text: "AI suggested 3 candidate POs", actor: "Itemize AI", when: "21d ago" },
    ],
  },
  {
    id: "5",
    poNumber: "PO-7701",
    invoiceNumber: "INV-PPG-902",
    vendor: "PPG Architectural Finishes",
    poTotal: "$15,600.00",
    invoiceTotal: "$15,675.66",
    variance: "+$75.66",
    variancePct: 0.5,
    status: "Auto-matched",
    matchType: "2-way",
    receivedAt: "Apr 21, 2026",
    daysOpen: 1,
    aiConfidence: 96,
    aiSummary: "Within 1% tolerance, no goods receipt required for this vendor. Auto-approved.",
    aiActions: ["Post to GL"],
    lines: [
      {
        sku: "PAINT-EX",
        description: "Exterior latex paint, 5gal",
        poQty: 60,
        invoiceQty: 60,
        poUnit: "$260.00",
        invoiceUnit: "$261.26",
        variance: "+$75.66",
        status: "ok",
      },
    ],
    activity: [
      { text: "2-way match completed", actor: "System", when: "1d ago" },
      { text: "Auto-approved within tolerance", actor: "Itemize AI", when: "1d ago" },
    ],
  },
  {
    id: "6",
    poNumber: "PO-7745",
    invoiceNumber: "INV-50901",
    vendor: "Acme Office Supplies",
    poTotal: "$11,880.00",
    invoiceTotal: "$11,880.00",
    variance: "$0.00",
    variancePct: 0,
    status: "Approved",
    matchType: "3-way",
    receivedAt: "Jun 3, 2026",
    daysOpen: 0,
    aiConfidence: 98,
    aiSummary: "Approved by AP Lead following AI recommendation. Posted to GL.",
    aiActions: [],
    lines: [
      {
        sku: "CHAIR-EX",
        description: "Ergonomic task chair",
        poQty: 30,
        invoiceQty: 30,
        receiptQty: 30,
        poUnit: "$396.00",
        invoiceUnit: "$396.00",
        variance: "$0.00",
        status: "ok",
      },
    ],
    receipt: { number: "GR-2199", date: "Jun 2, 2026", total: "$11,880.00" },
    activity: [
      { text: "Approved by Jane Doe", actor: "User", when: "1d ago" },
      { text: "Posted to GL", actor: "System", when: "1d ago" },
    ],
  },
  {
    id: "7",
    poNumber: "PO-7755",
    invoiceNumber: "INV-91003",
    vendor: "Acme Office Supplies",
    poTotal: "$150,000.00",
    invoiceTotal: "$152,400.00",
    variance: "+$2,400.00",
    variancePct: 1.6,
    status: "Needs review",
    matchType: "3-way",
    receivedAt: "Jun 3, 2026",
    daysOpen: 7,
    aiConfidence: 81,
    aiSummary:
      "Within 2% tolerance but absolute variance > $1,000 escalation threshold. Suggest routing to AP Manager.",
    aiActions: ["Route to AP Manager", "Approve with override"],
    lines: [
      {
        sku: "FURN-PKG",
        description: "Office furniture package (bulk)",
        poQty: 1,
        invoiceQty: 1,
        receiptQty: 1,
        poUnit: "$150,000.00",
        invoiceUnit: "$152,400.00",
        variance: "+$2,400.00",
        status: "warn",
      },
    ],
    receipt: { number: "GR-2255", date: "Jun 2, 2026", total: "$150,000.00" },
    activity: [
      { text: "Variance > $1k threshold", actor: "Workflow", when: "7d ago" },
      { text: "AI suggested manager route", actor: "Itemize AI", when: "7d ago" },
    ],
  },
];

const STATUS_FILTER: (MatchStatus | "All statuses")[] = [
  "All statuses",
  "Auto-matched",
  "Needs review",
  "Variance",
  "Unmatched",
  "Approved",
];
const TYPE_FILTER: (MatchType | "All match types")[] = [
  "All match types",
  "3-way",
  "2-way",
  "Manual",
];
const AGE_FILTER = ["Any age", "≤ 2 days", "3–5 days", "6+ days"];

export default function POMatchingContent() {
  const navigate = useNavigate();
  const [status, setStatus] = useState<string>(STATUS_FILTER[0]);
  const [type, setType] = useState<string>(TYPE_FILTER[0]);
  const [age, setAge] = useState(AGE_FILTER[0]);
  const [activeCategory, setActiveCategory] = useState<"all" | "review" | "auto" | "unmatched">(
    "all",
  );

  const [open, setOpen] = useState(false);
  const [active, setActive] = useState<POMatchRow | null>(null);

  const filtered = useMemo(() => {
    return matches.filter((m) => {
      if (status !== STATUS_FILTER[0] && m.status !== status) return false;
      if (type !== TYPE_FILTER[0] && m.matchType !== type) return false;
      if (age === "≤ 2 days" && m.daysOpen > 2) return false;
      if (age === "3–5 days" && (m.daysOpen < 3 || m.daysOpen > 5)) return false;
      if (age === "6+ days" && m.daysOpen < 6) return false;
      if (activeCategory === "review" && m.status !== "Needs review" && m.status !== "Variance")
        return false;
      if (activeCategory === "auto" && m.status !== "Auto-matched") return false;
      if (activeCategory === "unmatched" && m.status !== "Unmatched") return false;
      return true;
    });
  }, [status, type, age, activeCategory]);

  const totalCount = matches.length;
  const autoMatched = matches.filter((m) => m.status === "Auto-matched").length;
  const needsReview = matches.filter(
    (m) => m.status === "Needs review" || m.status === "Variance",
  ).length;
  const unmatched = matches.filter((m) => m.status === "Unmatched").length;
  const autoRate = Math.round((autoMatched / totalCount) * 100);
  const avgConfidence = Math.round(
    matches.reduce((s, m) => s + m.aiConfidence, 0) / matches.length,
  );

  const openSheet = (row: POMatchRow) => {
    setActive(row);
    setOpen(true);
  };

  const reset = () => {
    setStatus(STATUS_FILTER[0]);
    setType(TYPE_FILTER[0]);
    setAge(AGE_FILTER[0]);
    setActiveCategory("all");
  };

  const columns: DataTableColumn<POMatchRow>[] = [
    {
      key: "poNumber",
      label: "PO Number",
      accessor: (m) => m.poNumber,
      render: (m) => (
        <span className="font-mono text-xs text-foreground">{m.poNumber}</span>
      ),
      width: 130,
    },
    {
      key: "invoiceNumber",
      label: "Invoice",
      accessor: (m) => m.invoiceNumber,
      render: (m) => (
        <span className="font-mono text-xs text-muted-foreground">{m.invoiceNumber}</span>
      ),
      width: 140,
    },
    {
      key: "vendor",
      label: "Vendor",
      accessor: (m) => m.vendor,
      render: (m) => <span className="font-medium text-foreground">{m.vendor}</span>,
    },
    {
      key: "matchType",
      label: "Match",
      accessor: (m) => m.matchType,
      render: (m) => (
        <span
          className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border ${matchTypeStyles[m.matchType]}`}
        >
          {m.matchType}
        </span>
      ),
      width: 100,
    },
    {
      key: "invoiceTotal",
      label: "Invoice Total",
      accessor: (m) => m.invoiceTotal,
      align: "right",
      render: (m) => (
        <span className="font-semibold tabular-nums text-foreground">{m.invoiceTotal}</span>
      ),
      width: 130,
    },
    {
      key: "variance",
      label: "Variance",
      accessor: (m) => m.variance,
      align: "right",
      render: (m) => {
        const positive = m.variance.startsWith("+");
        return (
          <div className="flex flex-col items-end leading-tight">
            <span
              className={`text-xs tabular-nums font-semibold ${
                positive ? "text-destructive" : "text-muted-foreground"
              }`}
            >
              {m.variance}
            </span>
            {m.variancePct > 0 && (
              <span className="text-[10px] tabular-nums text-muted-foreground">
                {m.variancePct}%
              </span>
            )}
          </div>
        );
      },
      width: 120,
    },
    {
      key: "status",
      label: "Status",
      accessor: (m) => m.status,
      render: (m) => (
        <span
          className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full border ${statusStyles[m.status]}`}
        >
          {m.status === "Auto-matched" && <Zap className="h-3 w-3" />}
          {m.status === "Variance" && <GitCompare className="h-3 w-3" />}
          {m.status === "Unmatched" && <ScanSearch className="h-3 w-3" />}
          {m.status}
        </span>
      ),
      width: 140,
    },
    {
      key: "aiConfidence",
      label: "AI Confidence",
      accessor: (m) => `${m.aiConfidence}%`,
      render: (m) => (
        <div className="flex items-center gap-2 min-w-[110px]">
          <div className="flex-1 h-1.5 bg-secondary rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full ${
                m.aiConfidence >= 90
                  ? "bg-emerald-500"
                  : m.aiConfidence >= 75
                    ? "bg-primary"
                    : "bg-amber-500"
              }`}
              style={{ width: `${m.aiConfidence}%` }}
            />
          </div>
          <span className="text-[11px] tabular-nums text-muted-foreground w-8 text-right">
            {m.aiConfidence}%
          </span>
        </div>
      ),
      width: 160,
    },
    {
      key: "daysOpen",
      label: "Days Open",
      accessor: (m) => `${m.daysOpen}d`,
      align: "right",
      render: (m) => (
        <span
          className={`text-xs tabular-nums ${
            m.daysOpen > 5 ? "text-destructive font-semibold" : "text-muted-foreground"
          }`}
        >
          {m.daysOpen}d
        </span>
      ),
      width: 100,
    },
    {
      key: "receivedAt",
      label: "Received",
      accessor: (m) => m.receivedAt,
      defaultVisible: false,
    },
  ];

  return (
    <div className="flex-1 flex flex-col min-h-0 min-w-0 bg-background">
      <TopBar />
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-7xl mx-auto px-6 py-8 min-w-0">
          {/* Breadcrumb */}
          <nav className="text-xs text-muted-foreground mb-3 flex items-center gap-1.5">
            <span>Accounts Payable</span>
            <span className="opacity-50">›</span>
            <span>Documents</span>
            <span className="opacity-50">›</span>
            <span className="text-foreground font-medium">PO Matching</span>
          </nav>

          {/* Header */}
          <div className="flex items-start justify-between mb-6 gap-4">
            <div>
              <h1 className="text-2xl font-bold text-foreground tracking-tight">
                PO Matching
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                2-way and 3-way match between purchase orders, invoices, and goods receipts.
              </p>
            </div>
            <button
              onClick={reset}
              className="flex items-center gap-2 text-sm font-medium border border-border rounded-lg px-3.5 py-2 hover:bg-secondary text-foreground"
            >
              <RefreshCcw className="h-3.5 w-3.5" />
              Reset
            </button>
          </div>

          {/* AI banner */}
          <div className="mb-6 rounded-xl border border-primary/20 bg-gradient-to-br from-primary/[0.05] via-primary/[0.02] to-transparent p-4">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                <Brain className="h-4 w-4" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold text-foreground">
                  Itemize AI matched {autoMatched} of {totalCount} POs automatically
                </div>
                <div className="text-xs text-muted-foreground mt-0.5">
                  {avgConfidence}% average confidence · {autoRate}% auto-match rate · {needsReview}{" "}
                  variance{needsReview === 1 ? "" : "s"} need human eyes.
                </div>
              </div>
              <button className="text-xs font-medium px-3 py-1.5 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 inline-flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5" />
                Approve all auto-matches
              </button>
            </div>
          </div>

          {/* Stat cards (clickable) */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-6">
            <StatCard
              icon={<Link2 className="h-3.5 w-3.5" />}
              tint="primary"
              label="Total matches"
              value={totalCount}
              active={activeCategory === "all"}
              onClick={() => setActiveCategory("all")}
            />
            <StatCard
              icon={<Zap className="h-3.5 w-3.5" />}
              tint="emerald"
              label="Auto-matched"
              value={autoMatched}
              active={activeCategory === "auto"}
              onClick={() => setActiveCategory("auto")}
            />
            <StatCard
              icon={<GitCompare className="h-3.5 w-3.5" />}
              tint="amber"
              label="Needs review"
              value={needsReview}
              active={activeCategory === "review"}
              onClick={() => setActiveCategory("review")}
            />
            <StatCard
              icon={<ScanSearch className="h-3.5 w-3.5" />}
              tint="rose"
              label="Unmatched"
              value={unmatched}
              active={activeCategory === "unmatched"}
              onClick={() => setActiveCategory("unmatched")}
            />
          </div>

          {/* Filters */}
          <div className="flex items-center gap-2 mb-4 flex-wrap">
            <FilterDropdown
              label="Status"
              value={status}
              options={STATUS_FILTER as string[]}
              onChange={setStatus}
              align="start"
            />
            <FilterDropdown
              label="Match type"
              value={type}
              options={TYPE_FILTER as string[]}
              onChange={setType}
              align="start"
            />
            <FilterDropdown
              label="Age"
              value={age}
              options={AGE_FILTER}
              onChange={setAge}
              align="start"
            />
            <div className="text-xs text-muted-foreground ml-1">
              {filtered.length} of {totalCount} matches
            </div>
          </div>

          {/* Table */}
          <DataTable<POMatchRow>
            storageKey="po-matching"
            columns={columns}
            data={filtered}
            rowKey={(m) => m.id}
            searchable
            searchPlaceholder="Search PO, invoice, vendor..."
            onRowClick={openSheet}
            renderRowActions={(m) => (
              <RowActions
                review={{
                  label: "Review",
                  onClick: () => openSheet(m),
                  icon: <ExternalLink className="h-3.5 w-3.5" />,
                }}
                primary={{
                  label: "Approve",
                  onClick: () => openSheet(m),
                  icon: <Check className="h-3.5 w-3.5" />,
                }}
                more={[
                  {
                    label: "Open invoice",
                    onClick: () => navigate(`/documents/${m.invoiceNumber}`),
                  },
                  { label: "Flag for review", onClick: () => {}, icon: <Flag className="h-3.5 w-3.5" /> },
                  { label: "Assign to teammate", onClick: () => {} },
                  { label: "Reject match", onClick: () => {}, destructive: true },
                ]}
              />
            )}
          />
        </div>
      </div>

      <POMatchingSheet match={active} open={open} onOpenChange={setOpen} />
    </div>
  );
}

const tints: Record<string, string> = {
  primary: "bg-primary/10 text-primary",
  emerald:
    "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400",
  amber: "bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400",
  rose: "bg-rose-100 text-rose-700 dark:bg-rose-500/10 dark:text-rose-400",
};

function StatCard({
  icon,
  tint,
  label,
  value,
  active,
  onClick,
}: {
  icon: React.ReactNode;
  tint: string;
  label: string;
  value: number;
  active?: boolean;
  onClick?: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`stat-card text-left transition-all ${
        active ? "ring-2 ring-primary/30 border-primary/30" : ""
      }`}
    >
      <div className="flex items-center gap-2">
        <div className={`h-7 w-7 rounded-lg flex items-center justify-center ${tints[tint]}`}>
          {icon}
        </div>
        <div className="min-w-0 flex-1">
          <div className="text-[11px] font-medium text-muted-foreground">{label}</div>
          <div className="text-lg font-bold tabular-nums text-foreground mt-0">{value}</div>
        </div>
      </div>
    </button>
  );
}
