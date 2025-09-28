import { PageHeader } from "@/components/app/page-header";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { cn } from "@/lib/utils";

type StatusToken = "healthy" | "watch" | "critical" | "maintenance";
type TrendToken = "positive" | "negative" | "neutral";

const STATUS_BADGE_CLASSES: Record<StatusToken, string> = {
  healthy: "border-emerald-200 bg-emerald-100 text-emerald-700",
  watch: "border-amber-200 bg-amber-100 text-amber-700",
  critical: "border-rose-200 bg-rose-100 text-rose-700",
  maintenance: "border-slate-200 bg-slate-100 text-slate-700",
};

const STATUS_LABELS: Record<StatusToken, string> = {
  healthy: "Healthy",
  watch: "Watch",
  critical: "Critical",
  maintenance: "Maintenance",
};

type SummaryMetric = {
  id: string;
  label: string;
  value: string;
  change: string;
  trend: TrendToken;
  window: string;
};

type ObservabilityDiscipline = "logs" | "metrics" | "traces";

type TelemetryStream = {
  id: string;
  name: string;
  status: StatusToken;
  signal: string;
  window: string;
  volume: string;
  lastChange: string;
  owner: string;
  runbook: string;
  notes: string;
};

type StackIntegration = {
  id: string;
  tool: string;
  focus: string;
  coverage: string[];
  status: StatusToken;
  lastHeartbeat: string;
  dashboards: string[];
  owner: string;
  runbook: string;
};

type DomainSlo = {
  id: string;
  domain: string;
  indicator: string;
  target: string;
  actual: string;
  window: string;
  status: StatusToken;
  burnRate: string;
  notes: string;
};

type SeverityToken = "critical" | "high" | "warning";

type AlertStream = {
  id: string;
  name: string;
  severity: SeverityToken;
  condition: string;
  route: string[];
  status: StatusToken;
  onCall: string;
  lastTriggered: string;
  notes: string;
};

type EscalationLayer = {
  id: string;
  level: string;
  scope: string;
  actions: string[];
  response: string;
  owner: string;
};

type IncidentRecord = {
  id: string;
  title: string;
  startedAt: string;
  duration: string;
  impact: string;
  status: string;
  runbook: string;
  summary: string;
  followUp: string[];
};

const SUMMARY_METRICS: SummaryMetric[] = [
  {
    id: "log-volume",
    label: "Log volume (24h)",
    value: "4.3M events",
    change: "+12% vs prior window",
    trend: "positive",
    window: "Last 24 hours",
  },
  {
    id: "alert-mttr",
    label: "Alert MTTR",
    value: "11 minutes",
    change: "-3m vs trailing week",
    trend: "positive",
    window: "Critical and high alerts",
  },
  {
    id: "trace-coverage",
    label: "Trace coverage",
    value: "87% of control plane calls",
    change: "+4 pts vs target",
    trend: "positive",
    window: "Primary services",
  },
  {
    id: "slo-burn",
    label: "Error budget burn",
    value: "0.6x",
    change: "-0.2x vs 28d avg",
    trend: "positive",
    window: "Rolling 7 day",
  },
];

