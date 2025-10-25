Title: _app.invite page
Route file: web/routes/_app.invite.tsx
Suggested path: /app/invite

Role/Purpose
- Manage team invitations: view pending invites, resend links, and create new invites.

Primary UI Components
- Page header + primary `Invite` button.
- `Card` containing `AutoTable` over `api.invite` with resend action column.
- `Dialog` modal (`InviteModal`) with email input form.

Data Dependencies
- `AutoTable` fetches invite records via Gadget auto components.
- `useActionForm(api.invite.create)` to send new invites; `useAction(api.invite.resend)` for resend flow.

Actions & Side Effects
- Clicking resend triggers mutation and shows toast success/error.
- Modal submit sends invite and closes on success; cancel button dismisses dialog.

Acceptance Criteria
- Table lists invites with email + sent timestamp; resend button works per row.
- Modal validates email, disables submit while sending, and closes on success.
- Toast feedback surfaces for resend/creation failures.

QA & Tests
- Manual: Resend invite and confirm toast + backend call.
- Manual: Create new invite (valid/invalid email) to check success + error handling.
- Future: Integration test covering invite creation/resend flows.

Notes
- Consider adding pagination/search when invite volume grows.
