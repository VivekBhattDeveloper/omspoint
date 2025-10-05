import { useNavigate } from "react-router";
import {
  AutoBelongsToInput,
  AutoForm,
  AutoInput,
  AutoNumberInput,
  AutoSubmit,
  SubmitResultBanner,
} from "@/components/auto";
import { PageHeader } from "@/components/app/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { api } from "../api";

export default function AdminProductCreate() {
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Create product"
        description="Add a new product to the master catalog and associate it to downstream orders."
        actions={
          <Button variant="outline" onClick={() => navigate(-1)}>
            Cancel
          </Button>
        }
      />

      <Card>
        <CardHeader>
          <CardTitle>Product details</CardTitle>
          <CardDescription>Provide the core attributes required to activate a SKU.</CardDescription>
        </CardHeader>
        <CardContent>
          <AutoForm
            action={api.product.create}
            include={["productName", "price", "productDescription", "order"]}
            onSuccess={() => navigate("/admin/products")}
          >
            <SubmitResultBanner />
            <div className="grid gap-4 md:grid-cols-2">
              <AutoInput field="productName" />
              <AutoNumberInput field="price" />
              <AutoBelongsToInput field="order" />
            </div>
            <div className="pt-4">
              <AutoInput field="productDescription" />
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
