import { useCallback, useMemo, useState } from "react";
import {
  Sparkles,
  Plus,
  
  Upload,
  Download,
  Building2,
  Pencil,
  Trash2,
  Tag,
  Check,
  X,
  AlertCircle,
  CheckCircle2,
  Clock,
  FileText,
  TrendingUp,
  Wand2,
  ChevronRight,
  Mail,
  Phone,
  MapPin,
  Landmark,
  Shield,
  Lock,
  
  GitMerge,
  ArrowRight,
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

// -------- Types & mock data --------
type VendorStatus = "Active" | "Inactive" | "Needs review";

interface AliasSuggestion {
  alias: string;
  source: string;
  confidence: number;
  docCount: number;
}

interface Vendor {
  id: string;
  name: string;
  externalId?: string;
  status: VendorStatus;
  aliases: string[];
  suggestedAliases: AliasSuggestion[];
  docCount: number;
  lastProcessed: string;
  totalSpend: number;
  amountDue: number;
  paymentMethod: "ACH" | "Check" | "Wire" | "Virtual Card";
  category: string;
  taxIdMasked?: string;
  email?: string;
  phone?: string;
  address?: string;
  aiHealth: number; // 0..1 — completeness/risk
  aiHealthIssues: string[];
}

const fmtUSD = (n: number) =>
  n.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });

const vendors: Vendor[] = [
  {
    id: "v1", name: "Capitol Building Supply", externalId: "VEN-1042",
    status: "Active", aliases: ["Capitol Bldg Supply", "Capitol B.S."],
    suggestedAliases: [
      { alias: "CAPITOL BLDG SUP INC", source: "Invoice INV-128267", confidence: 0.96, docCount: 4 },
      { alias: "Capitol Supply Co", source: "Email ar@capitolbs.com", confidence: 0.88, docCount: 2 },
    ],
    docCount: 47, lastProcessed: "2d ago", totalSpend: 142_300, amountDue: 1544,
    paymentMethod: "ACH", category: "Materials",
    taxIdMasked: "··6721", email: "ar@capitolbs.com", phone: "(202) 555-0142",
    address: "1100 K St NW, Washington DC",
    aiHealth: 0.96, aiHealthIssues: [],
  },
  {
    id: "v2", name: "Wilson Sonsini Goodrich", externalId: "VEN-1043",
    status: "Active", aliases: ["WSGR", "Wilson Sonsini"],
    suggestedAliases: [
      { alias: "Wilson Sonsini G&R LLP", source: "Invoice 2362888", confidence: 0.94, docCount: 3 },
    ],
    docCount: 22, lastProcessed: "5d ago", totalSpend: 312_400, amountDue: 27_720,
    paymentMethod: "Wire", category: "Legal",
    taxIdMasked: "··2199", email: "billing@wsgr.com",
    address: "650 Page Mill Rd, Palo Alto CA",
    aiHealth: 0.88, aiHealthIssues: ["Missing W-9 refresh (12mo)"],
  },
  {
    id: "v3", name: "Apple Inc", externalId: "VEN-1044",
    status: "Active", aliases: ["Apple", "Apple Computer"],
    suggestedAliases: [],
    docCount: 18, lastProcessed: "1d ago", totalSpend: 84_120, amountDue: 1_402,
    paymentMethod: "Virtual Card", category: "Technology",
    taxIdMasked: "··0142", email: "ap@apple.com",
    address: "One Apple Park Way, Cupertino CA",
    aiHealth: 1.0, aiHealthIssues: [],
  },
  {
    id: "v4", name: "TechPro Inc", externalId: "VEN-1045",
    status: "Active", aliases: ["TechPro"],
    suggestedAliases: [
      { alias: "Tech-Pro Incorporated", source: "Invoice TP-44182", confidence: 0.97, docCount: 6 },
      { alias: "TECHPRO INC.", source: "PO-2024-0123", confidence: 0.99, docCount: 8 },
      { alias: "TPI Solutions", source: "Email finance@techpro.io", confidence: 0.74, docCount: 1 },
    ],
    docCount: 64, lastProcessed: "4h ago", totalSpend: 248_900, amountDue: 11_600,
    paymentMethod: "ACH", category: "Technology",
    taxIdMasked: "··8810", email: "finance@techpro.io",
    address: "500 Howard St, San Francisco CA",
    aiHealth: 0.92, aiHealthIssues: [],
  },
  {
    id: "v5", name: "CloudHost Co", externalId: "VEN-1046",
    status: "Active", aliases: ["CloudHost"],
    suggestedAliases: [
      { alias: "Cloud Host Co LLC", source: "Invoice REC-0055", confidence: 0.92, docCount: 12 },
    ],
    docCount: 36, lastProcessed: "3d ago", totalSpend: 198_000, amountDue: 17_000,
    paymentMethod: "ACH", category: "Cloud",
    taxIdMasked: "··3344", email: "ar@cloudhost.co",
    address: "1 Market St, San Francisco CA",
    aiHealth: 0.94, aiHealthIssues: [],
  },
  {
    id: "v6", name: "Acme Logistics",
    status: "Needs review", aliases: [],
    suggestedAliases: [
      { alias: "ACME LOG.", source: "Invoice ACM-77123", confidence: 0.98, docCount: 5 },
      { alias: "Acme Logistics LLC", source: "Email billing@acmelogi.com", confidence: 0.95, docCount: 3 },
      { alias: "Acme Freight & Logistics", source: "Invoice ACM-77108", confidence: 0.81, docCount: 2 },
    ],
    docCount: 10, lastProcessed: "1d ago", totalSpend: 38_600, amountDue: 8_440,
    paymentMethod: "ACH", category: "Logistics",
    email: "billing@acmelogi.com",
    aiHealth: 0.42, aiHealthIssues: ["No external ID", "Stale W-9", "Address missing"],
  },
  {
    id: "v7", name: "Office Depot", externalId: "VEN-1048",
    status: "Active", aliases: ["Office Depot Inc", "ODP"],
    suggestedAliases: [],
    docCount: 84, lastProcessed: "8h ago", totalSpend: 26_400, amountDue: 3_250,
    paymentMethod: "Virtual Card", category: "Supplies",
    taxIdMasked: "··5571", email: "ap@officedepot.com",
    address: "6600 N Military Trl, Boca Raton FL",
    aiHealth: 0.98, aiHealthIssues: [],
  },
  {
    id: "v8", name: "Initech Software",
    status: "Inactive", aliases: ["Initech"],
    suggestedAliases: [],
    docCount: 8, lastProcessed: "4mo ago", totalSpend: 12_400, amountDue: 0,
    paymentMethod: "ACH", category: "Technology",
    email: "billing@initech.com",
    aiHealth: 0.58, aiHealthIssues: ["Inactive 4+ months"],
  },
  {
    id: "v9", name: "Northwind Traders", externalId: "VEN-1050",
    status: "Active", aliases: ["Northwind"],
    suggestedAliases: [
      { alias: "Northwind Trdrs", source: "Check #10248", confidence: 0.9, docCount: 2 },
    ],
    docCount: 15, lastProcessed: "6d ago", totalSpend: 44_900, amountDue: 4_215,
    paymentMethod: "Check", category: "Distribution",
    taxIdMasked: "··9921", email: "ar@northwind.com",
    aiHealth: 0.86, aiHealthIssues: [],
  },
  {
    id: "v10", name: "Globex Energy", externalId: "VEN-1051",
    status: "Active", aliases: ["Globex"],
    suggestedAliases: [
      { alias: "Globex Energy Corp", source: "Invoice GLX-2026-04", confidence: 0.99, docCount: 9 },
    ],
    docCount: 52, lastProcessed: "12h ago", totalSpend: 422_300, amountDue: 22_300,
    paymentMethod: "Wire", category: "Utilities",
    taxIdMasked: "··0011", email: "ap@globex.energy",
    address: "200 Energy Pkwy, Houston TX",
    aiHealth: 0.95, aiHealthIssues: [],
  },
];

