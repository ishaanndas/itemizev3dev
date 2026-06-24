import { useCallback, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, ShieldCheck, MoreHorizontal, Users, Clock, Pencil, Trash2, Copy, Search, LayoutGrid, Table as TableIcon } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { DataTable, type DataTableColumn } from "@/components/data-table/DataTable";
import RowActions from "@/components/data-table/RowActions";

interface Workflow {
  id: string;
  name: string;
  description: string;
  status: "active" | "draft" | "inactive";
  approvers: number;
  lastModified: string;
}

const sampleWorkflows: Workflow[] = [
  {
    id: "wf-1",
    name: "Standard Approval",
    description: "Route documents to department manager for approval",
    status: "active",
    approvers: 2,
    lastModified: "2 hours ago",
  },
  {
    id: "wf-2",
    name: "Auto-Approve Under $500",
    description: "Automatically approve invoices under $500",
    status: "active",
    approvers: 0,
    lastModified: "1 day ago",
  },
  {
    id: "wf-3",
    name: "High Value Review",
    description: "Multi-level approval for invoices over $10,000",
    status: "draft",
    approvers: 3,
    lastModified: "3 days ago",
  },
  {
    id: "wf-4",
    name: "New Vendor Review",
    description: "Extra review step for documents from new vendors",
    status: "inactive",
    approvers: 2,
    lastModified: "1 week ago",
  },
];

const statusStyles: Record<string, string> = {
  active: "bg-emerald-500/10 text-emerald-600 border-emerald-200",
  draft: "bg-amber-500/10 text-amber-600 border-amber-200",
  inactive: "bg-muted text-muted-foreground border-border",
};

type StatusFilter = "all" | "active" | "draft" | "inactive";
type ViewMode = "cards" | "table";

