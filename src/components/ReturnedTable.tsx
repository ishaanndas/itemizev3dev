import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Download, Eye, FileX, RotateCcw, Send } from "lucide-react";
import { DataTable, DataTableColumn } from "@/components/data-table/DataTable";
import RowActions from "@/components/data-table/RowActions";

const docTypeStyles: Record<string, string> = {
  "Invoice": "bg-blue-50 text-blue-700 border-blue-200",
  "Statement": "bg-violet-50 text-violet-700 border-violet-200",
  "Credit Note": "bg-emerald-50 text-emerald-700 border-emerald-200",
  "Purchase Order": "bg-orange-50 text-orange-700 border-orange-200",
  "Receipt": "bg-cyan-50 text-cyan-700 border-cyan-200",
};

const reasonStyles: Record<string, string> = {
  "Missing PO": "bg-destructive/10 text-destructive border-destructive/20",
  "Incorrect Amount": "bg-destructive/10 text-destructive border-destructive/20",
  "Wrong Vendor": "bg-destructive/10 text-destructive border-destructive/20",
  "Duplicate": "bg-amber-50 text-amber-700 border-amber-200",
  "Missing Receipt": "bg-amber-50 text-amber-700 border-amber-200",
  "Coding Error": "bg-amber-50 text-amber-700 border-amber-200",
  "Approval Required": "bg-amber-50 text-amber-700 border-amber-200",
  "Outside Policy": "bg-destructive/10 text-destructive border-destructive/20",
};

export interface ReturnedDoc {
  docType: string;
  docNumber: string;
  vendor: string;
  jobNumber: string;
  returnedDate: string;
  returnedBy: string;
  submittedBy: string;
  total: string;
  reason: string;
  notes: string;
  daysReturned: number;
}

export const returnedDocs: ReturnedDoc[] = [
  { docType: "Invoice", docNumber: "INV-77231", vendor: "Apex Industrial Supply", jobNumber: "JOB-1102", returnedDate: "Mar 9, 2026", returnedBy: "Sarah Chen", submittedBy: "Mike Torres", total: "$8,450.00", reason: "Missing PO", notes: "Cannot find matching PO reference", daysReturned: 8 },
  { docType: "Invoice", docNumber: "00873", vendor: "Greenline Logistics", jobNumber: "", returnedDate: "Mar 8, 2026", returnedBy: "David Park", submittedBy: "Lisa Wong", total: "$2,340.50", reason: "Incorrect Amount", notes: "Total doesn't match line items", daysReturned: 9 },
  { docType: "Invoice", docNumber: "FA-2026-019", vendor: "Marbella Trading SRL", jobNumber: "JOB-3308", returnedDate: "Mar 7, 2026", returnedBy: "Sarah Chen", submittedBy: "Mike Torres", total: "€12,890.00", reason: "Wrong Vendor", notes: "Vendor name doesn't match our records", daysReturned: 10 },
  { docType: "Statement", docNumber: "", vendor: "Northwind Materials", jobNumber: "", returnedDate: "Mar 6, 2026", returnedBy: "Anna Reyes", submittedBy: "Tom Blake", total: "$15,672.30", reason: "Duplicate", notes: "Already processed under INV-77100", daysReturned: 11 },
  { docType: "Invoice", docNumber: "BX-2026-0044", vendor: "Bluestone Consulting", jobNumber: "JOB-2204", returnedDate: "Mar 5, 2026", returnedBy: "David Park", submittedBy: "Lisa Wong", total: "$4,200.00", reason: "Missing Receipt", notes: "Travel receipts not attached", daysReturned: 12 },
  { docType: "Invoice", docNumber: "2026/03/118", vendor: "Helix Print Services", jobNumber: "", returnedDate: "Mar 4, 2026", returnedBy: "Sarah Chen", submittedBy: "Mike Torres", total: "£876.40", reason: "Coding Error", notes: "GL account incorrect for this expense type", daysReturned: 13 },
  { docType: "Credit Note", docNumber: "CN-2026-007", vendor: "Pinnacle Hardware", jobNumber: "JOB-4421", returnedDate: "Mar 3, 2026", returnedBy: "Anna Reyes", submittedBy: "Tom Blake", total: "-$1,150.00", reason: "Approval Required", notes: "Credit notes need director approval", daysReturned: 14 },
  { docType: "Invoice", docNumber: "INV-2026-553", vendor: "Quartz Manufacturing", jobNumber: "JOB-5530", returnedDate: "Mar 2, 2026", returnedBy: "David Park", submittedBy: "Lisa Wong", total: "$22,500.00", reason: "Outside Policy", notes: "Exceeds single-PO threshold without prior approval", daysReturned: 15 },
];

interface ReturnedTableProps {
  viewAllHref?: string;
  compact?: boolean;
}

