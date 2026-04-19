import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Download, Eye, FileX, Flag } from "lucide-react";
import { DataTable, DataTableColumn } from "@/components/data-table/DataTable";
import RowActions from "@/components/data-table/RowActions";

const docTypeStyles: Record<string, string> = {
  "Invoice": "bg-blue-50 text-blue-700 border-blue-200",
  "Statement": "bg-violet-50 text-violet-700 border-violet-200",
  "Credit Note": "bg-emerald-50 text-emerald-700 border-emerald-200",
  "Purchase Order": "bg-orange-50 text-orange-700 border-orange-200",
  "Receipt": "bg-cyan-50 text-cyan-700 border-cyan-200",
};

export interface PendingDoc {
  docType: string;
  docNumber: string;
  vendor: string;
  jobNumber: string;
  uploadedDate: string;
  dueDate: string;
  total: string;
  workflow: string;
  approvalStatus: string;
  documentDate: string;
  daysPending: number;
  statusColor: string;
}

export const pendingDocs: PendingDoc[] = [
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

interface PendingReviewTableProps {
  viewAllHref?: string;
  compact?: boolean;
}

export default function PendingReviewTable({ viewAllHref, compact }: PendingReviewTableProps) {
  const [selectedRows, setSelectedRows] = useState<Set<number>>(new Set());
  const navigate = useNavigate();

  const docs = compact ? pendingDocs.slice(0, 5) : pendingDocs;

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

  const goToDoc = (doc: PendingDoc) =>
    navigate(`/documents/${doc.docNumber || doc.vendor.replace(/\s/g, "-").toLowerCase()}`);

  const columns: DataTableColumn<PendingDoc>[] = [
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
    { key: "uploadedDate", label: "Uploaded Date", accessor: (d) => d.uploadedDate },
    { key: "dueDate", label: "Due Date", accessor: (d) => d.dueDate || "—" },
    {
      key: "total",
      label: "Total",
      accessor: (d) => d.total,
      align: "right",
      render: (d) => <span className="font-medium tabular-nums text-foreground">{d.total}</span>,
    },
    {
      key: "workflow",
      label: "Workflow",
      accessor: (d) => d.workflow,
      render: (d) => (
        <span className="text-[11px] font-medium px-2.5 py-1 rounded-full border bg-secondary/60 text-foreground border-border">
          {d.workflow}
        </span>
      ),
    },
    {
      key: "approvalStatus",
      label: "Approval Status",
      accessor: (d) => d.approvalStatus,
      render: (d) => (
        <span className={`text-[11px] font-medium px-2.5 py-1 rounded-full border ${d.statusColor}`}>
          {d.approvalStatus}
        </span>
      ),
    },
    { key: "documentDate", label: "Document Date", accessor: (d) => d.documentDate, defaultVisible: false },
    { key: "daysPending", label: "Days Pending", accessor: (d) => `${d.daysPending}d` },
  ];

  return (
    <div className="stat-card mb-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <h3 className="text-sm font-semibold text-foreground">Documents Pending Review</h3>
          <span className="text-xs font-medium text-muted-foreground bg-secondary rounded-full px-2.5 py-0.5 tabular-nums">
            {pendingDocs.length}
          </span>
        </div>
      </div>

      <DataTable<PendingDoc>
        storageKey="pending-review"
        columns={columns}
        data={docs}
        rowKey={(d, i) => `${d.docNumber || d.vendor}-${i}`}
        selectable
        selectedRows={selectedRows}
        onToggleRow={toggleRow}
        onToggleAll={toggleAll}
        onRowClick={goToDoc}
        toolbarLeft={
          selectedRows.size > 0 ? (
            <button className="text-xs font-medium px-3.5 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors">
              Approve {selectedRows.size} document{selectedRows.size > 1 ? "s" : ""}
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
            primary={{ label: "Approve & Next", onClick: () => goToDoc(doc) }}
            more={[
              { label: "Approve only", onClick: () => goToDoc(doc) },
              { label: "Flag for review", onClick: () => {}, icon: <Flag className="h-3.5 w-3.5" /> },
              { label: "Download", onClick: () => {}, icon: <Download className="h-3.5 w-3.5" /> },
              { label: "Reject", onClick: () => {}, icon: <FileX className="h-3.5 w-3.5" />, destructive: true },
            ]}
          />
        )}
      />
    </div>
  );
}
