import { useEffect, useMemo, useState } from "react";
import type { Route } from "./+types/_app.admin.integrations._index";
import { PageHeader } from "@/components/app/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { cn } from "@/lib/utils";
import {
  Activity,
  AlertTriangle,
  CircleOff,
  Clock,
  KeyRound,
  RefreshCcw,
  ShieldCheck,
  Webhook,
} from "lucide-react";

type IntegrationType = "marketplace" | "courier" | "printer";
type IntegrationStatus = "connected" | "degraded" | "requires_action" | "disconnected";
type IntegrationMode = "live" | "sandbox";
type CredentialStatus = "active" | "rotation_due" | "expired";
type WebhookStatus = "healthy" | "failing" | "paused";

export type IntegrationCredential = {
  id: string;
  env: string;
  status: CredentialStatus;
  connectionType: string;
  clientId: string;
  lastRotatedAt?: string;
  expiresAt?: string;
  owner: string;
  notes?: string;
};

export type IntegrationWebhook = {
  id: string;
  url: string;
  status: WebhookStatus;
  lastEventAt?: string;
  secretMasked: string;
};

export type IntegrationRecord = {
  id: string;
  provider: string;
  label: string;
  type: IntegrationType;
  status: IntegrationStatus;
  mode: IntegrationMode;
  lastSyncAt?: string;
  createdAt: string;
  scopes: string[];
  credentials: IntegrationCredential[];
  webhooks: IntegrationWebhook[];
  notes?: string;
  maintenanceWindow?: string;
};

type IntegrationFilter = "all" | IntegrationType;

type SummaryMetrics = {
  liveConnections: number;
  needsAttention: number;
  credentialsDue: number;
  webhookAlerts: number;
};

type RelativeUnit = {
  limit: number;
  divisor: number;
  suffix: string;
};

type IntegrationCredentialApiRecord = {
  id?: string | null;
  env?: string | null;
  status?: string | null;
  connectionType?: string | null;
  clientId?: string | null;
  lastRotatedAt?: string | null;
  expiresAt?: string | null;
  owner?: string | null;
  notes?: string | null;
};

type IntegrationWebhookApiRecord = {
  id?: string | null;
  url?: string | null;
  status?: string | null;
  lastEventAt?: string | null;
  secretMasked?: string | null;
};

type IntegrationApiRecord = {
  id?: string | null;
  provider?: string | null;
  label?: string | null;
  type?: string | null;
  status?: string | null;
  mode?: string | null;
  lastSyncAt?: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
  scopes?: unknown;
  metadata?: unknown;
  integrationCredentials?: Array<IntegrationCredentialApiRecord | null> | null;
  webhookEndpoints?: Array<IntegrationWebhookApiRecord | null> | null;
};

type LoaderResult = {
  integrations: IntegrationRecord[];
  source: "api" | "fallback";
  error?: string;
};

const RELATIVE_UNITS: RelativeUnit[] = [
  { limit: 60_000, divisor: 1_000, suffix: "s" },
  { limit: 3_600_000, divisor: 60_000, suffix: "m" },
  { limit: 86_400_000, divisor: 3_600_000, suffix: "h" },
  { limit: Number.POSITIVE_INFINITY, divisor: 86_400_000, suffix: "d" },
];

const THIRTY_DAYS_IN_MS = 1000 * 60 * 60 * 24 * 30;

