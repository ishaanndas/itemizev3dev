---
name: data-table
description: Reusable Excel-like DataTable with column reorder, pin start/end, show/hide; inline editing only in Documents
type: feature
---
All app tables use `src/components/data-table/DataTable.tsx` for consistent UX:
- Drag-to-reorder columns (header drag via @dnd-kit, plus list-drag in Columns popover)
- Pin column to start or end via Columns popover
- Show/hide columns via Columns popover
- Per-table state persisted in localStorage under key `dt:<storageKey>`
- Sticky checkbox (left) and Actions (right) columns
- Inline cell editing is **only enabled in Documents module** (set `editable: true` on a column AND pass `onCellSave` prop). Other tables (Pending Review, My Tasks) are read-only.
