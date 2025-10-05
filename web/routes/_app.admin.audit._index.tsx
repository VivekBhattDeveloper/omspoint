import { type ReactNode, useEffect, useMemo, useState } from "react";
import type { Route } from "./+types/_app.admin.audit._index";
import { PageHeader } from "@/components/app/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  Clock3,
  Download,
  FileSpreadsheet,
  Filter,
  History,
  ShieldCheck,
} from "lucide-react";

type AuditSeverity = "info" | "warning" | "critical";

type AuditEventStatus = "recorded" | "awaiting_approval" | "rejected";

type AuditChannel = "Console" | "API" | "Automated Workflow";

type AuditEvent = {
  id: string;
  timestamp: string;
  actor: string;
  actorRole: string;
  model: string;
  action: string;
  target: string;
  status: AuditEventStatus;
  severity: AuditSeverity;
  channel: AuditChannel;
  diffSummary: string;
  changeTicket?: string;
  evidencePack?: string;
};

type ComplianceExport = {
  id: string;
  name: string;
  description: string;
  coverage: string;
  formats: string[];
  lastGenerated: string;
  owner: string;
  status: "ready" | "in_progress";
};

type ScheduledReport = {
  id: string;
  name: string;
  audience: string;
  frequency: string;
  nextRun: string;
  channel: "SFTP" | "Email" | "Webhook";
  format: string;
  owner: string;
  status: "active" | "paused";
};

type ApprovalRiskLevel = "low" | "medium" | "high";

type ApprovalRequest = {
  id: string;
  title: string;
  submittedBy: string;
  submittedAt: string;
  policy: string;
  risk: ApprovalRiskLevel;
  context: string;
  pendingApprovers: string[];
  evidence: string;
  status: "pending" | "approved" | "rejected";
};

type ControlCheckpoint = {
  id: string;
  name: string;
  control: string;
  owner: string;
  status: "met" | "gaps" | "monitoring";
  lastValidated: string;
  coverage: string;
  notes: string;
};

const auditFormatter = new Intl.DateTimeFormat("en-US", {
  dateStyle: "medium",
  timeStyle: "short",
  timeZone: "UTC",
});

const SEVERITY_BADGES: Record<AuditSeverity, string> = {
  info: "border-slate-200 bg-slate-100 text-slate-700",
  warning: "border-amber-200 bg-amber-100 text-amber-700",
  critical: "border-rose-200 bg-rose-100 text-rose-700",
};

const STATUS_BADGES: Record<AuditEventStatus, string> = {
  recorded: "border-emerald-200 bg-emerald-100 text-emerald-700",
  awaiting_approval: "border-amber-200 bg-amber-50 text-amber-700",
  rejected: "border-rose-200 bg-rose-50 text-rose-700",
};

const REPORT_STATUS_BADGES: Record<ScheduledReport["status"], string> = {
  active: "border-emerald-200 bg-emerald-100 text-emerald-700",
  paused: "border-slate-200 bg-slate-100 text-slate-700",
};

const RISK_BADGES: Record<ApprovalRiskLevel, string> = {
  low: "border-emerald-200 bg-emerald-100 text-emerald-700",
  medium: "border-amber-200 bg-amber-100 text-amber-700",
  high: "border-rose-200 bg-rose-100 text-rose-700",
};

const parseStringArray = (value: unknown): string[] => {
  if (Array.isArray(value)) {
    return value.map((entry) => (typeof entry === "string" ? entry : String(entry))).filter(Boolean);
  }
  if (typeof value === "string") {
    return value
      .split(",")
      .map((entry) => entry.trim())
      .filter(Boolean);
  }
  return [];
};

const toAuditChannel = (value: unknown): AuditChannel => {
  if (value === "API" || value === "Console" || value === "Automated Workflow") {
    return value;
  }
  if (typeof value !== "string") {
    return "Console";
  }
  const normalized = value.replace(/[_-]/g, " ").trim().toLowerCase();
  if (normalized === "api") {
    return "API";
  }
  if (normalized === "automated workflow") {
    return "Automated Workflow";
  }
  return "Console";
};

const toAuditStatus = (value: unknown): AuditEventStatus => {
  switch (value) {
    case "awaiting_approval":
      return "awaiting_approval";
    case "rejected":
      return "rejected";
    case "recorded":
    default:
      return "recorded";
  }
};

const toAuditSeverity = (value: unknown): AuditSeverity => {
  switch (value) {
    case "warning":
      return "warning";
    case "critical":
      return "critical";
    default:
      return "info";
  }
};

