import { useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import { useNavigate } from "react-router";
import { PageHeader } from "@/components/app/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { api } from "../api";
import type { Route } from "./+types/_app.admin.payments.$id";

export const loader = async ({ context, params }: Route.LoaderArgs) => {
  const payment = await context.api.payment.findOne(params.id, {
    select: {
      id: true,
      amount: true,
      paymentMethod: true,
      paymentDate: true,
      order: {
        id: true,
        orderId: true,
        total: true,
        status: true,
        orderDate: true,
      },
    },
  });

  let orders: { id: string; orderId: string | null; status: string | null }[] = [];
  try {
    orders = await context.api.order.findMany({
      first: 25,
      sort: { createdAt: "Descending" },
      select: {
        id: true,
        orderId: true,
        status: true,
      },
    });
  } catch (error) {
    console.error("Failed to load order options for payment detail", error);
  }

  return { payment, orders };
};

const toInputDateTime = (value: string | null | undefined) => {
  if (!value) return "";
  try {
    const date = new Date(value);
    const iso = new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString();
    return iso.slice(0, 16);
  } catch {
    return "";
  }
};

export default function AdminPaymentDetail({ loaderData }: Route.ComponentProps) {
  const navigate = useNavigate();
  const { payment, orders } = loaderData;
  const currency = new Intl.NumberFormat(undefined, { style: "currency", currency: "USD" });
  const dateTime = new Intl.DateTimeFormat(undefined, { dateStyle: "medium", timeStyle: "short" });
  const [formValues, setFormValues] = useState({
    amount: payment.amount != null ? String(payment.amount) : "",
    paymentMethod: payment.paymentMethod ?? "creditCard",
    paymentDate: toInputDateTime(payment.paymentDate),
    orderId: payment.order?.id ?? "none",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange =
    (field: "amount" | "paymentDate") =>
    (event: ChangeEvent<HTMLInputElement>) => {
      setFormValues((current) => ({ ...current, [field]: event.target.value }));
    };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const amount = parseFloat(formValues.amount || "0");
      const paymentDate = formValues.paymentDate ? new Date(formValues.paymentDate) : undefined;

      await api.payment.update(payment.id, {
        amount: Number.isFinite(amount) ? amount : 0,
        paymentMethod: formValues.paymentMethod as "creditCard" | "paypal" | "bankTransfer",
        paymentDate: paymentDate ? paymentDate.toISOString() : null,
        order: formValues.orderId && formValues.orderId !== "none" ? { _link: formValues.orderId } : null,
      });

      navigate("/admin/payments");
    } catch (err) {
      console.error("Failed to update payment", err);
      setError(
        err instanceof Error
          ? err.message
          : "Unable to update the payment. Please review the fields and try again."
      );
      setIsSubmitting(false);
    }
  };

  const selectedOrder = formValues.orderId && formValues.orderId !== "none"
    ? orders.find((order) => order.id === formValues.orderId)
    : undefined;

  return (
    <div className="space-y-6">
      <PageHeader
        title={payment.order?.orderId ? `Payment for order ${payment.order.orderId}` : "Payment"}
        description={`Amount ${currency.format(payment.amount ?? 0)} • Captured ${payment.paymentDate ? dateTime.format(new Date(payment.paymentDate)) : "—"}`}
        actions={
          <Button variant="outline" onClick={() => navigate(-1)}>
            Back
          </Button>
        }
      />

      <Card>
        <CardHeader>
          <CardTitle>Payment record</CardTitle>
          <CardDescription>Maintain accurate ledger data and downstream allocations.</CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="amount">Amount</Label>
                <Input
                  id="amount"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formValues.amount}
                  onChange={handleChange("amount")}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="paymentMethod">Payment method</Label>
                <Select
                  value={formValues.paymentMethod}
                  onValueChange={(value) => setFormValues((current) => ({ ...current, paymentMethod: value }))}
                >
                  <SelectTrigger id="paymentMethod">
                    <SelectValue placeholder="Select method" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="creditCard">Credit card</SelectItem>
                    <SelectItem value="paypal">PayPal</SelectItem>
                    <SelectItem value="bankTransfer">Bank transfer</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="paymentDate">Payment date</Label>
                <Input
                  id="paymentDate"
                  type="datetime-local"
                  value={formValues.paymentDate}
                  onChange={handleChange("paymentDate")}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="orderId">Linked order</Label>
                <Select
                  value={formValues.orderId}
                  onValueChange={(value) => setFormValues((current) => ({ ...current, orderId: value }))}
                >
                  <SelectTrigger id="orderId">
                    <SelectValue placeholder="Select order" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No order</SelectItem>
                    {orders.map((order) => (
                      <SelectItem key={order.id} value={order.id}>
                        {(order.orderId ?? order.id) + (order.status ? ` • ${order.status}` : "")}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {selectedOrder ? (
                  <p className="text-xs text-muted-foreground">
                    Currently linked to {(selectedOrder.orderId ?? selectedOrder.id)} ({selectedOrder.status ?? "unknown"}).
                  </p>
                ) : (
                  <p className="text-xs text-muted-foreground">Not linked to an order.</p>
                )}
              </div>
            </div>

            {error ? (
              <Alert variant="destructive">
                <AlertTitle>Failed to update payment</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            ) : null}

            <div className="flex items-center gap-2 pt-6">
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Saving…" : "Save changes"}
              </Button>
              <Button variant="ghost" type="button" onClick={() => navigate(-1)}>
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Record metadata</CardTitle>
          <CardDescription>Useful for reconciliation and audit history.</CardDescription>
        </CardHeader>
        <CardContent>
          <dl className="grid gap-4 sm:grid-cols-2 text-sm">
            <div>
              <dt className="text-muted-foreground">Payment ID</dt>
              <dd>{payment.id}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Order</dt>
              <dd>{payment.order?.orderId ?? "—"}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Order status</dt>
              <dd>{payment.order?.status ?? "—"}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Order total</dt>
              <dd>{payment.order?.total != null ? currency.format(payment.order.total) : "—"}</dd>
            </div>
          </dl>
        </CardContent>
      </Card>
    </div>
  );
}
