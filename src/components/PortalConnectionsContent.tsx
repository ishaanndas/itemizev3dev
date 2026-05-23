import { useMemo, useState } from "react";
import {
  Globe,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Search,
  Plus,
  RefreshCw,
  Play,
  History,
  MoreHorizontal,
  ChevronDown,
  Pencil,
  KeyRound,
  Pause,
  Trash2,
  Link as LinkIcon,
} from "lucide-react";
import TopBar from "./TopBar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";

type Status = "healthy" | "attention" | "disconnected";

interface Connection {
  id: string;
  name: string;
  portalUrl: string;
  status: Status;
  statusMessage: string;
  docsSynced: number;
  lastSync: string | null;
  schedule: string;
  mfaRelay?: string;
  recentRuns: { date: string; result: "Succeeded" | "Failed"; trigger: string; range: string; files: number; duration: string }[];
}

const CONNECTIONS: Connection[] = [
  {
    id: "comcast",
    name: "Comcast",
    portalUrl: "https://business.comcast.com",
    status: "healthy",
    statusMessage: "22 documents synced",
    docsSynced: 22,
    lastSync: "Apr 16, 9:22 AM",
    schedule: "Manual only",
    mfaRelay: "a4de2a95-207e-42b3-89f3-08d7e2f12613@awp-mfa.itemize.dev",
    recentRuns: [
      { date: "4/16/2026, 9:20:52 AM", result: "Succeeded", trigger: "Manual", range: "Mar 31 – Apr 15, 2026", files: 1, duration: "92s" },
      { date: "4/14/2026, 9:17:30 AM", result: "Succeeded", trigger: "Manual", range: "Sep 30 – Apr 13, 2026", files: 6, duration: "185s" },
      { date: "4/13/2026, 5:04:56 PM", result: "Succeeded", trigger: "Manual", range: "Sep 30 – Apr 12, 2026", files: 0, duration: "215s" },
    ],
  },
  {
    id: "freshbooks",
    name: "FreshBooks",
    portalUrl: "https://freshbooks.com",
    status: "attention",
    statusMessage: "Needs login update · no successful sync in 14 days",
    docsSynced: 0,
    lastSync: "Apr 2, 3:04 PM",
    schedule: "Daily",
    recentRuns: [
      { date: "4/2/2026, 3:04:09 PM", result: "Failed", trigger: "Scheduled", range: "Mar 1 – Apr 2, 2026", files: 0, duration: "12s" },
    ],
  },
  {
    id: "vendor-a",
    name: "Vendor for Customer A",
    portalUrl: "https://test.com",
    status: "healthy",
    statusMessage: "Last sync completed successfully",
    docsSynced: 18,
    lastSync: "Mar 17, 2:07 PM",
    schedule: "Monthly",
    recentRuns: [],
  },
  {
    id: "test-conn-1",
    name: "Test Connection 1",
    portalUrl: "https://freshbooks.com",
    status: "healthy",
    statusMessage: "12 documents synced",
    docsSynced: 12,
    lastSync: "Apr 20, 1:06 PM",
    schedule: "Daily",
    recentRuns: [],
  },
  {
    id: "freshbooks-test",
    name: "FreshBooks (Test)",
    portalUrl: "https://freshbooks.com",
    status: "disconnected",
    statusMessage: "Connection paused by circuit breaker",
    docsSynced: 5,
    lastSync: "Mar 31, 2:04 PM",
    schedule: "Weekly (Tue)",
    recentRuns: [],
  },
  {
    id: "stripe-portal",
    name: "Stripe Billing",
    portalUrl: "https://dashboard.stripe.com",
    status: "healthy",
    statusMessage: "47 documents synced",
    docsSynced: 47,
    lastSync: "Apr 20, 8:00 AM",
    schedule: "Daily",
    recentRuns: [],
  },
  {
    id: "att",
    name: "AT&T Business",
    portalUrl: "https://business.att.com",
    status: "attention",
    statusMessage: "Last sync returned 0 documents",
    docsSynced: 0,
    lastSync: "Apr 18, 6:00 AM",
    schedule: "Weekly (Mon)",
    recentRuns: [],
  },
];

const STATUS_META: Record<Status, { label: string; pill: string; dot: string; ring: string; icon: typeof CheckCircle2 }> = {
  healthy: {
    label: "Healthy",
    pill: "bg-emerald-50 text-emerald-700 border-emerald-200",
    dot: "bg-emerald-500",
    ring: "ring-emerald-100",
    icon: CheckCircle2,
  },
  attention: {
    label: "Needs Attention",
    pill: "bg-amber-50 text-amber-700 border-amber-200",
    dot: "bg-amber-500",
    ring: "ring-amber-100",
    icon: AlertTriangle,
  },
  disconnected: {
    label: "Disconnected",
    pill: "bg-rose-50 text-rose-700 border-rose-200",
    dot: "bg-rose-500",
    ring: "ring-rose-100",
    icon: XCircle,
  },
};

