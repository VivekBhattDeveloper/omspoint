import { useMemo, useState } from "react";
import { useNavigate } from "react-router";
import { PageHeader } from "@/components/app/page-header";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { StatusBadge } from "@/components/app/status-badge";
import { api } from "../api";
import type { Route } from "./+types/_app.seller.orders._index";

interface LoaderOrder {
  id: string;
  name: string;
  financialStatus: string | null;
  totalPrice: number;
  processedAt: string | null;
  customerName: string | null;
}

interface LoaderResult {
  orders: LoaderOrder[];
  isSample: boolean;
  errorMessage?: string;
}

const sampleOrders: LoaderOrder[] = [
  {
    id: "shopify-order-sample-1",
    name: "#1058",
    financialStatus: "paid",
    totalPrice: 284.5,
    processedAt: "2024-03-02T12:30:00.000Z",
    customerName: "Jordan Smith",
  },
  {
    id: "shopify-order-sample-2",
    name: "#1052",
    financialStatus: "pending",
    totalPrice: 159.99,
    processedAt: "2024-02-28T09:45:00.000Z",
    customerName: "Avery Nguyen",
  },
  {
    id: "shopify-order-sample-3",
    name: "#1046",
    financialStatus: "partially_paid",
    totalPrice: 492.0,
    processedAt: "2024-02-24T15:05:00.000Z",
    customerName: "Morgan Lee",
  },
];

export const loader = async ({ context }: Route.LoaderArgs) => {
  try {
    const records = await context.api.shopifyOrder.findMany({
      select: {
        id: true,
        name: true,
        financialStatus: true,
        totalPrice: true,
        processedAt: true,
        customer: { displayName: true },
      },
      sort: { processedAt: "Descending" },
      first: 250,
    });

    const orders: LoaderOrder[] = records.map((record, index) => ({
      id: record.id ?? `shopify-order-${index}`,
      name: record.name ?? "Unknown order",
      financialStatus: record.financialStatus ?? null,
      totalPrice: parseFloat(record.totalPrice ?? "0"),
      processedAt: record.processedAt instanceof Date 
        ? record.processedAt.toISOString() 
        : (typeof record.processedAt === "string" ? record.processedAt : null),
      customerName: record.customer?.displayName ?? null,
    }));

    return {
      orders,
      isSample: false,
    } satisfies LoaderResult;
  } catch (error) {
    console.error("Failed to load seller orders", error);
    return {
      orders: sampleOrders,
      isSample: true,
      errorMessage: error instanceof Error ? error.message : undefined,
    } satisfies LoaderResult;
  }
};

export default function SellerOrdersPage({ loaderData }: Route.ComponentProps) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const navigate = useNavigate();
  const { orders, isSample, errorMessage } = loaderData;

  const filter = useMemo(() => statusFilter?.toLowerCase() ?? null, [statusFilter]);
  const currency = useMemo(() => new Intl.NumberFormat(undefined, { style: "currency", currency: "USD" }), []);
  const dateFormatter = useMemo(
    () => new Intl.DateTimeFormat(undefined, { dateStyle: "medium", timeStyle: "short" }),
    [],
  );

  const filteredOrders = useMemo(() => {
    const term = search.trim().toLowerCase();
    return orders.filter((order) => {
      const matchesSearch =
        !term ||
        order.name.toLowerCase().includes(term) ||
        order.customerName?.toLowerCase().includes(term);
      const matchesStatus = !filter || order.financialStatus?.toLowerCase() === filter;
      return matchesSearch && matchesStatus;
    });
  }, [orders, search, filter]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Orders"
        description="Review orders across channels, check fulfillment state, and manage exceptions."
      />
      <Card>
        <CardHeader>
          <CardTitle>Order inbox</CardTitle>
          <CardDescription>Search by order ID, status, or customer.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <Input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search orders…"
              className="max-w-sm"
            />
            <Select value={statusFilter ?? "all"} onValueChange={(value) => setStatusFilter(value === "all" ? null : value)}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All statuses</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="authorized">Authorized</SelectItem>
                <SelectItem value="partially_paid">Partially Paid</SelectItem>
                <SelectItem value="paid">Paid</SelectItem>
                <SelectItem value="partially_refunded">Partially Refunded</SelectItem>
                <SelectItem value="refunded">Refunded</SelectItem>
                <SelectItem value="voided">Voided</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {isSample && (
            <Alert>
              <AlertTitle>Sample dataset</AlertTitle>
              <AlertDescription>
                Unable to load order records from the API. Displaying sample data instead.
                {errorMessage ? ` Error: ${errorMessage}` : ""}
              </AlertDescription>
            </Alert>
          )}

          {filteredOrders.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order ID</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Placed</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredOrders.map((order) => (
                  <TableRow
                    key={order.id}
                    tabIndex={0}
                    className="cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
                    onClick={() => navigate(`/seller/orders/${order.id}`)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" || event.key === " ") {
                        event.preventDefault();
                        navigate(`/seller/orders/${order.id}`);
                      }
                    }}
                  >
                    <TableCell className="font-medium">{order.name}</TableCell>
                    <TableCell>
                      <StatusBadge status={order.financialStatus ?? undefined} />
                    </TableCell>
                    <TableCell>{order.customerName ?? "—"}</TableCell>
                    <TableCell>{currency.format(order.totalPrice)}</TableCell>
                    <TableCell>
                      {order.processedAt ? dateFormatter.format(new Date(order.processedAt)) : "—"}
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