const TELEMETRY_PANELS: Record<ObservabilityDiscipline, TelemetryStream[]> = {
  logs: [
    {
      id: "ingress",
      name: "Ingress service",
      status: "watch",
      signal: "5xx rate > 0.8% (5m)",
      window: "Datadog monitor",
      volume: "168k events per hour",
      lastChange: "Alert cleared 14 minutes ago",
      owner: "Platform on-call",
      runbook: "docs/runbooks/ingress-errors.md",
      notes: "Retry storm detected from NA dispatch nodes. Rate limited at the edge while fix rolls out.",
    },
    {
      id: "print-workers",
      name: "Print workers",
      status: "healthy",
      signal: "Job failure < 0.2% (15m)",
      window: "Grafana Loki",
      volume: "92k events per hour",
      lastChange: "No anomalies in 36 hours",
      owner: "Print operations",
      runbook: "docs/runbooks/print-worker-retries.md",
      notes: "Sampled logs shipped to S3 for cold retention after 30 days.",
    },
    {
      id: "finance-ledger",
      name: "Finance ledger",
      status: "healthy",
      signal: "Reconciliation errors",
      window: "Loki query alerts",
      volume: "41k events per hour",
      lastChange: "Last action 2 days ago",
      owner: "Finance engineering",
      runbook: "docs/runbooks/finance-ledger.md",
      notes: "Ledger reconciliation alerts auto-sync to Jira FIN-Alerts board.",
    },
  ],
  metrics: [
    {
      id: "control-plane-latency",
      name: "Control plane latency",
      status: "watch",
      signal: "p95 > 1.8s (1h burn 14d)",
      window: "Datadog SLO",
      volume: "32k requests per minute",
      lastChange: "SLO warning fired 28 minutes ago",
      owner: "Platform SRE",
      runbook: "docs/runbooks/control-plane-latency.md",
      notes: "Synthetic checks from iad and dub agree with elevated latency.",
    },
    {
      id: "print-success",
      name: "Print job success",
      status: "healthy",
      signal: "Success >= 99.5% (day)",
      window: "Grafana dashboard",
      volume: "11.4k jobs per hour",
      lastChange: "Healthy since 2025-02-16",
      owner: "Print operations",
      runbook: "docs/runbooks/print-job-health.md",
      notes: "Alert pairs with escalation matrix level L2 when burn rate > 2x.",
    },
    {
      id: "finance-clearing",
      name: "Finance clearing backlog",
      status: "critical",
      signal: "Queue depth > 750 (15m)",
      window: "Grafana cloud",
      volume: "3.2k settlements per hour",
      lastChange: "Escalation triggered 6 minutes ago",
      owner: "Finance engineering",
      runbook: "docs/runbooks/finance-clearing-backlog.md",
      notes: "Failover to backup clearinghouse in progress, track incident OMS-427.",
    },
  ],
  traces: [
    {
      id: "order-lifecycle",
      name: "Order lifecycle",
      status: "healthy",
      signal: "Trace coverage 93%",
      window: "Honeycomb board",
      volume: "14k traces per hour",
      lastChange: "No missing spans detected in 48 hours",
      owner: "Platform observability",
      runbook: "docs/runbooks/order-lifecycle-tracing.md",
      notes: "Critical path spans annotated with tenant and region dimensions.",
    },
    {
      id: "shipping-label",
      name: "Shipping label generation",
      status: "watch",
      signal: "Span error ratio 0.6%",
      window: "Honeycomb",
      volume: "9.2k traces per hour",
      lastChange: "Instrumented new carrier adapter 3 hours ago",
      owner: "Shipping squad",
      runbook: "docs/runbooks/shipping-latency.md",
      notes: "Carrier SLA breaches link back to this trace using trace_id tag.",
    },
    {
      id: "finance-settlement",
      name: "Finance settlement pipeline",
      status: "critical",
      signal: "Missing spans for ledger-writer",
      window: "OpenTelemetry collector",
      volume: "4.6k traces per hour",
      lastChange: "Collector restart under investigation",
      owner: "Finance engineering",
      runbook: "docs/runbooks/tracing-pipeline.md",
      notes: "Traces dropping at 14%. Check OTLP exporter queue depth metrics.",
    },
  ],
};

const STACK_INTEGRATIONS: StackIntegration[] = [
  {
    id: "grafana",
    tool: "Grafana Cloud",
    focus: "Dashboards and SLOs",
    coverage: ["Production", "Staging"],
    status: "healthy",
    lastHeartbeat: "Synced 3 minutes ago",
    dashboards: [
      "OMS Control Plane",
      "Print Operations",
      "Finance Clearing",
    ],
    owner: "Platform observability",
    runbook: "docs/integrations/grafana.md",
  },
  {
    id: "datadog",
    tool: "Datadog",
    focus: "Metrics and monitors",
    coverage: ["Production", "QA"],
    status: "watch",
    lastHeartbeat: "API quota at 78% (resets midnight UTC)",
    dashboards: [
      "Control Plane Latency Monitor",
      "Dispatch Synthetic Checks",
    ],
    owner: "SRE guild",
    runbook: "docs/integrations/datadog.md",
  },
  {
    id: "honeycomb",
    tool: "Honeycomb",
    focus: "Distributed tracing",
    coverage: ["Production"],
    status: "healthy",
    lastHeartbeat: "Collector heartbeats at 100%",
    dashboards: ["Order Lifecycle", "Finance Settlement"],
    owner: "Platform observability",
    runbook: "docs/integrations/honeycomb.md",
  },
  {
    id: "pagerduty",
    tool: "PagerDuty",
    focus: "Alert routing",
    coverage: ["Production"],
    status: "maintenance",
    lastHeartbeat: "Change freeze scheduled 2025-02-22",
    dashboards: ["OMS Primary", "Finance On-call"],
    owner: "Incident response",
    runbook: "docs/integrations/pagerduty.md",
  },
];

