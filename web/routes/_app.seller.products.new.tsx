import { useNavigate } from "react-router";
import {
  AutoBelongsToInput,
  AutoDateTimePicker,
  AutoEnumInput,
  AutoForm,
  AutoInput,
  AutoRichTextInput,
  AutoSubmit,
  SubmitResultBanner,
} from "@/components/auto";
import { PageHeader } from "@/components/app/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { api } from "../api";

export default function SellerProductCreate() {
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Create seller product"
        description="Publish a seller-managed product with variants and media."
        actions={
          <Button variant="outline" onClick={() => navigate(-1)}>
            Cancel
          </Button>
        }
      />

      <Card>
        <CardHeader>
          <CardTitle>Product details</CardTitle>
          <CardDescription>Capture the key identifiers for this product.</CardDescription>
        </CardHeader>
        <CardContent>
          <AutoForm
            action={api.sellerProduct.create}
            onSuccess={() => navigate("/seller/products")}
          >
            <SubmitResultBanner />
            <div className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <AutoInput field="title" />
                <AutoInput field="handle" />
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <AutoEnumInput field="status" />
                <AutoBelongsToInput field="seller" />
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <AutoInput field="productType" />
                <AutoInput field="category" />
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <AutoInput field="tags" />
                <AutoInput field="templateSuffix" />
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <AutoInput field="vendorProductId" />
                <AutoDateTimePicker field="publishedAt" />
              </div>
              <AutoRichTextInput field="body" />
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
