import { useMemo } from "react";
import { useNavigate } from "react-router";
import { PageHeader } from "@/components/app/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus } from "lucide-react";
import type { Route } from "./+types/_app.admin.payments._index";

type PaymentStats = {
  total: number;
  totalVolume: number;
  latestPaymentDate?: string | null;
  methodCounts: Record<string, number>;
};

type LoaderPayment = {
  id: string;
  amount: number | null;
  paymentMethod: string | null;
  paymentDate: string | null;
  orderId: string | null;
};

type LoaderResult = {
  stats: PaymentStats;
  payments: LoaderPayment[];
  isSample: boolean;
  errorMessage?: string;
};

const samplePayments: LoaderPayment[] = [
  {
    id: "payment-sample-1",
    amount: 1284.5,
    paymentMethod: "creditCard",
    paymentDate: "2024-02-18T15:30:00.000Z",
    orderId: "ORD-1055",
  },
  {
    id: "payment-sample-2",
    amount: 764.25,
    paymentMethod: "ach",
    paymentDate: "2024-02-17T20:15:00.000Z",
    orderId: "ORD-1047",
  },
  {
    id: "payment-sample-3",
    amount: 329.99,
    paymentMethod: "creditCard",
    paymentDate: "2024-02-16T11:00:00.000Z",
    orderId: "ORD-1039",
  },
];

const computeStats = (payments: LoaderPayment[]): PaymentStats => {
  const total = payments.length;
  const totalVolume = payments.reduce((sum, record) => sum + (record.amount ?? 0), 0);
  const latestPaymentDate = payments
    .map((payment) => payment.paymentDate)
    .filter((value): value is string => Boolean(value))
    .sort()
    .reverse()[0] ?? null;
  const methodCounts = payments.reduce<Record<string, number>>((counts, record) => {
    const method = record.paymentMethod ?? "unknown";
    counts[method] = (counts[method] ?? 0) + 1;
    return counts;
  }, {});

  return { total, totalVolume, latestPaymentDate, methodCounts };
};

export const loader = async ({ context }: Route.LoaderArgs) => {
  try {
    const records = await context.api.payment.findMany({
      select: {
        id: true,
        amount: true,
        paymentMethod: true,
        paymentDate: true,
        order: { orderId: true },
      },
      sort: { paymentDate: "Descending" },
      first: 250,
    });

    const payments: LoaderPayment[] = records.map((record, index) => ({
      id: record.id ?? `payment-${index}`,
      amount: record.amount ?? null,
      paymentMethod: record.paymentMethod ?? null,
      paymentDate: record.paymentDate instanceof Date 
        ? record.paymentDate.toISOString() 
        : (typeof record.paymentDate === "string" ? record.paymentDate : null),
      orderId: record.order?.orderId ?? null,
    }));

    return {
      stats: computeStats(payments),
      payments,
      isSample: false,
    } satisfies LoaderResult;
  } catch (error) {
    console.error("Failed to load payments", error);

    return {
      stats: computeStats(samplePayments),
      payments: samplePayments,
      isSample: true,
      errorMessage: error instanceof Error ? error.message : undefined,
    } satisfies LoaderResult;
  }
};

export default function AdminPaymentsIndex({ loaderData }: Route.ComponentProps) {
  const navigate = useNavigate();
  const currency = useMemo(() => new Intl.NumberFormat(undefined, { style: "currency", currency: "USD" }), []);
  const dateTime = useMemo(() => new Intl.DateTimeFormat(undefined, { dateStyle: "medium", timeStyle: "short" }), []);
  const number = useMemo(() => new Intl.NumberFormat(undefined, { maximumFractionDigits: 0 }), []);
  const { stats, payments, isSample, errorMessage } = loaderData;

  const entries = Object.entries(stats.methodCounts).sort(([, aCount], [, bCount]) => bCount - aCount);
  const primaryMethod = entries[0]?.[0] ?? "—";
  const hasPayments = payments.length > 0;

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

      {isSample && (
        <Alert>
          <AlertTitle>Sample dataset</AlertTitle>
          <AlertDescription>
            Unable to load payment data from the API. Showing sample data instead.
            {errorMessage ? ` Error: ${errorMessage}` : ""}
          </AlertDescription>
        </Alert>
      )}

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
          {hasPayments ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Amount</TableHead>
                  <TableHead>Method</TableHead>
                  <TableHead>Captured</TableHead>
                  <TableHead>Order</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {payments.map((payment) => (
                  <TableRow
                    key={payment.id}
                    tabIndex={0}
                    onClick={() => navigate(`/admin/payments/${payment.id}`)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" || event.key === " ") {
                        event.preventDefault();
                        navigate(`/admin/payments/${payment.id}`);
                      }
                    }}
                    className="cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
                  >
                    <TableCell>
                      <span className="tabular-nums">{currency.format(payment.amount ?? 0)}</span>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="uppercase tracking-wide text-xs">
                        {payment.paymentMethod ?? "—"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {payment.paymentDate ? dateTime.format(new Date(payment.paymentDate)) : "—"}
                    </TableCell>
                    <TableCell>{payment.orderId ?? "—"}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="py-8 text-center text-muted-foreground">No payments recorded.</div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
