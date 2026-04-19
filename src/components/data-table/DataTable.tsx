import { useState, useMemo, useRef, useEffect, ReactNode } from "react";
import {
  DndContext,
  PointerSensor,
  useSensor,
  useSensors,
  closestCenter,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  horizontalListSortingStrategy,
  useSortable,
  arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  Check,
  ChevronDown,
  ChevronsLeft,
  ChevronsRight,
  GripVertical,
  Pin,
  PinOff,
  RotateCcw,
  Settings2,
} from "lucide-react";
import { cn } from "@/lib/utils";

/* ---------------- Types ---------------- */
export interface DataTableColumn<T> {
  key: string;
  label: string;
  defaultVisible?: boolean;
  /** Render the cell. If editable=true and onCellSave is provided, the table renders an inline editor instead. */
  render?: (row: T, rowIndex: number) => ReactNode;
  /** Plain string accessor (used for inline editing default value when render is omitted) */
  accessor?: (row: T) => string;
  editable?: boolean;
  align?: "left" | "right" | "center";
  width?: string; // e.g. "w-32" or inline style
  className?: string;
}

export interface DataTableProps<T> {
  storageKey: string;
  columns: DataTableColumn<T>[];
  data: T[];
  rowKey: (row: T, index: number) => string | number;
  /** Right-side actions cell (sticky). */
  renderRowActions?: (row: T, rowIndex: number) => ReactNode;
  /** Inline cell editing (only when columns are editable=true). */
  onCellSave?: (rowIndex: number, columnKey: string, value: string) => void;
  /** Optional row click handler (skipped when clicking on inputs/buttons inside) */
  onRowClick?: (row: T, rowIndex: number) => void;
  /** Selection */
  selectable?: boolean;
  selectedRows?: Set<number>;
  onToggleRow?: (rowIndex: number) => void;
  onToggleAll?: () => void;
  /** Custom toolbar items rendered next to the column manager */
  toolbarLeft?: ReactNode;
  toolbarRight?: ReactNode;
  /** Empty state */
  emptyState?: ReactNode;
  /** Outer container className */
  className?: string;
}

/* ---------------- Persistence ---------------- */
interface ColumnState {
  order: string[];
  visible: string[];
  pinnedStart: string[];
  pinnedEnd: string[];
}

function loadState(key: string): ColumnState | null {
  try {
    const raw = localStorage.getItem(`dt:${key}`);
    return raw ? (JSON.parse(raw) as ColumnState) : null;
  } catch {
    return null;
  }
}

function saveState(key: string, state: ColumnState) {
  try {
    localStorage.setItem(`dt:${key}`, JSON.stringify(state));
  } catch {}
}

/* ---------------- Inline edit ---------------- */
function InlineEditCell({
  value,
  onCommit,
  align = "left",
}: {
  value: string;
  onCommit: (val: string) => void;
  align?: "left" | "right" | "center";
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => setDraft(value), [value]);
  useEffect(() => {
    if (editing) {
      inputRef.current?.focus();
      inputRef.current?.select();
    }
  }, [editing]);

  if (editing) {
    return (
      <input
        ref={inputRef}
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={() => {
          onCommit(draft);
          setEditing(false);
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            onCommit(draft);
            setEditing(false);
          } else if (e.key === "Escape") {
            setDraft(value);
            setEditing(false);
          }
        }}
        className={cn(
          "w-full min-w-[60px] px-2 py-1 text-sm rounded border-2 border-primary bg-background text-foreground outline-none",
          align === "right" && "text-right tabular-nums",
          align === "center" && "text-center",
        )}
      />
    );
  }

  return (
    <div
      className={cn(
        "cursor-text rounded px-1.5 py-0.5 -mx-1.5 -my-0.5 hover:bg-primary/5 transition-colors text-foreground",
        align === "right" && "text-right tabular-nums",
        align === "center" && "text-center",
      )}
      onClick={(e) => {
        e.stopPropagation();
        setEditing(true);
      }}
    >
      {value || <span className="text-muted-foreground">—</span>}
    </div>
  );
}

