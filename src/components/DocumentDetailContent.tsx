import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { format } from "date-fns";
import {
  ArrowLeft, FileText, Download, ZoomIn, ZoomOut, RotateCw,
  ChevronRight, ChevronLeft, Ban, AlertTriangle, CalendarIcon,
  Building2, Hash, DollarSign, Clock,
  CheckCircle2, AlertCircle, Globe, Cpu, FileType, Package,
  User, Receipt, Layers, History, Check, Link2, GitBranch, X,
  ExternalLink, Plus, Trash2, Save, MoreHorizontal,
} from "lucide-react";

import POMatchingSheet from "@/components/POMatchingSheet";
import WorkflowSheet from "@/components/WorkflowSheet";
import TopBar from "@/components/TopBar";
import { pendingDocs } from "./PendingReviewTable";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";

const allDocs = [
  ...pendingDocs.map((d, i) => ({
    id: d.docNumber || d.vendor.replace(/\s/g, "-").toLowerCase(),
    vendor: d.vendor,
    docNumber: d.docNumber,
    docType: d.docType,
    total: d.total,
    dueDate: d.dueDate,
    uploadedDate: d.uploadedDate,
    approvalStatus: d.approvalStatus,
    workflow: d.workflow,
    jobNumber: d.jobNumber,
    index: i,
  })),
];

type FieldKey =
  | "subtotal" | "taxAmount" | "totalAmount"
  | "vendorName"
  | "dueDate" | "poNumber" | "docDate" | "paymentTerms" | "docNumber"
  | "cost" | "currency" | "confidence" | "tokensUsed"
  | "itemArticle" | "docType" | "vendorCountry" | "customerNumber"
  | "processingTime" | "salesOrderNumber";

type FieldType = "text" | "date" | "select";

interface FieldDef {
  key: FieldKey;
  label: string;
  icon: React.ElementType;
  type?: FieldType;
  options?: string[];
}

const fieldToRegion: Record<FieldKey, string> = {
  subtotal: "region-totals", taxAmount: "region-totals", totalAmount: "region-totals",
  vendorName: "region-vendor", dueDate: "region-header", poNumber: "region-billto",
  docDate: "region-header", paymentTerms: "region-terms", docNumber: "region-header",
  cost: "region-meta", currency: "region-terms", confidence: "region-meta",
  tokensUsed: "region-meta", itemArticle: "region-lineitem", docType: "region-terms",
  vendorCountry: "region-vendor", customerNumber: "region-billto",
  processingTime: "region-meta", salesOrderNumber: "region-billto",
};

/* ============ Field components ============ */
function DateField({ field, value, onChange, isActive, onFocus }: {
  field: FieldDef; value: string; onChange: (v: string) => void; isActive: boolean; onFocus: () => void;
}) {
  const Icon = field.icon;
  const isEmpty = !value.trim();
  let dateValue: Date | undefined;
  try { if (value) { const d = new Date(value); if (!isNaN(d.getTime())) dateValue = d; } } catch {}

  return (
    <div onClick={onFocus}>
      <label className="text-[11px] font-medium text-muted-foreground mb-1 block px-1 flex items-center gap-1.5">
        {field.label}
        {isEmpty && (
          <span className="inline-flex items-center gap-0.5 text-[10px] font-semibold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/30 rounded px-1.5 py-0.5">
            <AlertTriangle className="h-2.5 w-2.5" />Missing
          </span>
        )}
      </label>
      <Popover>
        <PopoverTrigger asChild>
          <button className={`w-full flex items-center gap-2 border rounded-lg px-3 py-2.5 text-left transition-all duration-200 overflow-hidden ${
            isEmpty ? "border-amber-300 dark:border-amber-500/30 bg-amber-50/50 dark:bg-amber-500/5" : "border-border bg-card"
          } ${isActive ? "bg-primary/[0.04] border-primary/20" : "hover:bg-accent/30"}`}>
            <Icon className={`h-4 w-4 shrink-0 ${isActive ? "text-primary" : "text-muted-foreground"}`} />
            <span className={`flex-1 text-sm truncate ${value ? "text-foreground" : "text-muted-foreground/50"}`}>
              {dateValue ? format(dateValue, "PPP") : value || `Pick ${field.label.toLowerCase()}...`}
            </span>
            <CalendarIcon className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
            {isEmpty ? <AlertCircle className="h-4 w-4 text-amber-500 shrink-0" /> : <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />}
          </button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar mode="single" selected={dateValue} onSelect={(d) => { if (d) onChange(format(d, "yyyy-MM-dd")); }} initialFocus className={cn("p-3 pointer-events-auto")} />
        </PopoverContent>
      </Popover>
    </div>
  );
}

