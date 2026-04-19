import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, ShieldCheck, MoreHorizontal, Users, Clock, Pencil, Trash2, Copy, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

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

export default function WorkflowListContent() {
  const navigate = useNavigate();
  const [workflows] = useState<Workflow[]>(sampleWorkflows);
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    if (!search.trim()) return workflows;
    const q = search.toLowerCase();
    return workflows.filter(
      (wf) => wf.name.toLowerCase().includes(q) || wf.description.toLowerCase().includes(q)
    );
  }, [workflows, search]);

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="max-w-5xl mx-auto px-8 py-8">
        <div className="flex items-center justify-between mb-8">
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

        <div className="relative mb-5">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search workflows..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>

        {filtered.length === 0 ? (
          <div className="border border-dashed border-border rounded-xl py-20 flex flex-col items-center justify-center text-center">
            <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center mb-4">
              <ShieldCheck className="h-6 w-6 text-muted-foreground" />
            </div>
            <h3 className="text-base font-semibold text-foreground mb-1">No workflows yet</h3>
            <p className="text-sm text-muted-foreground mb-5">Create a workflow to define how documents are processed</p>
            <button
              onClick={() => navigate("/workflows/new")}
              className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2.5 rounded-lg text-sm font-semibold hover:bg-primary/90 transition-colors"
            >
              <Plus className="h-4 w-4" />
              New Workflow
            </button>
          </div>
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