// Pending merge suggestions for the AI panel
const aiMergeSuggestions = [
  { vendors: ["Apple Inc", "Apple Computer Inc"], confidence: 0.97, reason: "Same Tax ID ··0142, identical remit address" },
  { vendors: ["TechPro Inc", "Tech Pro Solutions"], confidence: 0.84, reason: "Matching ACH routing + similar invoice prefixes" },
];

const statusStyles: Record<VendorStatus, string> = {
  Active: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/30",
  Inactive: "bg-secondary text-foreground/60 border-border",
  "Needs review": "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/30",
};

function HealthPill({ score }: { score: number }) {
  const pct = Math.round(score * 100);
  const tone =
    score >= 0.9 ? "text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/30"
    : score >= 0.7 ? "text-blue-700 dark:text-blue-400 bg-blue-50 dark:bg-blue-500/10 border-blue-200 dark:border-blue-500/30"
    : "text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-500/10 border-amber-200 dark:border-amber-500/30";
  return (
    <span className={`inline-flex items-center gap-1 text-[10px] font-semibold rounded-full px-1.5 py-0.5 border tabular-nums ${tone}`}>
      <Sparkles className="h-2.5 w-2.5" /> {pct}
    </span>
  );
}

function StatTile({ icon: Icon, label, value, sub, accent }: {
  icon: any; label: string; value: string; sub?: string; accent?: string;
}) {
  return (
    <div className="rounded-xl border border-border bg-card p-3 min-w-0">
      <div className="flex items-center justify-between gap-2 mb-1">
        <span className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground truncate">{label}</span>
        <div className={`h-6 w-6 rounded-md flex items-center justify-center ${accent ?? "bg-primary/10 text-primary"}`}>
          <Icon className="h-3 w-3" />
        </div>
      </div>
      <div className="text-lg font-bold text-foreground tabular-nums truncate">{value}</div>
      {sub && <div className="text-[11px] text-muted-foreground truncate">{sub}</div>}
    </div>
  );
}

