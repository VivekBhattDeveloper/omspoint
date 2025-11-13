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
import { api } from "../api";
import type { Route } from "./+types/_app.seller.finance._index";

interface LoaderPayment {
  id: string;
  amount: number;
  paymentMethod: string | null;
  paymentDate: string | null;
  orderId: string | null;
}

interface LoaderResult {
  payments: LoaderPayment[];
  isSample: boolean;
  errorMessage?: string;
}

const samplePayments: LoaderPayment[] = [
  {
    id: "seller-payment-sample-1",
    amount: 328.75,
    paymentMethod: "creditCard",
    paymentDate: "2024-03-01T09:45:00.000Z",
    orderId: "ORD-2015",
  },
  {
    id: "seller-payment-sample-2",
    amount: 174.0,
    paymentMethod: "paypal",
    paymentDate: "2024-02-26T15:20:00.000Z",
    orderId: "ORD-2008",
  },
  {
    id: "seller-payment-sample-3",
    amount: 612.4,
    paymentMethod: "bankTransfer",
    paymentDate: "2024-02-22T11:10:00.000Z",
    orderId: "ORD-1999",
  },
];

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
      id: record.id ?? `seller-payment-${index}`,
      amount: typeof record.amount === "number" ? record.amount : parseFloat(record.amount ?? "0"),
      paymentMethod: record.paymentMethod ?? null,
      paymentDate: record.paymentDate instanceof Date 
        ? record.paymentDate.toISOString() 
        : (typeof record.paymentDate === "string" ? record.paymentDate : null),
      orderId: record.order?.orderId ?? null,
    }));

    return {
      payments,
      isSample: false,
    } satisfies LoaderResult;
  } catch (error) {
    console.error("Failed to load seller payments", error);
    return {
      payments: samplePayments,
      isSample: true,
      errorMessage: error instanceof Error ? error.message : undefined,
    } satisfies LoaderResult;
  }
};

export default function SellerFinancePage({ loaderData }: Route.ComponentProps) {
  const navigate = useNavigate();
  const { payments, isSample, errorMessage } = loaderData;
  const [search, setSearch] = useState("");
  const [methodFilter, setMethodFilter] = useState<string | null>(null);

  const currency = useMemo(() => new Intl.NumberFormat(undefined, { style: "currency", currency: "USD" }), []);
  const dateFormatter = useMemo(
    () => new Intl.DateTimeFormat(undefined, { dateStyle: "medium", timeStyle: "short" }),
    [],
  );

  const filteredPayments = useMemo(() => {
    const term = search.trim().toLowerCase();
    return payments.filter((payment) => {
      const matchesSearch =
        !term ||
        payment.orderId?.toLowerCase().includes(term) ||
        payment.paymentMethod?.toLowerCase().includes(term);
      const matchesMethod = !methodFilter || payment.paymentMethod?.toLowerCase() === methodFilter.toLowerCase();
      return matchesSearch && matchesMethod;
    });
  }, [payments, search, methodFilter]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Finance"
        description="Trace settlements, payouts, and reconciliation items across channels."
      />
      <Card>
        <CardHeader>
          <CardTitle>Payout ledger</CardTitle>
          <CardDescription>Settlements tied to each order/payment combination.</CardDescription>
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
                <SelectItem value="creditcard">Credit card</SelectItem>
                <SelectItem value="paypal">PayPal</SelectItem>
                <SelectItem value="banktransfer">Bank transfer</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {isSample && (
            <Alert>
              <AlertTitle>Sample dataset</AlertTitle>
              <AlertDescription>
                Unable to load payment records from the API. Displaying sample data instead.
                {errorMessage ? ` Error: ${errorMessage}` : ""}
              </AlertDescription>
            </Alert>
          )}

          {filteredPayments.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Amount</TableHead>
                  <TableHead>Method</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Order</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPayments.map((payment) => (
                  <TableRow
                    key={payment.id}
                    tabIndex={0}
                    className="cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
                    onClick={() => navigate(`/seller/finance/${payment.id}`)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" || event.key === " ") {
                        event.preventDefault();
                        navigate(`/seller/finance/${payment.id}`);
                      }
                    }}
                  >
                    <TableCell>{currency.format(payment.amount)}</TableCell>
                    <TableCell>{payment.paymentMethod ?? "—"}</TableCell>
                    <TableCell>
                      {payment.paymentDate ? dateFormatter.format(new Date(payment.paymentDate)) : "—"}
                    </TableCell>
                    <TableCell>{payment.orderId ?? "—"}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="py-8 text-center text-muted-foreground">No payments match the current filters.</div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
