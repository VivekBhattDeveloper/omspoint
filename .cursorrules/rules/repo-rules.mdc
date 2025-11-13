Repo-Specific Rules (omspoint)

General
- Follow `.cursorrules/context/*` as the source of truth for current task intent.
- Keep diffs small and reversible; match existing naming and file layout.
- No new dependencies without prior approval.

Frontend
- Use UI primitives from `web/components/ui/*`; keep labels, errors, and spacing consistent.
- Route files must follow React Router FS conventions and existing segment patterns.
- Use `sonner` for toast feedback; avoid ad-hoc alert flows.
- Prefer explicit state for draft/publish and destructive confirmations.

Backend (Gadget)
- Add/modify invariants in model actions (`api/models/*/actions/*.ts`), not only in the client.
- Keep schemas in `schema.gadget.ts` authoritative; document validation in PRs.
- Respect access control: check `accessControl/permissions.gadget.ts` and apply filters if needed.

Multi-tenancy & Access
- Never bypass tenant scoping when reading or mutating data.
- When adding actions for user or org contexts, reference `filters/user/tenant.gelly` and related patterns.

Validation & Data Integrity
- Mirror server validations on the client for UX, but treat server as the source of truth.
- Prevent duplicates and conflicting states early; return actionable messages.

Testing & QA
- Add unit tests for new logic where feasible; keep them small and deterministic.
- Use the AI QA checklist at `context/audit-template.md` and verify acceptance criteria before PR.

Performance
- Avoid unnecessary re-renders; memoize derived data where beneficial.
- Debounce expensive validations (e.g., large ZIP lists) and batch operations.

