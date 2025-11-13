import { useMemo } from "react";
import { useNavigate } from "react-router";
import { PageHeader } from "@/components/app/page-header";
import { StatusBadge } from "@/components/app/status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus } from "lucide-react";
import type { Route } from "./+types/_app.admin.print-jobs._index";

type PrintJobStats = {
  total: number;
  statusCounts: Record<string, number>;
  awaitingSchedule: number;
  nextScheduledAt?: string | null;
};

type LoaderJob = {
  id: string;
  jobId: string;
  status: string;
  printDate: string | null;
  orderId: string | null;
};

type LoaderResult = {
  stats: PrintJobStats;
  jobs: LoaderJob[];
  isSample: boolean;
  errorMessage?: string;
};

const sampleJobs: LoaderJob[] = [
  {
    id: "sample-1",
    jobId: "PRINT-1082",
    status: "printing",
    printDate: "2024-03-01T10:30:00.000Z",
    orderId: "ORD-1102",
  },
  {
    id: "sample-2",
    jobId: "PRINT-1079",
    status: "pending",
    printDate: null,
    orderId: "ORD-1100",
  },
  {
    id: "sample-3",
    jobId: "PRINT-1074",
    status: "complete",
    printDate: "2024-02-29T18:00:00.000Z",
    orderId: "ORD-1094",
  },
  {
    id: "sample-4",
    jobId: "PRINT-1068",
    status: "failed",
    printDate: "2024-02-29T12:00:00.000Z",
    orderId: "ORD-1089",
  },
];

const computeStats = (jobs: LoaderJob[]): PrintJobStats => {
  const total = jobs.length;
  const statusCounts = jobs.reduce<Record<string, number>>((counts, job) => {
    const status = job.status ?? "unknown";
    counts[status] = (counts[status] ?? 0) + 1;
    return counts;
  }, {});
  const awaitingSchedule = jobs.filter((job) => !job.printDate).length;
  const upcoming = jobs
    .map((job) => job.printDate)
    .filter((value): value is string => Boolean(value))
    .sort();
  const nowISO = new Date().toISOString();
  const nextScheduledAt = upcoming.find((value) => value >= nowISO) ?? upcoming[0] ?? null;

  return {
    total,
    statusCounts,
    awaitingSchedule,
    nextScheduledAt,
  } satisfies PrintJobStats;
};

export const loader = async ({ context }: Route.LoaderArgs) => {
  try {
    const records = await context.api.printJob.findMany({
      select: {
        id: true,
        printJobId: true,
        status: true,
        printDate: true,
        order: { orderId: true },
      },
      sort: { printDate: "Descending" },
      first: 250,
    });

    const jobs: LoaderJob[] = records.map((record, index) => ({
      id: record.id ?? `print-job-${index}`,
      jobId: record.printJobId ?? "—",
      status: record.status ?? "unknown",
      printDate: record.printDate instanceof Date 
        ? record.printDate.toISOString() 
        : (typeof record.printDate === "string" ? record.printDate : null),
      orderId: record.order?.orderId ?? null,
    }));

    return {
      stats: computeStats(jobs),
      jobs,
      isSample: false,
    } satisfies LoaderResult;
  } catch (error) {
    console.error("Failed to load print jobs", error);

    return {
      stats: computeStats(sampleJobs),
      jobs: sampleJobs,
      isSample: true,
      errorMessage: error instanceof Error ? error.message : undefined,
    } satisfies LoaderResult;
  }
};

export default function AdminPrintJobsIndex({ loaderData }: Route.ComponentProps) {
  const navigate = useNavigate();
  const dateTime = useMemo(() => new Intl.DateTimeFormat(undefined, { dateStyle: "medium", timeStyle: "short" }), []);
  const number = useMemo(() => new Intl.NumberFormat(undefined, { maximumFractionDigits: 0 }), []);
  const { stats, jobs, isSample, errorMessage } = loaderData;
  const statusOrder = ["pending", "printing", "complete", "failed"];
  const hasJobs = jobs.length > 0;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Print jobs"
        description={`Tracking ${number.format(stats.total)} print jobs across all vendors.`}
        actions={
          <Button onClick={() => navigate("/admin/print-jobs/new")}>
            <Plus className="mr-2 h-4 w-4" />
            New job
          </Button>
        }
      />

      {isSample && (
        <Alert>
          <AlertTitle>Sample dataset</AlertTitle>
          <AlertDescription>
            Unable to load the print job queue from the API. Displaying sample data instead.
            {errorMessage ? ` Error: ${errorMessage}` : ""}
          </AlertDescription>
        </Alert>
      )}

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Active queue</CardDescription>
            <CardTitle className="text-3xl">{number.format(stats.total)}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-1 text-sm text-muted-foreground">
            {statusOrder.map((key) => (
              <div className="flex justify-between" key={key}>
                <span className="capitalize">{key.replace(/-/g, " ")}</span>
                <span>{number.format(stats.statusCounts[key] ?? 0)}</span>
              </div>
            ))}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Awaiting schedule</CardDescription>
            <CardTitle className="text-3xl">{number.format(stats.awaitingSchedule)}</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            Jobs without a confirmed print window yet
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Next scheduled run</CardDescription>
            <CardTitle className="text-3xl">
              {stats.nextScheduledAt ? dateTime.format(new Date(stats.nextScheduledAt)) : "—"}
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            Based on latest known print date across jobs
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Production queue</CardTitle>
          <CardDescription>Unified view of print jobs across fulfillment vendors.</CardDescription>
        </CardHeader>
        <CardContent>
          {hasJobs ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Job</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Print date</TableHead>
                  <TableHead>Order</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {jobs.map((job) => (
                  <TableRow
                    key={job.id}
                    tabIndex={0}
                    onClick={() => navigate(`/admin/print-jobs/${job.id}`)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" || event.key === " ") {
                        event.preventDefault();
                        navigate(`/admin/print-jobs/${job.id}`);
                      }
                    }}
                    className="cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
                  >
                    <TableCell className="font-medium">{job.jobId}</TableCell>
                    <TableCell>
                      <StatusBadge status={job.status} kind="printJob" />
                    </TableCell>
                    <TableCell>
                      {job.printDate ? dateTime.format(new Date(job.printDate)) : "—"}
                    </TableCell>
                    <TableCell>{job.orderId ?? "—"}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="py-8 text-center text-muted-foreground">No print jobs found.</div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
