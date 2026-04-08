import {
  FileText, Upload, RefreshCw, Bell, HelpCircle, User,
  Download, ArrowUpDown, Settings2, MoreHorizontal, Search,
  ChevronDown, Settings, Plug, BookOpen, Users2,
  Filter, Eye, Clock, ChevronRight, X, LogOut, Home,
} from "lucide-react";
import { useState, useEffect, useRef } from "react";
import UploadSheet from "./UploadSheet";
import { useNavigate } from "react-router-dom";

type DocType = "All" | "Invoice" | "Purchase Order" | "Receipt" | "Document";
type DocStatus = "All" | "Completed" | "Pending" | "Needs Review" | "In Review";

interface Document {
  vendor: string;
  uploadedAt: string;
  type: DocType;
  docNumber: string;
  amount: string;
  status: Exclude<DocStatus, "All">;
}

const documents: Document[] = [
  { vendor: "Unknown Vendor", uploadedAt: "March 16, 2026 at 3:21 PM", type: "Invoice", docNumber: "—", amount: "-", status: "Completed" },
  { vendor: "Unknown Vendor", uploadedAt: "March 10, 2026 at 6:19 PM", type: "Invoice", docNumber: "—", amount: "-", status: "Completed" },
  { vendor: "Apple", uploadedAt: "March 10, 2026 at 5:44 PM", type: "Document", docNumber: "AF32656303", amount: "$1,402.29", status: "Completed" },
  { vendor: "Capitol Building Supply", uploadedAt: "March 10, 2026 at 5:42 PM", type: "Document", docNumber: "128267-00", amount: "$1,544.10", status: "Completed" },
  { vendor: "Wilson Sonsini Goodrich", uploadedAt: "March 10, 2026 at 11:02 AM", type: "Document", docNumber: "2362888", amount: "$277.20", status: "Completed" },
  { vendor: "Apple", uploadedAt: "March 10, 2026 at 10:51 AM", type: "Document", docNumber: "AF32656303", amount: "$1,402.29", status: "Completed" },
  { vendor: "Unknown Vendor", uploadedAt: "March 9, 2026 at 7:20 PM", type: "Invoice", docNumber: "—", amount: "-", status: "Needs Review" },
  { vendor: "TechPro Inc", uploadedAt: "March 8, 2026 at 2:15 PM", type: "Purchase Order", docNumber: "PO-2024-0123", amount: "$11,600.69", status: "In Review" },
  { vendor: "CloudHost Co", uploadedAt: "March 7, 2026 at 9:30 AM", type: "Receipt", docNumber: "REC-0055", amount: "$17,000.00", status: "Pending" },
  { vendor: "Office Depot", uploadedAt: "March 6, 2026 at 4:45 PM", type: "Purchase Order", docNumber: "PO-2024-0124", amount: "$3,250.00", status: "Completed" },
];

const statusColors: Record<string, string> = {
  Completed: "text-emerald-600",
  Pending: "text-amber-600",
  "Needs Review": "text-rose-600",
  "In Review": "text-blue-600",
};

const statusDot: Record<string, string> = {
  Completed: "bg-emerald-500",
  Pending: "bg-amber-500",
  "Needs Review": "bg-rose-500",
  "In Review": "bg-blue-500",
};

const docTypeOptions: Exclude<DocType, "All">[] = ["Invoice", "Purchase Order", "Receipt", "Document"];
const docStatuses: DocStatus[] = ["All", "Completed", "Pending", "Needs Review", "In Review"];

const profileMenuItems = [
  { icon: User, label: "Your Profile" },
  { icon: Bell, label: "Notifications" },
  { icon: Settings, label: "Settings" },
  { icon: Users2, label: "Team Management" },
  { icon: BookOpen, label: "Management", submenu: ["Ledger", "Chart of Accounts", "Journal Entries", "Custom Fields", "Attribute Mgmt"] },
  { icon: Plug, label: "Integrations", submenu: ["Integrations", "SFTP Ingestion", "Document Retrieval", "Activity History"] },
  { icon: HelpCircle, label: "Help & Support" },
];

const commandItems = [
  { category: "Pages", items: ["Dashboard", "Documents", "Vendors", "Reports", "Analytics"] },
  { category: "Actions", items: ["Upload Document", "Create Invoice", "Add Vendor", "Generate Report", "Export Data"] },
  { category: "Settings", items: ["General Settings", "Integrations", "Team Management", "Notifications"] },
];

