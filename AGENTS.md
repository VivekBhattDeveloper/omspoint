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
- Edit the generated `schema.gadget.ts` files to add fields, validations, and relationships.
- Sample schema illustrating common field types:
  ```ts
  // .gadget/sync/models/conversation/schema.gadget.ts
  import type { GadgetModel } from "gadget-server";

  export const schema: GadgetModel = {
    type: "gadget/model-schema/v1",
    storageKey: "conversation",
    fields: {
      title: { type: "string", validations: { required: true } },
      status: {
        type: "enum",
        options: ["open", "assigned", "resolved", "closed"],
        validations: { required: true },
        default: "open"
      },
      priority: {
        type: "enum",
        options: ["low", "medium", "high", "urgent"],
        default: "medium"
      },
      assignedAgent: {
        type: "belongsTo",
        parent: { model: "user" }
      },
      customerEmail: {
        type: "email",
        validations: { required: true }
      },
      lastResponseAt: { type: "dateTime" },
      resolvedAt: { type: "dateTime" }
    }
  };
  ```

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
