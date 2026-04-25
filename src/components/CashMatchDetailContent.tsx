import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft, ChevronLeft, ChevronRight, Sparkles, Banknote, FileText,
  Mail, ScrollText, Building2, Hash, DollarSign, CalendarIcon,
  Check, X, Plus, Search, Link2, AlertTriangle, History,
} from "lucide-react";
import TopBar from "./TopBar";
import { samplePayments, sampleOpenAR, formatUSD, type Payment } from "./cash/data";
import { ConfidenceBadge, CONFIDENCE } from "./cash/confidence";
import { toast } from "@/hooks/use-toast";

function FieldRow({ icon: Icon, label, value, mono }: { icon: any; label: string; value: string; mono?: boolean }) {
  return (
    <div>
      <label className="text-[11px] font-medium text-muted-foreground mb-1 block px-1">{label}</label>
      <div className="flex items-center gap-2 border border-border rounded-lg px-3 py-2.5 bg-card">
        <Icon className="h-4 w-4 shrink-0 text-muted-foreground" />
        <span className={`flex-1 text-sm text-foreground truncate ${mono ? "font-mono" : ""}`}>{value || "—"}</span>
      </div>
    </div>
  );
}

function SourceBadge({ source }: { source: Payment["remittanceSource"] }) {
  const cfg = {
    Lockbox: { icon: ScrollText, label: "Lockbox image (WLBX)" },
    Email: { icon: Mail, label: "Email remittance" },
    "ACH Addenda": { icon: Banknote, label: "ACH addenda record" },
    Portal: { icon: FileText, label: "Customer portal" },
  }[source];
  const Icon = cfg.icon;
  return (
    <div className="inline-flex items-center gap-2 text-xs font-medium bg-secondary border border-border rounded-lg px-2.5 py-1.5">
      <Icon className="h-3.5 w-3.5 text-primary" />
      {cfg.label}
    </div>
  );
}

