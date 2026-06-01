import { useCallback, useState } from "react";
import {
  Palette, Type, Layout, Square, Table as TableIcon, BarChart3,
  Check, X, AlertTriangle, Info, Search, Upload,
  FileText, Banknote, MoreHorizontal, Edit, Trash2,
  Sparkles, Accessibility, MessageSquare, Layers, Calendar as CalendarIcon,
  Filter, Loader2, Bell, Hash, Command, ChevronRight,
  Eye, Download, Flag, FileX, Pin, GripVertical, ArrowUpDown, Columns3,
} from "lucide-react";
import { DataTable, DataTableColumn } from "./data-table/DataTable";
import RowActions from "./data-table/RowActions";
import TopBar from "./TopBar";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Checkbox } from "./ui/checkbox";
import { Switch } from "./ui/switch";
import { Badge } from "./ui/badge";
import { Card } from "./ui/card";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Progress } from "./ui/progress";
import { Slider } from "./ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Textarea } from "./ui/textarea";
import { RadioGroup, RadioGroupItem } from "./ui/radio-group";
import { Separator } from "./ui/separator";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./ui/tooltip";
import { Alert, AlertDescription, AlertTitle } from "./ui/alert";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbPage, BreadcrumbSeparator, BreadcrumbList } from "./ui/breadcrumb";
import { Skeleton } from "./ui/skeleton";
import { ConfidenceBadge } from "./cash/confidence";

// ----- Color tokens -----
const semanticColors = [
  { name: "background", desc: "App background" },
  { name: "foreground", desc: "Primary text" },
  { name: "card", desc: "Card surface" },
  { name: "card-foreground", desc: "Text on cards" },
  { name: "popover", desc: "Popover surface" },
  { name: "primary", desc: "Brand / primary actions" },
  { name: "primary-foreground", desc: "Text on primary" },
  { name: "secondary", desc: "Secondary surfaces" },
  { name: "secondary-foreground", desc: "Text on secondary" },
  { name: "muted", desc: "Muted surfaces" },
  { name: "muted-foreground", desc: "Muted text" },
  { name: "accent", desc: "Hover / accent" },
  { name: "destructive", desc: "Errors / destructive" },
  { name: "destructive-foreground", desc: "Text on destructive" },
  { name: "border", desc: "Borders & dividers" },
  { name: "input", desc: "Input borders" },
  { name: "ring", desc: "Focus ring" },
  { name: "nav-dark", desc: "Dark top bar" },
];

const statusColors = [
  { label: "Emerald (success / High)", className: "bg-emerald-500", text: "text-emerald-600", use: "Successful posts, high-confidence matches, positive deltas." },
  { label: "Amber (warning / Medium)", className: "bg-amber-500", text: "text-amber-600", use: "Needs review, medium confidence, soft warnings." },
  { label: "Destructive (error / Low)", className: "bg-destructive", text: "text-destructive", use: "Errors, low-confidence, destructive actions." },
  { label: "Teal (positive variance)", className: "bg-teal-600", text: "text-teal-700", use: "Over-payments / positive variance — distinct from success green." },
  { label: "Rose (negative variance)", className: "bg-rose-600", text: "text-rose-700", use: "Short-pays / negative variance — distinct from destructive red." },
  { label: "Primary (info / brand)", className: "bg-primary", text: "text-primary", use: "Primary CTAs, active nav, brand emphasis." },
];

function Section({ id, title, description, children }: { id: string; title: string; description?: string; children: React.ReactNode }) {
  return (
    <section id={id} className="scroll-mt-20 mb-16">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-foreground tracking-tight">{title}</h2>
        {description && <p className="text-sm text-muted-foreground mt-1">{description}</p>}
      </div>
      <div className="space-y-6">{children}</div>
    </section>
  );
}

function SubSection({ title, guidance, children }: { title: string; guidance?: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="flex items-baseline justify-between mb-3 gap-4">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/80">{title}</h3>
        {guidance && <p className="text-[11px] text-muted-foreground/80 italic max-w-md text-right">{guidance}</p>}
      </div>
      <div className="bg-card border border-border rounded-xl p-6">{children}</div>
    </div>
  );
}

function GuidanceBox({ children }: { children: React.ReactNode }) {
  return (
    <div className="mt-4 border-t border-border pt-3 text-xs text-muted-foreground space-y-1">
      {children}
    </div>
  );
}

function ColorSwatch({ name, desc }: { name: string; desc: string }) {
  return (
    <div className="flex items-center gap-3 p-3 rounded-lg border border-border bg-background/50">
      <div
        className="h-12 w-12 rounded-md border border-border shrink-0"
        style={{ background: `hsl(var(--${name}))` }}
      />
      <div className="min-w-0">
        <div className="text-[13px] font-medium text-foreground font-mono">--{name}</div>
        <div className="text-[11px] text-muted-foreground">{desc}</div>
      </div>
    </div>
  );
}

function DoDont({ dos, donts }: { dos: string[]; donts: string[] }) {
  return (
    <div className="grid grid-cols-2 gap-4 mt-4">
      <div className="border border-emerald-500/30 bg-emerald-500/5 rounded-lg p-4">
        <div className="flex items-center gap-2 text-emerald-600 text-xs font-semibold uppercase tracking-wider"><Check className="h-3.5 w-3.5" />Do</div>
        <ul className="text-xs text-foreground/80 mt-2 space-y-1 list-disc pl-4">
          {dos.map((d, i) => <li key={i}>{d}</li>)}
        </ul>
      </div>
      <div className="border border-destructive/30 bg-destructive/5 rounded-lg p-4">
        <div className="flex items-center gap-2 text-destructive text-xs font-semibold uppercase tracking-wider"><X className="h-3.5 w-3.5" />Don't</div>
        <ul className="text-xs text-foreground/80 mt-2 space-y-1 list-disc pl-4">
          {donts.map((d, i) => <li key={i}>{d}</li>)}
        </ul>
      </div>
    </div>
  );
}

const NAV = [
  { id: "principles", label: "Principles", icon: Sparkles },
  { id: "foundations", label: "Foundations", icon: Palette },
  { id: "typography", label: "Typography", icon: Type },
  { id: "iconography", label: "Iconography", icon: Hash },
  { id: "motion", label: "Motion", icon: Layers },
  { id: "voice", label: "Voice & Tone", icon: MessageSquare },
  { id: "buttons", label: "Buttons", icon: Square },
  { id: "forms", label: "Forms & Inputs", icon: Edit },
  { id: "feedback", label: "Feedback", icon: Info },
  { id: "navigation", label: "Navigation", icon: Layout },
  { id: "overlays", label: "Sheets & Dialogs", icon: Layers },
  { id: "tables", label: "Tables", icon: TableIcon },
  { id: "charts", label: "Charts & Data Viz", icon: BarChart3 },
  { id: "cards", label: "Cards & Surfaces", icon: Layout },
  { id: "loading", label: "Loading & Empty", icon: Loader2 },
  { id: "formatting", label: "Data Formatting", icon: Hash },
  { id: "accessibility", label: "Accessibility", icon: Accessibility },
  { id: "patterns", label: "App Patterns", icon: FileText },
];

interface DemoTask {
  status: string;
  vendor: string;
  docNumber: string;
  total: string;
  variance: string;
  varianceDir: "neg" | "pos" | "flat";
  workflow: string;
  submitted: string;
  daysPending: number;
}

const DEMO_ROWS: DemoTask[] = [
  { status: "Pending", vendor: "Apple", docNumber: "AF32656303", total: "$1,402.29", variance: "$0.00", varianceDir: "flat", workflow: "Luis Test (Step 1)", submitted: "Apr 1, 2026", daysPending: 17 },
  { status: "Pending", vendor: "Capitol Building Supply", docNumber: "128267-00", total: "$1,544.10", variance: "−$120.00", varianceDir: "neg", workflow: "AP Standard (Step 2)", submitted: "Apr 4, 2026", daysPending: 14 },
  { status: "In Review", vendor: "Wilson Sonsini Goodrich", docNumber: "2362888", total: "$277.20", variance: "$0.00", varianceDir: "flat", workflow: "AP Standard (Step 1)", submitted: "Apr 8, 2026", daysPending: 10 },
  { status: "Pending", vendor: "TechPro Inc", docNumber: "PO-2024-0123", total: "$11,600.69", variance: "+$50.00", varianceDir: "pos", workflow: "PO Approval (Step 3)", submitted: "Apr 10, 2026", daysPending: 8 },
  { status: "Approved", vendor: "Globex Industries", docNumber: "GX-99812", total: "$8,120.00", variance: "$0.00", varianceDir: "flat", workflow: "AP Standard (Step 2)", submitted: "Apr 12, 2026", daysPending: 6 },
];