export const FALLBACK_INTEGRATIONS: IntegrationRecord[] = [
  {
    id: "shopify",
    provider: "Shopify",
    label: "Shopify Marketplace",
    type: "marketplace",
    status: "connected",
    mode: "live",
    lastSyncAt: "2025-02-18T15:12:00Z",
    createdAt: "2024-06-21T12:05:00Z",
    scopes: ["orders.read", "orders.write", "inventory.read", "webhooks.manage"],
    credentials: [
      {
        id: "shopify-prod",
        env: "production",
        status: "active",
        connectionType: "oauth",
        clientId: "omspoint-prod-shopify",
        lastRotatedAt: "2025-01-05T10:30:00Z",
        expiresAt: "2025-07-05T10:30:00Z",
        owner: "Commerce Ops",
        notes: "Rotates automatically through the service principal.",
      },
      {
        id: "shopify-sandbox",
        env: "sandbox",
        status: "rotation_due",
        connectionType: "oauth",
        clientId: "omspoint-sbx-shopify",
        lastRotatedAt: "2024-08-16T09:12:00Z",
        expiresAt: "2025-02-24T09:12:00Z",
        owner: "Commerce Ops",
        notes: "Used for functional test orders; rotate before next sandbox sync.",
      },
    ],
    webhooks: [
      {
        id: "shopify-orders",
        url: "https://hooks.omspoint.com/shopify/orders",
        status: "healthy",
        lastEventAt: "2025-02-18T15:09:42Z",
        secretMasked: "shp_sk_live_***c4f",
      },
      {
        id: "shopify-fulfillment",
        url: "https://hooks.omspoint.com/shopify/fulfillment",
        status: "healthy",
        lastEventAt: "2025-02-18T14:57:11Z",
        secretMasked: "shp_sk_live_***a98",
      },
    ],
    notes: "Syncs orders every 15 minutes and publishes fulfillment updates back to Shopify.",
  },
  {
    id: "amazon",
    provider: "Amazon",
    label: "Amazon Marketplace",
    type: "marketplace",
    status: "requires_action",
    mode: "live",
    lastSyncAt: "2025-02-18T11:48:00Z",
    createdAt: "2024-04-03T08:21:00Z",
    scopes: ["orders.read", "orders.acknowledge", "shipment.write"],
    credentials: [
      {
        id: "amazon-prod",
        env: "production",
        status: "rotation_due",
        connectionType: "api-key",
        clientId: "amz-live-client",
        lastRotatedAt: "2024-05-01T16:45:00Z",
        expiresAt: "2025-03-01T16:45:00Z",
        owner: "Marketplace Integrations",
        notes: "Manual rotation required through Partner Central.",
      },
    ],
    webhooks: [
      {
        id: "amazon-orders",
        url: "https://hooks.omspoint.com/amazon/orders",
        status: "failing",
        lastEventAt: "2025-02-17T22:05:00Z",
        secretMasked: "amz_wh_live_***912",
      },
    ],
    notes: "Retry queue is backing up because webhook signature verification is failing.",
    maintenanceWindow: "Rotation blocked until OAuth consent refreshed by account owner.",
  },
  {
    id: "fedex",
    provider: "FedEx",
    label: "FedEx Courier",
    type: "courier",
    status: "degraded",
    mode: "live",
    lastSyncAt: "2025-02-18T14:30:00Z",
    createdAt: "2023-12-09T07:40:00Z",
    scopes: ["shipments.create", "labels.print", "tracking.read"],
    credentials: [
      {
        id: "fedex-prod",
        env: "production",
        status: "active",
        connectionType: "api-key",
        clientId: "fdx-prod-key",
        lastRotatedAt: "2024-11-28T05:30:00Z",
        expiresAt: "2025-11-28T05:30:00Z",
        owner: "Logistics Engineering",
      },
    ],
    webhooks: [
      {
        id: "fedex-tracking",
        url: "https://hooks.omspoint.com/fedex/tracking",
        status: "healthy",
        lastEventAt: "2025-02-18T13:58:21Z",
        secretMasked: "fdx_wh_live_***442",
      },
    ],
    notes: "Label purchase latency elevated due to upstream rate limiting. Retry logic enabled with exponential backoff.",
  },
  {
    id: "printful",
    provider: "Printful",
    label: "Printful Production",
    type: "printer",
    status: "connected",
    mode: "sandbox",
    lastSyncAt: "2025-02-18T09:02:00Z",
    createdAt: "2024-10-18T19:12:00Z",
    scopes: ["catalog.read", "printjobs.create", "shipments.read"],
    credentials: [
      {
        id: "printful-sandbox",
        env: "sandbox",
        status: "active",
        connectionType: "api-key",
        clientId: "pf-test-key",
        lastRotatedAt: "2024-12-12T18:12:00Z",
        expiresAt: "2025-06-12T18:12:00Z",
        owner: "Production QA",
      },
    ],
    webhooks: [
      {
        id: "printful-printjobs",
        url: "https://hooks.omspoint.com/printful/printjobs",
        status: "paused",
        lastEventAt: "2025-02-12T18:45:00Z",
        secretMasked: "pf_wh_sbx_***771",
      },
    ],
    notes: "Sandbox used for qualification. Enable live mode once pilot vendor completes onboarding.",
  },
];

