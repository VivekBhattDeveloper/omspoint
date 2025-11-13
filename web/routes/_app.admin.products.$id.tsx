import { useState } from "react";
import { useNavigate } from "react-router";
import { PageHeader } from "@/components/app/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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

  let orders: { id: string; orderId: string | null; status: string | null }[] = [];

  try {
    orders = await context.api.order.findMany({
      first: 25,
      sort: { createdAt: "Descending" },
      select: {
        id: true,
        orderId: true,
        status: true,
      },
    });
  } catch (error) {
    console.error("Failed to load order options for product editor", error);
  }

  return { product, orders };
};

export default function AdminProductDetail({ loaderData }: Route.ComponentProps) {
  const navigate = useNavigate();
  const { product, orders } = loaderData;
  const currency = new Intl.NumberFormat(undefined, { style: "currency", currency: "USD" });
  const [formValues, setFormValues] = useState({
    productName: product.productName ?? "",
    price: product.price != null ? String(product.price) : "",
    orderId: product.order?.id ?? "none",
    productDescription: product.productDescription?.markdown ?? "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange =
    (field: "productName" | "price" | "productDescription") =>
    (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setFormValues((current) => ({ ...current, [field]: event.target.value }));
    };

  const handleOrderSelect = (value: string) => {
    setFormValues((current) => ({ ...current, orderId: value }));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const price = parseFloat(formValues.price || "0");

      await api.product.update(product.id, {
        productName: formValues.productName,
        price: Number.isFinite(price) ? price : 0,
        productDescription: formValues.productDescription,
        order: formValues.orderId && formValues.orderId !== "none" ? { _link: formValues.orderId } : undefined,
      } as any);

      navigate("/admin/products");
    } catch (err) {
      console.error("Failed to update product", err);
      setError(
        err instanceof Error
          ? err.message
          : "Unable to update the product. Please review the fields and try again."
      );
      setIsSubmitting(false);
    }
  };

  const selectedOrder = formValues.orderId
    ? orders.find((order) => order.id === formValues.orderId)
    : undefined;

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
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="productName">Product name</Label>
                <Input
                  id="productName"
                  value={formValues.productName}
                  onChange={handleChange("productName")}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="price">Price</Label>
                <Input
                  id="price"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formValues.price}
                  onChange={handleChange("price")}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="order">Linked order</Label>
              <Select value={formValues.orderId} onValueChange={handleOrderSelect}>
                <SelectTrigger id="order">
                  <SelectValue placeholder="Select an order" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No order</SelectItem>
                  {orders.map((order) => (
                    <SelectItem key={order.id} value={order.id}>
                      {(order.orderId ?? order.id) + (order.status ? ` • ${order.status}` : "")}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {selectedOrder ? (
                <p className="text-xs text-muted-foreground">
                  Currently linked to order {(selectedOrder.orderId ?? selectedOrder.id)} ({selectedOrder.status ?? "unknown"}
                  ).
                </p>
              ) : (
                <p className="text-xs text-muted-foreground">No order relationship configured.</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="productDescription">Product description</Label>
              <Textarea
                id="productDescription"
                value={formValues.productDescription}
                onChange={handleChange("productDescription")}
                rows={8}
                required
              />
            </div>

            {error ? (
              <Alert variant="destructive">
                <AlertTitle>Failed to update product</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            ) : null}

            <div className="flex items-center gap-2 pt-2">
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Saving…" : "Save changes"}
              </Button>
              <Button variant="ghost" type="button" onClick={() => navigate(-1)}>
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Record details</CardTitle>
          <CardDescription>Metadata for audit and troubleshooting.</CardDescription>
        </CardHeader>
        <CardContent>
          <dl className="grid gap-4 sm:grid-cols-2 text-sm">
            <div>
              <dt className="text-muted-foreground">Created</dt>
              <dd>{new Date(product.createdAt).toLocaleString()}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Last updated</dt>
              <dd>{new Date(product.updatedAt).toLocaleString()}</dd>
            </div>
          </dl>
        </CardContent>
      </Card>
    </div>
  );
}
