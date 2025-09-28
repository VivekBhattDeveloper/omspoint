import { useMemo } from "react";
import type { Route } from "./+types/_app.seller.reports._index";
import { PageHeader } from "@/components/app/page-header";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const DAY_IN_MS = 1000 * 60 * 60 * 24;
const TREND_DAYS = 14;
const MIN_COMPLIANCE_SCORE = 35;

const channelLabels: Record<string, string> = {
  creditCard: "Credit card",
  paypal: "PayPal",
  bankTransfer: "Bank transfer",
};

const safeDate = (value?: string | null) => (value ? new Date(value) : null);
const formatDay = (value: Date) => value.toISOString().slice(0, 10);

const getIsoWeek = (value: Date) => {
  const target = new Date(Date.UTC(value.getUTCFullYear(), value.getUTCMonth(), value.getUTCDate()));
  const day = target.getUTCDay() || 7;
  target.setUTCDate(target.getUTCDate() + 4 - day);
  const yearStart = new Date(Date.UTC(target.getUTCFullYear(), 0, 1));
  const weekNumber = Math.ceil(((target.getTime() - yearStart.getTime()) / DAY_IN_MS + 1) / 7);
  return `${target.getUTCFullYear()}-W${String(weekNumber).padStart(2, "0")}`;
};

const weekLabel = (weekKey: string) => {
  const [year, week] = weekKey.split("-W");
  return week ? `W${week} · ${year}` : year;
};

type ComplianceStatus = "healthy" | "monitor" | "action";

type LoaderData = {
  salesOverview: {
    totalGMV: number;
    orderCount: number;
    avgOrderValue: number;
    deliveredRate: number;
    pendingCount: number;
    cancelledCount: number;
    gmvChange: number;
  };
  trend: Array<{ date: string; gmv: number; orders: number }>;
  channelBreakdown: Array<{ channel: string; method: string; gmv: number; orders: number; share: number }>;
  assortment: Array<{ id: string; name: string; gmv: number; orders: number; share: number; lastOrderDate: string | null }>;
  compliance: {
    summary: { healthy: number; monitor: number; action: number };
    listings: Array<{
      id: string;
      listing: string;
      score: number;
      status: ComplianceStatus;
      issues: string[];
      totalOrders: number;
      deliveredRate: number;
      lastOrderDate: string | null;
    }>;
    tasks: Array<{
      id: string;
      listing: string;
      action: string;
      status: ComplianceStatus;
      due: string | null;
    }>;
  };
  settlements: {
    summary: {
      totalCycles: number;
      complete: number;
      inProgress: number;
      attention: number;
      totalOrders: number;
      totalAmount: number;
    };
    cycles: Array<{
      key: string;
      label: string;
      status: "Complete" | "In progress" | "Attention needed";
      totalOrders: number;
      totalAmount: number;
      pending: number;
      failed: number;
      complete: number;
      avgDays: number | null;
      firstDate: string;
      lastDate: string;
    }>;
    nextPayout: { label: string; status: string; date: string } | null;
  };
};

