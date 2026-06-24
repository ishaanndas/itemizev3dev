import itemizeLogo from "@/assets/itemize-logo.png";
import {
  CheckCircle,
  Clock,
  AlertCircle,
  Inbox,
  LayoutDashboard,
  FileText,
  Globe,
  Link2,
  Mail,
  Package,
  CreditCard,
  ArrowRightLeft,
  Activity,
  PieChart,
  Landmark,
  Users,
  BarChart3,
  GitMerge,
  FileBarChart,
  TrendingUp,
  ChevronDown,
  ChevronsUpDown,
  PanelLeftClose,
  PanelLeft,
  Banknote,
  FileSpreadsheet,
  ScrollText,
  ShieldAlert,
  Wallet,
  Palette,
  type LucideIcon,
} from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSidebarState } from "@/contexts/SidebarContext";
import { useProduct, type Product } from "@/contexts/ProductContext";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Check, Plus, Settings as SettingsIcon } from "lucide-react";

const ORG_STORAGE_KEY = "itemize.activeOrg";
const ORGANIZATIONS = [
  { id: "acme", name: "Acme Corp", plan: "Enterprise" },
  { id: "northwind", name: "Northwind Trading", plan: "Business" },
  { id: "globex", name: "Globex Industries", plan: "Business" },
  { id: "initech", name: "Initech LLC", plan: "Starter" },
];

