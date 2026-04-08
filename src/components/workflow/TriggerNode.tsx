import { memo } from "react";
import { Handle, Position, type NodeProps } from "@xyflow/react";
import { FileInput } from "lucide-react";
import NodeAddButton from "./NodeAddButton";

const objectLabels: Record<string, string> = {
  invoice: "Invoice",
  purchase_order: "Purchase Order",
  supplier_request: "Supplier Request",
  receipt: "Receipt",
  credit_memo: "Credit Memo",
  expense_report: "Expense Report",
};

function TriggerNode({ id, data, selected }: NodeProps) {
  const d = data as any;
  const objectType = objectLabels[d.objectType] || null;
  return (
    <div
      className={`group/node relative rounded-xl border-2 bg-card shadow-sm px-5 py-4 min-w-[220px] max-w-[260px] transition-shadow ${
        selected ? "shadow-md border-primary" : "border-primary/25"
      }`}
    >
      <div className="flex items-center gap-2.5 mb-2">
        <div className="h-7 w-7 rounded-lg bg-primary/10 flex items-center justify-center">
          <FileInput className="h-3.5 w-3.5 text-primary" />
        </div>
        <span className="text-xs font-bold text-primary uppercase tracking-wide">When</span>
      </div>
      <p className="text-sm font-semibold text-foreground">{d.label || "Document Received"}</p>
      {objectType && (
        <span className="mt-1.5 inline-block text-[10px] px-2 py-0.5 rounded-md bg-primary/10 text-primary font-medium">
          {objectType}
        </span>
      )}
      {d.description && (
        <p className="text-[11px] text-muted-foreground mt-1">{d.description}</p>
      )}
      <Handle type="source" position={Position.Bottom} className="!w-3 !h-3 !bg-primary !border-2 !border-background" />
      <NodeAddButton nodeId={id} position="bottom" />
    </div>
  );
}

export default memo(TriggerNode);
