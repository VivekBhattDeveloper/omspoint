import { useNavigate } from "react-router";
import { Provider as GadgetProvider } from "@gadgetinc/react";
import {
  AutoBelongsToInput,
  AutoBooleanInput,
  AutoDateTimePicker,
  AutoEnumInput,
  AutoForm,
  AutoHasManyForm,
  AutoInput,
  AutoJSONInput,
  AutoNumberInput,
  AutoSubmit,
  SubmitResultBanner,
} from "@/components/auto";
import { PageHeader } from "@/components/app/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { api } from "../api";

export default function VendorProductCreate() {
  const navigate = useNavigate();

  return (
    <GadgetProvider api={api}>
      <div className="space-y-6">
      <PageHeader
        title="New vendor product"
        description="Capture vendor-managed metadata, variants, and mockup configuration before handing off to production."
        actions={
          <Button variant="outline" onClick={() => navigate("/vendor/products")}>
            Cancel
          </Button>
        }
      />

      <AutoForm action={api.vendorProduct.create} onSuccess={() => navigate("/vendor/products")}>
        <SubmitResultBanner />
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Product information</CardTitle>
              <CardDescription>Foundational attributes required to track a vendor-owned item.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <AutoInput field="title" />
                <AutoInput field="handle" />
                <AutoEnumInput field="status" />
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <AutoBelongsToInput field="vendor" />
                <AutoInput field="productType" />
                <AutoInput field="category" />
                <AutoInput field="tags" />
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <AutoInput field="templateSuffix" />
                <AutoDateTimePicker field="publishedAt" />
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <AutoJSONInput field="compareAtPriceRange" />
                <AutoJSONInput field="orderLineItems" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Options</CardTitle>
              <CardDescription>Define option names, ordering, and allowed values before creating variants.</CardDescription>
            </CardHeader>
            <CardContent>
              <AutoHasManyForm field="options" label="Options">
                <div className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <AutoInput field="name" />
                    <AutoNumberInput field="position" />
                  </div>
                  <AutoJSONInput field="values" />
                </div>
              </AutoHasManyForm>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Variants</CardTitle>
              <CardDescription>Capture SKU-level pricing, inventory, and shipping metadata.</CardDescription>
            </CardHeader>
            <CardContent>
              <AutoHasManyForm field="variants" label="Variants">
                <div className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <AutoInput field="title" />
                    <AutoInput field="sku" />
                    <AutoInput field="barcode" />
                    <AutoNumberInput field="position" />
                    <AutoInput field="price" />
                    <AutoInput field="compareAtPrice" />
                    <AutoInput field="unitCost" />
                    <AutoBooleanInput field="availableForSale" />
                    <AutoBooleanInput field="taxable" />
                    <AutoInput field="taxCode" />
                  </div>
                  <div className="grid gap-4 md:grid-cols-2">
                    <AutoInput field="inventoryPolicy" />
                    <AutoNumberInput field="inventoryQuantity" />
                    <AutoBooleanInput field="requiresShipping" />
                    <AutoInput field="shippingProfile" />
                  </div>
                  <div className="grid gap-4 md:grid-cols-3">
                    <AutoInput field="option1" />
                    <AutoInput field="option2" />
                    <AutoInput field="option3" />
                  </div>
                  <AutoJSONInput field="optionLabels" />
                  <div className="grid gap-4 md:grid-cols-2">
                    <AutoNumberInput field="weight" />
                    <AutoInput field="weightUnit" />
                  </div>
                  <AutoBelongsToInput field="inventoryItem" optionLabel="sku" />
                  <AutoInput field="designId" />
                  <AutoJSONInput field="selectedOptions" />
                  <AutoJSONInput field="presentmentPrices" />
                  <AutoHasManyForm field="media" label="Variant media">
                    <div className="space-y-4">
                      <AutoNumberInput field="position" />
                    </div>
                  </AutoHasManyForm>
                </div>
              </AutoHasManyForm>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Product media</CardTitle>
              <CardDescription>Attach reference imagery or assets that apply across all variants.</CardDescription>
            </CardHeader>
            <CardContent>
              <AutoHasManyForm field="media" label="Media">
                  <div className="space-y-4">
                    <AutoNumberInput field="position" />
                  </div>
              </AutoHasManyForm>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Advanced data</CardTitle>
              <CardDescription>Optional advanced inputs for integrations and automation.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2">
              <AutoJSONInput field="variantsData" />
              <AutoJSONInput field="orderLineItems" />
            </CardContent>
          </Card>
        </div>

        <div className="flex items-center gap-2 pt-6">
          <AutoSubmit>Create product</AutoSubmit>
          <Button variant="ghost" type="button" onClick={() => navigate("/vendor/products")}>
            Cancel
          </Button>
        </div>
      </AutoForm>
      </div>
    </GadgetProvider>
  );
}
