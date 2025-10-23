import { useMemo, useState } from "react";
import { useNavigate } from "react-router";
import { PageHeader } from "@/components/app/page-header";
import { StatusBadge } from "@/components/app/status-badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { api } from "../api";
import type { Route } from "./+types/_app.vendor.print-jobs._index";

interface LoaderPrintJob {
  id: string;
  printJobId: string;
  status: string | null;
  printDate: string | null;
  orderId: string | null;
}

interface LoaderResult {
  jobs: LoaderPrintJob[];
  isSample: boolean;
  errorMessage?: string;
}

const sampleJobs: LoaderPrintJob[] = [
  {
    id: "sample-print-job-1",
    printJobId: "PJ-2048",
    status: "pending",
    printDate: "2024-03-02T13:45:00.000Z",
    orderId: "ORD-1055",
  },
  {
    id: "sample-print-job-2",
    printJobId: "PJ-2041",
    status: "printing",
    printDate: "2024-03-01T09:00:00.000Z",
    orderId: "ORD-1049",
  },
  {
    id: "sample-print-job-3",
    printJobId: "PJ-2036",
    status: "complete",
    printDate: "2024-02-28T17:20:00.000Z",
    orderId: "ORD-1042",
  },
];

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

    const jobs: LoaderPrintJob[] = records.map((record, index) => ({
      id: record.id ?? `print-job-${index}`,
      printJobId: record.printJobId ?? "Unknown job",
      status: record.status ?? null,
      printDate: record.printDate ?? null,
      orderId: record.order?.orderId ?? null,
    }));

    return {
      jobs,
      isSample: false,
    } satisfies LoaderResult;
  } catch (error) {
    console.error("Failed to load vendor print jobs", error);
    return {
      jobs: sampleJobs,
      isSample: true,
      errorMessage: error instanceof Error ? error.message : undefined,
    } satisfies LoaderResult;
  }
};

export default function VendorPrintJobsPage({ loaderData }: Route.ComponentProps) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const navigate = useNavigate();
  const { jobs, isSample, errorMessage } = loaderData;

  const filter = useMemo(() => {
    return statusFilter ? statusFilter.toLowerCase() : null;
  }, [statusFilter]);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return jobs.filter((job) => {
      const matchesSearch =
        !term ||
        job.printJobId.toLowerCase().includes(term) ||
        job.orderId?.toLowerCase().includes(term);
      const matchesStatus = !filter || job.status?.toLowerCase() === filter;
      return matchesSearch && matchesStatus;
    });
  }, [jobs, search, filter]);

  const dateFormatter = useMemo(
    () => new Intl.DateTimeFormat(undefined, { dateStyle: "medium", timeStyle: "short" }),
    [],
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Print Jobs"
        description="Monitor the full print pipeline from preflight to completion."
      />
      <Card>
        <CardHeader>
          <CardTitle>Production queue</CardTitle>
          <CardDescription>Track each job's status and linked order.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <Input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search print jobs…"
              className="max-w-sm"
            />
            <Select value={statusFilter ?? "all"} onValueChange={(value) => setStatusFilter(value === "all" ? null : value)}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All statuses</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="printing">Printing</SelectItem>
                <SelectItem value="complete">Complete</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {isSample && (
            <Alert>
              <AlertTitle>Sample dataset</AlertTitle>
              <AlertDescription>
                Unable to load print jobs from the API. Displaying sample data instead.
                {errorMessage ? ` Error: ${errorMessage}` : ""}
              </AlertDescription>
            </Alert>
          )}

          {filtered.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Print Job</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Print date</TableHead>
                  <TableHead>Order</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((job) => (
                  <TableRow
                    key={job.id}
                    tabIndex={0}
                    className="cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
                    onClick={() => navigate(`/vendor/print-jobs/${job.id}`)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" || event.key === " ") {
                        event.preventDefault();
                        navigate(`/vendor/print-jobs/${job.id}`);
                      }
                    }}
                  >
                    <TableCell className="font-medium">{job.printJobId}</TableCell>
                    <TableCell>
                      <StatusBadge status={job.status ?? undefined} kind="printJob" />
                    </TableCell>
                    <TableCell>
                      {job.printDate ? dateFormatter.format(new Date(job.printDate)) : "—"}
                    </TableCell>
                    <TableCell>{job.orderId ?? "—"}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="py-8 text-center text-muted-foreground">No print jobs match your filters.</div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
