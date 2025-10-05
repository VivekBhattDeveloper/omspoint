import { useMemo } from "react";
import { useNavigate } from "react-router";
import { PageHeader } from "@/components/app/page-header";
import { StatusBadge } from "@/components/app/status-badge";
import { AutoTable } from "@/components/auto";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { api } from "../api";
import { Plus } from "lucide-react";
import type { Route } from "./+types/_app.admin.print-jobs._index";

type PrintJobStats = {
  total: number;
  statusCounts: Record<string, number>;
  awaitingSchedule: number;
  nextScheduledAt?: string | null;
};

export const loader = async ({ context }: Route.LoaderArgs) => {
  const jobs = await context.api.printJob.findMany({
    select: {
      id: true,
      status: true,
      printDate: true,
    },
    sort: { printDate: "Descending" },
    first: 250,
  });

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
  const nextScheduledAt =
    upcoming.find((value) => value >= nowISO) ?? upcoming[0] ?? null;

  return {
    stats: { total, statusCounts, awaitingSchedule, nextScheduledAt } satisfies PrintJobStats,
  };
};

export default function AdminPrintJobsIndex({ loaderData }: Route.ComponentProps) {
  const navigate = useNavigate();
  const dateTime = useMemo(() => new Intl.DateTimeFormat(undefined, { dateStyle: "medium", timeStyle: "short" }), []);
  const number = useMemo(() => new Intl.NumberFormat(undefined, { maximumFractionDigits: 0 }), []);
  const { stats } = loaderData;
  const statusOrder = ["pending", "printing", "complete", "failed"];

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
          <AutoTable
            model={api.printJob}
            onClick={(job) => navigate(`/admin/print-jobs/${job.id}`)}
            columns={[
              { header: "Job", field: "printJobId" },
              {
                header: "Status",
                render: ({ record }) => <StatusBadge status={record.status} kind="printJob" />,
              },
              {
                header: "Print date",
                render: ({ record }) =>
                  record.printDate ? dateTime.format(new Date(record.printDate)) : "—",
              },
              {
                header: "Order",
                render: ({ record }) => record.order?.orderId ?? "—",
              },
            ]}
            select={{
              id: true,
              printJobId: true,
              status: true,
              printDate: true,
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
