import { useEffect, useMemo, useState } from "react";
import type { Route } from "./+types/_app.seller.listings._index";
import { PageHeader } from "@/components/app/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { ArrowDownRight, ArrowUpRight, RefreshCw, ShieldAlert, ShieldCheck } from "lucide-react";

const DAY_IN_MS = 1000 * 60 * 60 * 24;

const channelLabels: Record<string, string> = {
  creditCard: "Amazon",
  paypal: "Shopify",
  bankTransfer: "Walmart",
  unassigned: "Unassigned channel",
};

type ListingStatus = "published" | "pending" | "error" | "paused";

type ListingRow = {
  id: string;
  label: string;
  channelKey: string;
  channelLabel: string;
  status: ListingStatus;
  issues: string[];
  lastOrderDate: string | null;
  lastSync: string | null;
  totalOrders: number;
  pendingOrders: number;
  price: number | null;
  previousPrice: number | null;
  priceFloor: number | null;
  priceCeiling: number | null;
  priceChange: number | null;
  priceChangePercent: number | null;
  repricingActive: boolean;
  pricingRule: string | null;
  complianceScore: number;
  flagged: boolean;
  suggestedAction: string;
};

type ChannelHealth = {
  channel: string;
  label: string;
  total: number;
  published: number;
  pending: number;
  error: number;
  paused: number;
  lastSync: string | null;
  issueCount: number;
};

type SyncService = {
  id: string;
  name: string;
  description: string;
  status: "connected" | "syncing" | "attention" | "disconnected";
  lastSync: string | null;
  attentionCount: number;
};

type LoaderData = {
  listings: ListingRow[];
  summary: {
    total: number;
    published: number;
    pending: number;
    error: number;
    paused: number;
    flagged: number;
    repricing: number;
  };
  channelHealth: ChannelHealth[];
  syncServices: SyncService[];
};

type OrderRecord = {
  id?: string | null;
  orderDate?: string | null;
  status?: string | null;
  total?: number | null;
  payment?: { paymentMethod?: string | null } | null;
  printJob?: { status?: string | null } | null;
  products?: {
    edges?: Array<{
      node?: { id?: string | null; productName?: string | null; price?: number | null } | null;
    } | null>;
  } | null;
};

type ListingAccumulator = {
  id: string;
  label: string;
  channelKey: string;
  channelLabel: string;
  totalOrders: number;
  pendingOrders: number;
  cancelledOrders: number;
  failedPrints: number;
  lastOrderDate: Date | null;
  issues: Set<string>;
  latestPrice: number | null;
  previousPrice: number | null;
  priceFloor: number | null;
  priceCeiling: number | null;
};

