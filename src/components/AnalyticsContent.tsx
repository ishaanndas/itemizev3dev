import {
  FileText, Upload, RefreshCw, Bell, HelpCircle, User,
  Search, ChevronDown, Settings, Plug, BookOpen, Users2,
  LogOut, Target, Zap, TrendingUp,
  Lightbulb, AlertTriangle, Activity, Info,
} from "lucide-react";
import { useState, useEffect, useRef } from "react";
import UploadSheet from "./UploadSheet";
import TopBar from "./TopBar";

type AnalyticsTab = "AP Insights" | "Documents" | "Vendors" | "Quality" | "General Analytics";

// ── Insights data ──
const insightStats = [
  { icon: Target, label: "Accuracy", value: "97%", color: "text-emerald-600" },
  { icon: Activity, label: "Avg Speed", value: "24.4s", color: "text-primary" },
  { icon: Zap, label: "Automation", value: "0%", color: "text-amber-500" },
  { icon: TrendingUp, label: "Savings", value: "$29.86", color: "text-emerald-600" },
  { icon: Lightbulb, label: "Insights", value: "0", color: "text-primary" },
  { icon: AlertTriangle, label: "Anomalies", value: "0", color: "text-destructive" },
];

const insightCategories = ["Invoice Matching", "Fraud Detection", "Payment Optimization", "Vendor Intelligence"];
const insightTypes = [
  { label: "All", icon: null },
  { label: "Optimizations", icon: Zap },
  { label: "Anomalies", icon: AlertTriangle },
  { label: "Predictions", icon: TrendingUp },
  { label: "Recommendations", icon: Lightbulb },
];

const insightItems = [
  {
    title: "Document Volume Spike Detected",
    description: "Document volume is 100% higher than last week (6 vs 3). Consider scaling resources.",
    impact: "HIGH IMPACT",
    confidence: "90% confidence",
    actionable: true,
    source: "volume analysis",
    icon: AlertTriangle,
    iconBg: "bg-destructive/10",
    iconColor: "text-destructive",
    type: "Anomalies",
  },
  {
    title: "Processing Speed Degradation",
    description: "Average processing time increased 359% (from 7.2s to 33.0s). Consider reviewing pipeline configuration.",
    impact: "HIGH IMPACT",
    confidence: "85% confidence",
    actionable: true,
    source: "speed analysis",
    icon: Zap,
    iconBg: "bg-amber-50",
    iconColor: "text-amber-600",
    type: "Optimizations",
  },
];

const commandItems = [
  { category: "Pages", items: ["Dashboard", "Invoices", "Purchase Orders", "Receipts", "Vendors", "Reports", "Analytics"] },
  { category: "Actions", items: ["Upload Document", "Create Invoice", "Add Vendor", "Generate Report", "Export Data"] },
  { category: "Settings", items: ["General Settings", "Integrations", "Team Management", "Notifications", "API Keys"] },
];

const profileMenuItems = [
  { icon: User, label: "Your Profile" },
  { icon: Bell, label: "Notifications" },
  { icon: Settings, label: "Settings" },
  { icon: Users2, label: "Team Management" },
  { icon: BookOpen, label: "Management", submenu: ["Ledger", "Chart of Accounts", "Journal Entries", "Custom Fields", "Attribute Mgmt"] },
  { icon: Plug, label: "Integrations", submenu: ["Integrations", "SFTP Ingestion", "Document Retrieval", "Activity History"] },
  { icon: HelpCircle, label: "Help & Support" },
];

