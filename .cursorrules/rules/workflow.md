Operating Rules for AI-Assisted Work

- Plan first
  - Produce a short, verifiable plan before code changes.
  - Keep one step in progress; update as steps complete.

- Keep context tight
  - Reference `.cursorrules/context/*` as the single source of truth.
  - Avoid pulling in unrelated code or proposing broad refactors.

- Match project patterns
  - Use existing components under `web/components/ui/*` and route patterns in `web/routes/*`.
  - Prefer TypeScript clarity over cleverness; small diffs > big rewrites.

- Prototype thin verticals
  - Ship a minimal load → edit → validate → save path before polishing.
  - Defer optional extras until the core path is solid.

- Validate aggressively
  - Define validation at the boundary; mirror client and server rules.
  - Prevent duplicates/overlaps as early as possible.

- Diff discipline
  - Small, reversible commits; focused on one concern.
  - Never introduce dependencies without explicit approval.

- QA gating
  - Run the audit checklist (`context/audit-template.md`) before PR.
  - Only mark acceptance criteria complete when demonstrably satisfied.

