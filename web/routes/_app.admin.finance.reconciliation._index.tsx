import { useMemo } from "react";
import { useNavigate } from "react-router";
import { PageHeader } from "@/components/app/page-header";
import { AutoTable } from "@/components/auto";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { api } from "../api";
import { Plus } from "lucide-react";
import type { Route } from "./+types/_app.admin.finance.reconciliation._index";

const reconciliationStatusClasses: Record<string, string> = {
  pending: "bg-amber-100 text-amber-800 border-amber-200",
  complete: "bg-emerald-100 text-emerald-800 border-emerald-200",
  failed: "bg-rose-100 text-rose-800 border-rose-200",
};

type ReconciliationStats = {
  total: number;
  statusCounts: Record<string, number>;
  latestRun?: string | null;
};

export const loader = async ({ context }: Route.LoaderArgs) => {
  const runs = await context.api.financeReconciliation.findMany({
    select: {
      id: true,
      status: true,
      reconciliationDate: true,
    },
    sort: { reconciliationDate: "Descending" },
    first: 250,
  });

  const total = runs.length;
  const statusCounts = runs.reduce<Record<string, number>>((counts, run) => {
    const status = run.status ?? "unknown";
    counts[status] = (counts[status] ?? 0) + 1;
    return counts;
  }, {});
  const latestRun = runs[0]?.reconciliationDate ?? null;

  return {
    stats: { total, statusCounts, latestRun } satisfies ReconciliationStats,
  };
};

export default function AdminFinanceReconciliationIndex({ loaderData }: Route.ComponentProps) {
  const navigate = useNavigate();
  const dateTime = useMemo(() => new Intl.DateTimeFormat(undefined, { dateStyle: "medium", timeStyle: "short" }), []);
  const number = useMemo(() => new Intl.NumberFormat(undefined, { maximumFractionDigits: 0 }), []);
  const { stats } = loaderData;
  const statusEntries = Object.entries(stats.statusCounts).sort(([, aCount], [, bCount]) => bCount - aCount);

  const humanizeStatus = (status?: string | null) => {
    if (!status) return "—";
    return status.replace(/[_-]/g, " ");
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Finance reconciliation"
        description={`Tracking ${number.format(stats.total)} reconciliation runs across the ledger.`}
        actions={
          <Button onClick={() => navigate("/admin/finance/reconciliation/new")}>
            <Plus className="mr-2 h-4 w-4" />
            New reconciliation
          </Button>
        }
      />

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total runs</CardDescription>
            <CardTitle className="text-3xl">{number.format(stats.total)}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-1 text-sm text-muted-foreground">
            {statusEntries.map(([status, count]) => (
              <div className="flex justify-between" key={status}>
                <span className="capitalize">{humanizeStatus(status)}</span>
                <span>{number.format(count)}</span>
              </div>
            ))}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Successful runs</CardDescription>
            <CardTitle className="text-3xl">{number.format(stats.statusCounts["complete"] ?? 0)}</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            Completed without variance or failure
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Latest run</CardDescription>
            <CardTitle className="text-3xl">
              {stats.latestRun ? dateTime.format(new Date(stats.latestRun)) : "—"}
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            Timestamp of the most recent reconciliation
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Reconciliation runs</CardTitle>
          <CardDescription>Review reconciliation batches and investigate variances.</CardDescription>
        </CardHeader>
        <CardContent>
          <AutoTable
            model={api.financeReconciliation}
            onClick={(record) => navigate(`/admin/finance/reconciliation/${record.id}`)}
            columns={[
              { header: "Reconciliation ID", field: "reconciliationId" },
              {
                header: "Status",
                render: ({ record }) => {
                  const statusKey = record.status ? record.status.toLowerCase() : "";
                  return (
                    <Badge
                      variant="outline"
                      className={cn(
                        "uppercase tracking-wide text-xs",
                        reconciliationStatusClasses[statusKey] ?? ""
                      )}
                    >
                      {humanizeStatus(record.status)}
                    </Badge>
                  );
                },
              },
              {
                header: "Run date",
                render: ({ record }) =>
                  record.reconciliationDate
                    ? dateTime.format(new Date(record.reconciliationDate))
                    : "—",
              },
              {
                header: "Order",
                render: ({ record }) => record.order?.orderId ?? "—",
              },
            ]}
            select={{
              id: true,
              reconciliationId: true,
              status: true,
              reconciliationDate: true,
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
