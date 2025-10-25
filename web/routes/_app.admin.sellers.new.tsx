import { useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "react-router";
import { ChevronLeft } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { api } from "../api";
import type { Route } from "./+types/_app.admin.sellers.new";

export const loader = async ({ context }: Route.LoaderArgs) => {
  // Load vendors for the vendor selection dropdown
  const vendors = await context.api.vendor.findMany({
    select: {
      id: true,
      name: true,
    },
    sort: { name: "Ascending" },
  });

  return { vendors };
};

export default function ({ loaderData }: Route.ComponentProps) {
  const { vendors } = loaderData;
  const [formValues, setFormValues] = useState({
    name: "",
    email: "",
    phoneNumber: "",
    address: "",
    city: "",
    state: "",
    zip: "",
    country: "",
    vendorId: vendors[0]?.id ?? "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange =
    (field: keyof typeof formValues) =>
    (event: ChangeEvent<HTMLInputElement>) => {
      setFormValues((current) => ({ ...current, [field]: event.target.value }));
    };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      await api.seller.create({
        name: formValues.name,
        email: formValues.email,
        phoneNumber: formValues.phoneNumber,
        address: formValues.address,
        city: formValues.city,
        state: formValues.state,
        zip: formValues.zip,
        country: formValues.country,
        vendor: formValues.vendorId ? { _link: formValues.vendorId } : undefined,
      });
      window.location.href = "/admin/sellers";
    } catch (err) {
      console.error("Failed to create seller", err);
      setError(err instanceof Error ? err.message : "Unable to create seller. Please try again.");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Breadcrumb and Header */}
      <div className="flex items-center space-x-4">
        <Button variant="ghost" size="sm" asChild>
          <Link to="/admin/sellers" className="flex items-center space-x-2">
            <ChevronLeft className="h-4 w-4" />
            <span>Back to Sellers</span>
          </Link>
        </Button>
        <div className="text-sm text-muted-foreground">/</div>
        <div className="text-sm text-muted-foreground">Add New Seller</div>
      </div>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Add New Seller</h1>
          <p className="text-muted-foreground">
            Create a new seller record with all required information.
          </p>
        </div>
      </div>

      {/* Form Card */}
      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>Seller Information</CardTitle>
          <CardDescription>
            Fill in the details below to create a new seller.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Basic Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Name</Label>
                  <Input id="name" value={formValues.name} onChange={handleChange("name")} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formValues.email}
                    onChange={handleChange("email")}
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="phoneNumber">Phone number</Label>
                <Input
                  id="phoneNumber"
                  value={formValues.phoneNumber}
                  onChange={handleChange("phoneNumber")}
                />
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-medium">Address Information</h3>
              <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                <Input id="address" value={formValues.address} onChange={handleChange("address")} />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="city">City</Label>
                  <Input id="city" value={formValues.city} onChange={handleChange("city")} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="state">State / Province</Label>
                  <Input id="state" value={formValues.state} onChange={handleChange("state")} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="zip">Postal code</Label>
                  <Input id="zip" value={formValues.zip} onChange={handleChange("zip")} />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="country">Country</Label>
                <Input id="country" value={formValues.country} onChange={handleChange("country")} />
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-medium">Vendor Association</h3>
              <div className="space-y-2">
                <Label htmlFor="vendorId">Vendor</Label>
                <Select
                  value={formValues.vendorId}
                  onValueChange={(value) => setFormValues((current) => ({ ...current, vendorId: value }))}
                >
                  <SelectTrigger id="vendorId">
                    <SelectValue placeholder="Select vendor" />
                  </SelectTrigger>
                  <SelectContent>
                    {vendors.length === 0 ? (
                      <SelectItem value="" disabled>
                        No vendors available
                      </SelectItem>
                    ) : (
                      vendors.map((vendor) => (
                        <SelectItem key={vendor.id} value={vendor.id}>
                          {vendor.name}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {error ? (
              <Alert variant="destructive">
                <AlertTitle>Failed to create seller</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            ) : null}

            <div className="flex flex-col sm:flex-row gap-4 pt-6">
              <Button type="submit" disabled={isSubmitting} className="order-1 sm:order-2">
                {isSubmitting ? "Creating…" : "Create Seller"}
              </Button>
              <Button variant="outline" asChild className="order-2 sm:order-1">
                <Link to="/admin/sellers">Cancel</Link>
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
