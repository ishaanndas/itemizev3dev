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
  LayoutGrid,
  Rows3,
  Download,
  FileText,
  Clock,
  Calendar,
  Mail,
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
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { DataTable, DataTableColumn } from "@/components/data-table/DataTable";
import RowActions from "@/components/data-table/RowActions";
import { cn } from "@/lib/utils";

type Status = "healthy" | "attention" | "disconnected";

interface RunRow {
  id: string;
  date: string;
  result: "Succeeded" | "Failed" | "Partial";
  trigger: "Manual" | "Scheduled";
  range: string;
  files: number;
  duration: string;
  triggeredBy?: string;
  note?: string;
}

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
  recentRuns: RunRow[];
}

const CONNECTIONS: Connection[] = [
  {
    id: "comcast",
    name: "Comcast",
    portalUrl: "https://business.comcast.com",
    status: "healthy",
    statusMessage: "22 bills pulled in",
    docsSynced: 22,
    lastSync: "Apr 16, 9:22 AM",
    schedule: "Manual only",
    mfaRelay: "a4de2a95-207e-42b3-89f3-08d7e2f12613@awp-mfa.itemize.dev",
    recentRuns: [
      { id: "r1", date: "Apr 16, 2026 · 9:20 AM", result: "Succeeded", trigger: "Manual", range: "Mar 31 – Apr 15", files: 1, duration: "1m 32s", triggeredBy: "Ishaan Das" },
      { id: "r2", date: "Apr 14, 2026 · 9:17 AM", result: "Succeeded", trigger: "Manual", range: "Sep 30 – Apr 13", files: 6, duration: "3m 5s", triggeredBy: "Ishaan Das" },
      { id: "r3", date: "Apr 13, 2026 · 5:04 PM", result: "Succeeded", trigger: "Manual", range: "Sep 30 – Apr 12", files: 0, duration: "3m 35s", triggeredBy: "Sarah Chen", note: "No new documents available." },
      { id: "r4", date: "Apr 13, 2026 · 3:28 PM", result: "Succeeded", trigger: "Manual", range: "Sep 30 – Apr 12", files: 0, duration: "2m 34s", triggeredBy: "Sarah Chen" },
      { id: "r5", date: "Apr 10, 2026 · 11:46 AM", result: "Succeeded", trigger: "Manual", range: "Sep 30 – Apr 9", files: 0, duration: "4m 33s", triggeredBy: "Mike Torres" },
      { id: "r6", date: "Apr 9, 2026 · 4:00 PM", result: "Succeeded", trigger: "Manual", range: "Sep 30 – Apr 8", files: 7, duration: "3m 3s", triggeredBy: "Mike Torres" },
    ],
  },
  {
    id: "freshbooks",
    name: "FreshBooks",
    portalUrl: "https://freshbooks.com",
    status: "attention",
    statusMessage: "Login needs to be updated — no successful sync in 14 days",
    docsSynced: 0,
    lastSync: "Apr 2, 3:04 PM",
    schedule: "Daily",
    recentRuns: [
      { id: "r1", date: "Apr 2, 2026 · 3:04 PM", result: "Failed", trigger: "Scheduled", range: "Mar 1 – Apr 2", files: 0, duration: "12s", note: "Login failed — credentials may have changed." },
      { id: "r2", date: "Apr 1, 2026 · 3:04 PM", result: "Failed", trigger: "Scheduled", range: "Feb 28 – Apr 1", files: 0, duration: "11s", note: "Login failed." },
      { id: "r3", date: "Mar 31, 2026 · 3:04 PM", result: "Succeeded", trigger: "Scheduled", range: "Feb 27 – Mar 31", files: 3, duration: "1m 12s" },
    ],
  },
  {
    id: "vendor-a",
    name: "Vendor for Customer A",
    portalUrl: "https://test.com",
    status: "healthy",
    statusMessage: "Last sync went through",
    docsSynced: 18,
    lastSync: "Mar 17, 2:07 PM",
    schedule: "Monthly",
    recentRuns: [
      { id: "r1", date: "Mar 17, 2026 · 2:07 PM", result: "Succeeded", trigger: "Scheduled", range: "Feb 1 – Mar 17", files: 18, duration: "2m 18s" },
    ],
  },
  {
    id: "test-conn-1",
    name: "Test Connection 1",
    portalUrl: "https://freshbooks.com",
    status: "healthy",
    statusMessage: "12 bills pulled in",
    docsSynced: 12,
    lastSync: "Apr 20, 1:06 PM",
    schedule: "Daily",
    recentRuns: [
      { id: "r1", date: "Apr 20, 2026 · 1:06 PM", result: "Succeeded", trigger: "Scheduled", range: "Apr 19 – Apr 20", files: 12, duration: "58s" },
    ],
  },
  {
    id: "freshbooks-test",
    name: "FreshBooks (Test)",
    portalUrl: "https://freshbooks.com",
    status: "disconnected",
    statusMessage: "Connection paused after repeated failures",
    docsSynced: 5,
    lastSync: "Mar 31, 2:04 PM",
    schedule: "Weekly (Tue)",
    recentRuns: [
      { id: "r1", date: "Mar 31, 2026 · 2:04 PM", result: "Failed", trigger: "Scheduled", range: "Mar 24 – Mar 31", files: 0, duration: "8s", note: "Paused automatically after 5 failures." },
    ],
  },
  {
    id: "stripe-portal",
    name: "Stripe Billing",
    portalUrl: "https://dashboard.stripe.com",
    status: "healthy",
    statusMessage: "47 bills pulled in",
    docsSynced: 47,
    lastSync: "Apr 20, 8:00 AM",
    schedule: "Daily",
    recentRuns: [
      { id: "r1", date: "Apr 20, 2026 · 8:00 AM", result: "Succeeded", trigger: "Scheduled", range: "Apr 19 – Apr 20", files: 47, duration: "4m 12s" },
    ],
  },
  {
    id: "att",
    name: "AT&T Business",
    portalUrl: "https://business.att.com",
    status: "attention",
    statusMessage: "Last sync found nothing new — please verify",
    docsSynced: 0,
    lastSync: "Apr 18, 6:00 AM",
    schedule: "Weekly (Mon)",
    recentRuns: [
      { id: "r1", date: "Apr 18, 2026 · 6:00 AM", result: "Partial", trigger: "Scheduled", range: "Apr 11 – Apr 18", files: 0, duration: "45s", note: "Logged in successfully but no documents were available." },
    ],
  },
];

