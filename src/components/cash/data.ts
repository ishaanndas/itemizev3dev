import type { Confidence } from "./confidence";

export type ExtractedField =
  | "payer"
  | "amount"
  | "reference"
  | "customerId"
  | "date"
  | "memo";

export interface ExtractedToken {
  /** A snippet of the source document text that should be highlighted */
  text: string;
  /** Which logical field this token represents (drives color & link to AR side) */
  field: ExtractedField;
  /** If this token resolved to an AR invoice, the invoice number */
  matchedInvoice?: string;
}

export type SourceDocKind = "email" | "check" | "ach" | "portal";

export interface SourceDocument {
  kind: SourceDocKind;
  /** Header shown in the viewer chrome (e.g. "From: ar@acme.com  |  Apr 6, 2026") */
  meta: { label: string; value: string }[];
  /** Subject / title row */
  title?: string;
  /** Raw HTML body (sanitized in fixtures). For check/ach this is plain pre-formatted text. */
  body: string;
  /** Tokens to highlight inside the body */
  highlights: ExtractedToken[];
}

export interface Payment {
  id: string;
  paymentId: string;
  payer: string;
  customerId: string;
  amount: number;
  method: "ACH" | "Check" | "Wire" | "RTP";
  receivedDate: string;
  reference?: string;
  remittanceSource: "Lockbox" | "Email" | "ACH Addenda" | "Portal";
  status: "Matched" | "Partial" | "Unmatched" | "Exception" | "Posted";
  confidence: Confidence;
  matchScore: number;
  invoiceCount: number;
  /** Optional source remittance document for the viewer */
  source?: SourceDocument;
}

export interface OpenInvoice {
  customerId: string;
  customer: string;
  invoiceNumber: string;
  invoiceDate: string;
  dueDate: string;
  openBalance: number;
  daysPastDue: number;
  status: "Open" | "Partial" | "Paid";
}

