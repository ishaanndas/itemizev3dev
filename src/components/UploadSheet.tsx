import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  Upload, FileText, Receipt, ShoppingCart, File, Sparkles,
  X, CheckCircle2, Loader2,
} from "lucide-react";
import {
  Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription,
} from "@/components/ui/sheet";
import { Progress } from "@/components/ui/progress";

type DocType = "credit_note" | "invoice" | "purchase_order" | "receipt" | "other";

const docTypes: { key: DocType; label: string; icon: React.ElementType }[] = [
  { key: "credit_note", label: "Credit Note", icon: File },
  { key: "invoice", label: "Invoice", icon: FileText },
  { key: "purchase_order", label: "Purchase Order", icon: ShoppingCart },
  { key: "receipt", label: "Receipt", icon: Receipt },
  { key: "other", label: "Other / Auto-detect", icon: Sparkles },
];

type UploadState = "idle" | "uploading" | "processing" | "done";

export default function UploadSheet({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const navigate = useNavigate();
  const [selectedType, setSelectedType] = useState<DocType>("other");
  const [dragOver, setDragOver] = useState(false);
  const [uploadState, setUploadState] = useState<UploadState>("idle");
  const [progress, setProgress] = useState(0);
  const [fileName, setFileName] = useState("");

  const resetState = useCallback(() => {
    setUploadState("idle");
    setProgress(0);
    setFileName("");
    setSelectedType("other");
    setDragOver(false);
  }, []);

  const handleClose = useCallback(
    (v: boolean) => {
      if (!v) resetState();
      onOpenChange(v);
    },
    [onOpenChange, resetState],
  );

  const simulateUpload = useCallback(
    (name: string) => {
      setFileName(name);
      setUploadState("uploading");
      setProgress(0);

      // Simulate upload progress
      let p = 0;
      const uploadInterval = setInterval(() => {
        p += Math.random() * 25 + 10;
        if (p >= 100) {
          p = 100;
          clearInterval(uploadInterval);
          setProgress(100);
          // Switch to processing
          setTimeout(() => {
            setUploadState("processing");
            setProgress(0);
            let pp = 0;
            const processInterval = setInterval(() => {
              pp += Math.random() * 15 + 5;
              if (pp >= 100) {
                pp = 100;
                clearInterval(processInterval);
                setProgress(100);
                setTimeout(() => setUploadState("done"), 600);
              }
              setProgress(Math.min(pp, 100));
            }, 300);
          }, 400);
        }
        setProgress(Math.min(p, 100));
      }, 200);
    },
    [],
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      const file = e.dataTransfer.files?.[0];
      if (file) simulateUpload(file.name);
    },
    [simulateUpload],
  );

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) simulateUpload(file.name);
    },
    [simulateUpload],
  );

  const handleViewDocument = useCallback(() => {
    handleClose(false);
    navigate("/documents/500192897");
  }, [handleClose, navigate]);

  return (
    <Sheet open={open} onOpenChange={handleClose}>
      <SheetContent side="right" className="w-full sm:max-w-md p-0 flex flex-col">
        <SheetHeader className="px-6 pt-6 pb-4 border-b border-border shrink-0">
          <SheetTitle className="text-lg font-semibold text-foreground">Upload Documents</SheetTitle>
          <SheetDescription className="text-sm text-muted-foreground">
            Upload invoices, receipts, and purchase orders for AI-powered processing
          </SheetDescription>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">
          {/* Upload state: idle */}
          {uploadState === "idle" && (
            <>
              {/* Drop zone */}
              <div
                onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleDrop}
                className={`relative border-2 border-dashed rounded-xl p-8 transition-all duration-200 text-center cursor-pointer ${
                  dragOver
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-muted-foreground/40 hover:bg-accent/30"
                }`}
              >
                <input
                  type="file"
                  accept=".pdf,.png,.jpg,.jpeg,.tiff,.tif"
                  onChange={handleFileSelect}
                  className="absolute inset-0 opacity-0 cursor-pointer"
                />
                <Upload className={`h-8 w-8 mx-auto mb-3 ${dragOver ? "text-primary" : "text-muted-foreground/40"}`} />
                <p className="text-sm font-semibold text-foreground">Drag & drop files here</p>
                <p className="text-xs text-muted-foreground mt-1">
                  or click to browse · PDF, PNG, JPG, TIFF · Max 50MB per file
                </p>
              </div>

              {/* Document Type */}
              <div>
                <h3 className="text-sm font-semibold text-foreground mb-3">Document Type</h3>
                <div className="grid grid-cols-2 gap-2">
                  {docTypes.map((dt) => {
                    const Icon = dt.icon;
                    const isSelected = selectedType === dt.key;
                    return (
                      <button
                        key={dt.key}
                        onClick={() => setSelectedType(dt.key)}
                        className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg border text-sm font-medium transition-all text-left ${
                          isSelected
                            ? "border-primary bg-primary/5 text-primary"
                            : "border-border text-foreground hover:bg-accent/30"
                        }`}
                      >
                        <Icon className={`h-4 w-4 shrink-0 ${isSelected ? "text-primary" : "text-muted-foreground"}`} />
                        {dt.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            </>
          )}

          {/* Upload / processing state */}
          {(uploadState === "uploading" || uploadState === "processing") && (
            <div className="flex flex-col items-center justify-center py-12 space-y-6">
              <div className="relative">
                <div className="h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center">
                  {uploadState === "uploading" ? (
                    <Upload className="h-7 w-7 text-primary animate-pulse" />
                  ) : (
                    <Sparkles className="h-7 w-7 text-primary animate-pulse" />
                  )}
                </div>
              </div>

              <div className="text-center space-y-1">
                <p className="text-sm font-semibold text-foreground">
                  {uploadState === "uploading" ? "Uploading document..." : "Extracting fields..."}
                </p>
                <p className="text-xs text-muted-foreground">
                  {uploadState === "uploading"
                    ? fileName
                    : "AI is reading and extracting data from your document"}
                </p>
              </div>

              <div className="w-full max-w-xs space-y-2">
                <Progress value={progress} className="h-2" />
                <p className="text-[11px] text-muted-foreground text-center tabular-nums">
                  {Math.round(progress)}%
                </p>
              </div>

              {uploadState === "processing" && (
                <div className="w-full max-w-xs space-y-2 mt-2">
                  {[
                    { label: "Reading document", done: progress > 20 },
                    { label: "Extracting vendor info", done: progress > 45 },
                    { label: "Parsing line items", done: progress > 70 },
                    { label: "Validating amounts", done: progress > 90 },
                  ].map((step) => (
                    <div key={step.label} className="flex items-center gap-2 text-xs">
                      {step.done ? (
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                      ) : (
                        <Loader2 className="h-3.5 w-3.5 text-muted-foreground animate-spin shrink-0" />
                      )}
                      <span className={step.done ? "text-foreground" : "text-muted-foreground"}>
                        {step.label}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Done state */}
          {uploadState === "done" && (
            <div className="flex flex-col items-center justify-center py-12 space-y-6">
              <div className="h-16 w-16 rounded-2xl bg-emerald-50 flex items-center justify-center">
                <CheckCircle2 className="h-8 w-8 text-emerald-500" />
              </div>
              <div className="text-center space-y-1">
                <p className="text-sm font-semibold text-foreground">Document processed</p>
                <p className="text-xs text-muted-foreground">
                  All fields have been extracted and are ready for review
                </p>
              </div>
              <div className="w-full max-w-xs space-y-2">
                <button
                  onClick={handleViewDocument}
                  className="w-full flex items-center justify-center gap-2 text-sm font-semibold bg-primary text-primary-foreground rounded-lg px-4 py-2.5 hover:bg-primary/90 transition-colors"
                >
                  <FileText className="h-4 w-4" />
                  Review Document
                </button>
                <button
                  onClick={resetState}
                  className="w-full text-sm font-medium text-muted-foreground hover:text-foreground transition-colors py-2"
                >
                  Upload another
                </button>
              </div>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
