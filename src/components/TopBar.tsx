import {
  Upload, Bell, HelpCircle, User, Search, ChevronDown,
  Settings, Plug, BookOpen, Users2, LogOut, Moon, Sun,
} from "lucide-react";
import { useState, useEffect, useRef } from "react";
import UploadSheet from "./UploadSheet";
import { useTheme } from "@/hooks/use-theme";

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
    if (open) { setQuery(""); setTimeout(() => inputRef.current?.focus(), 50); }
  }, [open]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") { e.preventDefault(); if (open) onClose(); }
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
                {item.submenu.map((sub) => <button key={sub} className="w-full pl-11 pr-4 py-1.5 text-[13px] text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors text-left">{sub}</button>)}
              </div>
            )}
          </div>
        ))}
      </div>
      <div className="border-t border-border py-1.5">
        <button className="w-full px-4 py-2 text-sm text-destructive hover:bg-destructive/5 flex items-center gap-3 transition-colors"><LogOut className="h-4 w-4" /><span>Sign Out</span></button>
      </div>
    </div>
  );
}

export default function TopBar() {
  const [cmdOpen, setCmdOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [uploadOpen, setUploadOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") { e.preventDefault(); setCmdOpen((v) => !v); }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  return (
    <>
      <header className="nav-dark-bar h-14 flex items-center justify-between px-6 shrink-0">
        <button onClick={() => setCmdOpen(true)} className="flex items-center gap-2.5 px-3 py-1.5 rounded-lg border border-white/15 hover:border-white/25 bg-white/10 hover:bg-white/15 transition-all text-sm text-white/60 w-72">
          <Search className="h-3.5 w-3.5" />
          <span className="flex-1 text-left">Search...</span>
          <kbd className="text-[11px] font-medium bg-white/10 border border-white/15 rounded px-1.5 py-0.5 text-white/50">⌘K</kbd>
        </button>
        <div className="flex items-center gap-1.5">
          <button onClick={() => setUploadOpen(true)} className="flex items-center gap-2 text-sm font-medium bg-white text-[hsl(220,50%,14%)] rounded-lg px-3.5 py-2 hover:bg-white/90 transition-all shadow-sm">
            <Upload className="h-3.5 w-3.5" />Upload
          </button>
          <button onClick={toggleTheme} className="h-9 w-9 rounded-lg flex items-center justify-center hover:bg-white/10 transition-colors" title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}>
            {theme === "dark" ? <Sun className="h-[18px] w-[18px] text-white/60" /> : <Moon className="h-[18px] w-[18px] text-white/60" />}
          </button>
          <button className="h-9 w-9 rounded-lg flex items-center justify-center hover:bg-white/10 transition-colors"><HelpCircle className="h-[18px] w-[18px] text-white/60" /></button>
          <button className="h-9 w-9 rounded-lg flex items-center justify-center hover:bg-white/10 transition-colors relative">
            <Bell className="h-[18px] w-[18px] text-white/60" />
            <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-primary" />
          </button>
          <div className="relative ml-1">
            <button onClick={() => setProfileOpen(!profileOpen)} className="flex items-center gap-2.5 rounded-lg px-2 py-1 hover:bg-white/10 transition-colors">
              <div className="h-8 w-8 rounded-full bg-gradient-to-br from-white/30 to-white/20 flex items-center justify-center"><span className="text-xs font-semibold text-white">JD</span></div>
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
      <UploadSheet open={uploadOpen} onOpenChange={setUploadOpen} />
    </>
  );
}