export const samplePayments: Payment[] = [
  { id: "p1", paymentId: "PAY-5001", payer: "Acme Manufacturing Co.", customerId: "CUST-1001", amount: 5000, method: "ACH", receivedDate: "Apr 6, 2026", reference: "INV-9001", remittanceSource: "ACH Addenda", status: "Matched", confidence: "green", matchScore: 0.96, invoiceCount: 1 },
  { id: "p2", paymentId: "PAY-5002", payer: "Northwind Logistics", customerId: "CUST-2002", amount: 3000, method: "ACH", receivedDate: "Apr 6, 2026", reference: "INV-9101", remittanceSource: "Email", status: "Partial", confidence: "green", matchScore: 0.93, invoiceCount: 1 },
  { id: "p3", paymentId: "PAY-5003", payer: "Globex Industries", customerId: "CUST-3003", amount: 5500, method: "Check", receivedDate: "Apr 6, 2026", reference: "INV-9201", remittanceSource: "Lockbox", status: "Matched", confidence: "green", matchScore: 0.91, invoiceCount: 1 },
  { id: "p4", paymentId: "PAY-5004", payer: "Initech LLC", customerId: "CUST-4004", amount: 4800, method: "Check", receivedDate: "Apr 5, 2026", reference: "INV-9301", remittanceSource: "Lockbox", status: "Exception", confidence: "yellow", matchScore: 0.61, invoiceCount: 1 },
  { id: "p5", paymentId: "PAY-5005", payer: "Stark Enterprises", customerId: "CUST-5005", amount: 10000, method: "Wire", receivedDate: "Apr 5, 2026", reference: "INV-9401, INV-9402", remittanceSource: "Email", status: "Matched", confidence: "green", matchScore: 0.97, invoiceCount: 2 },
  { id: "p6", paymentId: "PAY-5006", payer: "Wayne Holdings", customerId: "CUST-6006", amount: 2750, method: "ACH", receivedDate: "Apr 5, 2026", reference: "—", remittanceSource: "ACH Addenda", status: "Unmatched", confidence: "red", matchScore: 0.18, invoiceCount: 0 },
  { id: "p7", paymentId: "PAY-5007", payer: "Umbrella Corp", customerId: "CUST-7007", amount: 12450.5, method: "Wire", receivedDate: "Apr 5, 2026", reference: "Order 88421", remittanceSource: "Email", status: "Partial", confidence: "yellow", matchScore: 0.72, invoiceCount: 3 },
  { id: "p8", paymentId: "PAY-5008", payer: "Tyrell Co.", customerId: "CUST-8008", amount: 980, method: "Check", receivedDate: "Apr 4, 2026", reference: "—", remittanceSource: "Lockbox", status: "Unmatched", confidence: "red", matchScore: 0.22, invoiceCount: 0 },
  { id: "p9", paymentId: "PAY-5009", payer: "Soylent Corp", customerId: "CUST-9009", amount: 7300, method: "RTP", receivedDate: "Apr 4, 2026", reference: "INV-9510", remittanceSource: "Portal", status: "Matched", confidence: "green", matchScore: 0.99, invoiceCount: 1 },
  { id: "p10", paymentId: "PAY-5010", payer: "Hooli Inc.", customerId: "CUST-1010", amount: 5400, method: "ACH", receivedDate: "Apr 4, 2026", reference: "INV-9612", remittanceSource: "ACH Addenda", status: "Posted", confidence: "green", matchScore: 0.95, invoiceCount: 1 },
  { id: "p11", paymentId: "PAY-5011", payer: "Pied Piper", customerId: "CUST-1111", amount: 1850, method: "Check", receivedDate: "Apr 3, 2026", reference: "Memo: Apr inv", remittanceSource: "Lockbox", status: "Exception", confidence: "yellow", matchScore: 0.55, invoiceCount: 1 },
  { id: "p12", paymentId: "PAY-5012", payer: "Massive Dynamic", customerId: "CUST-1212", amount: 22000, method: "ACH", receivedDate: "Apr 3, 2026", reference: "INV-9701, INV-9702, INV-9703", remittanceSource: "ACH Addenda", status: "Matched", confidence: "green", matchScore: 0.94, invoiceCount: 3 },
];