const STATUS_CONFIG: Record<IntegrationStatus, { label: string; className: string; icon: JSX.Element }> = {
  connected: {
    label: "Connected",
    className: "border-emerald-200 bg-emerald-50 text-emerald-700",
    icon: <ShieldCheck className="h-3.5 w-3.5" />,
  },
  degraded: {
    label: "Degraded",
    className: "border-amber-200 bg-amber-50 text-amber-700",
    icon: <Activity className="h-3.5 w-3.5" />,
  },
  requires_action: {
    label: "Requires attention",
    className: "border-orange-200 bg-orange-50 text-orange-700",
    icon: <AlertTriangle className="h-3.5 w-3.5" />,
  },
  disconnected: {
    label: "Disconnected",
    className: "border-rose-200 bg-rose-50 text-rose-700",
    icon: <CircleOff className="h-3.5 w-3.5" />,
  },
};

const MODE_CONFIG: Record<IntegrationMode, { label: string; className: string }> = {
  live: { label: "Live", className: "border-sky-200 bg-sky-50 text-sky-700" },
  sandbox: { label: "Sandbox", className: "border-slate-200 bg-slate-100 text-slate-700" },
};

const TYPE_CONFIG: Record<IntegrationType, { label: string; className: string }> = {
  marketplace: { label: "Marketplace", className: "border-blue-200 bg-blue-50 text-blue-700" },
  courier: { label: "Courier", className: "border-purple-200 bg-purple-50 text-purple-700" },
  printer: { label: "Printing", className: "border-teal-200 bg-teal-50 text-teal-700" },
};

const CREDENTIAL_STATUS_CONFIG: Record<CredentialStatus, { label: string; className: string; icon?: JSX.Element }> = {
  active: {
    label: "Active",
    className: "border-emerald-200 bg-emerald-50 text-emerald-700",
    icon: <ShieldCheck className="h-3 w-3" />,
  },
  rotation_due: {
    label: "Rotation due",
    className: "border-orange-200 bg-orange-50 text-orange-700",
    icon: <RefreshCcw className="h-3 w-3" />,
  },
  expired: {
    label: "Expired",
    className: "border-rose-200 bg-rose-50 text-rose-700",
    icon: <AlertTriangle className="h-3 w-3" />,
  },
};

const WEBHOOK_STATUS_CONFIG: Record<WebhookStatus, { label: string; className: string }> = {
  healthy: { label: "Healthy", className: "border-emerald-200 bg-emerald-50 text-emerald-700" },
  failing: { label: "Failing", className: "border-rose-200 bg-rose-50 text-rose-700" },
  paused: { label: "Paused", className: "border-slate-200 bg-slate-100 text-slate-700" },
};

const FILTER_OPTIONS: { value: IntegrationFilter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "marketplace", label: "Marketplace" },
  { value: "courier", label: "Courier" },
  { value: "printer", label: "Printing" },
];

export const loader = async ({ context }: Route.LoaderArgs): Promise<LoaderResult> => {
  const fallback = (error?: string): LoaderResult => ({
    integrations: FALLBACK_INTEGRATIONS,
    source: "fallback",
    error,
  });

  const manager = (context.api as Record<string, unknown> | undefined)?.["integration"] as
    | { findMany?: (args: unknown) => Promise<unknown> }
    | undefined;

  if (!manager || typeof manager.findMany !== "function") {
    return fallback("Integration model not available in API client yet.");
  }

  try {
    const raw = (await manager.findMany({
      select: {
        id: true,
        provider: true,
        label: true,
        type: true,
        status: true,
        createdAt: true,
        updatedAt: true,
        metadata: true,
        scopes: true,
        integrationCredentials: {
          select: {
            id: true,
            env: true,
            status: true,
            connectionType: true,
            clientId: true,
            lastRotatedAt: true,
            expiresAt: true,
            owner: true,
            notes: true,
          },
        },
        webhookEndpoints: {
          select: {
            id: true,
            url: true,
            status: true,
            lastEventAt: true,
            secretMasked: true,
          },
        },
      },
      sort: { createdAt: "Descending" },
      first: 50,
    })) as IntegrationApiRecord[];

    if (!Array.isArray(raw) || raw.length === 0) {
      return fallback("No integrations returned by API.");
    }

    const integrations = raw.map((record, index) => normalizeIntegration(record, index));
    return { integrations, source: "api" };
  } catch (error) {
    return fallback(serializeError(error));
  }
};

