import { useEffect, useRef, useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Globe,
  KeyRound,
  Eye,
  EyeOff,
  CheckCircle2,
  Loader2,
  ShieldCheck,
  FileText,
  PlugZap,
  Play,
  XCircle,
  Sparkles,
  ArrowRight,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface ConnectionLite {
  id: string;
  name: string;
}

// ─────────────────────────────────────────────────────────────
// RunSheet — guided manual run with animated progress
// ─────────────────────────────────────────────────────────────

type Phase = "setup" | "running" | "success" | "error";

interface Step {
  key: string;
  label: string;
  detail?: string;
  icon: typeof PlugZap;
}

const STEPS: Step[] = [
  { key: "connect", label: "Connecting to portal", icon: PlugZap },
  { key: "signin", label: "Signing in securely", icon: ShieldCheck },
  { key: "scan", label: "Looking for new bills", icon: Globe },
  { key: "fetch", label: "Downloading documents", icon: FileText },
];

function defaultRange() {
  const to = new Date();
  const from = new Date();
  from.setDate(to.getDate() - 30);
  const fmt = (d: Date) => d.toISOString().slice(0, 10);
  return { from: fmt(from), to: fmt(to) };
}

export function RunSheet({
  conn,
  open,
  onOpenChange,
}: {
  conn: ConnectionLite | null;
  open: boolean;
  onOpenChange: (o: boolean) => void;
}) {
  const [phase, setPhase] = useState<Phase>("setup");
  const [stepIdx, setStepIdx] = useState(0);
  const [range, setRange] = useState(defaultRange());
  const [filesFound, setFilesFound] = useState(0);
  const timersRef = useRef<number[]>([]);

  // Reset on open
  useEffect(() => {
    if (open) {
      setPhase("setup");
      setStepIdx(0);
      setFilesFound(0);
      setRange(defaultRange());
    }
    return () => {
      timersRef.current.forEach(clearTimeout);
      timersRef.current = [];
    };
  }, [open, conn?.id]);

  const startRun = () => {
    setPhase("running");
    setStepIdx(0);
    setFilesFound(0);

    // Advance through steps
    const stepDurations = [900, 1100, 1300, 1700];
    let acc = 0;
    stepDurations.forEach((d, i) => {
      acc += d;
      const t = window.setTimeout(() => {
        setStepIdx(i + 1);
        if (i === 2) {
          // simulate file counter while in fetch step
          let n = 0;
          const target = Math.floor(Math.random() * 8) + 2;
          const tick = window.setInterval(() => {
            n++;
            setFilesFound(n);
            if (n >= target) window.clearInterval(tick);
          }, 180);
        }
      }, acc);
      timersRef.current.push(t);
    });

    // Finish
    const done = window.setTimeout(() => {
      setPhase("success");
    }, acc + 300);
    timersRef.current.push(done);
  };

  const cancelRun = () => {
    timersRef.current.forEach(clearTimeout);
    timersRef.current = [];
    setPhase("setup");
    setStepIdx(0);
    setFilesFound(0);
  };

  if (!conn) return null;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-md overflow-y-auto p-0">
        <div className="px-6 pt-6 pb-5 border-b border-border">
          <SheetHeader className="text-left">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Play className="h-5 w-5 text-primary" />
              </div>
              <div>
                <SheetTitle className="text-lg">Run sync now</SheetTitle>
                <SheetDescription className="text-xs">
                  {conn.name}
                </SheetDescription>
              </div>
            </div>
          </SheetHeader>
        </div>

        <div className="px-6 py-5">
          {phase === "setup" && (
            <div className="space-y-5 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <p className="text-sm text-muted-foreground">
                We'll log in to <span className="font-medium text-foreground">{conn.name}</span> and pull any new bills from the date range below.
              </p>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="from" className="text-xs">From</Label>
                  <Input
                    id="from"
                    type="date"
                    value={range.from}
                    onChange={(e) => setRange((r) => ({ ...r, from: e.target.value }))}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="to" className="text-xs">To</Label>
                  <Input
                    id="to"
                    type="date"
                    value={range.to}
                    onChange={(e) => setRange((r) => ({ ...r, to: e.target.value }))}
                  />
                </div>
              </div>

              <p className="text-xs text-muted-foreground -mt-1">
                Defaults to the last 30 days. Adjust if you need to pull older bills.
              </p>

              <div className="rounded-lg border border-border bg-secondary/40 p-3 text-xs text-muted-foreground flex gap-2">
                <Sparkles className="h-3.5 w-3.5 mt-0.5 shrink-0 text-primary" />
                <span>
                  This runs in the background — you can close this panel any time and we'll keep working.
                </span>
              </div>

              <div className="flex items-center justify-end gap-2 pt-1">
                <Button variant="outline" onClick={() => onOpenChange(false)}>
                  Cancel
                </Button>
                <Button onClick={startRun}>
                  <Play className="h-4 w-4" />
                  Start run
                </Button>
              </div>
            </div>
          )}

          {phase === "running" && (
            <div className="space-y-5 animate-in fade-in duration-200">
              <div className="rounded-xl border border-border bg-card p-4">
                <div className="flex items-center gap-3">
                  <div className="relative h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <Loader2 className="h-5 w-5 text-primary animate-spin" />
                    <span className="absolute inset-0 rounded-full ring-2 ring-primary/30 animate-ping" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">Running sync</p>
                    <p className="text-xs text-muted-foreground">
                      {range.from} → {range.to}
                    </p>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="mt-4 h-1.5 w-full overflow-hidden rounded-full bg-secondary">
                  <div
                    className="h-full bg-primary transition-all duration-500 ease-out"
                    style={{ width: `${Math.min(100, (stepIdx / STEPS.length) * 100)}%` }}
                  />
                </div>
              </div>

              <ol className="space-y-2">
                {STEPS.map((s, i) => {
                  const state =
                    i < stepIdx ? "done" : i === stepIdx ? "active" : "pending";
                  const Icon = s.icon;
                  return (
                    <li
                      key={s.key}
                      className={cn(
                        "flex items-center gap-3 rounded-lg border px-3 py-2.5 transition-all duration-300",
                        state === "done" && "border-emerald-200 bg-emerald-50/50",
                        state === "active" && "border-primary/40 bg-primary/5 shadow-sm",
                        state === "pending" && "border-border bg-card opacity-60",
                      )}
                    >
                      <div
                        className={cn(
                          "h-7 w-7 rounded-full flex items-center justify-center shrink-0 transition-colors",
                          state === "done" && "bg-emerald-500 text-white",
                          state === "active" && "bg-primary text-primary-foreground",
                          state === "pending" && "bg-secondary text-muted-foreground",
                        )}
                      >
                        {state === "done" ? (
                          <CheckCircle2 className="h-4 w-4" />
                        ) : state === "active" ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <Icon className="h-3.5 w-3.5" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p
                          className={cn(
                            "text-sm font-medium",
                            state === "pending"
                              ? "text-muted-foreground"
                              : "text-foreground",
                          )}
                        >
                          {s.label}
                        </p>
                        {state === "active" && s.key === "fetch" && filesFound > 0 && (
                          <p className="text-xs text-muted-foreground tabular-nums mt-0.5">
                            {filesFound} {filesFound === 1 ? "bill" : "bills"} found so far…
                          </p>
                        )}
                      </div>
                    </li>
                  );
                })}
              </ol>

              <div className="flex items-center justify-end gap-2 pt-1">
                <Button variant="outline" onClick={cancelRun}>
                  Cancel
                </Button>
              </div>
            </div>
          )}

          {phase === "success" && (
            <div className="space-y-5 animate-in fade-in zoom-in-95 duration-300">
              <div className="rounded-xl border border-emerald-200 bg-emerald-50/60 p-5 text-center">
                <div className="mx-auto h-14 w-14 rounded-full bg-emerald-500 flex items-center justify-center animate-in zoom-in-50 duration-500">
                  <CheckCircle2 className="h-8 w-8 text-white" />
                </div>
                <p className="mt-4 text-base font-semibold text-foreground">
                  All done
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Pulled{" "}
                  <span className="font-semibold text-foreground tabular-nums">
                    {filesFound}
                  </span>{" "}
                  new {filesFound === 1 ? "bill" : "bills"} from {conn.name}.
                </p>
              </div>

              <div className="rounded-lg border border-border bg-card p-3 text-xs space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Date range</span>
                  <span className="text-foreground tabular-nums">{range.from} → {range.to}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Bills pulled</span>
                  <span className="text-foreground font-semibold tabular-nums">{filesFound}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Status</span>
                  <span className="text-emerald-700 font-medium">Succeeded</span>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2">
                <Button variant="outline" onClick={() => onOpenChange(false)}>
                  Close
                </Button>
                <Button onClick={() => onOpenChange(false)}>
                  View bills
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}

// ─────────────────────────────────────────────────────────────
// CredentialsSheet — friendly rotate/update-login flow
// ─────────────────────────────────────────────────────────────

type CredPhase = "form" | "saving" | "success";

export function CredentialsSheet({
  conn,
  open,
  onOpenChange,
}: {
  conn: ConnectionLite | null;
  open: boolean;
  onOpenChange: (o: boolean) => void;
}) {
  const [phase, setPhase] = useState<CredPhase>("form");
  const [showPw, setShowPw] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    if (open) {
      setPhase("form");
      setShowPw(false);
      setUsername("");
      setPassword("");
    }
    return () => {
      if (timerRef.current) window.clearTimeout(timerRef.current);
    };
  }, [open, conn?.id]);

  const save = () => {
    if (!username || !password) return;
    setPhase("saving");
    timerRef.current = window.setTimeout(() => setPhase("success"), 1400);
  };

  if (!conn) return null;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-md overflow-y-auto p-0">
        <div className="px-6 pt-6 pb-5 border-b border-border">
          <SheetHeader className="text-left">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <KeyRound className="h-5 w-5 text-primary" />
              </div>
              <div>
                <SheetTitle className="text-lg">Update login</SheetTitle>
                <SheetDescription className="text-xs">
                  {conn.name}
                </SheetDescription>
              </div>
            </div>
          </SheetHeader>
        </div>

        <div className="px-6 py-5">
          {phase === "form" && (
            <div className="space-y-5 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div className="rounded-lg border border-border bg-secondary/40 p-3 text-xs text-muted-foreground flex gap-2">
                <ShieldCheck className="h-3.5 w-3.5 mt-0.5 shrink-0 text-primary" />
                <span>
                  Your new login replaces the old one and is encrypted before it leaves your browser. We never store it in plain text.
                </span>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="user" className="text-xs">Username or email</Label>
                <Input
                  id="user"
                  autoComplete="off"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder={`The login you use on ${conn.name}`}
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="pw" className="text-xs">Password</Label>
                <div className="relative">
                  <Input
                    id="pw"
                    type={showPw ? "text" : "password"}
                    autoComplete="new-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter the new password"
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPw((v) => !v)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 h-7 w-7 inline-flex items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-secondary"
                    aria-label={showPw ? "Hide password" : "Show password"}
                  >
                    {showPw ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                  </button>
                </div>
              </div>

              <div className="rounded-lg border border-border bg-card p-3 text-xs space-y-2">
                <p className="font-medium text-foreground">After you save:</p>
                <ul className="space-y-1.5 text-muted-foreground">
                  <li className="flex gap-2"><CheckCircle2 className="h-3.5 w-3.5 mt-0.5 text-emerald-500 shrink-0" /> We test the new login right away</li>
                  <li className="flex gap-2"><CheckCircle2 className="h-3.5 w-3.5 mt-0.5 text-emerald-500 shrink-0" /> Syncing resumes on its normal schedule</li>
                  <li className="flex gap-2"><CheckCircle2 className="h-3.5 w-3.5 mt-0.5 text-emerald-500 shrink-0" /> The old login is replaced and discarded</li>
                </ul>
              </div>

              <div className="flex items-center justify-end gap-2 pt-1">
                <Button variant="outline" onClick={() => onOpenChange(false)}>
                  Cancel
                </Button>
                <Button onClick={save} disabled={!username || !password}>
                  <KeyRound className="h-4 w-4" />
                  Save & test login
                </Button>
              </div>
            </div>
          )}

          {phase === "saving" && (
            <div className="space-y-5 animate-in fade-in duration-200 py-6">
              <div className="flex flex-col items-center text-center gap-3">
                <div className="relative h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center">
                  <Loader2 className="h-7 w-7 text-primary animate-spin" />
                  <span className="absolute inset-0 rounded-full ring-2 ring-primary/30 animate-ping" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">Testing new login</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Encrypting your password and signing in to {conn.name}…
                  </p>
                </div>
              </div>
            </div>
          )}

          {phase === "success" && (
            <div className="space-y-5 animate-in fade-in zoom-in-95 duration-300">
              <div className="rounded-xl border border-emerald-200 bg-emerald-50/60 p-5 text-center">
                <div className="mx-auto h-14 w-14 rounded-full bg-emerald-500 flex items-center justify-center animate-in zoom-in-50 duration-500">
                  <CheckCircle2 className="h-8 w-8 text-white" />
                </div>
                <p className="mt-4 text-base font-semibold text-foreground">
                  Login updated
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  We signed in to {conn.name} successfully. Syncing will resume on schedule.
                </p>
              </div>
              <div className="flex items-center justify-end gap-2">
                <Button onClick={() => onOpenChange(false)}>Done</Button>
              </div>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}

// Optional small inline error display (exported for reuse)
export function InlineError({ message }: { message: string }) {
  return (
    <div className="rounded-lg border border-rose-200 bg-rose-50/60 p-3 text-xs text-rose-700 flex gap-2">
      <XCircle className="h-3.5 w-3.5 mt-0.5 shrink-0" />
      <span>{message}</span>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// NewConnectionSheet — side-panel create flow
// ─────────────────────────────────────────────────────────────

const TENANTS = [
  { id: "itemize", name: "Itemize Inc.", plan: "Enterprise" },
  { id: "acme", name: "Acme Corp", plan: "Growth" },
  { id: "northwind", name: "Northwind Trading", plan: "Starter" },
  { id: "globex", name: "Globex Industries", plan: "Enterprise" },
];

const PORTAL_PRESETS = [
  { id: "custom", name: "Custom URL", url: "", icon: "🔗" },
  { id: "comcast", name: "Comcast Business", url: "https://business.comcast.com", icon: "📡" },
  { id: "verizon", name: "Verizon", url: "https://www.verizon.com/business", icon: "📶" },
  { id: "att", name: "AT&T", url: "https://www.att.com/business", icon: "📞" },
  { id: "pge", name: "PG&E", url: "https://www.pge.com", icon: "⚡" },
  { id: "conedison", name: "Con Edison", url: "https://www.coned.com", icon: "💡" },
];

const OBJECTIVES = ["Invoices", "Statements", "Receipts", "Usage reports", "Contracts"];

export function NewConnectionSheet({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
}) {
  const [tenant, setTenant] = useState<string>("");
  const [preset, setPreset] = useState<string>("custom");
  const [name, setName] = useState("");
  const [url, setUrl] = useState("");
  const [flowId, setFlowId] = useState("");
  const [objective, setObjective] = useState("Invoices");
  const [timeout, setTimeout] = useState(600);
  const [maxSteps, setMaxSteps] = useState(50);
  const [cloudBrowser, setCloudBrowser] = useState(true);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    if (open) {
      setTenant("");
      setPreset("custom");
      setName("");
      setUrl("");
      setFlowId("");
      setObjective("Invoices");
      setTimeout(600);
      setMaxSteps(50);
      setCloudBrowser(true);
      setCreating(false);
    }
  }, [open]);

  const handlePreset = (id: string) => {
    setPreset(id);
    const p = PORTAL_PRESETS.find((x) => x.id === id);
    if (p && p.id !== "custom") {
      setUrl(p.url);
      if (!name) setName(p.name);
    }
  };

  const canCreate = tenant && name.trim() && url.trim();

  const submit = () => {
    if (!canCreate) return;
    setCreating(true);
    window.setTimeout(() => onOpenChange(false), 900);
  };

  const tenantObj = TENANTS.find((t) => t.id === tenant);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-xl overflow-y-auto p-0 flex flex-col">
        {/* Header */}
        <div className="px-6 pt-6 pb-5 border-b border-border shrink-0">
          <SheetHeader className="text-left">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <PlugZap className="h-5 w-5 text-primary" />
              </div>
              <div>
                <SheetTitle className="text-lg">New connection</SheetTitle>
                <SheetDescription className="text-xs">
                  Set up a vendor portal so we can pull bills automatically.
                </SheetDescription>
              </div>
            </div>
          </SheetHeader>
        </div>

        {/* Body */}
        <div className="flex-1 px-6 py-6 space-y-7">
          {/* Tenant */}
          <section className="space-y-2">
            <div className="flex items-baseline justify-between">
              <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Tenant
              </Label>
              <span className="text-[11px] text-muted-foreground">Required</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {TENANTS.map((t) => {
                const active = tenant === t.id;
                return (
                  <button
                    key={t.id}
                    onClick={() => setTenant(t.id)}
                    className={cn(
                      "text-left rounded-lg border p-3 transition-all",
                      active
                        ? "border-primary bg-primary/5 ring-1 ring-primary/30"
                        : "border-border bg-card hover:border-primary/40 hover:bg-secondary/40",
                    )}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-sm font-medium text-foreground truncate">{t.name}</p>
                      {active && <CheckCircle2 className="h-3.5 w-3.5 text-primary shrink-0" />}
                    </div>
                    <p className="text-[11px] text-muted-foreground mt-0.5">{t.plan}</p>
                  </button>
                );
              })}
            </div>
          </section>

          {/* Portal */}
          <section className="space-y-3">
            <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Portal
            </Label>

            <div className="space-y-1.5">
              <Label htmlFor="preset" className="text-xs text-foreground">
                Known portal
              </Label>
              <div className="flex gap-1.5 flex-wrap">
                {PORTAL_PRESETS.map((p) => {
                  const active = preset === p.id;
                  return (
                    <button
                      key={p.id}
                      onClick={() => handlePreset(p.id)}
                      className={cn(
                        "inline-flex items-center gap-1.5 px-2.5 h-8 rounded-full border text-xs font-medium transition-colors",
                        active
                          ? "border-primary bg-primary/10 text-foreground"
                          : "border-border bg-card text-muted-foreground hover:text-foreground hover:bg-secondary",
                      )}
                    >
                      <span className="text-sm leading-none">{p.icon}</span>
                      {p.name}
                    </button>
                  );
                })}
              </div>
              <p className="text-[11px] text-muted-foreground">
                Pick a known vendor to prefill the URL, or use a custom one.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="cname" className="text-xs text-foreground">
                  Connection name <span className="text-rose-500">*</span>
                </Label>
                <Input
                  id="cname"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Acme Corp Portal"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="curl" className="text-xs text-foreground">
                  Portal URL <span className="text-rose-500">*</span>
                </Label>
                <div className="relative">
                  <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                  <Input
                    id="curl"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder="https://portal.vendor.com"
                    className="pl-9 font-mono text-sm"
                  />
                </div>
              </div>
            </div>
          </section>

          {/* Automation */}
          <section className="space-y-3">
            <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Automation
            </Label>

            <div className="space-y-1.5">
              <Label htmlFor="flow" className="text-xs text-foreground">
                Flow ID <span className="text-muted-foreground font-normal">(AWP)</span>
              </Label>
              <Input
                id="flow"
                value={flowId}
                onChange={(e) => setFlowId(e.target.value)}
                placeholder="AWP flow identifier"
                className="font-mono text-sm"
              />
              <p className="text-[11px] text-muted-foreground">
                Leave blank to let the agent figure it out from the portal layout.
              </p>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs text-foreground">Objective</Label>
              <div className="flex flex-wrap gap-1.5">
                {OBJECTIVES.map((o) => {
                  const active = objective === o;
                  return (
                    <button
                      key={o}
                      onClick={() => setObjective(o)}
                      className={cn(
                        "px-2.5 h-7 rounded-md border text-xs font-medium transition-colors",
                        active
                          ? "border-primary bg-primary/10 text-foreground"
                          : "border-border bg-card text-muted-foreground hover:text-foreground hover:bg-secondary",
                      )}
                    >
                      {o}
                    </button>
                  );
                })}
              </div>
              <p className="text-[11px] text-muted-foreground">What the bot should retrieve.</p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="to" className="text-xs text-foreground">
                  Timeout
                </Label>
                <div className="relative">
                  <Input
                    id="to"
                    type="number"
                    min={60}
                    max={3600}
                    value={timeout}
                    onChange={(e) => setTimeout(Number(e.target.value))}
                    className="pr-12 tabular-nums"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[11px] text-muted-foreground">
                    sec
                  </span>
                </div>
                <p className="text-[11px] text-muted-foreground">60 – 3600s</p>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="ms" className="text-xs text-foreground">
                  Max steps
                </Label>
                <div className="relative">
                  <Input
                    id="ms"
                    type="number"
                    min={1}
                    max={500}
                    value={maxSteps}
                    onChange={(e) => setMaxSteps(Number(e.target.value))}
                    className="pr-14 tabular-nums"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[11px] text-muted-foreground">
                    steps
                  </span>
                </div>
                <p className="text-[11px] text-muted-foreground">1 – 500</p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setCloudBrowser((v) => !v)}
              className={cn(
                "w-full flex items-start gap-3 rounded-lg border p-3 text-left transition-colors",
                cloudBrowser
                  ? "border-primary/40 bg-primary/5"
                  : "border-border bg-card hover:bg-secondary/40",
              )}
            >
              <div
                className={cn(
                  "mt-0.5 h-4 w-7 rounded-full p-0.5 transition-colors shrink-0",
                  cloudBrowser ? "bg-primary" : "bg-muted",
                )}
              >
                <div
                  className={cn(
                    "h-3 w-3 rounded-full bg-white transition-transform",
                    cloudBrowser ? "translate-x-3" : "translate-x-0",
                  )}
                />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium text-foreground">Use cloud browser</p>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  AWP runs this connection in the cloud. Turn off only if the vendor requires a local
                  browser.
                </p>
              </div>
            </button>
          </section>

          {/* AI hint */}
          <div className="rounded-lg border border-primary/20 bg-primary/5 p-3 flex gap-2.5">
            <Sparkles className="h-4 w-4 text-primary shrink-0 mt-0.5" />
            <div className="text-xs">
              <p className="font-medium text-foreground">AI will validate this connection</p>
              <p className="text-muted-foreground mt-0.5">
                After you create it, we'll do a test run and report whether sign-in, navigation, and
                document discovery worked.
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="shrink-0 border-t border-border bg-background/95 backdrop-blur px-6 py-3 flex items-center justify-between gap-3">
          <p className="text-[11px] text-muted-foreground">
            {tenantObj ? (
              <>Will be created under <span className="font-medium text-foreground">{tenantObj.name}</span></>
            ) : (
              "Select a tenant to continue"
            )}
          </p>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button onClick={submit} disabled={!canCreate || creating}>
              {creating ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Creating…
                </>
              ) : (
                <>
                  <PlugZap className="h-4 w-4" />
                  Create connection
                </>
              )}
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
