import { useMemo, useState } from "react";
import { useNavigate } from "react-router";
import { AutoTable } from "@/components/auto";
import { PageHeader } from "@/components/app/page-header";
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

export default function VendorFinancePage() {
  const [search, setSearch] = useState("");
  const [methodFilter, setMethodFilter] = useState<string | null>(null);
  const navigate = useNavigate();

  const filter = useMemo(() => {
    if (!methodFilter) return undefined;
    return { paymentMethod: { equals: methodFilter } } as const;
  }, [methodFilter]);
  const currency = useMemo(() => new Intl.NumberFormat(undefined, { style: "currency", currency: "USD" }), []);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Finance"
        description="Reconcile statements, monitor payouts, and review payment status."
      />
      <Card>
        <CardHeader>
          <CardTitle>Payments</CardTitle>
          <CardDescription>Linked payments downstream of each order.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <Input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search payments…"
              className="max-w-sm"
            />
            <Select value={methodFilter ?? "all"} onValueChange={(value) => setMethodFilter(value === "all" ? null : value)}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Filter method" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All methods</SelectItem>
                <SelectItem value="creditCard">Credit card</SelectItem>
                <SelectItem value="paypal">PayPal</SelectItem>
                <SelectItem value="bankTransfer">Bank transfer</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <AutoTable
            model={api.payment}
            search={search}
            filter={filter}
            onClick={(record) => navigate(`/vendor/finance/${record.id}`)}
            columns={[
              {
                header: "Amount",
                render: ({ record }) => currency.format(record.amount ?? 0),
              },
              { header: "Method", field: "paymentMethod" },
              { header: "Payment date", field: "paymentDate" },
              { header: "Order", field: "order.orderId" },
            ]}
            select={{
              id: true,
              amount: true,
              paymentMethod: true,
              paymentDate: true,
              order: { orderId: true },
            }}
          />
        </CardContent>
      </Card>
    </div>
  );
}