export default function ReturnedTable({ viewAllHref, compact }: ReturnedTableProps) {
  const [selectedRows, setSelectedRows] = useState<Set<number>>(new Set());
  const navigate = useNavigate();

  const docs = compact ? returnedDocs.slice(0, 5) : returnedDocs;

  const toggleRow = useCallback((i: number) => {
    setSelectedRows((prev) => {
      const next = new Set(prev);
      if (next.has(i)) next.delete(i);
      else next.add(i);
      return next;
    });
  }, []);

  const toggleAll = useCallback(() => {
    if (selectedRows.size === docs.length) setSelectedRows(new Set());
    else setSelectedRows(new Set(docs.map((_, i) => i)));
  }, [selectedRows.size, docs]);

  const goToDoc = (doc: ReturnedDoc) =>
    navigate(`/documents/${doc.docNumber || doc.vendor.replace(/\s/g, "-").toLowerCase()}`);

  const columns: DataTableColumn<ReturnedDoc>[] = [
    {
      key: "vendor",
      label: "Vendor Name",
      accessor: (d) => d.vendor,
      render: (d) => <span className="font-medium text-foreground">{d.vendor}</span>,
    },
    {
      key: "docType",
      label: "Document Type",
      accessor: (d) => d.docType,
      render: (d) => (
        <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full border ${docTypeStyles[d.docType] || "bg-secondary text-foreground border-border"}`}>
          {d.docType}
        </span>
      ),
    },
    { key: "docNumber", label: "Document Number", accessor: (d) => d.docNumber || "—" },
    { key: "jobNumber", label: "Job Number", accessor: (d) => d.jobNumber || "—" },
    {
      key: "reason",
      label: "Return Reason",
      accessor: (d) => d.reason,
      render: (d) => (
        <span className={`text-[11px] font-medium px-2.5 py-1 rounded-full border ${reasonStyles[d.reason] || "bg-secondary text-foreground border-border"}`}>
          {d.reason}
        </span>
      ),
    },
    {
      key: "notes",
      label: "Notes",
      accessor: (d) => d.notes,
      render: (d) => <span className="text-muted-foreground truncate max-w-[280px] inline-block">{d.notes}</span>,
    },
    { key: "returnedBy", label: "Returned By", accessor: (d) => d.returnedBy },
    { key: "submittedBy", label: "Submitted By", accessor: (d) => d.submittedBy, defaultVisible: false },
    { key: "returnedDate", label: "Returned Date", accessor: (d) => d.returnedDate },
    {
      key: "total",
      label: "Total",
      accessor: (d) => d.total,
      align: "right",
      render: (d) => <span className="font-medium tabular-nums text-foreground">{d.total}</span>,
    },
    { key: "daysReturned", label: "Days Returned", accessor: (d) => `${d.daysReturned}d` },
  ];

  return (
    <div className="stat-card mb-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <h3 className="text-sm font-semibold text-foreground">Returned Documents</h3>
          <span className="text-xs font-medium text-muted-foreground bg-secondary rounded-full px-2.5 py-0.5 tabular-nums">
            {returnedDocs.length}
          </span>
        </div>
      </div>

      <DataTable<ReturnedDoc>
        storageKey="returned-docs"
        columns={columns}
        data={docs}
        rowKey={(d, i) => `${d.docNumber || d.vendor}-${i}`}
        selectable
        searchable
        searchPlaceholder="Search returned documents..."
        selectedRows={selectedRows}
        onToggleRow={toggleRow}
        onToggleAll={toggleAll}
        onRowClick={goToDoc}
        toolbarLeft={
          selectedRows.size > 0 ? (
            <button className="text-xs font-medium px-3.5 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors">
              Resubmit {selectedRows.size} document{selectedRows.size > 1 ? "s" : ""}
            </button>
          ) : null
        }
        toolbarRight={
          viewAllHref ? (
            <button
              onClick={() => navigate(viewAllHref)}
              className="text-sm font-medium text-primary hover:text-primary/80 transition-colors"
            >
              View All →
            </button>
          ) : null
        }
        renderRowActions={(doc) => (
          <RowActions
            review={{ label: "Review", onClick: () => goToDoc(doc), icon: <Eye className="h-3.5 w-3.5" /> }}
            primary={{ label: "Resubmit", onClick: () => goToDoc(doc), icon: <Send className="h-3.5 w-3.5" /> }}
            more={[
              { label: "Reassign", onClick: () => goToDoc(doc), icon: <RotateCcw className="h-3.5 w-3.5" /> },
              { label: "Download", onClick: () => {}, icon: <Download className="h-3.5 w-3.5" /> },
              { label: "Discard", onClick: () => {}, icon: <FileX className="h-3.5 w-3.5" />, destructive: true },
            ]}
          />
        )}
      />
    </div>
  );
}
