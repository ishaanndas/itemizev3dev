---
name: Cash Application MVD
description: Cash Application / Integrated Receivables module mirrors the AP product as a parallel offering, accessed via product switcher in sidebar
type: feature
---

# Cash Application MVD

A parallel product to AP/Documents, accessed via a "Payables ↔ Cash App" toggle in the sidebar (above the Acme Corp picker). Active product is persisted in localStorage via `ProductContext` (`mem://contexts/ProductContext.tsx`).

## Routes (all under `/cash`)
- `/cash` — Dashboard (KPIs, AR aging, posting cutoff banner, payment sources, recent activity)
- `/cash/payments` — Payments inbox table (lockbox, ACH, wire, email)
- `/cash/open-ar` — Uploaded Open AR file with normalized invoice rows
- `/cash/matching` — Matching queue grouped by Green/Yellow/Red confidence
- `/cash/matching/:id` — Split-pane match detail (Payment + Applied invoices on left 55%, candidate Open AR invoices on right 45%) — mirrors `DocumentDetailContent` pattern
- `/cash/exceptions` — Short-pay, overpayment, unmatched, duplicate, missing remittance queue
- `/cash/posting` — Daily GL posting batches (BATCH-YYYYMMDD) with composition bars and CSV preview matching the PRD Appendix F schema
- `/cash/analytics` — Match rate trend, match-type breakdown, payer performance

## Confidence model
Three levels with consistent styling helpers in `src/components/cash/confidence.tsx`:
- Green = High (auto-apply, emerald)
- Yellow = Medium (review required, amber)
- Red = Low (manual intervention, destructive)

Sample data lives in `src/components/cash/data.ts` (Payment + OpenInvoice fixtures aligned with the PRD's sample GL posting file).

## Product switcher
`ProductSwitcher` inside `AppSidebar` flips `ProductContext.product` between `"ap"` and `"cash"` and navigates to `/` or `/cash`. Sidebar nav config is selected based on the active product.