const normalizeIntegration = (record: IntegrationApiRecord, index: number): IntegrationRecord => {
  const id = toOptionalString(record.id) ?? `integration-${index + 1}`;
  const metadata = isObject(record.metadata) ? record.metadata : {};

  const credentials = (record.integrationCredentials ?? [])
    .filter((value): value is IntegrationCredentialApiRecord => Boolean(value))
    .map((credential, credentialIndex) => normalizeCredential(credential, id, credentialIndex));

  const webhooks = (record.webhookEndpoints ?? [])
    .filter((value): value is IntegrationWebhookApiRecord => Boolean(value))
    .map((webhook, webhookIndex) => normalizeWebhook(webhook, id, webhookIndex));

  const scopes = dedupeStrings([
    ...toStringArray(record.scopes),
    ...toStringArray(metadata["scopes"]),
  ]);

  const createdAt =
    toOptionalString(record.createdAt) ??
    toOptionalString(record.updatedAt) ??
    toOptionalString(metadata["createdAt"]) ??
    new Date().toISOString();

  const lastSyncAt =
    toOptionalString(record.lastSyncAt) ??
    toOptionalString(metadata["lastSyncAt"]) ??
    toOptionalString(metadata["lastSync"]);

  const notes =
    toOptionalString(metadata["notes"]) ??
    toOptionalString(metadata["summary"]) ??
    toOptionalString(metadata["description"]);

  const operational = isObject(metadata["operational"]) ? (metadata["operational"] as Record<string, unknown>) : undefined;
  const maintenanceWindow =
    toOptionalString(metadata["maintenanceWindow"]) ??
    (operational ? toOptionalString(operational["maintenanceWindow"]) : undefined);

  return {
    id,
    provider: toOptionalString(record.provider) ?? toOptionalString(metadata["provider"]) ?? "Unnamed provider",
    label: toOptionalString(record.label) ?? toOptionalString(metadata["label"]) ??
      toOptionalString(record.provider) ?? toOptionalString(metadata["provider"]) ?? "Integration",
    type: parseIntegrationType(record.type ?? metadata["type"]),
    status: parseIntegrationStatus(record.status ?? metadata["status"]),
    mode: parseIntegrationMode(record.mode ?? metadata["mode"], credentials, metadata),
    lastSyncAt,
    createdAt,
    scopes,
    credentials,
    webhooks,
    notes,
    maintenanceWindow,
  };
};

const normalizeCredential = (
  credential: IntegrationCredentialApiRecord,
  integrationId: string,
  index: number
): IntegrationCredential => {
  return {
    id: toOptionalString(credential.id) ?? `${integrationId}-credential-${index + 1}`,
    env: toOptionalString(credential.env) ?? "production",
    status: parseCredentialStatus(credential.status),
    connectionType: (toOptionalString(credential.connectionType) ?? "api-key").toLowerCase(),
    clientId: toOptionalString(credential.clientId) ?? `${integrationId}-client-${index + 1}`,
    lastRotatedAt: toOptionalString(credential.lastRotatedAt),
    expiresAt: toOptionalString(credential.expiresAt),
    owner: toOptionalString(credential.owner) ?? "Unassigned",
    notes: toOptionalString(credential.notes),
  };
};

const normalizeWebhook = (
  webhook: IntegrationWebhookApiRecord,
  integrationId: string,
  index: number
): IntegrationWebhook => {
  return {
    id: toOptionalString(webhook.id) ?? `${integrationId}-webhook-${index + 1}`,
    url: toOptionalString(webhook.url) ?? "",
    status: parseWebhookStatus(webhook.status),
    lastEventAt: toOptionalString(webhook.lastEventAt),
    secretMasked: toOptionalString(webhook.secretMasked) ?? "—",
  };
};

const parseIntegrationType = (value: unknown): IntegrationType => {
  const normalized = toOptionalString(value)?.toLowerCase();
  if (normalized === "courier" || normalized === "printer" || normalized === "marketplace") {
    return normalized;
  }
  return "marketplace";
};

const parseIntegrationStatus = (value: unknown): IntegrationStatus => {
  const normalized = toOptionalString(value)?.toLowerCase();
  switch (normalized) {
    case "connected":
      return "connected";
    case "degraded":
      return "degraded";
    case "disconnected":
      return "disconnected";
    default:
      return "requires_action";
  }
};

const parseIntegrationMode = (
  value: unknown,
  credentials: IntegrationCredential[],
  metadata: Record<string, unknown>
): IntegrationMode => {
  const normalized = toOptionalString(value)?.toLowerCase();
  if (normalized === "live" || normalized === "sandbox") {
    return normalized;
  }

  const metadataMode = toOptionalString(metadata["mode"])?.toLowerCase();
  if (metadataMode === "live" || metadataMode === "sandbox") {
    return metadataMode;
  }

  const envs = credentials.map((credential) => credential.env.toLowerCase());
  if (envs.some((env) => env.includes("prod") || env.includes("live"))) {
    return "live";
  }
  if (envs.some((env) => env.includes("sand") || env.includes("test") || env.includes("qa"))) {
    return "sandbox";
  }
  return "live";
};

