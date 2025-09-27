import { useNavigate } from "react-router";
import {
  AutoBelongsToInput,
  AutoDateTimePicker,
  AutoEnumInput,
  AutoForm,
  AutoInput,
  AutoSubmit,
  SubmitResultBanner,
} from "@/components/auto";
import { PageHeader } from "@/components/app/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { api } from "../api";
import type { Route } from "./+types/_app.vendor.shipping.$id";

export const loader = async ({ context, params }: Route.LoaderArgs) => {
  const shipment = await context.api.shipment.findOne(params.id, {
    select: {
      id: true,
      trackingNumber: true,
      shipmentMethod: true,
      shipmentDate: true,
      order: { id: true, orderId: true, seller: { id: true, name: true } },
    },
  });

  return { shipment };
};

export default function VendorShipmentDetail({ loaderData }: Route.ComponentProps) {
  const navigate = useNavigate();
  const { shipment } = loaderData;
  const dateTime = new Intl.DateTimeFormat(undefined, { dateStyle: "medium", timeStyle: "short" });

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Shipment ${shipment.trackingNumber}`}
        description="Adjust carrier data, resend labels, or trigger reprints."
        actions={
          <Button variant="outline" onClick={() => navigate(-1)}>
            Back
          </Button>
        }
      />
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Carrier method</CardDescription>
            <CardTitle>
              {shipment.shipmentMethod ? (
                <Badge variant="outline" className="capitalize">
                  {shipment.shipmentMethod}
                </Badge>
              ) : (
                "—"
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">Tracking #: {shipment.trackingNumber}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Shipment date</CardDescription>
            <CardTitle className="text-lg">
              {shipment.shipmentDate ? dateTime.format(new Date(shipment.shipmentDate)) : "—"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Order: {shipment.order?.orderId ?? "—"}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Customer</CardDescription>
            <CardTitle className="text-lg">
              {shipment.order?.seller?.name ?? "Not assigned"}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            <p>• Share tracking link with seller support.</p>
            <p>• Trigger reprint if carrier marks exception.</p>
            <p>• Sync with finance once delivered.</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Shipment details</CardTitle>
        </CardHeader>
        <CardContent>
          <AutoForm
            action={api.shipment.update}
            findBy={shipment.id}
            onSuccess={() => navigate("/vendor/shipping")}
          >
            <SubmitResultBanner />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <AutoInput field="trackingNumber" />
              <AutoEnumInput field="shipmentMethod" />
              <AutoDateTimePicker field="shipmentDate" />
              <AutoBelongsToInput field="order" />
            </div>
            <div className="flex items-center gap-2 pt-4">
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