export const loader = async ({ context }: Route.LoaderArgs): Promise<LoaderData> => {
  const since = new Date();
  since.setDate(since.getDate() - 60);

  const orders = (await context.api.order.findMany({
    first: 200,
    filter: { orderDate: { greaterThanOrEqual: since.toISOString() } },
    sort: { orderDate: "Descending" },
    select: {
      id: true,
      orderDate: true,
      status: true,
      total: true,
      payment: { paymentMethod: true },
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
  })) as OrderRecord[];

  const listingMap = new Map<string, ListingAccumulator>();

  for (const order of orders) {
    const orderDate = order.orderDate ? new Date(order.orderDate) : null;
    const channelKey = order.payment?.paymentMethod ?? "unassigned";
    const channelLabel = channelLabels[channelKey] ?? channelLabels.unassigned;

    const products =
      ((order.products?.edges ?? []) as Array<
        | {
            node?: { id?: string | null; productName?: string | null; price?: number | null } | null;
          }
        | null
      >)
        .map((edge) => edge?.node)
        .filter(Boolean) as Array<{ id?: string | null; productName?: string | null; price?: number | null }>;

    const registerListing = (id: string, label: string, price: number | null) => {
      const existing = listingMap.get(id);
      if (existing) {
        if (orderDate && (!existing.lastOrderDate || orderDate > existing.lastOrderDate)) {
          if (
            existing.latestPrice !== price &&
            existing.latestPrice != null &&
            price != null &&
            existing.previousPrice == null
          ) {
            existing.previousPrice = existing.latestPrice;
          } else if (
            existing.previousPrice == null &&
            price != null &&
            existing.latestPrice != null &&
            price !== existing.latestPrice
          ) {
            existing.previousPrice = price;
          }
          existing.lastOrderDate = orderDate;
          if (price != null) {
            existing.latestPrice = price;
          }
        } else if (
          existing.previousPrice == null &&
          price != null &&
          existing.latestPrice != null &&
          price !== existing.latestPrice
        ) {
          existing.previousPrice = price;
        }
        if (price != null) {
          existing.priceFloor = existing.priceFloor != null ? Math.min(existing.priceFloor, price) : price;
          existing.priceCeiling = existing.priceCeiling != null ? Math.max(existing.priceCeiling, price) : price;
        }
        existing.totalOrders += 1;
        if (order.status === "pending") existing.pendingOrders += 1;
        if (order.status === "cancelled") existing.cancelledOrders += 1;
        if (order.printJob?.status === "failed") existing.failedPrints += 1;
        if (order.printJob?.status === "failed") existing.issues.add("Print job failure reported");
        return existing;
      }

      const initialPrice = price ?? null;
      const accumulator: ListingAccumulator = {
        id,
        label,
        channelKey,
        channelLabel,
        totalOrders: 1,
        pendingOrders: order.status === "pending" ? 1 : 0,
        cancelledOrders: order.status === "cancelled" ? 1 : 0,
        failedPrints: order.printJob?.status === "failed" ? 1 : 0,
        lastOrderDate: orderDate,
        issues: new Set(order.printJob?.status === "failed" ? ["Print job failure reported"] : []),
        latestPrice: initialPrice,
        previousPrice: null,
        priceFloor: initialPrice,
        priceCeiling: initialPrice,
      };
      listingMap.set(id, accumulator);
      return accumulator;
    };

    if (products.length) {
      products.forEach((product, index) => {
        const listingId = product.id
          ? `${product.id}-${channelKey}`
          : `${order.id ?? "order"}-${channelKey}-${index}`;
        const label = product.productName ?? "Unassigned SKU";
        registerListing(listingId, label, product.price ?? null);
      });
    } else {
      const fallbackId = `${order.id ?? "order"}-${channelKey}`;
      registerListing(fallbackId, "Unassigned listing", order.total ?? null);
    }
  }

  const statusRank: Record<ListingStatus, number> = {
    error: 0,
    pending: 1,
    paused: 2,
    published: 3,
  };

  const listings: ListingRow[] = Array.from(listingMap.values()).map((listing) => {
    const issues = Array.from(listing.issues);
    const now = Date.now();
    const lastActivityMs = listing.lastOrderDate ? now - listing.lastOrderDate.getTime() : Number.POSITIVE_INFINITY;
    const inactive = lastActivityMs > 45 * DAY_IN_MS;

    let status: ListingStatus = "published";
    if (listing.failedPrints > 0 || listing.cancelledOrders / Math.max(1, listing.totalOrders) > 0.25) {
      status = "error";
    } else if (listing.pendingOrders > 0) {
      status = "pending";
    } else if (inactive) {
      status = "paused";
    }

    if (status === "paused") {
      issues.push("No orders in last 45 days");
    }
    if (listing.cancelledOrders > 0 && !issues.includes("Order cancellations detected")) {
      issues.push("Order cancellations detected");
    }
    if (listing.pendingOrders > 2 && !issues.includes("Pending channel confirmation")) {
      issues.push("Pending channel confirmation");
    }

    const priceChange =
      listing.latestPrice != null && listing.previousPrice != null
        ? listing.latestPrice - listing.previousPrice
        : null;
    const priceChangePercent =
      priceChange != null && listing.previousPrice
        ? priceChange / listing.previousPrice
        : null;

    const compliancePenalty =
      listing.failedPrints * 25 + listing.cancelledOrders * 18 + listing.pendingOrders * 10;
    let complianceScore = Math.max(40, Math.round(100 - compliancePenalty));
    if (status === "error") {
      complianceScore = Math.max(35, complianceScore - 10);
    }
    const flagged = complianceScore < 85 || status === "error";

    const repricingActive =
      listing.priceFloor != null &&
      listing.priceCeiling != null &&
      listing.latestPrice != null &&
      listing.priceCeiling - listing.priceFloor > Math.max(2, listing.latestPrice * 0.04);

    const pricingRule = repricingActive
      ? listing.priceCeiling != null &&
        listing.priceFloor != null &&
        listing.priceCeiling - listing.priceFloor > Math.max(5, listing.latestPrice! * 0.12)
        ? "Aggressive competitive repricing"
        : "Floor margin guard"
      : null;

    let suggestedAction = "Monitoring channel health";
    if (status === "error") {
      suggestedAction = issues[0] ?? "Resolve sync exception";
    } else if (status === "pending") {
      suggestedAction = "Awaiting channel confirmation";
    } else if (status === "paused") {
      suggestedAction = "Review assortment coverage";
    } else if (flagged) {
      suggestedAction = "Review compliance score";
    }

    return {
      id: listing.id,
      label: listing.label,
      channelKey: listing.channelKey,
      channelLabel: listing.channelLabel,
      status,
      issues,
      lastOrderDate: listing.lastOrderDate ? listing.lastOrderDate.toISOString() : null,
      lastSync: listing.lastOrderDate ? listing.lastOrderDate.toISOString() : null,
      totalOrders: listing.totalOrders,
      pendingOrders: listing.pendingOrders,
      price: listing.latestPrice,
      previousPrice: listing.previousPrice,
      priceFloor: listing.priceFloor,
      priceCeiling: listing.priceCeiling,
      priceChange,
      priceChangePercent,
      repricingActive,
      pricingRule,
      complianceScore,
      flagged,
      suggestedAction,
    };
  });

  listings.sort((a, b) => {
    const statusDiff = statusRank[a.status] - statusRank[b.status];
    if (statusDiff !== 0) return statusDiff;
    const aTime = a.lastOrderDate ? new Date(a.lastOrderDate).getTime() : 0;
    const bTime = b.lastOrderDate ? new Date(b.lastOrderDate).getTime() : 0;
    return bTime - aTime;
  });

  const channelAggregate = new Map<
    string,
    {
      label: string;
      total: number;
      published: number;
      pending: number;
      error: number;
      paused: number;
      lastSync: Date | null;
      issues: Set<string>;
    }
  >();

  for (const listing of listings) {
    const channel = channelAggregate.get(listing.channelKey) ?? {
      label: listing.channelLabel,
      total: 0,
      published: 0,
      pending: 0,
      error: 0,
      paused: 0,
      lastSync: null as Date | null,
      issues: new Set<string>(),
    };
    channel.total += 1;
    channel[listing.status] += 1;
    if (listing.lastSync) {
      const syncDate = new Date(listing.lastSync);
      if (!channel.lastSync || syncDate > channel.lastSync) {
        channel.lastSync = syncDate;
      }
    }
    for (const issue of listing.issues) {
      channel.issues.add(issue);
    }
    channelAggregate.set(listing.channelKey, channel);
  }

  const channelHealth: ChannelHealth[] = Array.from(channelAggregate.entries())
    .map(([channelKey, value]) => ({
      channel: channelKey,
      label: value.label,
      total: value.total,
      published: value.published,
      pending: value.pending,
      error: value.error,
      paused: value.paused,
      lastSync: value.lastSync ? value.lastSync.toISOString() : null,
      issueCount: value.issues.size,
    }))
    .sort((a, b) => b.total - a.total);

  const summary = listings.reduce(
    (acc, listing) => {
      acc.total += 1;
      acc[listing.status] += 1;
      if (listing.flagged) acc.flagged += 1;
      if (listing.repricingActive) acc.repricing += 1;
      return acc;
    },
    {
      total: 0,
      published: 0,
      pending: 0,
      error: 0,
      paused: 0,
      flagged: 0,
      repricing: 0,
    }
  );

  const serviceDefinitions: Array<{ id: string; name: string; description: string; channelKey: string }> = [
    {
      id: "amazon-mws",
      name: "Amazon Listings",
      description: "Prime + Seller Central feed",
      channelKey: "creditCard",
    },
    {
      id: "shopify",
      name: "Shopify Markets",
      description: "Shopify storefront sync",
      channelKey: "paypal",
    },
    {
      id: "walmart",
      name: "Walmart Marketplace",
      description: "Drop ship vendor program",
      channelKey: "bankTransfer",
    },
  ];

  const syncServices: SyncService[] = serviceDefinitions.map((service) => {
    const channel = channelHealth.find((entry) => entry.channel === service.channelKey);
    let status: SyncService["status"] = "disconnected";
    if (channel) {
      if (channel.error > 0 || channel.issueCount > 0) status = "attention";
      else if (channel.pending > 0) status = "syncing";
      else status = "connected";
    }
    return {
      id: service.id,
      name: service.name,
      description: service.description,
      status,
      lastSync: channel?.lastSync ?? null,
      attentionCount: channel?.issueCount ?? 0,
    };
  });

  return { listings, summary, channelHealth, syncServices };
};

const listingStatusConfig: Record<ListingStatus, { label: string; className: string }> = {
  published: { label: "Published", className: "bg-emerald-100 text-emerald-700 border-emerald-200" },
  pending: { label: "Syncing", className: "bg-sky-100 text-sky-700 border-sky-200" },
  error: { label: "Sync error", className: "bg-rose-100 text-rose-700 border-rose-200" },
  paused: { label: "Paused", className: "bg-amber-100 text-amber-700 border-amber-200" },
};

const syncServiceConfig: Record<
  SyncService["status"],
  { label: string; className: string }
> = {
  connected: { label: "Connected", className: "bg-emerald-100 text-emerald-700 border-emerald-200" },
  syncing: { label: "Syncing", className: "bg-sky-100 text-sky-700 border-sky-200" },
  attention: { label: "Needs attention", className: "bg-amber-100 text-amber-700 border-amber-200" },
  disconnected: { label: "Not connected", className: "bg-slate-100 text-slate-600 border-slate-200" },
};

const formatRelativeTime = (iso: string | null) => {
  if (!iso) return "—";
  const value = new Date(iso);
  if (Number.isNaN(value.getTime())) return "—";
  const deltaMs = value.getTime() - Date.now();
  const absolute = Math.abs(deltaMs);

  const units: Array<{ ms: number; unit: Intl.RelativeTimeFormatUnit }> = [
    { ms: DAY_IN_MS, unit: "day" },
    { ms: 1000 * 60 * 60, unit: "hour" },
    { ms: 1000 * 60, unit: "minute" },
  ];

  const formatter = new Intl.RelativeTimeFormat(undefined, { numeric: "auto" });
  for (const { ms, unit } of units) {
    if (absolute >= ms || unit === "minute") {
      const valueInUnit = Math.round(deltaMs / ms);
      return formatter.format(valueInUnit, unit);
    }
  }
  return formatter.format(0, "minute");
};

export default function SellerListingsPage({ loaderData }: Route.ComponentProps) {
  const { listings, summary, channelHealth, syncServices } = loaderData as LoaderData;

  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [channelFilter, setChannelFilter] = useState<string>("all");
  const [search, setSearch] = useState<string>("");
  const [selected, setSelected] = useState<string[]>([]);

  const currency = useMemo(
    () =>
      new Intl.NumberFormat(undefined, {
        style: "currency",
        currency: "USD",
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }),
    []
  );
  const percent = useMemo(
    () =>
      new Intl.NumberFormat(undefined, {
        style: "percent",
        minimumFractionDigits: 0,
        maximumFractionDigits: 1,
      }),
    []
  );
  const number = useMemo(() => new Intl.NumberFormat(undefined, { maximumFractionDigits: 0 }), []);

  const searchValue = search.trim().toLowerCase();
  const channelOptions = useMemo(() => {
    const map = new Map<string, string>();
    for (const listing of listings) {
      map.set(listing.channelKey, listing.channelLabel);
    }
    return Array.from(map.entries());
  }, [listings]);

  const filteredListings = useMemo(() => {
    return listings.filter((listing) => {
      if (statusFilter !== "all" && listing.status !== statusFilter) return false;
      if (channelFilter !== "all" && listing.channelKey !== channelFilter) return false;
      if (!searchValue) return true;
      if (listing.label.toLowerCase().includes(searchValue)) return true;
      return listing.issues.some((issue) => issue.toLowerCase().includes(searchValue));
    });
  }, [listings, statusFilter, channelFilter, searchValue]);

  useEffect(() => {
    setSelected((previous) => previous.filter((id) => filteredListings.some((listing) => listing.id === id)));
  }, [filteredListings]);

  const toggleListing = (id: string) => {
    setSelected((previous) => (previous.includes(id) ? previous.filter((value) => value !== id) : [...previous, id]));
  };

  const allSelected = filteredListings.length > 0 && selected.length === filteredListings.length;
  const partiallySelected = selected.length > 0 && !allSelected;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Listings"
        description="Publish, withdraw, and monitor listing health across marketplaces."
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Card>
          <CardHeader className="pb-1">
            <CardDescription>Active listings</CardDescription>
            <CardTitle className="text-2xl">{number.format(summary.published + summary.pending)}</CardTitle>
          </CardHeader>
          <CardContent className="text-xs text-muted-foreground">
            {number.format(summary.total)} total · {number.format(summary.pending)} syncing
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-1">
            <CardDescription>Attention required</CardDescription>
            <CardTitle className="text-2xl text-amber-600">{number.format(summary.error + summary.flagged)}</CardTitle>
          </CardHeader>
          <CardContent className="text-xs text-muted-foreground">
            {number.format(summary.error)} sync errors · {number.format(summary.flagged)} compliance flags
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-1">
            <CardDescription>Withdrawn or paused</CardDescription>
            <CardTitle className="text-2xl text-slate-700">{number.format(summary.paused)}</CardTitle>
          </CardHeader>
          <CardContent className="text-xs text-muted-foreground">
            Listings without recent channel activity
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-1">
            <CardDescription>Repricing coverage</CardDescription>
            <CardTitle className="text-2xl text-emerald-600">{number.format(summary.repricing)}</CardTitle>
          </CardHeader>
          <CardContent className="text-xs text-muted-foreground">
            Automated rules managing price bands across channels
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-col gap-2 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <CardTitle>Listing synchronization services</CardTitle>
              <CardDescription>Publish status across connected marketplaces.</CardDescription>
            </div>
            <Button variant="outline" size="sm">
              <RefreshCw className="mr-2 h-4 w-4" />
              Refresh syncs
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            {syncServices.map((service) => {
              const status = syncServiceConfig[service.status];
              return (
                <div
                  key={service.id}
                  className="flex flex-col gap-2 rounded-lg border p-4 md:flex-row md:items-center md:justify-between"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{service.name}</span>
                      <Badge variant="outline" className={status.className}>
                        {status.label}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">{service.description}</p>
                    <p className="text-xs text-muted-foreground">
                      Last sync {formatRelativeTime(service.lastSync)}
                      {service.attentionCount
                        ? ` · ${service.attentionCount} issue${service.attentionCount === 1 ? "" : "s"}`
                        : ""}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="secondary" size="sm">
                      Force sync
                    </Button>
                    <Button variant="outline" size="sm">
                      Configure
                    </Button>
                  </div>
                </div>
              );
            })}
            <Button className="w-full" variant="outline">
              Connect new service
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Channel health</CardTitle>
            <CardDescription>Publishing status and outstanding sync issues.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {channelHealth.length ? (
              channelHealth.map((channel) => {
                const hasAttention = channel.error > 0 || channel.issueCount > 0;
                const status = hasAttention
                  ? syncServiceConfig.attention
                  : channel.pending > 0
                  ? syncServiceConfig.syncing
                  : syncServiceConfig.connected;
                return (
                  <div
                    key={channel.channel}
                    className={cn(
                      "rounded-lg border p-3 text-sm",
                      hasAttention ? "border-amber-300 bg-amber-50/60" : "border-muted"
                    )}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-medium">{channel.label}</p>
                        <p className="text-xs text-muted-foreground">
                          {channel.total} listings · last sync {formatRelativeTime(channel.lastSync)}
                        </p>
                      </div>
                      <Badge variant="outline" className={status.className}>
                        {status.label}
                      </Badge>
                    </div>
                    <div className="mt-2 grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                      <div>Published {channel.published}</div>
                      <div>Syncing {channel.pending}</div>
                      <div>Paused {channel.paused}</div>
                      <div className="text-rose-600">Errors {channel.error}</div>
                    </div>
                  </div>
                );
              })
            ) : (
              <p className="text-sm text-muted-foreground">No channel activity yet. Connect a listing feed to get started.</p>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Listings workspace</CardTitle>
          <CardDescription>Bulk publish, withdraw, and resolve channel-specific errors.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex w-full flex-col gap-3 sm:flex-row">
              <Input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search listings, SKUs, or issues…"
                className="sm:max-w-sm"
              />
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="sm:w-[160px]">
                  <SelectValue placeholder="Filter status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All statuses</SelectItem>
                  <SelectItem value="published">Published</SelectItem>
                  <SelectItem value="pending">Syncing</SelectItem>
                  <SelectItem value="error">Sync error</SelectItem>
                  <SelectItem value="paused">Paused</SelectItem>
                </SelectContent>
              </Select>
              <Select value={channelFilter} onValueChange={setChannelFilter}>
                <SelectTrigger className="sm:w-[160px]">
                  <SelectValue placeholder="Filter channel" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All channels</SelectItem>
                  {channelOptions.map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {selected.length ? (
              <div className="flex items-center gap-3 text-sm">
                <span className="text-muted-foreground">{selected.length} selected</span>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button size="sm" variant="outline">
                      Bulk actions
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem>Mark as published</DropdownMenuItem>
                    <DropdownMenuItem>Force channel sync</DropdownMenuItem>
                    <DropdownMenuItem>Withdraw listings</DropdownMenuItem>
                    <DropdownMenuItem>Mute compliance warnings</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ) : (
              <p className="text-xs text-muted-foreground">
                Search, filter, and select listings to trigger bulk publish, withdraw, or compliance workflows.
              </p>
            )}
          </div>

          <div className="overflow-hidden rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">
                    <Checkbox
                      checked={allSelected ? true : partiallySelected ? "indeterminate" : false}
                      onCheckedChange={(checked) =>
                        setSelected(
                          checked
                            ? filteredListings.map((listing) => listing.id)
                            : []
                        )
                      }
                      aria-label="Select all listings"
                    />
                  </TableHead>
                  <TableHead>Listing</TableHead>
                  <TableHead className="hidden lg:table-cell">Channel</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="hidden lg:table-cell">Pricing</TableHead>
                  <TableHead className="hidden xl:table-cell">Issues</TableHead>
                  <TableHead className="hidden xl:table-cell text-right">Last sync</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredListings.length ? (
                  filteredListings.map((listing) => {
                    const status = listingStatusConfig[listing.status];
                    const priceChangeLabel =
                      listing.priceChangePercent != null
                        ? `${listing.priceChangePercent > 0 ? "+" : ""}${percent.format(listing.priceChangePercent)}`
                        : null;
                    const priceChangeIcon =
                      listing.priceChange != null
                        ? listing.priceChange > 0
                          ? <ArrowUpRight className="h-3.5 w-3.5" />
                          : listing.priceChange < 0
                          ? <ArrowDownRight className="h-3.5 w-3.5" />
                          : null
                        : null;
                    const complianceIcon =
                      listing.flagged ? (
                        <ShieldAlert className="h-4 w-4 text-amber-600" />
                      ) : (
                        <ShieldCheck className="h-4 w-4 text-emerald-600" />
                      );

                    const issuesPreview = listing.issues.length
                      ? listing.issues.slice(0, 2).join(" · ")
                      : "—";

                    return (
                      <TableRow
                        key={listing.id}
                        className={cn(
                          "align-top",
                          listing.flagged ? "bg-amber-50/60 hover:bg-amber-50" : "hover:bg-muted/50"
                        )}
                      >
                        <TableCell>
                          <Checkbox
                            checked={selected.includes(listing.id)}
                            onCheckedChange={() => toggleListing(listing.id)}
                            aria-label={`Select ${listing.label}`}
                          />
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="font-medium">{listing.label}</span>
                              <Badge
                                variant="outline"
                                className={cn(
                                  "flex items-center gap-1 border-primary/20 text-primary",
                                  listing.flagged ? "text-amber-700" : "text-emerald-600"
                                )}
                              >
                                {complianceIcon}
                                <span>Compliance {listing.complianceScore}</span>
                              </Badge>
                            </div>
                            <p className="text-xs text-muted-foreground">
                              {listing.totalOrders} orders
                              {listing.pendingOrders ? ` · ${listing.pendingOrders} pending` : ""} · {listing.suggestedAction}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell className="hidden lg:table-cell">
                          <Badge variant="outline" className="bg-slate-100 text-slate-700 border-slate-200">
                            {listing.channelLabel}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className={status.className}>
                            {status.label}
                          </Badge>
                        </TableCell>
                        <TableCell className="hidden lg:table-cell">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span>{listing.price != null ? currency.format(listing.price) : "—"}</span>
                              {priceChangeLabel ? (
                                <span
                                  className={cn(
                                    "flex items-center gap-1 text-xs font-medium",
                                    listing.priceChange != null && listing.priceChange < 0
                                      ? "text-rose-600"
                                      : "text-emerald-600"
                                  )}
                                >
                                  {priceChangeIcon}
                                  {priceChangeLabel}
                                </span>
                              ) : (
                                <span className="text-xs text-muted-foreground">No change</span>
                              )}
                            </div>
                            {listing.repricingActive && listing.pricingRule ? (
                              <p className="text-xs text-muted-foreground">{listing.pricingRule}</p>
                            ) : (
                              <p className="text-xs text-muted-foreground">Price band stable</p>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="hidden xl:table-cell">
                          <p className="text-sm">{issuesPreview}</p>
                        </TableCell>
                        <TableCell className="hidden xl:table-cell text-right">
                          <span title={listing.lastSync ? new Date(listing.lastSync).toLocaleString() : undefined}>
                            {formatRelativeTime(listing.lastSync)}
                          </span>
                        </TableCell>
                      </TableRow>
                    );
                  })
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} className="py-12 text-center text-sm text-muted-foreground">
                      No listings matched the current filters. Adjust filters or connect a channel sync.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
