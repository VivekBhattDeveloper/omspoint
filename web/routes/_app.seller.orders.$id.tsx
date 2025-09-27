import { useNavigate } from "react-router";
import {
  AutoBelongsToInput,
  AutoDateTimePicker,
  AutoEnumInput,
  AutoForm,
  AutoInput,
  AutoNumberInput,
  AutoSubmit,
  SubmitResultBanner,
} from "@/components/auto";
import { PageHeader } from "@/components/app/page-header";
import { StatusBadge } from "@/components/app/status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { api } from "../api";
import type { Route } from "./+types/_app.seller.orders.$id";

export const loader = async ({ context, params }: Route.LoaderArgs) => {
  const order = await context.api.order.findOne(params.id, {
    select: {
      id: true,
      orderId: true,
      status: true,
      total: true,
      orderDate: true,
      seller: { id: true, name: true },
      shipment: { trackingNumber: true, shipmentDate: true },
      printJob: { printJobId: true, status: true },
    },
  });

  return { order };
};

export default function SellerOrderDetail({ loaderData }: Route.ComponentProps) {
  const navigate = useNavigate();
  const { order } = loaderData;
  const currency = new Intl.NumberFormat(undefined, { style: "currency", currency: "USD" });
  const dateTime = new Intl.DateTimeFormat(undefined, { dateStyle: "medium", timeStyle: "short" });

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Order ${order.orderId}`}
        description="Review fulfillment status, adjust notes, or escalate to vendor ops."
        actions={
          <Button variant="outline" onClick={() => navigate(-1)}>
            Back
          </Button>
        }
      />
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Status</CardDescription>
            <CardTitle>
              <StatusBadge status={order.status} />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">Seller: {order.seller?.name ?? "—"}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Financials</CardDescription>
            <CardTitle className="text-2xl">{currency.format(order.total ?? 0)}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Placed: {order.orderDate ? dateTime.format(new Date(order.orderDate)) : "—"}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Fulfillment</CardDescription>
            <CardTitle className="text-lg">Linked data</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            <p>Print job: {order.printJob?.printJobId ?? "Not queued"}</p>
            <p>Shipment: {order.shipment?.trackingNumber ?? "Not shipped"}</p>
            <p>ETA: {order.shipment?.shipmentDate ? dateTime.format(new Date(order.shipment.shipmentDate)) : "—"}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Order details</CardTitle>
        </CardHeader>
        <CardContent>
          <AutoForm
            action={api.order.update}
            findBy={order.id}
            onSuccess={() => navigate("/seller/orders")}
          >
            <SubmitResultBanner />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <AutoInput field="orderId" />
              <AutoEnumInput field="status" />
              <AutoDateTimePicker field="orderDate" />
              <AutoNumberInput field="total" />
              <AutoBelongsToInput field="seller" />
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