export const loader = async ({ context }: Route.LoaderArgs): Promise<LoaderData> => {
  const horizonStart = new Date();
  horizonStart.setDate(horizonStart.getDate() - 90);
  const horizonISO = horizonStart.toISOString();

  const [orders, reconciliations] = await Promise.all([
    context.api.order.findMany({
      first: 250,
      filter: { orderDate: { greaterThanOrEqual: horizonISO } },
      sort: { orderDate: "Descending" },
      select: {
        id: true,
        orderId: true,
        status: true,
        total: true,
        orderDate: true,
        seller: { id: true, name: true },
        payment: {
          amount: true,
          paymentDate: true,
          paymentMethod: true,
        },
        printJob: { status: true },
        products: {
          edges: {
            node: {
              id: true,
              productName: true,
              price: true,
            },
          },
        },
      },
    }),
    context.api.financeReconciliation.findMany({
      first: 250,
      filter: { reconciliationDate: { greaterThanOrEqual: horizonISO } },
      sort: { reconciliationDate: "Descending" },
      select: {
        id: true,
        reconciliationId: true,
        reconciliationDate: true,
        status: true,
        order: {
          id: true,
          orderId: true,
          orderDate: true,
          payment: { amount: true },
        },
      },
    }),
  ]);

  let totalGMV = 0;
  let orderCount = 0;
  let deliveredCount = 0;
  let pendingCount = 0;
  let cancelledCount = 0;

  const dailyMap = new Map<string, { gmv: number; orders: number }>();
  const channelMap = new Map<string, { gmv: number; orders: number }>();
  const assortmentMap = new Map<
    string,
    { name: string; gmv: number; orders: number; lastOrderDate: Date | null }
  >();
  const complianceMap = new Map<
    string,
    {
      listing: string;
      totalOrders: number;
      cancelled: number;
      failedPrints: number;
      missingPayments: number;
      delivered: number;
      lastOrderDate: Date | null;
    }
  >();

  for (const order of orders) {
    orderCount += 1;
    const orderTotal = order.total ?? 0;
    totalGMV += orderTotal;

    if (order.status === "delivered") deliveredCount += 1;
    if (order.status === "pending") pendingCount += 1;
    if (order.status === "cancelled") cancelledCount += 1;

    const orderDate = safeDate(order.orderDate);
    if (orderDate) {
      const dayKey = formatDay(orderDate);
      const entry = dailyMap.get(dayKey) ?? { gmv: 0, orders: 0 };
      entry.gmv += orderTotal;
      entry.orders += 1;
      dailyMap.set(dayKey, entry);
    }

    const channelKey = order.payment?.paymentMethod ?? "unassigned";
    const channelEntry = channelMap.get(channelKey) ?? { gmv: 0, orders: 0 };
    channelEntry.gmv += orderTotal;
    channelEntry.orders += 1;
    channelMap.set(channelKey, channelEntry);

    const productEdges = ((order.products?.edges ?? []) as Array<{
      node?: { id?: string | null; productName?: string | null; price?: number | null };
    }>).map((edge) => edge?.node).filter(Boolean) as Array<{
      id?: string | null;
      productName?: string | null;
      price?: number | null;
    }>;

    const perProductGMV = productEdges.length ? orderTotal / productEdges.length : orderTotal;

    if (productEdges.length) {
      for (const product of productEdges) {
        const key = product.id ?? `${order.id}-${product.productName ?? "listing"}`;
        const name = product.productName ?? "Unassigned SKU";
        const assortmentEntry = assortmentMap.get(key) ?? {
          name,
          gmv: 0,
          orders: 0,
          lastOrderDate: null,
        };
        assortmentEntry.gmv += perProductGMV;
        assortmentEntry.orders += 1;
        if (orderDate && (!assortmentEntry.lastOrderDate || orderDate > assortmentEntry.lastOrderDate)) {
          assortmentEntry.lastOrderDate = orderDate;
        }
        assortmentMap.set(key, assortmentEntry);

        const complianceEntry = complianceMap.get(key) ?? {
          listing: name,
          totalOrders: 0,
          cancelled: 0,
          failedPrints: 0,
          missingPayments: 0,
          delivered: 0,
          lastOrderDate: null,
        };
        complianceEntry.totalOrders += 1;
        if (order.status === "cancelled") complianceEntry.cancelled += 1;
        if (order.printJob?.status === "failed") complianceEntry.failedPrints += 1;
        if (!order.payment?.paymentDate) complianceEntry.missingPayments += 1;
        if (order.status === "delivered") complianceEntry.delivered += 1;
        if (orderDate && (!complianceEntry.lastOrderDate || orderDate > complianceEntry.lastOrderDate)) {
          complianceEntry.lastOrderDate = orderDate;
        }
        complianceMap.set(key, complianceEntry);
      }
    } else {
      const key = `order-${order.id}`;
      const assortmentEntry = assortmentMap.get(key) ?? {
        name: "Unassigned SKU",
        gmv: 0,
        orders: 0,
        lastOrderDate: null,
      };
      assortmentEntry.gmv += orderTotal;
      assortmentEntry.orders += 1;
      if (orderDate && (!assortmentEntry.lastOrderDate || orderDate > assortmentEntry.lastOrderDate)) {
        assortmentEntry.lastOrderDate = orderDate;
      }
      assortmentMap.set(key, assortmentEntry);

      const complianceEntry = complianceMap.get(key) ?? {
        listing: "Unassigned listing",
        totalOrders: 0,
        cancelled: 0,
        failedPrints: 0,
        missingPayments: 0,
        delivered: 0,
        lastOrderDate: null,
      };
      complianceEntry.totalOrders += 1;
      if (order.status === "cancelled") complianceEntry.cancelled += 1;
      if (order.printJob?.status === "failed") complianceEntry.failedPrints += 1;
      if (!order.payment?.paymentDate) complianceEntry.missingPayments += 1;
      if (order.status === "delivered") complianceEntry.delivered += 1;
      if (orderDate && (!complianceEntry.lastOrderDate || orderDate > complianceEntry.lastOrderDate)) {
        complianceEntry.lastOrderDate = orderDate;
      }
      complianceMap.set(key, complianceEntry);
    }
  }

  const trend: Array<{ date: string; gmv: number; orders: number }> = [];
  const today = new Date();
  const trendStart = new Date();
  trendStart.setDate(today.getDate() - TREND_DAYS + 1);
  for (let i = 0; i < TREND_DAYS; i++) {
    const day = new Date(trendStart);
    day.setDate(trendStart.getDate() + i);
    const key = formatDay(day);
    const entry = dailyMap.get(key) ?? { gmv: 0, orders: 0 };
    trend.push({ date: key, gmv: entry.gmv, orders: entry.orders });
  }

  const half = Math.floor(trend.length / 2) || 1;
  const previousGmv = trend
    .slice(0, half)
    .reduce((sum, point) => sum + point.gmv, 0);
  const recentGmv = trend
    .slice(half)
    .reduce((sum, point) => sum + point.gmv, 0);
  const gmvChange = previousGmv === 0 ? (recentGmv > 0 ? 1 : 0) : (recentGmv - previousGmv) / previousGmv;

  const channelBreakdown = Array.from(channelMap.entries())
    .map(([method, value]) => ({
      channel: channelLabels[method] ?? "Unassigned",
      method,
      gmv: value.gmv,
      orders: value.orders,
      share: totalGMV ? value.gmv / totalGMV : 0,
    }))
    .sort((a, b) => b.gmv - a.gmv);

  const assortment = Array.from(assortmentMap.entries())
    .map(([id, value]) => ({
      id,
      name: value.name,
      gmv: value.gmv,
      orders: value.orders,
      share: totalGMV ? value.gmv / totalGMV : 0,
      lastOrderDate: value.lastOrderDate ? value.lastOrderDate.toISOString() : null,
    }))
    .sort((a, b) => b.gmv - a.gmv)
    .slice(0, 8);

  const complianceListings = Array.from(complianceMap.entries())
    .map(([id, value]) => {
      const penalty = value.failedPrints * 22 + value.cancelled * 18 + value.missingPayments * 12;
      const rawScore = Math.max(MIN_COMPLIANCE_SCORE, 100 - penalty);
      let status: ComplianceStatus = "healthy";
      if (rawScore < 75) status = "action";
      else if (rawScore < 90) status = "monitor";
      const issues: string[] = [];
      if (value.failedPrints) {
        issues.push(`${value.failedPrints} failed print ${value.failedPrints === 1 ? "job" : "jobs"}`);
      }
      if (value.cancelled) {
        issues.push(`${value.cancelled} cancellation${value.cancelled === 1 ? "" : "s"}`);
      }
      if (value.missingPayments) {
        issues.push(`${value.missingPayments} unsettled payout${value.missingPayments === 1 ? "" : "s"}`);
      }
      const deliveredRate = value.totalOrders ? value.delivered / value.totalOrders : 0;
      if (!issues.length && deliveredRate < 0.8) {
        issues.push("Low delivery completion rate");
      }
      return {
        id,
        listing: value.listing,
        score: Math.round(rawScore),
        status,
        issues,
        totalOrders: value.totalOrders,
        deliveredRate,
        lastOrderDate: value.lastOrderDate ? value.lastOrderDate.toISOString() : null,
      };
    })
    .sort((a, b) => a.score - b.score);

  const complianceSummary = complianceListings.reduce(
    (acc, listing) => {
      if (listing.status === "healthy") acc.healthy += 1;
      else if (listing.status === "monitor") acc.monitor += 1;
      else acc.action += 1;
      return acc;
    },
    { healthy: 0, monitor: 0, action: 0 }
  );

  const complianceTasks = complianceListings
    .filter((listing) => listing.status !== "healthy")
    .slice(0, 5)
    .map((listing) => ({
      id: listing.id,
      listing: listing.listing,
      action: listing.issues[0] ?? "Review listing performance",
      status: listing.status,
      due: listing.lastOrderDate,
    }));

  const cycleMap = new Map<
    string,
    {
      key: string;
      label: string;
      firstDate: Date;
      lastDate: Date;
      totalAmount: number;
      statusCounts: Record<string, number>;
      orderIds: Set<string>;
      daysToReconcile: number[];
    }
  >();

  for (const reconciliation of reconciliations) {
    const reconciliationDate = safeDate(reconciliation.reconciliationDate);
    if (!reconciliationDate) continue;
    const cycleKey = getIsoWeek(reconciliationDate);
    const entry =
      cycleMap.get(cycleKey) ?? {
        key: cycleKey,
        label: weekLabel(cycleKey),
        firstDate: reconciliationDate,
        lastDate: reconciliationDate,
        totalAmount: 0,
        statusCounts: { pending: 0, failed: 0, complete: 0 },
        orderIds: new Set<string>(),
        daysToReconcile: [],
      };

    if (reconciliationDate < entry.firstDate) entry.firstDate = reconciliationDate;
    if (reconciliationDate > entry.lastDate) entry.lastDate = reconciliationDate;

    entry.totalAmount += reconciliation.order?.payment?.amount ?? 0;
    if (reconciliation.status) {
      entry.statusCounts[reconciliation.status] = (entry.statusCounts[reconciliation.status] ?? 0) + 1;
    }

    const orderKey = reconciliation.order?.id ?? reconciliation.order?.orderId;
    if (orderKey) entry.orderIds.add(orderKey);

    const orderDate = safeDate(reconciliation.order?.orderDate ?? null);
    if (orderDate) {
      entry.daysToReconcile.push((reconciliationDate.getTime() - orderDate.getTime()) / DAY_IN_MS);
    }

    cycleMap.set(cycleKey, entry);
  }

  const settlementCycles = Array.from(cycleMap.values())
    .map((entry) => {
      const avgDays = entry.daysToReconcile.length
        ? entry.daysToReconcile.reduce((sum, value) => sum + value, 0) / entry.daysToReconcile.length
        : null;
      const status = entry.statusCounts.failed
        ? "Attention needed"
        : entry.statusCounts.pending
        ? "In progress"
        : "Complete";
      return {
        key: entry.key,
        label: entry.label,
        status,
        totalOrders: entry.orderIds.size,
        totalAmount: entry.totalAmount,
        pending: entry.statusCounts.pending ?? 0,
        failed: entry.statusCounts.failed ?? 0,
        complete: entry.statusCounts.complete ?? 0,
        avgDays,
        firstDate: entry.firstDate.toISOString(),
        lastDate: entry.lastDate.toISOString(),
      };
    })
    .sort((a, b) => new Date(b.lastDate).getTime() - new Date(a.lastDate).getTime());

  const settlementSummary = settlementCycles.reduce(
    (acc, cycle) => {
      acc.totalOrders += cycle.totalOrders;
      acc.totalAmount += cycle.totalAmount;
      if (cycle.status === "Complete") acc.complete += 1;
      else if (cycle.status === "Attention needed") acc.attention += 1;
      else acc.inProgress += 1;
      return acc;
    },
    {
      totalCycles: settlementCycles.length,
      complete: 0,
      inProgress: 0,
      attention: 0,
      totalOrders: 0,
      totalAmount: 0,
    }
  );

  const nextPayout = settlementCycles.find((cycle) => cycle.status !== "Complete") ?? settlementCycles[0] ?? null;

  return {
    salesOverview: {
      totalGMV,
      orderCount,
      avgOrderValue: orderCount ? totalGMV / orderCount : 0,
      deliveredRate: orderCount ? deliveredCount / orderCount : 0,
      pendingCount,
      cancelledCount,
      gmvChange,
    },
    trend,
    channelBreakdown,
    assortment,
    compliance: {
      summary: complianceSummary,
      listings: complianceListings.slice(0, 8),
      tasks: complianceTasks,
    },
    settlements: {
      summary: settlementSummary,
      cycles: settlementCycles.slice(0, 6),
      nextPayout: nextPayout
        ? { label: nextPayout.label, status: nextPayout.status, date: nextPayout.lastDate }
        : null,
    },
  };
};

