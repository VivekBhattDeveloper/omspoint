Title: _auth.sign-in page
Route file: web/routes/_auth.sign-in.tsx
Suggested path: /auth/sign-in

Role/Purpose
- Authenticate users via email/password or Google OAuth and redirect per config.

Primary UI Components
- Card with form
- Inputs: `Input(email)`, `Input(password)`; `Button` submit; Google button link
- Error messages inline using `formState.errors`

Data Dependencies
- Action: `api.user.signIn`
- Config: `gadgetConfig.authentication.redirectOnSuccessfulSignInPath`

Actions & Side Effects
- Submit -> sign in; on success redirect to configured path
- Preserve querystring for OAuth flows (uses `useLocation().search`)

Acceptance Criteria
- Email/password sign-in works; errors shown inline for invalid credentials
- Google OAuth button navigates to `/auth/google/start?{search}`
- Successful sign-in redirects to configured path

QA & Tests
- Happy: valid credentials -> redirect
- Unhappy: invalid credentials -> shows root or field errors
- Check OAuth link preserves query params

Notes
- Scaffold generated; refine before development.
