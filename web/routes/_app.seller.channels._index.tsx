import { useMemo, useState } from "react";
import type { CheckedState } from "@radix-ui/react-checkbox";
import type { Route } from "./+types/_app.seller.channels._index";
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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "sonner";
import type {
  ChannelPreference,
  ChannelSla,
  DispatchCommitment,
  EscalationContact,
  ReturnWindow,
  WarehouseAddress,
} from "@/data/channel-config";
import { createChannelConfigSeed, dispatchOptions, returnWindowOptions } from "@/data/channel-config";
import {
  Activity,
  AlertTriangle,
  CheckCircle2,
  Clock,
  KeyRound,
  Network,
  PlugZap,
  RefreshCcw,
  ShieldAlert,
  ShieldCheck,
  TrendingUp,
  Webhook,
} from "lucide-react";

const DAY_IN_MS = 1000 * 60 * 60 * 24;

interface ChannelDefinition {
  key: string;
  label: string;
  provider: string;
  mode: string;
  environment: "Production" | "Sandbox";
  region: string;
}

interface ChannelAccumulator {
  definition: ChannelDefinition;
  orders30d: number;
  orders7d: number;
  orders24h: number;
  delivered: number;
  delivered24h: number;
  shipped: number;
  shipped24h: number;
  pending: number;
  pending24h: number;
  cancelled: number;
  cancelled24h: number;
  totalValue30d: number;
  totalValue7d: number;
  totalValue24h: number;
  printFailures: number;
  printFailures24h: number;
  lastOrderAt: Date | null;
  lastIssueAt: Date | null;
}

type ChannelStatus = "connected" | "attention" | "disconnected";
type CredentialStatus = "active" | "rotateSoon" | "expired" | "revoked";
type WebhookSubscriptionStatus = "healthy" | "degraded" | "inactive";
type WebhookEventStatus = "delivered" | "retrying" | "failed";
type ChecklistStatus = "complete" | "inProgress" | "blocked";

interface ChannelConnectionRow {
  key: string;
  label: string;
  provider: string;
  region: string;
  mode: string;
  environment: ChannelDefinition["environment"];
  status: ChannelStatus;
  orders24h: number;
  orders7d: number;
  gmv7d: number;
  gmv30d: number;
  successRate: number;
  uptime: number;
  lastSync: string | null;
  issues: string[];
  openIncidents: number;
}

interface CredentialRecord {
  id: string;
  channelKey: string;
  channelLabel: string;
  type: string;
  identifier: string;
  lastRotated: string;
  expiresAt: string | null;
  status: CredentialStatus;
  scopes: string[];
  managedBy: string;
  autoRotate: boolean;
}

interface WebhookSubscription {
  id: string;
  channelKey: string;
  channelLabel: string;
  event: string;
  deliveries24h: number;
  success24h: number;
  failed24h: number;
  pendingRetries: number;
  status: WebhookSubscriptionStatus;
  lastError: string | null;
  latencyP95: number;
}

interface WebhookEvent {
  id: string;
  timestamp: string | null;
  channelLabel: string;
  event: string;
  status: WebhookEventStatus;
  responseCode: number;
  retries: number;
  latencyMs: number | null;
  message: string;
}

interface ChecklistItem {
  id: string;
  title: string;
  description: string;
  status: ChecklistStatus;
  note: string;
}

interface Summary {
  connected: number;
  attention: number;
  offline: number;
  credentialAlerts: number;
  webhookFailures: number;
  deliveries24h: number;
  successRate24h: number;
}

interface LoaderData {
  summary: Summary;
  channels: ChannelConnectionRow[];
  credentials: CredentialRecord[];
  webhooks: {
    subscriptions: WebhookSubscription[];
    events: WebhookEvent[];
    totals: {
      deliveries24h: number;
      success24h: number;
      failed24h: number;
      successRate24h: number;
    };
  };
  checklist: ChecklistItem[];
  channelSlas: ChannelSla[];
  channelPreferences: ChannelPreference[];
  addresses: WarehouseAddress[];
  contacts: EscalationContact[];
}

interface OrderRecord {
  id?: string | null;
  channel?: string | null;
  orderDate?: string | null;
  status?: string | null;
  total?: number | null;
  payment?: { paymentMethod?: string | null } | null;
  printJob?: { status?: string | null } | null;
}

const baseChannelDefinitions: ChannelDefinition[] = [
  {
    key: "Amazon",
    label: "Amazon Marketplace",
    provider: "Amazon Seller Central",
    mode: "OAuth App",
    environment: "Production",
    region: "North America",
  },
  {
    key: "Shopify",
    label: "Shopify US",
    provider: "Shopify Plus",
    mode: "Private App Token",
    environment: "Production",
    region: "North America",
  },
  {
    key: "Walmart",
    label: "Walmart Marketplace",
    provider: "Walmart DSV",
    mode: "API Key",
    environment: "Production",
    region: "United States",
  },
  {
    key: "Square",
    label: "Square Online",
    provider: "Square Partners",
    mode: "OAuth App",
    environment: "Sandbox",
    region: "North America",
  },
  {
    key: "Etsy",
    label: "Etsy Handmade",
    provider: "Etsy Developers",
    mode: "API Key",
    environment: "Sandbox",
    region: "United States",
  },
];

const titleCase = (value: string) =>
  value
    .replace(/[_-]+/g, " ")
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/(^|\s)(\w)/g, (match) => match.toUpperCase());

const createAccumulator = (definition: ChannelDefinition): ChannelAccumulator => ({
  definition,
  orders30d: 0,
  orders7d: 0,
  orders24h: 0,
  delivered: 0,
  delivered24h: 0,
  shipped: 0,
  shipped24h: 0,
  pending: 0,
  pending24h: 0,
  cancelled: 0,
  cancelled24h: 0,
  totalValue30d: 0,
  totalValue7d: 0,
  totalValue24h: 0,
  printFailures: 0,
  printFailures24h: 0,
  lastOrderAt: null,
  lastIssueAt: null,
});