const STATUS_META: Record<Status, { label: string; pill: string; dot: string; ring: string; icon: typeof CheckCircle2; short: string }> = {
  healthy: {
    label: "Healthy",
    short: "Working",
    pill: "bg-emerald-50 text-emerald-700 border-emerald-200",
    dot: "bg-emerald-500",
    ring: "ring-emerald-100",
    icon: CheckCircle2,
  },
  attention: {
    label: "Needs Attention",
    short: "Needs you",
    pill: "bg-amber-50 text-amber-700 border-amber-200",
    dot: "bg-amber-500",
    ring: "ring-amber-100",
    icon: AlertTriangle,
  },
  disconnected: {
    label: "Disconnected",
    short: "Offline",
    pill: "bg-rose-50 text-rose-700 border-rose-200",
    dot: "bg-rose-500",
    ring: "ring-rose-100",
    icon: XCircle,
  },
};

const RESULT_META: Record<RunRow["result"], { pill: string; dot: string }> = {
  Succeeded: { pill: "bg-emerald-50 text-emerald-700 border-emerald-200", dot: "bg-emerald-500" },
  Failed: { pill: "bg-rose-50 text-rose-700 border-rose-200", dot: "bg-rose-500" },
  Partial: { pill: "bg-amber-50 text-amber-700 border-amber-200", dot: "bg-amber-500" },
};