const DOMAIN_SLOS: DomainSlo[] = [
  {
    id: "print-slo",
    domain: "Print",
    indicator: "Label generation success",
    target: "99.5%",
    actual: "99.1%",
    window: "28 day rolling",
    status: "watch",
    burnRate: "1.4x (fast lane)",
    notes: "Retry queue drain is slowing in us-east-1. Tracking incident OMS-427 for risk reduction.",
  },
  {
    id: "shipping-slo",
    domain: "Shipping",
    indicator: "Carrier API latency p95",
    target: "< 1.2 s",
    actual: "0.9 s",
    window: "7 day rolling",
    status: "healthy",
    burnRate: "0.4x",
    notes: "Carrier failover runbook executed 2025-02-16 to add UPS backup. Synthetic checks green.",
  },
  {
    id: "finance-slo",
    domain: "Finance",
    indicator: "Settlement completion in 30m",
    target: "99%",
    actual: "96%",
    window: "14 day rolling",
    status: "critical",
    burnRate: "2.8x",
    notes: "Clearing backlog runbook live. Finance on-call coordinating with clearinghouse vendor.",
  },
];

const SEVERITY_BADGE_CLASSES: Record<SeverityToken, string> = {
  critical: "border-rose-300 bg-rose-100 text-rose-700",
  high: "border-orange-300 bg-orange-100 text-orange-700",
  warning: "border-amber-200 bg-amber-100 text-amber-700",
};

const ALERT_STREAMS: AlertStream[] = [
  {
    id: "control-plane",
    name: "Control plane latency > 2s (5m)",
    severity: "critical",
    condition: "Datadog burn-rate 14d/1h > 1",
    route: ["PagerDuty: OMS Primary", "Slack: #oms-alerts"],
    status: "watch",
    onCall: "Priya (Week 8 rotation)",
    lastTriggered: "Active, acknowledged 4 minutes ago",
    notes: "Escalates to duty manager if unacked for 10 minutes.",
  },
  {
    id: "print-error",
    name: "Print job failure > 0.5%",
    severity: "high",
    condition: "Grafana alert rule OMS-print-errors",
    route: ["PagerDuty: Print Secondary", "Email: print-ops@omspoint.com"],
    status: "healthy",
    onCall: "Marcus",
    lastTriggered: "Resolved 2025-02-16 06:22 UTC",
    notes: "Auto-triggers backlog cleanup workflow when open > 30 minutes.",
  },
  {
    id: "finance-backlog",
    name: "Finance clearing backlog > 500",
    severity: "critical",
    condition: "Grafana dashboard panel threshold",
    route: ["PagerDuty: Finance Primary", "Slack: #finance-ops"],
    status: "critical",
    onCall: "Lena",
    lastTriggered: "Firing since 6 minutes",
    notes: "Coordinates with clearinghouse vendor MajorSupport within 15 minutes.",
  },
];

const ESCALATION_MATRIX: EscalationLayer[] = [
  {
    id: "l1",
    level: "L1",
    scope: "PagerDuty OMS Primary",
    actions: ["Acknowledge alert", "Engage responder in Slack"],
    response: "5 minutes",
    owner: "On-call engineer",
  },
  {
    id: "l2",
    level: "L2",
    scope: "Domain specialist",
    actions: ["Loop in domain channel", "Review domain runbook"],
    response: "10 minutes",
    owner: "Domain lead",
  },
  {
    id: "l3",
    level: "L3",
    scope: "Incident commander",
    actions: ["Open incident bridge", "Notify duty manager"],
    response: "15 minutes",
    owner: "Incident response lead",
  },
];

const INCIDENT_HISTORY: IncidentRecord[] = [
  {
    id: "oms-422",
    title: "Print queue saturation",
    startedAt: "2025-02-12 11:45 UTC",
    duration: "Mitigated in 32 minutes",
    impact: "Print jobs across NA region delayed up to 18 minutes.",
    status: "Postmortem scheduled",
    runbook: "docs/runbooks/print-queue-saturation.md",
    summary: "Kafka partition imbalance after deployment reduced consumer throughput.",
    followUp: [
      "Auto scale print-worker consumer group when lag > 5k",
      "Add alert for partition skew > 30%",
    ],
  },
  {
    id: "oms-427",
    title: "Finance clearing backlog",
    startedAt: "2025-02-18 04:12 UTC",
    duration: "Ongoing",
    impact: "Settlement queue exceeded 850 pending transactions.",
    status: "Active incident",
    runbook: "docs/runbooks/finance-clearing-backlog.md",
    summary: "Downstream clearinghouse applying manual verification gates causing retries.",
    followUp: [
      "Coordinate vendor maintenance window for bulk replay",
      "Publish customer comms template for finance delays",
    ],
  },
  {
    id: "oms-415",
    title: "Dispatch webhook delivery failures",
    startedAt: "2025-01-29 17:06 UTC",
    duration: "Resolved in 26 minutes",
    impact: "Dispatch updates retried for 3 high-volume tenants.",
    status: "Closed",
    runbook: "docs/runbooks/webhook-delivery.md",
    summary: "Expired TLS certificate on webhook proxy caused 401 responses from partner.",
    followUp: [
      "Automate certificate renewal via ACM",
      "Add canary webhook to detect 4xx spikes",
    ],
  },
];

