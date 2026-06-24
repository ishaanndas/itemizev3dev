import { useMemo, useState } from "react";
import { Brain, Check, Link2, Search, Sparkles, X } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

interface POMatchingSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  invoiceAmount: string;
  vendorName: string;
  onMatch: (poId: string) => void;
}

interface POCandidate {
  id: string;
  total: string;
  date: string;
  status: string;
  confidence: number;
  reason: string;
}

const POOL: POCandidate[] = [
  {
    id: "PO-7720",
    total: "$2,500.00",
    date: "Jun 12, 2026",
    status: "Open",
    confidence: 96,
    reason: "Vendor + amount range + recent activity",
  },
  {
    id: "PO-7733",
    total: "$4,000.00",
    date: "Jun 17, 2026",
    status: "Open",
    confidence: 78,
    reason: "Same vendor, different project",
  },
  {
    id: "PO-7619",
    total: "$2,000.00",
    date: "May 31, 2026",
    status: "Receiving",
    confidence: 64,
    reason: "Vendor match, older period",
  },
];

export default function POMatchingSheet({
  open,
  onOpenChange,
  invoiceAmount,
  vendorName,
  onMatch,
}: POMatchingSheetProps) {
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<string | null>(null);

  const candidates = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return POOL;
    return POOL.filter((p) => p.id.toLowerCase().includes(q));
  }, [query]);

  const handleApply = () => {
    if (selected) {
      onMatch(selected);
      onOpenChange(false);
    }
  };

  const top = POOL[0];

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-md overflow-y-auto p-0">
        <div className="sticky top-0 z-10 bg-background/95 backdrop-blur border-b border-border px-6 py-5">
          <SheetHeader className="text-left">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <div className="h-10 w-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                  <Link2 className="h-5 w-5" />
                </div>
                <div className="min-w-0">
                  <SheetTitle className="text-lg">Match to PO</SheetTitle>
                  <SheetDescription className="text-xs mt-0.5">
                    {vendorName || "Vendor"} · {invoiceAmount || "—"}
                  </SheetDescription>
                </div>
              </div>
              <button
                onClick={() => onOpenChange(false)}
                className="h-8 w-8 rounded-md hover:bg-secondary flex items-center justify-center text-muted-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </SheetHeader>
        </div>

        <div className="px-6 py-5 space-y-5">
          {/* AI suggestion */}
          <div className="rounded-xl border border-primary/20 bg-gradient-to-br from-primary/[0.04] to-transparent p-4">
            <div className="flex items-start gap-3">
              <div className="h-8 w-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                <Brain className="h-4 w-4" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <div className="text-xs font-semibold text-foreground">AI Suggested Match</div>
                  <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                    <Sparkles className="h-3 w-3 text-primary" />
                    {top.confidence}% confidence
                  </div>
                </div>
                <p className="text-sm text-foreground/80 leading-relaxed mt-1.5">
                  <span className="font-mono font-semibold">{top.id}</span> · {top.total} ·{" "}
                  {top.date} — {top.reason}.
                </p>
                <button
                  onClick={() => {
                    onMatch(top.id);
                    onOpenChange(false);
                  }}
                  className="mt-2.5 text-[11px] font-medium px-2.5 py-1 rounded-full bg-primary text-primary-foreground hover:bg-primary/90 inline-flex items-center gap-1"
                >
                  <Sparkles className="h-3 w-3" />
                  Accept suggestion
                </button>
              </div>
            </div>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search PO number..."
              className="w-full h-9 pl-9 pr-3 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>

          {/* Candidates */}
          <div>
            <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-2">
              Open POs for {vendorName || "this vendor"}
            </div>
            <div className="space-y-1.5">
              {candidates.map((c) => {
                const isSelected = selected === c.id;
                return (
                  <button
                    key={c.id}
                    onClick={() => setSelected(c.id)}
                    className={`w-full text-left rounded-lg border p-3 transition-colors ${
                      isSelected
                        ? "border-primary/40 bg-primary/[0.04]"
                        : "border-border bg-card hover:bg-secondary/50"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-sm font-semibold text-foreground">
                            {c.id}
                          </span>
                          <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-full bg-secondary text-foreground border border-border">
                            {c.status}
                          </span>
                        </div>
                        <div className="text-[11px] text-muted-foreground mt-0.5">{c.reason}</div>
                      </div>
                      <div className="text-right shrink-0">
                        <div className="text-sm font-semibold tabular-nums text-foreground">
                          {c.total}
                        </div>
                        <div className="text-[10px] text-muted-foreground">{c.date}</div>
                      </div>
                      {isSelected && (
                        <Check className="h-4 w-4 text-primary shrink-0" />
                      )}
                    </div>
                    <div className="mt-2 flex items-center gap-2">
                      <div className="flex-1 h-1 bg-secondary rounded-full overflow-hidden">
                        <div
                          className={`h-full ${
                            c.confidence >= 90
                              ? "bg-emerald-500"
                              : c.confidence >= 75
                                ? "bg-primary"
                                : "bg-amber-500"
                          }`}
                          style={{ width: `${c.confidence}%` }}
                        />
                      </div>
                      <span className="text-[10px] tabular-nums text-muted-foreground">
                        {c.confidence}%
                      </span>
                    </div>
                  </button>
                );
              })}
              {candidates.length === 0 && (
                <div className="text-xs text-muted-foreground text-center py-6">
                  No POs match your search.
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="sticky bottom-0 z-10 bg-background/95 backdrop-blur border-t border-border px-6 py-3 flex items-center justify-end gap-2">
          <button
            onClick={() => onOpenChange(false)}
            className="text-xs font-medium border border-border rounded-lg px-3 py-1.5 hover:bg-secondary text-foreground"
          >
            Cancel
          </button>
          <button
            onClick={handleApply}
            disabled={!selected}
            className="text-xs font-medium rounded-lg px-3.5 py-1.5 bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center gap-1.5"
          >
            <Link2 className="h-3.5 w-3.5" />
            Link PO
          </button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
