App Codebase Context (omspoint)

Stack
- Frontend: React 19 + React Router 7 FS routes, Tailwind + shadcn/ui, Sonner toaster.
- Backend: Gadget app with TypeScript models/actions and access control.
- Tooling: Vite (Gadget fork), Vitest, Playwright.

Key Directories
- `web/` – Frontend app
  - `web/root.tsx` – App shell, GadgetProvider, Toaster, error boundary.
  - `web/routes.ts` + `react-router.config.ts` – FS routes wiring.
  - `web/routes/*` – Feature routes (e.g., `_app.admin.*`, `_auth.*`, `_public.*`).
  - `web/components/ui/*` – shadcn/ui primitives used across forms and pages.
  - `web/components/app/*`, `web/components/shared/*` – App-level and shared components.
  - `web/api.ts` – Initializes `@gadget-client/omspoint` client.

- `api/models/*` – Gadget models and actions
  - `schema.gadget.ts` – Model schema definitions.
  - `actions/*.ts` – Server-side actions for create/update/delete and domain behaviors.
  - Example models: `order`, `shipment`, `product`, `vendor`, `user`, `catalogValidation`, etc.

- `accessControl/` – Roles, permissions, and filters
  - `permissions.gadget.ts` – Role-to-model grants; action-level filters.
  - `filters/user/tenant.gelly` – Tenant scoping filter for user actions.

- `api/routes/*` – HTTP routes (example: `GET-hello.ts`).

- `tests/` – Unit and E2E tests
  - `tests/unit/*` – Vitest unit suites.
  - `tests/e2e/*` – Playwright specs and config.

- Config
  - `package.json` – Scripts: `build`, `test:unit`, `test:e2e`.
  - `tailwind.config.ts`, `postcss.config.js` – Styling pipeline.
  - `settings.gadget.ts` – App settings.

Data and Access Patterns
- Always go through Gadget actions for mutations; enforce invariants server-side.
- Respect access control from `accessControl/permissions.gadget.ts` and action filters.
- Multi-tenant context appears in admin routes and filters; do not bypass tenant checks.

Frontend Patterns
- Use components from `web/components/ui/*` for consistent UX.
- Keep forms controlled and validate early; mirror server rules.
- Route organization follows React Router FS: segment prefixes like `_app`, `_auth`, `_public`.

Testing
- Prefer targeted unit tests for logic-heavy code (validation/parsing/selectors).
- Use Playwright for end-to-end flows in critical paths.

Commands
- Build: `yarn build`
- Unit tests: `yarn test:unit`
- E2E tests: `yarn test:e2e`

References
- `web/root.tsx` – App wiring with `GadgetProvider` and `Toaster`.
- `web/api.ts` – Client instantiation for API calls.
- `accessControl/permissions.gadget.ts` – Role grants and tenant filters.

