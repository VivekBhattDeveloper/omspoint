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

  return { shipment };
};

export default function AdminShipmentDetail({ loaderData }: Route.ComponentProps) {
  const navigate = useNavigate();
  const { shipment } = loaderData;
  const dateTime = new Intl.DateTimeFormat(undefined, { dateStyle: "medium", timeStyle: "short" });

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
          <AutoForm
            action={api.shipment.update}
            findBy={shipment.id}
            onSuccess={() => navigate("/admin/shipments")}
          >
            <SubmitResultBanner />
            <div className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <AutoInput field="trackingNumber" />
                <AutoEnumInput field="shipmentMethod" />
                <AutoDateTimePicker field="shipmentDate" />
              </div>
              <div className="space-y-2">
                <AutoBelongsToInput field="order" />
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
