import { useNavigate } from "react-router";
import {
  AutoBelongsToInput,
  AutoDateTimePicker,
  AutoEnumInput,
  AutoForm,
  AutoInput,
  AutoSubmit,
  SubmitResultBanner,
} from "@/components/auto";
import { PageHeader } from "@/components/app/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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

  return { reconciliation };
};

export default function AdminFinanceReconciliationDetail({ loaderData }: Route.ComponentProps) {
  const navigate = useNavigate();
  const { reconciliation } = loaderData;
  const dateTime = new Intl.DateTimeFormat(undefined, { dateStyle: "medium", timeStyle: "short" });
  const statusKey = reconciliation.status ? reconciliation.status.toLowerCase() : "";

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
          <AutoForm
            action={api.financeReconciliation.update}
            findBy={reconciliation.id}
            onSuccess={() => navigate("/admin/finance/reconciliation")}
          >
            <SubmitResultBanner />
            <div className="grid gap-4 md:grid-cols-2">
              <AutoInput field="reconciliationId" />
              <AutoEnumInput field="status" />
              <AutoDateTimePicker field="reconciliationDate" />
              <AutoBelongsToInput field="order" />
            </div>
            <div className="flex items-center gap-2 pt-6">
              <AutoSubmit>Save changes</AutoSubmit>
              <Button variant="ghost" type="button" onClick={() => navigate(-1)}>
                Cancel
              </Button>
            </div>
          </AutoForm>
        </CardContent>
      </Card>
    </div>
  );
}