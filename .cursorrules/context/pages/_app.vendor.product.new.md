Title: _app.vendor.products._create page

Route file: web/routes/_app.vendor.products._create.tsx  
Suggested path: /app/vendor/products/new

Role/Purpose:
* Allow vendors to create a new product in their catalog with all required metadata, media, variants, and mockup configuration.

Primary UI Components:
* PageHeader with title "New product"
* ProductForm with blank/default fields
* VariantManager to add variants
* MediaUploader to attach product images
* PrintAreaEditor to define print regions (optional)
* MockupConfigurator to define printable bounding boxes on uploaded images
* Save and Cancel buttons

Data Dependencies:
* No loader required; uses default initial form values
* Form submission posts to api.vendorProduct.create with nested variants/media/print config/mockup config

Actions & Side Effects:
* On submit, product is created and user is redirected to /app/vendor/products or /app/vendor/products/:id
* Handle is auto-generated from title unless manually overridden
* Field-level validation (title, at least one variant, etc.)
* Image upload preview available before saving
* MockupConfigurator stores data as JSON with bounding box dimensions and links to image ID

Acceptance Criteria:
* Product is not created if required fields are missing
* Mockup config must be saved correctly and tied to an image
* Form is accessible and keyboard-navigable
* Errors are clearly shown and recoverable
* Vendor cannot spoof ownership or access other vendor scopes

QA & Tests:
* Unit: Form validation logic, mockup config shape
* E2E: Full product creation flow with and without media/mockup
* Accessibility: Required fields have labels and descriptions

Notes:
* Optimistic UI can show loading spinner during submission
* Consider autosave in future iterations for long forms
* Add visual snap grid or aspect ratio lock for MockupConfigurator
