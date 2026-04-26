import { useCallback, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Upload, Filter, ChevronDown, Eye, Check, FileX } from "lucide-react";
import TopBar from "./TopBar";
import { samplePayments, formatUSD, type Payment } from "./cash/data";
import { ConfidenceBadge } from "./cash/confidence";
import { DataTable, DataTableColumn } from "@/components/data-table/DataTable";
import RowActions from "@/components/data-table/RowActions";

const statusStyles: Record<string, string> = {
  Matched: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/30",
  Partial: "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/30",
  Exception: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/30",
  Unmatched: "bg-destructive/10 text-destructive border-destructive/20",
  Posted: "bg-violet-50 text-violet-700 border-violet-200 dark:bg-violet-500/10 dark:text-violet-400 dark:border-violet-500/30",
};

export default function CashPaymentsContent() {
  const navigate = useNavigate();
  const [filter, setFilter] = useState<string>("All");
  const [selectedRows, setSelectedRows] = useState<Set<number>>(new Set());

  const filters = ["All", "Matched", "Partial", "Exception", "Unmatched"];
  const filtered = filter === "All" ? samplePayments : samplePayments.filter((p) => p.status === filter);

  const toggleRow = useCallback((i: number) => {
    setSelectedRows((prev) => {
      const next = new Set(prev);
      if (next.has(i)) next.delete(i);
      else next.add(i);
      return next;
    });
  }, []);

  const toggleAll = useCallback(() => {
    if (selectedRows.size === filtered.length) setSelectedRows(new Set());
    else setSelectedRows(new Set(filtered.map((_, i) => i)));
  }, [selectedRows.size, filtered]);

  const goToMatch = (p: Payment) => navigate(`/cash/matching/${p.id}`);

  const columns: DataTableColumn<Payment>[] = [
    {
      key: "paymentId",
      label: "Payment ID",
      accessor: (p) => p.paymentId,
      render: (p) => <span className="font-mono text-xs text-foreground">{p.paymentId}</span>,
      width: 130,
    },
    {
      key: "payer",
      label: "Payer",
      accessor: (p) => p.payer,
      render: (p) => <span className="font-medium text-foreground">{p.payer}</span>,
      width: 200,
    },
    { key: "method", label: "Method", accessor: (p) => p.method, width: 100 },
    {
      key: "remittanceSource",
      label: "Source",
      accessor: (p) => p.remittanceSource,
      render: (p) => (
        <span className="text-[11px] font-medium rounded-full px-2 py-0.5 bg-secondary text-foreground/70">
          {p.remittanceSource}
        </span>
      ),
      width: 130,
    },
    {
      key: "reference",
      label: "Reference",
      accessor: (p) => p.reference ?? "—",
      render: (p) => <span className="text-foreground/70 text-xs font-mono truncate">{p.reference || "—"}</span>,
      width: 180,
    },
    {
      key: "amount",
      label: "Amount",
      accessor: (p) => formatUSD(p.amount),
      align: "right",
      render: (p) => <span className="font-semibold tabular-nums text-foreground">{formatUSD(p.amount)}</span>,
      width: 130,
    },
    {
      key: "receivedDate",
      label: "Received",
      accessor: (p) => p.receivedDate,
      render: (p) => <span className="text-muted-foreground text-xs">{p.receivedDate}</span>,
      width: 120,
    },
    {
      key: "confidence",
      label: "Confidence",
      accessor: (p) => `${Math.round(p.matchScore * 100)}%`,
      render: (p) => <ConfidenceBadge level={p.confidence} score={p.matchScore} />,
      width: 130,
    },
    {
      key: "status",
      label: "Status",
      accessor: (p) => p.status,
      render: (p) => (
        <span className={`inline-flex text-[11px] font-medium border rounded-full px-2 py-0.5 ${statusStyles[p.status]}`}>
          {p.status}
        </span>
      ),
      width: 120,
    },
    { key: "customerId", label: "Customer ID", accessor: (p) => p.customerId, defaultVisible: false, width: 120 },
    { key: "invoiceCount", label: "Invoices", accessor: (p) => String(p.invoiceCount), align: "right", defaultVisible: false, width: 90 },
  ];

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-background">
      <TopBar />
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex items-start justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-foreground tracking-tight">Payments Inbox</h1>
              <p className="text-sm text-muted-foreground mt-1">
                Incoming payments from lockbox, ACH, wire, and email remittance
              </p>
            </div>
            <button className="flex items-center gap-2 text-sm font-medium bg-primary text-primary-foreground rounded-lg px-3.5 py-2 hover:opacity-90 transition-opacity">
              <Upload className="h-3.5 w-3.5" />
              Upload payment file
            </button>
          </div>

          {/* Status filter pills */}
          <div className="flex items-center justify-end gap-2 mb-3">
            <button className="flex items-center gap-1.5 text-sm border border-border rounded-lg px-3 py-2 hover:bg-secondary transition-colors text-foreground">
              <Filter className="h-3.5 w-3.5" />
              Method
              <ChevronDown className="h-3 w-3" />
            </button>
            <div className="flex items-center gap-1 bg-secondary/60 border border-border rounded-lg p-1">
              {filters.map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                    filter === f ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>

          <DataTable<Payment>
            storageKey="cash-payments"
            columns={columns}
            data={filtered}
            rowKey={(p) => p.id}
            selectable
            searchable
            searchPlaceholder="Search by payer, payment ID, reference..."
            selectedRows={selectedRows}
            onToggleRow={toggleRow}
            onToggleAll={toggleAll}
            onRowClick={goToMatch}
            toolbarLeft={
              selectedRows.size > 0 ? (
                <button className="text-xs font-medium px-3.5 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors">
                  Apply {selectedRows.size} payment{selectedRows.size > 1 ? "s" : ""}
                </button>
              ) : null
            }
            renderRowActions={(p) => (
              <RowActions
                review={{ label: "Review match", onClick: () => goToMatch(p), icon: <Eye className="h-3.5 w-3.5" /> }}
                primary={{ label: "Approve", onClick: () => goToMatch(p), icon: <Check className="h-3.5 w-3.5" /> }}
                more={[
                  { label: "View remittance", onClick: () => goToMatch(p) },
                  { label: "Mark as exception", onClick: () => {}, icon: <FileX className="h-3.5 w-3.5" />, destructive: true },
                ]}
              />
            )}
          />
        </div>
      </div>
    </div>
  );
}