const toApprovalRisk = (value: unknown): ApprovalRiskLevel => {
  switch (value) {
    case "medium":
      return "medium";
    case "high":
      return "high";
    default:
      return "low";
  }
};

const toApprovalStatus = (value: unknown): ApprovalRequest["status"] => {
  switch (value) {
    case "approved":
      return "approved";
    case "rejected":
      return "rejected";
    default:
      return "pending";
  }
};

const toComplianceStatus = (value: unknown): ComplianceExport["status"] => {
  return value === "in_progress" ? "in_progress" : "ready";
};

const toScheduledReportStatus = (value: unknown): ScheduledReport["status"] => {
  return value === "paused" ? "paused" : "active";
};

const toScheduledReportChannel = (value: unknown): ScheduledReport["channel"] => {
  if (value === "SFTP" || value === "Email" || value === "Webhook") {
    return value;
  }
  if (typeof value !== "string") {
    return "Email";
  }
  const upper = value.toUpperCase();
  if (upper === "SFTP") {
    return "SFTP";
  }
  if (upper === "WEBHOOK") {
    return "Webhook";
  }
  return "Email";
};

const toControlStatus = (value: unknown): ControlCheckpoint["status"] => {
  switch (value) {
    case "monitoring":
      return "monitoring";
    case "gaps":
      return "gaps";
    default:
      return "met";
  }
};