function StyleGuideDataTableDemo() {
  const [selected, setSelected] = useState<Set<number>>(new Set());

  const toggleRow = useCallback((i: number) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(i)) next.delete(i);
      else next.add(i);
      return next;
    });
  }, []);

  const toggleAll = useCallback(() => {
    if (selected.size === DEMO_ROWS.length) setSelected(new Set());
    else setSelected(new Set(DEMO_ROWS.map((_, i) => i)));
  }, [selected.size]);

  const columns: DataTableColumn<DemoTask>[] = [
    {
      key: "status",
      label: "Status",
      accessor: (r) => r.status,
      render: (r) => {
        const map: Record<string, string> = {
          Pending: "bg-amber-50 text-amber-700 border-amber-200",
          "In Review": "bg-blue-50 text-blue-700 border-blue-200",
          Approved: "bg-emerald-50 text-emerald-700 border-emerald-200",
        };
        return <span className={`text-[11px] font-medium px-2.5 py-1 rounded-full border ${map[r.status] ?? "bg-secondary/60 text-foreground border-border"}`}>{r.status}</span>;
      },
    },
    {
      key: "vendor",
      label: "Vendor",
      accessor: (r) => r.vendor,
      render: (r) => <span className="font-medium text-foreground">{r.vendor}</span>,
    },
    { key: "docNumber", label: "Document #", accessor: (r) => r.docNumber },
    {
      key: "total",
      label: "Total",
      accessor: (r) => r.total,
      align: "right",
      render: (r) => <span className="font-medium tabular-nums text-foreground">{r.total}</span>,
    },
    {
      key: "variance",
      label: "Variance",
      accessor: (r) => r.variance,
      align: "right",
      render: (r) => (
        <span className={`tabular-nums font-medium ${r.varianceDir === "neg" ? "text-rose-700" : r.varianceDir === "pos" ? "text-teal-700" : "text-muted-foreground"}`}>
          {r.variance}
        </span>
      ),
    },
    {
      key: "workflow",
      label: "Workflow",
      accessor: (r) => r.workflow,
      render: (r) => (
        <span className="text-[11px] font-medium px-2.5 py-1 rounded-full border bg-secondary/60 text-foreground border-border">
          {r.workflow}
        </span>
      ),
    },
    { key: "submitted", label: "Submitted", accessor: (r) => r.submitted },
    {
      key: "daysPending",
      label: "Days Pending",
      accessor: (r) => `${r.daysPending}d`,
      align: "right",
      render: (r) => (
        <span className={`tabular-nums font-medium ${r.daysPending > 14 ? "text-destructive" : r.daysPending > 7 ? "text-amber-600" : "text-foreground"}`}>
          {r.daysPending}d
        </span>
      ),
    },
  ];

  return (
    <DataTable<DemoTask>
      storageKey="style-guide-demo"
      columns={columns}
      data={DEMO_ROWS}
      rowKey={(r, i) => `${r.docNumber}-${i}`}
      selectable
      searchable
      searchPlaceholder="Search demo rows…"
      selectedRows={selected}
      onToggleRow={toggleRow}
      onToggleAll={toggleAll}
      toolbarLeft={
        selected.size > 0 ? (
          <button className="text-xs font-medium px-3.5 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors">
            Approve {selected.size} task{selected.size > 1 ? "s" : ""}
          </button>
        ) : null
      }
      renderRowActions={(r) => (
        <RowActions
          review={{ label: "Review", onClick: () => {}, icon: <Eye className="h-3.5 w-3.5" /> }}
          primary={{ label: "Approve", onClick: () => {} }}
          more={[
            { label: "Reassign", onClick: () => {} },
            { label: "Flag for review", onClick: () => {}, icon: <Flag className="h-3.5 w-3.5" /> },
            { label: "Download", onClick: () => {}, icon: <Download className="h-3.5 w-3.5" /> },
            { label: "Reject", onClick: () => {}, icon: <FileX className="h-3.5 w-3.5" />, destructive: true },
          ]}
        />
      )}
    />
  );
}

