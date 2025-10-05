Title: _app.admin.invites.new page
Route file: web/routes/_app.admin.invites.new.tsx
Suggested path: /app/admin/invites/new

Role/Purpose
- Issue a new platform invitation to a recipient, optionally with a custom token.

Primary UI Components
- Page header with Cancel
- Card
- AutoForm: `api.invite.create`
- Inputs: `AutoInput(email)`, `AutoInput(inviteToken)`; `SubmitResultBanner`, `AutoSubmit`

Data Dependencies
- Model: `invite` (required unique: `email`; optional: `inviteToken`)
- Action: `api.invite.create`

Actions & Side Effects
- Submit -> create; on success navigate to `/admin/invites`
- Handle unique email conflicts and show clear error

Acceptance Criteria
- Valid email required; duplicate emails rejected
- Invite creation success redirects to list with success state

QA & Tests
- Happy: valid email -> invite created
- Unhappy: duplicate email -> conflict surfaced
- Optional E2E: create invite and verify entry

Notes
- Scaffold generated; refine before development.
