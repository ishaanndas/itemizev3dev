import { memo } from "react";
import { Handle, Position, type NodeProps } from "@xyflow/react";
import { GitBranch } from "lucide-react";
import NodeAddButton from "./NodeAddButton";

function ConditionNode({ id, data, selected }: NodeProps) {
  const d = data as any;
  return (
    <div
      className={`group/node relative rounded-xl border-2 bg-card shadow-sm px-5 py-4 min-w-[220px] max-w-[260px] transition-shadow ${
        selected ? "shadow-md border-amber-500" : "border-amber-500/25"
      }`}
    >
      <Handle type="target" position={Position.Top} className="!w-3 !h-3 !bg-amber-500 !border-2 !border-background" />
      <div className="flex items-center gap-2.5 mb-2">
        <div className="h-7 w-7 rounded-lg bg-amber-500/10 flex items-center justify-center">
          <GitBranch className="h-3.5 w-3.5 text-amber-600" />
        </div>
        <span className="text-xs font-bold text-amber-600 uppercase tracking-wide">If</span>
      </div>
      <p className="text-sm font-semibold text-foreground">{d.label || "Check Condition"}</p>
      {d.rules && d.rules.length > 0 && (
        <div className="mt-2 space-y-1">
          {d.rules.map((rule: any, i: number) => (
            <span key={i} className="block text-[10px] px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-600 font-medium">
              {rule.field} {rule.operator} {rule.value}
            </span>
          ))}
        </div>
      )}
      <Handle type="source" position={Position.Bottom} id="yes" className="!w-3 !h-3 !bg-emerald-500 !border-2 !border-background !left-[35%]" />
      <Handle type="source" position={Position.Bottom} id="no" className="!w-3 !h-3 !bg-red-500 !border-2 !border-background !left-[65%]" />
      <NodeAddButton nodeId={id} position="bottom-left" sourceHandle="yes" />
      <NodeAddButton nodeId={id} position="bottom-right" sourceHandle="no" />
    </div>
  );
}

export default memo(ConditionNode);
