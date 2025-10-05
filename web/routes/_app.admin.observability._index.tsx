import { useMemo, type ReactNode } from "react";
import type { Route } from "./+types/_app.admin.observability._index";
import { PageHeader } from "@/components/app/page-header";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Activity, AlertTriangle, BarChart3, ShieldCheck } from "lucide-react";

type ServiceMetricRecord = {
  id: string;
  serviceName: string;
  metric: string;
  currentValue?: number;
  target?: number;
  unit?: string;
  direction?: "up" | "down";
  capturedAt?: string;
};

type AlertRecord = {
  id: string;
  serviceName: string;
  type?: string;
  severity: "critical" | "high" | "warning";
  status: "open" | "acknowledged" | "resolved";
  openedAt?: string;
  acknowledgedAt?: string;
  resolvedAt?: string;
  runbookUrl?: string;
  summary?: string;
};

type IncidentRecord = {
  id: string;
  title: string;
  status: "open" | "monitoring" | "resolved";
  severity: string;
  startedAt?: string;
  resolvedAt?: string;
  summary?: string;
  postmortemUrl?: string;
};

type LogForwarderRecord = {
  id: string;
  destination: string;
  provider?: string;
  status: "healthy" | "degraded" | "failed";
  lastHeartbeatAt?: string;
  notes?: string;
};

type LoaderData = {
  metrics: ServiceMetricRecord[];
  alerts: AlertRecord[];
  incidents: IncidentRecord[];
  forwarders: LogForwarderRecord[];
  source: "api" | "fallback";
  error?: string;
};

const FALLBACK_DATA: LoaderData = {
  metrics: [
    {
      id: "metric-qps",
      serviceName: "Control plane",
      metric: "p95 latency",
      currentValue: 1.6,
      target: 1.2,
      unit: "s",
      direction: "down",
      capturedAt: "2025-02-18T14:30:00Z",
    },
    {
      id: "metric-print-success",
      serviceName: "Print workers",
      metric: "Job success",
      currentValue: 99.4,
      target: 99.5,
      unit: "%",
      direction: "up",
      capturedAt: "2025-02-18T14:00:00Z",
    },
    {
      id: "metric-ledger",
      serviceName: "Finance ledger",
      metric: "Reconciliation failures",
      currentValue: 2,
      target: 0,
      unit: "", 
      direction: "down",
      capturedAt: "2025-02-18T14:00:00Z",
    },
  ],
  alerts: [
    {
      id: "alert-ingress",
      serviceName: "Ingress service",
      severity: "high",
      status: "open",
      openedAt: "2025-02-18T13:40:00Z",
      summary: "5xx rate > 0.8% across NA region",
      runbookUrl: "docs/runbooks/ingress-errors.md",
    },
    {
      id: "alert-print",
      serviceName: "Print workers",
      severity: "warning",
      status: "acknowledged",
      openedAt: "2025-02-18T12:55:00Z",
      acknowledgedAt: "2025-02-18T13:05:00Z",
      summary: "Job retries exceeding SLA",
      runbookUrl: "docs/runbooks/print-worker-retries.md",
    },
  ],
  incidents: [
    {
      id: "incident-ops-142",
      title: "Print routing backlog",
      severity: "sev2",
      status: "open",
      startedAt: "2025-02-18T12:15:00Z",
      summary: "Routing queue lagged >18m impacting EU dropship",
    },
    {
      id: "incident-ledger-38",
      title: "Finance ledger replay",
      severity: "sev3",
      status: "monitoring",
      startedAt: "2025-02-17T21:00:00Z",
      resolvedAt: "2025-02-17T22:45:00Z",
      summary: "Ledger reindex completed; monitoring postmortem prep",
    },
  ],
  forwarders: [
    {
      id: "forwarder-loki",
      destination: "Grafana Loki",
      provider: "Grafana Cloud",
      status: "healthy",
      lastHeartbeatAt: "2025-02-18T14:58:00Z",
      notes: "99.9% delivery, 3-hour retention",
    },
    {
      id: "forwarder-s3",
      destination: "S3 cold storage",
      provider: "AWS",
      status: "degraded",
      lastHeartbeatAt: "2025-02-18T10:20:00Z",
      notes: "Delayed uploads due to batch retry",
    },
    {
      id: "forwarder-splunk",
      destination: "Splunk Cloud",
      provider: "Splunk",
      status: "failed",
      lastHeartbeatAt: "2025-02-18T07:05:00Z",
      notes: "Token expired; rotation pending",
    },
  ],
  source: "fallback",
};

