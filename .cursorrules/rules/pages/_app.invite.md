Inherits: .cursorrules/rules/pages/DEFAULT.md
Route file: web/routes/_app.invite.tsx
Additional rules
- Keep resend guarded by toasts; avoid duplicate requests by disabling button if mutation in flight.
- Modal should remain controlled by parent state; always close via `onOpenChange` to resync focus.
- Ensure AutoTable column labels stay human-friendly and times remain timezone-aware if adapted.
