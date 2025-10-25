Title: _app page
Route file: web/routes/_app.tsx
Suggested path: /app

Role/Purpose
- Authenticated app layout providing persistent navigation, top bar, and role-based route guarding.
- Redirect unauthenticated users to sign-in and funnel signed-in users to allowed areas based on roles (Super Admin/Vendor/Seller).

Primary UI Components
- `DesktopNav` + `MobileNav` sidebars, `OrgSwitcher`, `GlobalSearch`, `NotificationBell`, `HelpMenu`, `SecondaryNavigation`.
- `ErrorBoundary` wrapping `<Outlet>` content.
- `UserIcon` summary in header; responsive layout with header + scrollable main.

Data Dependencies
- Loader pulls session, fetches `context.api.user.findOne(userId)` and reads roles.
- Determines allowed path prefixes and redirect targets per role; falls back to `/sign-in` when unauthenticated.

Actions & Side Effects
- Loader redirects if user missing or accesses disallowed route segment.
- Org switcher updates local state and navigates to `/admin`, `/vendor`, or `/seller`.
- Error boundary logs rendering errors to console.

Acceptance Criteria
- Unauthenticated requests redirect to sign-in; unauthorized routes redirect to role default.
- Layout renders navigation + header consistently across breakpoints.
- OrgSwitcher navigation updates both state and route; SecondaryNavigation receives user context.
- Downstream pages can access combined outlet context (`AuthOutletContext`).

QA & Tests
- Manual: Verify redirects for each role (Super Admin/Vendor/Seller) and unauthorized path.
- Manual: Switch orgs and confirm navigation occurs.
- Automated: Unit tests for loader role-prefix logic; integration smoke for layout render.

Notes
- Keep role/route mapping centralized here; update allowed prefixes when new sections added.
- Consider instrumenting error boundary for observability instead of console logs.