function CommandPalette({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) { setQuery(""); setTimeout(() => inputRef.current?.focus(), 50); }
  }, [open]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape" && open) onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, onClose]);

  if (!open) return null;

  const filtered = commandItems
    .map((cat) => ({ ...cat, items: cat.items.filter((item) => item.toLowerCase().includes(query.toLowerCase())) }))
    .filter((cat) => cat.items.length > 0);

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[20vh]" onClick={onClose}>
      <div className="fixed inset-0 bg-foreground/20 backdrop-blur-sm" />
      <div className="relative w-full max-w-lg bg-card rounded-xl shadow-2xl border border-border overflow-hidden" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center gap-3 px-4 py-3 border-b border-border">
          <Search className="h-4 w-4 text-muted-foreground shrink-0" />
          <input ref={inputRef} value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search pages, actions, settings..." className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none" />
          <kbd className="text-[11px] font-medium text-muted-foreground bg-secondary border border-border rounded px-1.5 py-0.5">ESC</kbd>
        </div>
        <div className="max-h-72 overflow-y-auto py-2">
          {filtered.length === 0 && <div className="px-4 py-8 text-center text-sm text-muted-foreground">No results found</div>}
          {filtered.map((cat) => (
            <div key={cat.category}>
              <div className="px-4 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/60">{cat.category}</div>
              {cat.items.map((item) => (
                <button key={item} className="w-full px-4 py-2 text-sm text-foreground/80 hover:bg-secondary hover:text-foreground flex items-center gap-2 transition-colors" onClick={onClose}>{item}</button>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function ProfileDropdown({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [expandedSubmenu, setExpandedSubmenu] = useState<string | null>(null);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) { setExpandedSubmenu(null); return; }
    const handler = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) onClose(); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div ref={ref} className="absolute right-0 top-full mt-2 w-64 bg-card rounded-xl shadow-xl border border-border overflow-hidden z-50">
      <div className="px-4 py-3 border-b border-border">
        <div className="text-sm font-semibold text-foreground">Jane Doe</div>
        <div className="text-xs text-muted-foreground">jane@acme.com</div>
      </div>
      <div className="py-1.5">
        {profileMenuItems.map((item) => (
          <div key={item.label}>
            <button className="w-full px-4 py-2 text-sm text-foreground/80 hover:bg-secondary hover:text-foreground flex items-center justify-between transition-colors" onClick={() => item.submenu && setExpandedSubmenu(expandedSubmenu === item.label ? null : item.label)}>
              <div className="flex items-center gap-3"><item.icon className="h-4 w-4 text-muted-foreground" /><span>{item.label}</span></div>
              {item.submenu && <ChevronDown className={`h-3 w-3 text-muted-foreground transition-transform ${expandedSubmenu === item.label ? "" : "-rotate-90"}`} />}
            </button>
            {item.submenu && expandedSubmenu === item.label && (
              <div className="bg-secondary/30">
                {item.submenu.map((sub) => (
                  <button key={sub} className="w-full pl-11 pr-4 py-1.5 text-[13px] text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors text-left">{sub}</button>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
      <div className="border-t border-border py-1.5">
        <button className="w-full px-4 py-2 text-sm text-destructive hover:bg-destructive/5 flex items-center gap-3 transition-colors">
          <LogOut className="h-4 w-4" /><span>Sign Out</span>
        </button>
      </div>
    </div>
  );
}

function SelectDropdown({ value, options, onChange, label }: { value: string; options: string[]; onChange: (v: string) => void; label: string }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button onClick={() => setOpen(!open)} className="flex items-center gap-2 px-3 py-2 rounded-lg border border-border hover:bg-secondary transition-colors text-sm text-foreground min-w-[140px] justify-between">
        <span>{value === "All" ? label : value}</span>
        <ChevronDown className={`h-3.5 w-3.5 text-muted-foreground transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <div className="absolute top-full mt-1 right-0 w-full min-w-[160px] bg-card rounded-lg shadow-lg border border-border z-20 py-1">
          {options.map((opt) => (
            <button key={opt} onClick={() => { onChange(opt); setOpen(false); }} className={`w-full px-3 py-2 text-sm text-left hover:bg-secondary transition-colors ${value === opt ? "text-primary font-medium" : "text-foreground"}`}>
              {opt === "All" ? `${label}` : opt}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function MultiSelectDropdown({ selected, options, onChange, label }: { selected: string[]; options: string[]; onChange: (v: string[]) => void; label: string }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const toggle = (opt: string) => {
    if (selected.includes(opt)) onChange(selected.filter((s) => s !== opt));
    else onChange([...selected, opt]);
  };

  const displayLabel = selected.length === 0 ? label : selected.length === 1 ? selected[0] : `${selected.length} types`;

  return (
    <div ref={ref} className="relative">
      <button onClick={() => setOpen(!open)} className="flex items-center gap-2 px-3 py-2 rounded-lg border border-border hover:bg-secondary transition-colors text-sm text-foreground min-w-[140px] justify-between">
        <span>{displayLabel}</span>
        <ChevronDown className={`h-3.5 w-3.5 text-muted-foreground transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <div className="absolute top-full mt-1 right-0 w-full min-w-[180px] bg-card rounded-lg shadow-lg border border-border z-20 py-1">
          {selected.length > 0 && (
            <button onClick={() => onChange([])} className="w-full px-3 py-2 text-xs text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors text-left border-b border-border mb-1">
              Clear selection
            </button>
          )}
          {options.map((opt) => (
            <button key={opt} onClick={() => toggle(opt)} className={`w-full px-3 py-2 text-sm text-left hover:bg-secondary transition-colors flex items-center gap-2 ${selected.includes(opt) ? "text-primary font-medium" : "text-foreground"}`}>
              <span className={`h-3.5 w-3.5 rounded border flex items-center justify-center shrink-0 ${selected.includes(opt) ? "bg-primary border-primary" : "border-border"}`}>
                {selected.includes(opt) && <span className="text-[10px] text-primary-foreground">✓</span>}
              </span>
              {opt}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default function DocumentsContent() {
  const [cmdOpen, setCmdOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilters, setTypeFilters] = useState<string[]>([]);
  const navigate = useNavigate();
  const [statusFilter, setStatusFilter] = useState<DocStatus>("All");

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") { e.preventDefault(); setCmdOpen((v) => !v); }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  const filteredDocs = documents.filter((doc) => {
    const matchesSearch = searchQuery === "" || doc.vendor.toLowerCase().includes(searchQuery.toLowerCase()) || doc.docNumber.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = typeFilters.length === 0 || typeFilters.includes(doc.type);
    const matchesStatus = statusFilter === "All" || doc.status === statusFilter;
    return matchesSearch && matchesType && matchesStatus;
  });

  const activeFilters = (typeFilters.length > 0 ? 1 : 0) + (statusFilter !== "All" ? 1 : 0);

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-background">
      {/* Top bar */}
      <header className="nav-dark-bar h-14 flex items-center justify-between px-6 shrink-0">
        <button onClick={() => setCmdOpen(true)} className="flex items-center gap-2.5 px-3 py-1.5 rounded-lg border border-white/15 hover:border-white/25 bg-white/10 hover:bg-white/15 transition-all text-sm text-white/60 w-72">
          <Search className="h-3.5 w-3.5" />
          <span className="flex-1 text-left">Search...</span>
          <kbd className="text-[11px] font-medium bg-white/10 border border-white/15 rounded px-1.5 py-0.5 text-white/50">⌘K</kbd>
        </button>
        <div className="flex items-center gap-1.5">
          <button onClick={() => setUploadOpen(true)} className="flex items-center gap-2 text-sm font-medium bg-white text-[hsl(220,50%,14%)] rounded-lg px-3.5 py-2 hover:bg-white/90 transition-all shadow-sm">
            <Upload className="h-3.5 w-3.5" />
            Upload
          </button>
          <button className="h-9 w-9 rounded-lg flex items-center justify-center hover:bg-white/10 transition-colors">
            <HelpCircle className="h-[18px] w-[18px] text-white/60" />
          </button>
          <button className="h-9 w-9 rounded-lg flex items-center justify-center hover:bg-white/10 transition-colors relative">
            <Bell className="h-[18px] w-[18px] text-white/60" />
            <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-primary" />
          </button>
          <div className="relative ml-1">
            <button onClick={() => setProfileOpen(!profileOpen)} className="flex items-center gap-2.5 rounded-lg px-2 py-1 hover:bg-white/10 transition-colors">
              <div className="h-8 w-8 rounded-full bg-gradient-to-br from-white/30 to-white/20 flex items-center justify-center">
                <span className="text-xs font-semibold text-white">JD</span>
              </div>
              <div className="text-left hidden lg:block">
                <div className="text-[13px] font-medium text-white leading-tight">Jane Doe</div>
                <div className="text-[11px] text-white/50 leading-tight">Admin</div>
              </div>
              <ChevronDown className="h-3 w-3 text-white/50 hidden lg:block" />
            </button>
            <ProfileDropdown open={profileOpen} onClose={() => setProfileOpen(false)} />
          </div>
        </div>
      </header>

      <CommandPalette open={cmdOpen} onClose={() => setCmdOpen(false)} />

      {/* Page content */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-7xl mx-auto px-6 py-8">
          {/* Breadcrumb */}
          <div className="flex items-center gap-1.5 text-sm text-muted-foreground mb-6">
            <Home className="h-3.5 w-3.5" />
            <span>Accounts Payable</span>
            <ChevronRight className="h-3 w-3" />
            <span>AP</span>
            <ChevronRight className="h-3 w-3" />
            <span className="font-medium text-foreground">Documents</span>
          </div>

          {/* Page header */}
          <div className="flex items-start justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-foreground tracking-tight">Documents</h1>
              <p className="text-sm text-muted-foreground mt-1">View and manage all your documents (invoices, receipts, purchase orders, and more)</p>
            </div>
            <div className="flex items-center gap-2">
              <button className="flex items-center gap-2 text-sm font-medium border border-border rounded-lg px-3.5 py-2 hover:bg-secondary transition-colors text-foreground">
                <ArrowUpDown className="h-3.5 w-3.5" />
                Assign Workflow (0)
              </button>
              <button onClick={() => setUploadOpen(true)} className="flex items-center gap-2 text-sm font-medium bg-primary text-primary-foreground rounded-lg px-4 py-2 hover:opacity-90 transition-all shadow-sm">
                <Upload className="h-3.5 w-3.5" />
                Upload Document
              </button>
            </div>
          </div>

          {/* Last updated */}
          <div className="flex justify-end mb-4">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Clock className="h-3 w-3" />
              <span>Last updated just now</span>
              <button className="hover:text-foreground transition-colors">
                <RefreshCw className="h-3 w-3" />
              </button>
            </div>
          </div>

          {/* Search & Filters */}
          <div className="flex items-center gap-3 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search documents..."
                className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-border bg-card text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/20 focus:border-primary/50 transition-all"
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery("")} className="absolute right-3 top-1/2 -translate-y-1/2">
                  <X className="h-3.5 w-3.5 text-muted-foreground hover:text-foreground" />
                </button>
              )}
            </div>
            <MultiSelectDropdown selected={typeFilters} options={docTypeOptions} onChange={setTypeFilters} label="All Types" />
            <SelectDropdown value={statusFilter} options={docStatuses} onChange={(v) => setStatusFilter(v as DocStatus)} label="All Statuses" />
          </div>

          {/* Active filter chips */}
          {activeFilters > 0 && (
            <div className="flex items-center gap-2 mb-4">
              <Filter className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">Filters:</span>
              {typeFilters.map((t) => (
                <span key={t} className="flex items-center gap-1 text-xs font-medium bg-primary/10 text-primary rounded-full px-2.5 py-1">
                  {t}
                  <button onClick={() => setTypeFilters(typeFilters.filter((f) => f !== t))}><X className="h-3 w-3" /></button>
                </span>
              ))}
              {statusFilter !== "All" && (
                <span className="flex items-center gap-1 text-xs font-medium bg-primary/10 text-primary rounded-full px-2.5 py-1">
                  {statusFilter}
                  <button onClick={() => setStatusFilter("All")}><X className="h-3 w-3" /></button>
                </span>
              )}
              <button onClick={() => { setTypeFilters([]); setStatusFilter("All"); }} className="text-xs text-muted-foreground hover:text-foreground transition-colors underline">
                Clear all
              </button>
            </div>
          )}

          {/* Documents Table */}
          <div className="bg-card rounded-xl border border-border overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="bg-secondary/40 border-b border-border">
                    <th className="text-left px-3 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider w-10 border-r border-border">
                      <input type="checkbox" className="h-4 w-4 rounded border-border text-primary accent-primary" />
                    </th>
                    <th className="text-left px-3 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider whitespace-nowrap border-r border-border/40">Vendor Name</th>
                    <th className="text-left px-3 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider whitespace-nowrap border-r border-border/40">Uploaded At</th>
                    <th className="text-left px-3 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider whitespace-nowrap border-r border-border/40">Document Type</th>
                    <th className="text-left px-3 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider whitespace-nowrap border-r border-border/40">Document #</th>
                    <th className="text-right px-3 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider whitespace-nowrap border-r border-border/40">Amount</th>
                    <th className="text-left px-3 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider whitespace-nowrap border-r border-border/40">Processing</th>
                    <th className="w-20 border-l border-border"></th>
                  </tr>
                </thead>
                <tbody>
                  {filteredDocs.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="px-4 py-12 text-center text-sm text-muted-foreground">
                        No documents match your filters
                      </td>
                    </tr>
                  ) : (
                    filteredDocs.map((doc, i) => {
                      const rowBg = i % 2 === 0 ? "bg-background" : "bg-muted/30";
                      return (
                        <tr key={i} className={`border-b border-border last:border-b-0 transition-colors ${rowBg} hover:bg-secondary/50 group cursor-pointer`} onClick={() => navigate(`/documents/${doc.docNumber !== "—" ? doc.docNumber : doc.vendor.replace(/\s/g, "-").toLowerCase()}`)}>
                          <td className={`px-3 py-3.5 border-r border-border ${rowBg}`}>
                            <input type="checkbox" className="h-4 w-4 rounded border-border text-primary accent-primary" />
                          </td>
                          <td className="px-3 py-3.5 font-medium text-foreground whitespace-nowrap border-r border-border/40">{doc.vendor}</td>
                          <td className="px-3 py-3.5 text-foreground whitespace-nowrap border-r border-border/40">{doc.uploadedAt}</td>
                          <td className="px-3 py-3.5 whitespace-nowrap border-r border-border/40">
                            <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full border ${
                              doc.type === "Invoice" ? "bg-blue-50 text-blue-700 border-blue-200" :
                              doc.type === "Purchase Order" ? "bg-orange-50 text-orange-700 border-orange-200" :
                              doc.type === "Receipt" ? "bg-cyan-50 text-cyan-700 border-cyan-200" :
                              "bg-violet-50 text-violet-700 border-violet-200"
                            }`}>
                              {doc.type}
                            </span>
                          </td>
                          <td className="px-3 py-3.5 text-foreground whitespace-nowrap border-r border-border/40">{doc.docNumber}</td>
                          <td className="px-3 py-3.5 text-right tabular-nums font-medium text-foreground whitespace-nowrap border-r border-border/40">{doc.amount}</td>
                          <td className="px-3 py-3.5 whitespace-nowrap border-r border-border/40">
                            <span className={`text-[11px] font-medium px-2.5 py-1 rounded-full border ${
                              doc.status === "Completed" ? "bg-emerald-50 text-emerald-700 border-emerald-200" :
                              doc.status === "Pending" ? "bg-amber-50 text-amber-700 border-amber-200" :
                              doc.status === "Needs Review" ? "bg-destructive/10 text-destructive border-destructive/20" :
                              "bg-blue-50 text-blue-700 border-blue-200"
                            }`}>
                              {doc.status}
                            </span>
                          </td>
                          <td className={`px-3 py-3.5 border-l border-border ${rowBg}`}>
                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button className="h-7 w-7 rounded flex items-center justify-center hover:bg-secondary transition-colors">
                                <Eye className="h-3.5 w-3.5 text-muted-foreground" />
                              </button>
                              <button className="h-7 w-7 rounded flex items-center justify-center hover:bg-secondary transition-colors">
                                <MoreHorizontal className="h-3.5 w-3.5 text-muted-foreground" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Table footer */}
            <div className="flex items-center justify-between px-4 py-3 border-t border-border bg-secondary/20">
              <span className="text-xs text-muted-foreground">
                Showing {filteredDocs.length} of {documents.length} documents
              </span>
              <div className="flex items-center gap-2">
                <button className="text-xs text-muted-foreground hover:text-foreground px-2 py-1 rounded hover:bg-secondary transition-colors">Previous</button>
                <span className="text-xs font-medium text-foreground bg-primary/10 rounded px-2 py-1">1</span>
                <button className="text-xs text-muted-foreground hover:text-foreground px-2 py-1 rounded hover:bg-secondary transition-colors">Next</button>
              </div>
            </div>
          </div>
        </div>
      </div>
      <UploadSheet open={uploadOpen} onOpenChange={setUploadOpen} />
    </div>
  );
}