export default function WorkflowListContent() {
  const navigate = useNavigate();
  const [workflows] = useState<Workflow[]>(sampleWorkflows);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [viewMode, setViewMode] = useState<ViewMode>("table");
  const [selectedRows, setSelectedRows] = useState<Set<number>>(new Set());
  const toggleRow = useCallback((i: number) => {
    setSelectedRows((prev) => {
      const next = new Set(prev);
      next.has(i) ? next.delete(i) : next.add(i);
      return next;
    });
  }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return workflows.filter((wf) => {
      if (statusFilter !== "all" && wf.status !== statusFilter) return false;
      if (!q) return true;
      return wf.name.toLowerCase().includes(q) || wf.description.toLowerCase().includes(q);
    });
  }, [workflows, search, statusFilter]);

  const statusCounts = useMemo(
    () => ({
      all: workflows.length,
      active: workflows.filter((w) => w.status === "active").length,
      draft: workflows.filter((w) => w.status === "draft").length,
      inactive: workflows.filter((w) => w.status === "inactive").length,
    }),
    [workflows]
  );

  const statusPills: { value: StatusFilter; label: string }[] = [
    { value: "all", label: "All" },
    { value: "active", label: "Active" },
    { value: "draft", label: "Draft" },
    { value: "inactive", label: "Inactive" },
  ];

  const columns: DataTableColumn<Workflow>[] = [
    {
      key: "name",
      label: "Name",
      width: 280,
      render: (wf) => (
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="h-7 w-7 rounded-md bg-primary/5 border border-primary/10 flex items-center justify-center shrink-0">
            <ShieldCheck className="h-3.5 w-3.5 text-primary" />
          </div>
          <span className="text-sm font-medium text-foreground truncate">{wf.name}</span>
        </div>
      ),
      accessor: (wf) => wf.name,
    },
    {
      key: "description",
      label: "Description",
      width: 360,
      render: (wf) => <span className="text-xs text-muted-foreground truncate">{wf.description}</span>,
      accessor: (wf) => wf.description,
    },
    {
      key: "status",
      label: "Status",
      width: 110,
      render: (wf) => (
        <Badge variant="outline" className={`text-[10px] font-medium ${statusStyles[wf.status]}`}>
          {wf.status}
        </Badge>
      ),
      accessor: (wf) => wf.status,
    },
    {
      key: "approvers",
      label: "Approvers",
      width: 110,
      render: (wf) => (
        <span className="text-xs text-foreground flex items-center gap-1">
          <Users className="h-3 w-3 text-muted-foreground" />
          {wf.approvers}
        </span>
      ),
      accessor: (wf) => String(wf.approvers),
    },
    {
      key: "lastModified",
      label: "Last Modified",
      width: 160,
      render: (wf) => (
        <span className="text-xs text-muted-foreground flex items-center gap-1">
          <Clock className="h-3 w-3" />
          {wf.lastModified}
        </span>
      ),
      accessor: (wf) => wf.lastModified,
    },
  ];

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="max-w-6xl mx-auto px-8 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Workflows</h1>
            <p className="text-sm text-muted-foreground mt-1">Define how documents are routed, reviewed, and processed</p>
          </div>
          <button
            onClick={() => navigate("/workflows/new")}
            className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2.5 rounded-lg text-sm font-semibold hover:bg-primary/90 transition-colors"
          >
            <Plus className="h-4 w-4" />
            New Workflow
          </button>
        </div>

        {/* Filters bar */}
        <div className="flex items-center justify-between gap-3 mb-4 flex-wrap">
          <div className="flex items-center gap-2 flex-wrap">
            {statusPills.map((pill) => {
              const active = statusFilter === pill.value;
              return (
                <button
                  key={pill.value}
                  onClick={() => setStatusFilter(pill.value)}
                  className={`text-sm font-medium px-3 py-1.5 rounded-lg border transition-colors ${
                    active
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-card text-muted-foreground border-border hover:text-foreground hover:bg-secondary"
                  }`}
                >
                  {pill.label}
                  <span className={`ml-1.5 text-xs ${active ? "opacity-80" : "opacity-60"}`}>
                    {statusCounts[pill.value]}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="flex items-center gap-2">
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search workflows..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 h-9"
              />
            </div>
            <div className="flex items-center rounded-lg border border-border overflow-hidden">
              <button
                onClick={() => setViewMode("table")}
                className={`flex items-center gap-1.5 text-xs font-medium px-2.5 py-2 transition-colors ${viewMode === "table" ? "bg-primary text-primary-foreground" : "bg-card text-muted-foreground hover:text-foreground"}`}
                title="Table view"
              >
                <TableIcon className="h-3.5 w-3.5" />
              </button>
              <button
                onClick={() => setViewMode("cards")}
                className={`flex items-center gap-1.5 text-xs font-medium px-2.5 py-2 transition-colors ${viewMode === "cards" ? "bg-primary text-primary-foreground" : "bg-card text-muted-foreground hover:text-foreground"}`}
                title="Card view"
              >
                <LayoutGrid className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="border border-dashed border-border rounded-xl py-20 flex flex-col items-center justify-center text-center">
            <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center mb-4">
              <ShieldCheck className="h-6 w-6 text-muted-foreground" />
            </div>
            <h3 className="text-base font-semibold text-foreground mb-1">No workflows found</h3>
            <p className="text-sm text-muted-foreground mb-5">Try adjusting your filters or create a new workflow</p>
            <button
              onClick={() => navigate("/workflows/new")}
              className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2.5 rounded-lg text-sm font-semibold hover:bg-primary/90 transition-colors"
            >
              <Plus className="h-4 w-4" />
              New Workflow
            </button>
          </div>
        ) : viewMode === "table" ? (
          <DataTable
            storageKey="workflows-list"
            columns={columns}
            data={filtered}
            rowKey={(wf) => wf.id}
            selectable
            selectedRows={selectedRows}
            onToggleRow={toggleRow}
            onToggleAll={() =>
              setSelectedRows((prev) =>
                prev.size === filtered.length ? new Set() : new Set(filtered.map((_, i) => i)),
              )
            }
            toolbarLeft={
              selectedRows.size > 0 ? (
                <div className="flex items-center gap-2">
                  <button className="text-xs font-medium px-3 py-1.5 rounded-lg border border-border hover:bg-secondary text-foreground">
                    Activate
                  </button>
                  <button className="text-xs font-medium px-3 py-1.5 rounded-lg border border-border hover:bg-secondary text-foreground">
                    Duplicate
                  </button>
                  <button className="text-xs font-medium px-3 py-1.5 rounded-lg border border-border hover:bg-secondary text-destructive">
                    Delete {selectedRows.size}
                  </button>
                </div>
              ) : null
            }
            onRowClick={(wf) => navigate(`/workflows/${wf.id}`)}
            renderRowActions={(wf) => (
              <RowActions
                primary={{
                  label: "Edit",
                  icon: <Pencil className="h-3.5 w-3.5" />,
                  onClick: () => navigate(`/workflows/${wf.id}`),
                }}
              />
            )}
          />
        ) : (
          <div className="space-y-3">
            {filtered.map((wf) => (
              <div
                key={wf.id}
                onClick={() => navigate(`/workflows/${wf.id}`)}
                className="group border border-border rounded-xl p-5 bg-card hover:border-primary/30 hover:shadow-sm transition-all cursor-pointer"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3.5 min-w-0">
                    <div className="h-10 w-10 rounded-lg bg-primary/5 border border-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                      <ShieldCheck className="h-5 w-5 text-primary" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2.5 mb-1">
                        <span className="text-sm font-semibold text-foreground">{wf.name}</span>
                        <Badge variant="outline" className={`text-[10px] font-medium ${statusStyles[wf.status]}`}>
                          {wf.status}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mb-3">{wf.description}</p>
                      <div className="flex items-center gap-4 text-[11px] text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Users className="h-3 w-3" />
                          {wf.approvers} approver{wf.approvers !== 1 ? "s" : ""}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          Modified {wf.lastModified}
                        </span>
                      </div>
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button
                        onClick={(e) => e.stopPropagation()}
                        className="h-8 w-8 rounded-md flex items-center justify-center opacity-0 group-hover:opacity-100 hover:bg-secondary transition-all"
                      >
                        <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-40">
                      <DropdownMenuItem onClick={(e) => { e.stopPropagation(); navigate(`/workflows/${wf.id}`); }}>
                        <Pencil className="h-3.5 w-3.5 mr-2" />Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={(e) => e.stopPropagation()}>
                        <Copy className="h-3.5 w-3.5 mr-2" />Duplicate
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={(e) => e.stopPropagation()} className="text-destructive">
                        <Trash2 className="h-3.5 w-3.5 mr-2" />Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
