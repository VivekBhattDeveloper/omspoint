import { Link, useNavigate } from "react-router";
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
import { Provider as GadgetProvider } from "@gadgetinc/react";
import { api } from "../api";
import type { Route } from "./+types/_app.vendor.orders.$id";

export const loader = async ({ context, params }: Route.LoaderArgs) => {
  const order = await context.api.order.findOne(params.id, {
    select: {
      id: true,
      orderId: true,
      status: true,
      orderDate: true,
      total: true,
      seller: { id: true, name: true },
      printJob: { id: true, printJobId: true, status: true, printDate: true },
      shipment: { id: true, trackingNumber: true, shipmentMethod: true, shipmentDate: true },
      payment: { id: true, amount: true, paymentDate: true, paymentMethod: true },
    },
  });

  return { order };
};

export default function VendorOrderDetail({ loaderData }: Route.ComponentProps) {
  const navigate = useNavigate();
  const { order } = loaderData;
  const currency = new Intl.NumberFormat(undefined, { style: "currency", currency: "USD" });
  const dateTime = new Intl.DateTimeFormat(undefined, { dateStyle: "medium", timeStyle: "short" });

  return (
    <GadgetProvider api={api}>
      <div className="space-y-6">
      <PageHeader
        title={`Order ${order.orderId}`}
        description="Update status, confirm totals, and align seller expectations."
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
            <CardDescription>Total value</CardDescription>
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
            <CardDescription>Linked workflow</CardDescription>
            <CardTitle className="text-2xl">Progress</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <RelatedLink
              label="Print job"
              value={order.printJob?.printJobId}
              to={order.printJob ? `/vendor/print-jobs/${order.printJob.id}` : undefined}
              fallback="Not generated"
            />
            <RelatedLink
              label="Shipment"
              value={order.shipment?.trackingNumber}
              to={order.shipment ? `/vendor/shipping/${order.shipment.id}` : undefined}
              fallback="Not scheduled"
            />
            <RelatedLink
              label="Payment"
              value={order.payment ? currency.format(order.payment.amount ?? 0) : undefined}
              to={order.payment ? `/vendor/finance/${order.payment.id}` : undefined}
              fallback="Not captured"
            />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Order details</CardTitle>
        </CardHeader>
        <CardContent>
          <AutoForm action={api.order.update} findBy={order.id} onSuccess={() => navigate("/vendor/orders")}>
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
              <Button variant="link" asChild type="button">
                <Link to={`/vendor/shipping`}>View shipment</Link>
              </Button>
            </div>
          </AutoForm>
        </CardContent>
      </Card>
    </div>
    </GadgetProvider>
  );
}

const RelatedLink = ({
  label,
  value,
  to,
  fallback,
}: {
  label: string;
  value?: string | null;
  to?: string;
  fallback: string;
}) => {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-muted-foreground">{label}</span>
      {value ? (
        to ? (
          <Button variant="link" asChild className="h-auto p-0 text-sm">
            <Link to={to}>{value}</Link>
          </Button>
        ) : (
          <span>{value}</span>
        )
      ) : (
        <span className="text-muted-foreground">{fallback}</span>
      )}
    </div>
  );
};
