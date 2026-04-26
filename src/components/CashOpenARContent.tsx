import { useCallback, useState } from "react";
import { Upload, CheckCircle2, Eye } from "lucide-react";
import TopBar from "./TopBar";
import { sampleOpenAR, formatUSD, type OpenInvoice } from "./cash/data";
import { DataTable, DataTableColumn } from "@/components/data-table/DataTable";
import RowActions from "@/components/data-table/RowActions";

const statusStyles: Record<string, string> = {
  Open: "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/30",
  Partial: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/30",
  Paid: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/30",
};

export default function CashOpenARContent() {
  const totalOpen = sampleOpenAR.filter((i) => i.status !== "Paid").reduce((s, i) => s + i.openBalance, 0);
  const [selectedRows, setSelectedRows] = useState<Set<number>>(new Set());

  const toggleRow = useCallback((i: number) => {
    setSelectedRows((prev) => {
      const next = new Set(prev);
      if (next.has(i)) next.delete(i);
      else next.add(i);
      return next;
    });
  }, []);

  const toggleAll = useCallback(() => {
    if (selectedRows.size === sampleOpenAR.length) setSelectedRows(new Set());
    else setSelectedRows(new Set(sampleOpenAR.map((_, i) => i)));
  }, [selectedRows.size]);

  const columns: DataTableColumn<OpenInvoice>[] = [
    {
      key: "customerId",
      label: "Customer ID",
      accessor: (i) => i.customerId,
      render: (i) => <span className="font-mono text-xs text-muted-foreground">{i.customerId}</span>,
      width: 130,
    },
    {
      key: "customer",
      label: "Customer",
      accessor: (i) => i.customer,
      render: (i) => <span className="font-medium text-foreground">{i.customer}</span>,
      width: 200,
    },
    {
      key: "invoiceNumber",
      label: "Invoice #",
      accessor: (i) => i.invoiceNumber,
      render: (i) => <span className="font-mono text-xs text-foreground">{i.invoiceNumber}</span>,
      width: 130,
    },
    {
      key: "invoiceDate",
      label: "Invoice Date",
      accessor: (i) => i.invoiceDate,
      render: (i) => <span className="text-muted-foreground text-xs">{i.invoiceDate}</span>,
      width: 130,
    },
    {
      key: "dueDate",
      label: "Due Date",
      accessor: (i) => i.dueDate,
      render: (i) => <span className="text-muted-foreground text-xs">{i.dueDate}</span>,
      width: 130,
    },
    {
      key: "openBalance",
      label: "Open Balance",
      accessor: (i) => formatUSD(i.openBalance),
      align: "right",
      render: (i) => <span className="font-semibold tabular-nums text-foreground">{formatUSD(i.openBalance)}</span>,
      width: 140,
    },
    {
      key: "daysPastDue",
      label: "Days Past Due",
      accessor: (i) => (i.daysPastDue > 0 ? `+${i.daysPastDue}` : "—"),
      align: "right",
      render: (i) => (
        <span className={`tabular-nums text-xs ${i.daysPastDue > 0 ? "text-destructive font-semibold" : "text-muted-foreground"}`}>
          {i.daysPastDue > 0 ? `+${i.daysPastDue}` : "—"}
        </span>
      ),
      width: 130,
    },
    {
      key: "status",
      label: "Status",
      accessor: (i) => i.status,
      render: (i) => (
        <span className={`inline-flex text-[11px] font-medium border rounded-full px-2 py-0.5 ${statusStyles[i.status]}`}>
          {i.status}
        </span>
      ),
      width: 110,
    },
  ];

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-background">
      <TopBar />
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex items-start justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-foreground tracking-tight">Open AR</h1>
              <p className="text-sm text-muted-foreground mt-1">
                Customer invoices available for matching against incoming payments
              </p>
            </div>
            <button className="flex items-center gap-2 text-sm font-medium bg-primary text-primary-foreground rounded-lg px-3.5 py-2 hover:opacity-90 transition-opacity">
              <Upload className="h-3.5 w-3.5" />
              Upload AR file
            </button>
          </div>

          {/* Upload status card */}
          <div className="stat-card mb-6 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                <CheckCircle2 className="h-5 w-5 text-emerald-500" />
              </div>
              <div>
                <div className="text-sm font-semibold text-foreground">acme_open_ar_20260406.csv</div>
                <div className="text-xs text-muted-foreground mt-0.5">
                  Uploaded today at 8:14 AM · 124 invoices · normalized to standard schema
                </div>
              </div>
            </div>
            <div className="flex items-center gap-6">
              <div className="text-right">
                <div className="text-xs text-muted-foreground">Total open</div>
                <div className="text-lg font-bold tabular-nums text-foreground">{formatUSD(totalOpen)}</div>
              </div>
              <button className="text-sm font-medium text-primary hover:underline">View mapping</button>
            </div>
          </div>

          <DataTable<OpenInvoice>
            storageKey="cash-open-ar"
            columns={columns}
            data={sampleOpenAR}
            rowKey={(i) => i.invoiceNumber}
            selectable
            searchable
            searchPlaceholder="Search invoice or customer..."
            selectedRows={selectedRows}
            onToggleRow={toggleRow}
            onToggleAll={toggleAll}
            renderRowActions={(inv) => (
              <RowActions
                review={{ label: "View invoice", onClick: () => {}, icon: <Eye className="h-3.5 w-3.5" /> }}
                more={[
                  { label: "Apply payment", onClick: () => {} },
                  { label: "Mark as paid", onClick: () => {} },
                  { label: "Write off", onClick: () => {}, destructive: true },
                ]}
              />
            )}
          />
        </div>
      </div>
    </div>
  );
}
