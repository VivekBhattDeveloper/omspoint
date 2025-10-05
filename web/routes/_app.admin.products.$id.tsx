import { useNavigate } from "react-router";
import {
  AutoBelongsToInput,
  AutoForm,
  AutoInput,
  AutoNumberInput,
  AutoRichTextInput,
  AutoSubmit,
  SubmitResultBanner,
} from "@/components/auto";
import { PageHeader } from "@/components/app/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { api } from "../api";
import type { Route } from "./+types/_app.admin.products.$id";

export const loader = async ({ context, params }: Route.LoaderArgs) => {
  const product = await context.api.product.findOne(params.id, {
    select: {
      id: true,
      productName: true,
      price: true,
      productDescription: {
        markdown: true,
        truncatedHTML: true,
      },
      order: {
        id: true,
        orderId: true,
        status: true,
      },
      orderId: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  return { product };
};

export default function AdminProductDetail({ loaderData }: Route.ComponentProps) {
  const navigate = useNavigate();
  const { product } = loaderData;
  const currency = new Intl.NumberFormat(undefined, { style: "currency", currency: "USD" });

  const handleFormSuccess = () => {
    navigate("/admin/products");
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title={product.productName ?? "Product"}
        description={`Current price ${currency.format(product.price ?? 0)}${product.order?.orderId ? ` • Linked to order ${product.order.orderId} (${product.order.status})` : " • No order linked"}`}
        actions={
          <Button variant="outline" onClick={() => navigate(-1)}>
            Back
          </Button>
        }
      />

      <Card>
        <CardHeader>
          <CardTitle>Edit Product</CardTitle>
          <CardDescription>
            Update product details, pricing, and order association. The order relationship determines which order this product belongs to.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <AutoForm
            action={api.product.update}
            findBy={product.id}
            onSuccess={handleFormSuccess}
          >
            <SubmitResultBanner />
            <div className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <AutoInput field="productName" />
                <AutoNumberInput field="price" />
              </div>
              <div>
                <AutoBelongsToInput field="order" />
              </div>
              <div>
                <AutoRichTextInput field="productDescription" />
              </div>
            </div>
            <div className="flex items-center gap-2 pt-6">
              <AutoSubmit>Save changes</AutoSubmit>
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
