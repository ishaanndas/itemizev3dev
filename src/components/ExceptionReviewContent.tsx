import { useCallback, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  AlertTriangle,
  Brain,
  Check,
  ExternalLink,
  FileText,
  Flag,
  ListChecks,
  RefreshCcw,
  ShieldAlert,
  Sparkles,
} from "lucide-react";
import TopBar from "./TopBar";
import { DataTable, DataTableColumn } from "@/components/data-table/DataTable";
import RowActions from "@/components/data-table/RowActions";
import FilterDropdown from "@/components/data-table/FilterDropdown";
import ExceptionReviewSheet from "./ExceptionReviewSheet";

export type ExceptionSeverity = "High" | "Medium" | "Low";
export type ExceptionCategory =
  | "PO Mismatch"
  | "Duplicate"
  | "Tax Mismatch"
  | "Math Error"
  | "Missing PO"
  | "Vendor Mismatch";

export interface ExceptionFinding {
  title: string;
  detail: string;
  severity: "high" | "medium" | "low";
  suggestion?: string;
}

export interface ExceptionRow {
  id: string;
  docType: string;
  docNumber: string;
  vendor: string;
  total: string;
  exceptionType: ExceptionCategory;
  severity: ExceptionSeverity;
  openFindings: number;
  uploaded: string;
  documentDate: string;
  daysOpen: number;
  aiConfidence: number;
  aiSummary: string;
  aiActions: string[];
  findings: ExceptionFinding[];
  poMatch?: { poNumber: string; poTotal: string; variance: string };
  activity: { text: string; actor: string; when: string }[];
}

const severityStyles: Record<ExceptionSeverity, string> = {
  High: "bg-destructive/10 text-destructive border-destructive/20",
  Medium:
    "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/30",
  Low: "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/30",
};

const categoryStyles: Record<ExceptionCategory, string> = {
  "PO Mismatch": "bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-500/10 dark:text-orange-400 dark:border-orange-500/30",
  Duplicate: "bg-violet-50 text-violet-700 border-violet-200 dark:bg-violet-500/10 dark:text-violet-400 dark:border-violet-500/30",
  "Tax Mismatch": "bg-cyan-50 text-cyan-700 border-cyan-200 dark:bg-cyan-500/10 dark:text-cyan-400 dark:border-cyan-500/30",
  "Math Error": "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-500/10 dark:text-rose-400 dark:border-rose-500/30",
  "Missing PO": "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/30",
  "Vendor Mismatch": "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/30",
};

const docTypeStyles: Record<string, string> = {
  Invoice: "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/30",
  Statement: "bg-violet-50 text-violet-700 border-violet-200 dark:bg-violet-500/10 dark:text-violet-400 dark:border-violet-500/30",
  "Credit Note": "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/30",
  Receipt: "bg-cyan-50 text-cyan-700 border-cyan-200 dark:bg-cyan-500/10 dark:text-cyan-400 dark:border-cyan-500/30",
};

