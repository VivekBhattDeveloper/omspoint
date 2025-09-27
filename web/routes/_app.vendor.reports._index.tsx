import type { Route } from "./+types/_app.vendor.reports._index";
import { useMemo, Suspense } from "react";
import { PageHeader } from "@/components/app/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Download } from "lucide-react";

const HOUR_IN_MS = 1000 * 60 * 60;
const HORIZON_DAYS = 30;
const SLA_TARGET_HOURS = 72;

type ProductionStatus = "pending" | "printing" | "complete" | "failed";

const formatDay = (value: Date) => value.toISOString().slice(0, 10);

const getIsoWeek = (value: Date) => {
  const target = new Date(Date.UTC(value.getUTCFullYear(), value.getUTCMonth(), value.getUTCDate()));
  const day = target.getUTCDay() || 7;
  target.setUTCDate(target.getUTCDate() + 4 - day);
  const yearStart = new Date(Date.UTC(target.getUTCFullYear(), 0, 1));
  const weekNumber = Math.ceil(((target.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
  return `${target.getUTCFullYear()}-W${String(weekNumber).padStart(2, "0")}`;
};

const weekLabel = (weekKey: string) => {
  const [year, week] = weekKey.split("-W");
  return week ? `W${week} · ${year}` : year;
};

const average = (values: number[]) => {
  if (!values.length) return null;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
};

const safeDate = (value?: string | null) => (value ? new Date(value) : null);

export const loader = async ({ context }: Route.LoaderArgs) => {
  const horizonStart = new Date();
  horizonStart.setDate(horizonStart.getDate() - HORIZON_DAYS);
  const horizonISO = horizonStart.toISOString();

  const [printJobs, shipments, payments, reconciliations] = await Promise.all([
    context.api.printJob.findMany({
      select: {
        id: true,
        printJobId: true,
        status: true,
        printDate: true,
        order: {
          orderId: true,
          orderDate: true,
        },
      },
      filter: { printDate: { greaterThanOrEqual: horizonISO } },
      sort: { printDate: "Descending" },
      first: 250,
    }),
    context.api.shipment.findMany({
      select: {
        id: true,
        shipmentDate: true,
        shipmentMethod: true,
        trackingNumber: true,
        order: {
          orderId: true,
          orderDate: true,
        },
      },
      filter: { shipmentDate: { greaterThanOrEqual: horizonISO } },
      sort: { shipmentDate: "Descending" },
      first: 250,
    }),
    context.api.payment.findMany({
      select: {
        id: true,
        amount: true,
        paymentDate: true,
        paymentMethod: true,
        order: {
          orderId: true,
        },
      },
      filter: { paymentDate: { greaterThanOrEqual: horizonISO } },
      sort: { paymentDate: "Descending" },
      first: 250,
    }),
    context.api.financeReconciliation.findMany({
      select: {
        id: true,
        reconciliationId: true,
        reconciliationDate: true,
        status: true,
        order: {
          orderId: true,
          payment: {
            amount: true,
          },
        },
      },
      filter: { reconciliationDate: { greaterThanOrEqual: horizonISO } },
      sort: { reconciliationDate: "Descending" },
      first: 250,
    }),
  ]);

  const productionStatuses: ProductionStatus[] = ["pending", "printing", "complete", "failed"];
  const productionStatusCounts: Record<ProductionStatus, number> = {
    pending: 0,
    printing: 0,
    complete: 0,
    failed: 0,
  };
  const productionTrend = new Map<
    string,
    { total: number; completed: number; failed: number }
  >();
  const leadTimes: number[] = [];
  const productionExportRows: Array<{
    printJobId: string;
    status: string;
    printDate: string;
    orderId: string;
    leadTimeHours: number | null;
  }> = [];

  for (const job of printJobs) {
    const status = job.status ?? "pending";
    if (productionStatuses.includes(status as ProductionStatus)) {
      productionStatusCounts[status as ProductionStatus] += 1;
    }
    const printDate = safeDate(job.printDate);
    const orderDate = safeDate(job.order?.orderDate ?? null);
    let leadTimeHours: number | null = null;
    if (printDate && orderDate) {
      const diff = (printDate.getTime() - orderDate.getTime()) / HOUR_IN_MS;
      if (Number.isFinite(diff)) {
        leadTimeHours = diff;
        leadTimes.push(diff);
      }
    }
    if (printDate) {
      const dayKey = formatDay(printDate);
      const entry = productionTrend.get(dayKey) ?? { total: 0, completed: 0, failed: 0 };
      entry.total += 1;
      if (job.status === "complete") entry.completed += 1;
      if (job.status === "failed") entry.failed += 1;
      productionTrend.set(dayKey, entry);
    }
    productionExportRows.push({
      printJobId: job.printJobId ?? "",
      status,
      printDate: job.printDate ?? "",
      orderId: job.order?.orderId ?? "",
      leadTimeHours: leadTimeHours !== null ? Number(leadTimeHours.toFixed(2)) : null,
    });
  }

  const shipmentsWithLeadTime: Array<{
    trackingNumber: string;
    orderId: string;
    shipmentDate: string;
    fulfillmentHours: number | null;
    shipmentMethod: string;
    onTime: boolean | null;
  }> = [];
  const weeklySlaMap = new Map<
    string,
    { total: number; onTime: number; withLeadTime: number; hours: number }
  >();
  const slaBreaches: typeof shipmentsWithLeadTime = [];
  for (const shipment of shipments) {
    const shipmentDate = safeDate(shipment.shipmentDate);
    const orderDate = safeDate(shipment.order?.orderDate ?? null);
    let fulfillmentHours: number | null = null;
    let onTime: boolean | null = null;
    if (shipmentDate && orderDate) {
      const diff = (shipmentDate.getTime() - orderDate.getTime()) / HOUR_IN_MS;
      if (Number.isFinite(diff)) {
        fulfillmentHours = diff;
        onTime = diff <= SLA_TARGET_HOURS;
        if (!onTime) {
          slaBreaches.push({
            trackingNumber: shipment.trackingNumber ?? "",
            orderId: shipment.order?.orderId ?? "",
            shipmentDate: shipment.shipmentDate ?? "",
            fulfillmentHours,
            shipmentMethod: shipment.shipmentMethod ?? "",
            onTime,
          });
        }
      }
    }
    if (shipmentDate) {
      const weekKey = getIsoWeek(shipmentDate);
      const entry = weeklySlaMap.get(weekKey) ?? { total: 0, onTime: 0, withLeadTime: 0, hours: 0 };
      entry.total += 1;
      if (onTime !== null) {
        entry.withLeadTime += 1;
        entry.hours += fulfillmentHours ?? 0;
        if (onTime) entry.onTime += 1;
      }
      weeklySlaMap.set(weekKey, entry);
    }
    shipmentsWithLeadTime.push({
      trackingNumber: shipment.trackingNumber ?? "",
      orderId: shipment.order?.orderId ?? "",
      shipmentDate: shipment.shipmentDate ?? "",
      fulfillmentHours: fulfillmentHours !== null ? Number(fulfillmentHours.toFixed(2)) : null,
      shipmentMethod: shipment.shipmentMethod ?? "",
      onTime,
    });
  }

  const fulfillmentValues = shipmentsWithLeadTime
    .map((record) => record.fulfillmentHours)
    .filter((value): value is number => value !== null);
  const onTimeCount = shipmentsWithLeadTime.filter((record) => record.onTime === true).length;
  const totalShipments = shipments.length;

  const weeklySummaries = Array.from(weeklySlaMap.entries())
    .map(([week, entry]) => ({
      week,
      totalShipments: entry.total,
      onTimeRate: entry.withLeadTime ? entry.onTime / entry.withLeadTime : null,
      averageFulfillmentHours: entry.withLeadTime ? entry.hours / entry.withLeadTime : null,
    }))
    .sort((a, b) => a.week.localeCompare(b.week));

  const topBreaches = slaBreaches
    .sort((a, b) => (b.fulfillmentHours ?? 0) - (a.fulfillmentHours ?? 0))
    .slice(0, 5);

  const totalCollected = payments.reduce((sum, payment) => sum + (payment.amount ?? 0), 0);
  const methodTotals: Record<string, number> = {};
  const paymentExportRows = payments.map((payment) => {
    const method = payment.paymentMethod ?? "unknown";
    methodTotals[method] = (methodTotals[method] ?? 0) + (payment.amount ?? 0);
    return {
      paymentId: payment.id,
      orderId: payment.order?.orderId ?? "",
      amount: Number((payment.amount ?? 0).toFixed(2)),
      paymentMethod: method,
      paymentDate: payment.paymentDate ?? "",
    };
  });

  const reconciliationStatusCounts: Record<string, number> = {};
  const payoutPeriodsMap = new Map<
    string,
    { completed: number; pending: number; failed: number; amount: number }
  >();
  let pendingAmount = 0;
  const reconciliationExportRows = reconciliations.map((record) => {
    const status = record.status ?? "pending";
    reconciliationStatusCounts[status] = (reconciliationStatusCounts[status] ?? 0) + 1;
    const reconciliationDate = safeDate(record.reconciliationDate ?? null);
    const amount = record.order?.payment?.amount ?? 0;
    if (status === "pending") pendingAmount += amount;
    if (reconciliationDate) {
      const periodKey = getIsoWeek(reconciliationDate);
      const entry =
        payoutPeriodsMap.get(periodKey) ?? { completed: 0, pending: 0, failed: 0, amount: 0 };
      if (status === "complete") entry.completed += 1;
      else if (status === "failed") entry.failed += 1;
      else entry.pending += 1;
      entry.amount += amount;
      payoutPeriodsMap.set(periodKey, entry);
    }
    return {
      reconciliationId: record.reconciliationId ?? "",
      orderId: record.order?.orderId ?? "",
      status,
      reconciliationDate: record.reconciliationDate ?? "",
      amount: Number(amount.toFixed(2)),
    };
  });

  const payoutPeriods = Array.from(payoutPeriodsMap.entries())
    .map(([period, entry]) => ({
      period,
      completed: entry.completed,
      pending: entry.pending,
      failed: entry.failed,
      amount: entry.amount,
    }))
    .sort((a, b) => a.period.localeCompare(b.period));

  return {
    horizon: {
      since: horizonStart.toISOString(),
      days: HORIZON_DAYS,
    },
    productionReport: {
      totalJobs: printJobs.length,
      statusCounts: productionStatusCounts,
      averageLeadTimeHours: average(leadTimes),
      completionRate: printJobs.length ? productionStatusCounts.complete / printJobs.length : null,
      trend: Array.from(productionTrend.entries())
        .map(([date, entry]) => ({ date, ...entry }))
        .sort((a, b) => a.date.localeCompare(b.date)),
      exportRows: productionExportRows,
    },
    slaReport: {
      totalShipments,
      onTimeRate: totalShipments ? onTimeCount / totalShipments : null,
      averageFulfillmentHours: average(fulfillmentValues),
      targetHours: SLA_TARGET_HOURS,
      weeklySummaries,
      topBreaches,
      exportRows: shipmentsWithLeadTime,
    },
    financeReport: {
      totalCollected,
      methodTotals,
      pendingReconciliationCount: reconciliationStatusCounts["pending"] ?? 0,
      pendingReconciliationAmount: pendingAmount,
      statusCounts: reconciliationStatusCounts,
      payoutPeriods,
      exportRows: {
        payments: paymentExportRows,
        reconciliations: reconciliationExportRows,
      },
    },
  };
};

const exportAsCsv = (rows: Array<Record<string, string | number | boolean | null>>, fileName: string) => {
  try {
    // Defensive checks for browser environment and data
    if (typeof document === "undefined" || typeof window === "undefined") {
      console.warn("Export functionality not available in server environment");
      return;
    }
    
    if (!Array.isArray(rows) || rows.length === 0) {
      console.warn("No data available for export");
      return;
    }

    const firstRow = rows[0];
    if (!firstRow || typeof firstRow !== 'object') {
      console.warn("Invalid data format for export");
      return;
    }

    const headers = Object.keys(firstRow);
    if (headers.length === 0) {
      console.warn("No headers found for export");
      return;
    }

    const serialize = (value: string | number | boolean | null) => {
      if (value === null || value === undefined) return "";
      const stringValue = String(value);
      if (/[",\n]/.test(stringValue)) {
        return `"${stringValue.replace(/"/g, '""')}"`;
      }
      return stringValue;
    };

    const csvRows = [
      headers.join(","),
      ...rows.map((row) => {
        if (!row || typeof row !== 'object') return "";
        return headers.map((key) => serialize(row[key])).join(",");
      }).filter(Boolean)
    ];

    const csv = csvRows.join("\n");
    
    if (!csv.trim()) {
      console.warn("No valid data to export");
      return;
    }

    // Check if Blob is supported
    if (typeof Blob === "undefined") {
      console.warn("Blob API not supported");
      return;
    }

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    
    // Check if URL.createObjectURL is supported
    if (typeof URL === "undefined" || typeof URL.createObjectURL !== "function") {
      console.warn("URL.createObjectURL not supported");
      return;
    }

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    
    if (!link) {
      console.warn("Could not create download link");
      return;
    }

    link.href = url;
    link.download = fileName || "export.csv";
    
    // Ensure document.body exists
    if (!document.body) {
      console.warn("Document body not available");
      return;
    }

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // Clean up the URL
    if (typeof URL.revokeObjectURL === "function") {
      URL.revokeObjectURL(url);
    }
  } catch (error) {
    console.error("Error exporting CSV:", error);
  }
};

export default function VendorReportsPage({ loaderData }: Route.ComponentProps) {
  // Defensive data extraction with fallbacks
  if (!loaderData) {
    return <div className="p-6">Loading...</div>;
  }

  const {
    horizon = { since: null, days: 0 },
    productionReport = {
      totalJobs: 0,
      statusCounts: { pending: 0, printing: 0, complete: 0, failed: 0 },
      averageLeadTimeHours: null,
      completionRate: null,
      trend: [],
      exportRows: []
    },
    slaReport = {
      totalShipments: 0,
      onTimeRate: null,
      averageFulfillmentHours: null,
      targetHours: 72,
      weeklySummaries: [],
      topBreaches: [],
      exportRows: []
    },
    financeReport = {
      totalCollected: 0,
      methodTotals: {},
      pendingReconciliationCount: 0,
      pendingReconciliationAmount: 0,
      statusCounts: {},
      payoutPeriods: [],
      exportRows: { payments: [], reconciliations: [] }
    }
  } = loaderData;

  // Defensive formatters with error handling
  const currency = useMemo(() => {
    try {
      return new Intl.NumberFormat(undefined, { style: "currency", currency: "USD" });
    } catch {
      return { format: (value: number) => `$${value.toFixed(2)}` };
    }
  }, []);

  const number = useMemo(() => {
    try {
      return new Intl.NumberFormat(undefined, { maximumFractionDigits: 0 });
    } catch {
      return { format: (value: number) => Math.round(value).toString() };
    }
  }, []);

  const percent = useMemo(() => {
    try {
      return new Intl.NumberFormat(undefined, { style: "percent", maximumFractionDigits: 1 });
    } catch {
      return { format: (value: number) => `${(value * 100).toFixed(1)}%` };
    }
  }, []);

  const hours = useMemo(() => {
    try {
      return new Intl.NumberFormat(undefined, { maximumFractionDigits: 1 });
    } catch {
      return { format: (value: number) => value.toFixed(1) };
    }
  }, []);

  const horizonLabel = useMemo(() => {
    try {
      return horizon?.since
        ? new Intl.DateTimeFormat(undefined, { dateStyle: "medium" }).format(new Date(horizon.since))
        : "";
    } catch {
      return horizon?.since || "";
    }
  }, [horizon?.since]);

  // Safe export handlers
  const handleExportSummary = () => {
    try {
      const allRows = [
        ...(productionReport?.exportRows || []),
        ...(slaReport?.exportRows || []),
        ...(financeReport?.exportRows?.payments || []),
        ...(financeReport?.exportRows?.reconciliations || [])
      ];
      exportAsCsv(allRows, "vendor-reports-summary.csv");
    } catch (error) {
      console.error("Error exporting summary:", error);
    }
  };

  const handleExportProduction = () => {
    try {
      exportAsCsv(productionReport?.exportRows || [], "production-report.csv");
    } catch (error) {
      console.error("Error exporting production data:", error);
    }
  };

  const handleExportSla = () => {
    try {
      exportAsCsv(slaReport?.exportRows || [], "sla-report.csv");
    } catch (error) {
      console.error("Error exporting SLA data:", error);
    }
  };

  const handleExportPayments = () => {
    try {
      exportAsCsv(financeReport?.exportRows?.payments || [], "payments.csv");
    } catch (error) {
      console.error("Error exporting payments:", error);
    }
  };

  const handleExportReconciliations = () => {
    try {
      exportAsCsv(financeReport?.exportRows?.reconciliations || [], "reconciliations.csv");
    } catch (error) {
      console.error("Error exporting reconciliations:", error);
    }
  };

  return (
    <Suspense fallback={<div className="p-6">Loading reports...</div>}>
      <div className="space-y-6">
        <PageHeader
          title="Reports"
          description="Generate production, SLA, and financial reports tailored for vendors."
          actions={
            <Button
              variant="outline"
              onClick={handleExportSummary}
            >
              <Download className="mr-2 h-4 w-4" />
              Export summary CSV
            </Button>
          }
        />

        <Card>
          <CardHeader className="pb-0">
            <CardTitle>At a glance</CardTitle>
            <CardDescription>
              Trailing {horizon?.days || 0} days starting {horizonLabel || "unknown date"}.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 pt-6 md:grid-cols-2 lg:grid-cols-4">
            <MetricTile
              label="Total print jobs"
              value={number.format(productionReport?.totalJobs || 0)}
              detail={`Completion rate ${
                productionReport?.completionRate !== null && productionReport?.completionRate !== undefined
                  ? percent.format(productionReport.completionRate) 
                  : "—"
              }`}
            />
            <MetricTile
              label="Average production lead time"
              value={
                productionReport?.averageLeadTimeHours !== null && productionReport?.averageLeadTimeHours !== undefined
                  ? `${hours.format(productionReport.averageLeadTimeHours)} hrs`
                  : "—"
              }
              detail="From order creation to print complete"
            />
            <MetricTile
              label="Shipments on time"
              value={
                slaReport?.onTimeRate !== null && slaReport?.onTimeRate !== undefined
                  ? percent.format(slaReport.onTimeRate) 
                  : "—"
              }
              detail={`Target ≤ ${slaReport?.targetHours || 72} hrs`}
            />
            <MetricTile
              label="Pending reconciliation"
              value={currency.format(financeReport?.pendingReconciliationAmount || 0)}
              detail={`${financeReport?.pendingReconciliationCount || 0} open payout${
                (financeReport?.pendingReconciliationCount || 0) === 1 ? "" : "s"
              }`}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
            <div>
              <CardTitle>Production throughput</CardTitle>
              <CardDescription>Daily completion and failure counts across the print queue.</CardDescription>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleExportProduction}
            >
              <Download className="mr-2 h-4 w-4" />
              Export production CSV
            </Button>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {productionReport?.statusCounts && typeof productionReport.statusCounts === 'object' 
                ? Object.entries(productionReport.statusCounts).map(([status, count]) => (
                    <StatusBadgeTile 
                      key={status} 
                      status={status} 
                      count={typeof count === 'number' ? count : 0} 
                      formatter={number} 
                    />
                  ))
                : null
              }
            </div>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Day</TableHead>
                    <TableHead className="text-right">Jobs</TableHead>
                    <TableHead className="text-right">Completed</TableHead>
                    <TableHead className="text-right">Failed</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {Array.isArray(productionReport?.trend) && productionReport.trend.length > 0 ? (
                    productionReport.trend.map((day, index) => 
                      day && typeof day === 'object' ? (
                        <TableRow key={day.date || index}>
                          <TableCell>{day.date || "—"}</TableCell>
                          <TableCell className="text-right">{number.format(day.total || 0)}</TableCell>
                          <TableCell className="text-right">{number.format(day.completed || 0)}</TableCell>
                          <TableCell className="text-right">{number.format(day.failed || 0)}</TableCell>
                        </TableRow>
                      ) : null
                    )
                  ) : (
                    <EmptyRow message="No print activity recorded in this window." colSpan={4} />
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
            <div>
              <CardTitle>SLA performance</CardTitle>
              <CardDescription>Weekly fulfillment time and on-time performance trends.</CardDescription>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleExportSla}
            >
              <Download className="mr-2 h-4 w-4" />
              Export SLA CSV
            </Button>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>On-time fulfillment</span>
                <span>
                  {slaReport?.onTimeRate !== null && slaReport?.onTimeRate !== undefined
                    ? percent.format(slaReport.onTimeRate)
                    : "—"}
                </span>
              </div>
              <Progress value={
                slaReport?.onTimeRate !== null && slaReport?.onTimeRate !== undefined 
                  ? Math.max(0, Math.min(100, slaReport.onTimeRate * 100)) 
                  : 0
              } />
              <p className="text-sm text-muted-foreground">
                Calculated with a {slaReport?.targetHours || 72}-hour fulfillment target.
              </p>
            </div>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Week</TableHead>
                    <TableHead className="text-right">Shipments</TableHead>
                    <TableHead className="text-right">On-time rate</TableHead>
                    <TableHead className="text-right">Avg hours</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {Array.isArray(slaReport?.weeklySummaries) && slaReport.weeklySummaries.length > 0 ? (
                    slaReport.weeklySummaries.map((week, index) =>
                      week && typeof week === 'object' ? (
                        <TableRow key={week.week || index}>
                          <TableCell>{weekLabel(week.week || "")}</TableCell>
                          <TableCell className="text-right">{number.format(week.totalShipments || 0)}</TableCell>
                          <TableCell className="text-right">
                            {week.onTimeRate !== null && week.onTimeRate !== undefined 
                              ? percent.format(week.onTimeRate) 
                              : "—"}
                          </TableCell>
                          <TableCell className="text-right">
                            {week.averageFulfillmentHours !== null && week.averageFulfillmentHours !== undefined
                              ? `${hours.format(week.averageFulfillmentHours)} hrs`
                              : "—"}
                          </TableCell>
                        </TableRow>
                      ) : null
                    )
                  ) : (
                    <EmptyRow message="No shipments captured in this period." colSpan={4} />
                  )}
                </TableBody>
              </Table>
            </div>
            <div>
              <h3 className="text-sm font-medium mb-2">Largest SLA breaches</h3>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Tracking</TableHead>
                      <TableHead>Order</TableHead>
                      <TableHead>Method</TableHead>
                      <TableHead className="text-right">Hours</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {Array.isArray(slaReport?.topBreaches) && slaReport.topBreaches.length > 0 ? (
                      slaReport.topBreaches.map((breach, index) =>
                        breach && typeof breach === 'object' ? (
                          <TableRow key={`${breach.trackingNumber || index}-${index}`}>
                            <TableCell>{breach.trackingNumber || "—"}</TableCell>
                            <TableCell>{breach.orderId || "—"}</TableCell>
                            <TableCell>{breach.shipmentMethod || "—"}</TableCell>
                            <TableCell className="text-right">
                              {breach.fulfillmentHours !== null && breach.fulfillmentHours !== undefined
                                ? `${hours.format(breach.fulfillmentHours)} hrs`
                                : "—"}
                            </TableCell>
                          </TableRow>
                        ) : null
                      )
                    ) : (
                      <EmptyRow message="No SLA breaches recorded." colSpan={4} />
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
        <CardHeader className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div>
            <CardTitle>Financial health</CardTitle>
            <CardDescription>Payout pacing, reconciliation status, and payment mix.</CardDescription>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleExportPayments}
            >
              <Download className="mr-2 h-4 w-4" />
              Export payments
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleExportReconciliations}
            >
              <Download className="mr-2 h-4 w-4" />
              Export reconciliations
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <MetricTile
              label="Collected revenue"
              value={currency.format(financeReport?.totalCollected || 0)}
              detail="Captured from payments" />
            <MetricTile
              label="Payment methods"
              value={Object.keys(financeReport?.methodTotals || {}).length}
              detail="Distinct tender types"
            />
            <MetricTile
              label="Completed reconciliations"
              value={number.format(financeReport?.statusCounts?.["complete"] ?? 0)}
              detail="Payouts ready for release"
            />
            <MetricTile
              label="Failed reconciliations"
              value={number.format(financeReport?.statusCounts?.["failed"] ?? 0)}
              detail="Require finance follow-up"
            />
          </div>
          <div>
            <h3 className="text-sm font-medium mb-2">Payment composition</h3>
            <div className="flex flex-wrap gap-2">
              {Object.entries(financeReport?.methodTotals || {}).length ? (
                Object.entries(financeReport.methodTotals).map(([method, amount]) => (
                  <Badge key={method} variant="secondary" className="px-3 py-1">
                    {method} · {currency.format(amount)}
                  </Badge>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">No payments recorded.</p>
              )}
            </div>
          </div>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Payout period</TableHead>
                  <TableHead className="text-right">Completed</TableHead>
                  <TableHead className="text-right">Pending</TableHead>
                  <TableHead className="text-right">Failed</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {Array.isArray(financeReport?.payoutPeriods) && financeReport.payoutPeriods.length ? (
                  financeReport.payoutPeriods.map((period) => (
                    <TableRow key={period.period}>
                      <TableCell>{weekLabel(period.period)}</TableCell>
                      <TableCell className="text-right">{number.format(period.completed)}</TableCell>
                      <TableCell className="text-right">{number.format(period.pending)}</TableCell>
                      <TableCell className="text-right">{number.format(period.failed)}</TableCell>
                      <TableCell className="text-right">{currency.format(period.amount)}</TableCell>
                    </TableRow>
                  ))
                ) : (
                  <EmptyRow message="No reconciliation events captured yet." colSpan={5} />
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
        </Card>
      </div>
    </Suspense>
  );
}

const MetricTile = ({
  label,
  value,
  detail,
}: {
  label: string;
  value: string | number;
  detail: string;
}) => (
  <div className="rounded-lg border bg-card p-4">
    <p className="text-sm text-muted-foreground">{label}</p>
    <p className="text-2xl font-semibold mt-1">{value}</p>
    <p className="text-sm text-muted-foreground mt-2">{detail}</p>
  </div>
);

const StatusBadgeTile = ({
  status,
  count,
  formatter,
}: {
  status: string;
  count: number;
  formatter: Intl.NumberFormat;
}) => {
  const label = status.replace(/([A-Z])/g, " $1");
  return (
    <div className="rounded-lg border bg-card p-4">
      <p className="text-sm text-muted-foreground capitalize">{label}</p>
      <p className="text-2xl font-semibold mt-1">{formatter.format(count)}</p>
    </div>
  );
};

const EmptyRow = ({ message, colSpan }: { message: string; colSpan: number }) => (
  <TableRow>
    <TableCell colSpan={colSpan} className="text-center text-sm text-muted-foreground">
      {message}
    </TableCell>
  </TableRow>
);