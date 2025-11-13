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
import type { Route } from "./+types/_app.admin.shipments.$id";

export const loader = async ({ context, params }: Route.LoaderArgs) => {
  const shipment = await context.api.shipment.findOne(params.id, {
    select: {
      id: true,
      trackingNumber: true,
      shipmentMethod: true,
      shipmentDate: true,
      createdAt: true,
      updatedAt: true,
      order: {
        id: true,
        orderId: true,
        orderDate: true,
        status: true,
        total: true,
        seller: { id: true, name: true },
      },
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
    console.error("Failed to load orders for shipment editor", error);
  }

  return { shipment, orders };
};

export default function AdminShipmentDetail({ loaderData }: Route.ComponentProps) {
  const navigate = useNavigate();
  const { shipment, orders } = loaderData;
  const dateTime = new Intl.DateTimeFormat(undefined, { dateStyle: "medium", timeStyle: "short" });
  const shipmentDateValue = shipment.shipmentDate instanceof Date 
    ? shipment.shipmentDate.toISOString()
    : (typeof shipment.shipmentDate === "string" ? shipment.shipmentDate : null);
  const [formValues, setFormValues] = useState({
    trackingNumber: shipment.trackingNumber ?? "",
    shipmentMethod: shipment.shipmentMethod ?? "ground",
    shipmentDate: shipmentDateValue
      ? new Date(new Date(shipmentDateValue).getTime() - new Date().getTimezoneOffset() * 60000)
          .toISOString()
          .slice(0, 16)
      : "",
    orderId: shipment.order?.id ?? "none",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange =
    (field: "trackingNumber" | "shipmentDate") =>
    (event: ChangeEvent<HTMLInputElement>) => {
      setFormValues((current) => ({ ...current, [field]: event.target.value }));
    };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const shipmentDate = formValues.shipmentDate ? new Date(formValues.shipmentDate) : undefined;

      await api.shipment.update(shipment.id, {
        trackingNumber: formValues.trackingNumber,
        shipmentMethod: formValues.shipmentMethod as "ground" | "air" | "express",
        shipmentDate: shipmentDate ? shipmentDate.toISOString() : null,
        order: formValues.orderId && formValues.orderId !== "none" ? { _link: formValues.orderId } : null,
      });

      navigate("/admin/shipments");
    } catch (err) {
      console.error("Failed to update shipment", err);
      setError(
        err instanceof Error
          ? err.message
          : "Unable to update the shipment. Please review the fields and try again."
      );
      setIsSubmitting(false);
    }
  };

  const selectedOrder = formValues.orderId && formValues.orderId !== "none"
    ? orders.find((order) => order.id === formValues.orderId)
    : undefined;

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Shipment ${shipment.trackingNumber}`}
        description={
          shipment.shipmentDate
            ? `Scheduled for ${dateTime.format(new Date(shipment.shipmentDate))}`
            : "Schedule pending"
        }
        actions={
          <Button variant="outline" onClick={() => navigate(-1)}>
            Back
          </Button>
        }
      />

      <Card>
        <CardHeader>
          <CardTitle>Shipment details</CardTitle>
          <CardDescription>Update carrier method, dispatch timing, and order linkage.</CardDescription>
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
                  onValueChange={(value) =>
                    setFormValues((current) => ({
                      ...current,
                      shipmentMethod: value as typeof current.shipmentMethod,
                    }))
                  }
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
                <Label htmlFor="orderId">Linked order</Label>
                <Select
                  value={formValues.orderId}
                  onValueChange={(value) => setFormValues((current) => ({ ...current, orderId: value }))}
                >
                  <SelectTrigger id="orderId">
                    <SelectValue placeholder="Select order" />
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
                    Currently linked to {(selectedOrder.orderId ?? selectedOrder.id)} ({selectedOrder.status ?? "unknown"}).
                  </p>
                ) : (
                  <p className="text-xs text-muted-foreground">Not linked to an order.</p>
                )}
              </div>
            </div>

            {error ? (
              <Alert variant="destructive">
                <AlertTitle>Failed to update shipment</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            ) : null}

            <div className="flex items-center gap-2 pt-6">
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
          <CardTitle>Record metadata</CardTitle>
          <CardDescription>Helpful context for audit and reconciliation.</CardDescription>
        </CardHeader>
        <CardContent>
          <dl className="grid gap-4 sm:grid-cols-2 text-sm">
            <div>
              <dt className="text-muted-foreground">Shipment ID</dt>
              <dd>{shipment.id}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Linked order</dt>
              <dd>{shipment.order?.orderId ?? "—"}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Order status</dt>
              <dd>{shipment.order?.status ?? "—"}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Order total</dt>
              <dd>{shipment.order?.total != null ? shipment.order.total.toLocaleString(undefined, { style: "currency", currency: "USD" }) : "—"}</dd>
            </div>
          </dl>
        </CardContent>
      </Card>
    </div>
  );
}