export const sampleOpenAR: OpenInvoice[] = [
  { customerId: "CUST-1001", customer: "Acme Manufacturing Co.", invoiceNumber: "INV-9001", invoiceDate: "Mar 7, 2026", dueDate: "Apr 6, 2026", openBalance: 5000, daysPastDue: 0, status: "Open" },
  { customerId: "CUST-2002", customer: "Northwind Logistics", invoiceNumber: "INV-9101", invoiceDate: "Mar 5, 2026", dueDate: "Apr 4, 2026", openBalance: 7500, daysPastDue: 2, status: "Open" },
  { customerId: "CUST-3003", customer: "Globex Industries", invoiceNumber: "INV-9201", invoiceDate: "Mar 7, 2026", dueDate: "Apr 6, 2026", openBalance: 5000, daysPastDue: 0, status: "Open" },
  { customerId: "CUST-4004", customer: "Initech LLC", invoiceNumber: "INV-9301", invoiceDate: "Mar 1, 2026", dueDate: "Mar 31, 2026", openBalance: 5000, daysPastDue: 6, status: "Open" },
  { customerId: "CUST-5005", customer: "Stark Enterprises", invoiceNumber: "INV-9401", invoiceDate: "Mar 8, 2026", dueDate: "Apr 7, 2026", openBalance: 4000, daysPastDue: 0, status: "Open" },
  { customerId: "CUST-5005", customer: "Stark Enterprises", invoiceNumber: "INV-9402", invoiceDate: "Mar 8, 2026", dueDate: "Apr 7, 2026", openBalance: 6000, daysPastDue: 0, status: "Open" },
  { customerId: "CUST-7007", customer: "Umbrella Corp", invoiceNumber: "INV-9501", invoiceDate: "Feb 20, 2026", dueDate: "Mar 22, 2026", openBalance: 4200, daysPastDue: 15, status: "Open" },
  { customerId: "CUST-7007", customer: "Umbrella Corp", invoiceNumber: "INV-9502", invoiceDate: "Mar 1, 2026", dueDate: "Mar 31, 2026", openBalance: 4250, daysPastDue: 6, status: "Open" },
  { customerId: "CUST-7007", customer: "Umbrella Corp", invoiceNumber: "INV-9503", invoiceDate: "Mar 4, 2026", dueDate: "Apr 3, 2026", openBalance: 4000.5, daysPastDue: 3, status: "Open" },
  { customerId: "CUST-9009", customer: "Soylent Corp", invoiceNumber: "INV-9510", invoiceDate: "Mar 8, 2026", dueDate: "Apr 7, 2026", openBalance: 7300, daysPastDue: 0, status: "Open" },
  { customerId: "CUST-1010", customer: "Hooli Inc.", invoiceNumber: "INV-9612", invoiceDate: "Mar 5, 2026", dueDate: "Apr 4, 2026", openBalance: 5400, daysPastDue: 2, status: "Paid" },
  { customerId: "CUST-1212", customer: "Massive Dynamic", invoiceNumber: "INV-9701", invoiceDate: "Mar 1, 2026", dueDate: "Mar 31, 2026", openBalance: 8000, daysPastDue: 6, status: "Open" },
  { customerId: "CUST-1212", customer: "Massive Dynamic", invoiceNumber: "INV-9702", invoiceDate: "Mar 2, 2026", dueDate: "Apr 1, 2026", openBalance: 7500, daysPastDue: 5, status: "Open" },
  { customerId: "CUST-1212", customer: "Massive Dynamic", invoiceNumber: "INV-9703", invoiceDate: "Mar 5, 2026", dueDate: "Apr 4, 2026", openBalance: 6500, daysPastDue: 2, status: "Open" },
];

