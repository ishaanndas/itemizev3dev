import { useState, useRef, useEffect, useCallback } from "react";
import { FileText, ChevronDown, Check, RotateCcw, X, Pencil } from "lucide-react";
import { useNavigate } from "react-router-dom";

const allColumns = [
  { key: "vendor", label: "Vendor Name", default: true, editable: true },
  { key: "docType", label: "Document Type", default: true, editable: false },
  { key: "docNumber", label: "Document Number", default: true, editable: true },
  { key: "jobNumber", label: "Job Number", default: true, editable: true },
  { key: "uploadedDate", label: "Uploaded Date", default: true, editable: false },
  { key: "dueDate", label: "Due Date", default: true, editable: true },
  { key: "total", label: "Total", default: true, editable: true },
  { key: "workflow", label: "Workflow", default: true, editable: false },
  { key: "approvalStatus", label: "Approval Status", default: true, editable: false },
  { key: "documentDate", label: "Document Date", default: false, editable: false },
  { key: "daysPending", label: "Days Pending", default: true, editable: false },
] as const;

type ColumnKey = (typeof allColumns)[number]["key"];

const docTypeStyles: Record<string, string> = {
  "Invoice": "bg-blue-50 text-blue-700 border-blue-200",
  "Statement": "bg-violet-50 text-violet-700 border-violet-200",
  "Credit Note": "bg-emerald-50 text-emerald-700 border-emerald-200",
  "Purchase Order": "bg-orange-50 text-orange-700 border-orange-200",
  "Receipt": "bg-cyan-50 text-cyan-700 border-cyan-200",
};

export const pendingDocs = [
  { docType: "Invoice", docNumber: "500192897", vendor: "Oxford University Press", jobNumber: "JOB-2201", uploadedDate: "Mar 10, 2026", dueDate: "Mar 25, 2026", total: "$1,298.35", workflow: "AP Standard", approvalStatus: "Needs Approval", documentDate: "Mar 8, 2026", daysPending: 7, statusColor: "bg-amber-50 text-amber-700 border-amber-200" },
  { docType: "Invoice", docNumber: "00001", vendor: "YEG Engineering di Y.E.G", jobNumber: "", uploadedDate: "Mar 10, 2026", dueDate: "", total: "€54,500.00", workflow: "AP Standard", approvalStatus: "Needs Approval", documentDate: "Mar 5, 2026", daysPending: 7, statusColor: "bg-amber-50 text-amber-700 border-amber-200" },
  { docType: "Invoice", docNumber: "A20250121", vendor: "COSTA MARZO CONSUL.", jobNumber: "", uploadedDate: "Mar 10, 2026", dueDate: "", total: "726.00", workflow: "AP Standard", approvalStatus: "PO Mismatch", documentDate: "Mar 3, 2026", daysPending: 7, statusColor: "bg-destructive/10 text-destructive border-destructive/20" },
  { docType: "Invoice", docNumber: "NC.2025/3", vendor: "MILLSAPS SOFTWARE EI", jobNumber: "JOB-3305", uploadedDate: "Mar 10, 2026", dueDate: "", total: "6,942.33", workflow: "AP Standard", approvalStatus: "Needs Approval", documentDate: "Mar 1, 2026", daysPending: 7, statusColor: "bg-amber-50 text-amber-700 border-amber-200" },
  { docType: "Invoice", docNumber: "2025/133/XE", vendor: "COLUSS I ERMES", jobNumber: "", uploadedDate: "Mar 10, 2026", dueDate: "Mar 21, 2025", total: "€1,980.00", workflow: "AP Standard", approvalStatus: "Needs Approval", documentDate: "Feb 28, 2026", daysPending: 7, statusColor: "bg-amber-50 text-amber-700 border-amber-200" },
  { docType: "Invoice", docNumber: "15012963097", vendor: "DAY & ROSS INC.", jobNumber: "JOB-1190", uploadedDate: "Mar 10, 2026", dueDate: "Mar 26, 2025", total: "$4,500.00", workflow: "AP Standard", approvalStatus: "Needs Approval", documentDate: "Mar 9, 2026", daysPending: 7, statusColor: "bg-amber-50 text-amber-700 border-amber-200" },
  { docType: "Statement", docNumber: "", vendor: "NRM Laboratories", jobNumber: "", uploadedDate: "Mar 10, 2026", dueDate: "", total: "1,171.59", workflow: "Test Workflow", approvalStatus: "Needs Approval", documentDate: "Mar 7, 2026", daysPending: 7, statusColor: "bg-amber-50 text-amber-700 border-amber-200" },
  { docType: "Statement", docNumber: "", vendor: "Wolseley UK Ltd", jobNumber: "", uploadedDate: "Mar 10, 2026", dueDate: "", total: "£241.24", workflow: "Test Workflow", approvalStatus: "Duplicate Flag", documentDate: "Mar 6, 2026", daysPending: 7, statusColor: "bg-amber-50 text-amber-700 border-amber-200" },
  { docType: "Invoice", docNumber: "INV-88421", vendor: "Meridian Services LLC", jobNumber: "JOB-4410", uploadedDate: "Mar 9, 2026", dueDate: "Mar 30, 2026", total: "$11,200.00", workflow: "AP Standard", approvalStatus: "Needs Approval", documentDate: "Mar 7, 2026", daysPending: 8, statusColor: "bg-amber-50 text-amber-700 border-amber-200" },
  { docType: "Invoice", docNumber: "2026-0042", vendor: "Summit Electric Co.", jobNumber: "", uploadedDate: "Mar 8, 2026", dueDate: "Apr 1, 2026", total: "$3,875.00", workflow: "AP Standard", approvalStatus: "Needs Approval", documentDate: "Mar 6, 2026", daysPending: 9, statusColor: "bg-amber-50 text-amber-700 border-amber-200" },
  { docType: "Credit Note", docNumber: "CN-2025-119", vendor: "RCPI Cleaning Services", jobNumber: "", uploadedDate: "Mar 10, 2026", dueDate: "", total: "-$7,719.54", workflow: "Test Workflow", approvalStatus: "Needs Approval", documentDate: "Mar 4, 2026", daysPending: 7, statusColor: "bg-amber-50 text-amber-700 border-amber-200" },
  { docType: "Invoice", docNumber: "FV/2026/03/008", vendor: "Kraków Logistics Sp.", jobNumber: "JOB-5521", uploadedDate: "Mar 7, 2026", dueDate: "Mar 28, 2026", total: "€8,340.00", workflow: "AP Standard", approvalStatus: "Amount Exceeds PO", documentDate: "Mar 5, 2026", daysPending: 10, statusColor: "bg-destructive/10 text-destructive border-destructive/20" },
];