type FilterKey = "all" | Status;

const FILTERS: { key: FilterKey; label: string }[] = [
  { key: "all", label: "All" },
  { key: "healthy", label: "Working" },
  { key: "attention", label: "Needs Attention" },
  { key: "disconnected", label: "Offline" },
];


function ActionMenu() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button size="sm" variant="ghost">
          <MoreHorizontal className="h-4 w-4" />
          More
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-52">
        <DropdownMenuItem><Pencil className="h-4 w-4" /> Edit</DropdownMenuItem>
        <DropdownMenuItem><KeyRound className="h-4 w-4" /> Update login</DropdownMenuItem>
        <DropdownMenuItem><Pause className="h-4 w-4" /> Pause syncing</DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem className="text-destructive focus:text-destructive">
          <Trash2 className="h-4 w-4" /> Remove
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function ConnectionCard({ conn, onHistory }: { conn: Connection; onHistory: (c: Connection) => void }) {
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
                <p className="text-sm text-muted-foreground mt-0.5">{conn.statusMessage}</p>
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
                <p className="text-xs text-muted-foreground">Last checked</p>
                <p className="text-foreground font-medium tabular-nums">{conn.lastSync ?? "Never"}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">How often</p>
                <p className="text-foreground font-medium">{conn.schedule}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Bills pulled in</p>
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
                  Sync Now
                </Button>
              )}
              <Button size="sm" variant="outline" onClick={() => onHistory(conn)}>
                <History className="h-4 w-4" />
                View History
              </Button>
              <div className="ml-auto">
                <ActionMenu />
              </div>
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
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
}