export const loader = async ({ context }: Route.LoaderArgs) => {
  const api = context.api as Record<string, unknown>;

  const auditPromise = (api.auditEvent as { findMany?: (args: unknown) => Promise<unknown> } | undefined)?.findMany?.({
    select: {
      id: true,
      timestamp: true,
      actor: true,
      actorRole: true,
      model: true,
      action: true,
      target: true,
      status: true,
      severity: true,
      channel: true,
      diffSummary: true,
      changeTicket: true,
      evidencePack: true,
    },
    sort: { timestamp: "Descending" },
    first: 250,
  });

  const compliancePromise = (api.complianceExport as { findMany?: (args: unknown) => Promise<unknown> } | undefined)?.findMany?.({
    select: {
      id: true,
      name: true,
      description: true,
      coverage: true,
      formats: true,
      lastGenerated: true,
      owner: true,
      status: true,
    },
    sort: { lastGenerated: "Descending" },
    first: 100,
  });

  const reportsPromise = (api.scheduledReport as { findMany?: (args: unknown) => Promise<unknown> } | undefined)?.findMany?.({
    select: {
      id: true,
      name: true,
      audience: true,
      frequency: true,
      nextRun: true,
      channel: true,
      format: true,
      owner: true,
      status: true,
    },
    sort: { nextRun: "Ascending" },
    first: 100,
  });

  const approvalsPromise = (api.approvalRequest as { findMany?: (args: unknown) => Promise<unknown> } | undefined)?.findMany?.({
    select: {
      id: true,
      title: true,
      submittedBy: true,
      submittedAt: true,
      policy: true,
      risk: true,
      context: true,
      pendingApprovers: true,
      evidence: true,
      status: true,
    },
    sort: { submittedAt: "Descending" },
    first: 100,
  });

  const controlsPromise = (api.controlCheckpoint as { findMany?: (args: unknown) => Promise<unknown> } | undefined)?.findMany?.({
    select: {
      id: true,
      name: true,
      control: true,
      owner: true,
      status: true,
      lastValidated: true,
      coverage: true,
      notes: true,
    },
    sort: { name: "Ascending" },
    first: 100,
  });

  const [auditRecords = [], complianceRecords = [], reportRecords = [], approvalRecords = [], controlRecords = []] = await Promise.all([
    auditPromise?.catch(() => []) ?? [],
    compliancePromise?.catch(() => []) ?? [],
    reportsPromise?.catch(() => []) ?? [],
    approvalsPromise?.catch(() => []) ?? [],
    controlsPromise?.catch(() => []) ?? [],
  ]);

  const auditEvents: AuditEvent[] = (Array.isArray(auditRecords) ? auditRecords : []).map((record: any, index: number) => ({
    id: record?.id ?? `event-${index + 1}`,
    timestamp: typeof record?.timestamp === "string" ? record.timestamp : new Date().toISOString(),
    actor: record?.actor ?? "Unknown actor",
    actorRole: record?.actorRole ?? "Unknown role",
    model: record?.model ?? "Unknown model",
    action: record?.action ?? "Took action",
    target: record?.target ?? "unknown-target",
    status: toAuditStatus(record?.status),
    severity: toAuditSeverity(record?.severity),
    channel: toAuditChannel(record?.channel),
    diffSummary: record?.diffSummary ?? "No summary provided",
    changeTicket: record?.changeTicket ?? undefined,
    evidencePack: record?.evidencePack ?? undefined,
  }));

  const complianceExports: ComplianceExport[] = (Array.isArray(complianceRecords) ? complianceRecords : []).map(
    (record: any, index: number) => ({
      id: record?.id ?? `export-${index + 1}`,
      name: record?.name ?? "Compliance export",
      description: record?.description ?? "",
      coverage: record?.coverage ?? "",
      formats: parseStringArray(record?.formats),
      lastGenerated: typeof record?.lastGenerated === "string" ? record.lastGenerated : undefined,
      owner: record?.owner ?? "",
      status: toComplianceStatus(record?.status),
    })
  );

  const scheduledReports: ScheduledReport[] = (Array.isArray(reportRecords) ? reportRecords : []).map(
    (record: any, index: number) => ({
      id: record?.id ?? `report-${index + 1}`,
      name: record?.name ?? "Scheduled report",
      audience: record?.audience ?? "",
      frequency: record?.frequency ?? "",
      nextRun: typeof record?.nextRun === "string" ? record.nextRun : undefined,
      channel: toScheduledReportChannel(record?.channel),
      format: record?.format ?? "",
      owner: record?.owner ?? "",
      status: toScheduledReportStatus(record?.status),
    })
  );

  const approvalRequests: ApprovalRequest[] = (Array.isArray(approvalRecords) ? approvalRecords : []).map(
    (record: any, index: number) => ({
      id: record?.id ?? `approval-${index + 1}`,
      title: record?.title ?? "Approval request",
      submittedBy: record?.submittedBy ?? "Unknown",
      submittedAt: typeof record?.submittedAt === "string" ? record.submittedAt : new Date().toISOString(),
      policy: record?.policy ?? "",
      risk: toApprovalRisk(record?.risk),
      context: record?.context ?? "",
      pendingApprovers: parseStringArray(record?.pendingApprovers),
      evidence: record?.evidence ?? "",
      status: toApprovalStatus(record?.status),
    })
  );

  const controlCheckpoints: ControlCheckpoint[] = (Array.isArray(controlRecords) ? controlRecords : []).map(
    (record: any, index: number) => ({
      id: record?.id ?? `control-${index + 1}`,
      name: record?.name ?? "Control checkpoint",
      control: record?.control ?? "",
      owner: record?.owner ?? "",
      status: toControlStatus(record?.status),
      lastValidated: typeof record?.lastValidated === "string" ? record.lastValidated : undefined,
      coverage: record?.coverage ?? "",
      notes: record?.notes ?? "",
    })
  );

  return {
    auditEvents,
    complianceExports,
    scheduledReports,
    approvalRequests,
    controlCheckpoints,
  };
};






