import { useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import { useNavigate } from "react-router";
import { PageHeader } from "@/components/app/page-header";
import { Badge } from "@/components/ui/badge";
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
import { cn } from "@/lib/utils";
import { api } from "../api";
import type { Route } from "./+types/_app.admin.finance.reconciliation.$id";

const reconciliationStatusClasses: Record<string, string> = {
  pending: "bg-amber-100 text-amber-800 border-amber-200",
  complete: "bg-emerald-100 text-emerald-800 border-emerald-200",
  failed: "bg-rose-100 text-rose-800 border-rose-200",
};

export const loader = async ({ context, params }: Route.LoaderArgs) => {
  const reconciliation = await context.api.financeReconciliation.findOne(params.id, {
    select: {
      id: true,
      reconciliationId: true,
      status: true,
      reconciliationDate: true,
      createdAt: true,
      updatedAt: true,
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
    console.error("Failed to load orders for reconciliation editor", error);
  }

  return { reconciliation, orders };
};

export default function AdminFinanceReconciliationDetail({ loaderData }: Route.ComponentProps) {
  const navigate = useNavigate();
  const { reconciliation, orders } = loaderData;
  const dateTime = new Intl.DateTimeFormat(undefined, { dateStyle: "medium", timeStyle: "short" });
  const statusKey = reconciliation.status ? reconciliation.status.toLowerCase() : "";
  const [formValues, setFormValues] = useState({
    reconciliationId: reconciliation.reconciliationId ?? "",
    status: reconciliation.status ?? "pending",
    reconciliationDate: reconciliation.reconciliationDate
      ? new Date(new Date(reconciliation.reconciliationDate).getTime() - new Date().getTimezoneOffset() * 60000)
          .toISOString()
          .slice(0, 16)
      : "",
    orderId: reconciliation.order?.id ?? "none",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange =
    (field: "reconciliationId" | "reconciliationDate") =>
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
        : undefined;

      await api.financeReconciliation.update(reconciliation.id, {
        reconciliationId: formValues.reconciliationId,
        status: formValues.status as "pending" | "complete" | "failed",
        reconciliationDate: reconciliationDate ? reconciliationDate.toISOString() : null,
        order: formValues.orderId && formValues.orderId !== "none" ? { _link: formValues.orderId } : null,
      });

      navigate("/admin/finance/reconciliation");
    } catch (err) {
      console.error("Failed to update reconciliation", err);
      setError(
        err instanceof Error
          ? err.message
          : "Unable to update the reconciliation. Please review the fields and try again."
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
        title={`Reconciliation ${reconciliation.reconciliationId}`}
        description={
          reconciliation.reconciliationDate
            ? `Run at ${dateTime.format(new Date(reconciliation.reconciliationDate))}`
            : "Run time not recorded"
        }
        actions={
          <Button variant="outline" onClick={() => navigate(-1)}>
            Back
          </Button>
        }
      />

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Order Information */}
        <Card>
          <CardHeader>
            <CardTitle>Associated Order</CardTitle>
            <CardDescription>
              Order details linked to this reconciliation record
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {reconciliation.order ? (
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-muted-foreground">Order ID</span>
                  <span className="font-mono text-sm">{reconciliation.order.orderId}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-muted-foreground">Total</span>
                  <span className="font-mono text-sm">
                    ${reconciliation.order.total?.toFixed(2) ?? "0.00"}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-muted-foreground">Order Status</span>
                  <Badge variant="outline" className="capitalize">
                    {reconciliation.order.status}
                  </Badge>
                </div>
                {reconciliation.order.orderDate && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-muted-foreground">Order Date</span>
                    <span className="text-sm">
                      {dateTime.format(new Date(reconciliation.order.orderDate))}
                    </span>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No order associated with this reconciliation</p>
            )}
          </CardContent>
        </Card>

        {/* Reconciliation Details */}
        <Card>
          <CardHeader>
            <CardTitle>Reconciliation Details</CardTitle>
            <CardDescription>
              Current reconciliation information and timestamps
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-muted-foreground">Status</span>
                <Badge
                  variant="outline"
                  className={cn(
                    "uppercase tracking-wide text-xs",
                    reconciliationStatusClasses[statusKey] ?? ""
                  )}
                >
                  {reconciliation.status ?? "Unknown"}
                </Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-muted-foreground">Reconciliation ID</span>
                <span className="font-mono text-sm">{reconciliation.reconciliationId}</span>
              </div>
              {reconciliation.reconciliationDate && (
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-muted-foreground">Run Date</span>
                  <span className="text-sm">
                    {dateTime.format(new Date(reconciliation.reconciliationDate))}
                  </span>
                </div>
              )}
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-muted-foreground">Created</span>
                <span className="text-sm">
                  {dateTime.format(new Date(reconciliation.createdAt))}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-muted-foreground">Last Updated</span>
                <span className="text-sm">
                  {dateTime.format(new Date(reconciliation.updatedAt))}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Edit Form */}
      <Card>
        <CardHeader>
          <CardTitle>Edit Reconciliation</CardTitle>
          <CardDescription>
            Update reconciliation details and confirm outcomes for downstream financial reporting.
          </CardDescription>
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
                  onValueChange={(value) =>
                    setFormValues((current) => ({
                      ...current,
                      status: value as "pending" | "complete" | "failed",
                    }))
                  }
                >
                  <SelectTrigger id="status">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="complete">Complete</SelectItem>
                    <SelectItem value="failed">Failed</SelectItem>
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
                <AlertTitle>Failed to update reconciliation</AlertTitle>
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
    </div>
  );
}