function OrgSwitcher() {
  const [open, setOpen] = useState(false);
  const [orgId, setOrgId] = useState<string>(() => {
    if (typeof window === "undefined") return "acme";
    return window.localStorage.getItem(ORG_STORAGE_KEY) || "acme";
  });
  const current = ORGANIZATIONS.find((o) => o.id === orgId) ?? ORGANIZATIONS[0];

  const select = (id: string) => {
    setOrgId(id);
    window.localStorage.setItem(ORG_STORAGE_KEY, id);
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button className="w-full flex items-center justify-between px-3 py-[7px] rounded-lg border border-border/70 hover:bg-secondary/60 transition-colors text-sm">
          <div className="flex items-center gap-2 min-w-0">
            <div className="h-5 w-5 rounded bg-primary/10 text-primary flex items-center justify-center text-[10px] font-semibold shrink-0">
              {current.name.slice(0, 1)}
            </div>
            <span className="font-medium text-foreground truncate">{current.name}</span>
          </div>
          <ChevronsUpDown className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
        </button>
      </PopoverTrigger>
      <PopoverContent align="start" sideOffset={6} className="w-[240px] p-1.5">
        <div className="px-2 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/70">
          Organizations
        </div>
        <div className="max-h-72 overflow-y-auto">
          {ORGANIZATIONS.map((o) => (
            <button
              key={o.id}
              onClick={() => select(o.id)}
              className="w-full flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-secondary text-left"
            >
              <div className="h-6 w-6 rounded bg-primary/10 text-primary flex items-center justify-center text-[11px] font-semibold shrink-0">
                {o.name.slice(0, 1)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-foreground truncate">{o.name}</div>
                <div className="text-[11px] text-muted-foreground">{o.plan}</div>
              </div>
              {o.id === orgId && <Check className="h-3.5 w-3.5 text-primary shrink-0" />}
            </button>
          ))}
        </div>
        <div className="border-t border-border my-1" />
        <button className="w-full flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-secondary text-left text-sm text-foreground/80">
          <Plus className="h-3.5 w-3.5" /> Create organization
        </button>
        <button className="w-full flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-secondary text-left text-sm text-foreground/80">
          <SettingsIcon className="h-3.5 w-3.5" /> Organization settings
        </button>
      </PopoverContent>
    </Popover>
  );
}

interface NavItem {
  name: string;
  icon: LucideIcon;
  count?: number;
  active?: boolean;
  href?: string;
}

interface NavGroup {
  label: string;
  collapsible?: boolean;
  defaultOpen?: boolean;
  items: NavItem[];
}

const apNavigation: NavGroup[] = [
  {
    label: "Frequently Used",
    collapsible: true,
    defaultOpen: true,
    items: [
      { name: "Pending Review", icon: Clock, count: 12, href: "/pending-review" },
      { name: "My Tasks", icon: CheckCircle, count: 4, href: "/my-tasks" },
      { name: "Documents", icon: FileText, href: "/documents" },
      { name: "Analytics", icon: BarChart3, href: "/analytics" },
    ],
  },
  {
    label: "Overview",
    items: [
      { name: "Dashboard", icon: LayoutDashboard, href: "/" },
      { name: "AP Inbox", icon: Inbox, count: 45 },
    ],
  },
  {
    label: "Action Items",
    collapsible: true,
    defaultOpen: true,
    items: [
      { name: "My Tasks", icon: CheckCircle, count: 4, href: "/my-tasks" },
      { name: "Pending Review", icon: Clock, count: 12, href: "/pending-review" },
      { name: "Returned", icon: AlertCircle, count: 2, href: "/returned" },
      { name: "Exception Review", icon: ShieldAlert, count: 7, href: "/exception-review" },
    ],
  },
  {
    label: "Documents",
    collapsible: true,
    defaultOpen: true,
    items: [
      { name: "Documents", icon: FileText, href: "/documents" },
      { name: "Portal Connections", icon: Globe, href: "/portal-connections" },
      { name: "PO Matching", icon: Link2, count: 7, href: "/po-matching" },
      { name: "Email Integration", icon: Mail },
      { name: "Document Bundles", icon: Package },
    ],
  },
  {
    label: "Analytics",
    collapsible: true,
    defaultOpen: true,
    items: [
      { name: "Analytics", icon: BarChart3, href: "/analytics" },
      { name: "Reports", icon: FileBarChart },
      { name: "Spend Analytics", icon: TrendingUp },
    ],
  },
  {
    label: "Payments",
    collapsible: true,
    defaultOpen: true,
    items: [
      { name: "Payments", icon: CreditCard, href: "/payments" },
      { name: "Spend Management", icon: PieChart },
      { name: "Bank Connections", icon: Landmark },
    ],
  },
  {
    label: "Workflows",
    collapsible: true,
    defaultOpen: true,
    items: [
      { name: "Workflows", icon: GitMerge, href: "/workflows" },
    ],
  },
  {
    label: "Vendors",
    collapsible: true,
    defaultOpen: true,
    items: [
      { name: "Vendor Management", icon: Users, href: "/vendors" },
    ],
  },
];

const cashNavigation: NavGroup[] = [
  {
    label: "Overview",
    items: [
      { name: "Dashboard", icon: LayoutDashboard, href: "/cash" },
    ],
  },
  {
    label: "Receivables",
    collapsible: true,
    defaultOpen: true,
    items: [
      { name: "Payments Inbox", icon: Inbox, count: 38, href: "/cash/payments" },
      { name: "Open AR", icon: FileSpreadsheet, count: 124, href: "/cash/open-ar" },
      { name: "Remittance Portal", icon: Mail },
    ],
  },
  {
    label: "Reconciliation",
    collapsible: true,
    defaultOpen: true,
    items: [
      { name: "Matching Queue", icon: Link2, count: 27, href: "/cash/matching" },
      { name: "Exceptions", icon: ShieldAlert, count: 9, href: "/cash/exceptions" },
      { name: "Unapplied Cash", icon: Wallet, count: 6 },
    ],
  },
  {
    label: "Posting",
    collapsible: true,
    defaultOpen: true,
    items: [
      { name: "Posting Files", icon: ScrollText, href: "/cash/posting" },
      { name: "GL Activity", icon: Activity },
    ],
  },
  {
    label: "Analytics",
    collapsible: true,
    defaultOpen: true,
    items: [
      { name: "Cash Analytics", icon: BarChart3, href: "/cash/analytics" },
      { name: "AR Aging", icon: TrendingUp },
      { name: "Payer Trends", icon: Users },
    ],
  },
  {
    label: "Workflows",
    collapsible: true,
    defaultOpen: true,
    items: [
      { name: "Workflows", icon: GitMerge, href: "/workflows" },
    ],
  },
];

const PRODUCTS: { id: Product; name: string; description: string; icon: LucideIcon; short: string }[] = [
  { id: "ap", name: "Accounts Payable", description: "Bills, approvals & payments", icon: FileText, short: "AP" },
  { id: "cash", name: "Cash Application", description: "Receivables & reconciliation", icon: Banknote, short: "AR" },
];

function ProductSwitcher({ collapsed }: { collapsed: boolean }) {
  const { product, setProduct } = useProduct();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const current = PRODUCTS.find((p) => p.id === product) ?? PRODUCTS[0];

  const handleSwitch = (next: Product) => {
    setProduct(next);
    setOpen(false);
    navigate(next === "cash" ? "/cash" : "/");
  };

  if (collapsed) {
    return (
      <div className="flex justify-center px-2 py-2 border-b border-border/60">
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Tooltip delayDuration={0}>
              <TooltipTrigger asChild>
                <button className="h-8 w-8 rounded-md bg-primary text-primary-foreground text-[10px] font-bold transition-colors hover:opacity-90 flex items-center justify-center">
                  {current.short}
                </button>
              </TooltipTrigger>
              <TooltipContent side="right" sideOffset={8}>
                <p>{current.name}</p>
              </TooltipContent>
            </Tooltip>
          </PopoverTrigger>
          <PopoverContent side="right" align="start" sideOffset={8} className="w-[240px] p-1.5">
            <ProductMenu current={product} onSelect={handleSwitch} />
          </PopoverContent>
        </Popover>
      </div>
    );
  }

  return (
    <div className="px-3 py-2.5 border-b border-border/60 shrink-0">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <button className="w-full flex items-center justify-between px-3 py-[7px] rounded-lg border border-border/70 hover:bg-secondary/60 transition-colors text-sm">
            <div className="flex items-center gap-2 min-w-0">
              <div className="h-5 w-5 rounded bg-primary/10 text-primary flex items-center justify-center shrink-0">
                <current.icon className="h-3 w-3" />
              </div>
              <span className="font-medium text-foreground truncate">{current.name}</span>
            </div>
            <ChevronsUpDown className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
          </button>
        </PopoverTrigger>
        <PopoverContent align="start" sideOffset={6} className="w-[240px] p-1.5">
          <ProductMenu current={product} onSelect={handleSwitch} />
        </PopoverContent>
      </Popover>
    </div>
  );
}

function ProductMenu({ current, onSelect }: { current: Product; onSelect: (p: Product) => void }) {
  return (
    <>
      <div className="px-2 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/70">
        Products
      </div>
      {PRODUCTS.map((p) => (
        <button
          key={p.id}
          onClick={() => onSelect(p.id)}
          className="w-full flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-secondary text-left"
        >
          <div className="h-6 w-6 rounded bg-primary/10 text-primary flex items-center justify-center shrink-0">
            <p.icon className="h-3.5 w-3.5" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-medium text-foreground truncate">{p.name}</div>
            <div className="text-[11px] text-muted-foreground truncate">{p.description}</div>
          </div>
          {p.id === current && <Check className="h-3.5 w-3.5 text-primary shrink-0" />}
        </button>
      ))}
    </>
  );
}

function NavGroupSection({ group, activePage, collapsed }: { group: NavGroup; activePage?: string; collapsed: boolean }) {
  const [open, setOpen] = useState(group.defaultOpen ?? true);

  if (collapsed) {
    return (
      <div className="mb-1 flex flex-col items-center gap-0.5 px-1">
        {group.items.map((item) => {
          const isActive = activePage === item.name;
          return (
            <Tooltip key={item.name} delayDuration={0}>
              <TooltipTrigger asChild>
                <a
                  href={item.href || "#"}
                  className={`relative flex h-9 w-9 items-center justify-center rounded-lg transition-colors ${
                    isActive ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-secondary/80 hover:text-foreground"
                  }`}
                >
                  <item.icon className="h-[16px] w-[16px]" />
                  {item.count !== undefined && (
                    <span className="absolute -top-0.5 -right-0.5 h-4 min-w-[16px] rounded-full bg-primary text-[9px] font-bold text-primary-foreground flex items-center justify-center px-1">
                      {item.count}
                    </span>
                  )}
                </a>
              </TooltipTrigger>
              <TooltipContent side="right" sideOffset={8}>
                <p>{item.name}{item.count !== undefined ? ` (${item.count})` : ""}</p>
              </TooltipContent>
            </Tooltip>
          );
        })}
      </div>
    );
  }

  return (
    <div className="mb-0.5">
      <button
        onClick={() => group.collapsible && setOpen(!open)}
        className="nav-section-label flex w-full items-center justify-between group"
      >
        <span>{group.label}</span>
        {group.collapsible && (
          <ChevronDown
            className={`h-3 w-3 text-muted-foreground/50 transition-transform duration-200 group-hover:text-muted-foreground ${
              open ? "" : "-rotate-90"
            }`}
          />
        )}
      </button>
      {open && (
        <div className="space-y-[1px] px-2">
          {group.items.map((item) => {
            const isActive = activePage === item.name;
            return (
              <a
                key={item.name}
                href={item.href || "#"}
                className={`nav-item ${isActive ? "nav-item-active" : ""}`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <item.icon className={`h-[15px] w-[15px] shrink-0 ${isActive ? "text-primary" : "text-muted-foreground"}`} />
                  <span className="truncate">{item.name}</span>
                </div>
                {item.count !== undefined && (
                  <span className="tabular-nums text-[11px] font-medium text-muted-foreground/80 bg-secondary rounded-full px-2 py-0.5 min-w-[22px] text-center">
                    {item.count}
                  </span>
                )}
              </a>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default function AppSidebar({ activePage }: { activePage?: string }) {
  const { collapsed, toggle } = useSidebarState();
  const { product } = useProduct();
  const navigation = product === "cash" ? cashNavigation : apNavigation;

  return (
    <aside
      className={`shrink-0 h-screen bg-sidebar overflow-hidden flex flex-col border-r border-border/60 transition-all duration-200 ${
        collapsed ? "w-[56px]" : "w-[var(--sidebar-width)]"
      }`}
    >
      {/* Logo bar */}
      <div className="nav-dark-bar px-3 h-14 flex items-center gap-3 shrink-0 justify-between">
        {!collapsed && <img src={itemizeLogo} alt="Itemize" className="h-6" />}
        <button
          onClick={toggle}
          className="h-8 w-8 rounded-lg flex items-center justify-center hover:bg-white/10 transition-colors shrink-0"
        >
          {collapsed ? (
            <PanelLeft className="h-4 w-4 text-white/70" />
          ) : (
            <PanelLeftClose className="h-4 w-4 text-white/70" />
          )}
        </button>
      </div>

      <ProductSwitcher collapsed={collapsed} />


      {!collapsed && (
        <div className="px-3 py-2.5 border-b border-border/60 shrink-0">
          <OrgSwitcher />
        </div>
      )}

      <div className={`flex-1 overflow-y-auto scrollbar-thin ${collapsed ? "py-3" : "py-2"}`}>
        {navigation.map((group) => (
          <NavGroupSection key={group.label} group={group} activePage={activePage} collapsed={collapsed} />
        ))}
      </div>

      {!collapsed ? (
        <div className="px-3 py-2 shrink-0 border-t border-border/60">
          <a
            href="/style-guide"
            className={`nav-item ${activePage === "Style Guide" ? "nav-item-active" : ""}`}
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <Palette className={`h-[15px] w-[15px] shrink-0 ${activePage === "Style Guide" ? "text-primary" : "text-muted-foreground"}`} />
              <span className="truncate">Style Guide</span>
            </div>
          </a>
        </div>
      ) : (
        <div className="flex justify-center py-2 shrink-0 border-t border-border/60">
          <Tooltip delayDuration={0}>
            <TooltipTrigger asChild>
              <a href="/style-guide" className={`flex h-9 w-9 items-center justify-center rounded-lg ${activePage === "Style Guide" ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-secondary/80 hover:text-foreground"}`}>
                <Palette className="h-[16px] w-[16px]" />
              </a>
            </TooltipTrigger>
            <TooltipContent side="right" sideOffset={8}><p>Style Guide</p></TooltipContent>
          </Tooltip>
        </div>
      )}
    </aside>

  );
}
