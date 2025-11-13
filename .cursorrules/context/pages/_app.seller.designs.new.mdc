Title: _app.seller.designs.new — Content Spec (Seller Design Create)

Route file
- web/routes/_app.seller.designs.new.tsx

Path
- /seller/designs/new

---

Role / Purpose
- Provide a guided flow for uploading a new creative asset and registering it in the seller design library.
- Capture metadata needed for approvals: status, discipline, primary channel intent, review notes, and tagging.
- Ensure the output record is immediately usable by the index page KPIs and seller product assignment tools.

Primary Flow
1. Seller lands on the form from “Upload design” CTA.
2. Fill in base metadata (name, slug auto-suggest, discipline).
3. Attach preview asset / link, add operational notes and review tags.
4. Choose initial status (default `draft`) and optionally request review.
5. Save → redirect to `/seller/designs/:id` detail view.

Form Layout
1) Header
   - Title: “New design”
   - Breadcrumb: Seller → Designs → New
   - Actions: `Save` (primary), `Cancel` (back to /seller/designs)

2) Design Details
   - `name` (required, text input)
   - `slug` (required, auto from name; uniqueness check scoped to seller workspace)
   - `designType` (radio or segmented control: print, embroidery, uv, sublimation)
   - `status` selector (draft | inReview | approved | archived) with helper copy describing downstream effects; default `draft`
   - `primaryChannel` text/select (optional; suggestions include connected channels)

3) Asset & Preview
   - Upload widget for preview image / PDF; stores file via seller file service and writes signed url to `previewUrl`
   - Live preview pane showing uploaded asset with zoom/pan
   - Fallback option to paste external URL into `previewUrl` if upload skipped

4) Tagging & Notes
   - Tag input (chips) persisted to `tags` array; enforce 32 char per tag max and dedupe
   - Rich text editor bound to `notes` (for creative brief, approvals context)
   - `lastReviewedAt` read-only until status transitions to `approved`; autopopulated on save when status = approved

5) Review & Save
   - Checkbox “Request creative ops review” toggles status to `inReview` on submit
   - Summary callout reminding what happens after approval

Loader / Action Contracts
- Loader prefetch: current seller id (for owner relationship), connected channel labels for primaryChannel suggestions.
- Action: `context.api.design.create` with payload { name, slug, status, designType, primaryChannel, tags, previewUrl, ownerId, notes }.
- On success: redirect to `/seller/designs/:id`; on validation error, highlight fields with inline messages.

Validation Rules
- Name required; min 3 chars, trimmed.
- Slug required, lowercased, hyphenated; unique per seller; realtime check.
- Preview upload optional, but if absent show reminder that asset must be attached before approval.
- Tags array length <= 10.
- Notes optional but preserve formatting (bold, italic, lists).

Acceptance Criteria
- Form loads with defaults (status=draft, discipline=print) and reflects design schema enums.
- Saving a valid form creates a design record and navigates to detail view with success toast.
- Invalid submissions surface field-level errors without losing entered data.
- Cancel returns seller to `/seller/designs` without mutating data.

QA & Tests
- Manual: create design with upload, confirm new record appears on index with correct status/disciplines.
- Manual: attempt duplicate slug → inline validation message, no submission.
- Unit: slug derive utility, tag dedupe, request review toggle.
- Integration: ensure create action sends ownerId scoped to current seller and handles upload URL writing.

Notes
- Assigned product count stays 0 on create; increment via downstream assignment flows.
- Keep status transitions aligned with approvals workflow; auto-set `lastReviewedAt` only when status becomes approved.