function SelectField({ field, value, onChange, isActive, onFocus }: {
  field: FieldDef; value: string; onChange: (v: string) => void; isActive: boolean; onFocus: () => void;
}) {
  const Icon = field.icon;
  const isEmpty = !value.trim();

  return (
    <div onClick={onFocus}>
      <label className="text-[11px] font-medium text-muted-foreground mb-1 block px-1 flex items-center gap-1.5">
        {field.label}
        {isEmpty && (
          <span className="inline-flex items-center gap-0.5 text-[10px] font-semibold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/30 rounded px-1.5 py-0.5">
            <AlertTriangle className="h-2.5 w-2.5" />Missing
          </span>
        )}
      </label>
      <div className={`flex items-center gap-2 border rounded-lg px-3 py-2.5 transition-all duration-200 overflow-hidden ${
        isEmpty ? "border-amber-300 dark:border-amber-500/30 bg-amber-50/50 dark:bg-amber-500/5" : "border-border bg-card"
      } ${isActive ? "bg-primary/[0.04] border-primary/20" : "hover:bg-accent/30"}`}>
        <Icon className={`h-4 w-4 shrink-0 ${isActive ? "text-primary" : "text-muted-foreground"}`} />
        <select value={value} onChange={(e) => onChange(e.target.value)} onFocus={onFocus} className="flex-1 bg-transparent text-sm text-foreground outline-none cursor-pointer min-w-0">
          <option value="">Select...</option>
          {field.options?.map((opt) => <option key={opt} value={opt}>{opt}</option>)}
        </select>
        {isEmpty ? <AlertCircle className="h-4 w-4 text-amber-500 shrink-0" /> : <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />}
      </div>
    </div>
  );
}

function TextField({ field, value, onChange, isActive, onFocus }: {
  field: FieldDef; value: string; onChange: (v: string) => void; isActive: boolean; onFocus: () => void;
}) {
  const Icon = field.icon;
  const isEmpty = !value.trim();

  return (
    <div onClick={onFocus}>
      <label className="text-[11px] font-medium text-muted-foreground mb-1 block px-1 flex items-center gap-1.5">
        {field.label}
        {isEmpty && (
          <span className="inline-flex items-center gap-0.5 text-[10px] font-semibold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/30 rounded px-1.5 py-0.5">
            <AlertTriangle className="h-2.5 w-2.5" />Missing
          </span>
        )}
      </label>
      <div className={`flex items-center gap-2 border rounded-lg px-3 py-2.5 transition-all duration-200 overflow-hidden ${
        isEmpty ? "border-amber-300 dark:border-amber-500/30 bg-amber-50/50 dark:bg-amber-500/5" : "border-border bg-card"
      } ${isActive ? "bg-primary/[0.04] border-primary/20" : "hover:bg-accent/30"}`}>
        <Icon className={`h-4 w-4 shrink-0 ${isActive ? "text-primary" : "text-muted-foreground"}`} />
        <input type="text" value={value} onChange={(e) => onChange(e.target.value)} onFocus={onFocus}
          placeholder={`Enter ${field.label.toLowerCase()}...`}
          className="flex-1 bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground/50 min-w-0" />
        {isEmpty ? <AlertCircle className="h-4 w-4 text-amber-500 shrink-0" /> : <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />}
      </div>
    </div>
  );
}

function FieldRow({ field, value, onChange, isActive, onFocus }: {
  field: FieldDef; value: string; onChange: (v: string) => void; isActive: boolean; onFocus: () => void;
}) {
  if (field.type === "date") return <DateField field={field} value={value} onChange={onChange} isActive={isActive} onFocus={onFocus} />;
  if (field.type === "select") return <SelectField field={field} value={value} onChange={onChange} isActive={isActive} onFocus={onFocus} />;
  return <TextField field={field} value={value} onChange={onChange} isActive={isActive} onFocus={onFocus} />;
}

function HighlightRegion({ id, activeRegion, children, className = "" }: {
  id: string; activeRegion: string | null; children: React.ReactNode; className?: string;
}) {
  const isActive = activeRegion === id;
  return (
    <div className={`relative rounded-md transition-all duration-300 ${isActive ? "bg-primary/[0.06]" : ""} ${className}`}>
      {isActive && <div className="absolute -left-1 top-0 bottom-0 w-[3px] rounded-full bg-primary" />}
      {children}
    </div>
  );
}

/* ============ Line Items ============ */
interface LineItem {
  id: string;
  description: string;
  sku: string;
  qty: string;
  uom: string;
  unitPrice: string;
  tax: string;
  total: string;
}

const createLineItem = (): LineItem => ({
  id: crypto.randomUUID(),
  description: "",
  sku: "",
  qty: "",
  uom: "",
  unitPrice: "",
  tax: "",
  total: "",
});

