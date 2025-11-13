# Agents

## Creating New Models
- Run `ggt add model <modelName>` from the CLI to scaffold a new model.
- Example commands:
  ```bash
  ggt add model conversation
  ggt add model message
  ggt add model chatSession
  ```
- Gadget syncs model metadata to `.gadget/sync/models/<modelName>/schema.gadget.ts` so you can edit schemas locally.

## Managing Model Schemas
⚠️ CRITICAL: Schema Verification Required
Following the incident on [date of the serious error], all data queries MUST 
be preceded by explicit schema verification. Never assume a field's type or 
structure. Always consult the application details model schema before writing 
any query code. This documentation exists to prevent data access errors that 
can break production functionality.

- Before editing make sure it follows gadgets format as per there documentation.
- Edit the generated `schema.gadget.ts` files to add fields, validations, and relationships.
- Sample schema illustrating common field types:

  // .gadget/sync/models/blogPost/schema.gadget.ts
  import type { GadgetModel } from "gadget-server";

  export const schema: GadgetModel = {
    type: "gadget/model-schema/v1",
    storageKey: "DataModel-abc123xyz",
    fields: {
      title: { type: "string", validations: { required: true } },
      body: { type: "richText" },
      publishedAt: { type: "dateTime", includeTime: true },
      author: { 
        type: "belongsTo",
        parent: { model: "user" }
      }
    }
  };

- Schema Best Practices Checklist
     All relationships have both sides defined
     Field names use camelCase
     Required fields have appropriate defaults or are truly necessary
     Unique constraints are on fields that should be unique
     Enum fields have defined options
     DateTime fields have includeTime specified
     BelongsTo fields have clear parent references
     HasMany/HasOne fields reference correct belongsToField
     File fields specify allowPublicAccess appropriately
     Number fields have appropriate decimals setting
     Password fields use password type, not string
     Sensitive data uses encryptedString type

## Adding Actions
- Create model-specific actions with `ggt add action <modelName> <actionName>`.
- Global actions omit the model name: `ggt add action <actionName>`.
- Typical examples:
  ```bash
  ggt add action conversation assignToAgent
  ggt add action conversation updateStatus
  ggt add action message markAsRead
  ```

## Other Useful CLI Commands
- `ggt list models` – inspect available models.
- `ggt deploy` – push local model changes to the cloud environment.
- `ggt pull` – sync the latest cloud changes to your local workspace.
- Working on existing models, such as `catalogValidation`, follows the same pattern: pull the project, edit `.gadget/sync/models/catalogValidation/schema.gadget.ts`, and let Gadget sync the updates.

## Cursor Rules and Context
- This repo uses `.cursorrules` to centralize task intent and execution rules.
- Before making changes, review:
  - `.cursorrules/context/request.md` – task purpose and scope
  - `.cursorrules/context/acceptance-criteria.md` – criteria to satisfy
  - `.cursorrules/context/pages/` – per-page context stubs (one per route)
  - `.cursorrules/context/codebase.md` and `workflow.md` – app architecture and method
  - `.cursorrules/rules/*` – operating, repo, forms, and QA rules
- Always align work to `.cursorrules` guidance. If you must deviate, document why and update the relevant context/rules so they remain the source of truth.
- Keep diffs small, typed, and reversible; validate via the QA checklist in `.cursorrules/context/audit-template.md` before opening a PR.

## Incident Log: Admin Print Jobs Loader
- Impact: Admin print jobs route crashed when the Gadget client was unavailable and rendered nothing while masking the underlying loader failure.
- Resolution: Loader now returns both KPI aggregates and a flattened job list, falling back to curated sample data with guarded error handling that both logs and surfaces the message in the UI (`web/routes/_app.admin.print-jobs._index.tsx:35`).
- Preventive Measures: Replaced the `AutoTable` dependency with a local table to avoid missing provider requirements while keeping keyboard navigation, status badges, and date formatting intact (`web/routes/_app.admin.print-jobs._index.tsx:120`).
- Operator Awareness: Added an in-page alert whenever sample data is displayed so the data source is obvious to admins (`web/routes/_app.admin.print-jobs._index.tsx:97`).
- QA Follow-up: Playwright suites currently fail before exercising this view; rerun once the harness is green to confirm no regressions.

## Testing live page
- Test directly in the browser: open https://omspoint--development.gadget.app and navigate to your routes (e.g., /admin, /vendor, /seller)