function HistorySheet({ conn, open, onOpenChange }: { conn: Connection | null; open: boolean; onOpenChange: (o: boolean) => void }) {
  if (!conn) return null;
  const meta = STATUS_META[conn.status];
  const totals = conn.recentRuns.reduce(
    (acc, r) => {
      acc.files += r.files;
      if (r.result === "Succeeded") acc.ok++;
      else if (r.result === "Failed") acc.fail++;
      else acc.partial++;
      return acc;
    },
    { files: 0, ok: 0, fail: 0, partial: 0 },
  );

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-xl overflow-y-auto p-0">
        <div className="px-6 pt-6 pb-5 border-b border-border">
          <SheetHeader className="text-left space-y-2">
            <div className="flex items-center gap-3">
              <div className={cn("h-10 w-10 rounded-lg bg-secondary flex items-center justify-center ring-4", meta.ring)}>
                <Globe className="h-5 w-5 text-muted-foreground" />
              </div>
              <div>
                <SheetTitle className="text-lg">{conn.name}</SheetTitle>
                <SheetDescription className="text-xs">Sync history</SheetDescription>
              </div>
            </div>
          </SheetHeader>

          <div className="mt-5 grid grid-cols-3 gap-3">
            <div className="rounded-lg border border-border bg-card p-3">
              <p className="text-[11px] text-muted-foreground uppercase tracking-wide">Successful</p>
              <p className="text-xl font-semibold text-foreground tabular-nums mt-1">{totals.ok}</p>
            </div>
            <div className="rounded-lg border border-border bg-card p-3">
              <p className="text-[11px] text-muted-foreground uppercase tracking-wide">Failed</p>
              <p className="text-xl font-semibold text-foreground tabular-nums mt-1">{totals.fail}</p>
            </div>
            <div className="rounded-lg border border-border bg-card p-3">
              <p className="text-[11px] text-muted-foreground uppercase tracking-wide">Bills pulled</p>
              <p className="text-xl font-semibold text-foreground tabular-nums mt-1">{totals.files}</p>
            </div>
          </div>

          <div className="mt-4 flex items-center gap-2">
            <Button size="sm" variant="outline">
              <Download className="h-4 w-4" />
              Export
            </Button>
            <Button size="sm" variant="outline">
              <Play className="h-4 w-4" />
              Sync Now
            </Button>
          </div>
        </div>

        <div className="px-6 py-5">
          <h4 className="text-sm font-semibold text-foreground mb-3">Recent activity</h4>
          <ol className="relative space-y-3 before:absolute before:left-[15px] before:top-2 before:bottom-2 before:w-px before:bg-border">
            {conn.recentRuns.map((r) => {
              const rm = RESULT_META[r.result];
              return (
                <li key={r.id} className="relative pl-10">
                  <span className={cn("absolute left-[10px] top-3 h-3 w-3 rounded-full ring-4 ring-background", rm.dot)} />
                  <div className="rounded-lg border border-border bg-card p-3.5 hover:shadow-sm transition-shadow">
                    <div className="flex items-start justify-between gap-3 flex-wrap">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className={cn("inline-flex items-center gap-1 px-2 py-0.5 rounded-full border text-[11px] font-medium", rm.pill)}>
                            {r.result}
                          </span>
                          <span className="text-sm font-medium text-foreground tabular-nums">{r.date}</span>
                        </div>
                        <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                          <span className="inline-flex items-center gap-1"><Calendar className="h-3 w-3" />{r.range}</span>
                          <span className="inline-flex items-center gap-1"><Clock className="h-3 w-3" />{r.duration}</span>
                          <span className="inline-flex items-center gap-1"><FileText className="h-3 w-3" />{r.files} {r.files === 1 ? "file" : "files"}</span>
                          <span className="inline-flex items-center gap-1">
                            {r.trigger === "Manual" ? "Started by " : "Auto · "}
                            <span className="text-foreground font-medium">{r.triggeredBy ?? "System"}</span>
                          </span>
                        </div>
                        {r.note && (
                          <p className="mt-2 text-xs text-foreground bg-secondary/60 border border-border rounded-md px-2.5 py-1.5">
                            {r.note}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        {r.files > 0 && (
                          <Button size="sm" variant="ghost">
                            <FileText className="h-3.5 w-3.5" />
                            View files
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </li>
              );
            })}
          </ol>

          {conn.mfaRelay && (
            <div className="mt-6 rounded-lg border border-border bg-secondary/30 p-3 text-xs">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Mail className="h-3.5 w-3.5" />
                <span>Verification codes are routed to:</span>
              </div>
              <p className="mt-1 font-mono text-foreground break-all">{conn.mfaRelay}</p>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}

export default function PortalConnectionsContent() {
  const [filter, setFilter] = useState<FilterKey>("all");
  const [query, setQuery] = useState("");
  const [view, setView] = useState<"cards" | "table">("cards");
  const [historyConn, setHistoryConn] = useState<Connection | null>(null);
  const [historyOpen, setHistoryOpen] = useState(false);

  const openHistory = (c: Connection) => {
    setHistoryConn(c);
    setHistoryOpen(true);
  };

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
                <p className="text-sm text-muted-foreground mt-1">Pull bills automatically from your vendor portals</p>
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

          {/* Search + filters + view toggle */}
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
            <div className="ml-auto inline-flex items-center rounded-lg border border-border bg-card p-0.5">
              <button
                onClick={() => setView("cards")}
                className={cn(
                  "inline-flex items-center gap-1.5 h-8 px-2.5 rounded-md text-xs font-medium transition-colors",
                  view === "cards" ? "bg-secondary text-foreground" : "text-muted-foreground hover:text-foreground",
                )}
              >
                <LayoutGrid className="h-3.5 w-3.5" />
                Cards
              </button>
              <button
                onClick={() => setView("table")}
                className={cn(
                  "inline-flex items-center gap-1.5 h-8 px-2.5 rounded-md text-xs font-medium transition-colors",
                  view === "table" ? "bg-secondary text-foreground" : "text-muted-foreground hover:text-foreground",
                )}
              >
                <Rows3 className="h-3.5 w-3.5" />
                Table
              </button>
            </div>
          </div>

          {/* Content */}
          {view === "cards" ? (
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
              {filtered.map((c) => (
                <ConnectionCard key={c.id} conn={c} onHistory={openHistory} />
              ))}
            </div>
          ) : (
            <DataTable<Connection>
              storageKey="portal-connections"
              data={filtered}
              rowKey={(c) => c.id}
              columns={[
                {
                  key: "name",
                  label: "Connection",
                  accessor: (c) => c.name,
                  width: 260,
                  render: (c) => {
                    const meta = STATUS_META[c.status];
                    return (
                      <div className="flex items-center gap-3 min-w-0">
                        <div className={cn("h-7 w-7 rounded-md bg-secondary flex items-center justify-center shrink-0 ring-2", meta.ring)}>
                          <Globe className="h-3.5 w-3.5 text-muted-foreground" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-foreground truncate">{c.name}</p>
                          <p className="text-xs text-muted-foreground truncate">{c.statusMessage}</p>
                        </div>
                      </div>
                    );
                  },
                },
                {
                  key: "status",
                  label: "Status",
                  accessor: (c) => STATUS_META[c.status].label,
                  width: 150,
                  render: (c) => {
                    const meta = STATUS_META[c.status];
                    const Icon = meta.icon;
                    return (
                      <span className={cn("inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full border text-[11px] font-medium", meta.pill)}>
                        <Icon className="h-3 w-3" />
                        {meta.label}
                      </span>
                    );
                  },
                },
                {
                  key: "lastSync",
                  label: "Last checked",
                  accessor: (c) => c.lastSync ?? "Never",
                  width: 160,
                  render: (c) => <span className="text-xs text-foreground tabular-nums">{c.lastSync ?? "Never"}</span>,
                },
                {
                  key: "schedule",
                  label: "How often",
                  accessor: (c) => c.schedule,
                  width: 130,
                  render: (c) => <span className="text-xs text-foreground">{c.schedule}</span>,
                },
                {
                  key: "docsSynced",
                  label: "Bills pulled",
                  accessor: (c) => String(c.docsSynced),
                  align: "right",
                  width: 110,
                  render: (c) => <span className="text-sm font-semibold tabular-nums text-foreground">{c.docsSynced}</span>,
                },
                {
                  key: "portalUrl",
                  label: "Portal URL",
                  accessor: (c) => c.portalUrl,
                  defaultVisible: false,
                  width: 220,
                  render: (c) => <span className="font-mono text-xs text-muted-foreground truncate">{c.portalUrl}</span>,
                },
              ]}
              renderRowActions={(c) => {
                const isAttention = c.status === "attention" || c.status === "disconnected";
                return (
                  <RowActions
                    review={{ label: "History", onClick: () => openHistory(c), icon: <History className="h-3.5 w-3.5" /> }}
                    primary={
                      isAttention
                        ? { label: "Reconnect", onClick: () => {}, icon: <KeyRound className="h-3.5 w-3.5" /> }
                        : { label: "Sync", onClick: () => {}, icon: <Play className="h-3.5 w-3.5" /> }
                    }
                    more={[
                      { label: "Edit", onClick: () => {}, icon: <Pencil className="h-3.5 w-3.5" /> },
                      { label: "Update login", onClick: () => {}, icon: <KeyRound className="h-3.5 w-3.5" /> },
                      { label: "Pause syncing", onClick: () => {}, icon: <Pause className="h-3.5 w-3.5" /> },
                      { label: "Remove", onClick: () => {}, icon: <Trash2 className="h-3.5 w-3.5" />, destructive: true },
                    ]}
                  />
                );
              }}
            />
          )}

          {filtered.length === 0 && (
            <div className="rounded-xl border border-dashed border-border bg-card/50 py-16 text-center">
              <p className="text-sm text-muted-foreground">No connections match your filters.</p>
            </div>
          )}
        </div>
      </div>

      <HistorySheet conn={historyConn} open={historyOpen} onOpenChange={setHistoryOpen} />
    </div>
  );
}
