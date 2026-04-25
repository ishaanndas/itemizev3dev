# Memory: index.md
Updated: today

# Project Memory

## Core
- **Aesthetic**: Premium minimal SaaS. Dark navy branding, Inter font.
- **Interactions**: Prioritize side-popout sheets over modal dialogs.
- **Search/Nav**: Global ⌘K command palette for pages/actions. Admin/Settings are in top-right profile dropdown.
- **Data Entry**: AI pre-fills fields directly without a manual approve step.
- **Tech Stack**: Vite requires `dedupe: ["react", "react-dom"]` for `@xyflow/react` compatibility.
- **Products**: Two parallel products (Payables + Cash App) toggled via sidebar switcher; active product persisted in localStorage via ProductContext.

## Memories
- [Navigation Hierarchy](mem://ui/navigation-hierarchy) — Task-oriented sidebar hierarchy and menu placements
- [Sidebar Behavior](mem://ui/sidebar-behavior) — Collapsible sidebar layout via SidebarProvider context
- [Design Aesthetic](mem://ui/design-aesthetic) — Premium minimal SaaS typography, branding, and patterns
- [Header Actions](mem://ui/header/actions) — Global upload slide-out sheet and processing states
- [Table Design](mem://ui/table-design) — High-density inline-editable processing tables
- [Dashboard](mem://features/dashboard-interface) — Single-view task and metric focused overview
- [Document Detail View](mem://features/document-detail-view) — Split-pane processing interface and validation logic
- [Documents Management](mem://features/documents-management) — Documents page multiselect filtering and list sub-items
- [Approval Policies](mem://features/approval-policies) — Workflow builder uses 3 node types (Trigger, Step, Condition) instead of 5
- [Cash Application MVD](mem://features/cash-application-mvd) — Parallel Cash App product with sidebar toggle, matching split-pane, posting files
- [Technical Dependencies](mem://constraints/technical-dependencies) — Vite React deduplication constraint
