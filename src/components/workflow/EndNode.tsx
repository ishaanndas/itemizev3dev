import { memo } from "react";
import { Handle, Position, type NodeProps } from "@xyflow/react";
import { CircleCheck } from "lucide-react";

function EndNode({ data, selected }: NodeProps) {
  return (
    <div
      className={`rounded-xl border-2 bg-card shadow-sm px-5 py-4 min-w-[180px] max-w-[220px] transition-shadow ${
        selected ? "shadow-md border-muted-foreground" : "border-border"
      }`}
    >
      <Handle type="target" position={Position.Top} className="!w-3 !h-3 !bg-muted-foreground !border-2 !border-background" />
      <div className="flex items-center gap-2.5">
        <div className="h-7 w-7 rounded-lg bg-muted flex items-center justify-center">
          <CircleCheck className="h-3.5 w-3.5 text-muted-foreground" />
        </div>
        <div>
          <span className="text-xs font-bold text-muted-foreground uppercase tracking-wide">End</span>
          <p className="text-sm font-semibold text-foreground">{(data as any).label || "Complete"}</p>
        </div>
      </div>
    </div>
  );
}

export default memo(EndNode);