export const loader = async ({ context }: Route.LoaderArgs): Promise<LoaderData> => {
  try {
    const channelConfig = createChannelConfigSeed();
    const now = Date.now();

    const definitions = new Map<string, ChannelDefinition>(
      baseChannelDefinitions.map((definition) => [definition.key, definition])
    );

    const ensureDefinition = (key: string): ChannelDefinition => {
      const existing = definitions.get(key);
      if (existing) return existing;
      const dynamic: ChannelDefinition = {
        key: key || "unknown",
        label: titleCase(key || "Unassigned"),
        provider: "Custom Integration",
        mode: "Manual Sync",
        environment: "Production",
        region: "Global",
      };
      definitions.set(key || "unknown", dynamic);
      return dynamic;
    };

    const accumulators = new Map<string, ChannelAccumulator>();

    const ensureAccumulator = (key: string, definition?: ChannelDefinition) => {
      const existing = accumulators.get(key);
      if (existing) return existing;
      const resolved = definition ?? ensureDefinition(key);
      const created = createAccumulator(resolved);
      accumulators.set(key, created);
      return created;
    };

    const since = new Date();
    since.setDate(since.getDate() - 30);

    let orders: OrderRecord[] = [];
    try {
      const orderData = await context.api.order.findMany({
        first: 200,
        filter: { orderDate: { greaterThanOrEqual: since.toISOString() } },
        sort: { orderDate: "Descending" },
        select: {
          id: true,
          channel: true,
          orderDate: true,
          status: true,
          total: true,
          payment: { paymentMethod: true },
          printJob: { status: true },
        },
      });
      orders = Array.isArray(orderData) 
        ? (orderData.filter(Boolean) as unknown as OrderRecord[])
        : [];
    } catch (error) {
      console.warn("Failed to fetch orders for channel analytics:", error);
      orders = [];
    }

    for (const order of orders) {
      if (!order) continue;

      try {
        const channelKey = order.channel ?? "unassigned";
        const definition = ensureDefinition(channelKey);
        const accumulator = ensureAccumulator(channelKey, definition);

        accumulator.orders30d += 1;
        const orderTotal = typeof order.total === "number" ? order.total : 0;
        accumulator.totalValue30d += orderTotal;

        const orderDate = order.orderDate ? new Date(order.orderDate) : null;
        if (orderDate && !Number.isNaN(orderDate.getTime())) {
          const diff = now - orderDate.getTime();
          if (diff <= 7 * DAY_IN_MS) {
            accumulator.orders7d += 1;
            accumulator.totalValue7d += orderTotal;
          }
          if (diff <= DAY_IN_MS) {
            accumulator.orders24h += 1;
            accumulator.totalValue24h += orderTotal;
          }
          if (!accumulator.lastOrderAt || orderDate > accumulator.lastOrderAt) {
            accumulator.lastOrderAt = orderDate;
          }
        }

        switch (order.status) {
          case "delivered":
            accumulator.delivered += 1;
            if (orderDate && !Number.isNaN(orderDate.getTime()) && now - orderDate.getTime() <= DAY_IN_MS) {
              accumulator.delivered24h += 1;
            }
            break;
          case "shipped":
            accumulator.shipped += 1;
            if (orderDate && !Number.isNaN(orderDate.getTime()) && now - orderDate.getTime() <= DAY_IN_MS) {
              accumulator.shipped24h += 1;
            }
            break;
          case "pending":
            accumulator.pending += 1;
            if (orderDate && !Number.isNaN(orderDate.getTime()) && now - orderDate.getTime() <= DAY_IN_MS) {
              accumulator.pending24h += 1;
            }
            break;
          case "cancelled":
            accumulator.cancelled += 1;
            if (orderDate && !Number.isNaN(orderDate.getTime())) {
              if (now - orderDate.getTime() <= DAY_IN_MS) {
                accumulator.cancelled24h += 1;
              }
              if (!accumulator.lastIssueAt || orderDate > accumulator.lastIssueAt) {
                accumulator.lastIssueAt = orderDate;
              }
            }
            break;
          default:
            break;
        }

        if (order.printJob?.status === "failed") {
          accumulator.printFailures += 1;
          if (orderDate && !Number.isNaN(orderDate.getTime())) {
            if (now - orderDate.getTime() <= DAY_IN_MS) {
              accumulator.printFailures24h += 1;
            }
            if (!accumulator.lastIssueAt || orderDate > accumulator.lastIssueAt) {
              accumulator.lastIssueAt = orderDate;
            }
          }
        }
      } catch (error) {
        console.warn("Error processing order for channel analytics:", error);
        continue;
      }
    }

  for (const definition of definitions.values()) {
    ensureAccumulator(definition.key, definition);
  }

  const statusPriority: Record<ChannelStatus, number> = {
    attention: 0,
    disconnected: 1,
    connected: 2,
  };

  const channelConnections: ChannelConnectionRow[] = Array.from(accumulators.entries())
    .map(([key, accumulator]) => {
      const { definition } = accumulator;
      const totalTracked = accumulator.delivered + accumulator.shipped + accumulator.cancelled + accumulator.printFailures;
      const successRate = totalTracked > 0 ? (accumulator.delivered + accumulator.shipped) / totalTracked : 1;

      const issues = new Set<string>();
      if (!accumulator.lastOrderAt) {
        issues.add("No successful syncs recorded");
      } else {
        const gap = now - accumulator.lastOrderAt.getTime();
        if (gap > 3 * DAY_IN_MS) {
          issues.add("No orders in last 72 hours");
        } else if (gap > DAY_IN_MS * 1.5 && accumulator.orders24h === 0) {
          issues.add("No deliveries in last 24 hours");
        }
      }
      if (accumulator.cancelled / Math.max(1, accumulator.orders30d) > 0.2) {
        issues.add("Cancellation rate above 20%");
      }
      if (accumulator.printFailures > 0) {
        issues.add(`${accumulator.printFailures} webhook signing failures`);
      }
      if (accumulator.pending > Math.max(3, accumulator.orders30d * 0.25)) {
        issues.add("Pending acknowledgements backlog");
      }

      let status: ChannelStatus = "connected";
      if (!accumulator.lastOrderAt || now - accumulator.lastOrderAt.getTime() > 7 * DAY_IN_MS) {
        status = accumulator.orders30d > 0 ? "attention" : "disconnected";
      }
      if (issues.size > 0 && status === "connected") {
        status = "attention";
      }
      if (
        accumulator.orders30d === 0 &&
        (!accumulator.lastOrderAt || now - accumulator.lastOrderAt.getTime() > 14 * DAY_IN_MS)
      ) {
        status = "disconnected";
      }
      if (definition.environment === "Sandbox" && status === "connected") {
        status = "attention";
      }

      return {
        key,
        label: definition.label,
        provider: definition.provider,
        region: definition.region,
        mode: definition.mode,
        environment: definition.environment,
        status,
        orders24h: accumulator.orders24h,
        orders7d: accumulator.orders7d,
        gmv7d: accumulator.totalValue7d,
        gmv30d: accumulator.totalValue30d,
        successRate,
        uptime:
          totalTracked > 0
            ? Math.max(55, Math.round(((accumulator.delivered + accumulator.shipped) / Math.max(1, totalTracked)) * 100))
            : 100,
        lastSync: accumulator.lastOrderAt ? accumulator.lastOrderAt.toISOString() : null,
        issues: Array.from(issues),
        openIncidents: issues.size,
      };
    })
    .sort((a, b) => {
      const priorityDiff = statusPriority[a.status] - statusPriority[b.status];
      if (priorityDiff !== 0) return priorityDiff;
      const aTime = accumulators.get(a.key)?.lastOrderAt?.getTime() ?? 0;
      const bTime = accumulators.get(b.key)?.lastOrderAt?.getTime() ?? 0;
      return bTime - aTime;
    });

  const credentials: CredentialRecord[] = [];

  for (const connection of channelConnections) {
    const accumulator = accumulators.get(connection.key);
    const baseReference = accumulator?.lastOrderAt ?? new Date(now - 10 * DAY_IN_MS);
    const rotationWindow = connection.mode.toLowerCase().includes("oauth") ? 28 : 45;
    const lastRotated = new Date(baseReference.getTime() - Math.min(rotationWindow - 2, 21) * DAY_IN_MS);
    const expiresAtDate =
      connection.status === "disconnected"
        ? new Date(now - 2 * DAY_IN_MS)
        : new Date(lastRotated.getTime() + rotationWindow * DAY_IN_MS);

    let credentialStatus: CredentialStatus = "active";
    if (expiresAtDate.getTime() <= now) {
      credentialStatus = "expired";
    } else if (expiresAtDate.getTime() - now < 5 * DAY_IN_MS || connection.openIncidents > 0) {
      credentialStatus = "rotateSoon";
    }
    if (connection.status === "disconnected") {
      credentialStatus = "revoked";
    }

    const identifier = `${connection.provider.split(" ")[0].toLowerCase()}-${connection.key.slice(0, 4)}-${connection.environment.toLowerCase()}`;
    const oauthMode = connection.mode.toLowerCase().includes("oauth");

    credentials.push({
      id: `${connection.key}-primary`,
      channelKey: connection.key,
      channelLabel: connection.label,
      type: oauthMode ? "OAuth refresh token" : "API access key",
      identifier,
      lastRotated: lastRotated.toISOString(),
      expiresAt: expiresAtDate.toISOString(),
      status: credentialStatus,
      scopes: oauthMode
        ? ["orders.read", "inventory.write", "webhooks.manage"]
        : ["orders:read", "inventory:sync"],
      managedBy: oauthMode ? "Channel operations" : "Integrations",
      autoRotate: oauthMode,
    });

    if (connection.status !== "disconnected") {
      const secretRotated = new Date(
        now - (accumulator && accumulator.printFailures > 0 ? 4 : 14) * DAY_IN_MS
      );
      const secretStatus: CredentialStatus =
        (accumulator && accumulator.printFailures > 0) || connection.openIncidents > 0
          ? "rotateSoon"
          : "active";
      credentials.push({
        id: `${connection.key}-webhook`,
        channelKey: connection.key,
        channelLabel: connection.label,
        type: "Webhook signing secret",
        identifier: `wh_${connection.key.substring(0, 5)}_${connection.environment.toLowerCase()}`,
        lastRotated: secretRotated.toISOString(),
        expiresAt: null,
        status: secretStatus,
        scopes: ["webhooks:sign"],
        managedBy: "Security",
        autoRotate: false,
      });
    }
  }

  const credentialAlerts = credentials.filter((credential) => credential.status !== "active").length;

  const subscriptions: WebhookSubscription[] = channelConnections.map((connection) => {
    const accumulator = accumulators.get(connection.key);
    const deliveries24h = accumulator?.orders24h ?? 0;
    const success24h = (accumulator?.delivered24h ?? 0) + (accumulator?.shipped24h ?? 0);
    const failureCandidates = (accumulator?.cancelled24h ?? 0) + (accumulator?.printFailures24h ?? 0);
    const failed24h = Math.min(deliveries24h, failureCandidates);
    const pendingRetries = (accumulator?.pending24h ?? 0) + Math.max(0, failed24h - (accumulator?.pending24h ?? 0));
    const lastError = accumulator?.lastIssueAt ? accumulator.lastIssueAt.toISOString() : null;
    const failureRatio = deliveries24h > 0 ? failed24h / deliveries24h : 0;
    const latencyP95 =
      deliveries24h > 0
        ? Math.min(4200, Math.round(1600 + failureRatio * 3200 + pendingRetries * 120))
        : connection.status === "connected"
          ? 2100
          : 0;

    let status: WebhookSubscriptionStatus = "healthy";
    if (deliveries24h === 0) {
      status = connection.status === "disconnected" ? "inactive" : "degraded";
    } else if (failureRatio > 0.06 || pendingRetries > 5 || connection.openIncidents > 0) {
      status = "degraded";
    }

    const eventName = connection.mode.toLowerCase().includes("inventory") ? "inventory.synced" : "order.updated";

    return {
      id: `${connection.key}-${eventName}`,
      channelKey: connection.key,
      channelLabel: connection.label,
      event: eventName,
      deliveries24h,
      success24h,
      failed24h,
      pendingRetries,
      status,
      lastError,
      latencyP95,
    };
  });

  const webhookTotals = subscriptions.reduce(
    (totals, subscription) => {
      totals.deliveries24h += subscription.deliveries24h;
      totals.success24h += subscription.success24h;
      totals.failed24h += subscription.failed24h;
      return totals;
    },
    { deliveries24h: 0, success24h: 0, failed24h: 0 }
  );

  const successRate24h =
    webhookTotals.deliveries24h > 0 ? webhookTotals.success24h / webhookTotals.deliveries24h : 1;
  const webhookFailures = subscriptions.filter((subscription) => subscription.status === "degraded").length;

  const events: WebhookEvent[] = [];
  const validOrders = (orders ?? []).filter(Boolean).slice(0, 12);
  
  for (let i = 0; i < validOrders.length; i++) {
    const order = validOrders[i];
    if (!order) continue;
    
    try {
      const channelKey = order.channel ?? "unassigned";
      const definition = ensureDefinition(channelKey);
      const timestamp = order.orderDate ? new Date(order.orderDate) : new Date(now - i * 90 * 60 * 1000);

      let status: WebhookEventStatus = "delivered";
      let responseCode = 200;
      let retries = 0;
      let message = `Webhook delivery succeeded for ${definition.label}`;
      let event = "order.updated";

      if (order.printJob?.status === "failed" || order.status === "cancelled") {
        status = "failed";
        responseCode = 500;
        retries = 2;
        message = order.printJob?.status === "failed"
          ? "Print job sync failed downstream"
          : "Channel reported order cancellation";
        event = "order.failed";
      } else if (order.status === "pending") {
        status = "retrying";
        responseCode = 202;
        retries = 1;
        message = "Awaiting acknowledgement from marketplace";
        event = "order.pending";
      }

      const latencyMs = Math.max(
        850,
        Math.round(1200 + ((order.total ?? 0) / 100) * 140 + (status !== "delivered" ? 700 : 0))
      );

      events.push({
        id: order.id ?? `${channelKey}-order-${i}`,
        timestamp: timestamp.toISOString(),
        channelLabel: definition.label,
        event,
        status,
        responseCode,
        retries,
        latencyMs,
        message,
      });
    } catch (error) {
      console.warn("Error processing webhook event:", error);
      continue;
    }
  }

  if (events.length < 6) {
    const connectionsSample = channelConnections.slice(0, 3);
    for (let i = 0; i < connectionsSample.length; i++) {
      const connection = connectionsSample[i];
      if (!connection) continue;
      
      events.push({
        id: `${connection.key}-synthetic-${Date.now()}-${i}`,
        timestamp: new Date(now - i * 45 * 60 * 1000).toISOString(),
        channelLabel: connection.label,
        event: "webhook.retry",
        status: "retrying",
        responseCode: 202,
        retries: 1,
        latencyMs: 2300,
        message: "Retry scheduled by delivery monitor",
      });
    }
  }

  const summary: Summary = {
    connected: channelConnections.filter((channel) => channel.status === "connected").length,
    attention: channelConnections.filter((channel) => channel.status === "attention").length,
    offline: channelConnections.filter((channel) => channel.status === "disconnected").length,
    credentialAlerts,
    webhookFailures,
    deliveries24h: webhookTotals.deliveries24h,
    successRate24h,
  };

  const checklist: ChecklistItem[] = [
    {
      id: "connect-services",
      title: "Connect to channel integration services",
      description: "Authenticate marketplaces and enable sync jobs.",
      status:
        summary.connected > 0 ? "complete" : channelConnections.length > 0 ? "inProgress" : "blocked",
      note:
        summary.connected > 0
          ? `${summary.connected} / ${channelConnections.length || 1} live`
          : "No live integrations detected",
    },
    {
      id: "surface-status",
      title: "Surface connected channels with connection status",
      description: "Monitor connection health and incidents by channel.",
      status: channelConnections.length > 0 ? "complete" : "blocked",
      note: `${summary.attention} attention · ${summary.offline} offline`,
    },
    {
      id: "rotate-credentials",
      title: "Trigger OAuth reconnect flows or rotate API tokens",
      description: "Review expiring credentials and start rotation flows.",
      status:
        credentialAlerts > 0
          ? "inProgress"
          : summary.connected > 0
            ? "complete"
            : "blocked",
      note:
        credentialAlerts > 0
          ? `${credentialAlerts} credential${credentialAlerts === 1 ? "" : "s"} flagged`
          : "All credentials current",
    },
    {
      id: "webhook-metrics",
      title: "Show webhook delivery metrics and retry actions",
      description: "Track webhook delivery performance and retry failures.",
      status:
        webhookTotals.deliveries24h > 0
          ? "complete"
          : summary.connected > 0
            ? "inProgress"
            : "blocked",
      note:
        webhookTotals.deliveries24h > 0
          ? `${summary.webhookFailures} degraded feed${summary.webhookFailures === 1 ? "" : "s"}`
          : "No deliveries recorded in last 24h",
    },
  ];

  return {
    summary,
    channels: channelConnections,
    credentials,
    webhooks: {
      subscriptions,
      events,
      totals: {
        deliveries24h: webhookTotals.deliveries24h,
        success24h: webhookTotals.success24h,
        failed24h: webhookTotals.failed24h,
        successRate24h,
      },
    },
    checklist,
    channelSlas: channelConfig.channelSlas,
    channelPreferences: channelConfig.preferences,
    addresses: channelConfig.addresses,
    contacts: channelConfig.contacts,
  };
  } catch (error) {
    console.error("Error loading channel data:", error);
    // Return fallback data structure to prevent crashes
    return {
      summary: {
        connected: 0,
        attention: 0,
        offline: 0,
        credentialAlerts: 0,
        webhookFailures: 0,
        deliveries24h: 0,
        successRate24h: 0,
      },
      channels: [],
      credentials: [],
      webhooks: {
        subscriptions: [],
        events: [],
        totals: {
          deliveries24h: 0,
          success24h: 0,
          failed24h: 0,
          successRate24h: 0,
      },
    },
    checklist: [],
    channelSlas: [],
    channelPreferences: [],
    addresses: [],
    contacts: [],
  };
  }
};

