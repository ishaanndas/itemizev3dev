import { X, Play, AlertTriangle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

interface WorkflowSettings {
  name: string;
  description: string;
  autoApprove: boolean;
  appliesTo: string;
  approvalMode: string;
  minAmount: string;
  maxAmount: string;
  priority: string;
  timeout: string;
  requiredApprovals: string;
  active: boolean;
  defaultPolicy: boolean;
  allowSelfApproval: boolean;
  enableEscalation: boolean;
  deactivateConflicting: boolean;
  notifyOnActivation: boolean;
}

interface WorkflowSettingsPanelProps {
  settings: WorkflowSettings;
  onUpdate: (settings: WorkflowSettings) => void;
  onClose: () => void;
}

export const defaultWorkflowSettings: WorkflowSettings = {
  name: "",
  description: "",
  autoApprove: false,
  appliesTo: "invoice",
  approvalMode: "sequential",
  minAmount: "",
  maxAmount: "",
  priority: "0",
  timeout: "48",
  requiredApprovals: "1",
  active: false,
  defaultPolicy: false,
  allowSelfApproval: false,
  enableEscalation: false,
  deactivateConflicting: false,
  notifyOnActivation: true,
};

export default function WorkflowSettingsPanel({ settings, onUpdate, onClose }: WorkflowSettingsPanelProps) {
  const set = <K extends keyof WorkflowSettings>(key: K, value: WorkflowSettings[K]) => {
    onUpdate({ ...settings, [key]: value });
  };

  const handleTestWorkflow = () => {
    toast.info("Test mode started — create a test document to verify routing, assignees, and timing.", { duration: 5000 });
  };

  return (
    <div className="w-[340px] shrink-0 border-l border-border bg-card h-full overflow-y-auto">
      <div className="flex items-center justify-between px-5 py-4 border-b border-border">
        <h3 className="text-sm font-semibold text-foreground">Workflow Settings</h3>
        <button onClick={onClose} className="h-7 w-7 rounded-md flex items-center justify-center hover:bg-secondary transition-colors">
          <X className="h-4 w-4 text-muted-foreground" />
        </button>
      </div>

      <div className="px-5 py-5 space-y-5">
        {/* General */}
        <Field label="Workflow Name">
          <Input value={settings.name} onChange={(e) => set("name", e.target.value)} placeholder="e.g., High Value Document Review" className="h-9 text-sm" />
        </Field>

        <Field label="Description">
          <Textarea value={settings.description} onChange={(e) => set("description", e.target.value)} placeholder="e.g., Documents > $50K require Director review" rows={2} className="text-sm resize-none" />
        </Field>

        {/* Step 1: Object */}
        <SectionLabel>1. Document Scope</SectionLabel>

        <div className="grid grid-cols-2 gap-3">
          <Field label="Applies To">
            <Select value={settings.appliesTo} onValueChange={(v) => set("appliesTo", v)}>
              <SelectTrigger className="h-9 text-sm"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="invoice">Invoice</SelectItem>
                <SelectItem value="po">Purchase Order</SelectItem>
                <SelectItem value="supplier_request">Supplier Request</SelectItem>
                <SelectItem value="receipt">Receipt</SelectItem>
                <SelectItem value="expense_report">Expense Report</SelectItem>
                <SelectItem value="all">All Documents</SelectItem>
              </SelectContent>
            </Select>
          </Field>
          <Field label="Priority">
            <Input type="number" value={settings.priority} onChange={(e) => set("priority", e.target.value)} className="h-9 text-sm" />
            <span className="text-[10px] text-muted-foreground">Lower = higher priority</span>
          </Field>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Field label="Min Amount ($)">
            <Input value={settings.minAmount} onChange={(e) => set("minAmount", e.target.value)} placeholder="0.00" className="h-9 text-sm" />
          </Field>
          <Field label="Max Amount ($)">
            <Input value={settings.maxAmount} onChange={(e) => set("maxAmount", e.target.value)} placeholder="No limit" className="h-9 text-sm" />
          </Field>
        </div>

        {/* Step 4: Global approval logic */}
        <SectionLabel>4. Global Step Logic</SectionLabel>

        <Field label="Default Mode">
          <Select value={settings.approvalMode} onValueChange={(v) => set("approvalMode", v)}>
            <SelectTrigger className="h-9 text-sm"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="sequential">Sequential (one step at a time)</SelectItem>
              <SelectItem value="parallel">Parallel (steps run together)</SelectItem>
              <SelectItem value="any">Any One Assignee</SelectItem>
            </SelectContent>
          </Select>
        </Field>

        <div className="flex items-center justify-between rounded-lg border border-border p-3">
          <div>
            <p className="text-sm font-medium text-foreground">Auto-Complete</p>
            <p className="text-[10px] text-muted-foreground">Skip all manual steps</p>
          </div>
          <Switch checked={settings.autoApprove} onCheckedChange={(v) => set("autoApprove", v)} />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Field label="Global Timeout (hours)">
            <Input type="number" value={settings.timeout} onChange={(e) => set("timeout", e.target.value)} className="h-9 text-sm" />
          </Field>
          <Field label="Required Completions">
            <Input type="number" value={settings.requiredApprovals} onChange={(e) => set("requiredApprovals", e.target.value)} className="h-9 text-sm" min={1} />
          </Field>
        </div>

        <div className="space-y-3 pt-1">
          <CheckItem label="Default Workflow" checked={settings.defaultPolicy} onChange={(v) => set("defaultPolicy", v)} />
          <CheckItem label="Allow Self-Action" checked={settings.allowSelfApproval} onChange={(v) => set("allowSelfApproval", v)} />
          <CheckItem label="Enable Escalation" checked={settings.enableEscalation} onChange={(v) => set("enableEscalation", v)} />
        </div>

        {/* Step 7: Test */}
        <SectionLabel>7. Test Workflow</SectionLabel>
        <button
          onClick={handleTestWorkflow}
          className="w-full flex items-center justify-center gap-2 text-sm font-medium bg-secondary hover:bg-secondary/80 text-foreground rounded-lg py-2.5 transition-colors"
        >
          <Play className="h-3.5 w-3.5" />
          Run Test Simulation
        </button>
        <p className="text-[10px] text-muted-foreground text-center">
          Create test documents to verify routing, assignees, timing, and escalation
        </p>

        {/* Step 8: Activate */}
        <SectionLabel>8. Activate</SectionLabel>

        <div className="flex items-center justify-between rounded-lg border-2 p-3 transition-colors"
          style={{ borderColor: settings.active ? 'hsl(var(--primary))' : 'hsl(var(--border))' }}>
          <div className="flex items-center gap-2">
            <div>
              <div className="flex items-center gap-2">
                <p className="text-sm font-medium text-foreground">Workflow Active</p>
                <Badge variant={settings.active ? "default" : "secondary"} className="text-[10px] h-5">
                  {settings.active ? "LIVE" : "DRAFT"}
                </Badge>
              </div>
              <p className="text-[10px] text-muted-foreground mt-0.5">
                {settings.active ? "This workflow is processing documents" : "Enable to start processing"}
              </p>
            </div>
          </div>
          <Switch checked={settings.active} onCheckedChange={(v) => set("active", v)} />
        </div>

        {settings.active && (
          <div className="space-y-2">
            <CheckItem
              label="Deactivate conflicting workflows"
              checked={settings.deactivateConflicting}
              onChange={(v) => set("deactivateConflicting", v)}
            />
            <CheckItem
              label="Notify team on activation"
              checked={settings.notifyOnActivation}
              onChange={(v) => set("notifyOnActivation", v)}
            />
          </div>
        )}

        {settings.active && !settings.name.trim() && (
          <div className="flex items-start gap-2 rounded-lg bg-destructive/10 p-3">
            <AlertTriangle className="h-4 w-4 text-destructive shrink-0 mt-0.5" />
            <p className="text-xs text-destructive">Workflow needs a name before it can be activated.</p>
          </div>
        )}
      </div>
    </div>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return <p className="text-xs font-semibold text-foreground pt-2 border-t border-border">{children}</p>;
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="text-xs font-medium text-muted-foreground mb-1.5 block">{label}</label>
      {children}
    </div>
  );
}

function CheckItem({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="flex items-center gap-2">
      <Checkbox checked={checked} onCheckedChange={onChange} />
      <Label className="text-sm font-normal text-foreground cursor-pointer">{label}</Label>
    </div>
  );
}