const exceptions: ExceptionRow[] = [
  {
    id: "1",
    docType: "Invoice",
    docNumber: "INV-38982",
    vendor: "Metrobuild Construction",
    total: "$2,841.21",
    exceptionType: "PO Mismatch",
    severity: "High",
    openFindings: 2,
    uploaded: "Jun 14, 2026",
    documentDate: "Jun 12, 2026",
    daysOpen: 3,
    aiConfidence: 92,
    aiSummary:
      "Invoice total exceeds PO-7720 by $341.21 (13.7%). Line 2 quantity differs from PO (12 vs 10). Vendor and tax look correct.",
    aiActions: ["Request credit memo", "Override line qty", "Escalate to PM"],
    findings: [
      {
        title: "Total exceeds PO threshold",
        detail: "Invoice $2,841.21 vs PO $2,500.00 — variance $341.21 (13.7%, > 5% policy).",
        severity: "high",
        suggestion: "Route to Project Manager for variance approval.",
      },
      {
        title: "Line 2 quantity mismatch",
        detail: "Invoiced qty 12 vs PO qty 10 for SKU CMT-220.",
        severity: "medium",
        suggestion: "Update line qty to 10 and recalculate.",
      },
    ],
    poMatch: { poNumber: "PO-7720", poTotal: "$2,500.00", variance: "+$341.21" },
    activity: [
      { text: "Exception flagged by 3-way match", actor: "System", when: "3d ago" },
      { text: "Assigned to AP Team", actor: "Workflow", when: "3d ago" },
      { text: "AI suggested credit memo request", actor: "Itemize AI", when: "2d ago" },
    ],
  },
  {
    id: "2",
    docType: "Invoice",
    docNumber: "INV-80152",
    vendor: "Greenleaf Organics",
    total: "$1,021.27",
    exceptionType: "Duplicate",
    severity: "High",
    openFindings: 1,
    uploaded: "Jun 13, 2026",
    documentDate: "Jun 10, 2026",
    daysOpen: 4,
    aiConfidence: 97,
    aiSummary:
      "Document number INV-80152 was paid Apr 22, 2026 to the same vendor for the same amount. Likely duplicate submission.",
    aiActions: ["Mark as duplicate", "Notify vendor"],
    findings: [
      {
        title: "Identical invoice paid previously",
        detail: "Matches DOC-77110 paid Apr 22, 2026 — same vendor, number, and total.",
        severity: "high",
        suggestion: "Reject as duplicate and notify vendor.",
      },
    ],
    activity: [
      { text: "Duplicate detector matched prior payment", actor: "Itemize AI", when: "4d ago" },
      { text: "Auto-blocked from payment run", actor: "System", when: "4d ago" },
    ],
  },
  {
    id: "3",
    docType: "Invoice",
    docNumber: "INV-37433",
    vendor: "Bluepeak Software",
    total: "$2,604.42",
    exceptionType: "Tax Mismatch",
    severity: "High",
    openFindings: 1,
    uploaded: "Jun 12, 2026",
    documentDate: "Jun 9, 2026",
    daysOpen: 5,
    aiConfidence: 88,
    aiSummary:
      "Sales tax of $204.42 charged on a tax-exempt SaaS line item for a Texas billing address. Suggest removing.",
    aiActions: ["Remove tax", "Confirm exemption"],
    findings: [
      {
        title: "Tax applied on exempt category",
        detail: "TX exemption on SaaS — vendor charged 8.25% on $2,400.00 subtotal.",
        severity: "high",
        suggestion: "Recalculate without tax → $2,400.00.",
      },
    ],
    poMatch: { poNumber: "PO-6610", poTotal: "$2,400.00", variance: "+$204.42" },
    activity: [
      { text: "Tax rule engine flagged exemption", actor: "Itemize AI", when: "5d ago" },
    ],
  },
  {
    id: "4",
    docType: "Invoice",
    docNumber: "INV-80892",
    vendor: "Sunset Dental Group",
    total: "$1,629.22",
    exceptionType: "Math Error",
    severity: "Medium",
    openFindings: 1,
    uploaded: "Jun 12, 2026",
    documentDate: "Jun 8, 2026",
    daysOpen: 5,
    aiConfidence: 94,
    aiSummary:
      "Line items sum to $1,529.22 but invoice total reads $1,629.22. $100 unexplained delta.",
    aiActions: ["Correct total", "Request revised invoice"],
    findings: [
      {
        title: "Subtotal does not match line items",
        detail: "Σ lines = $1,529.22, stated total = $1,629.22.",
        severity: "medium",
        suggestion: "Correct total to $1,529.22.",
      },
    ],
    activity: [
      { text: "Arithmetic check failed", actor: "System", when: "5d ago" },
    ],
  },
  {
    id: "5",
    docType: "Invoice",
    docNumber: "INV-62354",
    vendor: "Northwind Logistics",
    total: "$948.89",
    exceptionType: "Missing PO",
    severity: "Medium",
    openFindings: 1,
    uploaded: "Jun 11, 2026",
    documentDate: "Jun 6, 2026",
    daysOpen: 7,
    aiConfidence: 81,
    aiSummary:
      "No PO referenced. Vendor typically uses PO-prefix NW-####. Closest match by amount: NW-4421 ($950.00).",
    aiActions: ["Link to NW-4421", "Request PO"],
    findings: [
      {
        title: "PO reference missing",
        detail: "Invoice has no PO field populated.",
        severity: "medium",
        suggestion: "Auto-link to suggested PO NW-4421 (98% match).",
      },
    ],
    activity: [
      { text: "PO matching could not find a hit", actor: "System", when: "7d ago" },
      { text: "AI proposed NW-4421 (98% match)", actor: "Itemize AI", when: "6d ago" },
    ],
  },
  {
    id: "6",
    docType: "Invoice",
    docNumber: "INV-53900",
    vendor: "Yamamoto House",
    total: "$8,705.47",
    exceptionType: "PO Mismatch",
    severity: "High",
    openFindings: 3,
    uploaded: "Jun 10, 2026",
    documentDate: "Jun 5, 2026",
    daysOpen: 8,
    aiConfidence: 76,
    aiSummary:
      "Three line items priced above PO unit rates. Total variance $1,205.47 across SKU YH-100, YH-220, YH-440.",
    aiActions: ["Request line-level credits", "Reject"],
    findings: [
      {
        title: "Unit pricing above contract",
        detail: "SKU YH-100, YH-220 and YH-440 exceed contracted rates.",
        severity: "high",
        suggestion: "Hold for vendor credit memo.",
      },
      {
        title: "Total variance breaches policy",
        detail: "Variance $1,205.47 vs PO — 16.0% over.",
        severity: "high",
      },
      {
        title: "Receiving not yet posted",
        detail: "GRN missing for PO-9931 line 3.",
        severity: "medium",
        suggestion: "Confirm receipt with warehouse team.",
      },
    ],
    poMatch: { poNumber: "PO-9931", poTotal: "$7,500.00", variance: "+$1,205.47" },
    activity: [
      { text: "Pricing engine flagged 3 lines", actor: "Itemize AI", when: "8d ago" },
      { text: "Escalated to Procurement", actor: "Workflow", when: "5d ago" },
    ],
  },
  {
    id: "7",
    docType: "Invoice",
    docNumber: "INV-21077",
    vendor: "Atlas Print Shop",
    total: "$412.00",
    exceptionType: "Vendor Mismatch",
    severity: "Low",
    openFindings: 1,
    uploaded: "Jun 9, 2026",
    documentDate: "Jun 3, 2026",
    daysOpen: 9,
    aiConfidence: 84,
    aiSummary:
      "Bill-to name 'Atlas Printers LLC' differs from vendor master 'Atlas Print Shop'. Likely DBA — safe to map.",
    aiActions: ["Add DBA mapping", "Confirm vendor"],
    findings: [
      {
        title: "Vendor name variant detected",
        detail: "Doc says 'Atlas Printers LLC'; master record is 'Atlas Print Shop'.",
        severity: "low",
        suggestion: "Save mapping for future invoices.",
      },
    ],
    activity: [
      { text: "Vendor resolver returned low-confidence match", actor: "Itemize AI", when: "9d ago" },
    ],
  },
];

