import {
  FileText, Upload, RefreshCw,
  Activity, Clock,
  CheckCircle, Flag, ArrowDown, ArrowUp, UserCircle, Users2,
  ChevronRight,
} from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import TopBar from "./TopBar";
import PendingReviewTable from "./PendingReviewTable";

type DashboardTab = "Overview";

// ── Row 1: Action Required Cards ──
const actionCards = [
  {
    label: "Awaiting My Approval",
    value: "7",
    subtitle: "Oldest: 4 days",
    accent: "border-l-primary",
    hoverAccent: "hover:border-l-primary",
  },
  {
    label: "Overdue Invoices",
    value: "5",
    subtitle: "$42,380.00 total",
    accent: "border-l-destructive",
    hoverAccent: "hover:border-l-destructive",
  },
  {
    label: "My Tasks Due This Week",
    value: "12",
    subtitle: "3 urgent · $87,215.50 total",
    accent: "border-l-amber-500",
    hoverAccent: "hover:border-l-amber-500",
  },
  {
    label: "Exceptions & Flags",
    value: "4",
    subtitle: "3 duplicates · 1 mismatch",
    accent: "border-l-yellow-500",
    hoverAccent: "hover:border-l-yellow-500",
  },
];

// ── Row 2: Workflow Health ──
const bottlenecks = [
  { name: "Sarah Chen", invoices: 8, avgDays: 3.2 },
  { name: "Mike Torres", invoices: 5, avgDays: 1.8 },
  { name: "Jen Park", invoices: 3, avgDays: 0.5 },
];

// ── Row 3: Activity Feed ──
const activityFeed = [
  { user: "Sarah Chen", initials: "SC", action: 'approved Invoice #4021 from Acme Corp', time: "12 min ago", status: "Approved", statusColor: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  { user: "System", initials: "SY", action: 'auto-matched PO #8830 to Invoice #4019 from TechPro Inc', time: "28 min ago", status: "Matched", statusColor: "bg-blue-50 text-blue-700 border-blue-200" },
  { user: "Mike Torres", initials: "MT", action: 'uploaded 3 invoices from Global Supplies Co', time: "1 hr ago", status: "Uploaded", statusColor: "bg-violet-50 text-violet-700 border-violet-200" },
  { user: "System", initials: "SY", action: 'flagged Invoice #4015 — potential duplicate of #3998', time: "1.5 hrs ago", status: "Flagged", statusColor: "bg-amber-50 text-amber-700 border-amber-200" },
  { user: "Jen Park", initials: "JP", action: 'scheduled payment of $12,400 to Office Depot', time: "2 hrs ago", status: "Scheduled", statusColor: "bg-sky-50 text-sky-700 border-sky-200" },
  { user: "David Kim", initials: "DK", action: 'approved Invoice #4018 from CloudHost Co', time: "3 hrs ago", status: "Approved", statusColor: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  { user: "System", initials: "SY", action: 'detected anomaly on Invoice #4012 — amount exceeds PO by 22%', time: "4 hrs ago", status: "Flagged", statusColor: "bg-amber-50 text-amber-700 border-amber-200" },
  { user: "Lisa Wang", initials: "LW", action: 'uploaded Invoice #4022 from Meridian Services', time: "5 hrs ago", status: "Uploaded", statusColor: "bg-violet-50 text-violet-700 border-violet-200" },
];


export default function DashboardContent() {
  const [activeTab, setActiveTab] = useState<DashboardTab>("Overview");

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-background">
      <TopBar />

      {/* Page content */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-6xl mx-auto px-6 py-8">
          {/* Page header */}
          <div className="flex items-start justify-between mb-8">
            <div>
              <h1 className="text-2xl font-bold text-foreground tracking-tight">Accounts Payable</h1>
              <p className="text-sm text-muted-foreground mt-1">
                Manage invoices, purchase orders, receipts, and vendors
              </p>
            </div>
            <button className="flex items-center gap-2 text-sm font-medium border border-border rounded-lg px-3.5 py-2 hover:bg-secondary transition-colors text-foreground">
              <RefreshCw className="h-3.5 w-3.5" />
              Refresh
            </button>
          </div>


          {activeTab === "Overview" && (
            <>
              {/* Row 1: Action Required Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                {actionCards.map((card) => (
                  <button
                    key={card.label}
                    className={`stat-card border-l-4 ${card.accent} text-left transition-all hover:shadow-md group`}
                  >
                    <div className="text-xs font-medium text-muted-foreground mb-2">{card.label}</div>
                    <div className="text-3xl font-bold tabular-nums text-foreground mb-1">{card.value}</div>
                    <div className="text-[12px] text-muted-foreground">{card.subtitle}</div>
                  </button>
                ))}
              </div>

              {/* Row 2: Workflow Health */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
                {/* Approval Bottlenecks */}
                <div className="stat-card">
                  <h3 className="text-sm font-semibold text-foreground mb-4">Approval Bottlenecks</h3>
                  <div className="space-y-3">
                    {bottlenecks.map((person, i) => (
                      <div key={person.name} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-semibold text-primary">
                            {person.name.split(" ").map(n => n[0]).join("")}
                          </div>
                          <div>
                            <div className="text-sm font-medium text-foreground">{person.name}</div>
                            <div className="text-[11px] text-muted-foreground">{person.invoices} invoices · avg {person.avgDays} days</div>
                          </div>
                        </div>
                        {i === 0 && <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-destructive/10 text-destructive">Slow</span>}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Processing Time */}
                <div className="stat-card flex flex-col justify-between">
                  <h3 className="text-sm font-semibold text-foreground mb-4">Processing Time</h3>
                  <div>
                    <div className="flex items-end gap-2 mb-1">
                      <span className="text-4xl font-bold tabular-nums text-foreground">2.4</span>
                      <span className="text-sm text-muted-foreground mb-1">days</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-sm text-emerald-600">
                      <ArrowDown className="h-3.5 w-3.5" />
                      <span>0.3 days vs last month</span>
                    </div>
                  </div>
                  {/* Mini bar chart */}
                  <div className="flex items-end gap-1.5 mt-4 h-12">
                    {[3.1, 2.9, 2.7, 2.4].map((val, i) => (
                      <div key={i} className="flex-1 flex flex-col items-center gap-1">
                        <div
                          className={`w-full rounded-sm ${i === 3 ? "bg-primary" : "bg-primary/20"}`}
                          style={{ height: `${(val / 3.5) * 100}%` }}
                        />
                        <span className="text-[10px] text-muted-foreground">W{i + 1}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* STP Rate */}
                <div className="stat-card flex flex-col justify-between">
                  <h3 className="text-sm font-semibold text-foreground mb-4">Straight-Through Processing</h3>
                  <div className="flex items-center justify-center flex-1">
                    <div className="relative h-28 w-28">
                      <svg className="h-28 w-28 -rotate-90" viewBox="0 0 100 100">
                        <circle cx="50" cy="50" r="40" fill="none" stroke="hsl(var(--border))" strokeWidth="8" />
                        <circle cx="50" cy="50" r="40" fill="none" stroke="hsl(var(--primary))" strokeWidth="8"
                          strokeDasharray={`${34 * 2.51} ${100 * 2.51}`} strokeLinecap="round" />
                      </svg>
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-2xl font-bold tabular-nums text-foreground">34%</span>
                      </div>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground text-center mt-2">of invoices required no manual review</p>
                </div>
              </div>

              {/* Pending Review Table */}
              <PendingReviewTable viewAllHref="/pending-review" compact />
            </>
          )}
        </div>
      </div>
    </div>
  );
}