export default function CashMatchDetailContent() {
  const navigate = useNavigate();
  const { id } = useParams();
  const idx = samplePayments.findIndex((p) => p.id === id);
  const payment = idx >= 0 ? samplePayments[idx] : samplePayments[0];
  const currentIdx = idx >= 0 ? idx : 0;

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

  const candidateInvoices = sampleOpenAR.filter(
    (inv) =>
      inv.customerId === payment.customerId ||
      inv.customer.toLowerCase().includes(payment.payer.split(" ")[0].toLowerCase()),
  );

  const goToPrev = () => currentIdx > 0 && navigate(`/cash/matching/${samplePayments[currentIdx - 1].id}`);
  const goToNext = () => currentIdx < samplePayments.length - 1 && navigate(`/cash/matching/${samplePayments[currentIdx + 1].id}`);

  const removeApplied = (inv: string) =>
    setAppliedInvoices((prev) => prev.filter((a) => a.invoiceNumber !== inv));
  const addApplied = (inv: string, openBalance: number) => {
    if (appliedInvoices.find((a) => a.invoiceNumber === inv)) return;
    setAppliedInvoices((prev) => [...prev, { invoiceNumber: inv, amount: Math.min(openBalance, Math.max(remaining, openBalance)) }]);
  };

  const handleApprove = () => {
    toast({ title: "Match approved", description: `${payment.paymentId} applied to ${appliedInvoices.length} invoice(s).` });
    if (currentIdx < samplePayments.length - 1) goToNext();
  };

  const conf = CONFIDENCE[payment.confidence];

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

      {/* Split body */}
      <div className="flex-1 flex min-w-0 w-full overflow-hidden">
        {/* LEFT: Payment + Match builder */}
        <div className="w-[55%] max-w-[55%] min-w-0 shrink-0 border-r border-border overflow-y-auto">
          <div className="p-6 space-y-6">
            {/* AI explanation */}
            <div className={`rounded-xl border p-4 ${conf.badgeClass}`}>
              <div className="flex items-start gap-3">
                <Sparkles className="h-4 w-4 mt-0.5 shrink-0" />
                <div className="text-xs leading-relaxed">
                  <div className="font-semibold mb-1">AI match explanation</div>
                  {payment.confidence === "green" && (
                    <p>Exact invoice reference {payment.reference} found in remittance. Amount matches open balance. Customer ID and payer name align with AR file.</p>
                  )}
                  {payment.confidence === "yellow" && (
                    <p>Partial reference match — payer name fuzzy matches customer record. Amount differs from invoice open balance by {formatUSD(payment.amount - (candidateInvoices[0]?.openBalance ?? 0))}. Recommend review.</p>
                  )}
                  {payment.confidence === "red" && (
                    <p>No invoice reference detected in remittance. Payer name does not match any active customer. Manual research required — consider unapplied cash.</p>
                  )}
                </div>
              </div>
            </div>

            {/* Payment details */}
            <section>
              <h3 className="text-sm font-semibold text-foreground mb-3">Payment Details</h3>
              <div className="grid grid-cols-2 gap-3">
                <FieldRow icon={Hash} label="Payment ID" value={payment.paymentId} mono />
                <FieldRow icon={Banknote} label="Method" value={payment.method} />
                <FieldRow icon={Building2} label="Payer" value={payment.payer} />
                <FieldRow icon={Hash} label="Customer ID" value={payment.customerId} mono />
                <FieldRow icon={DollarSign} label="Amount" value={formatUSD(payment.amount)} />
                <FieldRow icon={CalendarIcon} label="Received" value={payment.receivedDate} />
              </div>
              <div className="mt-3 flex items-center gap-2">
                <span className="text-[11px] text-muted-foreground">Source:</span>
                <SourceBadge source={payment.remittanceSource} />
              </div>
            </section>

            {/* Applied invoices */}
            <section>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-foreground">Applied Invoices</h3>
                <span className="text-[11px] text-muted-foreground">{appliedInvoices.length} applied</span>
              </div>
              <div className="border border-border rounded-lg bg-card divide-y divide-border">
                {appliedInvoices.length === 0 && (
                  <div className="px-4 py-6 text-center text-xs text-muted-foreground">
                    No invoices applied yet. Add candidates from the right panel.
                  </div>
                )}
                {appliedInvoices.map((a) => {
                  const inv = sampleOpenAR.find((i) => i.invoiceNumber === a.invoiceNumber);
                  return (
                    <div key={a.invoiceNumber} className="flex items-center gap-3 px-4 py-2.5">
                      <Link2 className="h-3.5 w-3.5 text-primary shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-foreground font-mono">{a.invoiceNumber}</div>
                        <div className="text-[11px] text-muted-foreground truncate">
                          {inv?.customer} · open {formatUSD(inv?.openBalance ?? 0)}
                        </div>
                      </div>
                      <input
                        type="text"
                        value={formatUSD(a.amount)}
                        readOnly
                        className="w-28 text-right bg-secondary/60 border border-border rounded px-2 py-1 text-sm font-semibold tabular-nums text-foreground outline-none"
                      />
                      <button
                        onClick={() => removeApplied(a.invoiceNumber)}
                        className="h-7 w-7 rounded-md flex items-center justify-center text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  );
                })}
                {/* Totals */}
                <div className="px-4 py-3 bg-secondary/30 space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">Payment amount</span>
                    <span className="tabular-nums font-medium text-foreground">{formatUSD(payment.amount)}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">Applied total</span>
                    <span className="tabular-nums font-medium text-foreground">{formatUSD(totalApplied)}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm pt-1 border-t border-border">
                    <span className="font-semibold text-foreground">
                      {overshort === "balanced" && "Balanced"}
                      {overshort === "over" && "Overpayment → Unapplied Cash"}
                      {overshort === "short" && "Short pay → Deductions"}
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

            {/* History */}
            <section>
              <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                <History className="h-3.5 w-3.5 text-muted-foreground" /> Activity
              </h3>
              <div className="space-y-2 text-xs">
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

        {/* RIGHT: Open AR candidates */}
        <div className="flex-1 min-w-0 overflow-y-auto bg-secondary/20">
          <div className="p-6">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-foreground">Open Invoices for {payment.payer}</h3>
              <span className="text-xs text-muted-foreground">{candidateInvoices.length} found</span>
            </div>

            <div className="relative mb-3">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search any open invoice..."
                className="w-full bg-card border border-border rounded-lg pl-9 pr-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/60 outline-none focus:border-primary/40"
              />
            </div>

            <div className="space-y-2">
              {candidateInvoices.length === 0 && (
                <div className="border border-dashed border-border rounded-lg p-6 text-center">
                  <AlertTriangle className="h-5 w-5 text-amber-500 mx-auto mb-2" />
                  <div className="text-sm font-medium text-foreground mb-1">No matching invoices</div>
                  <p className="text-xs text-muted-foreground">
                    Search above or move payment to unapplied cash.
                  </p>
                </div>
              )}
              {candidateInvoices.map((inv) => {
                const isApplied = !!appliedInvoices.find((a) => a.invoiceNumber === inv.invoiceNumber);
                return (
                  <div
                    key={inv.invoiceNumber}
                    className={`border rounded-lg bg-card p-3 transition-colors ${
                      isApplied ? "border-primary/40 bg-primary/[0.03]" : "border-border hover:border-primary/30"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm font-semibold text-foreground font-mono">{inv.invoiceNumber}</span>
                          {inv.daysPastDue > 0 && (
                            <span className="text-[10px] font-semibold text-destructive bg-destructive/10 border border-destructive/20 rounded px-1.5 py-0.5">
                              +{inv.daysPastDue}d past due
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-muted-foreground truncate">{inv.customer}</div>
                        <div className="flex items-center gap-3 mt-1.5 text-[11px] text-muted-foreground">
                          <span>Inv {inv.invoiceDate}</span>
                          <span>·</span>
                          <span>Due {inv.dueDate}</span>
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <div className="text-sm font-bold tabular-nums text-foreground">{formatUSD(inv.openBalance)}</div>
                        <button
                          onClick={() => isApplied ? removeApplied(inv.invoiceNumber) : addApplied(inv.invoiceNumber, inv.openBalance)}
                          className={`mt-2 inline-flex items-center gap-1 text-[11px] font-semibold rounded-md px-2 py-1 transition-colors ${
                            isApplied
                              ? "bg-secondary text-foreground hover:bg-destructive/10 hover:text-destructive border border-border"
                              : "bg-primary text-primary-foreground hover:opacity-90"
                          }`}
                        >
                          {isApplied ? <><X className="h-3 w-3" /> Remove</> : <><Plus className="h-3 w-3" /> Apply</>}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