const LINE_ITEM_COLS = [
  { key: "description" as const, label: "Description", width: "flex-[2]", placeholder: "Description" },
  { key: "sku" as const, label: "SKU", width: "flex-1", placeholder: "SKU" },
  { key: "qty" as const, label: "Qty", width: "w-16", placeholder: "0" },
  { key: "uom" as const, label: "UOM", width: "w-16", placeholder: "EA" },
  { key: "unitPrice" as const, label: "Unit Price", width: "w-24", placeholder: "$0.00" },
  { key: "tax" as const, label: "Tax", width: "w-20", placeholder: "$0.00" },
  { key: "total" as const, label: "Total", width: "w-24", placeholder: "$0.00" },
];

function LineItemsTable({ items, onChange, onDelete, onAdd }: {
  items: LineItem[];
  onChange: (id: string, updated: LineItem) => void;
  onDelete: (id: string) => void;
  onAdd: () => void;
}) {
  return (
    <div className="border border-border rounded-lg bg-card overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-1 px-3 py-2 border-b border-border bg-secondary/40">
        {LINE_ITEM_COLS.map(col => (
          <div key={col.key} className={`${col.width} text-[11px] font-semibold text-muted-foreground uppercase tracking-wide px-1`}>
            {col.label}
          </div>
        ))}
        <div className="w-8" />
      </div>
      {/* Rows */}
      <div className="divide-y divide-border">
        {items.map(item => (
          <div key={item.id} className="flex items-center gap-1 px-3 py-1.5 hover:bg-accent/20 transition-colors group">
            {LINE_ITEM_COLS.map(col => (
              <div key={col.key} className={`${col.width} px-1`}>
                <input
                  type="text"
                  value={item[col.key]}
                  onChange={(e) => onChange(item.id, { ...item, [col.key]: e.target.value })}
                  placeholder={col.placeholder}
                  className="w-full bg-transparent text-sm text-foreground py-1 outline-none border border-transparent rounded px-1.5 focus:border-primary/30 focus:bg-card transition-all placeholder:text-muted-foreground/40"
                />
              </div>
            ))}
            <button onClick={() => onDelete(item.id)} className="w-8 flex items-center justify-center text-muted-foreground/0 group-hover:text-muted-foreground hover:!text-destructive transition-colors p-1 rounded">
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
        ))}
      </div>
      {/* Add row */}
      <button onClick={onAdd} className="w-full flex items-center justify-center gap-1.5 py-2 text-xs text-muted-foreground hover:text-foreground hover:bg-accent/20 transition-colors border-t border-border">
        <Plus className="h-3.5 w-3.5" />Add Item
      </button>
    </div>
  );
}

/* ============ Steps config ============ */
const STEPS = [
  { id: 0, label: "Vendor", shortLabel: "Vendor" },
  { id: 1, label: "Document Info", shortLabel: "Doc Info" },
  { id: 2, label: "Financials", shortLabel: "Financials" },
  { id: 3, label: "Line Items", shortLabel: "Line Items" },
  { id: 4, label: "Additional", shortLabel: "Additional" },
] as const;

