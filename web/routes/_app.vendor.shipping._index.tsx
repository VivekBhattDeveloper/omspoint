import { useMemo, useState } from "react";
import { useNavigate } from "react-router";
import { PageHeader } from "@/components/app/page-header";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { api } from "../api";
import type { Route } from "./+types/_app.vendor.shipping._index";

interface LoaderShipment {
  id: string;
  trackingNumber: string | null;
  shipmentMethod: string | null;
  shipmentDate: string | null;
  orderId: string | null;
}

interface LoaderResult {
  shipments: LoaderShipment[];
  isSample: boolean;
  errorMessage?: string;
}

const sampleShipments: LoaderShipment[] = [
  {
    id: "sample-shipment-1",
    trackingNumber: "1Z9999W99999999999",
    shipmentMethod: "ground",
    shipmentDate: "2024-03-02T15:00:00.000Z",
    orderId: "ORD-1112",
  },
  {
    id: "sample-shipment-2",
    trackingNumber: "USPS9400-1111-2222-3333-4444",
    shipmentMethod: "air",
    shipmentDate: "2024-03-01T18:30:00.000Z",
    orderId: "ORD-1107",
  },
  {
    id: "sample-shipment-3",
    trackingNumber: "FRT-000234",
    shipmentMethod: "express",
    shipmentDate: "2024-02-28T12:00:00.000Z",
    orderId: "ORD-1099",
  },
];

export const loader = async ({ context }: Route.LoaderArgs) => {
  try {
    const records = await context.api.shipment.findMany({
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

    const shipments: LoaderShipment[] = records.map((record, index) => ({
      id: record.id ?? `shipment-${index}`,
      trackingNumber: record.trackingNumber ?? null,
      shipmentMethod: record.shipmentMethod ?? null,
      shipmentDate: record.shipmentDate ?? null,
      orderId: record.order?.orderId ?? null,
    }));

    return {
      shipments,
      isSample: false,
    } satisfies LoaderResult;
  } catch (error) {
    console.error("Failed to load shipments", error);
    return {
      shipments: sampleShipments,
      isSample: true,
      errorMessage: error instanceof Error ? error.message : undefined,
    } satisfies LoaderResult;
  }
};

export default function VendorShippingPage({ loaderData }: Route.ComponentProps) {
  const [search, setSearch] = useState("");
  const [methodFilter, setMethodFilter] = useState<string | null>(null);
  const navigate = useNavigate();
  const { shipments, isSample, errorMessage } = loaderData;

  const filter = useMemo(() => methodFilter?.toLowerCase() ?? null, [methodFilter]);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return shipments.filter((shipment) => {
      const matchesSearch =
        !term ||
        shipment.trackingNumber?.toLowerCase().includes(term) ||
        shipment.orderId?.toLowerCase().includes(term);
      const matchesMethod = !filter || shipment.shipmentMethod?.toLowerCase() === filter;
      return matchesSearch && matchesMethod;
    });
  }, [shipments, search, filter]);

  const dateFormatter = useMemo(
    () => new Intl.DateTimeFormat(undefined, { dateStyle: "medium", timeStyle: "short" }),
    [],
  );

  const methodBadge = (method?: string | null) => {
    if (!method) return "—";
    return (
      <Badge variant="outline" className="capitalize">
        {method.replace(/-/g, " ")}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Shipping"
        description="Track shipments, carrier methods, and tracking numbers per order."
      />
      <Card>
        <CardHeader>
          <CardTitle>Shipments</CardTitle>
          <CardDescription>Click into a shipment to update tracking or status.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <Input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search shipments…"
              className="max-w-sm"
            />
            <Select value={methodFilter ?? "all"} onValueChange={(value) => setMethodFilter(value === "all" ? null : value)}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Filter method" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All methods</SelectItem>
                <SelectItem value="ground">Ground</SelectItem>
                <SelectItem value="air">Air</SelectItem>
                <SelectItem value="express">Express</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {isSample && (
            <Alert>
              <AlertTitle>Sample dataset</AlertTitle>
              <AlertDescription>
                Unable to load shipments from the API. Displaying sample data instead.
                {errorMessage ? ` Error: ${errorMessage}` : ""}
              </AlertDescription>
            </Alert>
          )}

          {filtered.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tracking #</TableHead>
                  <TableHead>Method</TableHead>
                  <TableHead>Shipment date</TableHead>
                  <TableHead>Order</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((shipment) => (
                  <TableRow
                    key={shipment.id}
                    tabIndex={0}
                    className="cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
                    onClick={() => navigate(`/vendor/shipping/${shipment.id}`)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" || event.key === " ") {
                        event.preventDefault();
                        navigate(`/vendor/shipping/${shipment.id}`);
                      }
                    }}
                  >
                    <TableCell className="font-medium">{shipment.trackingNumber ?? "—"}</TableCell>
                    <TableCell>{methodBadge(shipment.shipmentMethod)}</TableCell>
                    <TableCell>
                      {shipment.shipmentDate ? dateFormatter.format(new Date(shipment.shipmentDate)) : "—"}
                    </TableCell>
                    <TableCell>{shipment.orderId ?? "—"}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="py-8 text-center text-muted-foreground">No shipments match the current filters.</div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
