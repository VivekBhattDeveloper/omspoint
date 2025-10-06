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

export default function VendorOrdersPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const navigate = useNavigate();

  const filter = useMemo(() => {
    if (!statusFilter) return undefined;
    return { status: { equals: statusFilter } } as const;
  }, [statusFilter]);
  const currency = useMemo(() => new Intl.NumberFormat(undefined, { style: "currency", currency: "USD" }), []);

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
          <AutoTable
            model={api.order}
            search={search}
            filter={filter}
            onClick={(record) => navigate(`/vendor/orders/${record.id}`)}
            columns={[
              { header: "Order ID", field: "orderId" },
              {
                header: "Status",
                render: ({ record }) => <StatusBadge status={record.status} />,
              },
              { header: "Seller", field: "seller.name" },
              {
                header: "Total",
                render: ({ record }) => currency.format(parseFloat(record.total || "0")),
              },
              { header: "Order Date", field: "orderDate" },
            ]}
            select={{
              id: true,
              orderId: true,
              status: true,
              total: true,
              orderDate: true,
              seller: { name: true },
            }}
          />
        </CardContent>
      </Card>
    </div>
  );
}