function CommandPalette({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setQuery("");
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        if (open) onClose();
        else onClose();
      }
      if (e.key === "Escape" && open) onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, onClose]);

  if (!open) return null;

  const filtered = commandItems
    .map((cat) => ({
      ...cat,
      items: cat.items.filter((item) => item.toLowerCase().includes(query.toLowerCase())),
    }))
    .filter((cat) => cat.items.length > 0);

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[20vh]" onClick={onClose}>
      <div className="fixed inset-0 bg-foreground/20 backdrop-blur-sm" />
      <div
        className="relative w-full max-w-lg bg-card rounded-xl shadow-2xl border border-border overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 px-4 py-3 border-b border-border">
          <Search className="h-4 w-4 text-muted-foreground shrink-0" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search pages, actions, settings..."
            className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none"
          />
          <kbd className="text-[11px] font-medium text-muted-foreground bg-secondary border border-border rounded px-1.5 py-0.5">ESC</kbd>
        </div>
        <div className="max-h-72 overflow-y-auto py-2">
          {filtered.length === 0 && (
            <div className="px-4 py-8 text-center text-sm text-muted-foreground">No results found</div>
          )}
          {filtered.map((cat) => (
            <div key={cat.category}>
              <div className="px-4 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/60">
                {cat.category}
              </div>
              {cat.items.map((item) => (
                <button
                  key={item}
                  className="w-full px-4 py-2 text-sm text-foreground/80 hover:bg-secondary hover:text-foreground flex items-center gap-2 transition-colors"
                  onClick={onClose}
                >
                  {item}
                </button>
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
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    };
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
            <button
              className="w-full px-4 py-2 text-sm text-foreground/80 hover:bg-secondary hover:text-foreground flex items-center justify-between transition-colors"
              onClick={() => item.submenu && setExpandedSubmenu(expandedSubmenu === item.label ? null : item.label)}
            >
              <div className="flex items-center gap-3">
                <item.icon className="h-4 w-4 text-muted-foreground" />
                <span>{item.label}</span>
              </div>
              {item.submenu && (
                <ChevronDown className={`h-3 w-3 text-muted-foreground transition-transform ${expandedSubmenu === item.label ? "" : "-rotate-90"}`} />
              )}
            </button>
            {item.submenu && expandedSubmenu === item.label && (
              <div className="bg-secondary/30">
                {item.submenu.map((sub) => (
                  <button
                    key={sub}
                    className="w-full pl-11 pr-4 py-1.5 text-[13px] text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors text-left"
                  >
                    {sub}
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
      <div className="border-t border-border py-1.5">
        <button className="w-full px-4 py-2 text-sm text-destructive hover:bg-destructive/5 flex items-center gap-3 transition-colors">
          <LogOut className="h-4 w-4" />
          <span>Sign Out</span>
        </button>
      </div>
    </div>
  );
}

function InsightsSection() {
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [activeType, setActiveType] = useState("All");

  const filteredInsights = insightItems.filter(
    (item) => activeType === "All" || item.type === activeType
  );

  return (
    <div className="stat-card mb-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-base font-semibold text-foreground">AP Insights</h2>
          <p className="text-xs text-muted-foreground mt-0.5">Actionable insights for accounts payable automation</p>
        </div>
        <button className="flex items-center gap-2 text-sm font-medium border border-border rounded-lg px-3.5 py-2 hover:bg-secondary transition-colors text-foreground">
          <RefreshCw className="h-3.5 w-3.5" />
          Refresh
        </button>
      </div>

      <div className="grid grid-cols-6 gap-3 mb-6">
        {insightStats.map((stat) => (
          <div key={stat.label} className="rounded-lg border border-border p-3">
            <stat.icon className={`h-4 w-4 ${stat.color} mb-2`} />
            <div className="text-xl font-bold tabular-nums text-foreground">{stat.value}</div>
            <div className="text-[11px] text-muted-foreground">{stat.label}</div>
          </div>
        ))}
      </div>

      <div className="mb-6">
        <h3 className="text-sm font-medium text-foreground mb-3">Processing Summary (Last 30 days)</h3>
        <div className="flex items-center gap-8 text-sm">
          <span className="text-muted-foreground">Total Documents: <span className="font-semibold text-foreground">9</span></span>
          <span className="text-muted-foreground">Successful: <span className="font-semibold text-emerald-600">6</span></span>
          <span className="text-muted-foreground">Failed: <span className="font-semibold text-foreground">0</span></span>
          <span className="text-muted-foreground">With Corrections: <span className="font-semibold text-destructive">9</span></span>
        </div>
      </div>

      <div className="flex gap-6 mb-4 border-b border-border">
        {insightCategories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(activeCategory === cat ? null : cat)}
            className={`pb-2.5 text-sm font-medium transition-colors relative ${
              activeCategory === cat
                ? "text-foreground after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[2px] after:bg-primary after:rounded-full"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className="flex gap-2 mb-6">
        {insightTypes.map((type) => (
          <button
            key={type.label}
            onClick={() => setActiveType(type.label)}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-sm font-medium transition-colors ${
              activeType === type.label
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-secondary hover:text-foreground"
            }`}
          >
            {type.icon && <type.icon className="h-3.5 w-3.5" />}
            {type.label}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {filteredInsights.map((insight) => (
          <div key={insight.title} className="rounded-lg border border-border p-5 flex items-start justify-between gap-4 hover:shadow-sm transition-shadow">
            <div className="flex items-start gap-4">
              <div className={`h-10 w-10 rounded-lg ${insight.iconBg} flex items-center justify-center shrink-0`}>
                <insight.icon className={`h-5 w-5 ${insight.iconColor}`} />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-foreground mb-1">{insight.title}</h4>
                <p className="text-sm text-muted-foreground mb-2">{insight.description}</p>
                <div className="flex items-center gap-3">
                  <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-destructive/10 text-destructive">{insight.impact}</span>
                  <span className="text-xs text-muted-foreground">{insight.confidence}</span>
                  {insight.actionable && (
                    <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700">ACTIONABLE</span>
                  )}
                  <span className="text-xs text-muted-foreground">Source: {insight.source}</span>
                </div>
              </div>
            </div>
            <button className="shrink-0 bg-primary text-primary-foreground text-sm font-medium px-4 py-2 rounded-lg hover:opacity-90 transition-opacity">
              Take Action
            </button>
          </div>
        ))}
        {filteredInsights.length === 0 && (
          <div className="text-center py-8 text-sm text-muted-foreground">No insights found for this filter.</div>
        )}
      </div>

      <div className="mt-6 rounded-lg bg-primary/5 border border-primary/20 p-4 flex items-start gap-3">
        <Info className="h-4 w-4 text-primary shrink-0 mt-0.5" />
        <p className="text-sm text-primary">
          <span className="font-semibold">Real-time data:</span> All metrics and insights are computed from actual document processing data, anomaly detection, quality scores, and pipeline performance. Metrics update as new documents are processed.
        </p>
      </div>
    </div>
  );
}

function PlaceholderTab({ name }: { name: string }) {
  return (
    <div className="stat-card text-center py-16">
      <h2 className="text-lg font-semibold text-foreground mb-2">{name}</h2>
      <p className="text-sm text-muted-foreground">Analytics content for {name} will appear here.</p>
    </div>
  );
}

export default function AnalyticsContent() {
  const [cmdOpen, setCmdOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<AnalyticsTab>("AP Insights");

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setCmdOpen((v) => !v);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-background">
      <TopBar />

      <div className="flex-1 overflow-y-auto">
        <div className="max-w-6xl mx-auto px-6 py-8">
          <div className="flex items-start justify-between mb-8">
            <div>
              <h1 className="text-2xl font-bold text-foreground tracking-tight">Analytics</h1>
              <p className="text-sm text-muted-foreground mt-1">
                Insights, trends, and performance metrics across your AP workflow
              </p>
            </div>
            <button className="flex items-center gap-2 text-sm font-medium border border-border rounded-lg px-3.5 py-2 hover:bg-secondary transition-colors text-foreground">
              <RefreshCw className="h-3.5 w-3.5" />
              Refresh
            </button>
          </div>

          {/* Tabs */}
          <div className="flex gap-0.5 border-b border-border mb-8 overflow-x-auto">
            {(["AP Insights", "Documents", "Vendors", "Quality", "General Analytics"] as AnalyticsTab[]).map(
              (tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-4 py-2.5 text-sm font-medium transition-colors relative whitespace-nowrap ${
                    activeTab === tab
                      ? "text-foreground after:absolute after:bottom-0 after:left-2 after:right-2 after:h-[2px] after:bg-primary after:rounded-full"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {tab}
                </button>
              )
            )}
          </div>

          {activeTab === "AP Insights" && <InsightsSection />}
          {activeTab === "Documents" && <PlaceholderTab name="Documents" />}
          {activeTab === "Vendors" && <PlaceholderTab name="Vendors" />}
          {activeTab === "Quality" && <PlaceholderTab name="Quality" />}
          {activeTab === "General Analytics" && <PlaceholderTab name="General Analytics" />}
        </div>
      </div>
      <UploadSheet open={uploadOpen} onOpenChange={setUploadOpen} />
    </div>
  );
}
