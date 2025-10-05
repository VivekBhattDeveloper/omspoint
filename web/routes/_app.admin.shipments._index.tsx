import { useMemo } from "react";
import { useNavigate } from "react-router";
import { PageHeader } from "@/components/app/page-header";
import { AutoTable } from "@/components/auto";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { api } from "../api";
import { Plus } from "lucide-react";
import type { Route } from "./+types/_app.admin.shipments._index";

type ShipmentStats = {
  total: number;
  methodCounts: Record<string, number>;
  nextShipmentDate?: string | null;
};

export const loader = async ({ context }: Route.LoaderArgs) => {
  const shipments = await context.api.shipment.findMany({
    select: {
      id: true,
      shipmentMethod: true,
      shipmentDate: true,
    },
    sort: { shipmentDate: "Descending" },
    first: 250,
  });

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
  const nextShipmentDate =
    upcoming.find((value) => value >= nowISO) ?? upcoming[0] ?? null;

  return {
    stats: { total, methodCounts, nextShipmentDate } satisfies ShipmentStats,
  };
};

export default function AdminShipmentsIndex({ loaderData }: Route.ComponentProps) {
  const navigate = useNavigate();
  const dateTime = useMemo(() => new Intl.DateTimeFormat(undefined, { dateStyle: "medium", timeStyle: "short" }), []);
  const number = useMemo(() => new Intl.NumberFormat(undefined, { maximumFractionDigits: 0 }), []);
  const { stats } = loaderData;

  const methodEntries = Object.entries(stats.methodCounts).sort(([, aCount], [, bCount]) => bCount - aCount);
  const primaryMethod = methodEntries[0]?.[0] ?? "—";

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
          <AutoTable
            model={api.shipment}
            onClick={(shipment) => navigate(`/admin/shipments/${shipment.id}`)}
            columns={[
              { header: "Tracking", field: "trackingNumber" },
              {
                header: "Method",
                render: ({ record }) => (
                  <Badge variant="outline" className="uppercase tracking-wide text-xs">
                    {record.shipmentMethod ?? "—"}
                  </Badge>
                ),
              },
              {
                header: "Ship date",
                render: ({ record }) =>
                  record.shipmentDate ? dateTime.format(new Date(record.shipmentDate)) : "—",
              },
              {
                header: "Order",
                render: ({ record }) => record.order?.orderId ?? "—",
              },
            ]}
            select={{
              id: true,
              trackingNumber: true,
              shipmentMethod: true,
              shipmentDate: true,
              order: {
                id: true,
                orderId: true,
              },
            }}
          />
        </CardContent>
      </Card>
    </div>
  );
}