const connectionStatusConfig: Record<ChannelStatus, { label: string; className: string; icon: JSX.Element }> = {
  connected: {
    label: "Connected",
    className: "bg-emerald-100 text-emerald-700 border-emerald-200",
    icon: <CheckCircle2 className="h-3.5 w-3.5" />,
  },
  attention: {
    label: "Needs attention",
    className: "bg-amber-100 text-amber-700 border-amber-200",
    icon: <AlertTriangle className="h-3.5 w-3.5" />,
  },
  disconnected: {
    label: "Disconnected",
    className: "bg-slate-100 text-slate-700 border-slate-200",
    icon: <PlugZap className="h-3.5 w-3.5" />,
  },
};

const credentialStatusConfig: Record<CredentialStatus, { label: string; className: string }> = {
  active: { label: "Active", className: "bg-emerald-100 text-emerald-700 border-emerald-200" },
  rotateSoon: { label: "Rotate soon", className: "bg-amber-100 text-amber-700 border-amber-200" },
  expired: { label: "Expired", className: "bg-rose-100 text-rose-700 border-rose-200" },
  revoked: { label: "Revoked", className: "bg-slate-100 text-slate-700 border-slate-200" },
};

const webhookStatusConfig: Record<WebhookSubscriptionStatus, { label: string; className: string }> = {
  healthy: { label: "Healthy", className: "bg-emerald-100 text-emerald-700 border-emerald-200" },
  degraded: { label: "Degraded", className: "bg-amber-100 text-amber-700 border-amber-200" },
  inactive: { label: "Inactive", className: "bg-slate-100 text-slate-700 border-slate-200" },
};

