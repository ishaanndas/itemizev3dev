import { memo } from "react";
import { Handle, Position, type NodeProps } from "@xyflow/react";
import { UserCheck } from "lucide-react";
import NodeAddButton from "./NodeAddButton";

function ApprovalNode({ id, data, selected }: NodeProps) {
  const d = data as any;
  return (
    <div
      className={`group/node relative rounded-xl border-2 bg-card shadow-sm px-5 py-4 min-w-[220px] max-w-[260px] transition-shadow ${
        selected ? "shadow-md border-emerald-500" : "border-emerald-500/25"
      }`}
    >
      <Handle type="target" position={Position.Top} className="!w-3 !h-3 !bg-emerald-500 !border-2 !border-background" />
      <div className="flex items-center gap-2.5 mb-2">
        <div className="h-7 w-7 rounded-lg bg-emerald-500/10 flex items-center justify-center">
          <UserCheck className="h-3.5 w-3.5 text-emerald-600" />
        </div>
        <span className="text-xs font-bold text-emerald-600 uppercase tracking-wide">Approve</span>
      </div>
      <p className="text-sm font-semibold text-foreground">{d.label || "Approval Step"}</p>
      {d.assignee && (
        <div className="mt-2 flex items-center gap-1.5">
          <span className="text-[10px] px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-600 font-medium">
            {d.assignee}
          </span>
        </div>
      )}
      {d.description && <p className="text-[11px] text-muted-foreground mt-1.5">{d.description}</p>}
      <Handle type="source" position={Position.Bottom} className="!w-3 !h-3 !bg-emerald-500 !border-2 !border-background" />
      <NodeAddButton nodeId={id} position="bottom" />
    </div>
  );
}

export default memo(ApprovalNode);
