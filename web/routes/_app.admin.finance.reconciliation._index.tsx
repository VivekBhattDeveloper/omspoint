import { useMemo } from "react";
import { useNavigate } from "react-router";
import { PageHeader } from "@/components/app/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
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

type LoaderReconciliation = {
  id: string;
  reconciliationId: string | null;
  status: string | null;
  reconciliationDate: string | null;
  orderId: string | null;
};

type LoaderResult = {
  stats: ReconciliationStats;
  runs: LoaderReconciliation[];
  isSample: boolean;
  errorMessage?: string;
};

const sampleRuns: LoaderReconciliation[] = [
  {
    id: "recon-sample-1",
    reconciliationId: "RECON-2024-03-01-A",
    status: "complete",
    reconciliationDate: "2024-03-01T10:00:00.000Z",
    orderId: "ORD-1124",
  },
  {
    id: "recon-sample-2",
    reconciliationId: "RECON-2024-02-29-B",
    status: "pending",
    reconciliationDate: "2024-02-29T14:30:00.000Z",
    orderId: "ORD-1118",
  },
  {
    id: "recon-sample-3",
    reconciliationId: "RECON-2024-02-28-C",
    status: "failed",
    reconciliationDate: "2024-02-28T08:45:00.000Z",
    orderId: "ORD-1109",
  },
];

const computeStats = (runs: LoaderReconciliation[]): ReconciliationStats => {
  const total = runs.length;
  const statusCounts = runs.reduce<Record<string, number>>((counts, run) => {
    const status = run.status ?? "unknown";
    counts[status] = (counts[status] ?? 0) + 1;
    return counts;
  }, {});
  const latestRun = runs
    .map((run) => run.reconciliationDate)
    .filter((value): value is string => Boolean(value))
    .sort()
    .reverse()[0] ?? null;

  return { total, statusCounts, latestRun };
};

export const loader = async ({ context }: Route.LoaderArgs) => {
  try {
    const runs = await context.api.financeReconciliation.findMany({
      select: {
        id: true,
        reconciliationId: true,
        status: true,
        reconciliationDate: true,
        order: { orderId: true },
      },
      sort: { reconciliationDate: "Descending" },
      first: 250,
    });

    const records: LoaderReconciliation[] = runs.map((run, index) => ({
      id: run.id ?? `finance-recon-${index}`,
      reconciliationId: run.reconciliationId ?? null,
      status: run.status ?? null,
      reconciliationDate: run.reconciliationDate ?? null,
      orderId: run.order?.orderId ?? null,
    }));

    return {
      stats: computeStats(records),
      runs: records,
      isSample: false,
    } satisfies LoaderResult;
  } catch (error) {
    console.error("Failed to load finance reconciliation runs", error);

    return {
      stats: computeStats(sampleRuns),
      runs: sampleRuns,
      isSample: true,
      errorMessage: error instanceof Error ? error.message : undefined,
    } satisfies LoaderResult;
  }
};

export default function AdminFinanceReconciliationIndex({ loaderData }: Route.ComponentProps) {
  const navigate = useNavigate();
  const dateTime = useMemo(() => new Intl.DateTimeFormat(undefined, { dateStyle: "medium", timeStyle: "short" }), []);
  const number = useMemo(() => new Intl.NumberFormat(undefined, { maximumFractionDigits: 0 }), []);
  const { stats, runs, isSample, errorMessage } = loaderData;
  const statusEntries = Object.entries(stats.statusCounts).sort(([, aCount], [, bCount]) => bCount - aCount);

  const humanizeStatus = (status?: string | null) => {
    if (!status) return "—";
    return status.replace(/[_-]/g, " ");
  };
  const hasRuns = runs.length > 0;

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

      {isSample && (
        <Alert>
          <AlertTitle>Sample dataset</AlertTitle>
          <AlertDescription>
            Unable to load reconciliation runs from the API. Showing sample runs instead.
            {errorMessage ? ` Error: ${errorMessage}` : ""}
          </AlertDescription>
        </Alert>
      )}

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
          {hasRuns ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Reconciliation ID</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Run date</TableHead>
                  <TableHead>Order</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {runs.map((run) => {
                  const statusKey = run.status ? run.status.toLowerCase() : "";
                  return (
                    <TableRow
                      key={run.id}
                      tabIndex={0}
                      className="cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
                      onClick={() => navigate(`/admin/finance/reconciliation/${run.id}`)}
                      onKeyDown={(event) => {
                        if (event.key === "Enter" || event.key === " ") {
                          event.preventDefault();
                          navigate(`/admin/finance/reconciliation/${run.id}`);
                        }
                      }}
                    >
                      <TableCell className="font-medium">{run.reconciliationId ?? "—"}</TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={cn("uppercase tracking-wide text-xs", reconciliationStatusClasses[statusKey] ?? "")}
                        >
                          {humanizeStatus(run.status)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {run.reconciliationDate ? dateTime.format(new Date(run.reconciliationDate)) : "—"}
                      </TableCell>
                      <TableCell>{run.orderId ?? "—"}</TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          ) : (
            <div className="py-8 text-center text-muted-foreground">No reconciliation runs recorded.</div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
