import { useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import { useNavigate } from "react-router";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { api } from "../api";

export default function NewVendor() {
  const navigate = useNavigate();
  const [formValues, setFormValues] = useState({
    name: "",
    email: "",
    phoneNumber: "",
    address: "",
    city: "",
    state: "",
    zip: "",
    country: "",
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
      const vendor = await api.vendor.create({ ...formValues });
      navigate(`/admin/vendors/${vendor.id}`);
    } catch (err) {
      console.error("Failed to create vendor", err);
      setError(
        err instanceof Error ? err.message : "Unable to create vendor. Please try again."
      );
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto py-8">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Create New Vendor</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                value={formValues.name}
                onChange={handleChange("name")}
                placeholder="Vendor name"
                required
              />
              <Input
                type="email"
                value={formValues.email}
                onChange={handleChange("email")}
                placeholder="Email"
                required
              />
            </div>

            <Input
              value={formValues.phoneNumber}
              onChange={handleChange("phoneNumber")}
              placeholder="Phone number"
            />

            <Input
              value={formValues.address}
              onChange={handleChange("address")}
              placeholder="Address"
            />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Input
                value={formValues.city}
                onChange={handleChange("city")}
                placeholder="City"
              />
              <Input
                value={formValues.state}
                onChange={handleChange("state")}
                placeholder="State / Province"
              />
              <Input
                value={formValues.zip}
                onChange={handleChange("zip")}
                placeholder="Postal code"
              />
            </div>

            <Input
              value={formValues.country}
              onChange={handleChange("country")}
              placeholder="Country"
            />

            {error ? (
              <Alert variant="destructive">
                <AlertTitle>Failed to create vendor</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            ) : null}

            <div className="flex justify-end space-x-4 pt-6">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate("/admin/vendors")}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Creating…" : "Create Vendor"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