export default function AdminObservabilityPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Observability"
        description="Track logs, metrics, traces, and alerts powering the OMS control plane."
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {SUMMARY_METRICS.map((metric) => (
          <Card key={metric.id}>
            <CardHeader className="space-y-1">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {metric.label}
              </CardTitle>
              <div className="text-2xl font-semibold text-foreground">{metric.value}</div>
            </CardHeader>
            <CardContent className="text-xs text-muted-foreground">
              <div className="flex items-center justify-between">
                <span>{metric.window}</span>
                <span
                  className={cn(
                    metric.trend === "positive" && "text-emerald-600",
                    metric.trend === "negative" && "text-rose-600",
                    metric.trend === "neutral" && "text-muted-foreground",
                    "font-medium"
                  )}
                >
                  {metric.change}
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Telemetry coverage</CardTitle>
          <CardDescription>
            Cross-check the critical signals across logs, metrics, and traces. Align runbooks with the
            observed health state.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Tabs defaultValue="logs" className="space-y-4">
            <TabsList className="w-full justify-start gap-2 overflow-x-auto">
              <TabsTrigger value="logs">Logs</TabsTrigger>
              <TabsTrigger value="metrics">Metrics</TabsTrigger>
              <TabsTrigger value="traces">Traces</TabsTrigger>
            </TabsList>
            {(Object.keys(TELEMETRY_PANELS) as ObservabilityDiscipline[]).map((discipline) => (
              <TabsContent key={discipline} value={discipline} className="space-y-4">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-1/4">Stream</TableHead>
                      <TableHead>Signal</TableHead>
                      <TableHead className="hidden lg:table-cell">Window</TableHead>
                      <TableHead className="hidden xl:table-cell">Volume</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="hidden xl:table-cell">Runbook</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {TELEMETRY_PANELS[discipline].map((stream) => (
                      <TableRow key={stream.id}>
                        <TableCell>
                          <div className="font-medium text-foreground">{stream.name}</div>
                          <div className="text-xs text-muted-foreground">{stream.owner}</div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm text-foreground">{stream.signal}</div>
                          <div className="text-xs text-muted-foreground">{stream.notes}</div>
                        </TableCell>
                        <TableCell className="hidden lg:table-cell text-sm text-muted-foreground">
                          {stream.window}
                        </TableCell>
                        <TableCell className="hidden xl:table-cell text-sm text-muted-foreground">
                          {stream.volume}
                        </TableCell>
                        <TableCell className="space-y-1">
                          <Badge
                            variant="outline"
                            className={cn("w-fit", STATUS_BADGE_CLASSES[stream.status])}
                          >
                            {STATUS_LABELS[stream.status]}
                          </Badge>
                          <div className="text-xs text-muted-foreground">{stream.lastChange}</div>
                        </TableCell>
                        <TableCell className="hidden xl:table-cell text-xs text-muted-foreground">
                          {stream.runbook}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TabsContent>
            ))}
          </Tabs>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Observability stack</CardTitle>
          <CardDescription>
            Integrate with Grafana, Datadog, Honeycomb, and PagerDuty to keep the OMS control plane visible end to
            end.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-1/5">Tool</TableHead>
                <TableHead>Focus</TableHead>
                <TableHead>Coverage</TableHead>
                <TableHead className="hidden lg:table-cell">Dashboards</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="hidden xl:table-cell">Owner</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {STACK_INTEGRATIONS.map((integration) => (
                <TableRow key={integration.id}>
                  <TableCell className="font-medium text-foreground">{integration.tool}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{integration.focus}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {integration.coverage.join(", ")}
                  </TableCell>
                  <TableCell className="hidden lg:table-cell text-sm text-muted-foreground">
                    <div className="space-y-1">
                      {integration.dashboards.map((dashboard) => (
                        <div key={dashboard}>{dashboard}</div>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell className="space-y-1">
                    <Badge
                      variant="outline"
                      className={cn("w-fit", STATUS_BADGE_CLASSES[integration.status])}
                    >
                      {STATUS_LABELS[integration.status]}
                    </Badge>
                    <div className="text-xs text-muted-foreground">{integration.lastHeartbeat}</div>
                    <div className="text-xs text-muted-foreground">Runbook: {integration.runbook}</div>
                  </TableCell>
                  <TableCell className="hidden xl:table-cell text-sm text-muted-foreground">
                    {integration.owner}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>SLIs and SLOs by domain</CardTitle>
          <CardDescription>
            Surface the control signals for print, shipping, and finance so the right teams can react before breach.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-1/6">Domain</TableHead>
                <TableHead>Indicator</TableHead>
                <TableHead>Target</TableHead>
                <TableHead>Actual</TableHead>
                <TableHead>Burn rate</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {DOMAIN_SLOS.map((slo) => (
                <TableRow key={slo.id}>
                  <TableCell className="font-medium text-foreground">{slo.domain}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    <div>{slo.indicator}</div>
                    <div className="text-xs text-muted-foreground">{slo.notes}</div>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">{slo.target}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{slo.actual}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{slo.burnRate}</TableCell>
                  <TableCell className="space-y-1">
                    <Badge variant="outline" className={cn("w-fit", STATUS_BADGE_CLASSES[slo.status])}>
                      {STATUS_LABELS[slo.status]}
                    </Badge>
                    <div className="text-xs text-muted-foreground">{slo.window}</div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Alert routing and escalation</CardTitle>
          <CardDescription>Define where alerts land and how the incident escalates when response lags.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-6 lg:grid-cols-2">
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-foreground">Active alert streams</h3>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-1/3">Alert</TableHead>
                  <TableHead>Route</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {ALERT_STREAMS.map((alert) => (
                  <TableRow key={alert.id}>
                    <TableCell>
                      <div className="font-medium text-foreground">{alert.name}</div>
                      <div className="text-xs text-muted-foreground">
                        {alert.condition}
                      </div>
                      <div className="text-xs text-muted-foreground">{alert.notes}</div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={cn("mb-2 w-fit", SEVERITY_BADGE_CLASSES[alert.severity])}
                      >
                        {alert.severity.toUpperCase()}
                      </Badge>
                      <div className="space-y-1 text-xs text-muted-foreground">
                        {alert.route.map((step) => (
                          <div key={step}>{step}</div>
                        ))}
                        <div className="font-medium text-foreground">On-call: {alert.onCall}</div>
                      </div>
                    </TableCell>
                    <TableCell className="space-y-1">
                      <Badge variant="outline" className={cn("w-fit", STATUS_BADGE_CLASSES[alert.status])}>
                        {STATUS_LABELS[alert.status]}
                      </Badge>
                      <div className="text-xs text-muted-foreground">{alert.lastTriggered}</div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-foreground">Escalation matrix</h3>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-1/6">Level</TableHead>
                  <TableHead>Scope</TableHead>
                  <TableHead>Actions</TableHead>
                  <TableHead>Response</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {ESCALATION_MATRIX.map((layer) => (
                  <TableRow key={layer.id}>
                    <TableCell className="font-medium text-foreground">{layer.level}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      <div>{layer.scope}</div>
                      <div className="text-xs text-muted-foreground">Owner: {layer.owner}</div>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      <ul className="list-disc pl-4">
                        {layer.actions.map((action) => (
                          <li key={action}>{action}</li>
                        ))}
                      </ul>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">{layer.response}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Incident history and runbooks</CardTitle>
          <CardDescription>
            Embed the recent incidents with quick links to runbooks so responders have context inside the admin
            surface.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Accordion type="single" collapsible className="space-y-2">
            {INCIDENT_HISTORY.map((incident) => (
              <AccordionItem key={incident.id} value={incident.id}>
                <AccordionTrigger>
                  <div className="flex flex-col text-left">
                    <span className="font-semibold text-foreground">{incident.title}</span>
                    <span className="text-xs text-muted-foreground">
                      {incident.startedAt} · {incident.status}
                    </span>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-3 text-sm text-muted-foreground">
                    <div>
                      <span className="font-medium text-foreground">Impact:</span> {incident.impact}
                    </div>
                    <div>
                      <span className="font-medium text-foreground">Timeline:</span> {incident.duration}
                    </div>
                    <div>
                      <span className="font-medium text-foreground">Summary:</span> {incident.summary}
                    </div>
                    <div>
                      <span className="font-medium text-foreground">Runbook:</span> {incident.runbook}
                    </div>
                    <div>
                      <span className="font-medium text-foreground">Follow ups:</span>
                      <ul className="list-disc pl-4">
                        {incident.followUp.map((item) => (
                          <li key={item}>{item}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </CardContent>
      </Card>
    </div>
  );
}

