import { ReactNode } from "react";
import { Check, Eye, MoreHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

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
 * The "More" menu uses Radix DropdownMenu so it renders in a portal
 * and is never clipped by table overflow.
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
  // Split destructive items so we can put them under a separator
  const normal = items.filter((i) => !i.destructive);
  const destructive = items.filter((i) => i.destructive);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          title="More actions"
          aria-label="More actions"
          onClick={(e) => e.stopPropagation()}
          className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
        >
          <MoreHorizontal className="h-3.5 w-3.5" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" sideOffset={4} className="w-48 z-[60]">
        {normal.map((item, i) => (
          <DropdownMenuItem
            key={`n-${i}`}
            onClick={(e) => {
              e.stopPropagation();
              item.onClick();
            }}
          >
            {item.icon && <span className="opacity-70">{item.icon}</span>}
            <span className="truncate">{item.label}</span>
          </DropdownMenuItem>
        ))}
        {destructive.length > 0 && normal.length > 0 && <DropdownMenuSeparator />}
        {destructive.map((item, i) => (
          <DropdownMenuItem
            key={`d-${i}`}
            onClick={(e) => {
              e.stopPropagation();
              item.onClick();
            }}
            className="text-destructive focus:text-destructive"
          >
            {item.icon && <span className="opacity-70">{item.icon}</span>}
            <span className="truncate">{item.label}</span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