const statusStyles: Record<ComplianceStatus, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  healthy: { label: "Healthy", variant: "secondary" },
  monitor: { label: "Monitor", variant: "default" },
  action: { label: "Action required", variant: "destructive" },
};

const settlementBadge: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  Complete: { label: "Complete", variant: "secondary" },
  "In progress": { label: "In progress", variant: "default" },
  "Attention needed": { label: "Attention needed", variant: "destructive" },
};

const Sparkline = ({ data }: { data: Array<{ date: string; gmv: number }> }) => {
  const maxValue = data.reduce((max, point) => (point.gmv > max ? point.gmv : max), 0) || 1;
  return (
    <div className="flex h-16 items-end gap-1">
      {data.map((point) => (
        <div key={point.date} className="flex-1">
          <div
            className="rounded-t bg-primary/70"
            style={{ height: `${Math.max(4, (point.gmv / maxValue) * 100)}%` }}
            title={`${point.date}: ${point.gmv.toFixed(0)}`}
          />
        </div>
      ))}
    </div>
  );
};

const formatDateRange = (startISO: string, endISO: string) => {
  const formatter = new Intl.DateTimeFormat(undefined, { month: "short", day: "numeric" });
  const start = formatter.format(new Date(startISO));
  const end = formatter.format(new Date(endISO));
  return start === end ? start : `${start} – ${end}`;
};