export default function AdminAuditPage({ loaderData }: Route.ComponentProps) {
  const {
    auditEvents = [],
    complianceExports = [],
    scheduledReports = [],
    approvalRequests = [],
    controlCheckpoints = [],
  } = loaderData ?? {};

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedActor, setSelectedActor] = useState("all");
  const [selectedModel, setSelectedModel] = useState("all");
  const [selectedChannel, setSelectedChannel] = useState("all");
  const [onlyPendingApprovals, setOnlyPendingApprovals] = useState(false);
  const [approvals, setApprovals] = useState(approvalRequests);

  useEffect(() => {
    setApprovals(approvalRequests);
  }, [approvalRequests]);

  const totalEvents = auditEvents.length;
  const pendingEvents = auditEvents.filter((event) => event.status === "awaiting_approval").length;
  const criticalEvents = auditEvents.filter((event) => event.severity === "critical").length;
  const evidenceCoverage = auditEvents.filter((event) => event.evidencePack).length;
  const evidenceRatioDisplay = totalEvents > 0 ? `${evidenceCoverage}/${totalEvents}` : "0/0";

  const actors = useMemo(
    () => Array.from(new Set(auditEvents.map((event) => event.actor))).sort(),
    [auditEvents],
  );
  const models = useMemo(
    () => Array.from(new Set(auditEvents.map((event) => event.model))).sort(),
    [auditEvents],
  );
  const channels = useMemo(
    () => Array.from(new Set(auditEvents.map((event) => event.channel))).sort(),
    [auditEvents],
  );

  const filteredEvents = useMemo(() => {
    return auditEvents.filter((event) => {
      if (onlyPendingApprovals && event.status !== "awaiting_approval") {
        return false;
      }
      if (selectedActor !== "all" && event.actor !== selectedActor) {
        return false;
      }
      if (selectedModel !== "all" && event.model !== selectedModel) {
        return false;
      }
      if (selectedChannel !== "all" && event.channel !== selectedChannel) {
        return false;
      }
      if (!searchTerm) {
        return true;
      }

      const haystack = `${event.actor} ${event.actorRole} ${event.action} ${event.target} ${event.diffSummary} ${event.changeTicket ?? ""} ${event.evidencePack ?? ""}`.toLowerCase();
      return haystack.includes(searchTerm.toLowerCase());
    });
  }, [auditEvents, onlyPendingApprovals, searchTerm, selectedActor, selectedChannel, selectedModel]);

  const activeApprovals = approvals.filter((request) => request.status === "pending");

  const handleApprovalDecision = (id: string, decision: "approve" | "reject") => {
    setApprovals((prev) =>
      prev.map((request) => {
        if (request.id !== id) {
          return request;
        }

        return {
          ...request,
          status: decision === "approve" ? "approved" : "rejected",
        };
      }),
    );
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Audit & Reports"
        description="Centralize audit logs, compliance checkpoints, and operational reporting."
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <SummaryMetricCard
          label="Audit events captured"
          value={totalEvents.toString()}
          description="Past 7 days across Console, API, and automated workflows."
          icon={<History className="h-4 w-4" />}
        />
        <SummaryMetricCard
          label="Approvals awaiting action"
          value={pendingEvents.toString()}
          description="Changes paused until policy approvers sign off."
          tone={pendingEvents > 0 ? "warn" : "default"}
          icon={<Clock3 className="h-4 w-4" />}
        />
        <SummaryMetricCard
          label="Critical findings"
          value={criticalEvents.toString()}
          description="Requires immediate remediation or RCA."
          tone={criticalEvents > 0 ? "alert" : "default"}
          icon={<AlertTriangle className="h-4 w-4" />}
        />
        <SummaryMetricCard
          label="Evidence coverage"
          value={evidenceRatioDisplay}
          description="Events with linked attachments or control evidence."
          icon={<ShieldCheck className="h-4 w-4" />}
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.4fr_1fr]">
        <Card>
          <CardHeader className="flex flex-row items-start justify-between space-y-0">
            <div>
              <CardTitle>Compliance exports</CardTitle>
              <CardDescription>Design compliance-ready exports and dashboard-ready bundles.</CardDescription>
            </div>
            <Button size="sm" variant="outline">
              <Download className="mr-2 h-4 w-4" />
              Generate all
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            {complianceExports.map((exportPack) => (
              <div
                key={exportPack.id}
                className="rounded-lg border border-border p-4 transition hover:border-primary/40"
              >
                <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-foreground">{exportPack.name}</p>
                      <Badge variant="secondary">{exportPack.coverage}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{exportPack.description}</p>
                    <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                      <span>
                        Owned by <span className="font-medium text-foreground">{exportPack.owner}</span>
                      </span>
                      <Separator orientation="vertical" className="h-4" />
                      <span>Formats: {exportPack.formats.join(", ")}</span>
                      <Separator orientation="vertical" className="h-4" />
                      <span>
                        Last generated
                        {exportPack.lastGenerated
                          ? ` ${auditFormatter.format(new Date(exportPack.lastGenerated))}`
                          : " —"}
                      </span>
                    </div>
                  </div>
                  <Button size="sm" variant="outline" className="mt-2 md:mt-0">
                    <FileSpreadsheet className="mr-2 h-4 w-4" />
                    {exportPack.status === "in_progress" ? "In progress" : "Download"}
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Scheduled reports</CardTitle>
            <CardDescription>Generate scheduled reports for partners and regulators.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {scheduledReports.map((report) => (
              <div key={report.id} className="rounded-lg border border-border p-4">
                <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-foreground">{report.name}</p>
                      <Badge className={cn("capitalize", REPORT_STATUS_BADGES[report.status])}>{report.status}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{report.audience}</p>
                    <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                      <span>{report.frequency}</span>
                      <Separator orientation="vertical" className="h-4" />
                      <span>
                        Next run
                        {report.nextRun ? ` ${auditFormatter.format(new Date(report.nextRun))}` : " —"} via {report.channel}
                      </span>
                      <Separator orientation="vertical" className="h-4" />
                      <span>{report.format} export • Owner {report.owner}</span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      <Clock3 className="mr-2 h-4 w-4" />
                      Send test
                    </Button>
                    <Button size="sm" variant="outline">
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div className="space-y-1">
              <CardTitle>Audit log</CardTitle>
              <CardDescription>Provide searchable audit logs with user and model filters.</CardDescription>
            </div>
            <div className="flex w-full flex-col gap-3 lg:w-auto lg:flex-row lg:items-center">
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Filters apply instantly across the log.</span>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
            <div className="xl:col-span-2">
              <Label htmlFor="audit-search">Search</Label>
              <Input
                id="audit-search"
                placeholder="Search actor, action, ticket, or target"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="actor-filter">Actor</Label>
              <Select onValueChange={setSelectedActor} value={selectedActor}>
                <SelectTrigger id="actor-filter">
                  <SelectValue placeholder="All actors" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All actors</SelectItem>
                  {actors.map((actor) => (
                    <SelectItem key={actor} value={actor}>
                      {actor}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label htmlFor="model-filter">Model</Label>
              <Select onValueChange={setSelectedModel} value={selectedModel}>
                <SelectTrigger id="model-filter">
                  <SelectValue placeholder="All models" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All models</SelectItem>
                  {models.map((model) => (
                    <SelectItem key={model} value={model}>
                      {model}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label htmlFor="channel-filter">Channel</Label>
              <Select onValueChange={setSelectedChannel} value={selectedChannel}>
                <SelectTrigger id="channel-filter">
                  <SelectValue placeholder="All channels" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All channels</SelectItem>
                  {channels.map((channel) => (
                    <SelectItem key={channel} value={channel}>
                      {channel}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2 rounded-lg border border-border bg-muted/40 px-3 py-2">
              <Checkbox
                id="pending-only"
                checked={onlyPendingApprovals}
                onCheckedChange={(checked) => setOnlyPendingApprovals(checked === true)}
              />
              <Label htmlFor="pending-only" className="text-sm text-muted-foreground">
                Pending approvals only
              </Label>
            </div>
          </div>

          <div className="rounded-xl border border-border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[180px]">Timestamp</TableHead>
                  <TableHead>Actor</TableHead>
                  <TableHead>Model</TableHead>
                  <TableHead>Action</TableHead>
                  <TableHead>Channel</TableHead>
                  <TableHead className="w-[120px] text-right">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredEvents.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="py-8 text-center text-sm text-muted-foreground">
                      No audit events match the selected filters.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredEvents.map((event) => (
                    <TableRow key={event.id} className="align-top">
                      <TableCell>
                        <div className="space-y-1">
                          <p className="font-medium text-foreground">
                            {auditFormatter.format(new Date(event.timestamp))}
                          </p>
                          <p className="text-xs text-muted-foreground">{event.id}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-foreground">{event.actor}</span>
                            <Badge variant="secondary">{event.actorRole}</Badge>
                          </div>
                          <p className="text-xs text-muted-foreground">Target: {event.target}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <span className="text-sm font-medium text-foreground">{event.model}</span>
                          <Badge className={cn("w-fit", SEVERITY_BADGES[event.severity])}>{event.severity}</Badge>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <p className="text-sm text-foreground">{event.action}</p>
                          <p className="text-xs text-muted-foreground">{event.diffSummary}</p>
                          <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                            {event.changeTicket ? <span>Change ticket {event.changeTicket}</span> : null}
                            {event.evidencePack ? <span>Evidence {event.evidencePack}</span> : null}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-muted-foreground">{event.channel}</span>
                      </TableCell>
                      <TableCell className="text-right">
                        <Badge className={cn("w-fit", STATUS_BADGES[event.status])}>{event.status.replace("_", " ")}</Badge>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-start justify-between space-y-0">
            <div>
              <CardTitle>Approval workflows</CardTitle>
              <CardDescription>Capture approval workflows for sensitive changes.</CardDescription>
            </div>
            <Badge variant="outline" className="text-xs">
              {activeApprovals.length} pending
            </Badge>
          </CardHeader>
          <CardContent className="space-y-4">
            {activeApprovals.length === 0 ? (
              <div className="rounded-lg border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
                All sensitive changes were approved. Nothing requiring action right now.
              </div>
            ) : (
              activeApprovals.map((request) => (
                <div key={request.id} className="rounded-lg border border-border p-4">
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <p className="font-semibold text-foreground">{request.title}</p>
                          <Badge className={cn("capitalize", RISK_BADGES[request.risk])}>{request.risk} risk</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">Submitted by {request.submittedBy}</p>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {auditFormatter.format(new Date(request.submittedAt))}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">{request.context}</p>
                    <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                      <Badge variant="secondary">Policy: {request.policy}</Badge>
                      <Badge variant="secondary">Evidence: {request.evidence}</Badge>
                      <Badge variant="secondary">Needs {request.pendingApprovers.join(" & ")}</Badge>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleApprovalDecision(request.id, "reject")}
                      >
                        <AlertTriangle className="mr-2 h-4 w-4" />
                        Request changes
                      </Button>
                      <Button size="sm" onClick={() => handleApprovalDecision(request.id, "approve")}>
                        <CheckCircle2 className="mr-2 h-4 w-4" />
                        Approve
                      </Button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Control checkpoints</CardTitle>
            <CardDescription>Track compliance checkpoints with dashboards for assurance.</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="access">
              <TabsList className="grid grid-cols-3">
                <TabsTrigger value="access">Access</TabsTrigger>
                <TabsTrigger value="vendors">Vendors</TabsTrigger>
                <TabsTrigger value="finance">Finance</TabsTrigger>
              </TabsList>
              <TabsContent value="access" className="space-y-4">
                {controlCheckpoints.filter((checkpoint) =>
                  ["ctl-identity", "ctl-routing"].includes(checkpoint.id),
                ).map((checkpoint) => (
                  <ControlCard key={checkpoint.id} checkpoint={checkpoint} />
                ))}
              </TabsContent>
              <TabsContent value="vendors" className="space-y-4">
                {controlCheckpoints.filter((checkpoint) =>
                  ["ctl-vendor"].includes(checkpoint.id),
                ).map((checkpoint) => (
                  <ControlCard key={checkpoint.id} checkpoint={checkpoint} />
                ))}
              </TabsContent>
              <TabsContent value="finance" className="space-y-4">
                {controlCheckpoints.filter((checkpoint) =>
                  ["ctl-finance"].includes(checkpoint.id),
                ).map((checkpoint) => (
                  <ControlCard key={checkpoint.id} checkpoint={checkpoint} />
                ))}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

type SummaryMetricCardProps = {
  label: string;
  value: string;
  description: string;
  icon: ReactNode;
  tone?: "default" | "warn" | "alert";
};

function SummaryMetricCard({ label, value, description, icon, tone = "default" }: SummaryMetricCardProps) {
  const toneClasses: Record<NonNullable<SummaryMetricCardProps["tone"]>, string> = {
    default: "border-border",
    warn: "border-amber-300/60",
    alert: "border-rose-400/60",
  };

  return (
    <Card className={cn("border", toneClasses[tone])}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{label}</CardTitle>
        <span className="text-muted-foreground">{icon}</span>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-semibold text-foreground">{value}</div>
        <p className="text-xs text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  );
}

type ControlCardProps = {
  checkpoint: ControlCheckpoint;
};

function ControlCard({ checkpoint }: ControlCardProps) {
  const controlBadgeClasses: Record<ControlCheckpoint["status"], string> = {
    met: "border-emerald-200 bg-emerald-100 text-emerald-700",
    monitoring: "border-amber-200 bg-amber-100 text-amber-700",
    gaps: "border-rose-200 bg-rose-100 text-rose-700",
  };

  return (
    <div className="rounded-lg border border-border p-4">
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <p className="font-semibold text-foreground">{checkpoint.name}</p>
              <Badge className={cn("capitalize", controlBadgeClasses[checkpoint.status])}>{checkpoint.status}</Badge>
            </div>
            <p className="text-sm text-muted-foreground">{checkpoint.control}</p>
          </div>
          <span className="text-xs text-muted-foreground">
            Last validated {auditFormatter.format(new Date(checkpoint.lastValidated))}
          </span>
        </div>
        <p className="text-sm text-muted-foreground">{checkpoint.notes}</p>
        <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
          <Badge variant="secondary">Owner {checkpoint.owner}</Badge>
          <Badge variant="secondary">Coverage {checkpoint.coverage}</Badge>
        </div>
      </div>
    </div>
  );
}
