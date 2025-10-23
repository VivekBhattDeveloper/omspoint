import { useMemo, useState } from "react";
import { useNavigate } from "react-router";
import { PageHeader } from "@/components/app/page-header";
import { StatusBadge } from "@/components/app/status-badge";
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
import type { Route } from "./+types/_app.vendor.orders._index";

type LoaderOrder = {
  id: string;
  orderId: string;
  status: string | null;
  total: number;
  orderDate: string | null;
  sellerName: string | null;
};

type LoaderResult = {
  orders: LoaderOrder[];
  isSample: boolean;
  errorMessage?: string;
};

const sampleOrders: LoaderOrder[] = [
  {
    id: "sample-order-1",
    orderId: "ORD-1024",
    status: "pending",
    total: 284.5,
    orderDate: "2024-03-01T10:30:00.000Z",
    sellerName: "Northwind Market",
  },
  {
    id: "sample-order-2",
    orderId: "ORD-1019",
    status: "shipped",
    total: 149.99,
    orderDate: "2024-02-27T14:15:00.000Z",
    sellerName: "Atlas Apparel",
  },
  {
    id: "sample-order-3",
    orderId: "ORD-1013",
    status: "delivered",
    total: 399.0,
    orderDate: "2024-02-22T08:45:00.000Z",
    sellerName: "Solar Prints",
  },
];

export const loader = async ({ context }: Route.LoaderArgs) => {
  try {
    const records = await context.api.order.findMany({
      select: {
        id: true,
        orderId: true,
        status: true,
        total: true,
        orderDate: true,
        seller: { name: true },
      },
      sort: { orderDate: "Descending" },
      first: 250,
    });

    const orders: LoaderOrder[] = records.map((record, index) => ({
      id: record.id ?? `order-${index}`,
      orderId: record.orderId ?? "Unknown order",
      status: record.status ?? null,
      total: typeof record.total === "number" ? record.total : parseFloat(record.total ?? "0"),
      orderDate: record.orderDate ?? null,
      sellerName: record.seller?.name ?? null,
    }));

    return {
      orders,
      isSample: false,
    } satisfies LoaderResult;
  } catch (error) {
    console.error("Failed to load vendor orders", error);
    return {
      orders: sampleOrders,
      isSample: true,
      errorMessage: error instanceof Error ? error.message : undefined,
    } satisfies LoaderResult;
  }
};

export default function VendorOrdersPage({ loaderData }: Route.ComponentProps) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const navigate = useNavigate();
  const { orders, isSample, errorMessage } = loaderData;

  const filter = useMemo(() => {
    if (!statusFilter) return null;
    return statusFilter.toLowerCase();
  }, [statusFilter]);
  const currency = useMemo(() => new Intl.NumberFormat(undefined, { style: "currency", currency: "USD" }), []);
  const dateFormatter = useMemo(() => new Intl.DateTimeFormat(undefined, { dateStyle: "medium", timeStyle: "short" }), []);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return orders.filter((order) => {
      const matchesSearch = !term
        || order.orderId.toLowerCase().includes(term)
        || order.sellerName?.toLowerCase().includes(term);
      const matchesStatus = !filter || order.status?.toLowerCase() === filter;
      return matchesSearch && matchesStatus;
    });
  }, [orders, search, filter]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Orders"
        description="Monitor intake, production status, and routing outcomes for vendor-assigned orders."
      />
      <Card>
        <CardHeader>
          <CardTitle>Order queue</CardTitle>
          <CardDescription>Search by order ID, status, or seller.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <Input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search orders…"
              className="max-w-sm"
            />
          <div className="flex items-center gap-2">
            <Select value={statusFilter ?? "all"} onValueChange={(value) => setStatusFilter(value === "all" ? null : value)}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter status" />
              </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All statuses</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="shipped">Shipped</SelectItem>
                  <SelectItem value="delivered">Delivered</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
            </Select>
          </div>
        </div>
        {isSample && (
          <Alert>
            <AlertTitle>Sample dataset</AlertTitle>
            <AlertDescription>
              Unable to load vendor orders from the API. Displaying sample data instead.
              {errorMessage ? ` Error: ${errorMessage}` : ""}
            </AlertDescription>
          </Alert>
        )}
        {filtered.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order ID</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Seller</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Order Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((order) => (
                <TableRow
                  key={order.id}
                  tabIndex={0}
                  className="cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
                  onClick={() => navigate(`/vendor/orders/${order.id}`)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" || event.key === " ") {
                      event.preventDefault();
                      navigate(`/vendor/orders/${order.id}`);
                    }
                  }}
                >
                  <TableCell className="font-medium">{order.orderId}</TableCell>
                  <TableCell>
                    <StatusBadge status={order.status ?? undefined} />
                  </TableCell>
                  <TableCell>{order.sellerName ?? "—"}</TableCell>
                  <TableCell>{currency.format(order.total)}</TableCell>
                  <TableCell>
                    {order.orderDate ? dateFormatter.format(new Date(order.orderDate)) : "—"}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <div className="py-8 text-center text-muted-foreground">No orders match the current filters.</div>
        )}
        </CardContent>
      </Card>
    </div>
  );
}