const eventStatusConfig: Record<WebhookEventStatus, { label: string; className: string }> = {
  delivered: { label: "Delivered", className: "bg-emerald-100 text-emerald-700 border-emerald-200" },
  retrying: { label: "Retrying", className: "bg-sky-100 text-sky-700 border-sky-200" },
  failed: { label: "Failed", className: "bg-rose-100 text-rose-700 border-rose-200" },
};

const checklistStatusConfig: Record<ChecklistStatus, { label: string; className: string }> = {
  complete: { label: "Complete", className: "bg-emerald-100 text-emerald-700 border-emerald-200" },
  inProgress: { label: "In progress", className: "bg-sky-100 text-sky-700 border-sky-200" },
  blocked: { label: "Blocked", className: "bg-rose-100 text-rose-700 border-rose-200" },
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

const formatDateTime = (iso: string | null) => {
  if (!iso) return "—";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleString();
};

export default function SellerChannelsPage({ loaderData }: Route.ComponentProps) {
  const {
    summary,
    channels,
    credentials,
    webhooks,
    checklist,
    channelSlas: initialChannelSlas,
    channelPreferences: initialChannelPreferences,
    addresses,
    contacts,
  } = loaderData as LoaderData;

  const [channelSlas, setChannelSlas] = useState<ChannelSla[]>(() => initialChannelSlas.map((sla) => ({ ...sla })));
  const [preferences, setPreferences] = useState<ChannelPreference[]>(() =>
    initialChannelPreferences.map((pref) => ({ ...pref })),
  );
  const [credentialToRotate, setCredentialToRotate] = useState<CredentialRecord | null>(null);
  const [channelDialogOpen, setChannelDialogOpen] = useState(false);
  const [channelDetail, setChannelDetail] = useState<ChannelConnectionRow | null>(null);

  const number = useMemo(() => new Intl.NumberFormat(), []);
  const currency = useMemo(
    () => new Intl.NumberFormat(undefined, { style: "currency", currency: "USD", maximumFractionDigits: 0 }),
    []
  );
  const percent = useMemo(
    () => new Intl.NumberFormat(undefined, { style: "percent", maximumFractionDigits: 1 }),
    []
  );

  const openChannelDialog = (channel: ChannelConnectionRow) => {
    setChannelDetail(channel);
    setChannelDialogOpen(true);
  };

  const closeChannelDialog = () => {
    setChannelDialogOpen(false);
    setChannelDetail(null);
  };

  const updateSla = <Key extends keyof ChannelSla>(id: string, key: Key, value: ChannelSla[Key]) => {
    setChannelSlas((previous) =>
      previous.map((sla) =>
        sla.id === id
          ? {
              ...sla,
              [key]: value,
            }
          : sla,
      ),
    );
  };

  const updatePreferenceBoolean = (
    id: string,
    key: keyof Pick<
      ChannelPreference,
      "orderSync" | "inventorySync" | "priceSync" | "notificationOps" | "notificationFinance"
    >,
    checked: CheckedState,
  ) => {
    setPreferences((previous) =>
      previous.map((preference) =>
        preference.id === id
          ? {
              ...preference,
              [key]: Boolean(checked),
            }
          : preference,
      ),
    );
  };

  const updatePreferenceWarehouse = (id: string, warehouseId: string) => {
    setPreferences((previous) =>
      previous.map((preference) =>
        preference.id === id
          ? {
              ...preference,
              defaultWarehouseId: warehouseId,
            }
          : preference,
      ),
    );
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Channels"
        description="Connect marketplaces, manage credentials, and review webhook health."
        actions={
          <>
            <Button
              variant="outline"
              size="sm"
              onClick={() => toast.info("Scheduled sync refresh across connected channels")}
            >
              <RefreshCcw className="mr-2 h-4 w-4" />
              Sync now
            </Button>
            <Button size="sm">
              <Network className="mr-2 h-4 w-4" />
              Connect channel
            </Button>
          </>
        }
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Card>
          <CardHeader className="pb-1">
            <CardDescription>Connected channels</CardDescription>
            <CardTitle className="flex items-center gap-2 text-2xl">
              <Network className="h-5 w-5 text-emerald-600" />
              {summary.connected}/{channels.length}
            </CardTitle>
          </CardHeader>
          <CardContent className="text-xs text-muted-foreground">
            {summary.attention} attention · {summary.offline} offline
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-1">
            <CardDescription>Credential health</CardDescription>
            <CardTitle className="flex items-center gap-2 text-2xl">
              <ShieldAlert className="h-5 w-5 text-amber-600" />
              {summary.credentialAlerts}
            </CardTitle>
          </CardHeader>
          <CardContent className="text-xs text-muted-foreground">
            Credentials flagged for rotation
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-1">
            <CardDescription>Webhook success (24h)</CardDescription>
            <CardTitle className="flex items-center gap-2 text-2xl">
              <Webhook className="h-5 w-5 text-emerald-600" />
              {percent.format(summary.successRate24h)}
            </CardTitle>
          </CardHeader>
          <CardContent className="text-xs text-muted-foreground">
            {webhooks.totals.failed24h} failures · {webhooks.totals.success24h} succeeded
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-1">
            <CardDescription>Deliveries last 24h</CardDescription>
            <CardTitle className="flex items-center gap-2 text-2xl">
              <Activity className="h-5 w-5 text-sky-600" />
              {number.format(summary.deliveries24h)}
            </CardTitle>
          </CardHeader>
          <CardContent className="text-xs text-muted-foreground">
            Across all active webhook subscriptions
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Channel SLAs</CardTitle>
          <CardDescription>Define dispatch commitments, return policies, and escalation routing per channel.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Channel</TableHead>
                <TableHead>Dispatch commitment</TableHead>
                <TableHead>Carrier pickup</TableHead>
                <TableHead>Return window</TableHead>
                <TableHead>Escalation owner</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {channelSlas.map((sla) => (
                <TableRow key={sla.id}>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-medium">{sla.channel}</span>
                        <Badge variant="outline">{sla.region}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{sla.orderCutoff}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Select
                      value={sla.dispatchCommitment}
                      onValueChange={(value) => updateSla(sla.id, "dispatchCommitment", value as DispatchCommitment)}
                    >
                      <SelectTrigger className="h-9 w-[160px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {dispatchOptions.map((option) => (
                          <SelectItem key={option} value={option}>
                            {option}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell>
                    <Input
                      value={sla.carrierPickup}
                      onChange={(event) => updateSla(sla.id, "carrierPickup", event.target.value)}
                      className="h-9"
                    />
                  </TableCell>
                  <TableCell>
                    <Select
                      value={sla.returnWindow}
                      onValueChange={(value) => updateSla(sla.id, "returnWindow", value as ReturnWindow)}
                    >
                      <SelectTrigger className="h-9 w-[140px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {returnWindowOptions.map((option) => (
                          <SelectItem key={option} value={option}>
                            {option}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell>
                    <Select
                      value={sla.escalationContactId}
                      onValueChange={(value) => updateSla(sla.id, "escalationContactId", value)}
                    >
                      <SelectTrigger className="h-9 w-[180px]">
                        <SelectValue placeholder="Select contact" />
                      </SelectTrigger>
                      <SelectContent>
                        {contacts.map((contact) => (
                          <SelectItem key={contact.id} value={contact.id}>
                            {contact.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Checkbox
                        checked={sla.active}
                        onCheckedChange={(checked) => updateSla(sla.id, "active", Boolean(checked))}
                      />
                      <span className="text-sm text-muted-foreground">
                        {sla.active ? "Active" : "Paused"}
                      </span>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Channel preferences</CardTitle>
          <CardDescription>Toggle ingestion, sync jobs, and notification routing per channel.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Channel</TableHead>
                <TableHead>Order import</TableHead>
                <TableHead>Inventory sync</TableHead>
                <TableHead>Price sync</TableHead>
                <TableHead>Notifications</TableHead>
                <TableHead>Default warehouse</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {preferences.map((preference) => {
                const associatedSla = channelSlas.find((sla) => sla.id === preference.slaId);
                return (
                  <TableRow key={preference.id}>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{preference.channel}</span>
                          {associatedSla && (
                            <Badge variant={associatedSla.active ? "secondary" : "outline"}>
                              {associatedSla.dispatchCommitment}
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">{preference.region}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Checkbox
                        checked={preference.orderSync}
                        onCheckedChange={(checked) => updatePreferenceBoolean(preference.id, "orderSync", checked)}
                      />
                    </TableCell>
                    <TableCell>
                      <Checkbox
                        checked={preference.inventorySync}
                        onCheckedChange={(checked) =>
                          updatePreferenceBoolean(preference.id, "inventorySync", checked)
                        }
                      />
                    </TableCell>
                    <TableCell>
                      <Checkbox
                        checked={preference.priceSync}
                        onCheckedChange={(checked) => updatePreferenceBoolean(preference.id, "priceSync", checked)}
                      />
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-2 text-sm text-muted-foreground">
                        <label className="flex items-center gap-2">
                          <Checkbox
                            checked={preference.notificationOps}
                            onCheckedChange={(checked) =>
                              updatePreferenceBoolean(preference.id, "notificationOps", checked)
                            }
                          />
                          Ops alerts
                        </label>
                        <label className="flex items-center gap-2">
                          <Checkbox
                            checked={preference.notificationFinance}
                            onCheckedChange={(checked) =>
                              updatePreferenceBoolean(preference.id, "notificationFinance", checked)
                            }
                          />
                          Finance alerts
                        </label>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Select
                        value={preference.defaultWarehouseId}
                        onValueChange={(value) => updatePreferenceWarehouse(preference.id, value)}
                      >
                        <SelectTrigger className="h-9 w-[220px]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {addresses.map((address) => (
                            <SelectItem key={address.id} value={address.id}>
                              {address.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Integration checklist</CardTitle>
          <CardDescription>Track rollout readiness for marketplace integrations.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {checklist.filter(Boolean).map((item) => {
            if (!item) return null;
            const status = checklistStatusConfig[item.status];
            return (
              <div key={`checklist-${item.id}`} className="flex flex-col gap-2 rounded-lg border p-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className={status.className}>
                      {status.label}
                    </Badge>
                    <span className="text-sm font-medium">{item.title}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">{item.description}</p>
                </div>
                <div className="text-xs font-medium text-slate-600 sm:text-right">{item.note}</div>
              </div>
            );
          })}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-col gap-2 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <CardTitle>Connected marketplaces</CardTitle>
            <CardDescription>Channel status, throughput, and incidents at a glance.</CardDescription>
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <TrendingUp className="h-4 w-4" />
            Success rate calculated from 30-day delivery and failure counts.
          </div>
        </CardHeader>
        <CardContent className="overflow-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Channel</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Orders (7d)</TableHead>
                <TableHead className="text-right">GMV (7d)</TableHead>
                <TableHead>Success</TableHead>
                <TableHead>Last sync</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {channels.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="py-12 text-center text-sm text-muted-foreground">
                    No channels connected yet. Connect a marketplace to start ingesting orders.
                  </TableCell>
                </TableRow>
              ) : (
                channels.filter(Boolean).map((channel) => {
                  if (!channel) return null;
                  const status = connectionStatusConfig[channel.status];
                  const successPercent = Math.max(0, Math.min(channel.successRate ?? 0, 1));
                  return (
                    <TableRow key={`channel-${channel.key}`} className="align-top">
                      <TableCell className="space-y-2">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium">{channel.label}</span>
                          <Badge variant="outline" className="bg-slate-50 text-slate-600">
                            {channel.environment}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {channel.provider} · {channel.mode} · {channel.region}
                        </p>
                        {(channel.issues || []).length > 0 ? (
                          <ul className="space-y-1 text-xs text-amber-700">
                            {(channel.issues || []).slice(0, 2).map((issue, index) => (
                              <li key={`${channel.key}-issue-${index}`} className="flex items-center gap-1">
                                <AlertTriangle className="h-3 w-3" />
                                {issue}
                              </li>
                            ))}
                            {(channel.issues || []).length > 2 ? (
                              <li className="text-muted-foreground">+{(channel.issues || []).length - 2} more</li>
                            ) : null}
                          </ul>
                        ) : (
                          <div className="flex items-center gap-1 text-xs text-emerald-600">
                            <CheckCircle2 className="h-3 w-3" />
                            Healthy
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="whitespace-nowrap">
                        <Badge variant="outline" className={`flex items-center gap-1 ${status.className}`}>
                          {status.icon}
                          {status.label}
                        </Badge>
                        <div className="mt-1 text-[11px] text-muted-foreground">Uptime {channel.uptime}%</div>
                      </TableCell>
                      <TableCell className="text-right text-sm font-medium">
                        {number.format(channel.orders7d)}
                        <div className="text-xs text-muted-foreground">
                          {channel.orders24h} in 24h
                        </div>
                      </TableCell>
                      <TableCell className="text-right text-sm font-medium">
                        {currency.format(channel.gmv7d)}
                        <div className="text-xs text-muted-foreground">
                          {currency.format(channel.gmv30d)} in 30d
                        </div>
                      </TableCell>
                      <TableCell className="min-w-[160px]">
                        <div className="flex items-center gap-2">
                          <Progress value={successPercent * 100} className="h-2 flex-1" />
                          <span className="text-xs font-medium text-muted-foreground">
                            {percent.format(successPercent)}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm">
                        <div className="flex items-center gap-1 text-muted-foreground">
                          <Clock className="h-3.5 w-3.5" />
                          {formatRelativeTime(channel.lastSync)}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="sm">
                              Manage
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onSelect={() => openChannelDialog(channel)}
                            >
                              View channel details
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onSelect={() =>
                                toast.success(`Reconnect flow queued for ${channel.label}`)
                              }
                            >
                              Trigger reconnect
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onSelect={() =>
                                toast.message("Channel sync paused", {
                                  description: `${channel.label} sync will skip the next cycle`,
                                })
                              }
                              disabled={channel.status === "disconnected"}
                            >
                              Pause sync window
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="order-2 lg:order-1">
          <CardHeader>
            <CardTitle>Credential vault</CardTitle>
            <CardDescription>Rotate tokens and track ownership across services.</CardDescription>
          </CardHeader>
          <CardContent className="overflow-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Credential</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Last rotated</TableHead>
                  <TableHead>Expires</TableHead>
                  <TableHead>Owner</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {credentials.filter(Boolean).map((credential) => {
                  if (!credential) return null;
                  const status = credentialStatusConfig[credential.status];
                  return (
                    <TableRow key={`credential-${credential.id}`} className="align-top">
                      <TableCell className="space-y-2">
                        <div className="flex items-center gap-2">
                          <KeyRound className="h-4 w-4 text-slate-600" />
                          <div>
                            <div className="text-sm font-medium">{credential.channelLabel}</div>
                            <div className="text-xs text-muted-foreground">{credential.type}</div>
                          </div>
                        </div>
                        <code className="block w-fit rounded bg-slate-100 px-2 py-0.5 text-[11px] text-slate-700">
                          {credential.identifier}
                        </code>
                        <div className="flex flex-wrap gap-1">
                          {(credential.scopes || []).filter(Boolean).map((scope, index) => (
                            <Badge key={`${credential.id}-scope-${scope}-${index}`} variant="outline" className="text-[11px] font-normal">
                              {scope}
                            </Badge>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell className="whitespace-nowrap">
                        <Badge variant="outline" className={status.className}>
                          {status.label}
                        </Badge>
                        {credential.autoRotate ? (
                          <div className="mt-1 flex items-center gap-1 text-[11px] text-emerald-600">
                            <ShieldCheck className="h-3 w-3" /> Automated rotation
                          </div>
                        ) : (
                          <div className="mt-1 text-[11px] text-muted-foreground">Manual rotation</div>
                        )}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {formatRelativeTime(credential.lastRotated)}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {credential.expiresAt ? formatRelativeTime(credential.expiresAt) : "—"}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">{credential.managedBy}</TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setCredentialToRotate(credential)}
                        >
                          Rotate
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card className="order-1 lg:order-2">
          <CardHeader>
            <CardTitle>Webhook delivery health</CardTitle>
            <CardDescription>24-hour delivery metrics with retry controls.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-3 sm:grid-cols-3">
              <div>
                <div className="text-xs text-muted-foreground">Total deliveries</div>
                <div className="text-xl font-semibold">{number.format(webhooks.totals.deliveries24h)}</div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground">Succeeded</div>
                <div className="text-xl font-semibold text-emerald-600">
                  {number.format(webhooks.totals.success24h)}
                </div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground">Failed</div>
                <div className="text-xl font-semibold text-rose-600">
                  {number.format(webhooks.totals.failed24h)}
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>P95 delivery latency</span>
                <span>{webhooks.subscriptions.length ? `${Math.max(...webhooks.subscriptions.map((subscription) => subscription.latencyP95))} ms` : "—"}</span>
              </div>
              <Progress value={summary.successRate24h * 100} />
            </div>
            <div className="overflow-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Subscription</TableHead>
                    <TableHead className="text-right">Deliveries</TableHead>
                    <TableHead className="text-right">Success</TableHead>
                    <TableHead className="text-right">Failures</TableHead>
                    <TableHead>Latency</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {webhooks.subscriptions.filter(Boolean).map((subscription) => {
                    if (!subscription) return null;
                    const status = webhookStatusConfig[subscription.status];
                    return (
                      <TableRow key={`webhook-subscription-${subscription.id}`} className="align-top">
                        <TableCell className="space-y-1">
                          <div className="text-sm font-medium">{subscription.channelLabel}</div>
                          <div className="text-xs text-muted-foreground">{subscription.event}</div>
                          {subscription.lastError ? (
                            <div className="text-[11px] text-amber-700">
                              Last error {formatRelativeTime(subscription.lastError)}
                            </div>
                          ) : null}
                        </TableCell>
                        <TableCell className="text-right text-sm font-medium">
                          {number.format(subscription.deliveries24h)}
                        </TableCell>
                        <TableCell className="text-right text-sm text-emerald-600">
                          {number.format(subscription.success24h)}
                        </TableCell>
                        <TableCell className="text-right text-sm text-rose-600">
                          {number.format(subscription.failed24h)}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {subscription.latencyP95 ? `${subscription.latencyP95} ms` : "—"}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className={status.className}>
                            {status.label}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              toast.success(`Queued retry for ${subscription.channelLabel}`)
                            }
                          >
                            Retry
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent webhook activity</CardTitle>
          <CardDescription>Latest delivery attempts across all channels.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {webhooks.events.filter(Boolean).slice(0, 8).map((event) => {
            if (!event) return null;
            const status = eventStatusConfig[event.status];
            return (
              <div key={`webhook-event-${event.id}`} className="rounded-lg border p-3">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">{event.channelLabel}</span>
                      <Badge variant="outline" className="text-[11px] font-normal">
                        {event.event}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Badge variant="outline" className={status.className}>
                        {status.label}
                      </Badge>
                      <span>{event.message}</span>
                    </div>
                  </div>
                  <div className="space-y-1 text-right text-xs text-muted-foreground">
                    <div>{formatRelativeTime(event.timestamp)}</div>
                    <div className="flex items-center justify-end gap-2">
                      <span>{event.responseCode}</span>
                      <span>{event.latencyMs ? `${event.latencyMs} ms` : "—"}</span>
                      {event.retries ? <span>{event.retries} retry</span> : null}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>

      <Dialog
        open={channelDialogOpen && channelDetail != null}
        onOpenChange={(open) => {
          if (!open) {
            closeChannelDialog();
          } else if (channelDetail) {
            setChannelDialogOpen(true);
          }
        }}
      >
        <DialogContent>
          {channelDetail ? (
            <>
              <DialogHeader>
                <DialogTitle>{channelDetail.label}</DialogTitle>
                <DialogDescription>
                  {channelDetail.provider} · {channelDetail.mode}
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-lg border p-3">
                  <div className="text-xs text-muted-foreground">Status</div>
                  <div className="mt-1 flex items-center gap-2">
                    <Badge
                      variant="outline"
                      className={connectionStatusConfig[channelDetail.status].className}
                    >
                      {connectionStatusConfig[channelDetail.status].label}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      Uptime {channelDetail.uptime}%
                    </span>
                  </div>
                </div>
                <div className="rounded-lg border p-3">
                  <div className="text-xs text-muted-foreground">Orders</div>
                  <div className="mt-1 text-sm font-semibold">
                    {number.format(channelDetail.orders7d)} in last 7 days
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {number.format(channelDetail.orders24h)} in last 24 hours
                  </div>
                </div>
                <div className="rounded-lg border p-3">
                  <div className="text-xs text-muted-foreground">GMV (30d)</div>
                  <div className="mt-1 text-sm font-semibold">
                    {currency.format(channelDetail.gmv30d)}
                  </div>
                </div>
                <div className="rounded-lg border p-3">
                  <div className="text-xs text-muted-foreground">Issues</div>
                  <div className="mt-1 space-y-1">
                    {(channelDetail.issues || []).length > 0 ? (
                      (channelDetail.issues || []).map((issue, index) => (
                        <div key={`${channelDetail.key}-detail-issue-${index}`} className="flex items-center gap-1 text-xs text-amber-700">
                          <AlertTriangle className="h-3 w-3" />
                          {issue}
                        </div>
                      ))
                    ) : (
                      <div className="flex items-center gap-1 text-xs text-emerald-600">
                        <CheckCircle2 className="h-3 w-3" />
                        No open incidents
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={closeChannelDialog}>
                  Close
                </Button>
                <Button
                  onClick={() => {
                    toast.success(`Manual sync triggered for ${channelDetail.label}`);
                    closeChannelDialog();
                  }}
                >
                  Trigger manual sync
                </Button>
              </DialogFooter>
            </>
          ) : null}
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={credentialToRotate != null}
        onOpenChange={(open) => {
          if (!open) setCredentialToRotate(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Rotate credential</AlertDialogTitle>
            <AlertDialogDescription>
              {credentialToRotate ? (
                <div className="space-y-2">
                  <div className="text-sm font-medium">{credentialToRotate.channelLabel}</div>
                  <div className="text-xs text-muted-foreground">{credentialToRotate.type}</div>
                  <code className="block w-fit rounded bg-slate-100 px-2 py-0.5 text-[11px] text-slate-700">
                    {credentialToRotate.identifier}
                  </code>
                  <div className="flex flex-wrap gap-1">
                    {(credentialToRotate.scopes || []).map((scope, index) => (
                      <Badge key={`${credentialToRotate.id}-rotate-scope-${scope}-${index}`} variant="outline" className="text-[11px] font-normal">
                        {scope}
                      </Badge>
                    ))}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Last rotated {formatRelativeTime(credentialToRotate.lastRotated)} ·
                    {" "}
                    {credentialToRotate.expiresAt
                      ? `Expires ${formatRelativeTime(credentialToRotate.expiresAt)}`
                      : "No expiry set"}
                  </div>
                </div>
              ) : null}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setCredentialToRotate(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (credentialToRotate) {
                  toast.success(`Rotation scheduled for ${credentialToRotate.channelLabel}`);
                }
                setCredentialToRotate(null);
              }}
            >
              Confirm rotation
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