export default function StyleGuideContent() {
  const [tab, setTab] = useState("overview");

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-background">
      <TopBar />
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-7xl mx-auto px-8 py-8">
          {/* Header */}
          <div className="mb-8 flex items-start justify-between gap-6">
            <div>
              <Breadcrumb>
                <BreadcrumbList>
                  <BreadcrumbItem>
                    <BreadcrumbLink href="/">Home</BreadcrumbLink>
                  </BreadcrumbItem>
                  <BreadcrumbSeparator />
                  <BreadcrumbItem>
                    <BreadcrumbPage>Style Guide</BreadcrumbPage>
                  </BreadcrumbItem>
                </BreadcrumbList>
              </Breadcrumb>
              <h1 className="text-2xl font-bold text-foreground tracking-tight mt-2">Style Guide</h1>
              <p className="text-sm text-muted-foreground mt-1 max-w-2xl">
                A complete reference for tokens, components and patterns used across Itemize. All colors are HSL semantic tokens — never hard-code hex values in components. Both light and dark modes are first-class.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-[200px_minmax(0,1fr)] gap-8">
            {/* Sticky in-page nav */}
            <nav className="sticky top-4 self-start space-y-0.5 max-h-[calc(100vh-2rem)] overflow-y-auto pr-2 min-w-0">
              {NAV.map((n) => (
                <a
                  key={n.id}
                  href={`#${n.id}`}
                  className="flex items-center gap-2.5 px-2.5 py-1.5 rounded-md text-[13px] text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
                >
                  <n.icon className="h-3.5 w-3.5" />
                  {n.label}
                </a>
              ))}
            </nav>

            <div className="min-w-0">

              {/* ---------- PRINCIPLES ---------- */}
              <Section id="principles" title="Design Principles" description="The five rules every screen must respect.">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    { t: "Information density", d: "Itemize is a finance tool — show the data. Prefer 32–36px row heights, 12–13px body, tabular numerics. Avoid 'airy SaaS' padding." },
                    { t: "AI-first, not AI-asking", d: "When the AI is confident, pre-fill values directly. Never add an 'Approve AI suggestion' modal — let users edit if wrong." },
                    { t: "Sheets over modals", d: "Slide-in sheets from the right are preferred for any context-rich action. Modals are reserved for destructive confirms." },
                    { t: "One brand color", d: "Primary blue carries brand. Status colors (green/amber/red/teal/rose) carry meaning. Never use brand blue for status." },
                    { t: "Keyboard-first", d: "Every list, table, and form is navigable by keyboard. ⌘K opens the global palette from anywhere." },
                    { t: "Symmetric light & dark", d: "Both themes are designed equally. Never use raw white/black — only semantic tokens." },
                    { t: "No decorative stat cards", d: "Don't sprinkle KPI/counter cards (\"3 pending\", \"$12k total\") on every page just to fill space. Add stat cards only when the number drives a real decision or action on that page. If the number is already visible in the table or duplicates a sidebar count, leave it out." },
                    { t: "Tables mirror Excel", d: "Tables are the primary work surface for finance users. Every grid must feel like Excel: inline editing where applicable, drag-to-reorder columns, pin left/right, show/hide, resize, sort, multi-select, keyboard nav. Use AG Grid as the underlying library — never hand-roll a <table> for record lists." },
                    { t: "AI is the differentiator", d: "We live inside a familiar B2B category, but AI is why we win. Every surface should make the AI visible and useful — confidence cues on extracted fields, inline explanations of what the model did, one-click overrides, and AI-suggested next actions. Don't hide it behind a chat icon, and don't dilute it into generic enterprise UI." },
                  ].map((p) => (
                    <div key={p.t} className="bg-card border border-border rounded-xl p-5">
                      <div className="text-sm font-semibold text-foreground">{p.t}</div>
                      <div className="text-xs text-muted-foreground mt-1.5 leading-relaxed">{p.d}</div>
                    </div>
                  ))}
                </div>
              </Section>

              {/* ---------- FOUNDATIONS ---------- */}
              <Section id="foundations" title="Foundations" description="Colors, tokens, spacing, radii, and shadows. Both light and dark modes are supported via CSS variables.">
                <SubSection title="Semantic color tokens" guidance="Always pair surface tokens with their -foreground counterpart for AA contrast in both themes.">
                  <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
                    {semanticColors.map((c) => <ColorSwatch key={c.name} {...c} />)}
                  </div>
                  <GuidanceBox>
                    <p>Reference tokens via <code className="px-1.5 py-0.5 bg-secondary rounded font-mono text-[11px]">bg-primary text-primary-foreground</code>. Tokens are HSL components only (no <code className="font-mono">hsl()</code> wrapper) so opacity utilities like <code className="font-mono">bg-primary/10</code> work.</p>
                  </GuidanceBox>
                  <DoDont
                    dos={["Pair surfaces with their foreground (bg-card / text-card-foreground)", "Use /opacity suffixes for tints (bg-primary/10)", "Test every screen in dark mode before shipping"]}
                    donts={["text-white, bg-black, text-gray-500 anywhere", "Hex values inside components", "Use brand primary for status meaning"]}
                  />
                </SubSection>

                <SubSection title="Status & accent palette" guidance="Color carries meaning. Pick the meaning first, the color follows.">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {statusColors.map((s) => (
                      <div key={s.label} className="flex items-start gap-3 p-3 rounded-lg border border-border">
                        <div className={`h-10 w-10 rounded-md ${s.className} shrink-0`} />
                        <div className="min-w-0">
                          <div className={`text-[13px] font-medium ${s.text}`}>{s.label}</div>
                          <div className="text-[11px] text-muted-foreground font-mono">{s.className}</div>
                          <div className="text-[11px] text-muted-foreground mt-1">{s.use}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </SubSection>

                <SubSection title="Border radius" guidance="Use rounded-md for buttons & inputs, rounded-xl for cards, rounded-full for pills only.">
                  <div className="flex items-end gap-6">
                    {[
                      { name: "sm", cls: "rounded-sm", px: "2px" },
                      { name: "md", cls: "rounded-md", px: "6px" },
                      { name: "lg", cls: "rounded-lg", px: "8px" },
                      { name: "xl", cls: "rounded-xl", px: "12px" },
                      { name: "full", cls: "rounded-full", px: "999" },
                    ].map((r) => (
                      <div key={r.name} className="text-center">
                        <div className={`h-16 w-16 bg-primary/15 border border-primary/30 ${r.cls}`} />
                        <div className="mt-2 text-[11px] text-foreground font-mono">{r.cls}</div>
                        <div className="text-[10px] text-muted-foreground">{r.px}</div>
                      </div>
                    ))}
                  </div>
                </SubSection>

                <SubSection title="Elevation & shadows" guidance="Itemize favors borders over shadows. Reserve shadows for floating layers.">
                  <div className="grid grid-cols-3 gap-4">
                    <div className="bg-card p-4 rounded-lg border border-border shadow-sm text-xs text-foreground">shadow-sm — cards</div>
                    <div className="bg-card p-4 rounded-lg border border-border shadow-md text-xs text-foreground">shadow-md — popovers</div>
                    <div className="bg-card p-4 rounded-lg border border-border shadow-xl text-xs text-foreground">shadow-xl — sheets/dialogs</div>
                  </div>
                </SubSection>

                <SubSection title="Spacing scale" guidance="4px base. Stick to 1, 2, 3, 4, 6, 8 for component padding; 12, 16 for layout gaps.">
                  <div className="space-y-2">
                    {[1, 2, 3, 4, 6, 8, 12, 16].map((n) => (
                      <div key={n} className="flex items-center gap-3 text-xs">
                        <div className="w-12 text-muted-foreground font-mono">p-{n}</div>
                        <div className="bg-primary/20" style={{ height: 8, width: n * 4 }} />
                        <div className="text-muted-foreground">{n * 4}px</div>
                      </div>
                    ))}
                  </div>
                </SubSection>

                <SubSection title="Layout grid" guidance="Page max-width 7xl (1280px). Sidebar 252px. Content padding px-8 py-8.">
                  <div className="border border-dashed border-border rounded-lg p-4 text-xs text-muted-foreground space-y-2 font-mono">
                    <div>App shell: <span className="text-foreground">flex h-screen → AppSidebar (252px) + main (flex-1)</span></div>
                    <div>Page container: <span className="text-foreground">max-w-7xl mx-auto px-8 py-8</span></div>
                    <div>Two-column detail: <span className="text-foreground">grid-cols-[200px_1fr] gap-8</span></div>
                    <div>Stat row: <span className="text-foreground">grid grid-cols-2 lg:grid-cols-4 gap-4</span></div>
                  </div>
                </SubSection>
              </Section>

              {/* ---------- TYPOGRAPHY ---------- */}
              <Section id="typography" title="Typography" description="Inter is the only font. Use tabular-nums for any numeric data so columns line up.">
                <SubSection title="Type scale" guidance="Body 13–14px. Headings drop bold quickly — never more than one h1 per page.">
                  <div className="space-y-4">
                    <div><div className="text-[10px] font-mono text-muted-foreground mb-1">text-3xl / bold / tracking-tight — Hero metric</div><div className="text-3xl font-bold tracking-tight text-foreground">Cash applied today</div></div>
                    <div><div className="text-[10px] font-mono text-muted-foreground mb-1">text-2xl / bold / tracking-tight — Page title (h1)</div><div className="text-2xl font-bold tracking-tight text-foreground">Cash Application</div></div>
                    <div><div className="text-[10px] font-mono text-muted-foreground mb-1">text-xl / bold — Section heading (h2)</div><div className="text-xl font-bold text-foreground">Section heading</div></div>
                    <div><div className="text-[10px] font-mono text-muted-foreground mb-1">text-lg / semibold — Card title (h3)</div><div className="text-lg font-semibold text-foreground">Card title</div></div>
                    <div><div className="text-[10px] font-mono text-muted-foreground mb-1">text-sm — Body</div><div className="text-sm text-foreground">Standard body copy used throughout the app interface.</div></div>
                    <div><div className="text-[10px] font-mono text-muted-foreground mb-1">text-xs / muted-foreground — Helper</div><div className="text-xs text-muted-foreground">Helper text and metadata sit at this size.</div></div>
                    <div><div className="text-[10px] font-mono text-muted-foreground mb-1">text-[11px] / uppercase / tracking-wider — Eyebrow / table header</div><div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/60">Section label</div></div>
                    <div><div className="text-[10px] font-mono text-muted-foreground mb-1">tabular-nums — All numerics</div><div className="text-sm tabular-nums text-foreground">$184,250.50 · 27 · 4:00 PM EST</div></div>
                  </div>
                  <DoDont
                    dos={["Use tabular-nums on every column of numbers", "Use tracking-tight on h1/h2 only", "Use text-foreground/80 for secondary body copy"]}
                    donts={["Stack two h1s on the same page", "Use text-base or text-lg for normal body", "Italicize for emphasis — use font-medium instead"]}
                  />
                </SubSection>

                <SubSection title="Font weights" guidance="Use weight, not size, to differentiate hierarchy at small sizes.">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div><div className="font-normal text-foreground">Regular 400</div><div className="text-[10px] font-mono text-muted-foreground">Body, descriptions</div></div>
                    <div><div className="font-medium text-foreground">Medium 500</div><div className="text-[10px] font-mono text-muted-foreground">Buttons, table cells</div></div>
                    <div><div className="font-semibold text-foreground">Semibold 600</div><div className="text-[10px] font-mono text-muted-foreground">Headings, eyebrows</div></div>
                    <div><div className="font-bold text-foreground">Bold 700</div><div className="text-[10px] font-mono text-muted-foreground">h1/h2 only</div></div>
                  </div>
                </SubSection>
              </Section>

              {/* ---------- ICONOGRAPHY ---------- */}
              <Section id="iconography" title="Iconography" description="Lucide icons only. Outlined, 1.5px stroke, never filled.">
                <SubSection title="Sizes & alignment" guidance="Icons follow text — pair 14–16px icons with 13–14px text on the same baseline.">
                  <div className="flex items-center gap-8">
                    {[
                      { size: "h-3 w-3", label: "12px — inline / dense" },
                      { size: "h-3.5 w-3.5", label: "14px — sidebar nav" },
                      { size: "h-4 w-4", label: "16px — buttons (default)" },
                      { size: "h-5 w-5", label: "20px — empty state" },
                      { size: "h-6 w-6", label: "24px — feature illustration" },
                    ].map((s) => (
                      <div key={s.size} className="flex flex-col items-center gap-2">
                        <FileText className={`${s.size} text-foreground`} />
                        <div className="text-[10px] text-muted-foreground font-mono text-center">{s.label}</div>
                      </div>
                    ))}
                  </div>
                  <DoDont
                    dos={["Use lucide-react exclusively", "Color icons via text-* utilities", "Pair icons with text labels — never icon-only nav"]}
                    donts={["Mix icon libraries (heroicons, feather, phosphor)", "Use filled / solid variants", "Use icons larger than 24px in product UI"]}
                  />
                </SubSection>
              </Section>

              {/* ---------- MOTION ---------- */}
              <Section id="motion" title="Motion" description="Motion confirms intent. It never decorates.">
                <SubSection title="Durations & easing" guidance="Default 150ms ease for hover, 200ms for entrance, 300ms for sheets.">
                  <div className="space-y-3 text-sm">
                    <div className="flex items-center gap-4">
                      <Button variant="outline" className="transition-colors duration-150">Hover (150ms)</Button>
                      <span className="text-xs text-muted-foreground">Buttons, nav items, table row hover</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="px-3 py-2 rounded-md bg-secondary text-xs animate-in fade-in duration-200">Fade in (200ms)</div>
                      <span className="text-xs text-muted-foreground">Tooltips, popovers, dropdowns</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="px-3 py-2 rounded-md bg-secondary text-xs animate-in slide-in-from-right duration-300">Slide in (300ms)</div>
                      <span className="text-xs text-muted-foreground">Sheets, drawers</span>
                    </div>
                  </div>
                  <DoDont
                    dos={["Animate opacity & transform only (GPU-cheap)", "Honor prefers-reduced-motion", "Use motion to confirm cause→effect"]}
                    donts={["Animate width/height on every interaction", "Bounce / overshoot effects in product UI", "Add entrance animations to data-table rows"]}
                  />
                </SubSection>
              </Section>

              {/* ---------- VOICE & TONE ---------- */}
              <Section id="voice" title="Voice & Tone" description="Plain, calm, expert. We're a finance teammate, not a chatbot.">
                <SubSection title="Writing rules">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div className="space-y-2">
                      <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Buttons & labels</div>
                      <ul className="text-xs text-foreground/80 space-y-1 list-disc pl-4">
                        <li>Sentence case, never Title Case</li>
                        <li>Verb-first: "Apply payment", not "Payment application"</li>
                        <li>Max 3 words on primary CTAs</li>
                      </ul>
                    </div>
                    <div className="space-y-2">
                      <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Empty states & errors</div>
                      <ul className="text-xs text-foreground/80 space-y-1 list-disc pl-4">
                        <li>State the situation, then the next action</li>
                        <li>Never blame the user — "We couldn't save…"</li>
                        <li>Skip exclamation marks</li>
                      </ul>
                    </div>
                  </div>
                  <DoDont
                    dos={['"No payments yet"', '"Couldn\'t reach the bank — retry"', '"Apply to invoice"', "Use $ symbol with tabular-nums"]}
                    donts={['"Oops! Something went wrong!"', '"Click here to upload"', '"Submit"', '"Process Payment Application"']}
                  />
                </SubSection>
              </Section>

              {/* ---------- BUTTONS ---------- */}
              <Section id="buttons" title="Buttons" description="Use Button variants — never custom button styles.">
                <SubSection title="Variants" guidance="One default per view. Outline for secondary actions. Ghost for low-emphasis or in-table actions.">
                  <div className="flex flex-wrap gap-3">
                    <Button>Default</Button>
                    <Button variant="secondary">Secondary</Button>
                    <Button variant="outline">Outline</Button>
                    <Button variant="ghost">Ghost</Button>
                    <Button variant="destructive">Destructive</Button>
                    <Button variant="link">Link</Button>
                  </div>
                  <GuidanceBox>
                    <p><strong className="text-foreground">When to use:</strong> Default = the one happy-path action. Outline = peer alternatives (Cancel, Import). Ghost = repeated actions inside lists/tables. Destructive = irreversible actions (always paired with a confirm dialog).</p>
                  </GuidanceBox>
                </SubSection>
                <SubSection title="Sizes" guidance="Default (h-10) for page-level. Small (h-9) inside cards & toolbars. Icon for table row actions.">
                  <div className="flex flex-wrap items-center gap-3">
                    <Button size="sm">Small</Button>
                    <Button size="default">Default</Button>
                    <Button size="lg">Large</Button>
                    <Button size="icon"><Search /></Button>
                  </div>
                </SubSection>
                <SubSection title="With icons" guidance="Icon precedes the label. Icon-only buttons require an aria-label and a tooltip.">
                  <div className="flex flex-wrap gap-3">
                    <Button><Upload />Upload</Button>
                    <Button variant="outline"><Check />Approve</Button>
                    <Button variant="destructive"><Trash2 />Delete</Button>
                  </div>
                  <DoDont
                    dos={["One default button per region", "Pair icon + text on primary actions", "Use ghost icons for in-row actions"]}
                    donts={["Two competing default buttons side by side", "Icon-only buttons in primary CTAs", "Custom <button class='...'> styled from scratch"]}
                  />
                </SubSection>
              </Section>

              {/* ---------- FORMS ---------- */}
              <Section id="forms" title="Forms & Inputs" description="Labels above inputs. Inline validation. AI pre-fills directly without an approval step.">
                <SubSection title="Text inputs" guidance="Always use a Label. Helper text or error below. Currency inputs get tabular-nums.">
                  <div className="grid grid-cols-2 gap-4 max-w-2xl">
                    <div>
                      <Label htmlFor="ex-email">Email</Label>
                      <Input id="ex-email" type="email" placeholder="you@acme.com" className="mt-1.5" />
                    </div>
                    <div>
                      <Label htmlFor="ex-amount">Amount</Label>
                      <Input id="ex-amount" placeholder="$0.00" className="mt-1.5 tabular-nums" />
                    </div>
                    <div>
                      <Label htmlFor="ex-error">Invoice #</Label>
                      <Input id="ex-error" defaultValue="INV-99X1" className="mt-1.5 border-destructive focus-visible:ring-destructive" />
                      <p className="text-[11px] text-destructive mt-1">Invoice not found in open AR</p>
                    </div>
                    <div>
                      <Label htmlFor="ex-success">Customer</Label>
                      <Input id="ex-success" defaultValue="Acme Corp" className="mt-1.5" />
                      <p className="text-[11px] text-muted-foreground mt-1 flex items-center gap-1"><Sparkles className="h-3 w-3 text-primary" />AI pre-filled from remittance</p>
                    </div>
                    <div className="col-span-2">
                      <Label htmlFor="ex-notes">Notes</Label>
                      <Textarea id="ex-notes" placeholder="Add a note..." className="mt-1.5" />
                    </div>
                  </div>
                </SubSection>

                <SubSection title="Selection controls" guidance="Switch = instant on/off. Checkbox = multi-select / form submit. Radio = pick one of few.">
                  <div className="flex flex-wrap items-center gap-8">
                    <div className="flex items-center gap-2"><Checkbox id="cb1" defaultChecked /><Label htmlFor="cb1">Checkbox</Label></div>
                    <div className="flex items-center gap-2"><Switch id="sw1" defaultChecked /><Label htmlFor="sw1">Switch</Label></div>
                    <RadioGroup defaultValue="a" className="flex items-center gap-4">
                      <div className="flex items-center gap-2"><RadioGroupItem value="a" id="r1" /><Label htmlFor="r1">Option A</Label></div>
                      <div className="flex items-center gap-2"><RadioGroupItem value="b" id="r2" /><Label htmlFor="r2">Option B</Label></div>
                    </RadioGroup>
                  </div>
                </SubSection>

                <SubSection title="Select & slider">
                  <div className="grid grid-cols-2 gap-6 max-w-2xl">
                    <div>
                      <Label>Status</Label>
                      <Select>
                        <SelectTrigger className="mt-1.5"><SelectValue placeholder="Choose..." /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="open">Open</SelectItem>
                          <SelectItem value="matched">Matched</SelectItem>
                          <SelectItem value="exception">Exception</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Confidence threshold</Label>
                      <Slider defaultValue={[80]} max={100} step={1} className="mt-4" />
                    </div>
                  </div>
                  <DoDont
                    dos={["Label above the input", "Show error message below in destructive color", "Mark AI-prefilled fields with a subtle Sparkles indicator"]}
                    donts={["Placeholder-as-label (disappears on type)", "Tooltip-only error messages", "Disable the submit button without telling the user why"]}
                  />
                </SubSection>
              </Section>

              {/* ---------- FEEDBACK ---------- */}
              <Section id="feedback" title="Feedback & Status">
                <SubSection title="Badges" guidance="Outline for neutral status. Solid only for high-emphasis (destructive count, new).">
                  <div className="flex flex-wrap gap-2">
                    <Badge>Default</Badge>
                    <Badge variant="secondary">Secondary</Badge>
                    <Badge variant="outline">Outline</Badge>
                    <Badge variant="destructive">Destructive</Badge>
                  </div>
                </SubSection>

                <SubSection title="Confidence badges (Cash App)" guidance="Dot + label + tabular percentage. Use only in matching surfaces.">
                  <div className="flex flex-wrap items-center gap-6">
                    <ConfidenceBadge level="green" score={0.97} />
                    <ConfidenceBadge level="yellow" score={0.78} />
                    <ConfidenceBadge level="red" score={0.42} />
                  </div>
                  <GuidanceBox>
                    <p>Thresholds: <strong className="text-foreground">≥0.90 green</strong>, <strong className="text-foreground">0.60–0.89 yellow</strong>, <strong className="text-foreground">&lt;0.60 red</strong>. When no candidates, render <code className="font-mono">N/A</code> with a "Needs manual research" sub-label instead of a badge.</p>
                  </GuidanceBox>
                </SubSection>

                <SubSection title="Alerts" guidance="Use sparingly. One alert per region. Prefer inline field errors over alerts.">
                  <div className="space-y-3">
                    <Alert>
                      <Info className="h-4 w-4" />
                      <AlertTitle>Heads up</AlertTitle>
                      <AlertDescription>This is an informational alert.</AlertDescription>
                    </Alert>
                    <Alert variant="destructive">
                      <AlertTriangle className="h-4 w-4" />
                      <AlertTitle>Something went wrong</AlertTitle>
                      <AlertDescription>Use this for errors that need attention.</AlertDescription>
                    </Alert>
                  </div>
                </SubSection>

                <SubSection title="Toasts" guidance="Bottom-right. Auto-dismiss success in 4s. Errors persist until dismissed.">
                  <div className="space-y-2 max-w-md">
                    <div className="border border-border rounded-lg p-3 bg-card flex items-start gap-3 shadow-md">
                      <Check className="h-4 w-4 text-emerald-500 mt-0.5" />
                      <div className="flex-1">
                        <div className="text-sm font-semibold text-foreground">Payment applied</div>
                        <div className="text-xs text-muted-foreground">PAY-5012 → INV-9941 · $24,500.00</div>
                      </div>
                    </div>
                    <div className="border border-destructive/30 rounded-lg p-3 bg-destructive/5 flex items-start gap-3 shadow-md">
                      <AlertTriangle className="h-4 w-4 text-destructive mt-0.5" />
                      <div className="flex-1">
                        <div className="text-sm font-semibold text-foreground">Couldn't post to ERP</div>
                        <div className="text-xs text-muted-foreground">Connection timed out — <button className="text-primary underline">retry</button></div>
                      </div>
                    </div>
                  </div>
                </SubSection>

                <SubSection title="Progress">
                  <div className="space-y-3 max-w-md">
                    <Progress value={32} />
                    <Progress value={68} />
                    <Progress value={94} />
                  </div>
                </SubSection>

                <SubSection title="Tooltip" guidance="Tooltips clarify icons and truncated text. Never put critical info in a tooltip.">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button variant="outline">Hover me</Button>
                      </TooltipTrigger>
                      <TooltipContent>Helpful context</TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </SubSection>
              </Section>

              {/* ---------- NAVIGATION ---------- */}
              <Section id="navigation" title="Navigation">
                <SubSection title="Breadcrumbs" guidance="Required on every detail page. Last item is the current page (no link).">
                  <Breadcrumb>
                    <BreadcrumbList>
                      <BreadcrumbItem><BreadcrumbLink href="/cash">Cash App</BreadcrumbLink></BreadcrumbItem>
                      <BreadcrumbSeparator />
                      <BreadcrumbItem><BreadcrumbLink href="/cash/matching">Matching Queue</BreadcrumbLink></BreadcrumbItem>
                      <BreadcrumbSeparator />
                      <BreadcrumbItem><BreadcrumbPage>PAY-5012</BreadcrumbPage></BreadcrumbItem>
                    </BreadcrumbList>
                  </Breadcrumb>
                </SubSection>

                <SubSection title="Tabs" guidance="Use for switching views of the same object. Don't use tabs for navigation between unrelated pages.">
                  <Tabs value={tab} onValueChange={setTab} className="w-full">
                    <TabsList>
                      <TabsTrigger value="overview">Overview</TabsTrigger>
                      <TabsTrigger value="activity">Activity</TabsTrigger>
                      <TabsTrigger value="settings">Settings</TabsTrigger>
                    </TabsList>
                    <TabsContent value="overview" className="text-sm text-muted-foreground pt-3">Overview content lives here.</TabsContent>
                    <TabsContent value="activity" className="text-sm text-muted-foreground pt-3">Activity feed.</TabsContent>
                    <TabsContent value="settings" className="text-sm text-muted-foreground pt-3">Settings.</TabsContent>
                  </Tabs>
                </SubSection>

                <SubSection title="Sidebar nav item" guidance="34px height, 13px text. Active = primary tint background + primary text.">
                  <div className="max-w-xs space-y-0.5 bg-sidebar p-3 rounded-lg border border-border">
                    <div className="nav-section-label">Action items</div>
                    <a className="nav-item nav-item-active"><div className="flex items-center gap-2.5"><Check className="h-[15px] w-[15px] text-primary" /><span>My Tasks</span></div><span className="tabular-nums text-[11px] font-medium text-muted-foreground/80 bg-secondary rounded-full px-2 py-0.5 min-w-[22px] text-center">4</span></a>
                    <a className="nav-item"><div className="flex items-center gap-2.5"><FileText className="h-[15px] w-[15px] text-muted-foreground" /><span>Pending Review</span></div><span className="tabular-nums text-[11px] font-medium text-muted-foreground/80 bg-secondary rounded-full px-2 py-0.5 min-w-[22px] text-center">12</span></a>
                    <a className="nav-item"><div className="flex items-center gap-2.5"><Banknote className="h-[15px] w-[15px] text-muted-foreground" /><span>Returned</span></div></a>
                  </div>
                </SubSection>

                <SubSection title="Command palette (⌘K)" guidance="Global. Pages, actions, and recent records — never settings/admin pages.">
                  <div className="max-w-md border border-border rounded-lg shadow-md bg-popover">
                    <div className="flex items-center gap-2 px-3 py-2 border-b border-border">
                      <Command className="h-3.5 w-3.5 text-muted-foreground" />
                      <input className="flex-1 text-sm bg-transparent outline-none" placeholder="Type a command or search…" />
                      <kbd className="text-[10px] font-mono text-muted-foreground border border-border rounded px-1.5 py-0.5">ESC</kbd>
                    </div>
                    <div className="p-2 text-xs">
                      <div className="text-[10px] uppercase tracking-wider text-muted-foreground/60 px-2 py-1">Pages</div>
                      <div className="px-2 py-1.5 rounded bg-secondary flex items-center gap-2 text-foreground"><Banknote className="h-3.5 w-3.5" />Cash · Matching Queue</div>
                      <div className="px-2 py-1.5 rounded flex items-center gap-2 text-foreground/80"><FileText className="h-3.5 w-3.5" />Documents</div>
                    </div>
                  </div>
                </SubSection>
              </Section>

              {/* ---------- OVERLAYS ---------- */}
              <Section id="overlays" title="Sheets, Dialogs & Popovers" description="Pick the lightest container that does the job.">
                <SubSection title="When to use what">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                    {[
                      { t: "Sheet (right-side)", w: "480–720px", use: "Default for any context-rich action: review, edit, configure. Preserves page context." },
                      { t: "Dialog / Modal", w: "420–520px", use: "Destructive confirms only (delete, void, write-off). Or focused single-decision tasks." },
                      { t: "Popover", w: "240–360px", use: "Short forms, filter pickers, column settings. Closes on outside click." },
                      { t: "Drawer (bottom)", w: "100% × auto", use: "Mobile-only. Avoid on desktop." },
                    ].map((c) => (
                      <div key={c.t} className="border border-border rounded-lg p-4">
                        <div className="text-sm font-semibold text-foreground">{c.t}</div>
                        <div className="text-[10px] font-mono text-muted-foreground mt-0.5">{c.w}</div>
                        <div className="text-xs text-muted-foreground mt-2 leading-relaxed">{c.use}</div>
                      </div>
                    ))}
                  </div>
                  <DoDont
                    dos={["Sheet by default for forms with > 3 fields", "Dialog for destructive confirms", "Close on ESC and outside click"]}
                    donts={["Stack a modal on top of a sheet", "Use modals for routine actions", "Open a sheet from inside a sheet (route instead)"]}
                  />
                </SubSection>
              </Section>

              {/* ---------- TABLES ---------- */}
              <Section id="tables" title="Tables" description="High-density, Excel-like grids built on AG Grid. The primary work surface for finance users.">
                <GuidanceBox>
                  <p><strong className="text-foreground">Library: AG Grid (always).</strong> All record-list tables use the shared <code className="font-mono">DataTable</code> wrapper around AG Grid. Don't introduce TanStack Table, MUI DataGrid, or raw <code className="font-mono">&lt;table&gt;</code> for lists of records — raw tables are only for static reference content (style-guide examples, legend keys).</p>
                  <p><strong className="text-foreground">Mirror Excel.</strong> Finance users live in spreadsheets. Every grid must support: inline cell editing (where editable), drag-to-reorder columns, pin column left/right, show/hide columns, column resize, multi-column sort, multi-select with shift+click, keyboard navigation (arrows, tab, enter to edit, esc to cancel), and copy/paste of selected ranges.</p>
                  <p><strong className="text-foreground">Inline editing rule.</strong> Turn editing on wherever users are expected to fix or enrich data (Documents, GL coding, mappings, vendor master). Read-only grids (Pending Review, My Tasks, audit logs) keep editing off but still get every other Excel feature.</p>
                  <p><strong className="text-foreground">Don't reach for cards.</strong> If the data has shared columns and would scan as a list, it belongs in a grid — not a card layout.</p>
                </GuidanceBox>
                <SubSection title="Live DataTable (the real component)" guidance="Identical to the grid used on My Tasks & Pending Review. Try column drag, pin, hide, sort, search, multi-select.">
                  <StyleGuideDataTableDemo />
                  <GuidanceBox>
                    <p><strong className="text-foreground">Anatomy:</strong> sticky checkbox left · primary identifier (medium weight) · secondary fields (foreground/80) · numerics right-aligned <code className="font-mono">tabular-nums</code> · status pill · sticky Actions right.</p>
                    <p><strong className="text-foreground">Variance colors:</strong> negative deltas use <code className="font-mono text-rose-700">text-rose-700</code>, positive deltas use <code className="font-mono text-teal-700">text-teal-700</code> — never destructive/emerald (those carry status, not direction).</p>
                    <p><strong className="text-foreground">Row click:</strong> opens the detail view. Action buttons inside the row must call <code className="font-mono">e.stopPropagation()</code> (the shared <code className="font-mono">RowActions</code> handles this automatically).</p>
                  </GuidanceBox>
                </SubSection>

                <SubSection title="Bulk-action toolbar" guidance="When 1+ rows are selected, replace filters with bulk actions. Selection count is the lead label.">
                  <div className="flex items-center gap-2 p-2 border border-border rounded-lg bg-card">
                    <div className="text-xs font-medium text-foreground px-2">3 selected</div>
                    <div className="h-5 w-px bg-border" />
                    <Button size="sm" className="h-8">Approve 3</Button>
                    <Button size="sm" variant="outline" className="h-8">Assign…</Button>
                    <Button size="sm" variant="outline" className="h-8"><Download />Export</Button>
                    <div className="flex-1" />
                    <Button size="sm" variant="ghost" className="h-8 text-destructive hover:text-destructive"><Trash2 />Delete</Button>
                  </div>
                </SubSection>

                <SubSection title="Filter & toolbar (no selection)" guidance="Search left · saved filters middle · view-controls right. Always in this order.">
                  <div className="flex items-center gap-2 p-2 border border-border rounded-lg bg-card">
                    <div className="relative flex-1 max-w-xs">
                      <Search className="h-3.5 w-3.5 text-muted-foreground absolute left-2.5 top-1/2 -translate-y-1/2" />
                      <Input placeholder="Search payments…" className="h-9 pl-8" />
                    </div>
                    <Button variant="outline" size="sm"><Filter />Status: All</Button>
                    <Button variant="outline" size="sm"><CalendarIcon />Last 30 days</Button>
                    <div className="flex-1" />
                    <Button variant="ghost" size="sm"><Columns3 />Columns</Button>
                  </div>
                </SubSection>

                <SubSection title="Column header anatomy" guidance="Drag handle on hover · label · sort indicator · pin/hide menu on right-click or via Columns popover.">
                  <div className="border border-border rounded-lg overflow-hidden bg-card">
                    <div className="flex items-center gap-2 bg-secondary/40 border-b border-border px-3 py-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                      <GripVertical className="h-3.5 w-3.5 opacity-40" />
                      <span>Vendor</span>
                      <ArrowUpDown className="h-3 w-3 opacity-50" />
                      <div className="flex-1" />
                      <Pin className="h-3 w-3 opacity-40" />
                    </div>
                    <div className="px-3 py-2 text-sm text-foreground border-b border-border">Acme Corp</div>
                    <div className="px-3 py-2 text-sm text-foreground">Globex Industries</div>
                  </div>
                </SubSection>

                <SubSection title="Row actions">
                  <div className="border border-border rounded-lg p-4 bg-card flex items-center justify-between gap-4">
                    <span className="text-sm text-foreground">PAY-5012 · Acme Corp · <span className="tabular-nums">$24,500.00</span></span>
                    <RowActions
                      review={{ label: "Review", onClick: () => {} }}
                      primary={{ label: "Approve", onClick: () => {} }}
                      more={[
                        { label: "Reassign", onClick: () => {} },
                        { label: "Download", onClick: () => {}, icon: <Download className="h-3.5 w-3.5" /> },
                        { label: "Reject", onClick: () => {}, icon: <FileX className="h-3.5 w-3.5" />, destructive: true },
                      ]}
                    />
                  </div>
                  <GuidanceBox>
                    <p>Always use the shared <code className="font-mono">&lt;RowActions /&gt;</code> component. Pattern: <strong>at most one</strong> primary icon + Review eye icon + overflow menu. Never stack 4 buttons in a row — push secondary actions into the menu.</p>
                  </GuidanceBox>
                </SubSection>

                <SubSection title="Excel feature checklist" guidance="Every grid in the app must support all of these — even read-only ones.">
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    {[
                      "Drag column headers to reorder",
                      "Pin column to start or end",
                      "Show / hide columns (Columns popover)",
                      "Resize columns (drag right edge)",
                      "Multi-column sort (shift+click headers)",
                      "Multi-select rows (shift+click, ⌘+click)",
                      "Keyboard nav (arrows, tab, enter, esc)",
                      "Copy selected range (⌘C / Ctrl+C)",
                      "Inline cell editing (Documents only)",
                      "Per-user persistence in localStorage",
                      "Sticky header on vertical scroll",
                      "Sticky checkbox + Actions columns",
                    ].map((f) => (
                      <div key={f} className="flex items-center gap-2 px-3 py-2 rounded-md border border-border bg-background/50">
                        <Check className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                        <span className="text-foreground/80">{f}</span>
                      </div>
                    ))}
                  </div>
                  <DoDont
                    dos={["Use the shared DataTable wrapper for any list of records", "Right-align numeric columns + tabular-nums", "Enable inline editing on grids where users fix/enrich data (Documents)", "Persist column order, pinning, width, and visibility per user via dt:<storageKey>"]}
                    donts={["Hand-roll a <table> or swap in another grid library", "Use card grids for tabular data (lose alignment & scanability)", "Show > 1 primary action per row — push the rest into the overflow menu", "Disable Excel features (reorder, pin, resize, sort) just because a grid is read-only"]}
                  />
                </SubSection>

                <SubSection title="Status pills used in tables" guidance="Use the same pill set everywhere — never invent a new color for a one-off status.">
                  <div className="flex flex-wrap gap-2">
                    <span className="text-[11px] font-medium px-2.5 py-1 rounded-full border bg-amber-50 text-amber-700 border-amber-200">Pending</span>
                    <span className="text-[11px] font-medium px-2.5 py-1 rounded-full border bg-emerald-50 text-emerald-700 border-emerald-200">Approved</span>
                    <span className="text-[11px] font-medium px-2.5 py-1 rounded-full border bg-destructive/10 text-destructive border-destructive/30">Rejected</span>
                    <span className="text-[11px] font-medium px-2.5 py-1 rounded-full border bg-blue-50 text-blue-700 border-blue-200">In Review</span>
                    <span className="text-[11px] font-medium px-2.5 py-1 rounded-full border bg-violet-50 text-violet-700 border-violet-200">Posted</span>
                    <span className="text-[11px] font-medium px-2.5 py-1 rounded-full border bg-secondary/60 text-foreground border-border">Draft</span>
                    <span className="text-[11px] font-medium px-2.5 py-1 rounded-full border bg-orange-50 text-orange-700 border-orange-200">Returned</span>
                  </div>
                </SubSection>

                <SubSection title="Confidence badges" guidance="Use the shared ConfidenceBadge — never build your own. Levels map to score bands: ≥0.9 green, 0.6–0.9 yellow, &lt;0.6 red.">
                  <div className="flex flex-wrap gap-3 items-center">
                    <ConfidenceBadge level="green" score={0.97} />
                    <ConfidenceBadge level="yellow" score={0.78} />
                    <ConfidenceBadge level="red" score={0.42} />
                  </div>
                </SubSection>

                <SubSection title="Variance / delta cells" guidance="Direction is conveyed by sign + color. Never strip the sign — '+' and '−' are part of the value.">
                  <div className="grid grid-cols-3 gap-3 text-sm">
                    <div className="border border-border rounded-md p-3 bg-card">
                      <div className="text-[11px] uppercase tracking-wider text-muted-foreground mb-1">Short pay</div>
                      <div className="tabular-nums font-medium text-rose-700">−$4,500.00</div>
                    </div>
                    <div className="border border-border rounded-md p-3 bg-card">
                      <div className="text-[11px] uppercase tracking-wider text-muted-foreground mb-1">Over pay</div>
                      <div className="tabular-nums font-medium text-teal-700">+$1,250.00</div>
                    </div>
                    <div className="border border-border rounded-md p-3 bg-card">
                      <div className="text-[11px] uppercase tracking-wider text-muted-foreground mb-1">Match</div>
                      <div className="tabular-nums font-medium text-muted-foreground">$0.00</div>
                    </div>
                  </div>
                </SubSection>
              </Section>

              {/* ---------- CHARTS ---------- */}
              <Section id="charts" title="Charts & Data Viz" description="Use Recharts via the Chart wrapper. Colors come from semantic tokens, never hex.">
                <SubSection title="Bar chart" guidance="Use for time-series counts. One color per series, primary by default.">
                  <MiniBars />
                </SubSection>
                <SubSection title="Aging bar (stacked)" guidance="Standard AR aging colors: emerald → primary → amber → orange → destructive. Always in this order.">
                  <div className="space-y-3">
                    {[
                      { bucket: "Current", pct: 56, cls: "bg-emerald-500" },
                      { bucket: "1–30", pct: 28, cls: "bg-primary" },
                      { bucket: "31–60", pct: 10, cls: "bg-amber-500" },
                      { bucket: "61–90", pct: 4, cls: "bg-orange-500" },
                      { bucket: "90+", pct: 2, cls: "bg-destructive" },
                    ].map((b) => (
                      <div key={b.bucket} className="flex items-center gap-3">
                        <div className="w-16 text-xs text-muted-foreground">{b.bucket}</div>
                        <div className="flex-1 h-2 bg-secondary rounded-full overflow-hidden"><div className={`h-full ${b.cls}`} style={{ width: `${b.pct}%` }} /></div>
                        <div className="w-10 text-xs tabular-nums text-foreground text-right">{b.pct}%</div>
                      </div>
                    ))}
                  </div>
                </SubSection>
                <SubSection title="Sparkline KPI" guidance="One metric, one number, one delta. Trend color matches direction (green up / amber neutral / destructive down for negative-is-bad metrics).">
                  <div className="grid grid-cols-3 gap-4">
                    {[
                      { label: "Matched today", val: "82", trend: "+12%", cls: "text-emerald-600" },
                      { label: "Awaiting review", val: "27", trend: "-4%", cls: "text-amber-600" },
                      { label: "Exceptions", val: "9", trend: "+2", cls: "text-destructive" },
                    ].map((k) => (
                      <div key={k.label} className="stat-card">
                        <div className="text-[11px] uppercase tracking-wider text-muted-foreground/70">{k.label}</div>
                        <div className="text-2xl font-bold text-foreground tabular-nums mt-1">{k.val}</div>
                        <div className={`text-xs font-medium mt-1 ${k.cls}`}>{k.trend} vs last week</div>
                      </div>
                    ))}
                  </div>
                  <DoDont
                    dos={["Use semantic tokens via the Chart config", "Always include axis units ($, %, count)", "Sort categorical bars by value, not alphabet"]}
                    donts={["Use 3D, gradients, or pie charts > 4 slices", "Encode quantity by area only", "Use red & green together without labels (color-blind safe)"]}
                  />
                </SubSection>
              </Section>

              {/* ---------- CARDS ---------- */}
              <Section id="cards" title="Cards & Surfaces">
                <SubSection title="Stat card with accent" guidance="4px left accent encodes the metric's status family.">
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    {[
                      { label: "Matched Today", value: "82", sub: "$184,250 auto-applied", accent: "border-l-emerald-500" },
                      { label: "Awaiting Review", value: "27", sub: "Medium confidence", accent: "border-l-amber-500" },
                      { label: "Exceptions", value: "9", sub: "Need attention", accent: "border-l-destructive" },
                      { label: "Unapplied Cash", value: "$12,480", sub: "6 payments", accent: "border-l-primary" },
                    ].map((c) => (
                      <div key={c.label} className={`stat-card border-l-4 ${c.accent}`}>
                        <div className="text-[11px] uppercase tracking-wider text-muted-foreground/70">{c.label}</div>
                        <div className="text-2xl font-bold text-foreground tabular-nums mt-2">{c.value}</div>
                        <div className="text-xs text-muted-foreground mt-1">{c.sub}</div>
                      </div>
                    ))}
                  </div>
                  <GuidanceBox>
                    <p><strong className="text-foreground">When to use stat cards.</strong> Only when the number drives a decision or action on this page — e.g. Dashboard KPIs, queue health on Matching, AR aging totals. Pages whose primary job is a table or detail view should usually have <strong>zero</strong> stat cards.</p>
                    <p><strong className="text-foreground">Don't decorate.</strong> A counter that just restates "rows in the table below" or duplicates a sidebar badge is noise. If removing it costs the user nothing, remove it.</p>
                  </GuidanceBox>
                  <DoDont
                    dos={["Show stat cards on dashboards, overviews, and queues where the metric drives action", "Pair each metric with a sub-line giving context ($ value, delta, owner)", "Cap at 4 cards per row; group related metrics together"]}
                    donts={["Add stat cards to every page by default", "Restate the row count of the table directly below", "Duplicate counts that already appear in the sidebar or breadcrumbs", "Use stat cards as page filler when the page is just a list"]}
                  />
                </SubSection>

                <SubSection title="Generic card">
                  <Card className="p-6 max-w-md">
                    <div className="flex items-start gap-3">
                      <Avatar><AvatarFallback>JD</AvatarFallback></Avatar>
                      <div>
                        <div className="text-sm font-semibold text-foreground">Jane Doe</div>
                        <div className="text-xs text-muted-foreground">Reviewed PAY-5012 · 2m ago</div>
                      </div>
                    </div>
                    <Separator className="my-4" />
                    <p className="text-sm text-foreground/80">"Auto-matched against INV-9941. Confidence 97%."</p>
                  </Card>
                </SubSection>
              </Section>

              {/* ---------- LOADING & EMPTY ---------- */}
              <Section id="loading" title="Loading & Empty States" description="A screen always tells the user what's happening.">
                <SubSection title="Skeletons" guidance="Match the shape of the content that's loading. Never block with a spinner over a populated screen.">
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <Skeleton className="h-9 w-9 rounded-full" />
                      <div className="flex-1 space-y-2">
                        <Skeleton className="h-3 w-1/3" />
                        <Skeleton className="h-3 w-1/2" />
                      </div>
                    </div>
                    <Skeleton className="h-2 w-full" />
                    <Skeleton className="h-2 w-5/6" />
                  </div>
                </SubSection>

                <SubSection title="Inline spinner">
                  <div className="flex items-center gap-3 text-sm text-muted-foreground">
                    <Loader2 className="h-4 w-4 animate-spin text-primary" />
                    Posting to ERP…
                  </div>
                </SubSection>

                <SubSection title="Empty state" guidance="Icon · 1 line title · 1 line description · 1 primary action. Never show empty tables without context.">
                  <div className="border border-dashed border-border rounded-lg p-10 text-center">
                    <div className="h-12 w-12 mx-auto rounded-full bg-secondary flex items-center justify-center"><FileText className="h-5 w-5 text-muted-foreground" /></div>
                    <div className="mt-3 text-sm font-semibold text-foreground">No payments yet</div>
                    <div className="text-xs text-muted-foreground mt-1">Upload a remittance or connect a lockbox to get started.</div>
                    <Button className="mt-4"><Upload />Upload remittance</Button>
                  </div>
                </SubSection>
              </Section>

              {/* ---------- FORMATTING ---------- */}
              <Section id="formatting" title="Data Formatting" description="Consistent formatting makes scanning numbers possible.">
                <SubSection title="Numbers, currency, dates">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div className="border border-border rounded-lg p-4">
                      <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Currency</div>
                      <div className="space-y-1.5 tabular-nums text-foreground">
                        <div>$1,234.56 <span className="text-[11px] text-muted-foreground ml-2 font-sans">USD default, 2 decimals</span></div>
                        <div>$1,234,567 <span className="text-[11px] text-muted-foreground ml-2 font-sans">No decimals when ≥ $10k & whole</span></div>
                        <div className="text-rose-700">−$4,500.00 <span className="text-[11px] text-muted-foreground ml-2 font-sans">Negative = rose, leading minus sign (not parens)</span></div>
                        <div className="text-teal-700">+$500.00 <span className="text-[11px] text-muted-foreground ml-2 font-sans">Positive variance = teal, leading plus sign</span></div>
                      </div>
                    </div>
                    <div className="border border-border rounded-lg p-4">
                      <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Dates</div>
                      <div className="space-y-1.5 tabular-nums text-foreground">
                        <div>May 5, 2026 <span className="text-[11px] text-muted-foreground ml-2 font-sans">Long form in detail views</span></div>
                        <div>05/05/26 <span className="text-[11px] text-muted-foreground ml-2 font-sans">Short form in dense tables</span></div>
                        <div>2m ago · 3h ago · Yesterday <span className="text-[11px] text-muted-foreground ml-2 font-sans">Relative when &lt; 7 days</span></div>
                        <div>4:00 PM EST <span className="text-[11px] text-muted-foreground ml-2 font-sans">Always show timezone with times</span></div>
                      </div>
                    </div>
                    <div className="border border-border rounded-lg p-4">
                      <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Identifiers</div>
                      <div className="space-y-1.5 text-foreground">
                        <div className="font-medium">PAY-5012 <span className="text-[11px] text-muted-foreground ml-2 font-normal">Prefixed, hyphenated, monospace not required</span></div>
                        <div className="font-medium">INV-9941</div>
                        <div className="text-muted-foreground text-xs">Use medium weight to anchor identifier columns.</div>
                      </div>
                    </div>
                    <div className="border border-border rounded-lg p-4">
                      <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Empty values</div>
                      <div className="space-y-1.5 text-foreground">
                        <div className="text-muted-foreground">— <span className="text-[11px] ml-2 font-sans">Em-dash for missing data</span></div>
                        <div className="text-muted-foreground">N/A <span className="text-[11px] ml-2 font-sans">When the value isn't applicable (vs missing)</span></div>
                      </div>
                    </div>
                  </div>
                </SubSection>
              </Section>

              {/* ---------- ACCESSIBILITY ---------- */}
              <Section id="accessibility" title="Accessibility" description="Itemize aims for WCAG 2.1 AA across both themes.">
                <SubSection title="Checklist">
                  <ul className="text-sm text-foreground/80 space-y-2 list-disc pl-5">
                    <li>Color contrast: all text ≥ 4.5:1, large text ≥ 3:1. Verify in both light and dark.</li>
                    <li>Never encode meaning by color alone — pair with icon, label, or shape.</li>
                    <li>Every input has a <code className="font-mono">&lt;Label htmlFor&gt;</code>. Every icon-only button has <code className="font-mono">aria-label</code>.</li>
                    <li>Keyboard: Tab order follows visual order; ESC closes overlays; Enter activates default.</li>
                    <li>Focus ring uses <code className="font-mono">--ring</code> token — never remove with <code className="font-mono">outline-none</code> without replacing.</li>
                    <li>Honor <code className="font-mono">prefers-reduced-motion</code> — disable slide/scale, keep fades.</li>
                    <li>Tables: <code className="font-mono">&lt;th scope&gt;</code> on headers; rows have semantic order; sortable headers expose <code className="font-mono">aria-sort</code>.</li>
                    <li>Loading states announce via <code className="font-mono">aria-live="polite"</code> on the status region.</li>
                  </ul>
                </SubSection>
              </Section>

              {/* ---------- PATTERNS ---------- */}
              <Section id="patterns" title="App Patterns" description="Cross-cutting conventions used everywhere.">
                <SubSection title="Page header" guidance="Breadcrumb · h1 · 1-line context · primary actions on the right.">
                  <div className="flex items-start justify-between">
                    <div>
                      <Breadcrumb><BreadcrumbList>
                        <BreadcrumbItem><BreadcrumbLink href="#">Cash App</BreadcrumbLink></BreadcrumbItem>
                        <BreadcrumbSeparator />
                        <BreadcrumbItem><BreadcrumbPage>Matching Queue</BreadcrumbPage></BreadcrumbItem>
                      </BreadcrumbList></Breadcrumb>
                      <h1 className="text-2xl font-bold text-foreground tracking-tight mt-2">Matching Queue</h1>
                      <p className="text-sm text-muted-foreground mt-1">27 payments awaiting review</p>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline"><Upload />Import</Button>
                      <Button>Run Auto-Match</Button>
                    </div>
                  </div>
                </SubSection>

                <SubSection title="Detail split-pane" guidance="Source on the left, AI extraction & actions on the right. ~50/50 split, resizable.">
                  <div className="grid grid-cols-2 gap-3 border border-border rounded-lg p-3 bg-secondary/20 h-40">
                    <div className="border border-border rounded bg-card flex items-center justify-center text-xs text-muted-foreground">Source document</div>
                    <div className="border border-border rounded bg-card flex items-center justify-center text-xs text-muted-foreground">Extracted fields & actions</div>
                  </div>
                </SubSection>

                <SubSection title="Bulk action bar" guidance="Replaces filter row when ≥1 row selected. Slides down from the toolbar.">
                  <div className="flex items-center gap-2 p-2 border border-primary/30 rounded-lg bg-primary/5">
                    <span className="text-sm font-medium text-foreground">3 selected</span>
                    <Separator orientation="vertical" className="h-5" />
                    <Button size="sm" variant="ghost"><Check />Approve</Button>
                    <Button size="sm" variant="ghost"><Bell />Notify</Button>
                    <Button size="sm" variant="ghost" className="text-destructive"><Trash2 />Delete</Button>
                    <div className="flex-1" />
                    <Button size="sm" variant="ghost">Clear</Button>
                  </div>
                </SubSection>

                <SubSection title="Master Do's & Don'ts">
                  <DoDont
                    dos={[
                      "Use semantic tokens (bg-primary, text-foreground)",
                      "Use tabular-nums for money & counts",
                      "Prefer side-popout sheets over modals",
                      "Use the global ⌘K palette for navigation",
                      "Ship every screen tested in both themes",
                      "Pre-fill AI fields directly without an approval step",
                    ]}
                    donts={[
                      "Hard-code hex colors in components",
                      "Use text-white / bg-black",
                      "Open modals when a sheet would work",
                      "Use serif fonts or non-Lucide icons",
                      "Encode meaning by color alone",
                      "Add 'AI suggestion: Approve / Reject' modals",
                    ]}
                  />
                </SubSection>
              </Section>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function MiniBars() {
  const data = [40, 65, 50, 80, 72, 95, 60];
  const max = Math.max(...data);
  return (
    <div className="flex items-end gap-3 h-32">
      {data.map((v, i) => (
        <div key={i} className="flex-1 flex flex-col items-center gap-2">
          <div className="w-full bg-primary/80 hover:bg-primary rounded-t transition-colors" style={{ height: `${(v / max) * 100}%` }} />
          <div className="text-[10px] text-muted-foreground">D{i + 1}</div>
        </div>
      ))}
    </div>
  );
}