/* ---------------- Column manager popover ---------------- */
function ColumnManager({
  columns,
  state,
  onToggleVisible,
  onPinStart,
  onPinEnd,
  onUnpin,
  onReset,
  onReorder,
}: {
  columns: DataTableColumn<unknown>[];
  state: ColumnState;
  onToggleVisible: (key: string) => void;
  onPinStart: (key: string) => void;
  onPinEnd: (key: string) => void;
  onUnpin: (key: string) => void;
  onReset: () => void;
  onReorder: (from: number, to: number) => void;
}) {
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

  const ordered = state.order
    .map((k) => columns.find((c) => c.key === k))
    .filter(Boolean) as DataTableColumn<unknown>[];

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 text-sm font-medium border border-border rounded-lg px-3.5 py-2 hover:bg-secondary transition-colors text-foreground"
      >
        <Settings2 className="h-3.5 w-3.5 text-muted-foreground" />
        Columns
        <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
      </button>
      {open && (
        <div className="absolute right-0 top-full mt-1 w-80 bg-card rounded-xl shadow-xl border border-border overflow-hidden z-50">
          <div className="px-3 py-2 border-b border-border flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Manage columns</span>
            <span className="text-[10px] text-muted-foreground">Drag to reorder</span>
          </div>
          <div className="max-h-96 overflow-y-auto py-1">
            {ordered.map((col, idx) => {
              const visible = state.visible.includes(col.key);
              const pinnedStart = state.pinnedStart.includes(col.key);
              const pinnedEnd = state.pinnedEnd.includes(col.key);
              return (
                <div
                  key={col.key}
                  draggable
                  onDragStart={(e) => e.dataTransfer.setData("text/plain", String(idx))}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => {
                    e.preventDefault();
                    const from = parseInt(e.dataTransfer.getData("text/plain"), 10);
                    if (!Number.isNaN(from) && from !== idx) onReorder(from, idx);
                  }}
                  className="group flex items-center gap-2 px-3 py-1.5 hover:bg-secondary/60 transition-colors"
                >
                  <GripVertical className="h-3.5 w-3.5 text-muted-foreground/40 cursor-grab shrink-0" />
                  <button
                    onClick={() => onToggleVisible(col.key)}
                    className="flex items-center gap-2 flex-1 min-w-0 text-left"
                  >
                    <div
                      className={cn(
                        "h-4 w-4 rounded border-2 flex items-center justify-center shrink-0 transition-colors",
                        visible ? "bg-primary border-primary" : "border-border",
                      )}
                    >
                      {visible && <Check className="h-3 w-3 text-primary-foreground" />}
                    </div>
                    <span className="text-sm text-foreground truncate">{col.label}</span>
                  </button>
                  <div className="flex items-center gap-0.5 shrink-0">
                    <button
                      onClick={() => (pinnedStart ? onUnpin(col.key) : onPinStart(col.key))}
                      title={pinnedStart ? "Unpin from start" : "Pin to start"}
                      className={cn(
                        "h-6 w-6 rounded flex items-center justify-center transition-colors",
                        pinnedStart
                          ? "bg-primary/10 text-primary"
                          : "text-muted-foreground/60 hover:bg-secondary hover:text-foreground",
                      )}
                    >
                      <ChevronsLeft className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => (pinnedEnd ? onUnpin(col.key) : onPinEnd(col.key))}
                      title={pinnedEnd ? "Unpin from end" : "Pin to end"}
                      className={cn(
                        "h-6 w-6 rounded flex items-center justify-center transition-colors",
                        pinnedEnd
                          ? "bg-primary/10 text-primary"
                          : "text-muted-foreground/60 hover:bg-secondary hover:text-foreground",
                      )}
                    >
                      <ChevronsRight className="h-3.5 w-3.5" />
                    </button>
                    {(pinnedStart || pinnedEnd) && (
                      <button
                        onClick={() => onUnpin(col.key)}
                        title="Unpin"
                        className="h-6 w-6 rounded flex items-center justify-center text-muted-foreground/60 hover:bg-secondary hover:text-foreground"
                      >
                        <PinOff className="h-3 w-3" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
          <div className="border-t border-border p-2">
            <button
              onClick={onReset}
              className="w-full flex items-center justify-center gap-2 text-sm font-medium text-primary hover:bg-primary/5 rounded-lg px-3 py-2 transition-colors"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              Reset to default
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

/* ---------------- Sortable header ---------------- */
function SortableHeader({
  id,
  label,
  align = "left",
  pinned,
  isLast,
}: {
  id: string;
  label: ReactNode;
  align?: "left" | "right" | "center";
  pinned: "start" | "end" | null;
  isLast: boolean;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });
  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  };
  return (
    <th
      ref={setNodeRef}
      style={style}
      className={cn(
        "group/th relative py-3 px-3 text-xs font-medium text-muted-foreground uppercase tracking-wider whitespace-nowrap select-none bg-secondary/60 border-b border-border",
        !isLast && "border-r border-border/40",
        align === "right" && "text-right",
        align === "center" && "text-center",
        align === "left" && "text-left",
      )}
    >
      <div
        className={cn(
          "flex items-center gap-1.5",
          align === "right" && "justify-end",
          align === "center" && "justify-center",
        )}
      >
        {/* Drag handle — always visible to indicate draggability */}
        <button
          {...attributes}
          {...listeners}
          aria-label="Drag to reorder column"
          title="Drag to reorder"
          className={cn(
            "cursor-grab active:cursor-grabbing rounded p-0.5 text-muted-foreground/50 hover:text-foreground hover:bg-secondary transition-colors shrink-0",
            isDragging && "cursor-grabbing",
          )}
        >
          <GripVertical className="h-3.5 w-3.5" />
        </button>

        <span className="flex-1 truncate">{label}</span>

        {/* Reserved-space pin slot — prevents layout shift */}
        <span className="inline-flex items-center justify-center w-3 h-3 shrink-0">
          {pinned && (
            <Pin
              className={cn(
                "h-3 w-3 text-primary",
                pinned === "start" ? "-rotate-45" : "rotate-45",
              )}
            />
          )}
        </span>
      </div>
    </th>
  );
}

/* ---------------- Main DataTable ---------------- */
export function DataTable<T>({
  storageKey,
  columns,
  data,
  rowKey,
  renderRowActions,
  onCellSave,
  onRowClick,
  selectable = false,
  selectedRows,
  onToggleRow,
  onToggleAll,
  toolbarLeft,
  toolbarRight,
  emptyState,
  className,
}: DataTableProps<T>) {
  const defaultState = useMemo<ColumnState>(
    () => ({
      order: columns.map((c) => c.key),
      visible: columns.filter((c) => c.defaultVisible !== false).map((c) => c.key),
      pinnedStart: [],
      pinnedEnd: [],
    }),
    [columns],
  );

  const [state, setState] = useState<ColumnState>(() => loadState(storageKey) ?? defaultState);

  useEffect(() => {
    saveState(storageKey, state);
  }, [storageKey, state]);

  const updateState = (updater: (s: ColumnState) => ColumnState) => setState((s) => updater(s));

  const toggleVisible = (key: string) =>
    updateState((s) => ({
      ...s,
      visible: s.visible.includes(key) ? s.visible.filter((k) => k !== key) : [...s.visible, key],
    }));

  const pinStart = (key: string) =>
    updateState((s) => ({
      ...s,
      pinnedStart: [...s.pinnedStart.filter((k) => k !== key), key],
      pinnedEnd: s.pinnedEnd.filter((k) => k !== key),
    }));

  const pinEnd = (key: string) =>
    updateState((s) => ({
      ...s,
      pinnedEnd: [...s.pinnedEnd.filter((k) => k !== key), key],
      pinnedStart: s.pinnedStart.filter((k) => k !== key),
    }));

  const unpin = (key: string) =>
    updateState((s) => ({
      ...s,
      pinnedStart: s.pinnedStart.filter((k) => k !== key),
      pinnedEnd: s.pinnedEnd.filter((k) => k !== key),
    }));

  const reset = () => setState(defaultState);

  const reorder = (from: number, to: number) =>
    updateState((s) => ({ ...s, order: arrayMove(s.order, from, to) }));

  // Build effective column order: pinnedStart first, then ordered (excluding pinned), then pinnedEnd
  const orderedKeys = useMemo(() => {
    const middle = state.order.filter(
      (k) => !state.pinnedStart.includes(k) && !state.pinnedEnd.includes(k),
    );
    return [...state.pinnedStart, ...middle, ...state.pinnedEnd];
  }, [state]);

  const visibleCols = useMemo(
    () =>
      orderedKeys
        .filter((k) => state.visible.includes(k))
        .map((k) => columns.find((c) => c.key === k))
        .filter(Boolean) as DataTableColumn<T>[],
    [orderedKeys, state.visible, columns],
  );

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }));

  const handleHeaderDragEnd = (e: DragEndEvent) => {
    const { active, over } = e;
    if (!over || active.id === over.id) return;
    const fromKey = String(active.id);
    const toKey = String(over.id);
    // Only allow reorder within the same pin group
    const inStart = state.pinnedStart.includes(fromKey) && state.pinnedStart.includes(toKey);
    const inEnd = state.pinnedEnd.includes(fromKey) && state.pinnedEnd.includes(toKey);
    const inMiddle =
      !state.pinnedStart.includes(fromKey) &&
      !state.pinnedEnd.includes(fromKey) &&
      !state.pinnedStart.includes(toKey) &&
      !state.pinnedEnd.includes(toKey);
    if (!inStart && !inEnd && !inMiddle) return;
    const from = state.order.indexOf(fromKey);
    const to = state.order.indexOf(toKey);
    if (from < 0 || to < 0) return;
    reorder(from, to);
  };

  const allSelected = selectable && selectedRows && data.length > 0 && selectedRows.size === data.length;

  return (
    <div className={cn("space-y-3", className)}>
      {/* Toolbar */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">{toolbarLeft}</div>
        <div className="flex items-center gap-2">
          {toolbarRight}
          <ColumnManager
            columns={columns as DataTableColumn<unknown>[]}
            state={state}
            onToggleVisible={toggleVisible}
            onPinStart={pinStart}
            onPinEnd={pinEnd}
            onUnpin={unpin}
            onReset={reset}
            onReorder={reorder}
          />
        </div>
      </div>

      {/* Table */}
      <div className="relative overflow-x-auto border border-border rounded-lg bg-card">
        <table
          className="w-full text-sm border-collapse"
          style={{ minWidth: `${visibleCols.length * 150 + (selectable ? 60 : 0) + (renderRowActions ? 140 : 0)}px` }}
        >
          <thead>
            <tr>
              {selectable && (
                <th className="sticky left-0 z-30 bg-secondary py-3 px-3 text-left w-10 border-b border-r border-border">
                  <input
                    type="checkbox"
                    checked={!!allSelected}
                    onChange={onToggleAll}
                    className="h-4 w-4 rounded border-border text-primary accent-primary"
                  />
                </th>
              )}
              <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleHeaderDragEnd}>
                <SortableContext items={visibleCols.map((c) => c.key)} strategy={horizontalListSortingStrategy}>
                  {visibleCols.map((col, idx) => {
                    const pinned: "start" | "end" | null = state.pinnedStart.includes(col.key)
                      ? "start"
                      : state.pinnedEnd.includes(col.key)
                        ? "end"
                        : null;
                    return (
                      <SortableHeader
                        key={col.key}
                        id={col.key}
                        label={col.label}
                        align={col.align}
                        pinned={pinned}
                        isLast={idx === visibleCols.length - 1 && !renderRowActions}
                        onPinStart={() => pinStart(col.key)}
                        onPinEnd={() => pinEnd(col.key)}
                        onUnpin={() => unpin(col.key)}
                      />
                    );
                  })}
                </SortableContext>
              </DndContext>
              {renderRowActions && (
                <th className="sticky right-0 z-30 bg-secondary py-3 px-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider border-b border-l border-border whitespace-nowrap">
                  Actions
                </th>
              )}
            </tr>
          </thead>
          <tbody>
            {data.length === 0 ? (
              <tr>
                <td
                  colSpan={visibleCols.length + (selectable ? 1 : 0) + (renderRowActions ? 1 : 0)}
                  className="px-4 py-12 text-center text-sm text-muted-foreground bg-card"
                >
                  {emptyState ?? "No records to display"}
                </td>
              </tr>
            ) : (
              data.map((row, i) => {
                // Use OPAQUE backgrounds so sticky cells don't bleed
                const isSelected = !!selectedRows?.has(i);
                const rowBgClass = isSelected
                  ? "bg-[hsl(var(--primary)/0.06)]"
                  : i % 2 === 0
                    ? "bg-card"
                    : "bg-secondary/40";
                // For sticky cells we need a fully opaque match
                const stickyBgClass = isSelected
                  ? "bg-[hsl(var(--primary)/0.06)]"
                  : i % 2 === 0
                    ? "bg-card"
                    : "bg-[hsl(var(--secondary))]";
                return (
                  <tr
                    key={rowKey(row, i)}
                    className={cn(
                      "group/row border-b border-border last:border-b-0",
                      onRowClick && "cursor-pointer",
                    )}
                    onClick={(e) => {
                      const target = e.target as HTMLElement;
                      if (target.closest("input, button, a, [data-no-row-click]")) return;
                      onRowClick?.(row, i);
                    }}
                  >
                    {selectable && (
                      <td
                        className={cn(
                          "sticky left-0 z-20 py-3.5 px-3 border-r border-border transition-colors",
                          stickyBgClass,
                          "group-hover/row:bg-[hsl(var(--secondary))]",
                        )}
                      >
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => onToggleRow?.(i)}
                          className="h-4 w-4 rounded border-border text-primary accent-primary"
                        />
                      </td>
                    )}
                    {visibleCols.map((col, idx) => {
                      const isLastBeforeActions = idx === visibleCols.length - 1;
                      const value = col.accessor ? col.accessor(row) : "";
                      return (
                        <td
                          key={col.key}
                          className={cn(
                            "py-3.5 px-3 whitespace-nowrap transition-colors",
                            rowBgClass,
                            "group-hover/row:bg-[hsl(var(--secondary))]",
                            !isLastBeforeActions && "border-r border-border/40",
                            col.align === "right" && "text-right tabular-nums",
                            col.align === "center" && "text-center",
                            col.className,
                          )}
                        >
                          {col.editable && onCellSave ? (
                            <InlineEditCell
                              value={col.render ? "" : value}
                              align={col.align}
                              onCommit={(val) => onCellSave(i, col.key, val)}
                            />
                          ) : col.render ? (
                            col.render(row, i)
                          ) : (
                            <span className="text-foreground">{value || "—"}</span>
                          )}
                        </td>
                      );
                    })}
                    {renderRowActions && (
                      <td
                        className={cn(
                          "sticky right-0 z-20 py-3.5 px-3 border-l border-border transition-colors",
                          stickyBgClass,
                          "group-hover/row:bg-[hsl(var(--secondary))]",
                          "shadow-[-8px_0_8px_-8px_hsl(var(--border))]",
                        )}
                        data-no-row-click
                      >
                        <div className="flex items-center justify-end gap-1.5">{renderRowActions(row, i)}</div>
                      </td>
                    )}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
