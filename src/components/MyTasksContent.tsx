import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Clock, DollarSign, Download, Eye, FileX, Flag } from "lucide-react";
import TopBar from "./TopBar";
import { DataTable, DataTableColumn } from "@/components/data-table/DataTable";
import RowActions from "@/components/data-table/RowActions";

interface MyTask {
  vendor: string;
  docNumber: string;
  total: string;
  workflow: string;
  submittedDate: string;
  daysPending: number;
  requestedBy: string;
  status: string;
}

const initialTasks: MyTask[] = [
  { vendor: "Apple", docNumber: "AF32656303", total: "$1,402.29", workflow: "Luis Test (Step 1)", submittedDate: "Apr 1, 2026", daysPending: 17, requestedBy: "lvargas+bst@itemize.com", status: "Pending" },
  { vendor: "Capitol Building Supply", docNumber: "128267-00", total: "$1,544.10", workflow: "AP Standard (Step 2)", submittedDate: "Apr 4, 2026", daysPending: 14, requestedBy: "jane@acme.com", status: "Pending" },
  { vendor: "Wilson Sonsini Goodrich", docNumber: "2362888", total: "$277.20", workflow: "AP Standard (Step 1)", submittedDate: "Apr 8, 2026", daysPending: 10, requestedBy: "mike@acme.com", status: "Pending" },
  { vendor: "TechPro Inc", docNumber: "PO-2024-0123", total: "$11,600.69", workflow: "PO Approval (Step 3)", submittedDate: "Apr 10, 2026", daysPending: 8, requestedBy: "jane@acme.com", status: "Pending" },
];

export default function MyTasksContent() {
  const navigate = useNavigate();
  const [selectedRows, setSelectedRows] = useState<Set<number>>(new Set());

  const tasks = initialTasks;

  const toggleRow = useCallback((i: number) => {
    setSelectedRows((prev) => {
      const next = new Set(prev);
      if (next.has(i)) next.delete(i);
      else next.add(i);
      return next;
    });
  }, []);

  const toggleAll = useCallback(() => {
    if (selectedRows.size === tasks.length) setSelectedRows(new Set());
    else setSelectedRows(new Set(tasks.map((_, i) => i)));
  }, [selectedRows.size, tasks]);

  const totalAmount = tasks.reduce((sum, t) => {
    const n = parseFloat(t.total.replace(/[^0-9.-]/g, "")) || 0;
    return sum + n;
  }, 0);

  const goToDoc = (t: MyTask) => navigate(`/documents/${t.docNumber}`);

  const columns: DataTableColumn<MyTask>[] = [
    {
      key: "status",
      label: "Status",
      accessor: (t) => t.status,
      render: (t) => (
        <span className="text-[11px] font-medium px-2.5 py-1 rounded-full border bg-amber-50 text-amber-700 border-amber-200">
          {t.status}
        </span>
      ),
    },
    {
      key: "vendor",
      label: "Vendor",
      accessor: (t) => t.vendor,
      render: (t) => <span className="font-medium text-foreground">{t.vendor}</span>,
    },
    { key: "docNumber", label: "Document #", accessor: (t) => t.docNumber || "—" },
    {
      key: "total",
      label: "Total",
      accessor: (t) => t.total,
      align: "right",
      render: (t) => <span className="font-medium tabular-nums text-foreground">{t.total}</span>,
    },
    {
      key: "workflow",
      label: "Workflow",
      accessor: (t) => t.workflow,
      render: (t) => (
        <span className="text-[11px] font-medium px-2.5 py-1 rounded-full border bg-secondary/60 text-foreground border-border">
          {t.workflow}
        </span>
      ),
    },
    { key: "submittedDate", label: "Submitted", accessor: (t) => t.submittedDate },
    {
      key: "daysPending",
      label: "Days Pending",
      accessor: (t) => `${t.daysPending}d`,
      render: (t) => (
        <span className={`tabular-nums font-medium ${t.daysPending > 14 ? "text-destructive" : t.daysPending > 7 ? "text-amber-600" : "text-foreground"}`}>
          {t.daysPending}d
        </span>
      ),
    },
    { key: "requestedBy", label: "Requested By", accessor: (t) => t.requestedBy },
  ];

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-background">
      <TopBar />

      <div className="flex-1 overflow-y-auto">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex items-start justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-foreground tracking-tight">My Tasks</h1>
              <p className="text-sm text-muted-foreground mt-1">Documents awaiting your approval</p>
            </div>
          </div>

          {/* Stat cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="stat-card flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                <Clock className="h-5 w-5 text-primary" />
              </div>
              <div>
                <div className="text-xs font-medium text-muted-foreground">Pending Tasks</div>
                <div className="text-2xl font-bold text-foreground tabular-nums">{tasks.length}</div>
              </div>
            </div>
            <div className="stat-card flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-emerald-500/10 flex items-center justify-center shrink-0">
                <DollarSign className="h-5 w-5 text-emerald-600" />
              </div>
              <div>
                <div className="text-xs font-medium text-muted-foreground">Total Amount</div>
                <div className="text-2xl font-bold text-foreground tabular-nums">
                  ${totalAmount.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>
              </div>
            </div>
          </div>

          <div className="stat-card">
            <DataTable<MyTask>
              storageKey="my-tasks"
              columns={columns}
              data={tasks}
              rowKey={(t, i) => `${t.docNumber}-${i}`}
              selectable
              selectedRows={selectedRows}
              onToggleRow={toggleRow}
              onToggleAll={toggleAll}
              onRowClick={goToDoc}
              toolbarLeft={
                selectedRows.size > 0 ? (
                  <button className="text-xs font-medium px-3.5 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors">
                    Approve {selectedRows.size} task{selectedRows.size > 1 ? "s" : ""}
                  </button>
                ) : null
              }
              renderRowActions={(t) => (
                <>
                  <button
                    onClick={() => goToDoc(t)}
                    className="text-xs font-medium px-3 py-1.5 rounded-md border border-border text-foreground hover:bg-secondary transition-colors"
                  >
                    Review
                  </button>
                  <button className="text-xs font-medium px-3 py-1.5 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors whitespace-nowrap">
                    Approve & Next
                  </button>
                </>
              )}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
