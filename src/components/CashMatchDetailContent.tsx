import { useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft, ChevronLeft, ChevronRight, Sparkles,
  Check, X, Plus, Search, Link2, AlertTriangle, History,
  ArrowRight, Wand2,
} from "lucide-react";
import TopBar from "./TopBar";
import RemittanceDocViewer from "./cash/RemittanceDocViewer";
import {
  samplePayments,
  sampleOpenAR,
  formatUSD,
  FIELD_STYLES,
  type ExtractedField,
} from "./cash/data";
import { ConfidenceBadge, CONFIDENCE } from "./cash/confidence";
import { toast } from "@/hooks/use-toast";

/** Small chip that, when hovered, dims everything in the doc viewer except its field's tokens. */
function ExtractedChip({
  field,
  value,
  onHover,
}: {
  field: ExtractedField;
  value: string;
  onHover: (f: ExtractedField | null) => void;
}) {
  const meta = FIELD_STYLES[field];
  return (
    <div
      onMouseEnter={() => onHover(field)}
      onMouseLeave={() => onHover(null)}
      className="group flex items-start gap-2"
    >
      <span className={`shrink-0 inline-flex items-center text-[10px] font-semibold border rounded-full px-2 py-0.5 mt-0.5 ${meta.chip}`}>
        {meta.label}
      </span>
      <span className="text-sm text-foreground break-words flex-1">{value || <span className="text-muted-foreground italic">not detected</span>}</span>
    </div>
  );
}

