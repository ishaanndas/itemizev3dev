import { ReactNode, useEffect, useRef, useState } from "react";
import { Check, Eye, MoreHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";

export interface RowActionItem {
  label: string;
  onClick: () => void;
  icon?: ReactNode;
  destructive?: boolean;
}

interface RowActionsProps {
  /** Optional primary "approve & next" style action — rendered as a filled icon button. */
  primary?: { label: string; onClick: () => void; icon?: ReactNode };
  /** Optional review/view action — rendered as an outlined icon button. */
  review?: { label: string; onClick: () => void; icon?: ReactNode };
  /** Items shown in the overflow ⋯ menu. */
  more?: RowActionItem[];
}

/**
 * Compact, icon-only row actions used across all DataTables.
 * Keeps the actions cell narrow & uniform so the sticky column stays
 * visually aligned with the "Actions" header.
 */
export default function RowActions({ primary, review, more }: RowActionsProps) {
  return (
    <div className="flex items-center justify-end gap-1" data-no-row-click>
      {review && (
        <IconButton
          title={review.label}
          onClick={review.onClick}
          variant="ghost"
        >
          {review.icon ?? <Eye className="h-3.5 w-3.5" />}
        </IconButton>
      )}
      {primary && (
        <IconButton
          title={primary.label}
          onClick={primary.onClick}
          variant="primary"
        >
          {primary.icon ?? <Check className="h-3.5 w-3.5" />}
        </IconButton>
      )}
      {more && more.length > 0 && <MoreMenu items={more} />}
    </div>
  );
}

function IconButton({
  title,
  onClick,
  variant,
  children,
}: {
  title: string;
  onClick: () => void;
  variant: "primary" | "ghost";
  children: ReactNode;
}) {
  return (
    <button
      title={title}
      aria-label={title}
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      className={cn(
        "h-7 w-7 rounded-md flex items-center justify-center transition-colors shrink-0",
        variant === "primary"
          ? "bg-primary text-primary-foreground hover:bg-primary/90"
          : "text-muted-foreground hover:text-foreground hover:bg-secondary border border-border",
      )}
    >
      {children}
    </button>
  );
}

function MoreMenu({ items }: { items: RowActionItem[] }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  return (
    <div className="relative" ref={ref}>
      <button
        title="More actions"
        aria-label="More actions"
        onClick={(e) => {
          e.stopPropagation();
          setOpen((v) => !v);
        }}
        className="h-7 w-7 rounded-md flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors shrink-0"
      >
        <MoreHorizontal className="h-3.5 w-3.5" />
      </button>
      {open && (
        <div className="absolute right-0 top-full mt-1 w-44 bg-card rounded-lg shadow-xl border border-border overflow-hidden z-50 py-1">
          {items.map((item, i) => (
            <button
              key={i}
              onClick={(e) => {
                e.stopPropagation();
                setOpen(false);
                item.onClick();
              }}
              className={cn(
                "w-full flex items-center gap-2 px-3 py-2 text-sm text-left transition-colors",
                item.destructive
                  ? "text-destructive hover:bg-destructive/10"
                  : "text-foreground hover:bg-secondary",
              )}
            >
              {item.icon && <span className="shrink-0 opacity-70">{item.icon}</span>}
              <span className="truncate">{item.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