const formatRelative = (iso: string | null) => {
  if (!iso) return "—";
  const value = new Date(iso);
  const deltaDays = Math.round((Date.now() - value.getTime()) / DAY_IN_MS);
  if (Number.isNaN(deltaDays)) return "—";
  if (deltaDays === 0) return "today";
  if (deltaDays === 1) return "1 day ago";
  if (deltaDays < 7) return `${deltaDays} days ago`;
  return new Intl.DateTimeFormat(undefined, { month: "short", day: "numeric" }).format(value);
};

export default function SellerReportsPage({ loaderData }: Route.ComponentProps) {
  const { salesOverview, trend, channelBreakdown, assortment, compliance, settlements } = loaderData as LoaderData;

  const currency = useMemo(() => new Intl.NumberFormat(undefined, { style: "currency", currency: "USD", maximumFractionDigits: 0 }), []);
  const number = useMemo(() => new Intl.NumberFormat(undefined, { maximumFractionDigits: 0 }), []);
  const percent = useMemo(() => new Intl.NumberFormat(undefined, { style: "percent", maximumFractionDigits: 1 }), []);

  const latestTrendPoint = trend.at(-1);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Reports"
        description="Review sales performance, listings health, and settlement cadence."
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Card>
          <CardHeader className="pb-1">
            <CardDescription>Total GMV (90 days)</CardDescription>
            <CardTitle className="text-2xl">{currency.format(salesOverview.totalGMV)}</CardTitle>
          </CardHeader>
          <CardContent className="text-xs text-muted-foreground">
            {percent.format(salesOverview.gmvChange)} vs prior period
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-1">
            <CardDescription>Orders</CardDescription>
            <CardTitle className="text-2xl">{number.format(salesOverview.orderCount)}</CardTitle>
          </CardHeader>
          <CardContent className="text-xs text-muted-foreground">
            Avg order value {currency.format(salesOverview.avgOrderValue || 0)}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-1">
            <CardDescription>Delivered rate</CardDescription>
            <CardTitle className="text-2xl">{percent.format(salesOverview.deliveredRate || 0)}</CardTitle>
          </CardHeader>
          <CardContent className="text-xs text-muted-foreground">
            Pending {number.format(salesOverview.pendingCount)} · Cancelled {number.format(salesOverview.cancelledCount)}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-1">
            <CardDescription>Latest GMV day</CardDescription>
            <CardTitle className="text-2xl">
              {latestTrendPoint ? currency.format(latestTrendPoint.gmv) : "—"}
            </CardTitle>
          </CardHeader>
          <CardContent className="text-xs text-muted-foreground">
            {latestTrendPoint ? `${latestTrendPoint.orders} orders on ${latestTrendPoint.date}` : "No orders in range"}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>GMV trend</CardTitle>
            <CardDescription>Rolling 14 day sales trend aggregated by order date.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Sparkline data={trend} />
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {trend.slice(-6).map((point) => (
                <div key={point.date} className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">{point.date}</span>
                  <span className="font-medium">{currency.format(point.gmv)}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Channel performance</CardTitle>
            <CardDescription>GMV distribution by payment/channel method.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {channelBreakdown.length ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Channel</TableHead>
                    <TableHead className="text-right">GMV</TableHead>
                    <TableHead className="text-right">Share</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {channelBreakdown.map((channel) => (
                    <TableRow key={channel.method}>
                      <TableCell>{channel.channel}</TableCell>
                      <TableCell className="text-right">{currency.format(channel.gmv)}</TableCell>
                      <TableCell className="text-right">{percent.format(channel.share || 0)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <p className="text-sm text-muted-foreground">No orders within the selected horizon.</p>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 xl:grid-cols-3">
        <Card className="xl:col-span-2">
          <CardHeader>
            <CardTitle>Assortment performance</CardTitle>
            <CardDescription>Top listings contributing to GMV across connected channels.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {assortment.length ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Listing</TableHead>
                    <TableHead className="text-right">GMV</TableHead>
                    <TableHead className="text-right">Orders</TableHead>
                    <TableHead className="text-right">Share</TableHead>
                    <TableHead className="text-right">Last order</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {assortment.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="max-w-[220px] truncate">{item.name}</TableCell>
                      <TableCell className="text-right">{currency.format(item.gmv)}</TableCell>
                      <TableCell className="text-right">{number.format(item.orders)}</TableCell>
                      <TableCell className="text-right">{percent.format(item.share || 0)}</TableCell>
                      <TableCell className="text-right">{formatRelative(item.lastOrderDate)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <p className="text-sm text-muted-foreground">No assortment activity recorded in the last 90 days.</p>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Listing compliance summary</CardTitle>
            <CardDescription>Signal how listings are performing before analytics go live.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap gap-2 text-sm">
              <Badge variant="secondary">Healthy · {compliance.summary.healthy}</Badge>
              <Badge>{`Monitor · ${compliance.summary.monitor}`}</Badge>
              <Badge variant="destructive">Action · {compliance.summary.action}</Badge>
            </div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Listing</TableHead>
                  <TableHead className="text-right">Score</TableHead>
                  <TableHead className="text-right">Orders</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {compliance.listings.slice(0, 5).map((listing) => (
                  <TableRow key={listing.id}>
                    <TableCell className="max-w-[200px] truncate">{listing.listing}</TableCell>
                    <TableCell className="text-right">
                      <Badge variant={statusStyles[listing.status].variant}>{`${listing.score}`}</Badge>
                    </TableCell>
                    <TableCell className="text-right">{number.format(listing.totalOrders)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 xl:grid-cols-3">
        <Card className="xl:col-span-2">
          <CardHeader>
            <CardTitle>Listing compliance scoreboard</CardTitle>
            <CardDescription>Prioritize listings with the largest risk flags.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {compliance.listings.length ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Listing</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Issues</TableHead>
                    <TableHead className="text-right">Orders</TableHead>
                    <TableHead className="text-right">Delivered</TableHead>
                    <TableHead className="text-right">Last activity</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {compliance.listings.map((listing) => (
                    <TableRow key={listing.id}>
                      <TableCell className="max-w-[220px] truncate font-medium">{listing.listing}</TableCell>
                      <TableCell>
                        <Badge variant={statusStyles[listing.status].variant}>{statusStyles[listing.status].label}</Badge>
                      </TableCell>
                      <TableCell className="max-w-[260px] text-sm text-muted-foreground">
                        {listing.issues.length ? listing.issues.join(", ") : "—"}
                      </TableCell>
                      <TableCell className="text-right">{number.format(listing.totalOrders)}</TableCell>
                      <TableCell className="text-right">{percent.format(listing.deliveredRate || 0)}</TableCell>
                      <TableCell className="text-right">{formatRelative(listing.lastOrderDate)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <p className="text-sm text-muted-foreground">No listing signals yet. Connect analytics to populate compliance.</p>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Fix-forward tasks</CardTitle>
            <CardDescription>Generated from current listings until analytics pipelines land.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {compliance.tasks.length ? (
              compliance.tasks.map((task) => (
                <div key={task.id} className="rounded-md border p-3">
                  <div className="flex items-center justify-between text-sm font-medium">
                    <span className="truncate">{task.listing}</span>
                    <Badge variant={statusStyles[task.status].variant}>{statusStyles[task.status].label}</Badge>
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">{task.action}</p>
                  <p className="mt-2 text-xs text-muted-foreground">Last activity {formatRelative(task.due)}</p>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">All listings look healthy. No fix-forward work queued.</p>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Settlement cadence</CardTitle>
          <CardDescription>Reconciliation view grouped by payout cycle.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <p className="text-xs uppercase text-muted-foreground">Total volume</p>
              <p className="text-lg font-semibold">{currency.format(settlements.summary.totalAmount)}</p>
            </div>
            <div>
              <p className="text-xs uppercase text-muted-foreground">Cycles</p>
              <p className="text-lg font-semibold">{number.format(settlements.summary.totalCycles)}</p>
            </div>
            <div>
              <p className="text-xs uppercase text-muted-foreground">Completed</p>
              <p className="text-lg font-semibold">{number.format(settlements.summary.complete)}</p>
            </div>
            <div>
              <p className="text-xs uppercase text-muted-foreground">Needing attention</p>
              <p className="text-lg font-semibold">{number.format(settlements.summary.attention)}</p>
            </div>
          </div>
          {settlements.nextPayout ? (
            <div className="rounded-md border bg-muted/40 p-3 text-sm">
              Next payout window <span className="font-medium">{settlements.nextPayout.label}</span> · Status {settlements.nextPayout.status}
            </div>
          ) : null}
          {settlements.cycles.length ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Cycle</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Orders</TableHead>
                  <TableHead className="text-right">GMV</TableHead>
                  <TableHead className="text-right">Window</TableHead>
                  <TableHead className="text-right">Avg days</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {settlements.cycles.map((cycle) => (
                  <TableRow key={cycle.key}>
                    <TableCell className="font-medium">{cycle.label}</TableCell>
                    <TableCell>
                      <Badge variant={settlementBadge[cycle.status].variant}>{settlementBadge[cycle.status].label}</Badge>
                    </TableCell>
                    <TableCell className="text-right">{number.format(cycle.totalOrders)}</TableCell>
                    <TableCell className="text-right">{currency.format(cycle.totalAmount)}</TableCell>
                    <TableCell className="text-right">{formatDateRange(cycle.firstDate, cycle.lastDate)}</TableCell>
                    <TableCell className="text-right">{cycle.avgDays == null ? "—" : `${cycle.avgDays.toFixed(1)} d`}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <p className="text-sm text-muted-foreground">No reconciliations recorded. Hook up finance analytics to populate payout cycles.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
