import { ReactNode, useEffect, useMemo, useRef, useState } from "react";
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

const DEFAULT_COLUMN_WIDTH = 160;
const SELECT_COLUMN_WIDTH = 44;
const ACTIONS_COLUMN_WIDTH = 132;

export interface DataTableColumn<T> {
  key: string;
  label: string;
  defaultVisible?: boolean;
  render?: (row: T, rowIndex: number) => ReactNode;
  accessor?: (row: T) => string;
  editable?: boolean;
  align?: "left" | "right" | "center";
  width?: number | string;
  className?: string;
}

export interface DataTableProps<T> {
  storageKey: string;
  columns: DataTableColumn<T>[];
  data: T[];
  rowKey: (row: T, index: number) => string | number;
  renderRowActions?: (row: T, rowIndex: number) => ReactNode;
  onCellSave?: (rowIndex: number, columnKey: string, value: string) => void;
  onRowClick?: (row: T, rowIndex: number) => void;
  selectable?: boolean;
  selectedRows?: Set<number>;
  onToggleRow?: (rowIndex: number) => void;
  onToggleAll?: () => void;
  toolbarLeft?: ReactNode;
  toolbarRight?: ReactNode;
  emptyState?: ReactNode;
  className?: string;
}

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

function unique(items: string[]) {
  return [...new Set(items)];
}

function arraysEqual(a: string[], b: string[]) {
  return a.length === b.length && a.every((item, index) => item === b[index]);
}

function sanitizeState(state: ColumnState, defaultState: ColumnState, validKeys: string[]): ColumnState {
  const validSet = new Set(validKeys);
  const ordered = unique([...state.order.filter((key) => validSet.has(key)), ...validKeys]);
  const visible = unique([
    ...state.visible.filter((key) => validSet.has(key)),
    ...defaultState.visible.filter((key) => !state.visible.includes(key) && validSet.has(key)),
  ]);
  const pinnedStart = unique(state.pinnedStart.filter((key) => validSet.has(key)));
  const pinnedEnd = unique(
    state.pinnedEnd.filter((key) => validSet.has(key) && !pinnedStart.includes(key)),
  );

  return {
    order: ordered,
    visible,
    pinnedStart,
    pinnedEnd,
  };
}

function getWidthValue(width?: number | string) {
  if (typeof width === "number") return width;
  return DEFAULT_COLUMN_WIDTH;
}

function getWidthStyle(width?: number | string) {
  if (typeof width === "number") return { width, minWidth: width };
  if (typeof width === "string") return { width, minWidth: width };
  return { width: DEFAULT_COLUMN_WIDTH, minWidth: DEFAULT_COLUMN_WIDTH };
}