export default function CashMatchDetailContent() {
  const navigate = useNavigate();
  const { id } = useParams();
  const idx = samplePayments.findIndex((p) => p.id === id);
  const payment = idx >= 0 ? samplePayments[idx] : samplePayments[0];
  const currentIdx = idx >= 0 ? idx : 0;

  const [hoveredField, setHoveredField] = useState<ExtractedField | null>(null);
  const [search, setSearch] = useState("");
  const [showAllOpen, setShowAllOpen] = useState(false);
  const candidatesScrollRef = useRef<HTMLDivElement>(null);

  // Build initial applied invoices from extracted refs
  const [appliedInvoices, setAppliedInvoices] = useState<{ invoiceNumber: string; amount: number }[]>(() => {
    if (!payment.reference || payment.reference === "—") return [];
    const refs = payment.reference.split(/[,;]\s*/).map((r) => r.trim());
    return refs
      .map((ref) => sampleOpenAR.find((i) => i.invoiceNumber === ref))
      .filter(Boolean)
      .map((inv) => ({ invoiceNumber: inv!.invoiceNumber, amount: Math.min(inv!.openBalance, payment.amount / payment.invoiceCount || inv!.openBalance) }));
  });

  const totalApplied = appliedInvoices.reduce((s, a) => s + a.amount, 0);
  const remaining = payment.amount - totalApplied;
  const overshort = remaining > 0.01 ? "over" : remaining < -0.01 ? "short" : "balanced";

  const candidateInvoices = useMemo(() => {
    const payerKey = payment.payer.split(" ")[0].toLowerCase();
    const base = sampleOpenAR.filter(
      (inv) => showAllOpen || inv.customerId === payment.customerId || inv.customer.toLowerCase().includes(payerKey),
    );
    if (!search.trim()) return base;
    const q = search.toLowerCase();
    return base.filter(
      (inv) =>
        inv.invoiceNumber.toLowerCase().includes(q) ||
        inv.customer.toLowerCase().includes(q) ||
        inv.customerId.toLowerCase().includes(q),
    );
  }, [payment.payer, payment.customerId, search, showAllOpen]);

  const goToPrev = () => currentIdx > 0 && navigate(`/cash/matching/${samplePayments[currentIdx - 1].id}`);
  const goToNext = () => currentIdx < samplePayments.length - 1 && navigate(`/cash/matching/${samplePayments[currentIdx + 1].id}`);

  const removeApplied = (inv: string) => setAppliedInvoices((prev) => prev.filter((a) => a.invoiceNumber !== inv));
  const addApplied = (inv: string, openBalance: number) => {
    if (appliedInvoices.find((a) => a.invoiceNumber === inv)) return;
    setAppliedInvoices((prev) => [...prev, { invoiceNumber: inv, amount: Math.min(openBalance, Math.max(remaining, openBalance)) }]);
  };
  const updateAppliedAmount = (inv: string, amt: number) =>
    setAppliedInvoices((prev) => prev.map((a) => (a.invoiceNumber === inv ? { ...a, amount: amt } : a)));

  const handleApprove = () => {
    toast({ title: "Match approved", description: `${payment.paymentId} applied to ${appliedInvoices.length} invoice(s).` });
    if (currentIdx < samplePayments.length - 1) goToNext();
  };

  const handleAutoApply = () => {
    let pool = remaining;
    const additions: { invoiceNumber: string; amount: number }[] = [];
    for (const inv of candidateInvoices) {
      if (pool <= 0.01) break;
      if (appliedInvoices.find((a) => a.invoiceNumber === inv.invoiceNumber)) continue;
      const apply = Math.min(inv.openBalance, pool);
      additions.push({ invoiceNumber: inv.invoiceNumber, amount: apply });
      pool -= apply;
    }
    if (additions.length === 0) {
      toast({ title: "Nothing to auto-apply", description: "No remaining balance or no candidates available." });
      return;
    }
    setAppliedInvoices((prev) => [...prev, ...additions]);
    toast({ title: "Auto-applied", description: `Added ${additions.length} invoice(s) to clear balance.` });
  };

  // Scroll candidates table to a specific invoice when user clicks an extracted ref in the doc
  const handleTokenClick = (token: { matchedInvoice?: string }) => {
    if (!token.matchedInvoice) return;
    const row = document.querySelector<HTMLElement>(`[data-row-inv="${token.matchedInvoice}"]`);
    if (row && candidatesScrollRef.current) {
      row.scrollIntoView({ behavior: "smooth", block: "center" });
      row.classList.add("ring-2", "ring-primary/40");
      setTimeout(() => row.classList.remove("ring-2", "ring-primary/40"), 1500);
    }
  };

  const conf = CONFIDENCE[payment.confidence];

  // Extracted summary for the middle pane
  const extracted: { field: ExtractedField; value: string }[] = [
    { field: "payer", value: payment.payer },
    { field: "customerId", value: payment.customerId },
    { field: "amount", value: formatUSD(payment.amount) },
    { field: "date", value: payment.receivedDate },
    { field: "reference", value: payment.reference && payment.reference !== "—" ? payment.reference : "" },
  ];

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-background">
      <TopBar />

      {/* Sub-header */}
      <div className="border-b border-border bg-card px-6 h-14 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3 min-w-0">
          <button
            onClick={() => navigate("/cash/matching")}
            className="h-8 w-8 rounded-lg flex items-center justify-center hover:bg-secondary text-muted-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <div className="min-w-0">
            <div className="text-sm font-semibold text-foreground truncate">
              {payment.paymentId} · {payment.payer}
            </div>
            <div className="text-[11px] text-muted-foreground">
              {currentIdx + 1} of {samplePayments.length} in matching queue
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <ConfidenceBadge level={payment.confidence} score={payment.matchScore} />
          <div className="flex items-center gap-0.5 ml-2">
            <button onClick={goToPrev} disabled={currentIdx === 0} className="h-8 w-8 rounded-lg flex items-center justify-center hover:bg-secondary disabled:opacity-30">
              <ChevronLeft className="h-4 w-4 text-muted-foreground" />
            </button>
            <button onClick={goToNext} disabled={currentIdx === samplePayments.length - 1} className="h-8 w-8 rounded-lg flex items-center justify-center hover:bg-secondary disabled:opacity-30">
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            </button>
          </div>
          <button className="text-sm font-medium border border-border rounded-lg px-3.5 py-1.5 hover:bg-secondary text-foreground">
            Reject
          </button>
          <button
            onClick={handleApprove}
            className="text-sm font-medium bg-primary text-primary-foreground rounded-lg px-3.5 py-1.5 hover:opacity-90"
          >
            Approve & Next
          </button>
        </div>
      </div>

      {/* 2-pane body */}
      <div className="flex-1 flex min-w-0 w-full overflow-hidden">
        {/* LEFT: Unified workspace — AI, extracted, applied, candidates, activity */}
        <div className="w-[50%] max-w-[50%] min-w-0 shrink-0 border-r border-border overflow-y-auto">
          <div className="p-5 space-y-5">
            {/* AI explanation */}
            <div className={`rounded-xl border p-3.5 ${conf.badgeClass}`}>
              <div className="flex items-start gap-2.5">
                <Sparkles className="h-4 w-4 mt-0.5 shrink-0" />
                <div className="text-xs leading-relaxed">
                  <div className="font-semibold mb-1">AI match explanation</div>
                  {payment.confidence === "green" && (
                    <p>Reference {payment.reference} found in remittance. Amount matches open balance. Customer ID + payer name align.</p>
                  )}
                  {payment.confidence === "yellow" && (
                    <p>Partial reference match — payer name fuzzy matches customer record. Amount differs from invoice open balance. Recommend review.</p>
                  )}
                  {payment.confidence === "red" && (
                    <p>No invoice reference detected. Payer name does not match any active customer. Manual research required.</p>
                  )}
                </div>
              </div>
            </div>

            {/* Extracted fields → hover to spotlight in doc */}
            <section>
              <div className="flex items-center justify-between mb-2.5">
                <h3 className="text-sm font-semibold text-foreground">Extracted from source</h3>
                <span className="text-[10px] text-muted-foreground">hover to spotlight →</span>
              </div>
              <div className="border border-border rounded-lg bg-card divide-y divide-border">
                {extracted.map((e) => (
                  <div key={e.field} className="px-3 py-2.5">
                    <ExtractedChip field={e.field} value={e.value} onHover={setHoveredField} />
                  </div>
                ))}
              </div>
            </section>

            {/* Applied invoices */}
            <section>
              <div className="flex items-center justify-between mb-2.5">
                <h3 className="text-sm font-semibold text-foreground">Applied Invoices</h3>
                <button
                  onClick={handleAutoApply}
                  disabled={Math.abs(remaining) < 0.01}
                  className="inline-flex items-center gap-1 text-[11px] font-semibold text-primary hover:underline disabled:opacity-40 disabled:no-underline"
                >
                  <Wand2 className="h-3 w-3" /> Auto-apply remaining
                </button>
              </div>
              <div className="border border-border rounded-lg bg-card divide-y divide-border">
                {appliedInvoices.length === 0 && (
                  <div className="px-4 py-6 text-center text-xs text-muted-foreground">
                    No invoices applied. Click <span className="font-semibold">Apply</span> in the candidates list below.
                  </div>
                )}
                {appliedInvoices.map((a) => {
                  const inv = sampleOpenAR.find((i) => i.invoiceNumber === a.invoiceNumber);
                  return (
                    <div key={a.invoiceNumber} className="flex items-center gap-2 px-3 py-2">
                      <Link2 className="h-3 w-3 text-primary shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-semibold text-foreground font-mono">{a.invoiceNumber}</div>
                        <div className="text-[10px] text-muted-foreground truncate">
                          {inv?.customer} · open {formatUSD(inv?.openBalance ?? 0)}
                        </div>
                      </div>
                      <input
                        type="number"
                        value={a.amount.toFixed(2)}
                        onChange={(e) => updateAppliedAmount(a.invoiceNumber, parseFloat(e.target.value) || 0)}
                        className="w-24 text-right bg-background border border-border rounded px-2 py-1 text-xs font-semibold tabular-nums text-foreground outline-none focus:border-primary/40"
                      />
                      <button
                        onClick={() => removeApplied(a.invoiceNumber)}
                        className="h-6 w-6 rounded-md flex items-center justify-center text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  );
                })}
                {/* Totals */}
                <div className="px-3 py-2.5 bg-secondary/30 space-y-1">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-muted-foreground">Payment amount</span>
                    <span className="tabular-nums font-medium text-foreground">{formatUSD(payment.amount)}</span>
                  </div>
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-muted-foreground">Applied total</span>
                    <span className="tabular-nums font-medium text-foreground">{formatUSD(totalApplied)}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs pt-1.5 border-t border-border">
                    <span className="font-semibold text-foreground">
                      {overshort === "balanced" && "Balanced"}
                      {overshort === "over" && "Over → Unapplied"}
                      {overshort === "short" && "Short → Deductions"}
                    </span>
                    <span className={`tabular-nums font-bold ${
                      overshort === "balanced" ? "text-emerald-600" :
                      overshort === "over" ? "text-blue-600" :
                      "text-amber-600"
                    }`}>
                      {formatUSD(remaining)}
                    </span>
                  </div>
                </div>
              </div>
            </section>

            {/* Open AR candidates — inline section */}
            <section>
              <div className="flex items-center justify-between mb-2.5 gap-2">
                <div className="min-w-0">
                  <h3 className="text-sm font-semibold text-foreground">Open AR candidates</h3>
                  <p className="text-[10px] text-muted-foreground truncate">
                    {candidateInvoices.length} {showAllOpen ? "across all customers" : `for ${payment.payer}`}
                  </p>
                </div>
                <button
                  onClick={() => setShowAllOpen((v) => !v)}
                  className="text-[11px] font-medium border border-border rounded-md px-2 py-1 hover:bg-secondary text-foreground whitespace-nowrap shrink-0"
                >
                  {showAllOpen ? "Customer only" : "Search all AR"}
                </button>
              </div>

              <div className="relative mb-2">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search invoice, customer..."
                  className="w-full bg-card border border-border rounded-lg pl-9 pr-3 py-1.5 text-xs text-foreground placeholder:text-muted-foreground/60 outline-none focus:border-primary/40"
                />
              </div>

              <div ref={candidatesScrollRef} className="border border-border rounded-lg bg-card overflow-hidden">
                {candidateInvoices.length === 0 ? (
                  <div className="p-5 text-center">
                    <AlertTriangle className="h-5 w-5 text-amber-500 mx-auto mb-2" />
                    <div className="text-sm font-medium text-foreground mb-1">No matches</div>
                    <p className="text-[11px] text-muted-foreground">Toggle "Search all AR" or move to unapplied cash.</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="text-xs min-w-full">
                      <thead className="bg-secondary/40 border-b border-border">
                        <tr className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                          <th className="text-left px-3 py-2 font-semibold whitespace-nowrap">Invoice</th>
                          <th className="text-right px-3 py-2 font-semibold whitespace-nowrap">Open</th>
                          <th className="text-center px-3 py-2 font-semibold whitespace-nowrap">Signals</th>
                          <th className="text-right px-2 py-2 font-semibold whitespace-nowrap">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border">
                        {candidateInvoices.map((inv) => {
                          const isApplied = !!appliedInvoices.find((a) => a.invoiceNumber === inv.invoiceNumber);
                          const refMatch = !!payment.reference?.includes(inv.invoiceNumber);
                          const customerMatch = inv.customerId === payment.customerId;
                          const amountMatch = Math.abs(inv.openBalance - payment.amount) < 0.01;
                          const overdue = inv.daysPastDue > 0;
                          return (
                            <tr
                              key={inv.invoiceNumber}
                              data-row-inv={inv.invoiceNumber}
                              className={`transition-colors ${isApplied ? "bg-primary/[0.04]" : "hover:bg-accent/20"}`}
                            >
                              <td className="px-3 py-2 align-top">
                                <div className="flex items-center gap-1.5">
                                  {isApplied && <Link2 className="h-3 w-3 text-primary shrink-0" />}
                                  <span className="font-mono font-semibold text-foreground text-[11px]">{inv.invoiceNumber}</span>
                                </div>
                                <div className="text-[10px] text-muted-foreground truncate max-w-[160px]">{inv.customer}</div>
                                <div className="text-[10px] text-muted-foreground">
                                  Due {inv.dueDate}
                                  {overdue && <span className="ml-1 font-semibold text-destructive">+{inv.daysPastDue}d</span>}
                                </div>
                              </td>
                              <td className="px-3 py-2 align-top text-right whitespace-nowrap">
                                <div className="font-semibold tabular-nums text-foreground text-[11px]">{formatUSD(inv.openBalance)}</div>
                              </td>
                              <td className="px-3 py-2 align-top">
                                <div className="flex items-center justify-center gap-0.5 flex-wrap">
                                  {refMatch && (
                                    <span className={`inline-flex items-center text-[9px] font-semibold border rounded-full px-1.5 py-0.5 ${FIELD_STYLES.reference.chip}`} title="Invoice reference matched">Ref</span>
                                  )}
                                  {customerMatch && (
                                    <span className={`inline-flex items-center text-[9px] font-semibold border rounded-full px-1.5 py-0.5 ${FIELD_STYLES.customerId.chip}`} title="Customer ID matched">Cust</span>
                                  )}
                                  {amountMatch && (
                                    <span className={`inline-flex items-center text-[9px] font-semibold border rounded-full px-1.5 py-0.5 ${FIELD_STYLES.amount.chip}`} title="Amount matched">Amt</span>
                                  )}
                                  {!refMatch && !customerMatch && !amountMatch && (
                                    <span className="text-[10px] text-muted-foreground">—</span>
                                  )}
                                </div>
                              </td>
                              <td className="px-2 py-2 align-top text-right whitespace-nowrap">
                                <button
                                  onClick={() => isApplied ? removeApplied(inv.invoiceNumber) : addApplied(inv.invoiceNumber, inv.openBalance)}
                                  className={`inline-flex items-center gap-0.5 text-[10px] font-semibold rounded-md px-1.5 py-1 transition-colors ${
                                    isApplied
                                      ? "bg-secondary text-foreground hover:bg-destructive/10 hover:text-destructive border border-border"
                                      : "bg-primary text-primary-foreground hover:opacity-90"
                                  }`}
                                >
                                  {isApplied ? <><X className="h-2.5 w-2.5" /> Remove</> : <><Plus className="h-2.5 w-2.5" /> Apply</>}
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </section>

            {/* Activity */}
            <section>
              <h3 className="text-sm font-semibold text-foreground mb-2.5 flex items-center gap-2">
                <History className="h-3.5 w-3.5 text-muted-foreground" /> Activity
              </h3>
              <div className="space-y-2 text-[11px]">
                {[
                  { time: "2 min ago", actor: "AI", action: `Suggested ${appliedInvoices.length || "candidate"} match${appliedInvoices.length === 1 ? "" : "es"} (${(payment.matchScore * 100).toFixed(0)}% confidence)` },
                  { time: "8 min ago", actor: "System", action: `Payment captured from ${payment.remittanceSource}` },
                ].map((e, i) => (
                  <div key={i} className="flex items-start gap-2 text-muted-foreground">
                    <span className="h-1.5 w-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
                    <div>
                      <span className="text-foreground font-medium">{e.actor}</span> {e.action}
                      <span className="ml-2 text-muted-foreground/70">{e.time}</span>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>
        </div>

        {/* RIGHT: Source document viewer */}
        <div className="flex-1 min-w-0 overflow-hidden">
          {payment.source ? (
            <RemittanceDocViewer
              doc={payment.source}
              hoveredField={hoveredField}
              onTokenClick={handleTokenClick}
            />
          ) : (
            <div className="h-full flex items-center justify-center text-xs text-muted-foreground p-6 text-center">
              No source document attached.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
