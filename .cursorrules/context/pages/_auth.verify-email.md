Title: _auth.verify-email page
Route file: web/routes/_auth.verify-email.tsx
Suggested path: /auth/verify-email

Role/Purpose
- Consume the verification code from the query string, confirm the user's email with Gadget, and surface success/error messaging.

Primary UI Components
- Plain paragraph messaging; link back to sign-in on success. No additional UI shells.

Data Dependencies
- Loader reads `code` from URL and calls `context.api.user.verifyEmail({ code })`.
- Redirect link uses `gadgetConfig.authentication.signInPath`.

Actions & Side Effects
- Successful verification shows success message with link to sign-in page.
- Failure returns `error.message` and displays error paragraph.

Acceptance Criteria
- Loader handles missing/invalid codes by surfacing error text instead of throwing uncaught exceptions.
- Success state renders link pointing at configured sign-in path.
- Component remains SSR-compatible (no browser-only APIs outside loader).

QA & Tests
- Manual: Visit with valid `code` to ensure confirmation and link display.
- Manual: Visit with invalid/expired code to confirm error message surfaces.
- Automated: Unit test loader to assert success/error payload formatting.

Notes
- Consider adding branded layout/message styling before shipping to customers.
