import { useState, useRef, useEffect } from "react";
import { Plus, UserCheck, GitBranch, Zap, CircleCheck } from "lucide-react";

interface NodeAddButtonProps {
  nodeId: string;
  position: "bottom" | "bottom-left" | "bottom-right";
  sourceHandle?: string;
}

const menuItems = [
  { type: "step", label: "Step", icon: UserCheck, color: "text-emerald-600" },
  { type: "condition", label: "Condition", icon: GitBranch, color: "text-amber-600" },
];

export default function NodeAddButton({ nodeId, position, sourceHandle }: NodeAddButtonProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as HTMLElement)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  const positionClass =
    position === "bottom-left"
      ? "left-[25%] -translate-x-1/2"
      : position === "bottom-right"
      ? "left-[75%] -translate-x-1/2"
      : "left-1/2 -translate-x-1/2";

  const handleAdd = (type: string) => {
    window.dispatchEvent(
      new CustomEvent("workflow:add-node", {
        detail: { type, sourceNodeId: nodeId, sourceHandle },
      })
    );
    setOpen(false);
  };

  return (
    <div ref={ref} className={`absolute -bottom-4 ${positionClass} z-10`}>
      <button
        onClick={(e) => {
          e.stopPropagation();
          setOpen(!open);
        }}
        className="h-7 w-7 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-md opacity-0 group-hover/node:opacity-100 hover:!opacity-100 hover:scale-110 transition-all"
      >
        <Plus className="h-3.5 w-3.5" />
      </button>

      {open && (
        <div className="absolute top-9 left-1/2 -translate-x-1/2 bg-popover border border-border rounded-lg shadow-lg py-1.5 min-w-[160px] z-50">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.type}
                onClick={(e) => {
                  e.stopPropagation();
                  handleAdd(item.type);
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-foreground hover:bg-accent transition-colors text-left"
              >
                <Icon className={`h-3.5 w-3.5 ${item.color}`} />
                {item.label}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