function ColumnDropdown({ visibleColumns, onToggle, onReset }: {
  visibleColumns: Set<ColumnKey>;
  onToggle: (key: ColumnKey) => void;
  onReset: () => void;
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

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 text-sm font-medium border border-border rounded-lg px-3.5 py-2 hover:bg-secondary transition-colors text-foreground"
      >
        Show/Hide Columns
        <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
      </button>
      {open && (
        <div className="absolute right-0 top-full mt-1 w-56 bg-card rounded-xl shadow-xl border border-border overflow-hidden z-50">
          <div className="py-2 max-h-80 overflow-y-auto">
            {allColumns.map((col) => (
              <button
                key={col.key}
                onClick={() => onToggle(col.key)}
                className="w-full flex items-center gap-3 px-4 py-2 text-sm hover:bg-secondary transition-colors text-left"
              >
                <div className={`h-5 w-5 rounded border-2 flex items-center justify-center shrink-0 transition-colors ${
                  visibleColumns.has(col.key)
                    ? "bg-primary border-primary"
                    : "border-border"
                }`}>
                  {visibleColumns.has(col.key) && <Check className="h-3.5 w-3.5 text-primary-foreground" />}
                </div>
                <span className="text-foreground">{col.label}</span>
              </button>
            ))}
          </div>
          <div className="border-t border-border p-2">
            <button
              onClick={onReset}
              className="w-full flex items-center justify-center gap-2 text-sm font-medium text-primary hover:bg-primary/5 rounded-lg px-3 py-2 transition-colors"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              Reset Columns
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

/* ── Inline editable cell ── */
function EditableCell({
  value,
  rowIndex,
  colKey,
  onSave,
}: {
  value: string;
  rowIndex: number;
  colKey: ColumnKey;
  onSave: (row: number, key: ColumnKey, val: string) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editing) {
      inputRef.current?.focus();
      inputRef.current?.select();
    }
  }, [editing]);

  const commit = useCallback(() => {
    onSave(rowIndex, colKey, draft);
    setEditing(false);
  }, [draft, rowIndex, colKey, onSave]);

  const cancel = useCallback(() => {
    setDraft(value);
    setEditing(false);
  }, [value]);

  if (editing) {
    return (
      <div className="flex items-center gap-1 -my-0.5">
        <input
          ref={inputRef}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") commit();
            if (e.key === "Escape") cancel();
          }}
          onBlur={commit}
          className="w-full min-w-[60px] px-2 py-1 text-sm rounded border-2 border-primary bg-background text-foreground outline-none"
        />
      </div>
    );
  }

  return (
    <div
      className="group/cell flex items-center gap-1.5 cursor-text rounded px-1.5 py-0.5 -mx-1.5 -my-0.5 hover:bg-primary/5 transition-colors"
      onClick={() => setEditing(true)}
    >
      <span className="text-foreground">{value || "—"}</span>
      <Pencil className="h-3 w-3 text-muted-foreground/0 group-hover/cell:text-muted-foreground/60 transition-colors shrink-0" />
    </div>
  );
}

