import { useState } from "react";
import {
  Palette, Type, Layout, Square, Table as TableIcon, BarChart3,
  Check, X, AlertTriangle, Info, Search, Upload,
  FileText, Banknote, MoreHorizontal, Edit, Trash2,
} from "lucide-react";
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
  { label: "Emerald (success / High)", className: "bg-emerald-500", text: "text-emerald-600" },
  { label: "Amber (warning / Medium)", className: "bg-amber-500", text: "text-amber-600" },
  { label: "Destructive (error / Low)", className: "bg-destructive", text: "text-destructive" },
  { label: "Teal (positive variance)", className: "bg-teal-600", text: "text-teal-700" },
  { label: "Rose (negative variance)", className: "bg-rose-600", text: "text-rose-700" },
  { label: "Primary (info / brand)", className: "bg-primary", text: "text-primary" },
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

function SubSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/80 mb-3">{title}</h3>
      <div className="bg-card border border-border rounded-xl p-6">{children}</div>
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

const NAV = [
  { id: "foundations", label: "Foundations", icon: Palette },
  { id: "typography", label: "Typography", icon: Type },
  { id: "buttons", label: "Buttons", icon: Square },
  { id: "forms", label: "Forms & Inputs", icon: Edit },
  { id: "feedback", label: "Feedback", icon: Info },
  { id: "navigation", label: "Navigation", icon: Layout },
  { id: "tables", label: "Tables", icon: TableIcon },
  { id: "charts", label: "Charts & Data Viz", icon: BarChart3 },
  { id: "cards", label: "Cards & Surfaces", icon: Layout },
  { id: "patterns", label: "App Patterns", icon: FileText },
];

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
                A complete reference for tokens, components and patterns used across Itemize. All colors are HSL semantic tokens — never hard-code hex values in components.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-[200px_1fr] gap-8">
            {/* Sticky in-page nav */}
            <nav className="sticky top-4 self-start space-y-0.5">
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

            <div>
              {/* ---------- FOUNDATIONS ---------- */}
              <Section id="foundations" title="Foundations" description="Colors, tokens, spacing, radii, and shadows. Both light and dark modes are supported via CSS variables.">
                <SubSection title="Semantic color tokens">
                  <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
                    {semanticColors.map((c) => <ColorSwatch key={c.name} {...c} />)}
                  </div>
                  <p className="text-xs text-muted-foreground mt-4">
                    Usage: <code className="px-1.5 py-0.5 bg-secondary rounded font-mono text-[11px]">bg-primary text-primary-foreground</code>. Always pair surfaces with their <code className="px-1.5 py-0.5 bg-secondary rounded font-mono text-[11px]">-foreground</code> token.
                  </p>
                </SubSection>

                <SubSection title="Status & accent palette">
                  <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                    {statusColors.map((s) => (
                      <div key={s.label} className="flex items-center gap-3">
                        <div className={`h-10 w-10 rounded-md ${s.className}`} />
                        <div>
                          <div className={`text-[13px] font-medium ${s.text}`}>{s.label}</div>
                          <div className="text-[11px] text-muted-foreground font-mono">{s.className}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </SubSection>

                <SubSection title="Border radius">
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

                <SubSection title="Elevation & shadows">
                  <div className="grid grid-cols-3 gap-4">
                    <div className="bg-card p-4 rounded-lg border border-border shadow-sm text-xs text-foreground">shadow-sm</div>
                    <div className="bg-card p-4 rounded-lg border border-border shadow-md text-xs text-foreground">shadow-md</div>
                    <div className="bg-card p-4 rounded-lg border border-border shadow-xl text-xs text-foreground">shadow-xl</div>
                  </div>
                </SubSection>

                <SubSection title="Spacing scale">
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
              </Section>

              {/* ---------- TYPOGRAPHY ---------- */}
              <Section id="typography" title="Typography" description="Inter is the system font. Use tabular-nums for any numeric data.">
                <SubSection title="Type scale">
                  <div className="space-y-4">
                    <div><div className="text-[10px] font-mono text-muted-foreground mb-1">text-3xl / bold / tracking-tight</div><div className="text-3xl font-bold tracking-tight text-foreground">Cash applied today</div></div>
                    <div><div className="text-[10px] font-mono text-muted-foreground mb-1">text-2xl / bold / tracking-tight — Page titles</div><div className="text-2xl font-bold tracking-tight text-foreground">Cash Application</div></div>
                    <div><div className="text-[10px] font-mono text-muted-foreground mb-1">text-xl / bold</div><div className="text-xl font-bold text-foreground">Section heading</div></div>
                    <div><div className="text-[10px] font-mono text-muted-foreground mb-1">text-lg / semibold</div><div className="text-lg font-semibold text-foreground">Card title</div></div>
                    <div><div className="text-[10px] font-mono text-muted-foreground mb-1">text-sm — Body</div><div className="text-sm text-foreground">Standard body copy used throughout the app interface.</div></div>
                    <div><div className="text-[10px] font-mono text-muted-foreground mb-1">text-xs / muted-foreground — Helper</div><div className="text-xs text-muted-foreground">Helper text and metadata sit at this size.</div></div>
                    <div><div className="text-[10px] font-mono text-muted-foreground mb-1">text-[11px] / uppercase / tracking-wider — Eyebrow</div><div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/60">Section label</div></div>
                    <div><div className="text-[10px] font-mono text-muted-foreground mb-1">tabular-nums — Numerics</div><div className="text-sm tabular-nums text-foreground">$184,250.50 · 27 · 4:00 PM EST</div></div>
                  </div>
                </SubSection>
              </Section>

              {/* ---------- BUTTONS ---------- */}
              <Section id="buttons" title="Buttons" description="Use Button variants — never custom button styles.">
                <SubSection title="Variants">
                  <div className="flex flex-wrap gap-3">
                    <Button>Default</Button>
                    <Button variant="secondary">Secondary</Button>
                    <Button variant="outline">Outline</Button>
                    <Button variant="ghost">Ghost</Button>
                    <Button variant="destructive">Destructive</Button>
                    <Button variant="link">Link</Button>
                  </div>
                </SubSection>
                <SubSection title="Sizes">
                  <div className="flex flex-wrap items-center gap-3">
                    <Button size="sm">Small</Button>
                    <Button size="default">Default</Button>
                    <Button size="lg">Large</Button>
                    <Button size="icon"><Search /></Button>
                  </div>
                </SubSection>
                <SubSection title="With icons">
                  <div className="flex flex-wrap gap-3">
                    <Button><Upload />Upload</Button>
                    <Button variant="outline"><Check />Approve</Button>
                    <Button variant="destructive"><Trash2 />Delete</Button>
                  </div>
                </SubSection>
              </Section>

              {/* ---------- FORMS ---------- */}
              <Section id="forms" title="Forms & Inputs">
                <SubSection title="Text inputs">
                  <div className="grid grid-cols-2 gap-4 max-w-2xl">
                    <div>
                      <Label htmlFor="ex-email">Email</Label>
                      <Input id="ex-email" type="email" placeholder="you@acme.com" className="mt-1.5" />
                    </div>
                    <div>
                      <Label htmlFor="ex-amount">Amount</Label>
                      <Input id="ex-amount" placeholder="$0.00" className="mt-1.5 tabular-nums" />
                    </div>
                    <div className="col-span-2">
                      <Label htmlFor="ex-notes">Notes</Label>
                      <Textarea id="ex-notes" placeholder="Add a note..." className="mt-1.5" />
                    </div>
                  </div>
                </SubSection>

                <SubSection title="Selection controls">
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
                </SubSection>
              </Section>

              {/* ---------- FEEDBACK ---------- */}
              <Section id="feedback" title="Feedback & Status">
                <SubSection title="Badges">
                  <div className="flex flex-wrap gap-2">
                    <Badge>Default</Badge>
                    <Badge variant="secondary">Secondary</Badge>
                    <Badge variant="outline">Outline</Badge>
                    <Badge variant="destructive">Destructive</Badge>
                  </div>
                </SubSection>

                <SubSection title="Confidence badges (Cash App)">
                  <div className="flex flex-wrap items-center gap-6">
                    <ConfidenceBadge level="green" score={0.97} />
                    <ConfidenceBadge level="yellow" score={0.78} />
                    <ConfidenceBadge level="red" score={0.42} />
                  </div>
                  <p className="text-xs text-muted-foreground mt-3">Dot + label + tabular percentage. Used in matching queues.</p>
                </SubSection>

                <SubSection title="Alerts">
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

                <SubSection title="Progress">
                  <div className="space-y-3 max-w-md">
                    <Progress value={32} />
                    <Progress value={68} />
                    <Progress value={94} />
                  </div>
                </SubSection>

                <SubSection title="Tooltip">
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
                <SubSection title="Breadcrumbs">
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

                <SubSection title="Tabs">
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

                <SubSection title="Sidebar nav item">
                  <div className="max-w-xs space-y-0.5 bg-sidebar p-3 rounded-lg border border-border">
                    <div className="nav-section-label">Action items</div>
                    <a className="nav-item nav-item-active"><div className="flex items-center gap-2.5"><Check className="h-[15px] w-[15px] text-primary" /><span>My Tasks</span></div><span className="tabular-nums text-[11px] font-medium text-muted-foreground/80 bg-secondary rounded-full px-2 py-0.5 min-w-[22px] text-center">4</span></a>
                    <a className="nav-item"><div className="flex items-center gap-2.5"><FileText className="h-[15px] w-[15px] text-muted-foreground" /><span>Pending Review</span></div><span className="tabular-nums text-[11px] font-medium text-muted-foreground/80 bg-secondary rounded-full px-2 py-0.5 min-w-[22px] text-center">12</span></a>
                    <a className="nav-item"><div className="flex items-center gap-2.5"><Banknote className="h-[15px] w-[15px] text-muted-foreground" /><span>Returned</span></div></a>
                  </div>
                </SubSection>
              </Section>

              {/* ---------- TABLES ---------- */}
              <Section id="tables" title="Tables" description="High-density grids. Use tabular-nums on numeric columns and the DataTable component for full features.">
                <SubSection title="Standard table">
                  <div className="border border-border rounded-lg overflow-hidden">
                    <table className="w-full text-sm">
                      <thead className="bg-secondary/40 border-b border-border">
                        <tr className="text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                          <th className="px-4 py-2.5 w-8"><Checkbox /></th>
                          <th className="px-4 py-2.5">Payment</th>
                          <th className="px-4 py-2.5">Payer</th>
                          <th className="px-4 py-2.5 text-right">Amount</th>
                          <th className="px-4 py-2.5">Match</th>
                          <th className="px-4 py-2.5 w-10"></th>
                        </tr>
                      </thead>
                      <tbody>
                        {[
                          { id: "PAY-5012", payer: "Acme Corp", amt: "$24,500.00", lvl: "green" as const, score: 0.97 },
                          { id: "PAY-5013", payer: "Globex Industries", amt: "$8,120.00", lvl: "yellow" as const, score: 0.78 },
                          { id: "PAY-5014", payer: "Initech LLC", amt: "$3,200.00", lvl: "red" as const, score: 0.42 },
                        ].map((r) => (
                          <tr key={r.id} className="border-b border-border last:border-0 hover:bg-secondary/30">
                            <td className="px-4 py-2.5"><Checkbox /></td>
                            <td className="px-4 py-2.5 font-medium text-foreground">{r.id}</td>
                            <td className="px-4 py-2.5 text-foreground/80">{r.payer}</td>
                            <td className="px-4 py-2.5 text-right tabular-nums text-foreground">{r.amt}</td>
                            <td className="px-4 py-2.5"><ConfidenceBadge level={r.lvl} score={r.score} /></td>
                            <td className="px-4 py-2.5 text-right"><Button variant="ghost" size="icon" className="h-7 w-7"><MoreHorizontal /></Button></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <ul className="text-xs text-muted-foreground mt-3 space-y-1 list-disc pl-4">
                    <li>Header: <code className="font-mono">bg-secondary/40</code>, uppercase 11px tracking-wider, muted</li>
                    <li>Row hover: <code className="font-mono">hover:bg-secondary/30</code></li>
                    <li>Numeric cells: right-aligned, <code className="font-mono">tabular-nums</code></li>
                    <li>Sticky checkbox left, sticky actions right (in DataTable)</li>
                    <li>Use <code className="font-mono">DataTable</code> for reorder/pin/show-hide; inline editing only in Documents</li>
                  </ul>
                </SubSection>
              </Section>

              {/* ---------- CHARTS ---------- */}
              <Section id="charts" title="Charts & Data Viz" description="Use Recharts via the Chart wrapper. Colors come from semantic tokens, never hex.">
                <SubSection title="Bar chart">
                  <MiniBars />
                </SubSection>
                <SubSection title="Aging bar (stacked)">
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
                <SubSection title="Sparkline KPI">
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
                </SubSection>
              </Section>

              {/* ---------- CARDS ---------- */}
              <Section id="cards" title="Cards & Surfaces">
                <SubSection title="Stat card with accent">
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

              {/* ---------- PATTERNS ---------- */}
              <Section id="patterns" title="App Patterns" description="Cross-cutting conventions used everywhere.">
                <SubSection title="Page header">
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

                <SubSection title="Empty state">
                  <div className="border border-dashed border-border rounded-lg p-10 text-center">
                    <div className="h-12 w-12 mx-auto rounded-full bg-secondary flex items-center justify-center"><FileText className="h-5 w-5 text-muted-foreground" /></div>
                    <div className="mt-3 text-sm font-semibold text-foreground">No payments yet</div>
                    <div className="text-xs text-muted-foreground mt-1">Upload a remittance or connect a lockbox to get started.</div>
                    <Button className="mt-4"><Upload />Upload remittance</Button>
                  </div>
                </SubSection>

                <SubSection title="Do & Don't">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="border border-emerald-500/30 bg-emerald-500/5 rounded-lg p-4">
                      <div className="flex items-center gap-2 text-emerald-600 text-sm font-semibold"><Check className="h-4 w-4" />Do</div>
                      <ul className="text-xs text-foreground/80 mt-2 space-y-1 list-disc pl-4">
                        <li>Use semantic tokens (<code className="font-mono">bg-primary</code>, <code className="font-mono">text-foreground</code>)</li>
                        <li>Use <code className="font-mono">tabular-nums</code> for money & counts</li>
                        <li>Prefer side-popout sheets over modals</li>
                        <li>Use the global ⌘K palette for navigation</li>
                      </ul>
                    </div>
                    <div className="border border-destructive/30 bg-destructive/5 rounded-lg p-4">
                      <div className="flex items-center gap-2 text-destructive text-sm font-semibold"><X className="h-4 w-4" />Don't</div>
                      <ul className="text-xs text-foreground/80 mt-2 space-y-1 list-disc pl-4">
                        <li>Don't hard-code hex colors in components</li>
                        <li>Don't use <code className="font-mono">text-white</code> / <code className="font-mono">bg-black</code></li>
                        <li>Don't open modals when a sheet would work</li>
                        <li>Don't use serif fonts</li>
                      </ul>
                    </div>
                  </div>
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