type FilterKey = "all" | Status;

const FILTERS: { key: FilterKey; label: string }[] = [
  { key: "all", label: "All" },
  { key: "healthy", label: "Healthy" },
  { key: "attention", label: "Needs Attention" },
  { key: "disconnected", label: "Disconnected" },
];

function SummaryCard({
  label,
  value,
  Icon,
  tone,
}: {
  label: string;
  value: number;
  Icon: typeof CheckCircle2;
  tone: "neutral" | "emerald" | "amber" | "rose";
}) {
  const toneClass = {
    neutral: "bg-secondary text-foreground",
    emerald: "bg-emerald-50 text-emerald-600",
    amber: "bg-amber-50 text-amber-600",
    rose: "bg-rose-50 text-rose-600",
  }[tone];
  return (
    <div className="rounded-xl border border-border bg-card p-5 transition-shadow hover:shadow-sm">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{label}</p>
          <p className="mt-2 text-3xl font-semibold text-foreground tabular-nums">{value}</p>
        </div>
        <div className={cn("h-9 w-9 rounded-lg flex items-center justify-center", toneClass)}>
          <Icon className="h-[18px] w-[18px]" />
        </div>
      </div>
    </div>
  );
}

function ConnectionCard({ conn }: { conn: Connection }) {
  const meta = STATUS_META[conn.status];
  const StatusIcon = meta.icon;
  const isAttention = conn.status === "attention";
  const isDisconnected = conn.status === "disconnected";

  return (
    <div className="group rounded-xl border border-border bg-card transition-all hover:shadow-md hover:border-border/80">
      <div className="p-5">
        <div className="flex items-start gap-4">
          <div className={cn("h-10 w-10 rounded-lg bg-secondary flex items-center justify-center shrink-0 ring-4", meta.ring)}>
            <Globe className="h-5 w-5 text-muted-foreground" />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-3 flex-wrap">
              <div className="min-w-0">
                <h3 className="text-base font-semibold text-foreground truncate">{conn.name}</h3>
                <p className="text-sm text-muted-foreground mt-0.5">
                  {isDisconnected ? "Disconnected" : isAttention ? "Action needed" : "Connected"} · {conn.statusMessage}
                </p>
              </div>
              <span
                className={cn(
                  "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs font-medium shrink-0",
                  meta.pill,
                )}
              >
                <StatusIcon className="h-3.5 w-3.5" />
                {meta.label}
              </span>
            </div>

            <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 gap-x-6 gap-y-2 text-sm">
              <div>
                <p className="text-xs text-muted-foreground">Last sync</p>
                <p className="text-foreground font-medium tabular-nums">{conn.lastSync ?? "—"}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Schedule</p>
                <p className="text-foreground font-medium">{conn.schedule}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Documents synced</p>
                <p className="text-foreground font-medium tabular-nums">{conn.docsSynced}</p>
              </div>
            </div>

            <div className="mt-5 flex items-center gap-2 flex-wrap">
              {isAttention || isDisconnected ? (
                <Button size="sm">
                  <KeyRound className="h-4 w-4" />
                  Reconnect
                </Button>
              ) : (
                <Button size="sm">
                  <Play className="h-4 w-4" />
                  Run Sync
                </Button>
              )}
              <Button size="sm" variant="outline">
                <History className="h-4 w-4" />
                View History
              </Button>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button size="sm" variant="ghost" className="ml-auto">
                    <MoreHorizontal className="h-4 w-4" />
                    More
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem><Pencil className="h-4 w-4" /> Edit</DropdownMenuItem>
                  <DropdownMenuItem><KeyRound className="h-4 w-4" /> Update Credentials</DropdownMenuItem>
                  <DropdownMenuItem><Pause className="h-4 w-4" /> Pause Connection</DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="text-destructive focus:text-destructive">
                    <Trash2 className="h-4 w-4" /> Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </div>

      <Collapsible>
        <CollapsibleTrigger className="w-full flex items-center justify-between px-5 py-2.5 text-xs font-medium text-muted-foreground hover:text-foreground border-t border-border/60 transition-colors [&[data-state=open]>svg]:rotate-180">
          <span>Technical details</span>
          <ChevronDown className="h-3.5 w-3.5 transition-transform" />
        </CollapsibleTrigger>
        <CollapsibleContent className="px-5 pb-5 pt-1 border-t border-border/60 bg-secondary/30">
          <div className="grid sm:grid-cols-2 gap-4 text-xs mt-3">
            <div>
              <p className="text-muted-foreground mb-1">Portal URL</p>
              <p className="font-mono text-foreground break-all">{conn.portalUrl}</p>
            </div>
            <div>
              <p className="text-muted-foreground mb-1">Connection ID</p>
              <p className="font-mono text-foreground">{conn.id}</p>
            </div>
            {conn.mfaRelay && (
              <div className="sm:col-span-2">
                <p className="text-muted-foreground mb-1">MFA relay</p>
                <p className="font-mono text-foreground break-all">{conn.mfaRelay}</p>
              </div>
            )}
          </div>

          {conn.recentRuns.length > 0 && (
            <div className="mt-5">
              <p className="text-xs font-medium text-foreground mb-2">Recent runs</p>
              <div className="rounded-lg border border-border bg-card divide-y divide-border">
                {conn.recentRuns.map((r, i) => (
                  <div key={i} className="flex items-center justify-between px-3 py-2 text-xs">
                    <div className="flex items-center gap-3 min-w-0">
                      <span
                        className={cn(
                          "inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium border",
                          r.result === "Succeeded"
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                            : "bg-rose-50 text-rose-700 border-rose-200",
                        )}
                      >
                        {r.result}
                      </span>
                      <span className="tabular-nums text-foreground">{r.date}</span>
                      <span className="text-muted-foreground truncate hidden sm:inline">{r.trigger} · {r.range}</span>
                    </div>
                    <span className="tabular-nums text-muted-foreground shrink-0">{r.files} files · {r.duration}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
}

export default function PortalConnectionsContent() {
  const [filter, setFilter] = useState<FilterKey>("all");
  const [query, setQuery] = useState("");

  const counts = useMemo(() => {
    const c = { total: CONNECTIONS.length, healthy: 0, attention: 0, disconnected: 0 };
    CONNECTIONS.forEach((x) => {
      if (x.status === "healthy") c.healthy++;
      else if (x.status === "attention") c.attention++;
      else c.disconnected++;
    });
    return c;
  }, []);

  const filtered = useMemo(() => {
    return CONNECTIONS.filter((c) => {
      if (filter !== "all" && c.status !== filter) return false;
      if (query && !`${c.name} ${c.portalUrl}`.toLowerCase().includes(query.toLowerCase())) return false;
      return true;
    });
  }, [filter, query]);

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-background">
      <TopBar />
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-7xl mx-auto px-6 py-8">
          {/* Header */}
          <div className="flex items-start justify-between gap-4 mb-8 flex-wrap">
            <div className="flex items-start gap-4">
              <div className="h-11 w-11 rounded-xl bg-primary/10 flex items-center justify-center">
                <LinkIcon className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground tracking-tight">Portal Connections</h1>
                <p className="text-sm text-muted-foreground mt-1">Manage document sync connections across portals</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="default">
                <RefreshCw className="h-4 w-4" />
                Refresh
              </Button>
              <Button size="default">
                <Plus className="h-4 w-4" />
                New Connection
              </Button>
            </div>
          </div>

          {/* Summary */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <SummaryCard label="Total Connections" value={counts.total} Icon={Globe} tone="neutral" />
            <SummaryCard label="Healthy" value={counts.healthy} Icon={CheckCircle2} tone="emerald" />
            <SummaryCard label="Needs Attention" value={counts.attention} Icon={AlertTriangle} tone="amber" />
            <SummaryCard label="Disconnected" value={counts.disconnected} Icon={XCircle} tone="rose" />
          </div>

          {/* Search + filters */}
          <div className="flex items-center gap-3 mb-6 flex-wrap">
            <div className="relative flex-1 min-w-[240px] max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search connections..."
                className="pl-9 h-10"
              />
            </div>
            <div className="flex items-center gap-1.5 flex-wrap">
              {FILTERS.map((f) => {
                const active = filter === f.key;
                const count =
                  f.key === "all" ? counts.total :
                  f.key === "healthy" ? counts.healthy :
                  f.key === "attention" ? counts.attention :
                  counts.disconnected;
                return (
                  <button
                    key={f.key}
                    onClick={() => setFilter(f.key)}
                    className={cn(
                      "inline-flex items-center gap-1.5 px-3 h-9 rounded-full text-sm font-medium border transition-colors",
                      active
                        ? "bg-primary text-primary-foreground border-primary"
                        : "bg-card text-muted-foreground border-border hover:text-foreground hover:bg-secondary",
                    )}
                  >
                    {f.key !== "all" && <span className={cn("h-1.5 w-1.5 rounded-full", STATUS_META[f.key as Status].dot)} />}
                    {f.label}
                    <span className={cn("tabular-nums text-xs", active ? "opacity-80" : "text-muted-foreground/70")}>{count}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Cards */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
            {filtered.map((c) => (
              <ConnectionCard key={c.id} conn={c} />
            ))}
          </div>

          {filtered.length === 0 && (
            <div className="rounded-xl border border-dashed border-border bg-card/50 py-16 text-center">
              <p className="text-sm text-muted-foreground">No connections match your filters.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
