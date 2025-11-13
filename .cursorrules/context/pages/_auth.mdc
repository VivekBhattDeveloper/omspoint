Title: _auth page
Route file: web/routes/_auth.tsx
Suggested path: /auth

Role/Purpose
- Layout shell for unauthenticated flows (sign-in, sign-up, forgot password, etc.).
- Redirects already-authenticated users to the configured post-login route.

Primary UI Components
- Minimal grid layout centering child routes via `<Outlet>`.

Data Dependencies
- Loader inspects `session.get("user")`; if present, redirects to `gadgetConfig.authentication.redirectOnSuccessfulSignInPath`.

Actions & Side Effects
- Redirects signed-in users away from auth pages to avoid duplicate login flows.
- Propagates root outlet context to child auth routes.

Acceptance Criteria
- Unauthenticated users see nested auth routes; authenticated users are redirected.
- Layout centers content on viewport for consistent auth UI.
- Outlet context remains compatible with child routes requiring shared data.

QA & Tests
- Manual: Visit `/auth/sign-in` signed out vs signed in to confirm redirect behavior.
- Automated: Loader unit test verifying redirect target matches gadget config.

Notes
- Extend with brand background or marketing copy once auth experience is finalized.