const parseCredentialStatus = (value: unknown): CredentialStatus => {
  const normalized = toOptionalString(value)?.toLowerCase();
  switch (normalized) {
    case "active":
      return "active";
    case "expired":
      return "expired";
    case "rotation_due":
    case "rotation-due":
    case "rotationdue":
    case "expiring":
      return "rotation_due";
    default:
      return "rotation_due";
  }
};

const parseWebhookStatus = (value: unknown): WebhookStatus => {
  const normalized = toOptionalString(value)?.toLowerCase();
  switch (normalized) {
    case "healthy":
    case "active":
      return "healthy";
    case "paused":
    case "disabled":
      return "paused";
    case "failing":
    case "error":
    default:
      return "failing";
  }
};

const computeSummaryMetrics = (records: IntegrationRecord[]): SummaryMetrics => {
  const liveConnections = records.filter((integration) => integration.status === "connected").length;
  const needsAttention = records.filter((integration) => integration.status !== "connected").length;
  const credentialsDue = records
    .flatMap((integration) => integration.credentials)
    .filter(isRotationDue)
    .length;
  const webhookAlerts = records
    .flatMap((integration) => integration.webhooks)
    .filter((webhook) => webhook.status !== "healthy")
    .length;

  return { liveConnections, needsAttention, credentialsDue, webhookAlerts };
};

const isRotationDue = (credential: IntegrationCredential): boolean => {
  if (credential.status !== "active") {
    return true;
  }

  if (!credential.expiresAt) {
    return false;
  }

  const expiry = new Date(credential.expiresAt).getTime();
  if (Number.isNaN(expiry)) {
    return false;
  }

  return expiry - Date.now() <= THIRTY_DAYS_IN_MS;
};

const formatRelativeTime = (value?: string) => {
  if (!value) {
    return "—";
  }

  const timestamp = new Date(value).getTime();
  if (Number.isNaN(timestamp)) {
    return "—";
  }

  const diffMs = Date.now() - timestamp;
  const abs = Math.abs(diffMs);

  for (const unit of RELATIVE_UNITS) {
    if (abs < unit.limit) {
      const quantity = Math.max(1, Math.round(abs / unit.divisor));
      return diffMs >= 0 ? `${quantity}${unit.suffix} ago` : `in ${quantity}${unit.suffix}`;
    }
  }

  return "—";
};

const formatList = (items: string[]) => {
  if (items.length === 0) {
    return "—";
  }

  if (items.length === 1) {
    return items[0];
  }

  const [head, ...tail] = items;
  return `${head} +${tail.length}`;
};

const summarizeCredentialStatus = (credentials: IntegrationCredential[]) => {
  if (credentials.length === 0) {
    return "—";
  }

  const active = credentials.filter((credential) => credential.status === "active").length;
  const due = credentials.length - active;

  if (due === 0) {
    return `${credentials.length} active`;
  }

  return `${active} active · ${due} due`;
};

const IntegrationStatusBadge = ({ status }: { status: IntegrationStatus }) => {
  const config = STATUS_CONFIG[status];
  return (
    <Badge variant="outline" className={cn("gap-1.5 font-medium", config.className)}>
      {config.icon}
      {config.label}
    </Badge>
  );
};

const ModeBadge = ({ mode }: { mode: IntegrationMode }) => {
  const config = MODE_CONFIG[mode];
  return (
    <Badge variant="outline" className={cn("font-medium", config.className)}>
      {config.label}
    </Badge>
  );
};

const TypeBadge = ({ type }: { type: IntegrationType }) => {
  const config = TYPE_CONFIG[type];
  return (
    <Badge variant="outline" className={cn("font-medium", config.className)}>
      {config.label}
    </Badge>
  );
};

const CredentialStatusBadge = ({ status }: { status: CredentialStatus }) => {
  const config = CREDENTIAL_STATUS_CONFIG[status];
  return (
    <Badge variant="outline" className={cn("gap-1.5", config.className)}>
      {config.icon}
      {config.label}
    </Badge>
  );
};