interface PendingReviewTableProps {
  viewAllHref?: string;
  compact?: boolean;
}

export default function PendingReviewTable({ viewAllHref, compact }: PendingReviewTableProps) {
  const defaultCols = new Set(allColumns.filter((c) => c.default).map((c) => c.key));
  const [visibleColumns, setVisibleColumns] = useState<Set<ColumnKey>>(defaultCols);
  const [selectedRows, setSelectedRows] = useState<Set<number>>(new Set());
  const [localDocs, setLocalDocs] = useState(pendingDocs);
  const navigate = useNavigate();

  const docs = compact ? localDocs.slice(0, 5) : localDocs;

  const toggleColumn = (key: ColumnKey) => {
    setVisibleColumns((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const resetColumns = () => setVisibleColumns(new Set(allColumns.filter((c) => c.default).map((c) => c.key)));

  const toggleRow = (i: number) => {
    setSelectedRows((prev) => {
      const next = new Set(prev);
      if (next.has(i)) next.delete(i);
      else next.add(i);
      return next;
    });
  };

  const toggleAll = () => {
    if (selectedRows.size === docs.length) setSelectedRows(new Set());
    else setSelectedRows(new Set(docs.map((_, i) => i)));
  };

  const handleCellSave = useCallback((rowIndex: number, key: ColumnKey, val: string) => {
    setLocalDocs((prev) => {
      const next = [...prev];
      next[rowIndex] = { ...next[rowIndex], [key]: val };
      return next;
    });
  }, []);

  const activeCols = allColumns.filter((c) => visibleColumns.has(c.key));

  const getCellValue = (doc: (typeof pendingDocs)[0], key: ColumnKey): string => {
    switch (key) {
      case "docType": return doc.docType;
      case "docNumber": return doc.docNumber || "—";
      case "vendor": return doc.vendor;
      case "jobNumber": return doc.jobNumber || "—";
      case "uploadedDate": return doc.uploadedDate;
      case "dueDate": return doc.dueDate || "—";
      case "total": return doc.total;
      case "workflow": return doc.workflow;
      case "approvalStatus": return doc.approvalStatus;
      case "documentDate": return doc.documentDate;
      case "daysPending": return `${doc.daysPending}d`;
    }
  };

  const rowBg = (i: number) =>
    selectedRows.has(i) ? "bg-primary/5" : i % 2 === 0 ? "bg-background" : "bg-muted/30";

  return (
    <div className="stat-card mb-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <h3 className="text-sm font-semibold text-foreground">Documents Pending Review</h3>
          <span className="text-xs font-medium text-muted-foreground bg-secondary rounded-full px-2.5 py-0.5 tabular-nums">
            {pendingDocs.length}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <ColumnDropdown
            visibleColumns={visibleColumns}
            onToggle={toggleColumn}
            onReset={resetColumns}
          />
          {selectedRows.size > 0 && (
            <button className="text-xs font-medium px-3.5 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors">
              Approve {selectedRows.size} document{selectedRows.size > 1 ? "s" : ""}
            </button>
          )}
          {viewAllHref && (
            <button
              onClick={() => navigate(viewAllHref)}
              className="text-sm font-medium text-primary hover:text-primary/80 transition-colors"
            >
              View All →
            </button>
          )}
        </div>
      </div>

      {/* Table with sticky first col + last col */}
      <div className="relative overflow-x-auto border border-border rounded-lg">
        <table className="w-full text-sm border-collapse" style={{ minWidth: `${activeCols.length * 150 + 200}px` }}>
          <thead>
            <tr className="bg-secondary/40 border-b border-border">
              <th className="sticky left-0 z-20 bg-secondary/95 backdrop-blur-sm py-3 px-3 text-left w-10 border-r border-border">
                <input
                  type="checkbox"
                  checked={selectedRows.size === docs.length && docs.length > 0}
                  onChange={toggleAll}
                  className="h-4 w-4 rounded border-border text-primary accent-primary"
                />
              </th>
              {activeCols.map((col, idx) => (
                <th
                  key={col.key}
                  className={`py-3 px-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider whitespace-nowrap ${
                    idx < activeCols.length - 1 ? "border-r border-border/40" : ""
                  }`}
                >
                  {col.label}
                </th>
              ))}
              <th className="sticky right-0 z-20 bg-secondary/95 backdrop-blur-sm py-3 px-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider border-l border-border">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {docs.map((doc, i) => {
              const colMeta = allColumns;
              return (
                <tr
                  key={i}
                  className={`transition-colors border-b border-border last:border-b-0 ${rowBg(i)} hover:bg-secondary/50`}
                >
                  <td className={`sticky left-0 z-10 py-3.5 px-3 border-r border-border ${rowBg(i)}`}>
                    <input
                      type="checkbox"
                      checked={selectedRows.has(i)}
                      onChange={() => toggleRow(i)}
                      className="h-4 w-4 rounded border-border text-primary accent-primary"
                    />
                  </td>
                  {activeCols.map((col, idx) => {
                    const isEditable = colMeta.find((c) => c.key === col.key)?.editable;
                    const cellValue = getCellValue(doc, col.key);
                    const isLast = idx === activeCols.length - 1;

                    return (
                      <td
                        key={col.key}
                        className={`py-3.5 px-3 whitespace-nowrap ${!isLast ? "border-r border-border/40" : ""}`}
                      >
                        {col.key === "docType" ? (
                          <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full border ${docTypeStyles[doc.docType] || "bg-secondary text-foreground border-border"}`}>
                            {doc.docType}
                          </span>
                        ) : col.key === "approvalStatus" ? (
                          <span className={`text-[11px] font-medium px-2.5 py-1 rounded-full border ${doc.statusColor}`}>
                            {doc.approvalStatus}
                          </span>
                        ) : col.key === "total" ? (
                          isEditable ? (
                            <EditableCell value={doc.total} rowIndex={i} colKey={col.key} onSave={handleCellSave} />
                          ) : (
                            <span className="font-medium tabular-nums text-foreground">{doc.total}</span>
                          )
                        ) : col.key === "vendor" ? (
                          isEditable ? (
                            <EditableCell value={doc.vendor} rowIndex={i} colKey={col.key} onSave={handleCellSave} />
                          ) : (
                            <div className="flex items-center gap-2">
                              <span className="text-primary">⛭</span>
                              <span className="text-foreground">{doc.vendor}</span>
                            </div>
                          )
                        ) : col.key === "workflow" ? (
                          <span className="text-[11px] font-medium px-2.5 py-1 rounded-full border bg-secondary/60 text-foreground border-border">
                            {doc.workflow}
                          </span>
                        ) : isEditable ? (
                          <EditableCell value={cellValue} rowIndex={i} colKey={col.key} onSave={handleCellSave} />
                        ) : (
                          <span className="text-foreground">{cellValue}</span>
                        )}
                      </td>
                    );
                  })}
                  <td className={`sticky right-0 z-20 py-3.5 px-3 border-l border-border bg-background shadow-[-8px_0_8px_-8px_hsl(var(--border))]`}>
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => navigate(`/documents/${doc.docNumber || doc.vendor.replace(/\s/g, "-").toLowerCase()}`)}
                        className="text-xs font-medium px-3 py-1.5 rounded-md border border-border text-foreground hover:bg-secondary transition-colors"
                      >
                        Review
                      </button>
                      <button className="text-xs font-medium px-3 py-1.5 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors whitespace-nowrap">
                        Approve & Next
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
