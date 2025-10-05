import { useMemo } from "react";
import { useNavigate } from "react-router";
import { PageHeader } from "@/components/app/page-header";
import { AutoTable } from "@/components/auto";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { api } from "../api";
import { Plus } from "lucide-react";
import type { Route } from "./+types/_app.admin.payments._index";

type PaymentStats = {
  total: number;
  totalVolume: number;
  latestPaymentDate?: string | null;
  methodCounts: Record<string, number>;
};

export const loader = async ({ context }: Route.LoaderArgs) => {
  const payments = await context.api.payment.findMany({
    select: {
      id: true,
      amount: true,
      paymentMethod: true,
      paymentDate: true,
    },
    sort: { paymentDate: "Descending" },
    first: 250,
  });

  const total = payments.length;
  const totalVolume = payments.reduce((sum, record) => sum + (record.amount ?? 0), 0);
  const latestPaymentDate = payments[0]?.paymentDate ?? null;
  const methodCounts = payments.reduce<Record<string, number>>((counts, record) => {
    const method = record.paymentMethod ?? "unknown";
    counts[method] = (counts[method] ?? 0) + 1;
    return counts;
  }, {});

  return {
    stats: { total, totalVolume, latestPaymentDate, methodCounts } satisfies PaymentStats,
  };
};

export default function AdminPaymentsIndex({ loaderData }: Route.ComponentProps) {
  const navigate = useNavigate();
  const currency = useMemo(() => new Intl.NumberFormat(undefined, { style: "currency", currency: "USD" }), []);
  const dateTime = useMemo(() => new Intl.DateTimeFormat(undefined, { dateStyle: "medium", timeStyle: "short" }), []);
  const number = useMemo(() => new Intl.NumberFormat(undefined, { maximumFractionDigits: 0 }), []);
  const { stats } = loaderData;

  const entries = Object.entries(stats.methodCounts).sort(([, aCount], [, bCount]) => bCount - aCount);
  const primaryMethod = entries[0]?.[0] ?? "—";

  return (
    <div className="space-y-6">
      <PageHeader
        title="Payments"
        description={`Tracking ${number.format(stats.total)} settlement events totaling ${currency.format(stats.totalVolume)}.`}
        actions={
          <Button onClick={() => navigate("/admin/payments/new")}>
            <Plus className="mr-2 h-4 w-4" />
            Log payment
          </Button>
        }
      />

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total volume</CardDescription>
            <CardTitle className="text-3xl">{currency.format(stats.totalVolume)}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-1 text-sm text-muted-foreground">
            <div>Across {number.format(stats.total)} payments in scope</div>
            {entries.slice(0, 3).map(([method, count]) => (
              <div className="flex justify-between" key={method}>
                <span className="capitalize">{method.replace(/([A-Z])/g, ' $1')}</span>
                <span>{number.format(count)}</span>
              </div>
            ))}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Most used method</CardDescription>
            <CardTitle className="text-3xl">
              <Badge variant="outline" className="uppercase tracking-wide text-xs">
                {primaryMethod === "—" ? primaryMethod : primaryMethod.replace(/([A-Z])/g, ' $1').toUpperCase()}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            {number.format((entries.find(([method]) => method === primaryMethod)?.[1] ?? 0))} occurrences this period
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Latest capture</CardDescription>
            <CardTitle className="text-3xl">
              {stats.latestPaymentDate ? dateTime.format(new Date(stats.latestPaymentDate)) : "—"}
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            Monitors most recent settlement event
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Payment ledger</CardTitle>
          <CardDescription>Canonical ledger of all settlement events tied to commerce orders.</CardDescription>
        </CardHeader>
        <CardContent>
          <AutoTable
            model={api.payment}
            onClick={(payment) => navigate(`/admin/payments/${payment.id}`)}
            columns={[
              {
                header: "Amount",
                render: ({ record }) => (
                  <span className="tabular-nums">{currency.format(record.amount ?? 0)}</span>
                ),
              },
              {
                header: "Method",
                render: ({ record }) => (
                  <Badge variant="outline" className="uppercase tracking-wide text-xs">
                    {record.paymentMethod ?? "—"}
                  </Badge>
                ),
              },
              {
                header: "Captured",
                render: ({ record }) =>
                  record.paymentDate ? dateTime.format(new Date(record.paymentDate)) : "—",
              },
              {
                header: "Order",
                render: ({ record }) => record.order?.orderId ?? "—",
              },
            ]}
            select={{
              id: true,
              amount: true,
              paymentMethod: true,
              paymentDate: true,
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
