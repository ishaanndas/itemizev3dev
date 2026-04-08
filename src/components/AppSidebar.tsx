import itemizeLogo from "@/assets/itemize-logo.png";
import {
  CheckCircle,
  Clock,
  AlertCircle,
  Inbox,
  LayoutDashboard,
  FileText,
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
  type LucideIcon,
} from "lucide-react";
import { useState } from "react";
import { useSidebarState } from "@/contexts/SidebarContext";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

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

const navigation: NavGroup[] = [
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
      { name: "My Tasks", icon: CheckCircle, count: 4 },
      { name: "Pending Review", icon: Clock, count: 12, href: "/pending-review" },
      { name: "Returned", icon: AlertCircle, count: 2 },
    ],
  },
  {
    label: "Documents",
    collapsible: true,
    defaultOpen: true,
    items: [
      { name: "Documents", icon: FileText, href: "/documents" },
      { name: "PO Matching", icon: Link2 },
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
      { name: "Pay Documents", icon: CreditCard },
      { name: "Transactions", icon: ArrowRightLeft },
      { name: "Payment Activity", icon: Activity },
      { name: "Spend Management", icon: PieChart },
      { name: "Bank Connections", icon: Landmark },
    ],
  },
  {
    label: "Approvals",
    collapsible: true,
    defaultOpen: true,
    items: [
      { name: "Approval Policies", icon: GitMerge, href: "/workflows" },
    ],
  },
  {
    label: "Vendors",
    collapsible: true,
    defaultOpen: true,
    items: [
      { name: "Vendor Management", icon: Users },
      { name: "Vendor Analytics", icon: BarChart3 },
      { name: "Merge Vendors", icon: GitMerge },
    ],
  },
];

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

      {!collapsed && (
        <div className="px-3 py-2.5 border-b border-border/60 shrink-0">
          <button className="w-full flex items-center justify-between px-3 py-[7px] rounded-lg border border-border/70 hover:bg-secondary/60 transition-colors text-sm">
            <span className="font-medium text-foreground">Acme Corp</span>
            <ChevronsUpDown className="h-3.5 w-3.5 text-muted-foreground" />
          </button>
        </div>
      )}

      <div className={`flex-1 overflow-y-auto scrollbar-thin ${collapsed ? "py-3" : "py-2"}`}>
        {navigation.map((group) => (
          <NavGroupSection key={group.label} group={group} activePage={activePage} collapsed={collapsed} />
        ))}
      </div>
    </aside>
  );
}
