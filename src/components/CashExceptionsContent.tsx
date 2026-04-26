import { useCallback, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AlertTriangle, Eye, Check, Filter } from "lucide-react";
import TopBar from "./TopBar";
import { formatUSD } from "./cash/data";
import { DataTable, DataTableColumn } from "@/components/data-table/DataTable";
import RowActions from "@/components/data-table/RowActions";

type ExceptionType = "Short Pay" | "Overpayment" | "Unmatched" | "Duplicate" | "Missing Remittance";

interface Exception {
  paymentId: string;
  payer: string;
  type: ExceptionType;
  amount: number;
  variance: number;
  daysOpen: number;
  paymentRefId: string;
}

const exceptionTypeStyles: Record<ExceptionType, string> = {
  "Short Pay": "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/30",
  "Overpayment": "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/30",
  "Unmatched": "bg-destructive/10 text-destructive border-destructive/20",
  "Duplicate": "bg-violet-50 text-violet-700 border-violet-200 dark:bg-violet-500/10 dark:text-violet-400 dark:border-violet-500/30",
  "Missing Remittance": "bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-500/10 dark:text-orange-400 dark:border-orange-500/30",
};

const exceptions: Exception[] = [
  { paymentId: "PAY-5004", paymentRefId: "p4", payer: "Initech LLC", type: "Short Pay", amount: 4800, variance: -200, daysOpen: 1 },
  { paymentId: "PAY-5006", paymentRefId: "p6", payer: "Wayne Holdings", type: "Unmatched", amount: 2750, variance: 0, daysOpen: 1 },
  { paymentId: "PAY-5008", paymentRefId: "p8", payer: "Tyrell Co.", type: "Missing Remittance", amount: 980, variance: 0, daysOpen: 2 },
  { paymentId: "PAY-5011", paymentRefId: "p11", payer: "Pied Piper", type: "Short Pay", amount: 1850, variance: -150, daysOpen: 3 },
  { paymentId: "PAY-5003", paymentRefId: "p3", payer: "Globex Industries", type: "Overpayment", amount: 5500, variance: 500, daysOpen: 0 },
  { paymentId: "PAY-4988", paymentRefId: "p1", payer: "Acme Manufacturing Co.", type: "Duplicate", amount: 5000, variance: 0, daysOpen: 0 },
  { paymentId: "PAY-4972", paymentRefId: "p2", payer: "Cyberdyne Systems", type: "Unmatched", amount: 8200, variance: 0, daysOpen: 4 },
  { paymentId: "PAY-4951", paymentRefId: "p5", payer: "Vandelay Industries", type: "Short Pay", amount: 3450, variance: -50, daysOpen: 4 },
  { paymentId: "PAY-4940", paymentRefId: "p9", payer: "Oceanic Airlines", type: "Missing Remittance", amount: 1620, variance: 0, daysOpen: 5 },
];

const summary = [
  { type: "Unmatched" as ExceptionType, count: 2, amount: 10950 },
  { type: "Short Pay" as ExceptionType, count: 3, amount: 10100 },
  { type: "Overpayment" as ExceptionType, count: 1, amount: 5500 },
  { type: "Missing Remittance" as ExceptionType, count: 2, amount: 2600 },
  { type: "Duplicate" as ExceptionType, count: 1, amount: 5000 },
];

