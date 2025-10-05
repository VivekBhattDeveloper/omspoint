Title: _app.admin.invites.$id page
Route file: web/routes/_app.admin.invites.$id.tsx
Suggested path: /app/admin/invites/:id

Role/Purpose
- Edit invitation details (email, token) and return to list.

Primary UI Components
- PageHeader with Back
- Card with AutoForm bound to `api.invite.update` and `findBy` invite.id
- Inputs: `AutoInput(email)`, `AutoInput(inviteToken)`

Data Dependencies
- Loader: `api.invite.findOne(id)` selects id, email, inviteToken
- Action: `api.invite.update` (email unique)

Actions & Side Effects
- On success navigate to `/admin/invites`
- Unique email conflicts should be surfaced inline

Acceptance Criteria
- Users can edit email/token; duplicate email is blocked with clear error
- Save returns to list; cancel returns without changes

QA & Tests
- TODO (unit: tests/unit/admin-invites.test.tsx): unique email conflict mapping; update payload
- TODO (e2e: tests/e2e/admin-invites.spec.ts): edit invite and verify list reflects changes

Notes
- Scaffold generated; refine before development.
