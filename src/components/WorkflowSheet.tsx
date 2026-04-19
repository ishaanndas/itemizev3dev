import { useState } from "react";
import {
  Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription,
} from "@/components/ui/sheet";
import {
  GitBranch, CheckCircle2, Clock, Users, ArrowRight, Zap, ShieldCheck, FileCheck,
} from "lucide-react";

const workflows = [
  {
    id: "standard-review",
    name: "Standard Review",
    description: "Route to department manager, then to finance for review",
    icon: FileCheck,
    steps: ["Department Manager", "Finance Review", "Final Sign-off"],
    avgTime: "2-3 days",
    category: "review",
  },
  {
    id: "auto-process",
    name: "Auto-Process (< $500)",
    description: "Automatically process documents under threshold",
    icon: Zap,
    steps: ["Amount Check", "Auto-Process"],
    avgTime: "Instant",
    category: "automation",
  },
  {
    id: "multi-level",
    name: "Multi-Level Review",
    description: "Escalate through multiple tiers based on amount",
    icon: Users,
    steps: ["Team Lead", "Department Head", "VP Finance", "CFO"],
    avgTime: "3-5 days",
    category: "review",
  },
  {
    id: "compliance-review",
    name: "Compliance Review",
    description: "Route through compliance team for regulatory checks",
    icon: ShieldCheck,
    steps: ["Compliance Check", "Legal Review", "Final Sign-off"],
    avgTime: "4-7 days",
    category: "compliance",
  },
];

export default function WorkflowSheet({
  open,
  onOpenChange,
  currentWorkflow,
  onAssign,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentWorkflow: string | null;
  onAssign?: (workflowId: string) => void;
}) {
  const [selected, setSelected] = useState<string | null>(currentWorkflow);

  const handleAssign = () => {
    if (selected) {
      onAssign?.(selected);
      onOpenChange(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-md p-0 flex flex-col">
        <SheetHeader className="px-6 pt-6 pb-4 border-b border-border shrink-0">
          <SheetTitle className="text-lg font-semibold text-foreground flex items-center gap-2">
            <GitBranch className="h-5 w-5 text-primary" />
            Assign Workflow
          </SheetTitle>
          <SheetDescription className="text-sm text-muted-foreground">
            Choose a workflow to route this document through
          </SheetDescription>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-3">
          {workflows.map((wf) => {
            const Icon = wf.icon;
            const isSelected = selected === wf.id;
            return (
              <button
                key={wf.id}
                onClick={() => setSelected(isSelected ? null : wf.id)}
                className={`w-full text-left rounded-lg border p-4 transition-all ${
                  isSelected
                    ? "border-primary bg-primary/5 shadow-sm"
                    : "border-border bg-card hover:bg-accent/30 hover:border-muted-foreground/30"
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className={`h-9 w-9 rounded-lg flex items-center justify-center shrink-0 ${
                    isSelected ? "bg-primary/10" : "bg-secondary"
                  }`}>
                    <Icon className={`h-4.5 w-4.5 ${isSelected ? "text-primary" : "text-muted-foreground"}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-0.5">
                      <span className="text-sm font-semibold text-foreground">{wf.name}</span>
                      {isSelected && <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />}
                    </div>
                    <p className="text-xs text-muted-foreground mb-3">{wf.description}</p>

                    {/* Steps visualization */}
                    <div className="flex items-center gap-1 flex-wrap mb-2">
                      {wf.steps.map((step, i) => (
                        <div key={step} className="flex items-center gap-1">
                          <span className={`text-[10px] font-medium px-2 py-1 rounded-md border ${
                            isSelected ? "border-primary/20 bg-primary/5 text-primary" : "border-border bg-secondary text-muted-foreground"
                          }`}>{step}</span>
                          {i < wf.steps.length - 1 && (
                            <ArrowRight className="h-3 w-3 text-muted-foreground/40 shrink-0" />
                          )}
                        </div>
                      ))}
                    </div>

                    <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      <span>Avg. completion: {wf.avgTime}</span>
                    </div>
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Footer */}
        <div className="shrink-0 border-t border-border px-6 py-4 bg-card">
          <button
            onClick={handleAssign}
            disabled={!selected}
            className="w-full flex items-center justify-center gap-2 text-sm font-semibold bg-primary text-primary-foreground rounded-lg px-4 py-2.5 hover:bg-primary/90 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            <GitBranch className="h-4 w-4" />
            Assign Workflow
          </button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
