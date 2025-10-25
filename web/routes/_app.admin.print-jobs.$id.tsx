import { useMemo } from "react";
import { useNavigate } from "react-router";
import { Provider as GadgetProvider } from "@gadgetinc/react";
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
import { StatusBadge } from "@/components/app/status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { api } from "../api";
import type { Route } from "./+types/_app.admin.print-jobs.$id";

export const loader = async ({ context, params }: Route.LoaderArgs) => {
  const printJob = await context.api.printJob.findOne(params.id, {
    select: {
      id: true,
      printJobId: true,
      status: true,
      printDate: true,
      order: {
        id: true,
        orderId: true,
        orderDate: true,
        total: true,
        status: true,
        seller: {
          id: true,
          name: true,
          vendor: {
            id: true,
            name: true,
          },
        },
        shipment: {
          id: true,
          trackingNumber: true,
          shipmentDate: true,
        },
        payment: {
          id: true,
          amount: true,
          paymentDate: true,
        },
      },
    },
  });

  return { printJob };
};

export default function AdminPrintJobDetail({ loaderData }: Route.ComponentProps) {
  const navigate = useNavigate();
  const { printJob } = loaderData;
  const dateTime = new Intl.DateTimeFormat(undefined, { dateStyle: "medium", timeStyle: "short" });
  const currency = useMemo(() => new Intl.NumberFormat(undefined, { style: "currency", currency: "USD" }), []);

  return (
    <GadgetProvider api={api}>
      <div className="space-y-6">
      <PageHeader
        title={`Print job ${printJob.printJobId}`}
        description={
          printJob.printDate
            ? `Scheduled ${dateTime.format(new Date(printJob.printDate))}`
            : "Not yet scheduled"
        }
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
              <StatusBadge status={printJob.status} kind="printJob" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Seller: {printJob.order?.seller?.name ?? "—"}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Linked order</CardDescription>
            <CardTitle>{printJob.order?.orderId ?? "—"}</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            Keep fulfillment teams aligned with latest routing context.
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Order summary</CardDescription>
            <CardTitle>{printJob.order?.orderId ?? "—"}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex justify-between text-muted-foreground">
              <span>Seller</span>
              <span>{printJob.order?.seller?.name ?? "—"}</span>
            </div>
            <div className="flex justify-between text-muted-foreground">
              <span>Order date</span>
              <span>
                {printJob.order?.orderDate
                  ? dateTime.format(new Date(printJob.order.orderDate))
                  : "—"}
              </span>
            </div>
            <div className="flex justify-between text-muted-foreground">
              <span>Total value</span>
              <span>
                {printJob.order?.total != null ? currency.format(printJob.order.total) : "—"}
              </span>
            </div>
            <div className="flex justify-between text-muted-foreground">
              <span>Shipment</span>
              <span>{printJob.order?.shipment?.trackingNumber ?? "Not scheduled"}</span>
            </div>
            <div className="flex justify-between text-muted-foreground">
              <span>Payment</span>
              <span>
                {printJob.order?.payment?.amount != null ? currency.format(printJob.order.payment.amount) : "Not captured"}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Production record</CardTitle>
          <CardDescription>Adjust job metadata, status, and order linkage.</CardDescription>
        </CardHeader>
        <CardContent>
          <AutoForm
            action={api.printJob.update}
            findBy={printJob.id}
            onSuccess={() => navigate("/admin/print-jobs")}
          >
            <SubmitResultBanner />
            <div className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <AutoInput field="printJobId" />
                <AutoEnumInput field="status" />
              </div>
              <AutoDateTimePicker field="printDate" />
              <div>
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
    </GadgetProvider>
  );
}
