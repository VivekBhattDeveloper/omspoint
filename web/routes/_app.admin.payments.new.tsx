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

export default function AdminPaymentCreate() {
  const navigate = useNavigate();
  const [formValues, setFormValues] = useState({
    amount: "",
    paymentMethod: "creditCard",
    paymentDate: new Date().toISOString().slice(0, 16), // yyyy-MM-ddTHH:mm
    orderId: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange =
    (field: "amount" | "paymentDate" | "orderId") =>
    (event: ChangeEvent<HTMLInputElement>) => {
      setFormValues((current) => ({ ...current, [field]: event.target.value }));
    };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const amount = parseFloat(formValues.amount || "0");
      const paymentDate = formValues.paymentDate ? new Date(formValues.paymentDate) : new Date();

      await api.payment.create({
        amount: Number.isFinite(amount) ? amount : 0,
        paymentMethod: formValues.paymentMethod as "creditCard" | "paypal" | "bankTransfer",
        paymentDate: paymentDate.toISOString(),
        order: formValues.orderId ? { _link: formValues.orderId } : undefined,
      });

      navigate("/admin/payments");
    } catch (err) {
      console.error("Failed to create payment", err);
      setError(
        err instanceof Error
          ? err.message
          : "Unable to create the payment. Please double-check the details and try again."
      );
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Log payment"
        description="Record a capture event or offline reconciliation entry."
        actions={
          <Button variant="outline" onClick={() => navigate(-1)}>
            Cancel
          </Button>
        }
      />

      <Card>
        <CardHeader>
          <CardTitle>Payment details</CardTitle>
          <CardDescription>Provide the source, amount, timing, and order linkage.</CardDescription>
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
                <Label htmlFor="orderId">Linked order (optional)</Label>
                <Input
                  id="orderId"
                  value={formValues.orderId}
                  onChange={handleChange("orderId")}
                  placeholder="Order ID"
                />
              </div>
            </div>

            {error ? (
              <Alert variant="destructive">
                <AlertTitle>Failed to create payment</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            ) : null}

            <div className="flex items-center gap-2 pt-6">
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Saving…" : "Save payment"}
              </Button>
              <Button variant="ghost" type="button" onClick={() => navigate(-1)}>
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