function getStickyStyle<T>(
  key: string,
  pinned: "start" | "end" | null,
  visibleColumns: DataTableColumn<T>[],
  state: ColumnState,
  selectable: boolean,
  hasActions: boolean,
): React.CSSProperties | undefined {
  if (!pinned) return undefined;

  if (pinned === "start") {
    let offset = selectable ? SELECT_COLUMN_WIDTH : 0;
    for (const col of visibleColumns) {
      if (col.key === key) break;
      if (state.pinnedStart.includes(col.key)) {
        offset += getWidthValue(col.width);
      }
    }
    return { left: offset, boxShadow: "1px 0 0 0 hsl(var(--border))" };
  }

  let offset = hasActions ? ACTIONS_COLUMN_WIDTH : 0;
  for (let i = visibleColumns.length - 1; i >= 0; i--) {
    const col = visibleColumns[i];
    if (col.key === key) break;
    if (state.pinnedEnd.includes(col.key)) {
      offset += getWidthValue(col.width);
    }
  }
  return { right: offset, boxShadow: "-1px 0 0 0 hsl(var(--border))" };
}

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
          }
          if (e.key === "Escape") {
            setDraft(value);
            setEditing(false);
          }
        }}
        className={cn(
          "w-full rounded-md border border-primary/40 bg-background px-2 py-1 text-sm text-foreground outline-none ring-2 ring-primary/10",
          align === "right" && "text-right tabular-nums",
          align === "center" && "text-center",
        )}
      />
    );
  }

  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        setEditing(true);
      }}
      className={cn(
        "w-full rounded px-1.5 py-0.5 text-left text-foreground transition-colors hover:bg-secondary",
        align === "right" && "text-right tabular-nums",
        align === "center" && "text-center",
      )}
    >
      {value || <span className="text-muted-foreground">—</span>}
    </button>
  );
}

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

  const orderedColumns = state.order
    .map((key) => columns.find((col) => col.key === key))
    .filter(Boolean) as DataTableColumn<unknown>[];

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((value) => !value)}
        className="flex items-center gap-2 rounded-lg border border-border px-3.5 py-2 text-sm font-medium text-foreground transition-colors hover:bg-secondary"
      >
        <Settings2 className="h-3.5 w-3.5 text-muted-foreground" />
        Columns
        <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
      </button>

      {open && (
        <div className="absolute right-0 top-full z-50 mt-1 w-80 overflow-hidden rounded-xl border border-border bg-card shadow-xl">
          <div className="flex items-center justify-between border-b border-border px-3 py-2">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              Manage columns
            </span>
            <span className="text-[10px] text-muted-foreground">Drag to reorder</span>
          </div>

          <div className="max-h-96 overflow-y-auto py-1">
            {orderedColumns.map((col, index) => {
              const visible = state.visible.includes(col.key);
              const pinnedStart = state.pinnedStart.includes(col.key);
              const pinnedEnd = state.pinnedEnd.includes(col.key);

              return (
                <div
                  key={col.key}
                  draggable
                  onDragStart={(e) => e.dataTransfer.setData("text/plain", String(index))}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => {
                    e.preventDefault();
                    const from = parseInt(e.dataTransfer.getData("text/plain"), 10);
                    if (!Number.isNaN(from) && from !== index) onReorder(from, index);
                  }}
                  className="group flex items-center gap-2 px-3 py-1.5 transition-colors hover:bg-secondary/70"
                >
                  <GripVertical className="h-3.5 w-3.5 shrink-0 cursor-grab text-muted-foreground/50" />

                  <button
                    onClick={() => onToggleVisible(col.key)}
                    className="flex min-w-0 flex-1 items-center gap-2 text-left"
                  >
                    <span
                      className={cn(
                        "flex h-4 w-4 shrink-0 items-center justify-center rounded border-2 transition-colors",
                        visible ? "border-primary bg-primary" : "border-border",
                      )}
                    >
                      {visible && <Check className="h-3 w-3 text-primary-foreground" />}
                    </span>
                    <span className="truncate text-sm text-foreground">{col.label}</span>
                  </button>

                  <div className="flex shrink-0 items-center gap-0.5">
                    <button
                      onClick={() => (pinnedStart ? onUnpin(col.key) : onPinStart(col.key))}
                      title={pinnedStart ? "Remove beginning pin" : "Move to beginning"}
                      className={cn(
                        "flex h-6 w-6 items-center justify-center rounded transition-colors",
                        pinnedStart
                          ? "bg-primary/10 text-primary"
                          : "text-muted-foreground hover:bg-secondary hover:text-foreground",
                      )}
                    >
                      <ChevronsLeft className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => (pinnedEnd ? onUnpin(col.key) : onPinEnd(col.key))}
                      title={pinnedEnd ? "Remove end pin" : "Move to end"}
                      className={cn(
                        "flex h-6 w-6 items-center justify-center rounded transition-colors",
                        pinnedEnd
                          ? "bg-primary/10 text-primary"
                          : "text-muted-foreground hover:bg-secondary hover:text-foreground",
                      )}
                    >
                      <ChevronsRight className="h-3.5 w-3.5" />
                    </button>
                    {(pinnedStart || pinnedEnd) && (
                      <button
                        onClick={() => onUnpin(col.key)}
                        title="Unpin"
                        className="flex h-6 w-6 items-center justify-center rounded text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
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
              className="flex w-full items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-primary transition-colors hover:bg-primary/5"
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
      order: columns.map((col) => col.key),
      visible: columns.filter((col) => col.defaultVisible !== false).map((col) => col.key),
      pinnedStart: [],
      pinnedEnd: [],
    }),
    [columns],
  );

  const [state, setState] = useState<ColumnState>(() => loadState(storageKey) ?? defaultState);

  useEffect(() => {
    const sanitized = sanitizeState(state, defaultState, columns.map((col) => col.key));
    if (
      !arraysEqual(sanitized.order, state.order) ||
      !arraysEqual(sanitized.visible, state.visible) ||
      !arraysEqual(sanitized.pinnedStart, state.pinnedStart) ||
      !arraysEqual(sanitized.pinnedEnd, state.pinnedEnd)
    ) {
      setState(sanitized);
    }
  }, [columns, defaultState, state]);

  useEffect(() => {
    saveState(storageKey, state);
  }, [storageKey, state]);

  const updateState = (updater: (previous: ColumnState) => ColumnState) => {
    setState((previous) => updater(previous));
  };

  const toggleVisible = (key: string) => {
    updateState((previous) => ({
      ...previous,
      visible: previous.visible.includes(key)
        ? previous.visible.filter((item) => item !== key)
        : [...previous.visible, key],
    }));
  };

  const pinStart = (key: string) => {
    updateState((previous) => ({
      ...previous,
      pinnedStart: [...previous.pinnedStart.filter((item) => item !== key), key],
      pinnedEnd: previous.pinnedEnd.filter((item) => item !== key),
    }));
  };

  const pinEnd = (key: string) => {
    updateState((previous) => ({
      ...previous,
      pinnedEnd: [...previous.pinnedEnd.filter((item) => item !== key), key],
      pinnedStart: previous.pinnedStart.filter((item) => item !== key),
    }));
  };

  const unpin = (key: string) => {
    updateState((previous) => ({
      ...previous,
      pinnedStart: previous.pinnedStart.filter((item) => item !== key),
      pinnedEnd: previous.pinnedEnd.filter((item) => item !== key),
    }));
  };

  const reset = () => setState(defaultState);

  const reorder = (from: number, to: number) => {
    updateState((previous) => {
      const nextOrder = [...previous.order];
      const [moved] = nextOrder.splice(from, 1);
      nextOrder.splice(to, 0, moved);

      return {
        ...previous,
        order: nextOrder,
      };
    });
  };

  const orderedKeys = useMemo(() => {
    const middle = state.order.filter(
      (key) => !state.pinnedStart.includes(key) && !state.pinnedEnd.includes(key),
    );
    return [...state.pinnedStart, ...middle, ...state.pinnedEnd];
  }, [state.order, state.pinnedEnd, state.pinnedStart]);

  const visibleColumns = useMemo(
    () =>
      orderedKeys
        .filter((key) => state.visible.includes(key))
        .map((key) => columns.find((col) => col.key === key))
        .filter(Boolean) as DataTableColumn<T>[],
    [columns, orderedKeys, state.visible],
  );

  const allSelected = selectable && selectedRows && data.length > 0 && selectedRows.size === data.length;

  const tableMinWidth =
    visibleColumns.reduce((sum, col) => sum + getWidthValue(col.width), 0) +
    (selectable ? SELECT_COLUMN_WIDTH : 0) +
    (renderRowActions ? ACTIONS_COLUMN_WIDTH : 0);

  return (
    <div className={cn("space-y-3", className)}>
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

      <div className="overflow-x-auto rounded-lg border border-border bg-card">
        <table className="w-full table-fixed border-collapse text-sm" style={{ minWidth: tableMinWidth }}>
          <colgroup>
            {selectable && <col style={{ width: SELECT_COLUMN_WIDTH, minWidth: SELECT_COLUMN_WIDTH }} />}
            {visibleColumns.map((col) => (
              <col key={col.key} style={getWidthStyle(col.width)} />
            ))}
            {renderRowActions && (
              <col style={{ width: ACTIONS_COLUMN_WIDTH, minWidth: ACTIONS_COLUMN_WIDTH }} />
            )}
          </colgroup>

          <thead>
            <tr>
              {selectable && (
                <th
                  className="sticky left-0 z-30 border-b border-r border-border bg-secondary px-3 py-3 text-left"
                  style={{ boxShadow: "1px 0 0 0 hsl(var(--border))" }}
                >
                  <input
                    type="checkbox"
                    checked={!!allSelected}
                    onChange={onToggleAll}
                    className="h-4 w-4 rounded border-border text-primary accent-primary"
                  />
                </th>
              )}

              {visibleColumns.map((col, index) => {
                const pinned: "start" | "end" | null = state.pinnedStart.includes(col.key)
                  ? "start"
                  : state.pinnedEnd.includes(col.key)
                    ? "end"
                    : null;

                const stickyStyle = getStickyStyle(
                  col.key,
                  pinned,
                  visibleColumns,
                  state,
                  selectable,
                  !!renderRowActions,
                );

                return (
                  <th
                    key={col.key}
                    className={cn(
                      "border-b bg-secondary px-3 py-3 text-xs font-medium uppercase tracking-wider text-muted-foreground",
                      index < visibleColumns.length - 1 && "border-r border-border/40",
                      col.align === "right" && "text-right",
                      col.align === "center" && "text-center",
                      pinned && "sticky z-20",
                    )}
                    style={stickyStyle}
                  >
                    <div
                      className={cn(
                        "flex min-w-0 items-center gap-2",
                        col.align === "right" && "justify-end",
                        col.align === "center" && "justify-center",
                      )}
                    >
                      <span className="truncate">{col.label}</span>
                      {pinned && (
                        <Pin
                          className={cn(
                            "h-3 w-3 shrink-0 text-primary",
                            pinned === "start" ? "-rotate-45" : "rotate-45",
                          )}
                        />
                      )}
                    </div>
                  </th>
                );
              })}

              {renderRowActions && (
                <th
                  className="sticky right-0 z-30 border-b border-l border-border bg-secondary px-3 py-3 text-center text-xs font-medium uppercase tracking-wider text-muted-foreground"
                  style={{ boxShadow: "-1px 0 0 0 hsl(var(--border))" }}
                >
                  Actions
                </th>
              )}
            </tr>
          </thead>

          <tbody>
            {data.length === 0 ? (
              <tr>
                <td
                  colSpan={visibleColumns.length + (selectable ? 1 : 0) + (renderRowActions ? 1 : 0)}
                  className="bg-card px-4 py-12 text-center text-sm text-muted-foreground"
                >
                  {emptyState ?? "No records to display"}
                </td>
              </tr>
            ) : (
              data.map((row, rowIndex) => {
                const isSelected = !!selectedRows?.has(rowIndex);
                const rowBackground = isSelected ? "bg-primary/5" : "bg-card";
                const hoverBackground = "group-hover/row:bg-secondary/50";

                return (
                  <tr
                    key={rowKey(row, rowIndex)}
                    className={cn("group/row border-b border-border last:border-b-0", onRowClick && "cursor-pointer")}
                    onClick={(event) => {
                      const target = event.target as HTMLElement;
                      if (target.closest("button, input, a, [data-no-row-click]")) return;
                      onRowClick?.(row, rowIndex);
                    }}
                  >
                    {selectable && (
                      <td className={cn("border-r border-border px-3 py-3.5 align-middle", rowBackground, hoverBackground)}>
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => onToggleRow?.(rowIndex)}
                          className="h-4 w-4 rounded border-border text-primary accent-primary"
                        />
                      </td>
                    )}

                    {visibleColumns.map((col, columnIndex) => {
                      const value = col.accessor ? col.accessor(row) : "";
                      const isLastBeforeActions = columnIndex === visibleColumns.length - 1;

                      return (
                        <td
                          key={col.key}
                          className={cn(
                            "overflow-hidden px-3 py-3.5 align-middle whitespace-nowrap transition-colors",
                            rowBackground,
                            hoverBackground,
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
                              onCommit={(nextValue) => onCellSave(rowIndex, col.key, nextValue)}
                            />
                          ) : col.render ? (
                            col.render(row, rowIndex)
                          ) : (
                            <span className="block truncate text-foreground">{value || "—"}</span>
                          )}
                        </td>
                      );
                    })}

                    {renderRowActions && (
                      <td
                        className={cn(
                          "border-l border-border px-3 py-2 align-middle text-center",
                          rowBackground,
                          hoverBackground,
                        )}
                        data-no-row-click
                      >
                        <div className="flex items-center justify-center">{renderRowActions(row, rowIndex)}</div>
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
