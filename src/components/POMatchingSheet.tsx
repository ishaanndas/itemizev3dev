import { useState } from "react";
import {
  Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription,
} from "@/components/ui/sheet";
import {
  Search, CheckCircle2, AlertTriangle, Link2, Package, Hash, DollarSign, CalendarIcon, Building2,
} from "lucide-react";

const mockPOs = [
  { id: "PO-2024-0891", vendor: "Apple", date: "2024-08-10", amount: "$1,402.29", status: "Open", matchScore: 98 },
  { id: "PO-2024-0887", vendor: "Apple", date: "2024-07-28", amount: "$1,388.00", status: "Open", matchScore: 72 },
  { id: "PO-2024-0842", vendor: "Apple Inc.", date: "2024-06-15", amount: "$2,100.00", status: "Partial", matchScore: 45 },
];

export default function POMatchingSheet({
  open,
  onOpenChange,
  invoiceAmount,
  vendorName,
  onMatch,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  invoiceAmount: string;
  vendorName: string;
  onMatch?: (poId: string) => void;
}) {
  const [search, setSearch] = useState("");
  const [selectedPO, setSelectedPO] = useState<string | null>(null);

  const filtered = mockPOs.filter(
    (po) =>
      po.id.toLowerCase().includes(search.toLowerCase()) ||
      po.vendor.toLowerCase().includes(search.toLowerCase()),
  );

  const handleLink = () => {
    if (selectedPO) {
      onMatch?.(selectedPO);
      onOpenChange(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-md p-0 flex flex-col">
        <SheetHeader className="px-6 pt-6 pb-4 border-b border-border shrink-0">
          <SheetTitle className="text-lg font-semibold text-foreground flex items-center gap-2">
            <Link2 className="h-5 w-5 text-primary" />
            Match Purchase Order
          </SheetTitle>
          <SheetDescription className="text-sm text-muted-foreground">
            Link this invoice to an existing purchase order for 3-way matching
          </SheetDescription>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto">
          {/* Invoice summary */}
          <div className="px-6 py-4 bg-secondary/30 border-b border-border">
            <p className="text-[11px] font-medium text-muted-foreground mb-2 uppercase tracking-wider">Invoice Details</p>
            <div className="grid grid-cols-2 gap-3">
              <div className="flex items-center gap-2 text-sm">
                <Building2 className="h-3.5 w-3.5 text-muted-foreground" />
                <span className="text-foreground font-medium">{vendorName}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <DollarSign className="h-3.5 w-3.5 text-muted-foreground" />
                <span className="text-foreground font-medium">{invoiceAmount}</span>
              </div>
            </div>
          </div>

          {/* Search */}
          <div className="px-6 py-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by PO number or vendor..."
                className="w-full pl-10 pr-4 py-2.5 border border-border rounded-lg bg-card text-sm text-foreground placeholder:text-muted-foreground/50 outline-none focus:border-primary/40 transition-colors"
              />
            </div>
          </div>

          {/* PO list */}
          <div className="px-6 space-y-2 pb-6">
            <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider mb-3">
              Suggested Matches ({filtered.length})
            </p>
            {filtered.map((po) => {
              const isSelected = selectedPO === po.id;
              const isHighMatch = po.matchScore >= 90;
              return (
                <button
                  key={po.id}
                  onClick={() => setSelectedPO(isSelected ? null : po.id)}
                  className={`w-full text-left rounded-lg border p-4 transition-all ${
                    isSelected
                      ? "border-primary bg-primary/5 shadow-sm"
                      : "border-border bg-card hover:bg-accent/30 hover:border-muted-foreground/30"
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Hash className="h-3.5 w-3.5 text-muted-foreground" />
                      <span className="text-sm font-semibold text-foreground">{po.id}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        isHighMatch ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"
                      }`}>
                        {po.matchScore}% match
                      </span>
                      {isSelected && <CheckCircle2 className="h-4 w-4 text-primary" />}
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Building2 className="h-3 w-3" />{po.vendor}
                    </div>
                    <div className="flex items-center gap-1">
                      <DollarSign className="h-3 w-3" />{po.amount}
                    </div>
                    <div className="flex items-center gap-1">
                      <CalendarIcon className="h-3 w-3" />{po.date}
                    </div>
                  </div>
                  <div className="mt-2 flex items-center gap-1.5">
                    <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded border ${
                      po.status === "Open" ? "border-emerald-200 text-emerald-600 bg-emerald-50" : "border-amber-200 text-amber-600 bg-amber-50"
                    }`}>{po.status}</span>
                    {po.amount !== invoiceAmount && (
                      <span className="text-[10px] text-amber-600 flex items-center gap-0.5">
                        <AlertTriangle className="h-2.5 w-2.5" />Amount mismatch
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="shrink-0 border-t border-border px-6 py-4 bg-card">
          <button
            onClick={handleLink}
            disabled={!selectedPO}
            className="w-full flex items-center justify-center gap-2 text-sm font-semibold bg-primary text-primary-foreground rounded-lg px-4 py-2.5 hover:bg-primary/90 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            <Link2 className="h-4 w-4" />
            Link Purchase Order
          </button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
