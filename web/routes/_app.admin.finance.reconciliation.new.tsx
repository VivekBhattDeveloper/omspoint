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
import type { Route } from "./+types/_app.admin.finance.reconciliation.new";

export const loader = async ({ context }: Route.LoaderArgs) => {
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
    console.error("Failed to load orders for reconciliation creation", error);
  }

  return { orders };
};

const STATUS_OPTIONS = [
  { value: "pending", label: "Pending" },
  { value: "complete", label: "Complete" },
  { value: "failed", label: "Failed" },
];

export default function AdminFinanceReconciliationCreate({ loaderData }: Route.ComponentProps) {
  const { orders } = loaderData;
  const navigate = useNavigate();
  const [formValues, setFormValues] = useState({
    reconciliationId: "",
    status: "pending",
    reconciliationDate: new Date().toISOString().slice(0, 16),
    orderId: "none",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange =
    (field: "reconciliationId" | "reconciliationDate" | "orderId") =>
    (event: ChangeEvent<HTMLInputElement>) => {
      setFormValues((current) => ({ ...current, [field]: event.target.value }));
    };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const reconciliationDate = formValues.reconciliationDate
        ? new Date(formValues.reconciliationDate)
        : new Date();

      await api.financeReconciliation.create({
        reconciliationId: formValues.reconciliationId,
        status: formValues.status as "pending" | "complete" | "failed",
        reconciliationDate: reconciliationDate.toISOString(),
        order: formValues.orderId && formValues.orderId !== "none" ? { _link: formValues.orderId } : undefined,
      });

      navigate("/admin/finance/reconciliation");
    } catch (err) {
      console.error("Failed to create reconciliation run", err);
      setError(
        err instanceof Error
          ? err.message
          : "Unable to create the reconciliation run. Please review the inputs and try again."
      );
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="New reconciliation run"
        description="Kick off a reconciliation batch or backfill a historical run."
        actions={
          <Button variant="outline" onClick={() => navigate(-1)}>
            Cancel
          </Button>
        }
      />

      <Card>
        <CardHeader>
          <CardTitle>Reconciliation details</CardTitle>
          <CardDescription>Set identifiers, status, and associated order context.</CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="reconciliationId">Reconciliation ID</Label>
                <Input
                  id="reconciliationId"
                  value={formValues.reconciliationId}
                  onChange={handleChange("reconciliationId")}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select
                  value={formValues.status}
                  onValueChange={(value) => setFormValues((current) => ({ ...current, status: value }))}
                >
                  <SelectTrigger id="status">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    {STATUS_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="reconciliationDate">Reconciliation date</Label>
                <Input
                  id="reconciliationDate"
                  type="datetime-local"
                  value={formValues.reconciliationDate}
                  onChange={handleChange("reconciliationDate")}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="orderId">Linked order (optional)</Label>
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
              </div>
            </div>

            {error ? (
              <Alert variant="destructive">
                <AlertTitle>Failed to create reconciliation run</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            ) : null}

            <div className="flex items-center gap-2 pt-6">
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Creating…" : "Create run"}
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
