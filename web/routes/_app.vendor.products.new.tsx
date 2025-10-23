import { useNavigate } from "react-router";
import {
  AutoBelongsToInput,
  AutoBooleanInput,
  AutoDateTimePicker,
  AutoEnumInput,
  AutoForm,
  AutoInput,
  AutoJSONInput,
  AutoRichTextInput,
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
    <div className="space-y-6">
      <PageHeader
        title="Create vendor product"
        description="Add a vendor-managed product so production teams can map variants and media."
        actions={
          <Button variant="outline" onClick={() => navigate(-1)}>
            Cancel
          </Button>
        }
      />

      <Card>
        <CardHeader>
          <CardTitle>Product details</CardTitle>
          <CardDescription>Provide manufacturing metadata before attaching variants and media.</CardDescription>
        </CardHeader>
        <CardContent>
          <AutoForm
            action={api.vendorProduct.create}
            onSuccess={() => navigate("/vendor/products")}
          >
            <SubmitResultBanner />
            <div className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <AutoInput field="title" />
                <AutoInput field="handle" />
                <AutoEnumInput field="status" />
                <AutoBelongsToInput field="vendor" />
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <AutoInput field="productType" />
                <AutoInput field="category" />
                <AutoInput field="tags" />
                <AutoInput field="templateSuffix" />
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <AutoDateTimePicker field="publishedAt" />
              </div>
              <AutoRichTextInput field="body" />
              <div className="grid gap-4 md:grid-cols-2">
                <AutoJSONInput field="compareAtPriceRange" />
                <AutoJSONInput field="variantsData" />
                <AutoJSONInput field="orderLineItems" />
              </div>
            </div>
            <div className="flex items-center gap-2 pt-6">
              <AutoSubmit>Create product</AutoSubmit>
              <Button variant="ghost" type="button" onClick={() => navigate(-1)}>
                Cancel
              </Button>
            </div>
          </AutoForm>
        </CardContent>
      </Card>
    </div>
  );
}
