import { useState, useCallback } from "react";
import {
  Plus, Trash2, ChevronDown, ChevronRight, Search,
  SlidersHorizontal, Users, Bell, CheckCircle2, Clock, ArrowUpRight,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

/* ── Constants ── */
const ROLES = ["Any Admin", "Manager", "Director", "CFO", "AP Manager", "AP Director", "Finance Director", "VP Finance"];
const USERS_LIST = ["John Doe", "Jane Smith", "Mike Johnson", "Sarah Williams"];
const DEPARTMENTS = ["Finance", "Operations", "Engineering", "Sales", "HR", "IT", "Legal", "Procurement"];

const FIELDS = [
  { value: "department", label: "Department" },
  { value: "amount", label: "Amount" },
  { value: "vendor", label: "Vendor" },
  { value: "cost_center", label: "Cost Center" },
  { value: "commodity", label: "Commodity" },
];
const OPERATORS: Record<string, { value: string; label: string }[]> = {
  department: [{ value: "is", label: "is" }, { value: "is_not", label: "is not" }],
  amount: [{ value: "gt", label: ">" }, { value: "lt", label: "<" }, { value: "gte", label: "≥" }, { value: "lte", label: "≤" }, { value: "eq", label: "=" }],
  vendor: [{ value: "is", label: "is" }, { value: "is_not", label: "is not" }],
  cost_center: [{ value: "is", label: "is" }, { value: "is_not", label: "is not" }],
  commodity: [{ value: "is", label: "is" }, { value: "is_not", label: "is not" }],
};
const DEPARTMENT_VALUES = ["Executive", "Bookkeeping", "Engineering", "Growth", "Finance", "Operations", "Sales", "HR", "IT", "Legal", "Procurement"];

/* ── Types ── */
type StepType = "approval" | "notify" | "approve_bill" | "auto_approve" | "update_status";

interface Step {
  id: string;
  type: StepType;
  assigneeType?: "role" | "user" | "department" | "supervisor";
  assignee?: string;
  hierarchyLevels?: string;
  approvalMode?: "required" | "optional";
  execution?: "sequential" | "parallel" | "any";
  requiredApprovals?: string;
  enableEscalation?: boolean;
  escalateAfterHours?: string;
  escalateTo?: string;
  allowDelegation?: boolean;
  notifyApprovers?: boolean;
  notifyRequestor?: boolean;
  notifyAdmin?: boolean;
  newStatus?: string;
}

interface ConditionLayer {
  id: string;
  field: string;
  operator: string;
  value: string;
  expanded: boolean;
  steps: Step[];
}

const stepTypeConfig: Record<StepType, { label: string; description: string }> = {
  approval: { label: "Require Approval", description: "Assign someone to review this document" },
  notify: { label: "Send Notification", description: "Notify stakeholders about this document" },
  approve_bill: { label: "Mark Complete", description: "Auto-complete this step" },
  auto_approve: { label: "Auto-Complete", description: "Skip manual action for this condition" },
  update_status: { label: "Update Status", description: "Change the document status" },
};

let idCounter = 100;
const nextId = () => `linear-${++idCounter}`;

const sampleLayers: ConditionLayer[] = [
  {
    id: nextId(), field: "department", operator: "is", value: "Bookkeeping", expanded: true,
    steps: [{ id: nextId(), type: "approval", assigneeType: "role", assignee: "Any Admin", approvalMode: "required", execution: "sequential" }],
  },
  {
    id: nextId(), field: "department", operator: "is", value: "Engineering", expanded: true,
    steps: [{ id: nextId(), type: "approval", assigneeType: "role", assignee: "Manager", approvalMode: "required", execution: "sequential" }],
  },
  {
    id: nextId(), field: "department", operator: "is", value: "Growth", expanded: false,
    steps: [{ id: nextId(), type: "approval", assigneeType: "role", assignee: "Any Admin" }],
  },
  {
    id: nextId(), field: "department", operator: "is", value: "Finance", expanded: false,
    steps: [
      { id: nextId(), type: "approval", assigneeType: "role", assignee: "Finance Director", approvalMode: "required" },
      { id: nextId(), type: "notify", notifyRequestor: true },
    ],
  },
];

export default function LinearWorkflowBuilder({ isNew = false }: { isNew?: boolean }) {
  const [layers, setLayers] = useState<ConditionLayer[]>(isNew ? [] : sampleLayers);
  const [searchQuery, setSearchQuery] = useState("");
  const [fallbackSteps, setFallbackSteps] = useState<Step[]>([]);

  const filteredLayers = searchQuery
    ? layers.filter((l) => `${l.field} ${l.operator} ${l.value}`.toLowerCase().includes(searchQuery.toLowerCase()))
    : layers;

  const toggleLayer = useCallback((id: string) => {
    setLayers((prev) => prev.map((l) => (l.id === id ? { ...l, expanded: !l.expanded } : l)));
  }, []);

  const addLayer = useCallback(() => {
    setLayers((prev) => [
      ...prev,
      { id: nextId(), field: "department", operator: "is", value: "", expanded: true, steps: [] },
    ]);
  }, []);

  const removeLayer = useCallback((id: string) => {
    setLayers((prev) => prev.filter((l) => l.id !== id));
  }, []);

  const updateLayer = useCallback((id: string, updates: Partial<ConditionLayer>) => {
    setLayers((prev) => prev.map((l) => (l.id === id ? { ...l, ...updates } : l)));
  }, []);

  const addStep = useCallback((layerId: string, type: StepType) => {
    const newStep: Step = {
      id: nextId(), type,
      ...(type === "approval" ? { assigneeType: "role" as const, assignee: "Any Admin", approvalMode: "required" as const, execution: "sequential" as const } : {}),
      ...(type === "notify" ? { notifyApprovers: true, notifyRequestor: true } : {}),
      ...(type === "update_status" ? { newStatus: "approved" } : {}),
    };
    setLayers((prev) =>
      prev.map((l) => (l.id === layerId ? { ...l, steps: [...l.steps, newStep] } : l))
    );
  }, []);

  const removeStep = useCallback((layerId: string, stepId: string) => {
    setLayers((prev) =>
      prev.map((l) => (l.id === layerId ? { ...l, steps: l.steps.filter((s) => s.id !== stepId) } : l))
    );
  }, []);

  const updateStep = useCallback((layerId: string, stepId: string, updates: Partial<Step>) => {
    setLayers((prev) =>
      prev.map((l) =>
        l.id === layerId
          ? { ...l, steps: l.steps.map((s) => (s.id === stepId ? { ...s, ...updates } : s)) }
          : l
      )
    );
  }, []);

  const addFallbackStep = useCallback((type: StepType) => {
    setFallbackSteps((prev) => [...prev, {
      id: nextId(), type,
      ...(type === "approval" ? { assigneeType: "role" as const, assignee: "Any Admin" } : {}),
    }]);
  }, []);

  const removeFallbackStep = useCallback((stepId: string) => {
    setFallbackSteps((prev) => prev.filter((s) => s.id !== stepId));
  }, []);

  const updateFallbackStep = useCallback((stepId: string, updates: Partial<Step>) => {
    setFallbackSteps((prev) => prev.map((s) => (s.id === stepId ? { ...s, ...updates } : s)));
  }, []);

  const getConditionSummary = (layer: ConditionLayer) => {
    const fieldLabel = FIELDS.find((f) => f.value === layer.field)?.label || layer.field;
    const ops = OPERATORS[layer.field] || OPERATORS.department;
    const opLabel = ops.find((o) => o.value === layer.operator)?.label || layer.operator;
    return `${fieldLabel} ${opLabel} ${layer.value || "..."}`;
  };

  return (
    <div className="flex-1 flex min-h-0 overflow-hidden">
      {/* Left sidebar: Layers nav */}
      <div className="w-[220px] shrink-0 border-r border-border bg-card overflow-y-auto">
        <div className="px-4 pt-5 pb-3">
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Conditions</h3>
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search..."
              className="h-8 text-xs pl-8"
            />
          </div>
        </div>

        <div className="px-2 pb-3 space-y-0.5">
          {layers.map((layer) => (
            <button
              key={layer.id}
              onClick={() => {
                if (!layer.expanded) toggleLayer(layer.id);
                const el = document.getElementById(`layer-${layer.id}`);
                el?.scrollIntoView({ behavior: "smooth", block: "center" });
              }}
              className="w-full flex items-center gap-2 px-3 py-2 text-xs text-foreground hover:bg-secondary rounded-md transition-colors text-left"
            >
              <SlidersHorizontal className="h-3 w-3 text-muted-foreground shrink-0" />
              <span className="truncate">{getConditionSummary(layer)}</span>
            </button>
          ))}

          <button className="w-full flex items-center gap-2 px-3 py-2 text-xs text-muted-foreground hover:bg-secondary rounded-md transition-colors text-left">
            <SlidersHorizontal className="h-3 w-3 shrink-0" />
            No conditions met
          </button>
        </div>

        <div className="px-4 pb-4 border-t border-border pt-4 mt-auto">
          <p className="text-xs font-medium text-foreground mb-1">Help & Support</p>
          <a href="#" className="text-xs text-primary hover:underline inline-flex items-center gap-1">
            Help Center Article <ArrowUpRight className="h-3 w-3" />
          </a>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 overflow-y-auto bg-background">
        <div className="py-8 px-8 lg:px-12 max-w-full">
          {/* Empty state */}
          {layers.length === 0 && (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-4">
                <SlidersHorizontal className="h-5 w-5 text-muted-foreground" />
              </div>
              <h3 className="text-sm font-semibold text-foreground mb-1">No conditions yet</h3>
              <p className="text-xs text-muted-foreground mb-5 max-w-[300px]">
                Add your first condition to define when this workflow applies — e.g. by document type, amount, or vendor.
              </p>
              <button
                onClick={addLayer}
                className="flex items-center gap-2 text-sm font-medium bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors"
              >
                <Plus className="h-3.5 w-3.5" />
                Add First Condition
              </button>
            </div>
          )}

          {filteredLayers.map((layer, layerIdx) => (
            <div key={layer.id} id={`layer-${layer.id}`} className="mb-1">
              {/* Vertical connector */}
              {layerIdx > 0 && <div className="ml-5 w-px h-3 bg-border" />}

              {/* Condition block */}
              <div className="rounded-lg border border-border bg-card overflow-hidden">
                {/* Condition header */}
                <div
                  className="flex items-center gap-2 px-4 py-3 cursor-pointer hover:bg-secondary/50 transition-colors group"
                  onClick={() => toggleLayer(layer.id)}
                >
                  <div className="shrink-0 text-muted-foreground">
                    {layer.expanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                  </div>

                  <span className="text-sm font-medium text-muted-foreground">If</span>

                  <div className="flex items-center gap-1.5 flex-1" onClick={(e) => e.stopPropagation()}>
                    <Select value={layer.field} onValueChange={(v) => updateLayer(layer.id, { field: v, operator: OPERATORS[v]?.[0]?.value || "is" })}>
                      <SelectTrigger className="h-7 text-xs w-[120px] bg-background border-border">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {FIELDS.map((f) => <SelectItem key={f.value} value={f.value}>{f.label}</SelectItem>)}
                      </SelectContent>
                    </Select>

                    <Select value={layer.operator} onValueChange={(v) => updateLayer(layer.id, { operator: v })}>
                      <SelectTrigger className="h-7 text-xs w-[70px] bg-background border-border">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {(OPERATORS[layer.field] || OPERATORS.department).map((op) => (
                          <SelectItem key={op.value} value={op.value}>{op.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    {layer.field === "department" ? (
                      <Select value={layer.value} onValueChange={(v) => updateLayer(layer.id, { value: v })}>
                        <SelectTrigger className="h-7 text-xs w-[140px] bg-background border-border">
                          <SelectValue placeholder="Select..." />
                        </SelectTrigger>
                        <SelectContent>
                          {DEPARTMENT_VALUES.map((d) => <SelectItem key={d} value={d}>{d}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    ) : (
                      <Input
                        value={layer.value}
                        onChange={(e) => updateLayer(layer.id, { value: e.target.value })}
                        placeholder="Value..."
                        className="h-7 text-xs w-[140px] bg-background"
                      />
                    )}
                  </div>

                  <span className="text-[10px] text-muted-foreground shrink-0">
                    {layer.steps.length} step{layer.steps.length !== 1 ? "s" : ""}
                  </span>

                  <button
                    onClick={(e) => { e.stopPropagation(); removeLayer(layer.id); }}
                    className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive transition-all shrink-0"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>

                {/* Steps */}
                {layer.expanded && (
                  <div className="border-t border-border bg-background/50">
                    {layer.steps.map((step, stepIdx) => (
                      <StepRow
                        key={step.id}
                        step={step}
                        index={stepIdx}
                        onUpdate={(updates) => updateStep(layer.id, step.id, updates)}
                        onRemove={() => removeStep(layer.id, step.id)}
                      />
                    ))}

                    <div className="px-4 py-2.5 border-t border-dashed border-border/50">
                      <AddStepPopover onAdd={(type) => addStep(layer.id, type)} />
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}

          {/* Add condition button */}
          <div className="ml-5 w-px h-3 bg-border" />
          <button
            onClick={addLayer}
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors py-2.5 px-4 rounded-lg border border-dashed border-border hover:border-foreground/30"
          >
            <Plus className="h-3.5 w-3.5" />
            Add Condition
          </button>

          {/* Fallback */}
          <div className="ml-5 w-px h-5 bg-border" />
          <div className="rounded-lg border border-border bg-card overflow-hidden">
            <div className="flex items-center gap-2 px-4 py-3 bg-muted/30">
              <SlidersHorizontal className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="text-sm font-medium text-muted-foreground">No conditions met (fallback)</span>
            </div>
            <div className="border-t border-border bg-background/50">
              {fallbackSteps.map((step, stepIdx) => (
                <StepRow
                  key={step.id}
                  step={step}
                  index={stepIdx}
                  onUpdate={(updates) => updateFallbackStep(step.id, updates)}
                  onRemove={() => removeFallbackStep(step.id)}
                />
              ))}
              <div className="px-4 py-2.5 border-t border-dashed border-border/50">
                <AddStepPopover onAdd={addFallbackStep} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Step Row (expandable with full config) ── */
function StepRow({ step, index, onUpdate, onRemove }: {
  step: Step;
  index: number;
  onUpdate: (updates: Partial<Step>) => void;
  onRemove: () => void;
}) {
  const [expanded, setExpanded] = useState(true);
  const config = stepTypeConfig[step.type];

  const assigneeLabel = () => {
    if (step.type !== "approval") return null;
    if (step.assigneeType === "supervisor") return "Supervisor Chain";
    return step.assignee || "Unassigned";
  };

  return (
    <div className={`border-t border-border ${index === 0 ? "border-t-0" : ""}`}>
      <div className="flex items-center gap-3 px-4 py-2.5 group/step">
        <div className="w-5 h-5 rounded-full bg-muted flex items-center justify-center shrink-0">
          <span className="text-[10px] font-semibold text-muted-foreground">{index + 1}</span>
        </div>

        <span className="text-sm font-medium text-foreground">{config.label}</span>

        {step.type === "approval" && (
          <span className="text-xs px-2 py-0.5 rounded-md bg-primary/10 text-primary font-medium">
            {assigneeLabel()}
          </span>
        )}

        {step.type === "approval" && step.execution && (
          <span className="text-[10px] text-muted-foreground capitalize">{step.execution}</span>
        )}

        {step.type === "update_status" && (
          <span className="text-xs px-2 py-0.5 rounded-md bg-muted text-muted-foreground font-medium capitalize">
            {step.newStatus || "approved"}
          </span>
        )}

        <div className="flex-1" />

        <button onClick={() => setExpanded(!expanded)} className="text-muted-foreground hover:text-foreground transition-colors">
          {expanded ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronRight className="h-3.5 w-3.5" />}
        </button>

        <button
          onClick={onRemove}
          className="opacity-0 group-hover/step:opacity-100 text-muted-foreground hover:text-destructive transition-all"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </div>

      {expanded && (
        <div className="px-4 pb-4 pt-1 ml-8 space-y-3">
          {step.type === "approval" && (
            <>
              <div className="grid grid-cols-3 gap-3">
                <Field label="Assignee Type">
                  <Select value={step.assigneeType || "role"} onValueChange={(v) => onUpdate({ assigneeType: v as Step["assigneeType"], assignee: "" })}>
                    <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="role">Role-Based</SelectItem>
                      <SelectItem value="user">Specific User</SelectItem>
                      <SelectItem value="department">Department Head</SelectItem>
                      <SelectItem value="supervisor">Supervisor Hierarchy</SelectItem>
                    </SelectContent>
                  </Select>
                </Field>

                {step.assigneeType !== "supervisor" && (
                  <Field label="Assignee">
                    <Select value={step.assignee || ""} onValueChange={(v) => onUpdate({ assignee: v })}>
                      <SelectTrigger className="h-8 text-xs"><SelectValue placeholder="Select..." /></SelectTrigger>
                      <SelectContent>
                        {(step.assigneeType === "user" ? USERS_LIST : step.assigneeType === "department" ? DEPARTMENTS : ROLES).map((opt) => (
                          <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </Field>
                )}

                {step.assigneeType === "supervisor" && (
                  <Field label="Levels Up">
                    <Input type="number" value={step.hierarchyLevels ?? "1"} onChange={(e) => onUpdate({ hierarchyLevels: e.target.value })} className="h-8 text-xs" min={1} max={5} />
                  </Field>
                )}

                <Field label="Mode">
                  <Select value={step.approvalMode || "required"} onValueChange={(v) => onUpdate({ approvalMode: v as Step["approvalMode"] })}>
                    <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="required">Required</SelectItem>
                      <SelectItem value="optional">Optional (FYI)</SelectItem>
                    </SelectContent>
                  </Select>
                </Field>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <Field label="Execution">
                  <Select value={step.execution || "sequential"} onValueChange={(v) => onUpdate({ execution: v as Step["execution"] })}>
                    <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="sequential">Sequential</SelectItem>
                      <SelectItem value="parallel">Parallel</SelectItem>
                      <SelectItem value="any">Any One</SelectItem>
                    </SelectContent>
                  </Select>
                </Field>

                <Field label="Required Completions">
                  <Input type="number" value={step.requiredApprovals ?? "1"} onChange={(e) => onUpdate({ requiredApprovals: e.target.value })} className="h-8 text-xs" min={1} />
                </Field>
              </div>

              <div className="flex items-center gap-6 pt-2 border-t border-border">
                <div className="flex items-center gap-2">
                  <Switch checked={step.enableEscalation || false} onCheckedChange={(v) => onUpdate({ enableEscalation: v })} className="scale-90" />
                  <span className="text-xs text-foreground">Escalation</span>
                </div>
                <div className="flex items-center gap-2">
                  <Switch checked={step.allowDelegation || false} onCheckedChange={(v) => onUpdate({ allowDelegation: v })} className="scale-90" />
                  <span className="text-xs text-foreground">Delegation</span>
                </div>
              </div>

              {step.enableEscalation && (
                <div className="grid grid-cols-2 gap-3 pl-4 border-l-2 border-primary/20">
                  <Field label="After (hours)">
                    <Input type="number" value={step.escalateAfterHours ?? "48"} onChange={(e) => onUpdate({ escalateAfterHours: e.target.value })} className="h-8 text-xs" />
                  </Field>
                  <Field label="Escalate To">
                    <Select value={step.escalateTo || ""} onValueChange={(v) => onUpdate({ escalateTo: v })}>
                      <SelectTrigger className="h-8 text-xs"><SelectValue placeholder="Select..." /></SelectTrigger>
                      <SelectContent>
                        {ROLES.map((r) => <SelectItem key={r} value={r}>{r}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </Field>
                </div>
              )}
            </>
          )}

          {step.type === "notify" && (
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-xs">
                <input type="checkbox" checked={step.notifyApprovers ?? true} onChange={(e) => onUpdate({ notifyApprovers: e.target.checked })} className="rounded" />
                Assignee(s) — Action Required
              </label>
              <label className="flex items-center gap-2 text-xs">
                <input type="checkbox" checked={step.notifyRequestor ?? true} onChange={(e) => onUpdate({ notifyRequestor: e.target.checked })} className="rounded" />
                Requestor — Status Update
              </label>
              <label className="flex items-center gap-2 text-xs">
                <input type="checkbox" checked={step.notifyAdmin ?? false} onChange={(e) => onUpdate({ notifyAdmin: e.target.checked })} className="rounded" />
                Admin — Exceptions Only
              </label>
            </div>
          )}

          {step.type === "update_status" && (
            <Field label="New Status">
              <Select value={step.newStatus || "approved"} onValueChange={(v) => onUpdate({ newStatus: v })}>
                <SelectTrigger className="h-8 text-xs w-[180px]"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                  <SelectItem value="pending_review">Pending Review</SelectItem>
                  <SelectItem value="on_hold">On Hold</SelectItem>
                </SelectContent>
              </Select>
            </Field>
          )}
        </div>
      )}
    </div>
  );
}

/* ── Add Step Popover ── */
function AddStepPopover({ onAdd }: { onAdd: (type: StepType) => void }) {
  const [open, setOpen] = useState(false);
  const items: { type: StepType; icon: typeof Users; label: string; desc: string }[] = [
    { type: "approval", icon: Users, label: "Require Approval", desc: "Assign reviewer(s)" },
    { type: "notify", icon: Bell, label: "Send Notification", desc: "Notify stakeholders" },
    { type: "approve_bill", icon: CheckCircle2, label: "Mark Complete", desc: "Auto-complete document" },
    { type: "auto_approve", icon: Clock, label: "Auto-Complete", desc: "Skip manual action" },
    { type: "update_status", icon: SlidersHorizontal, label: "Update Status", desc: "Change document status" },
  ];

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button className="text-sm text-muted-foreground hover:text-foreground transition-colors inline-flex items-center gap-1.5">
          <Plus className="h-3.5 w-3.5" />
          Add step
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-[240px] p-1.5" align="start">
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.type}
              onClick={() => { onAdd(item.type); setOpen(false); }}
              className="w-full flex items-center gap-3 px-3 py-2 text-left hover:bg-accent rounded-md transition-colors"
            >
              <Icon className="h-4 w-4 text-muted-foreground shrink-0" />
              <div>
                <p className="text-sm font-medium text-foreground">{item.label}</p>
                <p className="text-[10px] text-muted-foreground">{item.desc}</p>
              </div>
            </button>
          );
        })}
      </PopoverContent>
    </Popover>
  );
}

/* ── Field helper ── */
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="text-[10px] font-medium text-muted-foreground mb-1 block uppercase tracking-wider">{label}</label>
      {children}
    </div>
  );
}