const serializeError = (error: unknown): string => {
  if (error instanceof Error) {
    return error.message;
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

const guardNumber = (value: unknown): number | undefined => {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }
  if (typeof value === "string" && value.trim().length > 0) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : undefined;
  }
  return undefined;
};

const guardString = (value: unknown): string | undefined => {
  if (typeof value === "string" && value.trim().length > 0) {
    return value;
  }
  return undefined;
};

const formatDateTime = (value?: string) => {
  if (!value) {
    return "—";
  }
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return "—";
  }
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "UTC",
  }).format(parsed);
};

export const loader = async ({ context }: Route.LoaderArgs): Promise<LoaderData> => {
  const api = context.api as Record<string, any> | undefined;
  const metricManager = api?.serviceMetric?.findMany;
  const alertManager = api?.alert?.findMany;
  const incidentManager = api?.incident?.findMany;
  const forwarderManager = api?.logForwarder?.findMany;

  if (!metricManager || !alertManager || !incidentManager || !forwarderManager) {
    return { ...FALLBACK_DATA, error: "Observability models not available in API client." };
  }

  try {
    const [metricsRaw, alertsRaw, incidentsRaw, forwardersRaw] = await Promise.all([
      metricManager({
        select: {
          id: true,
          serviceName: true,
          metric: true,
          currentValue: true,
          target: true,
          unit: true,
          direction: true,
          capturedAt: true,
        },
        sort: { capturedAt: "Descending" },
        first: 25,
      }),
      alertManager({
        select: {
          id: true,
          serviceName: true,
          type: true,
          severity: true,
          status: true,
          openedAt: true,
          acknowledgedAt: true,
          resolvedAt: true,
          runbookUrl: true,
          summary: true,
        },
        sort: { openedAt: "Descending" },
        first: 25,
      }),
      incidentManager({
        select: {
          id: true,
          title: true,
          status: true,
          severity: true,
          startedAt: true,
          resolvedAt: true,
          summary: true,
          postmortemUrl: true,
        },
        sort: { startedAt: "Descending" },
        first: 25,
      }),
      forwarderManager({
        select: {
          id: true,
          destination: true,
          provider: true,
          status: true,
          lastHeartbeatAt: true,
          notes: true,
        },
        sort: { destination: "Ascending" },
        first: 25,
      }),
    ]);

    const metrics: ServiceMetricRecord[] = (Array.isArray(metricsRaw) ? metricsRaw : []).map((record, index) => ({
      id: guardString(record?.id) ?? `metric-${index}`,
      serviceName: guardString(record?.serviceName) ?? "Unknown service",
      metric: guardString(record?.metric) ?? "Metric",
      currentValue: guardNumber(record?.currentValue),
      target: guardNumber(record?.target),
      unit: guardString(record?.unit),
      direction: record?.direction === "down" ? "down" : "up",
      capturedAt: guardString(record?.capturedAt),
    }));

    const alerts: AlertRecord[] = (Array.isArray(alertsRaw) ? alertsRaw : []).map((record, index) => ({
      id: guardString(record?.id) ?? `alert-${index}`,
      serviceName: guardString(record?.serviceName) ?? "Service",
      type: guardString(record?.type),
      severity: (record?.severity === "critical" || record?.severity === "high" ? record.severity : "warning") as AlertRecord["severity"],
      status:
        record?.status === "acknowledged" || record?.status === "resolved" ? record.status : "open",
      openedAt: guardString(record?.openedAt),
      acknowledgedAt: guardString(record?.acknowledgedAt),
      resolvedAt: guardString(record?.resolvedAt),
      runbookUrl: guardString(record?.runbookUrl),
      summary: guardString(record?.summary),
    }));

    const incidents: IncidentRecord[] = (Array.isArray(incidentsRaw) ? incidentsRaw : []).map((record, index) => ({
      id: guardString(record?.id) ?? `incident-${index}`,
      title: guardString(record?.title) ?? "Incident",
      status: (record?.status === "resolved" || record?.status === "monitoring" ? record.status : "open") as IncidentRecord["status"],
      severity: guardString(record?.severity) ?? "sev3",
      startedAt: guardString(record?.startedAt),
      resolvedAt: guardString(record?.resolvedAt),
      summary: guardString(record?.summary),
      postmortemUrl: guardString(record?.postmortemUrl),
    }));

    const forwarders: LogForwarderRecord[] = (Array.isArray(forwardersRaw) ? forwardersRaw : []).map((record, index) => ({
      id: guardString(record?.id) ?? `forwarder-${index}`,
      destination: guardString(record?.destination) ?? "Destination",
      provider: guardString(record?.provider),
      status:
        record?.status === "degraded" || record?.status === "failed" ? record.status : "healthy",
      lastHeartbeatAt: guardString(record?.lastHeartbeatAt),
      notes: guardString(record?.notes),
    }));

    return {
      metrics,
      alerts,
      incidents,
      forwarders,
      source: "api",
    } satisfies LoaderData;
  } catch (error) {
    return {
      ...FALLBACK_DATA,
      error: serializeError(error),
    } satisfies LoaderData;
  }
};

