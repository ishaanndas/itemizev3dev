import { useMemo, useState } from "react";
import { Mail, ScrollText, Banknote, FileText, Eye, EyeOff, ZoomIn, ZoomOut, Download } from "lucide-react";
import {
  FIELD_STYLES,
  type ExtractedField,
  type SourceDocument,
  type ExtractedToken,
} from "./data";

const KIND_META: Record<SourceDocument["kind"], { icon: typeof Mail; label: string }> = {
  email: { icon: Mail, label: "Email remittance" },
  check: { icon: ScrollText, label: "Lockbox check image" },
  ach: { icon: Banknote, label: "ACH addenda (BAI2)" },
  portal: { icon: FileText, label: "Portal submission" },
};

/** Escape regex special chars in a literal token */
function escapeRe(s: string) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * Wraps every occurrence of a highlight token inside `body` with a styled <mark>.
 * Works on both raw text (check/ach) and HTML (email/portal) — for HTML we apply
 * the marks after structural tags so they don't break layout.
 */
function applyHighlights(body: string, highlights: ExtractedToken[], hoveredField: ExtractedField | null) {
  let out = body;
  // Sort longest-first so "INV-9001" wins over "INV"
  const sorted = [...highlights].sort((a, b) => b.text.length - a.text.length);
  for (const h of sorted) {
    if (!h.text) continue;
    const cls = FIELD_STYLES[h.field].highlight;
    const dim = hoveredField && hoveredField !== h.field ? "opacity-40" : "";
    const re = new RegExp(`(?<!data-mark=")${escapeRe(h.text)}`, "g");
    out = out.replace(
      re,
      `<mark data-mark="1" data-field="${h.field}"${h.matchedInvoice ? ` data-inv="${h.matchedInvoice}"` : ""} class="${cls} ${dim} rounded-sm px-0.5 -mx-0.5 cursor-help transition-opacity">$&</mark>`,
    );
  }
  return out;
}

interface Props {
  doc: SourceDocument;
  /** Highlight only tokens of this field (when user hovers a chip in the match builder) */
  hoveredField?: ExtractedField | null;
  /** Optional click handler for marks (e.g. scroll to invoice in candidates table) */
  onTokenClick?: (token: { field: ExtractedField; text: string; matchedInvoice?: string }) => void;
}

export default function RemittanceDocViewer({ doc, hoveredField = null, onTokenClick }: Props) {
  const [showHighlights, setShowHighlights] = useState(true);
  const [zoom, setZoom] = useState(1);
  const KindIcon = KIND_META[doc.kind].icon;

  const renderedBody = useMemo(
    () => (showHighlights ? applyHighlights(doc.body, doc.highlights, hoveredField) : doc.body),
    [doc.body, doc.highlights, showHighlights, hoveredField],
  );

  // Distinct fields present in this doc — driver for the legend
  const fieldsPresent = useMemo(() => {
    const set = new Set<ExtractedField>();
    doc.highlights.forEach((h) => set.add(h.field));
    return Array.from(set);
  }, [doc.highlights]);

  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!onTokenClick) return;
    const target = e.target as HTMLElement;
    const mark = target.closest("mark[data-mark='1']") as HTMLElement | null;
    if (!mark) return;
    onTokenClick({
      field: mark.dataset.field as ExtractedField,
      text: mark.textContent ?? "",
      matchedInvoice: mark.dataset.inv,
    });
  };

  const isHtml = doc.kind === "email" || doc.kind === "portal";

  return (
    <div className="flex flex-col h-full bg-secondary/30">
      {/* Toolbar */}
      <div className="flex items-center justify-between px-4 h-11 border-b border-border bg-card shrink-0">
        <div className="flex items-center gap-2 min-w-0">
          <KindIcon className="h-4 w-4 text-primary shrink-0" />
          <span className="text-xs font-semibold text-foreground truncate">{KIND_META[doc.kind].label}</span>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setShowHighlights((v) => !v)}
            className="h-7 px-2 inline-flex items-center gap-1 text-[11px] font-medium rounded-md hover:bg-secondary text-muted-foreground"
            title={showHighlights ? "Hide AI highlights" : "Show AI highlights"}
          >
            {showHighlights ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
            {showHighlights ? "Highlights" : "Plain"}
          </button>
          <div className="h-4 w-px bg-border mx-1" />
          <button onClick={() => setZoom((z) => Math.max(0.7, z - 0.1))} className="h-7 w-7 flex items-center justify-center rounded-md hover:bg-secondary text-muted-foreground" title="Zoom out">
            <ZoomOut className="h-3.5 w-3.5" />
          </button>
          <span className="text-[11px] tabular-nums text-muted-foreground w-9 text-center">{Math.round(zoom * 100)}%</span>
          <button onClick={() => setZoom((z) => Math.min(1.5, z + 0.1))} className="h-7 w-7 flex items-center justify-center rounded-md hover:bg-secondary text-muted-foreground" title="Zoom in">
            <ZoomIn className="h-3.5 w-3.5" />
          </button>
          <div className="h-4 w-px bg-border mx-1" />
          <button className="h-7 w-7 flex items-center justify-center rounded-md hover:bg-secondary text-muted-foreground" title="Download original">
            <Download className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* Document surface */}
      <div className="flex-1 overflow-auto p-6">
        <div
          className="mx-auto bg-white dark:bg-card border border-border shadow-sm rounded-md"
          style={{
            width: `${680 * zoom}px`,
            maxWidth: "100%",
            transition: "width 120ms ease-out",
          }}
        >
          {/* Header band */}
          <div className="px-6 py-4 border-b border-border">
            {doc.title && (
              <div className="text-sm font-semibold text-foreground mb-2">{doc.title}</div>
            )}
            <div className="grid grid-cols-3 gap-3">
              {doc.meta.map((m) => (
                <div key={m.label} className="text-[11px]">
                  <div className="text-muted-foreground uppercase tracking-wider">{m.label}</div>
                  <div className="text-foreground font-medium truncate">{m.value}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Body */}
          <div className="px-6 py-5" onClick={handleClick}>
            {isHtml ? (
              <div
                className="prose prose-sm max-w-none text-foreground [&_table]:w-full [&_p]:my-2 [&_b]:font-semibold leading-relaxed"
                style={{ fontFamily: '"Georgia", "Times New Roman", serif', fontSize: "13.5px" }}
                // eslint-disable-next-line react/no-danger
                dangerouslySetInnerHTML={{ __html: renderedBody }}
              />
            ) : (
              <pre
                className="text-foreground whitespace-pre-wrap leading-relaxed"
                style={{ fontFamily: '"SF Mono", "Menlo", "Consolas", monospace', fontSize: "12px" }}
                // eslint-disable-next-line react/no-danger
                dangerouslySetInnerHTML={{ __html: renderedBody }}
              />
            )}
          </div>
        </div>
      </div>

      {/* Legend */}
      {showHighlights && fieldsPresent.length > 0 && (
        <div className="border-t border-border bg-card px-4 py-2 shrink-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">AI extracted</span>
            {fieldsPresent.map((f) => (
              <span key={f} className={`inline-flex items-center gap-1 text-[10px] font-semibold border rounded-full px-2 py-0.5 ${FIELD_STYLES[f].chip}`}>
                {FIELD_STYLES[f].label}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
