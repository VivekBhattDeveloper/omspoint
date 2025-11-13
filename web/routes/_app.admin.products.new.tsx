import { useState } from "react";
import { useNavigate } from "react-router";
import { PageHeader } from "@/components/app/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { api } from "../api";

interface ProductPayload {
  productName: string;
  price: string;
  productDescription: string;
  orderId: string;
}

export default function AdminProductCreate() {
  const navigate = useNavigate();
  const [formValues, setFormValues] = useState<ProductPayload>({
    productName: "",
    price: "",
    productDescription: "",
    orderId: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (field: keyof ProductPayload) =>
    (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setFormValues((current) => ({ ...current, [field]: event.target.value }));
    };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    setError(null);
    try {
      await api.product.create({
        productName: formValues.productName,
        price: parseFloat(formValues.price || "0"),
        productDescription: formValues.productDescription,
        order: formValues.orderId ? { _link: formValues.orderId } : undefined,
      } as any);
      navigate("/admin/products");
    } catch (err) {
      console.error("Failed to create product", err);
      setError(
        err instanceof Error
          ? err.message
          : "Unable to create the product. Please check the values and try again."
      );
      setIsSubmitting(false);
    }
  };

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
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium" htmlFor="productName">
                  Product name
                </label>
                <Input
                  id="productName"
                  value={formValues.productName}
                  onChange={handleChange("productName")}
                  placeholder="Premium Skyline Poster"
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium" htmlFor="price">
                  Price
                </label>
                <Input
                  id="price"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formValues.price}
                  onChange={handleChange("price")}
                  placeholder="89.00"
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium" htmlFor="orderId">
                  Linked order (optional)
                </label>
                <Input
                  id="orderId"
                  value={formValues.orderId}
                  onChange={handleChange("orderId")}
                  placeholder="Order ID"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor="productDescription">
                Product description
              </label>
              <Textarea
                id="productDescription"
                value={formValues.productDescription}
                onChange={handleChange("productDescription")}
                placeholder="Describe the materials, finish, and any production requirements."
                rows={6}
                required
              />
            </div>

            {error ? (
              <Alert variant="destructive">
                <AlertTitle>Failed to create product</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            ) : null}

            <div className="flex items-center gap-2">
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Creating…" : "Create product"}
              </Button>
              <Button variant="ghost" type="button" onClick={() => navigate(-1)}>
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
