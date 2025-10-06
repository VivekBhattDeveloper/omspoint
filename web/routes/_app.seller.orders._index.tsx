import { useMemo, useState } from "react";
import { useNavigate } from "react-router";
import { AutoTable } from "@/components/auto";
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
import { api } from "../api";

export default function SellerOrdersPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const navigate = useNavigate();

  const filter = useMemo(() => {
    if (!statusFilter) return undefined;
    return { financialStatus: { equals: statusFilter } } as const;
  }, [statusFilter]);
  const currency = useMemo(() => new Intl.NumberFormat(undefined, { style: "currency", currency: "USD" }), []);

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
          <AutoTable
            model={api.shopifyOrder}
            search={search}
            filter={filter}
            onClick={(record) => navigate(`/seller/orders/${record.id}`)}
            columns={[
              { header: "Order ID", field: "name" },
              {
                header: "Status",
                render: ({ record }) => <StatusBadge status={record.financialStatus} />,
              },
              { header: "Customer", render: ({ record }) => record.customer?.displayName ?? "—" },
              {
                header: "Total",
                render: ({ record }) => currency.format(parseFloat(record.totalPrice ?? "0")),
              },
              { header: "Placed", field: "processedAt" },
            ]}
            select={{
              id: true,
              name: true,
              financialStatus: true,
              totalPrice: true,
              processedAt: true,
              customer: { displayName: true },
            }}
          />
        </CardContent>
      </Card>
    </div>
  );
}
