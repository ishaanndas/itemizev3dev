import { useState, useEffect } from "react";
import { X, Trash2, Plus, Info } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface NodeConfigPanelProps {
  node: any;
  onUpdate: (id: string, data: Record<string, any>) => void;
  onDelete: (id: string) => void;
  onClose: () => void;
}

const ROLES = ["Manager", "Director", "CFO", "Admin", "AP Manager", "AP Director", "Finance Director", "VP Finance"];
const DEPARTMENTS = ["Finance", "Operations", "Engineering", "Sales", "HR", "IT", "Legal", "Procurement"];
const USERS = ["John Doe", "Jane Smith", "Mike Johnson", "Sarah Williams"];

export default function NodeConfigPanel({ node, onUpdate, onDelete, onClose }: NodeConfigPanelProps) {
  const nodeType = node.type as string;
  const [formData, setFormData] = useState<Record<string, any>>(node.data || {});

  useEffect(() => {
    setFormData(node.data || {});
  }, [node.id]);

  const update = (key: string, value: any) => {
    const next = { ...formData, [key]: value };
    setFormData(next);
    onUpdate(node.id, next);
  };

  const stepMode = formData.stepMode || "approval";

  const typeLabel: Record<string, string> = {
    trigger: "Trigger",
    step: "Step",
    condition: "Condition",
  };

  const rules: { field: string; operator: string; value: string }[] = formData.rules || [];
  const addRule = () => update("rules", [...rules, { field: "amount", operator: "gt", value: "" }]);
  const updateRule = (idx: number, key: string, val: string) => {
    update("rules", rules.map((r, i) => (i === idx ? { ...r, [key]: val } : r)));
  };
  const removeRule = (idx: number) => update("rules", rules.filter((_, i) => i !== idx));

  return (
    <div className="w-[340px] shrink-0 border-l border-border bg-card h-full overflow-y-auto">
      <div className="flex items-center justify-between px-5 py-4 border-b border-border">
        <h3 className="text-sm font-semibold text-foreground">{typeLabel[nodeType] || "Step"} Settings</h3>
        <button onClick={onClose} className="h-7 w-7 rounded-md flex items-center justify-center hover:bg-secondary transition-colors">
          <X className="h-4 w-4 text-muted-foreground" />
        </button>
      </div>

      <div className="px-5 py-5 space-y-5">
        {/* Name */}
        <Field label="Name">
          <Input
            value={formData.label || ""}
            onChange={(e) => update("label", e.target.value)}
            placeholder="Step name"
            className="h-9 text-sm"
          />
        </Field>

        <Field label="Description">
          <Textarea
            value={formData.description || ""}
            onChange={(e) => update("description", e.target.value)}
            placeholder="Optional description"
            rows={2}
            className="text-sm resize-none"
          />
        </Field>

        {/* ── Trigger config ── */}
        {nodeType === "trigger" && (
          <>
            <SectionHeader title="1. Document Type" hint="What type of document triggers this workflow" />
            <Field label="Document Type">
              <Select value={formData.objectType || "invoice"} onValueChange={(v) => update("objectType", v)}>
                <SelectTrigger className="h-9 text-sm"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="invoice">Invoice</SelectItem>
                  <SelectItem value="purchase_order">Purchase Order</SelectItem>
                  <SelectItem value="supplier_request">Supplier Request</SelectItem>
                  <SelectItem value="receipt">Receipt</SelectItem>
                  <SelectItem value="credit_memo">Credit Memo</SelectItem>
                  <SelectItem value="expense_report">Expense Report</SelectItem>
                </SelectContent>
              </Select>
            </Field>

            <Field label="Trigger Event">
              <Select value={formData.triggerCondition || "document_received"} onValueChange={(v) => update("triggerCondition", v)}>
                <SelectTrigger className="h-9 text-sm"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="document_received">Document Received</SelectItem>
                  <SelectItem value="document_created">Document Created</SelectItem>
                  <SelectItem value="document_updated">Document Updated</SelectItem>
                  <SelectItem value="status_changed">Status Changed</SelectItem>
                </SelectContent>
              </Select>
            </Field>

            <SectionHeader title="2. Matching Conditions" hint="Define when this workflow applies" />
            <div className="flex items-center gap-2 mb-1">
              <label className="text-xs font-medium text-muted-foreground">Logic</label>
              <Select value={formData.ruleLogic || "and"} onValueChange={(v) => update("ruleLogic", v)}>
                <SelectTrigger className="h-7 text-xs w-20"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="and">AND</SelectItem>
                  <SelectItem value="or">OR</SelectItem>
                </SelectContent>
              </Select>
              <span className="text-[10px] text-muted-foreground">between rules</span>
            </div>
            <ConditionRulesEditor rules={rules} addRule={addRule} updateRule={updateRule} removeRule={removeRule} />
          </>
        )}

        {/* ── Step config ── */}
        {nodeType === "step" && (
          <>
            <SectionHeader title="Step Type" hint="Choose what this step does" />
            <Field label="Action">
              <Select value={stepMode} onValueChange={(v) => update("stepMode", v)}>
                <SelectTrigger className="h-9 text-sm"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="approval">Require Approval</SelectItem>
                  <SelectItem value="auto_approve">Auto-Complete</SelectItem>
                  <SelectItem value="notify">Send Notification</SelectItem>
                  <SelectItem value="update_status">Update Status</SelectItem>
                  <SelectItem value="end">End (workflow complete)</SelectItem>
                </SelectContent>
              </Select>
            </Field>

            {/* Approval-specific */}
            {stepMode === "approval" && (
              <>
                <SectionHeader title="Assigned To" hint="Who handles this step" />
                <Field label="Approver Type">
                  <Select value={formData.assigneeType || "role"} onValueChange={(v) => { update("assigneeType", v); update("assignee", ""); }}>
                    <SelectTrigger className="h-9 text-sm"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="role">Role-Based (recommended)</SelectItem>
                      <SelectItem value="user">Specific User</SelectItem>
                      <SelectItem value="department">Department Head</SelectItem>
                      <SelectItem value="supervisor">Supervisor Hierarchy</SelectItem>
                    </SelectContent>
                  </Select>
                </Field>

                {formData.assigneeType !== "supervisor" && (
                  <Field label="Assignee">
                    <Select value={formData.assignee || ""} onValueChange={(v) => update("assignee", v)}>
                      <SelectTrigger className="h-9 text-sm"><SelectValue placeholder="Select..." /></SelectTrigger>
                      <SelectContent>
                        {(formData.assigneeType === "user" ? USERS : formData.assigneeType === "department" ? DEPARTMENTS : ROLES).map((opt) => (
                          <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </Field>
                )}

                {formData.assigneeType === "supervisor" && (
                  <Field label="Hierarchy Levels">
                    <Input type="number" value={formData.hierarchyLevels ?? "1"} onChange={(e) => update("hierarchyLevels", e.target.value)} className="h-9 text-sm" min={1} max={5} />
                    <span className="text-[10px] text-muted-foreground">How many levels up the chain</span>
                  </Field>
                )}

                <SectionHeader title="Approval Logic" hint="How approvals are processed" />
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Approval Mode">
                    <Select value={formData.approvalMode || "required"} onValueChange={(v) => update("approvalMode", v)}>
                      <SelectTrigger className="h-9 text-sm"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="required">Required</SelectItem>
                        <SelectItem value="optional">Optional (FYI)</SelectItem>
                      </SelectContent>
                    </Select>
                  </Field>
                  <Field label="Required Approvals">
                    <Input type="number" value={formData.requiredApprovals ?? "1"} onChange={(e) => update("requiredApprovals", e.target.value)} className="h-9 text-sm" min={1} />
                  </Field>
                </div>

                <Field label="Execution">
                  <Select value={formData.execution || "sequential"} onValueChange={(v) => update("execution", v)}>
                    <SelectTrigger className="h-9 text-sm"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="sequential">Sequential (one after another)</SelectItem>
                      <SelectItem value="parallel">Parallel (all at same time)</SelectItem>
                      <SelectItem value="any">Any One Approver</SelectItem>
                    </SelectContent>
                  </Select>
                </Field>

                <SectionHeader title="Escalation & Delegation" hint="Avoid bottlenecks" />
                <div className="flex items-center justify-between rounded-lg border border-border p-3">
                  <div>
                    <p className="text-sm font-medium text-foreground">Enable Escalation</p>
                    <p className="text-[10px] text-muted-foreground">Auto-escalate if no response</p>
                  </div>
                  <Switch checked={formData.enableEscalation || false} onCheckedChange={(v) => update("enableEscalation", v)} />
                </div>

                {formData.enableEscalation && (
                  <div className="space-y-3 pl-1 border-l-2 border-amber-500/30 ml-1">
                    <div className="grid grid-cols-2 gap-3 pl-3">
                      <Field label="After (hours)">
                        <Input type="number" value={formData.escalateAfterHours ?? "48"} onChange={(e) => update("escalateAfterHours", e.target.value)} className="h-9 text-sm" />
                      </Field>
                      <Field label="Escalate To">
                        <Select value={formData.escalateTo || ""} onValueChange={(v) => update("escalateTo", v)}>
                          <SelectTrigger className="h-9 text-sm"><SelectValue placeholder="Select..." /></SelectTrigger>
                          <SelectContent>
                            {ROLES.map((r) => <SelectItem key={r} value={r}>{r}</SelectItem>)}
                          </SelectContent>
                        </Select>
                      </Field>
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-between rounded-lg border border-border p-3">
                  <div>
                    <p className="text-sm font-medium text-foreground">Allow Delegation</p>
                    <p className="text-[10px] text-muted-foreground">Approver can delegate to another</p>
                  </div>
                  <Switch checked={formData.allowDelegation || false} onCheckedChange={(v) => update("allowDelegation", v)} />
                </div>
              </>
            )}

            {/* Notify-specific */}
            {stepMode === "notify" && (
              <>
                <SectionHeader title="Notification" hint="Configure who gets notified" />
                <div className="space-y-2">
                  <CheckboxField label="Approver(s) — Action Required" checked={formData.notifyApprovers ?? true} onChange={(v) => update("notifyApprovers", v)} />
                  <CheckboxField label="Requestor — Status Update" checked={formData.notifyRequestor ?? true} onChange={(v) => update("notifyRequestor", v)} />
                  <CheckboxField label="Admin — Exceptions Only" checked={formData.notifyAdmin || false} onChange={(v) => update("notifyAdmin", v)} />
                </div>
                <Field label="Email Template">
                  <Select value={formData.emailTemplate || "default"} onValueChange={(v) => update("emailTemplate", v)}>
                    <SelectTrigger className="h-9 text-sm"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="default">Default Template</SelectItem>
                      <SelectItem value="approval_request">Approval Request</SelectItem>
                      <SelectItem value="approval_complete">Approval Complete</SelectItem>
                      <SelectItem value="rejection_notice">Rejection Notice</SelectItem>
                      <SelectItem value="escalation_alert">Escalation Alert</SelectItem>
                    </SelectContent>
                  </Select>
                </Field>
              </>
            )}

            {/* Update status */}
            {stepMode === "update_status" && (
              <>
                <SectionHeader title="Status Update" hint="Set the new document status" />
                <Field label="New Status">
                  <Select value={formData.newStatus || "approved"} onValueChange={(v) => update("newStatus", v)}>
                    <SelectTrigger className="h-9 text-sm"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="approved">Approved</SelectItem>
                      <SelectItem value="rejected">Rejected</SelectItem>
                      <SelectItem value="pending_review">Pending Review</SelectItem>
                      <SelectItem value="on_hold">On Hold</SelectItem>
                    </SelectContent>
                  </Select>
                </Field>
              </>
            )}
          </>
        )}

        {/* ── Condition config ── */}
        {nodeType === "condition" && (
          <>
            <SectionHeader title="Define Condition" hint="Set the logic that determines routing" />
            <div className="flex items-center gap-2 mb-1">
              <label className="text-xs font-medium text-muted-foreground">Logic</label>
              <Select value={formData.ruleLogic || "and"} onValueChange={(v) => update("ruleLogic", v)}>
                <SelectTrigger className="h-7 text-xs w-20"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="and">AND</SelectItem>
                  <SelectItem value="or">OR</SelectItem>
                </SelectContent>
              </Select>
              <span className="text-[10px] text-muted-foreground">between rules</span>
            </div>
            <ConditionRulesEditor rules={rules} addRule={addRule} updateRule={updateRule} removeRule={removeRule} />
          </>
        )}

        {/* Delete */}
        {nodeType !== "trigger" && (
          <button
            onClick={() => onDelete(node.id)}
            className="w-full flex items-center justify-center gap-2 text-sm font-medium text-destructive hover:bg-destructive/10 rounded-lg py-2.5 transition-colors mt-2"
          >
            <Trash2 className="h-3.5 w-3.5" />
            Remove Step
          </button>
        )}
      </div>
    </div>
  );
}

/* ── Shared sub-components ── */

function SectionHeader({ title, hint }: { title: string; hint: string }) {
  return (
    <div className="flex items-center gap-1.5 pt-2 border-t border-border">
      <span className="text-xs font-semibold text-foreground">{title}</span>
      <Tooltip>
        <TooltipTrigger asChild>
          <Info className="h-3 w-3 text-muted-foreground cursor-help" />
        </TooltipTrigger>
        <TooltipContent side="right" className="text-xs max-w-[200px]">{hint}</TooltipContent>
      </Tooltip>
    </div>
  );
}

function ConditionRulesEditor({
  rules, addRule, updateRule, removeRule,
}: {
  rules: { field: string; operator: string; value: string }[];
  addRule: () => void;
  updateRule: (idx: number, key: string, val: string) => void;
  removeRule: (idx: number) => void;
}) {
  return (
    <div className="space-y-2">
      {rules.map((rule, idx) => (
        <div key={idx} className="rounded-lg border border-border bg-secondary/30 p-2.5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] text-muted-foreground">Rule {idx + 1}</span>
            <button onClick={() => removeRule(idx)} className="text-destructive hover:text-destructive/80">
              <Trash2 className="h-3 w-3" />
            </button>
          </div>
          <div className="grid grid-cols-3 gap-1.5">
            <Select value={rule.field || "amount"} onValueChange={(v) => updateRule(idx, "field", v)}>
              <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="amount">Amount</SelectItem>
                <SelectItem value="vendor">Vendor / Supplier</SelectItem>
                <SelectItem value="department">Department</SelectItem>
                <SelectItem value="cost_center">Cost Center</SelectItem>
                <SelectItem value="commodity">Commodity</SelectItem>
                <SelectItem value="document_type">Doc Type</SelectItem>
                <SelectItem value="category">Category</SelectItem>
              </SelectContent>
            </Select>
            <Select value={rule.operator || "gt"} onValueChange={(v) => updateRule(idx, "operator", v)}>
              <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="eq">= equals</SelectItem>
                <SelectItem value="neq">≠ not equal</SelectItem>
                <SelectItem value="gt">&gt; greater than</SelectItem>
                <SelectItem value="lt">&lt; less than</SelectItem>
                <SelectItem value="gte">≥ at least</SelectItem>
                <SelectItem value="lte">≤ at most</SelectItem>
                <SelectItem value="contains">contains</SelectItem>
              </SelectContent>
            </Select>
            <Input value={rule.value || ""} onChange={(e) => updateRule(idx, "value", e.target.value)} placeholder="e.g. 50000" className="h-8 text-xs" />
          </div>
        </div>
      ))}
      <button onClick={addRule} className="flex items-center gap-1.5 text-xs font-medium text-primary hover:text-primary/80">
        <Plus className="h-3 w-3" /> Add Rule
      </button>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="text-xs font-medium text-muted-foreground mb-1.5 block">{label}</label>
      {children}
    </div>
  );
}

function CheckboxField({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="flex items-center gap-2">
      <Checkbox checked={checked} onCheckedChange={onChange} />
      <Label className="text-sm font-normal text-foreground cursor-pointer">{label}</Label>
    </div>
  );
}
