import type { Confidence } from "./confidence";

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
  { id: "p12", paymentId: "PAY-5012", payer: "Massive Dynamic", customerId: "CUST-1212", amount: 22000, method: "Wire", receivedDate: "Apr 3, 2026", reference: "INV-9701, INV-9702, INV-9703", remittanceSource: "Email", status: "Matched", confidence: "green", matchScore: 0.94, invoiceCount: 3 },
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
