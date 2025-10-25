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
import { DataState } from "@/components/app/data-state";
import { PageHeader } from "@/components/app/page-header";
import { StatusBadge } from "@/components/app/status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { api } from "../api";
import type { Route } from "./+types/_app.seller.orders.$id";

type LoaderResult = Route.ComponentProps["loaderData"] & {
  isSample?: boolean;
  errorMessage?: string;
};

type SellerOrderRecord = Route.ComponentProps["loaderData"]["order"];

const sampleOrders: Record<string, SellerOrderRecord> = {
  "shopify-order-sample-1": {
    id: "shopify-order-sample-1",
    orderId: "#1058",
    status: "fulfilled",
    total: 284.5,
    orderDate: "2024-03-02T12:30:00.000Z",
    seller: { id: "sample-seller", name: "Marketplace Demo Seller" },
    shipment: {
      trackingNumber: "TRK-1082-US",
      shipmentDate: "2024-03-03T16:00:00.000Z",
    },
    printJob: {
      printJobId: "PRINT-1082",
      status: "printing",
    },
  },
  "shopify-order-sample-2": {
    id: "shopify-order-sample-2",
    orderId: "#1052",
    status: "processing",
    total: 159.99,
    orderDate: "2024-02-28T09:45:00.000Z",
    seller: { id: "sample-seller", name: "Marketplace Demo Seller" },
    shipment: {
      trackingNumber: null,
      shipmentDate: null,
    },
    printJob: {
      printJobId: "PRINT-1079",
      status: "pending",
    },
  },
  "shopify-order-sample-3": {
    id: "shopify-order-sample-3",
    orderId: "#1046",
    status: "partially_fulfilled",
    total: 492,
    orderDate: "2024-02-24T15:05:00.000Z",
    seller: { id: "sample-seller", name: "Marketplace Demo Seller" },
    shipment: {
      trackingNumber: "TRK-1068-INTL",
      shipmentDate: "2024-02-26T10:30:00.000Z",
    },
    printJob: {
      printJobId: "PRINT-1074",
      status: "complete",
    },
  },
};

export const loader = async ({ context, params }: Route.LoaderArgs) => {
  const sampleOrder = sampleOrders[params.id];
  if (sampleOrder) {
    return {
      order: sampleOrder,
      isSample: true,
    } as LoaderResult;
  }

  try {
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

    return {
      order,
      isSample: false,
    } as LoaderResult;
  } catch (error) {
    console.error("Failed to load seller order", error);
    const fallbackOrder = sampleOrders["shopify-order-sample-1"];

    return {
      order:
        fallbackOrder ?? {
          id: params.id,
          orderId: params.id,
          status: "pending",
          total: 0,
          orderDate: null,
          seller: { id: "sample-seller", name: "Marketplace Demo Seller" },
          shipment: { trackingNumber: null, shipmentDate: null },
          printJob: { printJobId: null, status: null },
        },
      isSample: true,
      errorMessage: error instanceof Error ? error.message : undefined,
    } as LoaderResult;
  }
};

export default function SellerOrderDetail({ loaderData }: Route.ComponentProps) {
  const navigate = useNavigate();
  const { order, isSample, errorMessage } = loaderData as LoaderResult;
  const currency = new Intl.NumberFormat(undefined, { style: "currency", currency: "USD" });
  const dateTime = new Intl.DateTimeFormat(undefined, { dateStyle: "medium", timeStyle: "short" });

  if (isSample) {
    return (
      <div className="space-y-6">
        <PageHeader
          title={`Order ${order.orderId ?? order.id}`}
          description="Read-only reference while the order service is unavailable."
          actions={
            <Button variant="outline" onClick={() => navigate(-1)}>
              Back
            </Button>
          }
        />

        <DataState variant="sample">
          {errorMessage ? <span className="block pt-1 text-xs text-muted-foreground">Error: {errorMessage}</span> : null}
        </DataState>

        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Status</CardDescription>
              <CardTitle>
                <StatusBadge status={order.status ?? undefined} />
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
              <p>
                ETA:{" "}
                {order.shipment?.shipmentDate ? dateTime.format(new Date(order.shipment.shipmentDate)) : "—"}
              </p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Order details</CardTitle>
            <CardDescription>Snapshot of key identifiers and associations.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2 text-sm">
            <div>
              <div className="text-muted-foreground">Order ID</div>
              <div className="font-medium">{order.orderId ?? order.id}</div>
            </div>
            <div>
              <div className="text-muted-foreground">Status</div>
              <div className="font-medium">{order.status ?? "Unknown"}</div>
            </div>
            <div>
              <div className="text-muted-foreground">Seller</div>
              <div className="font-medium">{order.seller?.name ?? "—"}</div>
            </div>
            <div>
              <div className="text-muted-foreground">Print job status</div>
              <div className="font-medium">{order.printJob?.status ?? "Pending"}</div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

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
