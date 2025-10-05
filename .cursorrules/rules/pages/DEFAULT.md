Per-Page Rules (Default)
- Use  primitives and existing spacing/typography.
- Keep routing patterns consistent with FS routes; avoid breaking layouts.
- Fetch via Gadget client; mutations go through model actions; enforce invariants server-side.
- Respect  and tenant filters.
- Validate early on client, mirror rules on server; show inline errors.
- Confirm destructive actions; represent draft/publish explicitly when applicable.
- Add small, deterministic unit tests for logic-heavy code; E2E for critical flows.
- No new dependencies without approval; keep diffs small and reversible.
