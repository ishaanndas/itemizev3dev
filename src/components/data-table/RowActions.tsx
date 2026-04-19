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
  primary?: { label: string; onClick: () => void; icon?: ReactNode };
  review?: { label: string; onClick: () => void; icon?: ReactNode };
  more?: RowActionItem[];
}

/**
 * Compact, icon-only row actions used by every DataTable.
 * Renders inline so it sits perfectly inside the centered Actions column.
 */
export default function RowActions({ primary, review, more }: RowActionsProps) {
  return (
    <div className="inline-flex items-center gap-1" data-no-row-click>
      {review && (
        <IconButton title={review.label} onClick={review.onClick} variant="ghost">
          {review.icon ?? <Eye className="h-3.5 w-3.5" />}
        </IconButton>
      )}
      {primary && (
        <IconButton title={primary.label} onClick={primary.onClick} variant="primary">
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
        "inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-md transition-colors",
        variant === "primary"
          ? "bg-primary text-primary-foreground hover:bg-primary/90"
          : "border border-border text-muted-foreground hover:bg-secondary hover:text-foreground",
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
    <div className="relative inline-flex" ref={ref}>
      <button
        title="More actions"
        aria-label="More actions"
        onClick={(e) => {
          e.stopPropagation();
          setOpen((v) => !v);
        }}
        className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
      >
        <MoreHorizontal className="h-3.5 w-3.5" />
      </button>
      {open && (
        <div className="absolute right-0 top-full z-50 mt-1 w-44 overflow-hidden rounded-lg border border-border bg-card py-1 shadow-xl">
          {items.map((item, i) => (
            <button
              key={i}
              onClick={(e) => {
                e.stopPropagation();
                setOpen(false);
                item.onClick();
              }}
              className={cn(
                "flex w-full items-center gap-2 px-3 py-2 text-left text-sm transition-colors",
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
