Title: _app.vendor.settings._index page
Route file: web/routes/_app.vendor.settings._index.tsx
Suggested path: /app/vendor/settings

Role/Purpose
- Configure payout accounts, compliance docs, escalation contacts, and notification routing for vendor operations.

Primary UI Components
- PageHeader
- Multiple Cards with tables, dialogs, inputs, selects, checkboxes, toasts
- Dialog flows to add payout accounts and compliance docs

Data Dependencies
- Currently seeded client-side via loader; TODO: source from Gadget actions once available
- Future: actions to mutate payout/compliance/contacts/notifications

Actions & Side Effects
- Multiple client-side state mutations with toasts; primary toggles and removal actions
- Dialog forms validate required fields before adding entries

Acceptance Criteria
- Users can add/remove payout accounts and documents; toggle flags; set primary
- Notification routes and escalation contacts editable and persisted client-side for now

QA & Tests
- Consider unit coverage for toggles and reducers when backend is wired
- Consider E2E flows for dialog add/remove once actions are implemented

Notes
- Scaffold generated; refine before development.
