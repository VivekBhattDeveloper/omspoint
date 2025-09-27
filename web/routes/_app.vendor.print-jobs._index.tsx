import { useMemo, useState } from "react";
import { useNavigate } from "react-router";
import { AutoTable } from "@/components/auto";
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
import { api } from "../api";

export default function VendorPrintJobsPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const navigate = useNavigate();

  const filter = useMemo(() => {
    if (!statusFilter) return undefined;
    return { status: { equals: statusFilter } } as const;
  }, [statusFilter]);

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
          <AutoTable
            model={api.printJob}
            search={search}
            filter={filter}
            onClick={(record) => navigate(`/vendor/print-jobs/${record.id}`)}
            columns={[
              { header: "Print Job", field: "printJobId" },
              {
                header: "Status",
                render: ({ record }) => <StatusBadge status={record.status} kind="printJob" />,
              },
              { header: "Print date", field: "printDate" },
              { header: "Order", field: "order.orderId" },
            ]}
            select={{
              id: true,
              printJobId: true,
              status: true,
              printDate: true,
              order: { orderId: true },
            }}
          />
        </CardContent>
      </Card>
    </div>
  );
}