const formatValue = (metric: ServiceMetricRecord) => {
  if (typeof metric.currentValue === "number") {
    if (metric.unit === "%") {
      return `${metric.currentValue.toFixed(2)}%`;
    }
    if (metric.unit) {
      return `${metric.currentValue}${metric.unit}`;
    }
    return metric.currentValue.toFixed(2);
  }
  return "—";
};

const severityTone: Record<AlertRecord["severity"], string> = {
  critical: "border-rose-200 bg-rose-50 text-rose-700",
  high: "border-orange-200 bg-orange-50 text-orange-700",
  warning: "border-amber-200 bg-amber-50 text-amber-700",
};

const forwarderTone: Record<LogForwarderRecord["status"], string> = {
  healthy: "border-emerald-200 bg-emerald-50 text-emerald-700",
  degraded: "border-amber-200 bg-amber-50 text-amber-700",
  failed: "border-rose-200 bg-rose-50 text-rose-700",
};

export default function ObservabilityPage({ loaderData }: Route.ComponentProps) {
  const { metrics, alerts, incidents, forwarders, source, error } = loaderData;

  const summary = useMemo(() => {
    const openAlerts = alerts.filter((alert) => alert.status === "open");
    const activeIncidents = incidents.filter((incident) => incident.status !== "resolved");
    const failingForwarders = forwarders.filter((forwarder) => forwarder.status !== "healthy");

    return {
      metrics: metrics.length,
      openAlerts: openAlerts.length,
      activeIncidents: activeIncidents.length,
      forwarderIssues: failingForwarders.length,
    };
  }, [alerts, incidents, forwarders, metrics]);

  const defaultTab = metrics[0]?.id ?? "metrics";

  return (
    <div className="space-y-6">
      <PageHeader
        title="Observability dashboard"
        description="Operational signal across services, alerting, and incident workflows."
      />

      {error && source === "fallback" ? (
        <Alert variant="destructive">
          <AlertTitle>Using sample telemetry</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : null}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <SummaryCard icon={<BarChart3 className="h-5 w-5 text-blue-600" />} label="Service metrics" value={summary.metrics} subtext="Signals tracked" />
        <SummaryCard icon={<AlertTriangle className="h-5 w-5 text-amber-600" />} label="Open alerts" value={summary.openAlerts} subtext="Attention required" />
        <SummaryCard icon={<Activity className="h-5 w-5 text-red-600" />} label="Active incidents" value={summary.activeIncidents} subtext="Response in-flight" />
        <SummaryCard icon={<ShieldCheck className="h-5 w-5 text-emerald-600" />} label="Forwarder health" value={`${forwarders.length - summary.forwarderIssues}/${forwarders.length}`} subtext="Healthy destinations" />
      </div>

      <Tabs defaultValue={defaultTab} className="space-y-6">
        <TabsList>
          <TabsTrigger value="metrics">Service metrics</TabsTrigger>
          <TabsTrigger value="alerts">Alerts</TabsTrigger>
          <TabsTrigger value="incidents">Incidents</TabsTrigger>
          <TabsTrigger value="forwarders">Log forwarders</TabsTrigger>
        </TabsList>

        <TabsContent value="metrics">
          <Card>
            <CardHeader>
              <CardTitle>Live service metrics</CardTitle>
              <CardDescription>Current telemetry compared to targets.</CardDescription>
            </CardHeader>
            <CardContent className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Service</TableHead>
                    <TableHead>Metric</TableHead>
                    <TableHead>Value</TableHead>
                    <TableHead>Target</TableHead>
                    <TableHead>Captured</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {metrics.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center text-muted-foreground">
                        No service metrics available.
                      </TableCell>
                    </TableRow>
                  ) : (
                    metrics.map((metric) => (
                      <TableRow key={metric.id}>
                        <TableCell>{metric.serviceName}</TableCell>
                        <TableCell>{metric.metric}</TableCell>
                        <TableCell>{formatValue(metric)}</TableCell>
                        <TableCell>{typeof metric.target === "number" ? metric.target : "—"}</TableCell>
                        <TableCell>{formatDateTime(metric.capturedAt)}</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="alerts">
          <Card>
            <CardHeader>
              <CardTitle>Alert queue</CardTitle>
              <CardDescription>Active monitors and recent acknowledgements.</CardDescription>
            </CardHeader>
            <CardContent className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Service</TableHead>
                    <TableHead>Severity</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Opened</TableHead>
                    <TableHead>Runbook</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {alerts.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center text-muted-foreground">
                        No alerts firing.
                      </TableCell>
                    </TableRow>
                  ) : (
                    alerts.map((alert) => (
                      <TableRow key={alert.id}>
                        <TableCell>
                          <div className="font-medium">{alert.serviceName}</div>
                          <div className="text-xs text-muted-foreground">{alert.summary ?? ""}</div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className={`${severityTone[alert.severity]} capitalize`}>
                            {alert.severity}
                          </Badge>
                        </TableCell>
                        <TableCell className="capitalize">{alert.status}</TableCell>
                        <TableCell>{formatDateTime(alert.openedAt)}</TableCell>
                        <TableCell>
                          {alert.runbookUrl ? (
                            <a href={alert.runbookUrl} className="text-sm text-blue-600 underline">
                              Runbook
                            </a>
                          ) : (
                            "—"
                          )}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="incidents">
          <Card>
            <CardHeader>
              <CardTitle>Incident response</CardTitle>
              <CardDescription>Recent incident activity with follow-ups.</CardDescription>
            </CardHeader>
            <CardContent className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Severity</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Started</TableHead>
                    <TableHead>Resolved</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {incidents.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center text-muted-foreground">
                        No incidents recorded.
                      </TableCell>
                    </TableRow>
                  ) : (
                    incidents.map((incident) => (
                      <TableRow key={incident.id}>
                        <TableCell>
                          <div className="font-medium">{incident.title}</div>
                          <div className="text-xs text-muted-foreground">{incident.summary ?? ""}</div>
                        </TableCell>
                        <TableCell>{incident.severity}</TableCell>
                        <TableCell className="capitalize">{incident.status}</TableCell>
                        <TableCell>{formatDateTime(incident.startedAt)}</TableCell>
                        <TableCell>{formatDateTime(incident.resolvedAt)}</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="forwarders">
          <Card>
            <CardHeader>
              <CardTitle>Log forwarders</CardTitle>
              <CardDescription>Destination health for log shipping pipelines.</CardDescription>
            </CardHeader>
            <CardContent className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Destination</TableHead>
                    <TableHead>Provider</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Last heartbeat</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {forwarders.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center text-muted-foreground">
                        No log forwarders configured.
                      </TableCell>
                    </TableRow>
                  ) : (
                    forwarders.map((forwarder) => (
                      <TableRow key={forwarder.id}>
                        <TableCell>
                          <div className="font-medium">{forwarder.destination}</div>
                          <div className="text-xs text-muted-foreground">{forwarder.notes ?? ""}</div>
                        </TableCell>
                        <TableCell>{forwarder.provider ?? "—"}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className={forwarderTone[forwarder.status]}>
                            {forwarder.status}
                          </Badge>
                        </TableCell>
                        <TableCell>{formatDateTime(forwarder.lastHeartbeatAt)}</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

type SummaryCardProps = {
  icon: ReactNode;
  label: string;
  value: string | number;
  subtext: string;
};

function SummaryCard({ icon, label, value, subtext }: SummaryCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{label}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-semibold">{value}</div>
        <p className="text-xs text-muted-foreground">{subtext}</p>
      </CardContent>
    </Card>
  );
}