export const formatUSD = (n: number) =>
  n.toLocaleString("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 2 });

/** Tailwind classes per extracted field type — used by the doc viewer & match builder */
export const FIELD_STYLES: Record<ExtractedField, { chip: string; highlight: string; label: string }> = {
  payer:      { chip: "bg-violet-50 text-violet-700 border-violet-200 dark:bg-violet-500/10 dark:text-violet-300 dark:border-violet-500/30", highlight: "bg-violet-100/70 dark:bg-violet-500/20 text-violet-900 dark:text-violet-200 border-b border-violet-400/60", label: "Payer" },
  amount:     { chip: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-300 dark:border-emerald-500/30", highlight: "bg-emerald-100/70 dark:bg-emerald-500/20 text-emerald-900 dark:text-emerald-200 border-b border-emerald-400/60", label: "Amount" },
  reference:  { chip: "bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-500/10 dark:text-sky-300 dark:border-sky-500/30", highlight: "bg-sky-100/70 dark:bg-sky-500/20 text-sky-900 dark:text-sky-200 border-b border-sky-400/60", label: "Invoice ref" },
  customerId: { chip: "bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-500/10 dark:text-indigo-300 dark:border-indigo-500/30", highlight: "bg-indigo-100/70 dark:bg-indigo-500/20 text-indigo-900 dark:text-indigo-200 border-b border-indigo-400/60", label: "Customer ID" },
  date:       { chip: "bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-500/10 dark:text-slate-300 dark:border-slate-500/30", highlight: "bg-slate-200/70 dark:bg-slate-500/20 text-foreground border-b border-slate-400/60", label: "Date" },
  memo:       { chip: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-300 dark:border-amber-500/30", highlight: "bg-amber-100/70 dark:bg-amber-500/20 text-amber-900 dark:text-amber-200 border-b border-amber-400/60", label: "Memo" },
};

function buildSource(p: Payment): SourceDocument {
  const refs = (p.reference ?? "").split(/[,;]\s*/).map((r) => r.trim()).filter(Boolean);
  const amountStr = formatUSD(p.amount);

  if (p.remittanceSource === "Email") {
    const rows = refs.length
      ? refs.map((r) => {
          const inv = sampleOpenAR.find((o) => o.invoiceNumber === r);
          const amt = inv ? Math.min(inv.openBalance, p.amount / Math.max(refs.length, 1)) : p.amount / Math.max(refs.length, 1);
          return `<tr><td style="padding:6px;border-bottom:1px solid #eee">${r}</td><td style="padding:6px;border-bottom:1px solid #eee">${inv?.invoiceDate ?? "—"}</td><td style="padding:6px;border-bottom:1px solid #eee;text-align:right">${formatUSD(amt)}</td></tr>`;
        }).join("")
      : `<tr><td colspan="3" style="padding:6px;color:#888;font-style:italic">See attached remittance — refs unclear</td></tr>`;
    return {
      kind: "email",
      meta: [
        { label: "From", value: `ar@${p.payer.toLowerCase().replace(/[^a-z]/g, "").slice(0, 10)}.com` },
        { label: "To", value: "remittance@itemize-bank.com" },
        { label: "Date", value: p.receivedDate },
      ],
      title: `Remittance advice — ${p.paymentId} — ${amountStr}`,
      body: `
        <p>Hello,</p>
        <p>Please find below remittance for payment <b>${p.paymentId}</b> sent today by <b>${p.payer}</b> (Customer <b>${p.customerId}</b>) for a total of <b>${amountStr}</b>.</p>
        <table style="width:100%;border-collapse:collapse;margin-top:8px;font-size:12px">
          <thead><tr style="background:#f4f4f5"><th style="text-align:left;padding:6px;border-bottom:1px solid #ddd">Invoice</th><th style="text-align:left;padding:6px;border-bottom:1px solid #ddd">Date</th><th style="text-align:right;padding:6px;border-bottom:1px solid #ddd">Amount</th></tr></thead>
          <tbody>${rows}</tbody>
        </table>
        <p style="margin-top:12px">Best regards,<br/>Accounts Payable<br/>${p.payer}</p>
      `,
      highlights: [
        { text: p.payer, field: "payer" },
        { text: p.customerId, field: "customerId" },
        { text: amountStr, field: "amount" },
        ...refs.map((r) => ({ text: r, field: "reference" as ExtractedField, matchedInvoice: r })),
      ],
    };
  }

  if (p.remittanceSource === "Lockbox") {
    const memo = refs.length ? `Memo: ${refs.join(", ")}` : (p.reference ?? "Memo: —");
    return {
      kind: "check",
      meta: [
        { label: "Lockbox", value: "WLBX-1042" },
        { label: "Image", value: `IMG-${p.paymentId.slice(-4)}.tif` },
        { label: "Captured", value: p.receivedDate },
      ],
      title: `Check from ${p.payer}`,
      body: `${p.payer}\n${p.customerId}\n123 Industry Way\n\nPay to the order of:  ITEMIZE BANK CLIENT\n\nAmount:  ${amountStr}\nDate:    ${p.receivedDate}\n\n${memo}\n\n_______________________  (signature on file)\n\nRouting :: 021000021     Account :: ••••4471\nCheck #  :: ${p.paymentId.replace("PAY-", "")}`,
      highlights: [
        { text: p.payer, field: "payer" },
        { text: p.customerId, field: "customerId" },
        { text: amountStr, field: "amount" },
        { text: p.receivedDate, field: "date" },
        ...refs.map((r) => ({ text: r, field: "reference" as ExtractedField, matchedInvoice: r })),
        ...(refs.length === 0 && p.reference ? [{ text: p.reference, field: "memo" as ExtractedField }] : []),
      ],
    };
  }

  if (p.remittanceSource === "ACH Addenda") {
    const addendaRef = refs[0] ?? p.reference ?? "";
    // Build line-item breakdown for attached invoices
    const lineItems = refs.length
      ? refs.map((r, i) => {
          const inv = sampleOpenAR.find((o) => o.invoiceNumber === r);
          const amt = inv ? Math.min(inv.openBalance, p.amount / Math.max(refs.length, 1)) : p.amount / Math.max(refs.length, 1);
          const date = inv?.invoiceDate ?? p.receivedDate;
          return `705RMR*IV*${r}*${date.replace(/[^0-9]/g, "").slice(0, 8) || "20260406"}*${amt.toFixed(2)}*${(i + 1).toString().padStart(2, "0")}`;
        }).join("\n")
      : (addendaRef ? `705RMR*IV*${addendaRef}**${p.amount.toFixed(2)}` : "705No structured remittance — addenda blank");

    const decodedLines = refs.length
      ? refs.map((r, i) => {
          const inv = sampleOpenAR.find((o) => o.invoiceNumber === r);
          const amt = inv ? Math.min(inv.openBalance, p.amount / Math.max(refs.length, 1)) : p.amount / Math.max(refs.length, 1);
          return `  ${(i + 1).toString().padStart(2, "0")}.  ${r.padEnd(12, " ")}  ${(inv?.invoiceDate ?? "—").padEnd(14, " ")}  ${formatUSD(amt).padStart(12, " ")}`;
        }).join("\n")
      : `  (no invoice line items)`;

    return {
      kind: "ach",
      meta: [
        { label: "File", value: "BAI2-20260406.txt" },
        { label: "Trace", value: `0210000${p.paymentId.slice(-6)}` },
        { label: "Settled", value: p.receivedDate },
      ],
      title: `ACH CCD+ — ${p.paymentId}`,
      body: `6225130001230000${p.paymentId.slice(-7)}0000${(p.amount * 100).toFixed(0).padStart(10, "0")}${p.customerId.padEnd(15, " ")}${p.payer.toUpperCase().slice(0, 22).padEnd(22, " ")}\n${lineItems}\n822500001000000010000000000${(p.amount * 100).toFixed(0).padStart(10, "0")}\n\n--- Decoded ---\nPayer:        ${p.payer}\nCustomer ID:  ${p.customerId}\nTotal Amount: ${amountStr}\nReceived:     ${p.receivedDate}\n\n--- Attached Invoices (${refs.length}) ---\n  #    Invoice       Date            Applied\n  ───────────────────────────────────────────\n${decodedLines}\n  ───────────────────────────────────────────\n  Total${" ".repeat(33)}${formatUSD(p.amount).padStart(12, " ")}\n`,
      highlights: [
        { text: p.payer.toUpperCase().slice(0, 22), field: "payer" },
        { text: p.payer, field: "payer" },
        { text: p.customerId, field: "customerId" },
        { text: amountStr, field: "amount" },
        ...refs.map((r) => ({ text: r, field: "reference" as ExtractedField, matchedInvoice: r })),
      ],
    };
  }

  // Portal upload
  return {
    kind: "portal",
    meta: [
      { label: "Source", value: "Customer Portal" },
      { label: "User", value: `${p.payer.split(" ")[0].toLowerCase()}@portal` },
      { label: "Uploaded", value: p.receivedDate },
    ],
    title: `Payment confirmation — ${p.paymentId}`,
    body: `
      <p><b>Payment Confirmation</b></p>
      <p>Customer <b>${p.customerId}</b> (<b>${p.payer}</b>) submitted a payment of <b>${amountStr}</b> via ${p.method} on <b>${p.receivedDate}</b>.</p>
      <p>Applied to invoice${refs.length > 1 ? "s" : ""}: ${refs.map((r) => `<b>${r}</b>`).join(", ") || "<i>not specified</i>"}</p>
    `,
    highlights: [
      { text: p.payer, field: "payer" },
      { text: p.customerId, field: "customerId" },
      { text: amountStr, field: "amount" },
      { text: p.receivedDate, field: "date" },
      ...refs.map((r) => ({ text: r, field: "reference" as ExtractedField, matchedInvoice: r })),
    ],
  };
}

samplePayments.forEach((p) => {
  p.source = buildSource(p);
});
