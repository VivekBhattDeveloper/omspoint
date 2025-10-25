import { useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import { useNavigate } from "react-router";
import { PageHeader } from "@/components/app/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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

export default function AdminShipmentCreate() {
  const navigate = useNavigate();
  const [formValues, setFormValues] = useState({
    trackingNumber: "",
    shipmentMethod: "ground",
    shipmentDate: new Date().toISOString().slice(0, 16), // yyyy-MM-ddTHH:mm
    orderId: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange =
    (field: "trackingNumber" | "shipmentDate" | "orderId") =>
    (event: ChangeEvent<HTMLInputElement>) => {
      setFormValues((current) => ({ ...current, [field]: event.target.value }));
    };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const shipmentDate = formValues.shipmentDate ? new Date(formValues.shipmentDate) : new Date();

      await api.shipment.create({
        trackingNumber: formValues.trackingNumber,
        shipmentMethod: formValues.shipmentMethod as "ground" | "air" | "express",
        shipmentDate: shipmentDate.toISOString(),
        order: formValues.orderId ? { _link: formValues.orderId } : undefined,
      });

      navigate("/admin/shipments");
    } catch (err) {
      console.error("Failed to create shipment", err);
      setError(
        err instanceof Error
          ? err.message
          : "Unable to create the shipment. Please review the details and try again."
      );
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Schedule shipment"
        description="Dispatch a new shipment or backfill data from an external carrier."
        actions={
          <Button variant="outline" onClick={() => navigate(-1)}>
            Cancel
          </Button>
        }
      />

      <Card>
        <CardHeader>
          <CardTitle>Shipment details</CardTitle>
          <CardDescription>Provide tracking, method, timing, and linked order.</CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="trackingNumber">Tracking number</Label>
                <Input
                  id="trackingNumber"
                  value={formValues.trackingNumber}
                  onChange={handleChange("trackingNumber")}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="shipmentMethod">Shipment method</Label>
                <Select
                  value={formValues.shipmentMethod}
                  onValueChange={(value) => setFormValues((current) => ({ ...current, shipmentMethod: value }))}
                >
                  <SelectTrigger id="shipmentMethod">
                    <SelectValue placeholder="Select method" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ground">Ground</SelectItem>
                    <SelectItem value="air">Air</SelectItem>
                    <SelectItem value="express">Express</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="shipmentDate">Shipment date</Label>
                <Input
                  id="shipmentDate"
                  type="datetime-local"
                  value={formValues.shipmentDate}
                  onChange={handleChange("shipmentDate")}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="orderId">Linked order (optional)</Label>
                <Input
                  id="orderId"
                  value={formValues.orderId}
                  onChange={handleChange("orderId")}
                  placeholder="Order ID"
                />
              </div>
            </div>

            {error ? (
              <Alert variant="destructive">
                <AlertTitle>Failed to create shipment</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            ) : null}

            <div className="flex items-center gap-2 pt-6">
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Creating…" : "Create shipment"}
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
