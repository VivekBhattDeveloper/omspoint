import { useMemo } from "react";
import { useNavigate } from "react-router";
import { PageHeader } from "@/components/app/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { api } from "../api";
import { Plus } from "lucide-react";
import type { Route } from "./+types/_app.admin.shipments._index";

type ShipmentStats = {
  total: number;
  methodCounts: Record<string, number>;
  nextShipmentDate?: string | null;
};

type LoaderShipment = {
  id: string;
  trackingNumber: string | null;
  shipmentMethod: string | null;
  shipmentDate: string | null;
  orderId: string | null;
};

type LoaderResult = {
  stats: ShipmentStats;
  shipments: LoaderShipment[];
  isSample: boolean;
  errorMessage?: string;
};

const sampleShipments: LoaderShipment[] = [
  {
    id: "shipment-sample-1",
    trackingNumber: "1Z9999W99999999999",
    shipmentMethod: "ground",
    shipmentDate: "2024-03-02T15:00:00.000Z",
    orderId: "ORD-1112",
  },
  {
    id: "shipment-sample-2",
    trackingNumber: "USPS9400-1111-2222-3333-4444",
    shipmentMethod: "postal",
    shipmentDate: "2024-03-01T18:30:00.000Z",
    orderId: "ORD-1107",
  },
  {
    id: "shipment-sample-3",
    trackingNumber: "FRT-000234",
    shipmentMethod: "freight",
    shipmentDate: "2024-03-04T09:00:00.000Z",
    orderId: "ORD-1120",
  },
];

const computeStats = (shipments: LoaderShipment[]): ShipmentStats => {
  const total = shipments.length;
  const methodCounts = shipments.reduce<Record<string, number>>((counts, record) => {
    const method = record.shipmentMethod ?? "unknown";
    counts[method] = (counts[method] ?? 0) + 1;
    return counts;
  }, {});

  const upcoming = shipments
    .map((record) => record.shipmentDate)
    .filter((value): value is string => Boolean(value))
    .sort();
  const nowISO = new Date().toISOString();
  const nextShipmentDate = upcoming.find((value) => value >= nowISO) ?? upcoming[0] ?? null;

  return { total, methodCounts, nextShipmentDate };
};

export const loader = async ({ context }: Route.LoaderArgs) => {
  try {
    const shipments = await context.api.shipment.findMany({
      select: {
        id: true,
        trackingNumber: true,
        shipmentMethod: true,
        shipmentDate: true,
        order: { orderId: true },
      },
      sort: { shipmentDate: "Descending" },
      first: 250,
    });

    const rows: LoaderShipment[] = shipments.map((record, index) => ({
      id: record.id ?? `shipment-${index}`,
      trackingNumber: record.trackingNumber ?? null,
      shipmentMethod: record.shipmentMethod ?? null,
      shipmentDate: record.shipmentDate instanceof Date 
        ? record.shipmentDate.toISOString() 
        : (typeof record.shipmentDate === "string" ? record.shipmentDate : null),
      orderId: record.order?.orderId ?? null,
    }));

    return {
      stats: computeStats(rows),
      shipments: rows,
      isSample: false,
    } satisfies LoaderResult;
  } catch (error) {
    console.error("Failed to load shipments", error);

    return {
      stats: computeStats(sampleShipments),
      shipments: sampleShipments,
      isSample: true,
      errorMessage: error instanceof Error ? error.message : undefined,
    } satisfies LoaderResult;
  }
};

export default function AdminShipmentsIndex({ loaderData }: Route.ComponentProps) {
  const navigate = useNavigate();
  const dateTime = useMemo(() => new Intl.DateTimeFormat(undefined, { dateStyle: "medium", timeStyle: "short" }), []);
  const number = useMemo(() => new Intl.NumberFormat(undefined, { maximumFractionDigits: 0 }), []);
  const { stats, shipments, isSample, errorMessage } = loaderData;

  const methodEntries = Object.entries(stats.methodCounts).sort(([, aCount], [, bCount]) => bCount - aCount);
  const primaryMethod = methodEntries[0]?.[0] ?? "—";
  const hasShipments = shipments.length > 0;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Shipments"
        description={`Coordinating ${number.format(stats.total)} outbound shipments across carriers.`}
        actions={
          <Button onClick={() => navigate("/admin/shipments/new")}>
            <Plus className="mr-2 h-4 w-4" />
            Schedule shipment
          </Button>
        }
      />

      {isSample && (
        <Alert>
          <AlertTitle>Sample dataset</AlertTitle>
          <AlertDescription>
            Unable to load live shipment data. Showing sample shipments instead.
            {errorMessage ? ` Error: ${errorMessage}` : ""}
          </AlertDescription>
        </Alert>
      )}

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total shipments</CardDescription>
            <CardTitle className="text-3xl">{number.format(stats.total)}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-1 text-sm text-muted-foreground">
            {methodEntries.map(([method, count]) => (
              <div className="flex justify-between" key={method}>
                <span className="uppercase tracking-wide text-xs">{method}</span>
                <span>{number.format(count)}</span>
              </div>
            ))}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Primary method</CardDescription>
            <CardTitle className="text-3xl">
              <Badge variant="outline" className="uppercase tracking-wide text-xs">
                {primaryMethod}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            {number.format((methodEntries.find(([method]) => method === primaryMethod)?.[1] ?? 0))} shipments using this method
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Next dispatch</CardDescription>
            <CardTitle className="text-3xl">
              {stats.nextShipmentDate ? dateTime.format(new Date(stats.nextShipmentDate)) : "—"}
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            Based on earliest scheduled shipment date
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Shipment queue</CardTitle>
          <CardDescription>System-wide perspective on outbound parcels and freight.</CardDescription>
        </CardHeader>
        <CardContent>
          {hasShipments ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tracking</TableHead>
                  <TableHead>Method</TableHead>
                  <TableHead>Ship date</TableHead>
                  <TableHead>Order</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {shipments.map((shipment) => (
                  <TableRow
                    key={shipment.id}
                    tabIndex={0}
                    className="cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
                    onClick={() => navigate(`/admin/shipments/${shipment.id}`)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" || event.key === " ") {
                        event.preventDefault();
                        navigate(`/admin/shipments/${shipment.id}`);
                      }
                    }}
                  >
                    <TableCell className="font-medium">{shipment.trackingNumber ?? "—"}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="uppercase tracking-wide text-xs">
                        {shipment.shipmentMethod ?? "—"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {shipment.shipmentDate ? dateTime.format(new Date(shipment.shipmentDate)) : "—"}
                    </TableCell>
                    <TableCell>{shipment.orderId ?? "—"}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="py-8 text-center text-muted-foreground">No shipments scheduled.</div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