export default function CashExceptionsContent() {
  const navigate = useNavigate();
  const [filter, setFilter] = useState<ExceptionType | "All">("All");
  const [selectedRows, setSelectedRows] = useState<Set<number>>(new Set());

  const filtered = filter === "All" ? exceptions : exceptions.filter((e) => e.type === filter);

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

  const goToMatch = (e: Exception) => navigate(`/cash/matching/${e.paymentRefId}`);

  const columns: DataTableColumn<Exception>[] = [
    {
      key: "paymentId",
      label: "Payment ID",
      accessor: (e) => e.paymentId,
      render: (e) => <span className="font-mono text-xs text-foreground">{e.paymentId}</span>,
      width: 130,
    },
    {
      key: "payer",
      label: "Payer",
      accessor: (e) => e.payer,
      render: (e) => <span className="font-medium text-foreground">{e.payer}</span>,
      width: 200,
    },
    {
      key: "type",
      label: "Exception Type",
      accessor: (e) => e.type,
      render: (e) => (
        <span className={`inline-flex items-center gap-1 text-[11px] font-medium border rounded-full px-2 py-0.5 ${exceptionTypeStyles[e.type]}`}>
          <AlertTriangle className="h-3 w-3" />
          {e.type}
        </span>
      ),
      width: 170,
    },
    {
      key: "amount",
      label: "Amount",
      accessor: (e) => formatUSD(e.amount),
      align: "right",
      render: (e) => <span className="font-semibold tabular-nums text-foreground">{formatUSD(e.amount)}</span>,
      width: 130,
    },
    {
      key: "variance",
      label: "Variance",
      accessor: (e) => (e.variance === 0 ? "—" : `${e.variance > 0 ? "+" : ""}${formatUSD(e.variance)}`),
      align: "right",
      render: (e) => (
        <span className={`tabular-nums ${e.variance < 0 ? "text-amber-600" : e.variance > 0 ? "text-blue-600" : "text-muted-foreground"}`}>
          {e.variance === 0 ? "—" : `${e.variance > 0 ? "+" : ""}${formatUSD(e.variance)}`}
        </span>
      ),
      width: 130,
    },
    {
      key: "daysOpen",
      label: "Days Open",
      accessor: (e) => (e.daysOpen === 0 ? "Today" : `${e.daysOpen}d`),
      align: "right",
      render: (e) => (
        <span className={`tabular-nums text-xs ${e.daysOpen > 2 ? "text-destructive font-semibold" : "text-muted-foreground"}`}>
          {e.daysOpen === 0 ? "Today" : `${e.daysOpen}d`}
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
              <h1 className="text-2xl font-bold text-foreground tracking-tight">Exceptions</h1>
              <p className="text-sm text-muted-foreground mt-1">
                Payments requiring manual research, dispute, or workflow routing
              </p>
            </div>
            <button className="flex items-center gap-2 text-sm font-medium border border-border rounded-lg px-3.5 py-2 hover:bg-secondary text-foreground">
              <Filter className="h-3.5 w-3.5" />
              Bulk route to workflow
            </button>
          </div>

          {/* Summary */}
          <div className="grid grid-cols-2 md:grid-cols-6 gap-3 mb-6">
            <button
              onClick={() => setFilter("All")}
              className={`stat-card text-left ${filter === "All" ? "ring-2 ring-primary/20" : ""}`}
            >
              <div className="text-xs font-medium text-muted-foreground mb-2">All Exceptions</div>
              <div className="text-2xl font-bold tabular-nums text-foreground">{exceptions.length}</div>
              <div className="text-[11px] text-muted-foreground mt-1">{formatUSD(exceptions.reduce((s, e) => s + e.amount, 0))}</div>
            </button>
            {summary.map((s) => (
              <button
                key={s.type}
                onClick={() => setFilter(s.type)}
                className={`stat-card text-left ${filter === s.type ? "ring-2 ring-primary/20" : ""}`}
              >
                <div className="text-xs font-medium text-muted-foreground mb-2">{s.type}</div>
                <div className="text-2xl font-bold tabular-nums text-foreground">{s.count}</div>
                <div className="text-[11px] text-muted-foreground mt-1">{formatUSD(s.amount)}</div>
              </button>
            ))}
          </div>

          <DataTable<Exception>
            storageKey="cash-exceptions"
            columns={columns}
            data={filtered}
            rowKey={(e) => e.paymentId}
            selectable
            searchable
            searchPlaceholder="Search exceptions..."
            selectedRows={selectedRows}
            onToggleRow={toggleRow}
            onToggleAll={toggleAll}
            onRowClick={goToMatch}
            toolbarLeft={
              selectedRows.size > 0 ? (
                <button className="text-xs font-medium px-3.5 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors">
                  Route {selectedRows.size} exception{selectedRows.size > 1 ? "s" : ""}
                </button>
              ) : null
            }
            renderRowActions={(e) => (
              <RowActions
                review={{ label: "Investigate", onClick: () => goToMatch(e), icon: <Eye className="h-3.5 w-3.5" /> }}
                primary={{ label: "Resolve", onClick: () => goToMatch(e), icon: <Check className="h-3.5 w-3.5" /> }}
                more={[
                  { label: "Assign to teammate", onClick: () => {} },
                  { label: "Send to dispute", onClick: () => {} },
                  { label: "Mark as written off", onClick: () => {}, destructive: true },
                ]}
              />
            )}
          />
        </div>
      </div>
    </div>
  );
}