/* ============ Main component ============ */
export default function DocumentDetailContent() {
  const navigate = useNavigate();
  const { id } = useParams();
  const docIndex = allDocs.findIndex((d) => d.id === id);
  const doc = docIndex >= 0 ? allDocs[docIndex] : allDocs[0];
  const currentIndex = docIndex >= 0 ? docIndex : 0;

  const [zoom, setZoom] = useState(100);
  const [activeField, setActiveField] = useState<FieldKey | null>(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [lineItems, setLineItems] = useState<LineItem[]>([
    { ...createLineItem(), description: "Delivery Fee", qty: "1", unitPrice: "$100.00", total: "$100.00" },
    { ...createLineItem(), description: "Hard Hats", sku: "HH-001", qty: "10", uom: "EA", unitPrice: "$100.00", total: "$1,000.00" },
  ]);

  const handleLineItemChange = (id: string, updated: LineItem) => {
    setLineItems(prev => prev.map(li => li.id === id ? updated : li));
  };
  const handleLineItemDelete = (id: string) => {
    setLineItems(prev => prev.filter(li => li.id !== id));
  };
  const handleAddLineItem = () => {
    setLineItems(prev => [createLineItem(), ...prev]);
  };

  const [poSheetOpen, setPOSheetOpen] = useState(false);
  const [workflowSheetOpen, setWorkflowSheetOpen] = useState(false);
  const [matchedPO, setMatchedPO] = useState<string | null>(null);
  const [assignedWorkflow, setAssignedWorkflow] = useState<string | null>(null);

  // Field state — pre-filled as if extracted
  const [subtotal, setSubtotal] = useState("$1,288.00");
  const [taxAmount, setTaxAmount] = useState("$114.29");
  const [totalAmount, setTotalAmount] = useState("$1,402.29");
  const [vendorName, setVendorName] = useState(doc.vendor || "Apple");
  const [dueDate, setDueDate] = useState(doc.dueDate || "2021-09-19");
  const [poNumber, setPoNumber] = useState("");
  const [docDate, setDocDate] = useState(doc.uploadedDate || "2021-08-20");
  const [paymentTerms, setPaymentTerms] = useState("Net 30 Days");
  const [docNumber, setDocNumber] = useState(doc.docNumber || "AF32656303");
  const [cost, setCost] = useState("0.044");
  const [currency, setCurrency] = useState("USD");
  const [confidence, setConfidence] = useState("0.965");
  const [tokensUsed, setTokensUsed] = useState("8003");
  const [itemArticle, setItemArticle] = useState("");
  const [docType, setDocType] = useState(doc.docType || "invoice");
  const [vendorCountry, setVendorCountry] = useState("");
  const [customerNumber, setCustomerNumber] = useState("1153618");
  const [processingTime, setProcessingTime] = useState("18.22");
  const [salesOrderNumber, setSalesOrderNumber] = useState("");

  const activeRegion = activeField ? fieldToRegion[activeField] : null;

  const hasPrev = currentIndex > 0;
  const hasNext = currentIndex < allDocs.length - 1;
  const goToPrev = () => { if (hasPrev) navigate(`/documents/${allDocs[currentIndex - 1].id}`); };
  const goToNext = () => { if (hasNext) navigate(`/documents/${allDocs[currentIndex + 1].id}`); };

  const allValues: Record<FieldKey, string> = {
    subtotal, taxAmount, totalAmount, vendorName, dueDate, poNumber,
    docDate, paymentTerms, docNumber, cost, currency, confidence,
    tokensUsed, itemArticle, docType, vendorCountry, customerNumber,
    processingTime, salesOrderNumber,
  };
  const totalMissing = Object.values(allValues).filter((v) => !v.trim()).length;

  // Missing counts per step
  const stepMissing = [
    [vendorName, vendorCountry].filter((v) => !v.trim()).length,
    [dueDate, poNumber, docDate, paymentTerms, docNumber].filter((v) => !v.trim()).length,
    [subtotal, taxAmount, totalAmount].filter((v) => !v.trim()).length,
    lineItems.filter(li => !li.description.trim()).length,
    [cost, currency, confidence, tokensUsed, itemArticle, docType, customerNumber, processingTime, salesOrderNumber].filter((v) => !v.trim()).length,
  ];

  const handleFinalize = () => {
    toast({ title: "Document finalized", description: "This document has been approved and is ready for processing." });
  };

  const handleSave = () => {
    toast({ title: "Saved", description: "Your changes have been saved." });
  };

  const handleApproveAndNext = () => {
    toast({ title: "Approved", description: "Document approved. Moving to next." });
    if (hasNext) {
      setTimeout(() => goToNext(), 250);
    }
  };

  const handleReject = () => {
    toast({ title: "Rejected", description: "Document has been rejected.", variant: "destructive" });
  };

  const statusLabel = doc.approvalStatus === "approved" ? "Approved" : doc.approvalStatus === "rejected" ? "Rejected" : "Needs Review";
  const statusColor = doc.approvalStatus === "approved" ? "bg-emerald-100 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/30" : doc.approvalStatus === "rejected" ? "bg-destructive/10 text-destructive border-destructive/20" : "bg-amber-100 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-500/30";

  return (
    <>
    <div className="flex-1 flex flex-col min-h-0 bg-background relative">
      <TopBar />

      {/* Main split view */}
      <div className="flex-1 flex min-h-0">
        {/* LEFT: Fields panel */}
        <div className="w-[55%] shrink-0 border-r border-border flex flex-col min-h-0">
          {/* Header: back icon + doc name + status */}
          <div className="shrink-0 border-b border-border bg-card px-5 py-2.5 flex items-center gap-3">
            <button onClick={() => navigate(-1)} className="text-muted-foreground hover:text-foreground transition-colors p-1 rounded-md hover:bg-secondary shrink-0" title="Back">
              <ArrowLeft className="h-4 w-4" />
            </button>
            <h1 className="text-sm font-semibold text-foreground truncate flex-1">{doc.vendor} — {doc.docType} #{docNumber}</h1>
            <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border shrink-0 ${statusColor}`}>{statusLabel}</span>
          </div>
          {/* Step progress bar */}
          <div className="shrink-0 border-b border-border bg-card px-6 py-4">
            <div className="flex items-center gap-1">
              {STEPS.map((step, i) => {
                const isCurrent = i === currentStep;
                const hasMissing = stepMissing[i] > 0;
                const isComplete = stepMissing[i] === 0 && i !== 4;
                return (
                  <div key={step.id} className="flex items-center flex-1 min-w-0">
                    <button
                      onClick={() => {
                        setCurrentStep(i);
                        document.getElementById(`step-${i}`)?.scrollIntoView({ behavior: "smooth", block: "start" });
                      }}
                      className={`flex items-center gap-1.5 text-[11px] font-medium transition-colors whitespace-nowrap ${
                        isCurrent ? "text-primary" : isComplete ? "text-emerald-600" : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      <span className={`h-5 w-5 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 ${
                        isCurrent ? "bg-primary text-primary-foreground"
                        : isComplete ? "bg-emerald-100 text-emerald-700"
                        : hasMissing ? "bg-amber-100 text-amber-700"
                        : "bg-secondary text-muted-foreground"
                      }`}>
                        {isComplete && !isCurrent ? <Check className="h-3 w-3" /> : i + 1}
                      </span>
                      <span className="hidden lg:inline">{step.shortLabel}</span>
                    </button>
                    {i < STEPS.length - 1 && (
                      <div className={`flex-1 h-px mx-2 ${isComplete ? "bg-emerald-300" : "bg-border"}`} />
                    )}
                  </div>
                );
              })}
            </div>
            {totalMissing > 0 && (
              <div className="flex items-center gap-2 mt-3 pt-3 border-t border-border text-xs text-muted-foreground">
                <AlertTriangle className="h-3.5 w-3.5 text-amber-500" />
                <span><strong className="text-foreground">{totalMissing}</strong> field{totalMissing > 1 ? "s" : ""} need attention</span>
              </div>
            )}
          </div>

          {/* All sections scrollable */}
          <div className="flex-1 overflow-y-auto p-6 space-y-8">
            {/* Linking & Workflow */}
            <div className="space-y-2">
              <button
                onClick={() => setPOSheetOpen(true)}
                className={`w-full flex items-center gap-3 rounded-lg border px-3.5 py-2.5 text-left transition-all ${
                  matchedPO
                    ? "border-emerald-200 dark:border-emerald-500/30 bg-emerald-50/50 dark:bg-emerald-500/10"
                    : "border-border bg-card hover:bg-accent/30"
                }`}
              >
                <Link2 className={`h-4 w-4 shrink-0 ${matchedPO ? "text-emerald-600 dark:text-emerald-400" : "text-muted-foreground"}`} />
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-medium text-muted-foreground">Purchase Order</div>
                  <div className="text-sm font-medium text-foreground truncate">{matchedPO || "No PO matched"}</div>
                </div>
                {matchedPO ? (
                  <button onClick={(e) => { e.stopPropagation(); setMatchedPO(null); }} className="text-muted-foreground hover:text-destructive transition-colors p-1 rounded" title="Unlink PO">
                    <X className="h-3.5 w-3.5" />
                  </button>
                ) : (
                  <span className="text-xs text-primary font-medium shrink-0">Match</span>
                )}
              </button>

              <button
                onClick={() => setWorkflowSheetOpen(true)}
                className={`w-full flex items-center gap-3 rounded-lg border px-3.5 py-2.5 text-left transition-all ${
                  assignedWorkflow
                    ? "border-primary/20 bg-primary/5"
                    : "border-border bg-card hover:bg-accent/30"
                }`}
              >
                <GitBranch className={`h-4 w-4 shrink-0 ${assignedWorkflow ? "text-primary" : "text-muted-foreground"}`} />
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-medium text-muted-foreground">Workflow</div>
                  <div className="text-sm font-medium text-foreground truncate">
                    {assignedWorkflow ? assignedWorkflow.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()) : "No workflow assigned"}
                  </div>
                </div>
                {assignedWorkflow ? (
                  <button onClick={(e) => { e.stopPropagation(); setAssignedWorkflow(null); }} className="text-muted-foreground hover:text-destructive transition-colors p-1 rounded" title="Remove workflow">
                    <X className="h-3.5 w-3.5" />
                  </button>
                ) : (
                  <span className="text-xs text-primary font-medium shrink-0">Assign</span>
                )}
              </button>
            </div>

            {/* Vendor Details */}
            <section id="step-0" className="space-y-4">
              <div><h3 className="text-sm font-semibold text-foreground">Vendor Details</h3><p className="text-xs text-muted-foreground mt-0.5">Confirm the vendor information</p></div>
              <div className="space-y-3">
                <FieldRow field={{ key: "vendorName", label: "Vendor Name", icon: Building2 }} value={vendorName} onChange={setVendorName} isActive={activeField === "vendorName"} onFocus={() => setActiveField("vendorName")} />
                <FieldRow field={{ key: "vendorCountry", label: "Vendor Country", icon: Globe, type: "select", options: ["USA", "UK", "Canada", "Germany", "France", "Australia", "Japan", "India", "China"] }} value={vendorCountry} onChange={setVendorCountry} isActive={activeField === "vendorCountry"} onFocus={() => setActiveField("vendorCountry")} />
                <FieldRow field={{ key: "customerNumber", label: "Customer Number", icon: User }} value={customerNumber} onChange={setCustomerNumber} isActive={activeField === "customerNumber"} onFocus={() => setActiveField("customerNumber")} />
              </div>
            </section>

            <div className="h-px bg-border" />

            {/* Document Information */}
            <section id="step-1" className="space-y-4">
              <div><h3 className="text-sm font-semibold text-foreground">Document Information</h3><p className="text-xs text-muted-foreground mt-0.5">Verify dates, reference numbers, and terms</p></div>
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <FieldRow field={{ key: "docNumber", label: "Document Number", icon: Hash }} value={docNumber} onChange={setDocNumber} isActive={activeField === "docNumber"} onFocus={() => setActiveField("docNumber")} />
                  <FieldRow field={{ key: "docType", label: "Document Type", icon: FileType, type: "select", options: ["invoice", "credit_note", "purchase_order", "receipt", "delivery_note"] }} value={docType} onChange={setDocType} isActive={activeField === "docType"} onFocus={() => setActiveField("docType")} />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <FieldRow field={{ key: "docDate", label: "Document Date", icon: CalendarIcon, type: "date" }} value={docDate} onChange={setDocDate} isActive={activeField === "docDate"} onFocus={() => setActiveField("docDate")} />
                  <FieldRow field={{ key: "dueDate", label: "Due Date", icon: CalendarIcon, type: "date" }} value={dueDate} onChange={setDueDate} isActive={activeField === "dueDate"} onFocus={() => setActiveField("dueDate")} />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <FieldRow field={{ key: "poNumber", label: "PO Number", icon: Hash }} value={poNumber} onChange={setPoNumber} isActive={activeField === "poNumber"} onFocus={() => setActiveField("poNumber")} />
                  <FieldRow field={{ key: "paymentTerms", label: "Payment Terms", icon: Clock, type: "select", options: ["Net 30 Days", "Net 60 Days", "Net 90 Days", "Due on Receipt", "2/10 Net 30"] }} value={paymentTerms} onChange={setPaymentTerms} isActive={activeField === "paymentTerms"} onFocus={() => setActiveField("paymentTerms")} />
                </div>
                <FieldRow field={{ key: "salesOrderNumber", label: "Sales Order Number", icon: Receipt }} value={salesOrderNumber} onChange={setSalesOrderNumber} isActive={activeField === "salesOrderNumber"} onFocus={() => setActiveField("salesOrderNumber")} />
              </div>
            </section>

            <div className="h-px bg-border" />

            {/* Financial Details */}
            <section id="step-2" className="space-y-4">
              <div><h3 className="text-sm font-semibold text-foreground">Financial Details</h3><p className="text-xs text-muted-foreground mt-0.5">Review amounts and currency</p></div>
              <div className="space-y-3">
                <FieldRow field={{ key: "subtotal", label: "Subtotal", icon: DollarSign }} value={subtotal} onChange={setSubtotal} isActive={activeField === "subtotal"} onFocus={() => setActiveField("subtotal")} />
                <FieldRow field={{ key: "taxAmount", label: "Tax Amount", icon: DollarSign }} value={taxAmount} onChange={setTaxAmount} isActive={activeField === "taxAmount"} onFocus={() => setActiveField("taxAmount")} />
                <FieldRow field={{ key: "totalAmount", label: "Total Amount", icon: DollarSign }} value={totalAmount} onChange={setTotalAmount} isActive={activeField === "totalAmount"} onFocus={() => setActiveField("totalAmount")} />
                <FieldRow field={{ key: "currency", label: "Currency", icon: Globe, type: "select", options: ["USD", "EUR", "GBP", "CAD", "AUD", "JPY", "CHF"] }} value={currency} onChange={setCurrency} isActive={activeField === "currency"} onFocus={() => setActiveField("currency")} />
              </div>
            </section>

            <div className="h-px bg-border" />

            {/* Line Items */}
            <section id="step-3" className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-semibold text-foreground">Line Items</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">{lineItems.length} item{lineItems.length !== 1 ? "s" : ""}</p>
                </div>
              </div>
              {lineItems.length > 0 ? (
                <LineItemsTable
                  items={lineItems}
                  onChange={handleLineItemChange}
                  onDelete={handleLineItemDelete}
                  onAdd={handleAddLineItem}
                />
              ) : (
                <div className="border border-dashed border-border rounded-lg py-8 flex flex-col items-center gap-2 text-muted-foreground">
                  <Package className="h-5 w-5" />
                  <span className="text-xs">No line items yet</span>
                  <button onClick={handleAddLineItem} className="text-xs text-primary hover:text-primary/80 font-medium mt-1">Add first item</button>
                </div>
              )}
            </section>

            <div className="h-px bg-border" />

            {/* Additional Fields */}
            <section id="step-4" className="space-y-4">
              <div><h3 className="text-sm font-semibold text-foreground">Additional Fields</h3><p className="text-xs text-muted-foreground mt-0.5">Processing metadata</p></div>
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <FieldRow field={{ key: "itemArticle", label: "Item Article", icon: Package }} value={itemArticle} onChange={setItemArticle} isActive={activeField === "itemArticle"} onFocus={() => setActiveField("itemArticle")} />
                  <FieldRow field={{ key: "cost", label: "Cost", icon: DollarSign }} value={cost} onChange={setCost} isActive={activeField === "cost"} onFocus={() => setActiveField("cost")} />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <FieldRow field={{ key: "confidence", label: "Confidence", icon: Cpu }} value={confidence} onChange={setConfidence} isActive={activeField === "confidence"} onFocus={() => setActiveField("confidence")} />
                  <FieldRow field={{ key: "tokensUsed", label: "Tokens Used", icon: Layers }} value={tokensUsed} onChange={setTokensUsed} isActive={activeField === "tokensUsed"} onFocus={() => setActiveField("tokensUsed")} />
                </div>
                <FieldRow field={{ key: "processingTime", label: "Processing Time", icon: Clock }} value={processingTime} onChange={setProcessingTime} isActive={activeField === "processingTime"} onFocus={() => setActiveField("processingTime")} />
              </div>
            </section>


          </div>
        </div>

        {/* RIGHT: Document preview */}
        <div className="flex-1 flex flex-col min-h-0 bg-secondary/30 pb-12">
          <div className="flex items-center justify-between border-b border-border bg-card px-4 py-2.5">
            <div className="flex items-center gap-2.5">
              <FileText className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium text-foreground">Document Preview</span>
              <span className="text-[10px] font-medium px-2 py-0.5 rounded-full border border-border bg-secondary text-muted-foreground">Uploaded</span>
            </div>
            <a href="#" target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors">
              <ExternalLink className="h-3.5 w-3.5" />
              View in new tab
            </a>
          </div>

          <div className="flex-1 overflow-auto p-6 flex items-start justify-center" onClick={() => setActiveField(null)}>
              <div className="bg-card rounded-lg shadow-lg border border-border w-full max-w-[600px] overflow-hidden">
                <div className="p-8 space-y-0">
                  <HighlightRegion id="region-header" activeRegion={activeRegion} className="mb-8 p-2 -m-2">
                    <div className="flex items-start justify-between">
                      <div className="bg-destructive text-white px-4 py-2 rounded text-lg font-bold">
                        {(vendorName || "VENDOR").split(" ")[0].toUpperCase().slice(0, 5)}
                      </div>
                      <div className="text-right text-xs text-muted-foreground space-y-0.5">
                        <div className="text-sm font-semibold text-destructive">Invoice Number: {docNumber || "—"}</div>
                        <div>Invoice Date: {docDate || "—"}</div>
                        <div>Due Date: {dueDate || "—"}</div>
                      </div>
                    </div>
                  </HighlightRegion>
                  <HighlightRegion id="region-vendor" activeRegion={activeRegion} className="mb-6 p-2 -m-2 border-t border-border pt-4">
                    <div className="text-xs font-semibold text-muted-foreground mb-1">From:</div>
                    <div className="text-sm text-foreground">{vendorName || "—"}</div>
                    <div className="text-xs text-muted-foreground">123 Industrial Way<br />Los Angeles, CA 90001<br />{vendorCountry || "—"}</div>
                  </HighlightRegion>
                  <HighlightRegion id="region-billto" activeRegion={activeRegion} className="mb-6 p-2 -m-2">
                    <div className="text-xs font-semibold text-muted-foreground mb-1">Bill To:</div>
                    <div className="text-sm font-semibold text-primary">Customer #{customerNumber || "—"}</div>
                    <div className="text-xs text-muted-foreground">PO: {poNumber || "—"}<br />Sales Order: {salesOrderNumber || "—"}</div>
                  </HighlightRegion>
                  <HighlightRegion id="region-terms" activeRegion={activeRegion} className="mb-6 p-2 -m-2">
                    <div className="text-xs text-foreground space-y-0.5">
                      <div><span className="font-semibold">Payment Terms:</span> {paymentTerms || "—"}</div>
                      <div><span className="font-semibold">Currency:</span> {currency}</div>
                      <div><span className="font-semibold">Document Type:</span> {docType}</div>
                    </div>
                  </HighlightRegion>
                  <HighlightRegion id="region-lineitem" activeRegion={activeRegion} className="mb-6 p-2 -m-2">
                    <table className="w-full text-xs border-collapse">
                      <thead><tr className="bg-muted/50">
                        <th className="text-left py-2 px-2 font-semibold text-foreground">Article</th>
                        <th className="text-left py-2 px-2 font-semibold text-foreground">Description</th>
                        <th className="text-right py-2 px-2 font-semibold text-foreground">Amount</th>
                      </tr></thead>
                      <tbody><tr className="border-b border-border/50">
                        <td className="py-2 px-2 text-foreground">{itemArticle || "—"}</td>
                        <td className="py-2 px-2 text-foreground">New Hire Equipment</td>
                        <td className="py-2 px-2 text-right text-foreground">{subtotal}</td>
                      </tr></tbody>
                    </table>
                  </HighlightRegion>
                  <HighlightRegion id="region-totals" activeRegion={activeRegion} className="mb-6 p-2 -m-2">
                    <div className="flex justify-end">
                      <div className="w-48 space-y-1 text-xs">
                        <div className="flex justify-between"><span className="font-semibold">Subtotal</span><span>{subtotal}</span></div>
                        <div className="flex justify-between text-muted-foreground"><span>Tax</span><span>{taxAmount}</span></div>
                        <div className="border-t border-border pt-1 flex justify-between text-sm">
                          <span className="font-bold text-primary">Total Due</span>
                          <span className="font-bold text-primary">{totalAmount}</span>
                        </div>
                      </div>
                    </div>
                  </HighlightRegion>
                  <HighlightRegion id="region-meta" activeRegion={activeRegion} className="p-2 -m-2">
                    <div className="border border-border rounded-lg p-4 text-xs space-y-1 text-muted-foreground">
                      <div className="font-semibold text-foreground mb-2">Processing Metadata</div>
                      <div>Confidence: {confidence}</div>
                      <div>Processing Time: {processingTime}s</div>
                      <div>Tokens Used: {tokensUsed}</div>
                      <div>Cost: ${cost}</div>
                    </div>
                  </HighlightRegion>
                </div>
              </div>
          </div>

        </div>
      </div>

        {/* Bottom action bar */}
        <div className="absolute bottom-0 right-0 left-[55%] border-t border-border bg-card px-4 py-2.5 flex items-center justify-between shadow-[0_-2px_8px_-2px_hsl(var(--foreground)/0.06)]">
          {/* Left: Prev / Next nav */}
          <div className="flex items-center gap-1.5">
            <Button onClick={goToPrev} disabled={!hasPrev} size="sm" className="gap-1 text-xs h-8">
              <ChevronLeft className="h-3.5 w-3.5" />Previous
            </Button>
            <Button onClick={goToNext} disabled={!hasNext} size="sm" className="gap-1 text-xs h-8">
              Next<ChevronRight className="h-3.5 w-3.5" />
            </Button>
            <span className="text-[11px] font-medium text-muted-foreground ml-2 tabular-nums">
              {currentIndex + 1} of {allDocs.length}
            </span>
          </div>

          {/* Right: action cluster */}
          <div className="flex items-center gap-1.5">
            <Button onClick={handleSave} size="sm" className="gap-1.5 text-xs h-8">
              <Save className="h-3.5 w-3.5" />Save
            </Button>
            <Button
              onClick={handleApproveAndNext}
              size="sm"
              className="gap-1.5 text-xs h-8 bg-primary text-primary-foreground hover:bg-primary/90"
            >
              <Check className="h-3.5 w-3.5" />
              Approve & Next
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button size="sm" className="gap-1 text-xs h-8">
                  More<ChevronDown className="h-3.5 w-3.5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem onClick={handleFinalize}>
                  <Check className="h-3.5 w-3.5 mr-2" />
                  Approve only
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleReject} className="text-destructive focus:text-destructive">
                  <X className="h-3.5 w-3.5 mr-2" />
                  Reject
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <Download className="h-3.5 w-3.5 mr-2" />
                  Download
                </DropdownMenuItem>
                <DropdownMenuItem className="text-destructive focus:text-destructive">
                  <Ban className="h-3.5 w-3.5 mr-2" />
                  Void document
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          </div>
        </div>
    </div>

      <POMatchingSheet
        open={poSheetOpen}
        onOpenChange={setPOSheetOpen}
        invoiceAmount={totalAmount}
        vendorName={vendorName}
        onMatch={(poId) => setMatchedPO(poId)}
      />
      <WorkflowSheet
        open={workflowSheetOpen}
        onOpenChange={setWorkflowSheetOpen}
        currentWorkflow={assignedWorkflow}
        onAssign={(wfId) => setAssignedWorkflow(wfId)}
      />
    </>
  );
}