export default function VendorsContent() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"All" | VendorStatus>("All");
  const [selected, setSelected] = useState<Vendor | null>(null);
  const [mode, setMode] = useState<"edit" | "add" | "merge" | null>(null);
  const [selectedRows, setSelectedRows] = useState<Set<number>>(new Set());
  const [mergeSeed, setMergeSeed] = useState<Vendor[] | null>(null);

  // Inline alias state: per-vendor accepted suggestions + dismissed suggestions
  const [acceptedAliases, setAcceptedAliases] = useState<Record<string, string[]>>({});
  const [dismissedAliases, setDismissedAliases] = useState<Record<string, string[]>>({});

  const acceptAlias = useCallback((vendorId: string, alias: string) => {
    setAcceptedAliases((prev) => ({ ...prev, [vendorId]: [...(prev[vendorId] ?? []), alias] }));
  }, []);
  const dismissAlias = useCallback((vendorId: string, alias: string) => {
    setDismissedAliases((prev) => ({ ...prev, [vendorId]: [...(prev[vendorId] ?? []), alias] }));
  }, []);

  const filtered = useMemo(() => {
    return vendors.filter((v) => {
      if (statusFilter !== "All" && v.status !== statusFilter) return false;
      return true;
    });
  }, [statusFilter]);

  const totalSuggestions = vendors.reduce(
    (s, v) => s + v.suggestedAliases.filter((a) => !(dismissedAliases[v.id] ?? []).includes(a.alias) && !(acceptedAliases[v.id] ?? []).includes(a.alias)).length,
    0,
  );
  const needsReview = vendors.filter((v) => v.status === "Needs review").length;
  const totalSpend = vendors.reduce((s, v) => s + v.totalSpend, 0);

  const selectedVendors = Array.from(selectedRows).map((i) => filtered[i]).filter(Boolean);
  const toggleRow = useCallback((i: number) => {
    setSelectedRows((prev) => {
      const next = new Set(prev);
      next.has(i) ? next.delete(i) : next.add(i);
      return next;
    });
  }, []);
  const toggleAll = useCallback(() => {
    setSelectedRows((prev) => (prev.size === filtered.length ? new Set() : new Set(filtered.map((_, i) => i))));
  }, [filtered]);

  const openEdit = (v: Vendor) => { setSelected(v); setMode("edit"); };
  const openAdd = () => { setSelected(null); setMode("add"); };
  const openMerge = (seed?: Vendor[]) => { setMergeSeed(seed ?? selectedVendors); setMode("merge"); };
  const closeSheet = () => { setMode(null); setSelected(null); setMergeSeed(null); };

  const columns: DataTableColumn<Vendor>[] = [
    {
      key: "vendor", label: "Vendor", width: 240,
      accessor: (v) => `${v.name} ${v.email ?? ""} ${v.category}`,
      render: (v) => (
        <div className="flex items-center gap-2 min-w-0">
          <div className="h-7 w-7 rounded-md bg-primary/10 text-primary flex items-center justify-center shrink-0">
            <Building2 className="h-3.5 w-3.5" />
          </div>
          <div className="min-w-0">
            <div className="font-medium text-foreground truncate text-[13px]">{v.name}</div>
            <div className="text-[11px] text-muted-foreground truncate">{v.category}{v.email ? ` · ${v.email}` : ""}</div>
          </div>
        </div>
      ),
    },
    {
      key: "externalId", label: "External ID", width: 120,
      accessor: (v) => v.externalId ?? "",
      render: (v) => v.externalId
        ? <span className="font-mono text-[11px] text-foreground/80">{v.externalId}</span>
        : <span className="text-[11px] text-muted-foreground">—</span>,
    },
    {
      key: "aliases", label: "Aliases", width: 340,
      accessor: (v) => [...v.aliases, ...v.suggestedAliases.map(s => s.alias)].join(" "),
      render: (v) => {
        const accepted = acceptedAliases[v.id] ?? [];
        const dismissed = dismissedAliases[v.id] ?? [];
        const allConfirmed = [...v.aliases, ...accepted];
        const pendingSuggestions = v.suggestedAliases.filter(
          (s) => !accepted.includes(s.alias) && !dismissed.includes(s.alias),
        );
        return (
          <div className="flex items-center gap-1 flex-wrap min-w-0" data-no-row-click onClick={(e) => e.stopPropagation()}>
            {allConfirmed.slice(0, 3).map((a) => (
              <span key={a} className="inline-flex items-center gap-1 text-[10px] font-medium rounded px-1.5 py-0.5 bg-secondary text-foreground/80 border border-border">
                <Tag className="h-2.5 w-2.5" /> {a}
              </span>
            ))}
            {allConfirmed.length > 3 && (
              <span className="text-[10px] text-muted-foreground">+{allConfirmed.length - 3}</span>
            )}
            {pendingSuggestions.slice(0, 2).map((s) => (
              <span
                key={s.alias}
                className="inline-flex items-center gap-0.5 text-[10px] font-medium rounded border border-violet-500/40 bg-violet-500/10 text-violet-700 dark:text-violet-300 pl-1.5 pr-0.5 py-0.5"
                title={`${Math.round(s.confidence * 100)}% match · ${s.source}`}
              >
                <Sparkles className="h-2.5 w-2.5" />
                <span className="truncate max-w-[120px]">{s.alias}</span>
                <span className="tabular-nums opacity-70">{Math.round(s.confidence * 100)}%</span>
                <button
                  onClick={() => acceptAlias(v.id, s.alias)}
                  title="Accept alias"
                  className="h-4 w-4 ml-0.5 rounded inline-flex items-center justify-center bg-violet-600 text-white hover:bg-violet-700 transition-colors"
                >
                  <Check className="h-2.5 w-2.5" />
                </button>
                <button
                  onClick={() => dismissAlias(v.id, s.alias)}
                  title="Dismiss"
                  className="h-4 w-4 rounded inline-flex items-center justify-center text-violet-700 dark:text-violet-300 hover:bg-violet-500/20 transition-colors"
                >
                  <X className="h-2.5 w-2.5" />
                </button>
              </span>
            ))}
            {pendingSuggestions.length > 2 && (
              <button
                onClick={() => openEdit(v)}
                className="inline-flex items-center gap-1 text-[10px] font-semibold rounded px-1.5 py-0.5 bg-violet-500/10 text-violet-700 dark:text-violet-300 border border-violet-500/30 hover:bg-violet-500/20 transition-colors"
              >
                <Sparkles className="h-2.5 w-2.5" /> +{pendingSuggestions.length - 2} more
              </button>
            )}
            {allConfirmed.length === 0 && pendingSuggestions.length === 0 && (
              <span className="text-[11px] text-muted-foreground">—</span>
            )}
          </div>
        );
      },
    },
    {
      key: "docCount", label: "Docs", width: 80, align: "right",
      accessor: (v) => String(v.docCount),
      render: (v) => <span className="tabular-nums text-[13px] text-foreground">{v.docCount}</span>,
    },
    {
      key: "totalSpend", label: "Spend YTD", width: 120, align: "right",
      accessor: (v) => String(v.totalSpend),
      render: (v) => <span className="tabular-nums text-[13px] text-foreground font-medium">{fmtUSD(v.totalSpend)}</span>,
    },
    {
      key: "amountDue", label: "Due", width: 110, align: "right",
      accessor: (v) => String(v.amountDue),
      render: (v) => v.amountDue > 0
        ? <span className="tabular-nums text-[13px] text-amber-700 dark:text-amber-400 font-medium">{fmtUSD(v.amountDue)}</span>
        : <span className="text-muted-foreground">—</span>,
    },
    {
      key: "aiHealth", label: "AI health", width: 90,
      accessor: (v) => String(Math.round(v.aiHealth * 100)),
      render: (v) => <HealthPill score={v.aiHealth} />,
    },
    {
      key: "lastProcessed", label: "Last activity", width: 110,
      accessor: (v) => v.lastProcessed,
      render: (v) => <span className="text-[11px] text-muted-foreground">{v.lastProcessed}</span>,
      defaultVisible: false,
    },
    {
      key: "paymentMethod", label: "Method", width: 110,
      accessor: (v) => v.paymentMethod,
      render: (v) => <span className="text-[11px] text-foreground/80">{v.paymentMethod}</span>,
      defaultVisible: false,
    },
    {
      key: "status", label: "Status", width: 130,
      accessor: (v) => v.status,
      render: (v) => (
        <span className={`inline-flex items-center gap-1 text-[10px] font-medium border rounded-full px-2 py-0.5 ${statusStyles[v.status]}`}>
          <span className="h-1.5 w-1.5 rounded-full bg-current opacity-70" />
          {v.status}
        </span>
      ),
    },
  ];

  return (
    <div className="flex-1 flex flex-col min-h-0 min-w-0 bg-background">
      <TopBar />
      <div className="flex-1 overflow-y-auto overflow-x-hidden min-w-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 min-w-0">

          {/* Header */}
          <div className="flex flex-wrap items-start justify-between gap-3 mb-5">
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground mb-1.5">
                <span>Accounts Payable</span>
                <ChevronRight className="h-3 w-3" />
                <span>Vendors</span>
                <ChevronRight className="h-3 w-3" />
                <span className="text-foreground font-medium">Management</span>
              </div>
              <h1 className="text-2xl font-bold text-foreground tracking-tight">Vendor Management</h1>
              <p className="text-sm text-muted-foreground mt-1">
                Create and manage vendors. AI continuously detects aliases, duplicates, and missing data across your documents.
              </p>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <button className="flex items-center gap-1.5 text-sm border border-border rounded-lg px-3 py-2 hover:bg-secondary transition-colors text-foreground">
                <Download className="h-3.5 w-3.5" /> Export
              </button>
              <button className="flex items-center gap-1.5 text-sm border border-border rounded-lg px-3 py-2 hover:bg-secondary transition-colors text-foreground">
                <Upload className="h-3.5 w-3.5" /> Import CSV
              </button>
              <button
                onClick={openAdd}
                className="flex items-center gap-1.5 text-sm font-medium bg-primary text-primary-foreground rounded-lg px-3.5 py-2 hover:opacity-90 transition-opacity"
              >
                <Plus className="h-3.5 w-3.5" /> Add vendor
              </button>
            </div>
          </div>

          {/* Stat tiles */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 mb-4">
            <StatTile icon={Building2} label="Total vendors" value={`${vendors.length}`} sub={`${vendors.filter(v => v.status === "Active").length} active`} />
            <StatTile icon={TrendingUp} label="Spend YTD" value={fmtUSD(totalSpend)} sub="across 11 categories" />
            <StatTile icon={Sparkles} label="AI alias suggestions" value={`${totalSuggestions}`} sub="ready to review" accent="bg-violet-500/10 text-violet-600 dark:text-violet-400" />
            <StatTile icon={AlertCircle} label="Needs review" value={`${needsReview}`} sub="missing data or risk" accent="bg-amber-500/10 text-amber-600 dark:text-amber-400" />
          </div>

          {/* AI insights banner */}
          <div className="rounded-xl border border-violet-200 dark:border-violet-500/30 bg-gradient-to-r from-violet-50 to-blue-50 dark:from-violet-500/5 dark:to-blue-500/5 p-3 mb-4">
            <div className="flex items-start justify-between gap-3 flex-wrap">
              <div className="flex items-start gap-2.5 min-w-0">
                <div className="h-7 w-7 rounded-lg bg-violet-500/15 text-violet-700 dark:text-violet-400 flex items-center justify-center shrink-0">
                  <Wand2 className="h-3.5 w-3.5" />
                </div>
                <div className="min-w-0">
                  <div className="text-sm font-semibold text-foreground">
                    AI found {totalSuggestions} alias matches and {aiMergeSuggestions.length} possible duplicate vendors
                  </div>
                  <div className="text-[11px] text-muted-foreground mt-0.5">
                    Aliases auto-detected from invoices, POs, emails, and check stubs. Review before they post.
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => openMerge([])}
                  className="text-xs font-medium px-2.5 py-1.5 rounded-md border border-border bg-card hover:bg-secondary transition-colors inline-flex items-center gap-1"
                >
                  <GitMerge className="h-3 w-3" /> Review duplicates
                </button>
                <button className="text-xs font-medium px-2.5 py-1.5 rounded-md bg-violet-600 text-white hover:bg-violet-700 transition-colors inline-flex items-center gap-1">
                  <Sparkles className="h-3 w-3" /> Review all suggestions
                </button>
              </div>
            </div>
          </div>

          {/* Vendor table (standard customizable DataTable) */}
          <DataTable<Vendor>
            storageKey="ap-vendors"
            columns={columns}
            data={filtered}
            rowKey={(v) => v.id}
            selectable
            searchable
            searchValue={search}
            onSearchChange={setSearch}
            searchPlaceholder="Search vendors, aliases, IDs…"
            selectedRows={selectedRows}
            onToggleRow={toggleRow}
            onToggleAll={toggleAll}
            onRowClick={(v) => openEdit(v)}
            toolbarLeft={
              selectedRows.size > 0 ? (
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-foreground tabular-nums">{selectedRows.size} selected</span>
                  <button
                    onClick={() => openMerge()}
                    disabled={selectedRows.size < 2}
                    className="text-xs font-medium px-2.5 py-1.5 rounded-md bg-primary text-primary-foreground hover:opacity-90 transition-opacity inline-flex items-center gap-1 disabled:opacity-50"
                  >
                    <GitMerge className="h-3 w-3" /> Merge {selectedRows.size >= 2 ? selectedRows.size : ""}
                  </button>
                  <button className="text-xs font-medium px-2.5 py-1.5 rounded-md border border-border bg-card hover:bg-secondary transition-colors">Set inactive</button>
                  <button onClick={() => setSelectedRows(new Set())} className="text-[11px] text-muted-foreground hover:text-foreground">Clear</button>
                </div>
              ) : (
                <div className="flex items-center gap-0.5 p-0.5 rounded-md bg-secondary/60 border border-border">
                  {(["All", "Active", "Needs review", "Inactive"] as const).map((s) => (
                    <button
                      key={s}
                      onClick={() => setStatusFilter(s)}
                      className={`text-[11px] font-medium px-2 py-1 rounded transition-colors ${
                        statusFilter === s ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      {s}{s !== "All" && <span className="ml-1 text-muted-foreground tabular-nums">{vendors.filter((v) => v.status === s).length}</span>}
                    </button>
                  ))}
                </div>
              )
            }
            renderRowActions={(v) => (
              <RowActions
                primary={{ label: "Edit", icon: <Pencil className="h-3.5 w-3.5" />, onClick: () => openEdit(v) }}
                more={[
                  { label: "View documents", icon: <FileText className="h-3.5 w-3.5" />, onClick: () => openEdit(v) },
                  { label: "Merge with…", icon: <GitMerge className="h-3.5 w-3.5" />, onClick: () => openMerge([v]) },
                  { label: "Delete vendor", icon: <Trash2 className="h-3.5 w-3.5" />, destructive: true, onClick: () => {} },
                ]}
              />
            )}
          />
        </div>
      </div>

      {/* Side panel for Add / Edit */}
      <Sheet open={mode !== null} onOpenChange={(o) => !o && closeSheet()}>
        <SheetContent side="right" className="w-full sm:max-w-[560px] p-0 flex flex-col gap-0">
          {mode === "add" ? (
            <AddVendorPanel onClose={closeSheet} />
          ) : mode === "merge" ? (
            <MergeVendorsPanel seed={mergeSeed ?? []} onClose={closeSheet} />
          ) : selected ? (
            <EditVendorPanel vendor={selected} onClose={closeSheet} />
          ) : null}
        </SheetContent>
      </Sheet>
    </div>
  );
}

// ---------------- Add panel ----------------
function AddVendorPanel({ onClose }: { onClose: () => void }) {
  const [name, setName] = useState("");
  const [externalId, setExternalId] = useState("");

  // Mock AI inference based on name
  const aiInferred = useMemo(() => {
    if (name.length < 3) return null;
    return {
      category: "Technology",
      similarVendors: name.toLowerCase().includes("tech") ? ["TechPro Inc", "Tech Pro Solutions"] : [],
      suggestedAliases: name ? [`${name.toUpperCase()} INC`, `${name} LLC`] : [],
    };
  }, [name]);

  return (
    <>
      <SheetHeader className="px-5 py-4 border-b border-border shrink-0">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
            <Plus className="h-4 w-4" />
          </div>
          <div className="min-w-0">
            <SheetTitle className="text-base">Add vendor</SheetTitle>
            <SheetDescription className="text-xs">AI will auto-detect duplicates and suggest aliases as you type.</SheetDescription>
          </div>
        </div>
      </SheetHeader>

      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
        <Field label="Vendor name" required>
          <input
            autoFocus
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Capitol Building Supply"
            className="w-full px-3 py-2 text-sm rounded-md bg-card border border-border focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </Field>

        {aiInferred && aiInferred.similarVendors.length > 0 && (
          <div className="rounded-lg border border-amber-200 dark:border-amber-500/30 bg-amber-50 dark:bg-amber-500/5 p-3">
            <div className="flex items-start gap-2">
              <Sparkles className="h-3.5 w-3.5 text-amber-700 dark:text-amber-400 mt-0.5 shrink-0" />
              <div className="min-w-0 flex-1">
                <div className="text-xs font-semibold text-foreground">Possible duplicate detected</div>
                <div className="text-[11px] text-muted-foreground mt-0.5">AI matched this name to {aiInferred.similarVendors.length} existing vendor(s):</div>
                <div className="flex items-center gap-1 mt-1.5 flex-wrap">
                  {aiInferred.similarVendors.map(v => (
                    <span key={v} className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-card border border-border">{v}</span>
                  ))}
                </div>
                <button className="text-[11px] font-medium text-primary mt-2 hover:underline">Add as alias to existing vendor instead →</button>
              </div>
            </div>
          </div>
        )}

        <Field label="External ID" hint="ID used in your ERP or accounting system (QuickBooks, NetSuite, etc.)">
          <div className="relative">
            <input
              value={externalId}
              onChange={(e) => setExternalId(e.target.value)}
              placeholder="e.g. VEN-1042"
              className="w-full px-3 py-2 pr-24 text-sm rounded-md bg-card border border-border focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary font-mono"
            />
            <button className="absolute right-1.5 top-1/2 -translate-y-1/2 text-[10px] font-semibold inline-flex items-center gap-1 px-2 py-1 rounded bg-violet-500/10 text-violet-700 dark:text-violet-400 hover:bg-violet-500/20 transition-colors">
              <Sparkles className="h-2.5 w-2.5" /> Suggest
            </button>
          </div>
        </Field>

        {aiInferred && (
          <Field label="AI inferred category">
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium px-2 py-1 rounded-md bg-violet-500/10 text-violet-700 dark:text-violet-400 border border-violet-500/30 inline-flex items-center gap-1">
                <Sparkles className="h-2.5 w-2.5" /> {aiInferred.category}
              </span>
              <span className="text-[11px] text-muted-foreground">based on name and similar vendors</span>
            </div>
          </Field>
        )}

        <div className="rounded-lg border border-dashed border-border p-3 text-[11px] text-muted-foreground">
          After creation, AI will scan your last 90 days of documents for matching aliases, payment methods, and contact info — pre-filling everything for you.
        </div>
      </div>

      <div className="px-5 py-3 border-t border-border bg-card flex items-center justify-end gap-2 shrink-0">
        <button onClick={onClose} className="text-sm font-medium px-3 py-2 rounded-md hover:bg-secondary transition-colors">Cancel</button>
        <button disabled={!name} className="text-sm font-medium bg-primary text-primary-foreground px-3.5 py-2 rounded-md hover:opacity-90 transition-opacity disabled:opacity-50">
          Create vendor
        </button>
      </div>
    </>
  );
}

// ---------------- Edit panel ----------------
function EditVendorPanel({ vendor, onClose }: { vendor: Vendor; onClose: () => void }) {
  const [tab, setTab] = useState<"overview" | "aliases" | "payment" | "activity">("overview");
  const [acceptedAliases, setAcceptedAliases] = useState<Set<string>>(new Set());

  return (
    <>
      <SheetHeader className="px-5 py-4 border-b border-border shrink-0">
        <div className="flex items-start gap-3">
          <div className="h-10 w-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
            <Building2 className="h-5 w-5" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <SheetTitle className="text-base truncate">{vendor.name}</SheetTitle>
              <span className={`inline-flex items-center gap-1 text-[10px] font-medium border rounded-full px-2 py-0.5 ${statusStyles[vendor.status]}`}>
                <span className="h-1.5 w-1.5 rounded-full bg-current opacity-70" />
                {vendor.status}
              </span>
              <HealthPill score={vendor.aiHealth} />
            </div>
            <SheetDescription className="text-xs mt-0.5">
              {vendor.externalId ? `${vendor.externalId} · ` : ""}{vendor.docCount} docs · last activity {vendor.lastProcessed}
            </SheetDescription>
          </div>
        </div>
        {/* Mini stats */}
        <div className="grid grid-cols-4 gap-2 mt-3">
          <MiniStat label="Docs" value={`${vendor.docCount}`} />
          <MiniStat label="Spend YTD" value={fmtUSD(vendor.totalSpend)} />
          <MiniStat label="Due" value={vendor.amountDue > 0 ? fmtUSD(vendor.amountDue) : "—"} tone={vendor.amountDue > 0 ? "amber" : undefined} />
          <MiniStat label="Last paid" value={vendor.lastProcessed} />
        </div>
      </SheetHeader>

      {/* Tabs */}
      <div className="px-5 border-b border-border shrink-0 flex items-center gap-4 overflow-x-auto">
        {[
          { key: "overview", label: "Overview" },
          { key: "aliases", label: "Aliases", badge: vendor.suggestedAliases.length },
          { key: "payment", label: "Payment & tax" },
          { key: "activity", label: "Activity" },
        ].map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key as any)}
            className={`text-xs font-medium py-2.5 border-b-2 -mb-px transition-colors inline-flex items-center gap-1.5 whitespace-nowrap ${
              tab === t.key ? "border-primary text-foreground" : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            {t.label}
            {t.badge ? (
              <span className="inline-flex items-center gap-1 text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-violet-500/15 text-violet-700 dark:text-violet-400">
                <Sparkles className="h-2 w-2" /> {t.badge}
              </span>
            ) : null}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto">
        {tab === "overview" && (
          <div className="px-5 py-4 space-y-4">
            {vendor.aiHealthIssues.length > 0 && (
              <div className="rounded-lg border border-amber-200 dark:border-amber-500/30 bg-amber-50 dark:bg-amber-500/5 p-3">
                <div className="flex items-start gap-2">
                  <AlertCircle className="h-3.5 w-3.5 text-amber-700 dark:text-amber-400 mt-0.5 shrink-0" />
                  <div className="min-w-0 flex-1">
                    <div className="text-xs font-semibold text-foreground">AI detected {vendor.aiHealthIssues.length} issue(s)</div>
                    <ul className="text-[11px] text-muted-foreground mt-1 space-y-0.5">
                      {vendor.aiHealthIssues.map(i => (
                        <li key={i} className="flex items-center gap-1.5"><span className="h-1 w-1 rounded-full bg-amber-500" /> {i}</li>
                      ))}
                    </ul>
                    <button className="text-[11px] font-medium text-primary mt-2 hover:underline">Auto-fix with AI →</button>
                  </div>
                </div>
              </div>
            )}

            <Field label="Vendor name" required>
              <input defaultValue={vendor.name} className="w-full px-3 py-2 text-sm rounded-md bg-card border border-border focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary" />
            </Field>

            <div className="grid grid-cols-2 gap-3">
              <Field label="External ID">
                <input defaultValue={vendor.externalId ?? ""} className="w-full px-3 py-2 text-sm rounded-md bg-card border border-border focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary font-mono" />
              </Field>
              <Field label="Category">
                <input defaultValue={vendor.category} className="w-full px-3 py-2 text-sm rounded-md bg-card border border-border focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary" />
              </Field>
            </div>

            <Field label="Status">
              <div className="inline-flex items-center gap-0.5 p-0.5 rounded-md bg-secondary border border-border">
                {(["Active", "Needs review", "Inactive"] as VendorStatus[]).map(s => (
                  <button key={s} className={`text-[11px] font-medium px-2.5 py-1 rounded transition-colors ${vendor.status === s ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}>
                    {s}
                  </button>
                ))}
              </div>
            </Field>

            <div className="space-y-2">
              <div className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">Contact</div>
              <ContactRow icon={Mail} value={vendor.email ?? "—"} />
              <ContactRow icon={Phone} value={vendor.phone ?? "—"} />
              <ContactRow icon={MapPin} value={vendor.address ?? "—"} />
            </div>
          </div>
        )}

        {tab === "aliases" && (
          <div className="px-5 py-4 space-y-4">
            {/* AI suggestions */}
            {vendor.suggestedAliases.length > 0 && (
              <div className="rounded-lg border border-violet-200 dark:border-violet-500/30 bg-gradient-to-br from-violet-50 to-blue-50 dark:from-violet-500/5 dark:to-blue-500/5 p-3">
                <div className="flex items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-1.5">
                    <Sparkles className="h-3.5 w-3.5 text-violet-600 dark:text-violet-400" />
                    <span className="text-xs font-semibold text-foreground">AI-suggested aliases</span>
                    <span className="text-[10px] text-muted-foreground">({vendor.suggestedAliases.length})</span>
                  </div>
                  <button className="text-[11px] font-medium text-violet-700 dark:text-violet-400 hover:underline">Accept all</button>
                </div>
                <div className="space-y-1.5">
                  {vendor.suggestedAliases.map(s => {
                    const accepted = acceptedAliases.has(s.alias);
                    return (
                      <div key={s.alias} className="flex items-center gap-2 p-2 rounded-md bg-card border border-border">
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-xs font-medium text-foreground truncate">{s.alias}</span>
                            <span className="text-[10px] font-semibold text-violet-700 dark:text-violet-400 tabular-nums">
                              {Math.round(s.confidence * 100)}% match
                            </span>
                          </div>
                          <div className="text-[10px] text-muted-foreground mt-0.5 truncate">
                            Seen in {s.docCount} doc{s.docCount > 1 ? "s" : ""} · {s.source}
                          </div>
                        </div>
                        {accepted ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-700 dark:text-emerald-400 px-2 py-1">
                            <CheckCircle2 className="h-3 w-3" /> Added
                          </span>
                        ) : (
                          <>
                            <button className="h-6 w-6 rounded hover:bg-secondary text-muted-foreground hover:text-destructive flex items-center justify-center transition-colors" title="Reject">
                              <X className="h-3 w-3" />
                            </button>
                            <button
                              onClick={() => setAcceptedAliases(prev => new Set(prev).add(s.alias))}
                              className="text-[11px] font-semibold inline-flex items-center gap-1 px-2 py-1 rounded bg-violet-600 text-white hover:bg-violet-700 transition-colors"
                            >
                              <Check className="h-3 w-3" /> Accept
                            </button>
                          </>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">Current aliases ({vendor.aliases.length + acceptedAliases.size})</span>
                <button className="text-[11px] font-medium text-primary hover:underline">+ Add manually</button>
              </div>
              <div className="space-y-1.5">
                {[...vendor.aliases, ...Array.from(acceptedAliases)].map(a => (
                  <div key={a} className="flex items-center gap-2 p-2 rounded-md bg-card border border-border">
                    <Tag className="h-3 w-3 text-muted-foreground shrink-0" />
                    <span className="text-xs text-foreground truncate flex-1">{a}</span>
                    <span className="inline-flex items-center gap-1 text-[10px] text-emerald-700 dark:text-emerald-400">
                      <CheckCircle2 className="h-3 w-3" /> Mapped
                    </span>
                    <Lock className="h-3 w-3 text-muted-foreground" />
                  </div>
                ))}
                {vendor.aliases.length === 0 && acceptedAliases.size === 0 && (
                  <div className="text-[11px] text-muted-foreground py-3 text-center border border-dashed border-border rounded-md">
                    No aliases yet. Accept AI suggestions above to get started.
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {tab === "payment" && (
          <div className="px-5 py-4 space-y-4">
            <Field label="Preferred payment method">
              <div className="inline-flex items-center gap-0.5 p-0.5 rounded-md bg-secondary border border-border flex-wrap">
                {(["ACH", "Wire", "Check", "Virtual Card"] as const).map(m => (
                  <button key={m} className={`text-[11px] font-medium px-2.5 py-1 rounded transition-colors inline-flex items-center gap-1 ${vendor.paymentMethod === m ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}>
                    <Landmark className="h-3 w-3" /> {m}
                  </button>
                ))}
              </div>
            </Field>

            <div className="rounded-lg border border-violet-200 dark:border-violet-500/30 bg-violet-50 dark:bg-violet-500/5 p-3">
              <div className="flex items-start gap-2">
                <Sparkles className="h-3.5 w-3.5 text-violet-600 dark:text-violet-400 mt-0.5 shrink-0" />
                <div className="text-[11px] text-foreground">
                  <span className="font-semibold">AI recommendation:</span> Switch to Virtual Card to earn ~1.5% rebate (≈ $2,100/yr based on YTD spend).
                  <button className="block text-[11px] font-medium text-violet-700 dark:text-violet-400 mt-1 hover:underline">Apply suggestion →</button>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Field label="Routing number">
                <input defaultValue="••••5678" className="w-full px-3 py-2 text-sm rounded-md bg-card border border-border focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary font-mono" />
              </Field>
              <Field label="Account number">
                <input defaultValue="••••4521" className="w-full px-3 py-2 text-sm rounded-md bg-card border border-border focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary font-mono" />
              </Field>
            </div>

            <Field label="Tax ID (EIN)">
              <div className="flex items-center gap-2">
                <input defaultValue={vendor.taxIdMasked ?? ""} className="flex-1 px-3 py-2 text-sm rounded-md bg-card border border-border focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary font-mono" />
                <button className="text-[11px] font-medium px-2.5 py-2 rounded-md border border-border hover:bg-secondary transition-colors inline-flex items-center gap-1">
                  <Shield className="h-3 w-3" /> Verify
                </button>
              </div>
            </Field>

            <Field label="W-9 on file" hint="Auto-extracted from last upload">
              <div className="flex items-center justify-between p-2.5 rounded-md bg-card border border-border">
                <div className="flex items-center gap-2 min-w-0">
                  <FileText className="h-4 w-4 text-muted-foreground shrink-0" />
                  <div className="min-w-0">
                    <div className="text-xs font-medium text-foreground truncate">W9-{vendor.id}-2025.pdf</div>
                    <div className="text-[10px] text-muted-foreground">Uploaded 8 months ago</div>
                  </div>
                </div>
                <button className="text-[11px] font-medium text-primary hover:underline shrink-0">Request refresh</button>
              </div>
            </Field>
          </div>
        )}

        {tab === "activity" && (
          <div className="px-5 py-4 space-y-2">
            {[
              { icon: Sparkles, color: "text-violet-600 dark:text-violet-400", label: "AI accepted alias", detail: "Capitol B.S. → mapped from 4 invoices", when: "2h ago" },
              { icon: FileText, color: "text-blue-600 dark:text-blue-400", label: "Invoice processed", detail: "INV-128267 · $1,544.10", when: "2d ago" },
              { icon: CheckCircle2, color: "text-emerald-600 dark:text-emerald-400", label: "Payment sent", detail: "ACH · $11,600.69", when: "5d ago" },
              { icon: Pencil, color: "text-muted-foreground", label: "Vendor edited by M. Patel", detail: "Updated payment method to ACH", when: "1w ago" },
              { icon: Clock, color: "text-amber-600 dark:text-amber-400", label: "W-9 reminder sent", detail: "Auto-email to ar@…", when: "2w ago" },
            ].map((a, i) => (
              <div key={i} className="flex items-start gap-2.5 p-2.5 rounded-md hover:bg-secondary/50 transition-colors">
                <div className={`h-7 w-7 rounded-md bg-secondary flex items-center justify-center shrink-0 ${a.color}`}>
                  <a.icon className="h-3.5 w-3.5" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-xs font-medium text-foreground">{a.label}</div>
                  <div className="text-[11px] text-muted-foreground truncate">{a.detail}</div>
                </div>
                <div className="text-[10px] text-muted-foreground shrink-0 tabular-nums">{a.when}</div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="px-5 py-3 border-t border-border bg-card flex items-center justify-between gap-2 shrink-0">
        <button className="text-xs font-medium text-destructive hover:underline inline-flex items-center gap-1">
          <Trash2 className="h-3 w-3" /> Delete vendor
        </button>
        <div className="flex items-center gap-2">
          <button onClick={onClose} className="text-sm font-medium px-3 py-2 rounded-md hover:bg-secondary transition-colors">Cancel</button>
          <button className="text-sm font-medium bg-primary text-primary-foreground px-3.5 py-2 rounded-md hover:opacity-90 transition-opacity">
            Save changes
          </button>
        </div>
      </div>
    </>
  );
}

// ---------- helpers ----------
function Field({ label, hint, required, children }: { label: string; hint?: string; required?: boolean; children: React.ReactNode }) {
  return (
    <label className="block min-w-0">
      <div className="flex items-center justify-between mb-1">
        <span className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
          {label} {required && <span className="text-destructive">*</span>}
        </span>
      </div>
      {children}
      {hint && <div className="text-[10px] text-muted-foreground mt-1">{hint}</div>}
    </label>
  );
}

function MiniStat({ label, value, tone }: { label: string; value: string; tone?: "amber" }) {
  return (
    <div className="rounded-md bg-secondary/60 border border-border px-2 py-1.5 min-w-0">
      <div className="text-[9px] font-semibold uppercase tracking-wide text-muted-foreground truncate">{label}</div>
      <div className={`text-xs font-bold tabular-nums truncate ${tone === "amber" ? "text-amber-700 dark:text-amber-400" : "text-foreground"}`}>{value}</div>
    </div>
  );
}

function ContactRow({ icon: Icon, value }: { icon: any; value: string }) {
  return (
    <div className="flex items-center gap-2 text-xs text-foreground">
      <Icon className="h-3 w-3 text-muted-foreground shrink-0" />
      <span className="truncate">{value}</span>
    </div>
  );
}

// ---------------- Merge panel ----------------
function MergeVendorsPanel({ seed, onClose }: { seed: Vendor[]; onClose: () => void }) {
  // If user opened from "Review duplicates" with no seed, show AI-detected duplicate groups first
  const [groupIdx, setGroupIdx] = useState(0);
  const aiGroups: Vendor[][] = useMemo(() => {
    return [
      vendors.filter(v => ["v3"].includes(v.id)).concat(
        // synthesize a duplicate for demo
        [{ ...vendors.find(v => v.id === "v3")!, id: "v3-dup", name: "Apple Computer Inc", externalId: "VEN-2204", docCount: 6, totalSpend: 12_400, amountDue: 0, aliases: ["Apple Computer"], suggestedAliases: [], aiHealth: 0.78, aiHealthIssues: ["Possible duplicate of Apple Inc"] }],
      ),
      vendors.filter(v => ["v4"].includes(v.id)).concat(
        [{ ...vendors.find(v => v.id === "v4")!, id: "v4-dup", name: "Tech Pro Solutions", externalId: "VEN-2310", docCount: 9, totalSpend: 18_900, amountDue: 0, aliases: ["TPS"], suggestedAliases: [], aiHealth: 0.74, aiHealthIssues: ["Possible duplicate of TechPro Inc"] }],
      ),
    ];
  }, []);

  const usingAi = seed.length === 0;
  const candidates: Vendor[] = usingAi ? aiGroups[groupIdx] : seed;

  const [primaryId, setPrimaryId] = useState<string>(
    candidates.reduce((a, b) => (a.docCount >= b.docCount ? a : b)).id,
  );
  const primary = candidates.find(v => v.id === primaryId)!;
  const others = candidates.filter(v => v.id !== primaryId);

  const totalDocs = candidates.reduce((s, v) => s + v.docCount, 0);
  const totalSpend = candidates.reduce((s, v) => s + v.totalSpend, 0);
  const mergedAliases = Array.from(new Set(candidates.flatMap(v => [v.name, ...v.aliases])));

  return (
    <>
      <SheetHeader className="px-5 py-4 border-b border-border shrink-0">
        <div className="flex items-start gap-3">
          <div className="h-10 w-10 rounded-lg bg-violet-500/15 text-violet-700 dark:text-violet-400 flex items-center justify-center shrink-0">
            <GitMerge className="h-5 w-5" />
          </div>
          <div className="min-w-0 flex-1">
            <SheetTitle className="text-base">Merge vendors</SheetTitle>
            <SheetDescription className="text-xs">
              {usingAi
                ? "AI-detected duplicate group. Choose the primary record — others will be merged into it."
                : `Merging ${candidates.length} selected vendors into a single record.`}
            </SheetDescription>
          </div>
        </div>

        {usingAi && aiGroups.length > 1 && (
          <div className="flex items-center gap-2 mt-3">
            <span className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">AI duplicate groups</span>
            <div className="flex items-center gap-0.5 p-0.5 rounded-md bg-secondary border border-border">
              {aiGroups.map((g, i) => (
                <button
                  key={i}
                  onClick={() => { setGroupIdx(i); setPrimaryId(g[0].id); }}
                  className={`text-[11px] font-medium px-2 py-1 rounded transition-colors ${groupIdx === i ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
                >
                  Group {i + 1}
                </button>
              ))}
            </div>
            <span className="ml-auto text-[10px] text-muted-foreground tabular-nums">{groupIdx + 1} of {aiGroups.length}</span>
          </div>
        )}
      </SheetHeader>

      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
        {/* AI confidence banner */}
        <div className="rounded-lg border border-violet-200 dark:border-violet-500/30 bg-violet-50 dark:bg-violet-500/5 p-3">
          <div className="flex items-start gap-2">
            <Sparkles className="h-3.5 w-3.5 text-violet-600 dark:text-violet-400 mt-0.5 shrink-0" />
            <div className="text-[11px] text-foreground min-w-0">
              <span className="font-semibold">AI confidence: {usingAi ? "97%" : "user-initiated"}.</span>{" "}
              {usingAi
                ? "Matched on Tax ID, remit address, and overlapping invoice patterns across 24 documents."
                : "Verify the selected vendors are truly duplicates before merging — this action is irreversible."}
            </div>
          </div>
        </div>

        {/* Choose primary */}
        <div>
          <div className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground mb-2">Choose primary record</div>
          <div className="space-y-1.5">
            {candidates.map(v => {
              const isPrimary = v.id === primaryId;
              return (
                <label
                  key={v.id}
                  className={`flex items-center gap-3 p-2.5 rounded-lg border cursor-pointer transition-colors ${isPrimary ? "border-primary bg-primary/5" : "border-border bg-card hover:bg-secondary/50"}`}
                >
                  <input
                    type="radio"
                    name="primary"
                    checked={isPrimary}
                    onChange={() => setPrimaryId(v.id)}
                    className="text-primary"
                  />
                  <div className="h-8 w-8 rounded-md bg-primary/10 text-primary flex items-center justify-center shrink-0">
                    <Building2 className="h-4 w-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-semibold text-foreground truncate">{v.name}</span>
                      {isPrimary && (
                        <span className="text-[9px] font-bold uppercase tracking-wide px-1.5 py-0.5 rounded bg-primary text-primary-foreground">Primary</span>
                      )}
                      <HealthPill score={v.aiHealth} />
                    </div>
                    <div className="text-[10px] text-muted-foreground mt-0.5 truncate">
                      {v.externalId ?? "no ID"} · {v.docCount} docs · {fmtUSD(v.totalSpend)} YTD
                    </div>
                  </div>
                  {isPrimary && <Check className="h-4 w-4 text-primary shrink-0" />}
                </label>
              );
            })}
          </div>
        </div>

        {/* Merge preview */}
        <div>
          <div className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground mb-2">After merge</div>
          <div className="rounded-lg border border-border bg-card p-3 space-y-2.5">
            <div className="flex items-center gap-2 pb-2 border-b border-border">
              <div className="h-7 w-7 rounded-md bg-primary/10 text-primary flex items-center justify-center shrink-0">
                <Building2 className="h-3.5 w-3.5" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-sm font-semibold text-foreground truncate">{primary.name}</div>
                <div className="text-[10px] text-muted-foreground truncate">{primary.externalId ?? "no external ID"}</div>
              </div>
              <span className="text-[9px] font-bold uppercase tracking-wide px-1.5 py-0.5 rounded bg-primary text-primary-foreground">Survives</span>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <MiniStat label="Docs" value={`${totalDocs}`} />
              <MiniStat label="Spend YTD" value={fmtUSD(totalSpend)} />
              <MiniStat label="Aliases" value={`${mergedAliases.length}`} />
            </div>

            <div>
              <div className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground mb-1.5">Merged aliases</div>
              <div className="flex items-center gap-1 flex-wrap">
                {mergedAliases.map(a => (
                  <span key={a} className="inline-flex items-center gap-1 text-[10px] font-medium rounded px-1.5 py-0.5 bg-secondary text-foreground/80 border border-border">
                    <Tag className="h-2.5 w-2.5" /> {a}
                  </span>
                ))}
              </div>
            </div>

            <div>
              <div className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground mb-1.5">Will merge into primary</div>
              <div className="space-y-1">
                {others.map(v => (
                  <div key={v.id} className="flex items-center gap-2 text-[11px] text-foreground">
                    <span className="truncate flex-1">{v.name}</span>
                    <ArrowRight className="h-3 w-3 text-muted-foreground" />
                    <span className="text-muted-foreground truncate">{primary.name}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-amber-200 dark:border-amber-500/30 bg-amber-50 dark:bg-amber-500/5 p-3">
          <div className="flex items-start gap-2">
            <AlertCircle className="h-3.5 w-3.5 text-amber-700 dark:text-amber-400 mt-0.5 shrink-0" />
            <div className="text-[11px] text-foreground">
              <span className="font-semibold">This action is irreversible.</span> All historical documents, payments, and audit entries from merged vendors will be re-pointed to <span className="font-semibold">{primary.name}</span>.
            </div>
          </div>
        </div>
      </div>

      <div className="px-5 py-3 border-t border-border bg-card flex items-center justify-end gap-2 shrink-0">
        <button onClick={onClose} className="text-sm font-medium px-3 py-2 rounded-md hover:bg-secondary transition-colors">Cancel</button>
        <button
          disabled={candidates.length < 2}
          className="text-sm font-medium bg-primary text-primary-foreground px-3.5 py-2 rounded-md hover:opacity-90 transition-opacity inline-flex items-center gap-1.5 disabled:opacity-50"
        >
          <GitMerge className="h-3.5 w-3.5" /> Merge {candidates.length} vendors
        </button>
      </div>
    </>
  );
}