const SEVERITY_FILTER = ["All severities", "High", "Medium", "Low"];
const TYPE_FILTER = [
  "All types",
  "PO Mismatch",
  "Duplicate",
  "Tax Mismatch",
  "Math Error",
  "Missing PO",
  "Vendor Mismatch",
];
const AGE_FILTER = ["Any age", "≤ 2 days", "3–5 days", "6+ days"];

export default function ExceptionReviewContent() {
  const navigate = useNavigate();
  const [severity, setSeverity] = useState(SEVERITY_FILTER[0]);
  const [type, setType] = useState(TYPE_FILTER[0]);
  const [age, setAge] = useState(AGE_FILTER[0]);
  const [activeCategory, setActiveCategory] = useState<"all" | "po" | "invoice">("all");

  const [open, setOpen] = useState(false);
  const [active, setActive] = useState<ExceptionRow | null>(null);

  const filtered = useMemo(() => {
    return exceptions.filter((e) => {
      if (severity !== SEVERITY_FILTER[0] && e.severity !== severity) return false;
      if (type !== TYPE_FILTER[0] && e.exceptionType !== type) return false;
      if (age === "≤ 2 days" && e.daysOpen > 2) return false;
      if (age === "3–5 days" && (e.daysOpen < 3 || e.daysOpen > 5)) return false;
      if (age === "6+ days" && e.daysOpen < 6) return false;
      if (activeCategory === "po" && e.exceptionType !== "PO Mismatch" && e.exceptionType !== "Missing PO") return false;
      if (activeCategory === "invoice" && (e.exceptionType === "PO Mismatch" || e.exceptionType === "Missing PO")) return false;
      return true;
    });
  }, [severity, type, age, activeCategory]);

  const totalCount = exceptions.length;
  const poExceptions = exceptions.filter(
    (e) => e.exceptionType === "PO Mismatch" || e.exceptionType === "Missing PO",
  ).length;
  const invoiceExceptions = totalCount - poExceptions;
  const avgConfidence = Math.round(
    exceptions.reduce((s, e) => s + e.aiConfidence, 0) / exceptions.length,
  );

  const openSheet = (row: ExceptionRow) => {
    setActive(row);
    setOpen(true);
  };

  const reset = () => {
    setSeverity(SEVERITY_FILTER[0]);
    setType(TYPE_FILTER[0]);
    setAge(AGE_FILTER[0]);
    setActiveCategory("all");
  };

  const columns: DataTableColumn<ExceptionRow>[] = [
    {
      key: "docType",
      label: "Document Type",
      accessor: (e) => e.docType,
      render: (e) => (
        <span
          className={`text-[11px] font-semibold px-2.5 py-1 rounded-full border ${
            docTypeStyles[e.docType] ?? "bg-secondary text-foreground border-border"
          }`}
        >
          {e.docType}
        </span>
      ),
      width: 140,
    },
    {
      key: "docNumber",
      label: "Document Number",
      accessor: (e) => e.docNumber,
      render: (e) => <span className="font-mono text-xs text-foreground">{e.docNumber}</span>,
      width: 150,
    },
    {
      key: "vendor",
      label: "Vendor",
      accessor: (e) => e.vendor,
      render: (e) => <span className="font-medium text-foreground">{e.vendor}</span>,
    },
    {
      key: "total",
      label: "Total",
      accessor: (e) => e.total,
      align: "right",
      render: (e) => <span className="font-semibold tabular-nums text-foreground">{e.total}</span>,
      width: 120,
    },
    {
      key: "exceptionType",
      label: "Exception",
      accessor: (e) => e.exceptionType,
      render: (e) => (
        <span
          className={`inline-flex items-center gap-1 text-[11px] font-medium border rounded-full px-2 py-0.5 ${categoryStyles[e.exceptionType]}`}
        >
          <AlertTriangle className="h-3 w-3" />
          {e.exceptionType}
        </span>
      ),
      width: 170,
    },
    {
      key: "severity",
      label: "Severity",
      accessor: (e) => e.severity,
      render: (e) => (
        <span
          className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border ${severityStyles[e.severity]}`}
        >
          {e.severity} risk
        </span>
      ),
      width: 110,
    },
    {
      key: "aiConfidence",
      label: "AI Confidence",
      accessor: (e) => `${e.aiConfidence}%`,
      render: (e) => (
        <div className="flex items-center gap-2 min-w-[110px]">
          <div className="flex-1 h-1.5 bg-secondary rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full ${
                e.aiConfidence >= 90
                  ? "bg-emerald-500"
                  : e.aiConfidence >= 75
                    ? "bg-primary"
                    : "bg-amber-500"
              }`}
              style={{ width: `${e.aiConfidence}%` }}
            />
          </div>
          <span className="text-[11px] tabular-nums text-muted-foreground w-8 text-right">
            {e.aiConfidence}%
          </span>
        </div>
      ),
      width: 160,
    },
    {
      key: "openFindings",
      label: "Open Findings",
      accessor: (e) => String(e.openFindings),
      align: "right",
      render: (e) => (
        <span className="text-xs tabular-nums text-foreground">{e.openFindings}</span>
      ),
      width: 130,
    },
    {
      key: "daysOpen",
      label: "Days Open",
      accessor: (e) => `${e.daysOpen}d`,
      align: "right",
      render: (e) => (
        <span
          className={`text-xs tabular-nums ${
            e.daysOpen > 5 ? "text-destructive font-semibold" : "text-muted-foreground"
          }`}
        >
          {e.daysOpen}d
        </span>
      ),
      width: 110,
    },
    {
      key: "uploaded",
      label: "Uploaded",
      accessor: (e) => e.uploaded,
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
            <span>Tasks</span>
            <span className="opacity-50">›</span>
            <span className="text-foreground font-medium">Exception Review</span>
          </nav>

          {/* Header */}
          <div className="flex items-start justify-between mb-6 gap-4">
            <div>
              <h1 className="text-2xl font-bold text-foreground tracking-tight">
                Exception Review
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                Completed documents with invoice exceptions or anomalies that need review.
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
                  Itemize AI triaged {totalCount} exceptions
                </div>
                <div className="text-xs text-muted-foreground mt-0.5">
                  {avgConfidence}% average confidence · {exceptions.filter((e) => e.aiActions.length > 0).length} have one-click suggested fixes.
                </div>
              </div>
              <button className="text-xs font-medium px-3 py-1.5 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 inline-flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5" />
                Auto-resolve high confidence
              </button>
            </div>
          </div>

          {/* Stat cards (clickable) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-6">
          <StatCard
              icon={<FileText className="h-3.5 w-3.5" />}
              tint="primary"
              label="Documents needing review"
              value={totalCount}
              active={activeCategory === "all"}
              onClick={() => setActiveCategory("all")}
            />
            <StatCard
              icon={<ShieldAlert className="h-3.5 w-3.5" />}
              tint="orange"
              label="With PO match exceptions"
              value={poExceptions}
              active={activeCategory === "po"}
              onClick={() => setActiveCategory("po")}
            />
            <StatCard
              icon={<ListChecks className="h-3.5 w-3.5" />}
              tint="rose"
              label="With invoice exceptions"
              value={invoiceExceptions}
              active={activeCategory === "invoice"}
              onClick={() => setActiveCategory("invoice")}
            />
          </div>

          {/* Filters */}
          <div className="flex items-center gap-2 mb-4 flex-wrap">
            <FilterDropdown
              label="Severity"
              value={severity}
              options={SEVERITY_FILTER}
              onChange={setSeverity}
              align="start"
            />
            <FilterDropdown
              label="Type"
              value={type}
              options={TYPE_FILTER}
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
              {filtered.length} of {totalCount} exceptions
            </div>
          </div>

          {/* Table */}
          <DataTable<ExceptionRow>
            storageKey="exception-review"
            columns={columns}
            data={filtered}
            rowKey={(e) => e.id}
            searchable
            searchPlaceholder="Search documents, vendors, severity..."
            onRowClick={openSheet}
            renderRowActions={(e) => (
              <RowActions
                review={{
                  label: "Review",
                  onClick: () => openSheet(e),
                  icon: <ExternalLink className="h-3.5 w-3.5" />,
                }}
                primary={{
                  label: "Resolve",
                  onClick: () => openSheet(e),
                  icon: <Check className="h-3.5 w-3.5" />,
                }}
                more={[
                  { label: "Open document", onClick: () => navigate(`/documents/${e.docNumber}`) },
                  { label: "Flag for review", onClick: () => {}, icon: <Flag className="h-3.5 w-3.5" /> },
                  { label: "Assign to teammate", onClick: () => {} },
                  { label: "Reject document", onClick: () => {}, destructive: true },
                ]}
              />
            )}
          />
        </div>
      </div>

      <ExceptionReviewSheet exception={active} open={open} onOpenChange={setOpen} />
    </div>
  );
}

const tints: Record<string, string> = {
  primary: "bg-primary/10 text-primary",
  orange:
    "bg-orange-100 text-orange-700 dark:bg-orange-500/10 dark:text-orange-400",
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
          <div className="text-lg font-bold tabular-nums text-foreground mt-0">
            {value}
          </div>
        </div>
      </div>
    </button>
  );
}