const WebhookStatusBadge = ({ status }: { status: WebhookStatus }) => {
  const config = WEBHOOK_STATUS_CONFIG[status];
  return (
    <Badge variant="outline" className={cn("font-medium", config.className)}>
      {config.label}
    </Badge>
  );
};

export default function AdminIntegrationsPage({ loaderData }: Route.ComponentProps) {
  const { integrations, source } = loaderData;
  const summary = useMemo(() => computeSummaryMetrics(integrations), [integrations]);
  const [filter, setFilter] = useState<IntegrationFilter>("all");

  const filteredIntegrations = useMemo(() => {
    if (filter === "all") {
      return integrations;
    }
    return integrations.filter((integration) => integration.type === filter);
  }, [filter, integrations]);

  const [activeIntegrationId, setActiveIntegrationId] = useState<string | null>(
    filteredIntegrations[0]?.id ?? null
  );

  useEffect(() => {
    setActiveIntegrationId((previous) => {
      if (filteredIntegrations.length === 0) {
        return null;
      }
      if (previous && filteredIntegrations.some((integration) => integration.id === previous)) {
        return previous;
      }
      return filteredIntegrations[0]?.id ?? null;
    });
  }, [filteredIntegrations]);

  const activeIntegration =
    filteredIntegrations.find((integration) => integration.id === activeIntegrationId) ??
    filteredIntegrations[0] ??
    null;

  const formatDateTime = (value?: string) => {
    if (!value) {
      return "—";
    }
    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) {
      return "—";
    }
    
    // Use fixed locale and UTC timezone to ensure server-client consistency
    return new Intl.DateTimeFormat('en-US', {
      dateStyle: "medium",
      timeStyle: "short",
      timeZone: "UTC"
    }).format(parsed);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Integration Registry"
        description="Track marketplace, courier, and printing integrations with credentials and webhooks."
      />

      <Card>
        <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <CardTitle>Platform health</CardTitle>
            <CardDescription>
              Connected apps, credential posture, and webhook alarms in the current environment.
            </CardDescription>
          </div>
          {source === "fallback" ? (
            <Badge variant="outline" className="self-start text-xs font-semibold uppercase tracking-wide">
              Sample data
            </Badge>
          ) : null}
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <MetricTile
              label="Live connections"
              value={summary.liveConnections}
              supportingText="Apps fully authenticated and syncing."
              icon={<ShieldCheck className="h-5 w-5 text-emerald-600" />}
            />
            <MetricTile
              label="Requires attention"
              value={summary.needsAttention}
              supportingText="Connections with degraded health or errors."
              icon={<AlertTriangle className="h-5 w-5 text-orange-600" />}
            />
            <MetricTile
              label="Credentials to rotate"
              value={summary.credentialsDue}
              supportingText="Expiring or manually rotated keys."
              icon={<RefreshCcw className="h-5 w-5 text-sky-600" />}
            />
            <MetricTile
              label="Webhook alerts"
              value={summary.webhookAlerts}
              supportingText="Endpoints failing delivery or paused."
              icon={<Webhook className="h-5 w-5 text-rose-600" />}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Connected integrations</CardTitle>
          <CardDescription>List integrations with health, mode, and last sync timestamps.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-2">
            {FILTER_OPTIONS.map((option) => (
              <Button
                key={option.value}
                size="sm"
                variant={filter === option.value ? "default" : "outline"}
                onClick={() => setFilter(option.value)}
              >
                {option.label}
              </Button>
            ))}
          </div>

          {filteredIntegrations.length === 0 ? (
            <div className="rounded-md border border-dashed p-6 text-sm text-muted-foreground">
              No integrations found for this segment.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[240px]">Integration</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Mode</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Last sync</TableHead>
                  <TableHead>Credentials</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredIntegrations.map((integration) => (
                  <TableRow
                    key={integration.id}
                    data-active={integration.id === activeIntegration?.id}
                    onClick={() => setActiveIntegrationId(integration.id)}
                    className={cn(
                      "cursor-pointer transition-colors",
                      integration.id === activeIntegration?.id
                        ? "bg-muted"
                        : "hover:bg-muted/60"
                    )}
                  >
                    <TableCell>
                      <div className="space-y-1">
                        <div className="font-medium leading-none">{integration.provider}</div>
                        <div className="text-sm text-muted-foreground">{integration.label}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <TypeBadge type={integration.type} />
                    </TableCell>
                    <TableCell>
                      <ModeBadge mode={integration.mode} />
                    </TableCell>
                    <TableCell>
                      <IntegrationStatusBadge status={integration.status} />
                    </TableCell>
                    <TableCell>
                      <div className="text-sm font-medium">{formatRelativeTime(integration.lastSyncAt)}</div>
                      <div className="text-xs text-muted-foreground">{formatDateTime(integration.lastSyncAt)}</div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm font-medium">
                        {integration.credentials.length} credential
                        {integration.credentials.length === 1 ? "" : "s"}
                      </div>
                      <div className="text-xs text-muted-foreground">{summarizeCredentialStatus(integration.credentials)}</div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-[2fr,1fr]">
        <Card className="h-full">
          {activeIntegration ? (
            <>
              <CardHeader className="space-y-2">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <CardTitle>{activeIntegration.provider}</CardTitle>
                    <CardDescription>{activeIntegration.label}</CardDescription>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <TypeBadge type={activeIntegration.type} />
                    <ModeBadge mode={activeIntegration.mode} />
                    <IntegrationStatusBadge status={activeIntegration.status} />
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">
                  {activeIntegration.notes ?? "No operator notes recorded."}
                </p>
              </CardHeader>
              <CardContent className="space-y-6">
                <section className="space-y-3">
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <InfoTile
                      label="Last sync"
                      value={formatRelativeTime(activeIntegration.lastSyncAt)}
                      hint={formatDateTime(activeIntegration.lastSyncAt)}
                    />
                    <InfoTile label="First configured" value={formatDateTime(activeIntegration.createdAt)} />
                    <InfoTile label="Scopes" value={formatList(activeIntegration.scopes)} />
                    <InfoTile label="Maintenance" value={activeIntegration.maintenanceWindow ?? "—"} />
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {activeIntegration.scopes.map((scope) => (
                      <Badge key={scope} variant="outline" className="bg-muted/40 text-xs font-medium">
                        {scope}
                      </Badge>
                    ))}
                  </div>
                </section>

                <Separator />

                <section className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Credentials</h3>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" disabled>
                        <RefreshCcw className="h-4 w-4" />
                        Rotate
                      </Button>
                      <Button size="sm" variant="outline" disabled>
                        <KeyRound className="h-4 w-4" />
                        Reveal secret
                      </Button>
                    </div>
                  </div>
                  <div className="space-y-3">
                    {activeIntegration.credentials.map((credential) => (
                      <div key={credential.id} className="rounded-lg border bg-muted/10 p-4">
                        <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                          <div className="space-y-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <CredentialStatusBadge status={credential.status} />
                              <Badge variant="outline" className="font-medium capitalize">
                                {credential.env}
                              </Badge>
                              <Badge variant="outline" className="font-medium capitalize">
                                {credential.connectionType.replace(/-/g, " ")}
                              </Badge>
                            </div>
                            <div className="text-sm font-medium text-foreground">Client ID: {credential.clientId}</div>
                            <div className="text-xs text-muted-foreground">Owner: {credential.owner}</div>
                            {credential.notes ? (
                              <div className="text-xs text-muted-foreground">{credential.notes}</div>
                            ) : null}
                          </div>
                          <div className="grid gap-2 text-xs text-muted-foreground sm:grid-cols-2">
                            <div>
                              <span className="font-semibold text-foreground">Last rotated:</span>{" "}
                              {formatDateTime(credential.lastRotatedAt)}
                            </div>
                            <div>
                              <span className="font-semibold text-foreground">Expires:</span>{" "}
                              {credential.expiresAt ? formatDateTime(credential.expiresAt) : "—"}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>

                <Separator />

                <section className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Webhooks</h3>
                    <Button size="sm" variant="outline" disabled>
                      <Webhook className="h-4 w-4" />
                      Ping endpoint
                    </Button>
                  </div>
                  <div className="space-y-3">
                    {activeIntegration.webhooks.map((webhook) => (
                      <div key={webhook.id} className="rounded-lg border bg-muted/10 p-4">
                        <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                          <div className="space-y-1">
                            <WebhookStatusBadge status={webhook.status} />
                            <div className="text-sm font-medium text-foreground">{webhook.url}</div>
                            <div className="text-xs text-muted-foreground">Secret: {webhook.secretMasked}</div>
                          </div>
                          <div className="text-xs text-muted-foreground">
                            <span className="font-semibold text-foreground">Last event:</span>{" "}
                            {formatDateTime(webhook.lastEventAt)}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              </CardContent>
            </>
          ) : (
            <div className="p-10 text-center text-sm text-muted-foreground">
              Select an integration to view credentials and webhooks.
            </div>
          )}
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Runbooks</CardTitle>
              <CardDescription>Provide operators with clear steps to reconnect or rotate credentials.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <RunbookStep
                title="Reconnect OAuth app"
                description="Ask the integration owner to re-consent, then trigger a credentials rotate to refresh tokens."
                detail="Applies to Shopify and other OAuth-based channels."
              />
              <RunbookStep
                title="Rotate API keys"
                description="Create a new key in the provider console, store it in the secrets vault, then update the integration credential."
                detail="Schedule a paired deploy to propagate the new key to production."
              />
              <RunbookStep
                title="Restore webhook delivery"
                description="Validate endpoint availability, confirm shared secret, then replay events from the provider dashboard."
                detail="If retries exceed 500 events, escalate to the observability runbook for bulk replays."
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Suggested follow-ups</CardTitle>
              <CardDescription>Next actions to harden the integration surface.</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3 text-sm">
                <li>
                  <span className="font-semibold text-foreground">Enable alert routing</span>
                  <div className="text-muted-foreground">Push webhook failures into the on-call rotation via PagerDuty.</div>
                </li>
                <li>
                  <span className="font-semibold text-foreground">Document sandbox parity</span>
                  <div className="text-muted-foreground">Track which providers support feature-complete sandbox flows before go-live.</div>
                </li>
                <li>
                  <span className="font-semibold text-foreground">Automate credential audits</span>
                  <div className="text-muted-foreground">Export credential inventory weekly for compliance evidence.</div>
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Operational notes</CardTitle>
              <CardDescription>Key observations the integrations team should remember.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-muted-foreground">
              <div className="flex gap-3">
                <Clock className="h-4 w-4 text-foreground" />
                <p>Shopify tokens rotate automatically but sandbox apps need manual approval every 90 days.</p>
              </div>
              <div className="flex gap-3">
                <AlertTriangle className="h-4 w-4 text-orange-600" />
                <p>Amazon webhook signatures fail when the partner rotates secrets without notice; monitor for 401 responses.</p>
              </div>
              <div className="flex gap-3">
                <Activity className="h-4 w-4 text-purple-600" />
                <p>FedEx rate limiting escalates after 500 RPM; keep retry budgets below partner threshold.</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

const MetricTile = ({
  icon,
  label,
  value,
  supportingText,
}: {
  icon: JSX.Element;
  label: string;
  value: number;
  supportingText: string;
}) => (
  <div className="rounded-lg border bg-card p-4 shadow-sm">
    <div className="flex items-center gap-3">
      <div className="rounded-md bg-muted p-2">{icon}</div>
      <div>
        <div className="text-sm font-medium text-muted-foreground">{label}</div>
        <div className="text-2xl font-semibold text-foreground">{value}</div>
      </div>
    </div>
    <p className="mt-3 text-xs text-muted-foreground">{supportingText}</p>
  </div>
);

const InfoTile = ({ label, value, hint }: { label: string; value: string; hint?: string }) => (
  <div className="rounded-md border bg-muted/10 p-3">
    <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{label}</div>
    <div className="text-sm font-semibold text-foreground">{value}</div>
    {hint ? <div className="text-xs text-muted-foreground">{hint}</div> : null}
  </div>
);

const RunbookStep = ({ title, description, detail }: { title: string; description: string; detail: string }) => (
  <div className="space-y-1 rounded-md border bg-muted/10 p-3">
    <div className="text-sm font-semibold text-foreground">{title}</div>
    <div className="text-sm text-muted-foreground">{description}</div>
    <div className="text-xs text-muted-foreground">{detail}</div>
  </div>
);

const serializeError = (error: unknown): string => {
  if (error instanceof Error) {
    return error.message || error.name;
  }
  if (typeof error === "string") {
    return error;
  }
  try {
    return JSON.stringify(error);
  } catch {
    return "Unknown error";
  }
};

const isObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const toOptionalString = (value: unknown): string | undefined => {
  if (typeof value === "string" && value.trim().length > 0) {
    return value;
  }
  return undefined;
};

const toStringArray = (value: unknown): string[] => {
  if (Array.isArray(value)) {
    return value.filter((item): item is string => typeof item === "string" && item.trim().length > 0);
  }
  if (typeof value === "string") {
    return value
      .split(",")
      .map((item) => item.trim())
      .filter((item) => item.length > 0);
  }
  return [];
};

const dedupeStrings = (values: string[]) => Array.from(new Set(values));

