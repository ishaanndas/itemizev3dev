import { memo } from "react";
import { Handle, Position, type NodeProps } from "@xyflow/react";
import { UserCheck, Zap, CircleCheck, Mail, RefreshCw } from "lucide-react";
import NodeAddButton from "./NodeAddButton";

const stepModes = {
  approval: { icon: UserCheck, label: "Approve", color: "emerald" },
  auto_approve: { icon: Zap, label: "Auto-Approve", color: "primary" },
  notify: { icon: Mail, label: "Notify", color: "primary" },
  update_status: { icon: RefreshCw, label: "Update Status", color: "primary" },
  end: { icon: CircleCheck, label: "End", color: "muted" },
};

type StepMode = keyof typeof stepModes;

const colorMap: Record<string, { border: string; borderSelected: string; bg: string; text: string; handle: string }> = {
  emerald: {
    border: "border-emerald-500/25",
    borderSelected: "border-emerald-500",
    bg: "bg-emerald-500/10",
    text: "text-emerald-600",
    handle: "!bg-emerald-500",
  },
  primary: {
    border: "border-primary/25",
    borderSelected: "border-primary",
    bg: "bg-primary/10",
    text: "text-primary",
    handle: "!bg-primary",
  },
  muted: {
    border: "border-border",
    borderSelected: "border-muted-foreground",
    bg: "bg-muted",
    text: "text-muted-foreground",
    handle: "!bg-muted-foreground",
  },
};

function StepNode({ id, data, selected }: NodeProps) {
  const d = data as any;
  const mode: StepMode = d.stepMode || "approval";
  const config = stepModes[mode] || stepModes.approval;
  const colors = colorMap[config.color] || colorMap.primary;
  const Icon = config.icon;
  const isEnd = mode === "end";

  return (
    <div
      className={`group/node relative rounded-xl border-2 bg-card shadow-sm px-5 py-4 min-w-[220px] max-w-[260px] transition-shadow ${
        selected ? `shadow-md ${colors.borderSelected}` : colors.border
      }`}
    >
      <Handle type="target" position={Position.Top} className={`!w-3 !h-3 ${colors.handle} !border-2 !border-background`} />
      <div className="flex items-center gap-2.5 mb-2">
        <div className={`h-7 w-7 rounded-lg ${colors.bg} flex items-center justify-center`}>
          <Icon className={`h-3.5 w-3.5 ${colors.text}`} />
        </div>
        <span className={`text-xs font-bold ${colors.text} uppercase tracking-wide`}>{config.label}</span>
      </div>
      <p className="text-sm font-semibold text-foreground">{d.label || "Step"}</p>
      {d.assignee && mode === "approval" && (
        <div className="mt-2 flex items-center gap-1.5">
          <span className={`text-[10px] px-2 py-0.5 rounded-md ${colors.bg} ${colors.text} font-medium`}>
            {d.assignee}
          </span>
        </div>
      )}
      {d.description && <p className="text-[11px] text-muted-foreground mt-1.5">{d.description}</p>}
      {!isEnd && (
        <>
          <Handle type="source" position={Position.Bottom} className={`!w-3 !h-3 ${colors.handle} !border-2 !border-background`} />
          <NodeAddButton nodeId={id} position="bottom" />
        </>
      )}
    </div>
  );
}

export default memo(StepNode);
