Phase-Driven Workflow (condensed)

1) Structure work and chats
- Name threads like `plan/feature-x`, `dev/feature-x`, `qa/feature-x`.
- Keep context small and single-purpose per thread.

2) Centralize context
- Create `.cursorrules/context/` docs per assignment: `request.md`, `acceptance-criteria.md`, images/links.
- Treat these as the single source of truth.

3) Reverse-engineer and align
- Map current domain concepts, data models, routes, UI components, and invariants.
- Call out risks and unknowns early; propose thin slices.

4) Information architecture
- Define the form’s sections, field groups, and state transitions (draft/publish).
- Identify validation rules, duplication/delete flows, and pricing override logic.

5) Implementation plan
- List minimal diffs, file touchpoints, and test cases before editing code.
- Prefer reversible steps; avoid large refactors unless necessary.

6) Scaffold + prototype
- Build a minimal end-to-end path (load → edit → validate → save) before polish.
- Use existing UI primitives; no new deps without approval.

7) Build with tight loops
- Commit in small, focused diffs; keep code readable and typed.
- Maintain UX consistency; guard rails for destructive actions.

8) QA audit and polish
- Run an AI-powered audit to surface risks (security, types, UX, AC gaps).
- Address findings, verify acceptance criteria, then prepare PR.

