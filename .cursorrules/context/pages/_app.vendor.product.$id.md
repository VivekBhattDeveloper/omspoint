Title: _app.vendor.products.$id page

Route file: web/routes/_app.vendor.products.$id.tsx  
Suggested path: /app/vendor/products/:id

Role/Purpose:
* Display a vendor's product details and allow editing inline, including print areas and mockup configuration.

Primary UI Components:
* PageHeader with context-aware title ("Edit product") and breadcrumb navigation
* ProductForm with fields pre-filled from product data
* VariantManager to modify existing variants or add new ones
* MediaUploader to view/add/remove product media
* PrintAreaEditor to update print positions/regions
* MockupConfigurator to edit bounding boxes on uploaded images
* Save, Cancel, and Delete buttons (Delete optional and confirmable)

Data Dependencies:
* Loader fetches vendorProduct by ID with nested variants, media, print area definitions, and mockup configuration
* Action updates the product record via api.vendorProduct.update with nested writes

Actions & Side Effects:
* On save, updates the product and stays on the same page or shows success toast
* Delete action prompts confirmation, then redirects to index
* Handle is editable but defaults from title if untouched
* Field-level error messaging and validation
* Mockup configuration is stored as JSON with coordinates, dimensions, and image reference

Acceptance Criteria:
* Product can be safely edited without data loss
* Vendors can only access/edit their own products
* Form renders consistently whether fields are filled or empty
* Mockup and print areas persist correctly on update
* Any changes to the image reflect in mockup overlay positions

QA & Tests:
* Unit: Preloaded form values, update payload structure
* E2E: View + edit flow, image/media interaction, mockup editing
* Accessibility: Confirm modals, labelled inputs, role-based guards

Notes:
* Consider versioning or warning if editing a product that is in live use
* PrintAreaEditor and MockupConfigurator should have visual overlays and snapping grid
* In future: preview customer customization UI based on configured print area
