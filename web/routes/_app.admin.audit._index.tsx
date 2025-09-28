import { type ReactNode, useMemo, useState } from "react";
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

const AUDIT_EVENTS: AuditEvent[] = [
  {
    id: "evt-2025-03-22-001",
    timestamp: "2025-03-22T16:18:00Z",
    actor: "Vivian Chu",
    actorRole: "Trust & Safety",
    model: "VendorCredential",
    action: "Rotated Stripe MBE credential",
    target: "stripe-mbe-us",
    status: "recorded",
    severity: "info",
    channel: "Console",
    diffSummary: "Updated client_id and scheduled next rotation for 90 days.",
    changeTicket: "CHG-9821",
    evidencePack: "EVID-4421",
  },
  {
    id: "evt-2025-03-22-002",
    timestamp: "2025-03-22T15:47:00Z",
    actor: "Omar Reyes",
    actorRole: "Finance Engineering",
    model: "PaymentHold",
    action: "Lifted automated hold on vendor payouts",
    target: "vendor-42-payouts",
    status: "awaiting_approval",
    severity: "warning",
    channel: "Console",
    diffSummary: "Threshold raised from $50k to $150k pending Controller sign-off.",
    changeTicket: "RISK-6143",
  },
  {
    id: "evt-2025-03-22-003",
    timestamp: "2025-03-22T14:09:00Z",
    actor: "Automation",
    actorRole: "Audit Workflow",
    model: "AccessReview",
    action: "Detected 2 stale admin sessions",
    target: "identity-platform",
    status: "recorded",
    severity: "warning",
    channel: "Automated Workflow",
    diffSummary: "Revoked sessions for users inactive > 30 days.",
    evidencePack: "EVID-4418",
  },
  {
    id: "evt-2025-03-21-004",
    timestamp: "2025-03-21T23:11:00Z",
    actor: "Elena Patel",
    actorRole: "Platform Ops",
    model: "RoutingPolicy",
    action: "Updated NA expedited SLA from 6h to 5h",
    target: "expedited-na",
    status: "awaiting_approval",
    severity: "warning",
    channel: "Console",
    diffSummary: "Policy requires dual approval (Ops + Finance).",
    changeTicket: "CHG-9815",
  },
  {
    id: "evt-2025-03-21-005",
    timestamp: "2025-03-21T17:44:00Z",
    actor: "Harper Mills",
    actorRole: "Security",
    model: "Secret",
    action: "Revoked deprecated S3 ingest token",
    target: "omspoint-ingest",
    status: "recorded",
    severity: "info",
    channel: "API",
    diffSummary: "Token rotated with automated invalidation of downstream caches.",
    evidencePack: "EVID-4409",
  },
  {
    id: "evt-2025-03-21-006",
    timestamp: "2025-03-21T12:03:00Z",
    actor: "Automation",
    actorRole: "Audit Workflow",
    model: "VendorSLACheck",
    action: "Logged SLA breach for Coastal Print Co.",
    target: "vendor-coastal",
    status: "recorded",
    severity: "critical",
    channel: "Automated Workflow",
    diffSummary: "3 consecutive misses > 48h. Triggered remediation playbook.",
    changeTicket: "INC-7761",
    evidencePack: "EVID-4402",
  },
  {
    id: "evt-2025-03-21-007",
    timestamp: "2025-03-21T05:37:00Z",
    actor: "Mara Knight",
    actorRole: "Compliance",
    model: "PolicyException",
    action: "Granted temporary vendor exception",
    target: "vendor-northland",
    status: "recorded",
    severity: "warning",
    channel: "Console",
    diffSummary: "Exception auto-expires on 2025-04-04 with required follow-up.",
  },
  {
    id: "evt-2025-03-20-008",
    timestamp: "2025-03-20T21:52:00Z",
    actor: "Automation",
    actorRole: "Audit Workflow",
    model: "VendorOnboarding",
    action: "Flagged missing SOC 2 report",
    target: "vendor-velocity",
    status: "recorded",
    severity: "warning",
    channel: "Automated Workflow",
    diffSummary: "Assigned follow-up to vendor success for evidence capture.",
  },
  {
    id: "evt-2025-03-20-009",
    timestamp: "2025-03-20T18:24:00Z",
    actor: "Caleb Bryant",
    actorRole: "Logistics Lead",
    model: "RoutingPolicy",
    action: "Requested new fallback vendor",
    target: "standard-us",
    status: "awaiting_approval",
    severity: "warning",
    channel: "Console",
    diffSummary: "Policy change impacts priority weighting. Needs Ops review.",
  },
  {
    id: "evt-2025-03-20-010",
    timestamp: "2025-03-20T09:16:00Z",
    actor: "Harper Mills",
    actorRole: "Security",
    model: "Secret",
    action: "Attached SOC2 Evid pack",
    target: "audit-controls",
    status: "recorded",
    severity: "info",
    channel: "Console",
    diffSummary: "Uploaded 48 artifacts synced to trust center.",
    evidencePack: "EVID-4391",
  },
  {
    id: "evt-2025-03-19-011",
    timestamp: "2025-03-19T22:33:00Z",
    actor: "Automation",
    actorRole: "Audit Workflow",
    model: "AccessReview",
    action: "Closed loop on quarterly admin review",
    target: "admin-users",
    status: "recorded",
    severity: "info",
    channel: "Automated Workflow",
    diffSummary: "All 14 privileged accounts re-validated. Evidence archived.",
    evidencePack: "EVID-4387",
  },
  {
    id: "evt-2025-03-19-012",
    timestamp: "2025-03-19T11:05:00Z",
    actor: "Vivian Chu",
    actorRole: "Trust & Safety",
    model: "CaseAudit",
    action: "Reconciled escalation queue",
    target: "case-escalations",
    status: "recorded",
    severity: "info",
    channel: "Console",
    diffSummary: "Resolved 6 escalations with linked evidence bundles.",
  },
];

const COMPLIANCE_EXPORTS: ComplianceExport[] = [
  {
    id: "soc2-controls",
    name: "SOC 2 Controls Evidence",
    description: "Bundled policy attestations, change logs, and control tests for SOC 2 auditors.",
    coverage: "Controls CC1.1 - CC7.2",
    formats: ["ZIP", "CSV"],
    lastGenerated: "2025-03-18T04:22:00Z",
    owner: "Security",
    status: "ready",
  },
  {
    id: "vendor-risks",
    name: "Vendor Risk Register",
    description: "Consolidated vendor diligence notes, exceptions, and remediation plans.",
    coverage: "Active production vendors",
    formats: ["CSV", "XLSX"],
    lastGenerated: "2025-03-21T12:54:00Z",
    owner: "Vendor Success",
    status: "ready",
  },
  {
    id: "access-audit",
    name: "Privileged Access Review",
    description: "Evidence pack for quarterly admin access certification across OMS systems.",
    coverage: "Privileged identities",
    formats: ["PDF", "CSV"],
    lastGenerated: "2025-03-22T02:41:00Z",
    owner: "Compliance",
    status: "in_progress",
  },
];

const SCHEDULED_REPORTS: ScheduledReport[] = [
  {
    id: "reg-ny",
    name: "NYDFS Partner Export",
    audience: "Empire Bank",
    frequency: "Weekly (Mon 06:00 UTC)",
    nextRun: "2025-03-24T06:00:00Z",
    channel: "SFTP",
    format: "CSV",
    owner: "Finance Compliance",
    status: "active",
  },
  {
    id: "vendor-ops",
    name: "Vendor SLA Digest",
    audience: "Vendor Ops distribution",
    frequency: "Daily (01:30 UTC)",
    nextRun: "2025-03-23T01:30:00Z",
    channel: "Email",
    format: "PDF",
    owner: "Vendor Success",
    status: "active",
  },
  {
    id: "reg-ca",
    name: "Canada Remittance Certification",
    audience: "CRA",
    frequency: "Monthly (1st 09:00 UTC)",
    nextRun: "2025-04-01T09:00:00Z",
    channel: "Webhook",
    format: "JSON",
    owner: "Finance",
    status: "paused",
  },
];

const DEFAULT_APPROVALS: ApprovalRequest[] = [
  {
    id: "apr-2025-031",
    title: "Enable accelerated payout for vendor Velocity",
    submittedBy: "Omar Reyes",
    submittedAt: "2025-03-22T15:52:00Z",
    policy: "Finance change control",
    risk: "high",
    context: "Adjusts rolling reserve from 12% to 6% to avoid cashflow gaps.",
    pendingApprovers: ["Controller", "Risk"],
    evidence: "RISK-6143",
    status: "pending",
  },
  {
    id: "apr-2025-029",
    title: "Raise expedited SLA target in NA routing",
    submittedBy: "Elena Patel",
    submittedAt: "2025-03-21T23:18:00Z",
    policy: "Routing policy approvals",
    risk: "medium",
    context: "Customer escalations trending upward for priority merch.",
    pendingApprovers: ["Ops Director"],
    evidence: "CHG-9815",
    status: "pending",
  },
  {
    id: "apr-2025-024",
    title: "Extend exception for Northland capacity gap",
    submittedBy: "Mara Knight",
    submittedAt: "2025-03-21T05:41:00Z",
    policy: "Vendor exception workflow",
    risk: "low",
    context: "Vendor at 78% remediation. Needs 7 more days while automation completes.",
    pendingApprovers: ["Vendor Success"],
    evidence: "GOV-8811",
    status: "pending",
  },
];

const CONTROL_CHECKPOINTS: ControlCheckpoint[] = [
  {
    id: "ctl-identity",
    name: "Privileged identity review",
    control: "CC6.3 Access provisioning",
    owner: "Security",
    status: "met",
    lastValidated: "2025-03-19T22:33:00Z",
    coverage: "14 admins, 4 service accounts",
    notes: "All attestations and session logs archived to trust center.",
  },
  {
    id: "ctl-routing",
    name: "Routing policy change control",
    control: "CC2.1 Change management",
    owner: "Platform Ops",
    status: "monitoring",
    lastValidated: "2025-03-21T23:11:00Z",
    coverage: "6 active policies",
    notes: "Awaiting dual approval for expedited SLA update.",
  },
  {
    id: "ctl-vendor",
    name: "Vendor diligence evidence",
    control: "CC3.2 Vendor management",
    owner: "Vendor Success",
    status: "gaps",
    lastValidated: "2025-03-20T21:52:00Z",
    coverage: "18 production vendors",
    notes: "2 vendors missing SOC 2 doc uploads. Follow-up in progress.",
  },
  {
    id: "ctl-finance",
    name: "Finance ledger reconciliation",
    control: "CC1.2 Risk management",
    owner: "Finance",
    status: "met",
    lastValidated: "2025-03-21T12:03:00Z",
    coverage: "Rolling 30 days",
    notes: "Automated anomaly detection feeding into audit events.",
  },
];

export default function AdminAuditPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedActor, setSelectedActor] = useState("all");
  const [selectedModel, setSelectedModel] = useState("all");
  const [selectedChannel, setSelectedChannel] = useState("all");
  const [onlyPendingApprovals, setOnlyPendingApprovals] = useState(false);
  const [approvals, setApprovals] = useState(DEFAULT_APPROVALS);

  const totalEvents = AUDIT_EVENTS.length;
  const pendingEvents = AUDIT_EVENTS.filter((event) => event.status === "awaiting_approval").length;
  const criticalEvents = AUDIT_EVENTS.filter((event) => event.severity === "critical").length;
  const evidenceCoverage = AUDIT_EVENTS.filter((event) => event.evidencePack).length;

  const actors = useMemo(() => Array.from(new Set(AUDIT_EVENTS.map((event) => event.actor))).sort(), []);
  const models = useMemo(() => Array.from(new Set(AUDIT_EVENTS.map((event) => event.model))).sort(), []);
  const channels = useMemo(() => Array.from(new Set(AUDIT_EVENTS.map((event) => event.channel))).sort(), []);

  const filteredEvents = useMemo(() => {
    return AUDIT_EVENTS.filter((event) => {
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
  }, [onlyPendingApprovals, searchTerm, selectedActor, selectedChannel, selectedModel]);

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
          value={`${evidenceCoverage}/${totalEvents}`}
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
            {COMPLIANCE_EXPORTS.map((exportPack) => (
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
                      <span>Last generated {auditFormatter.format(new Date(exportPack.lastGenerated))}</span>
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
            {SCHEDULED_REPORTS.map((report) => (
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
                        Next run {auditFormatter.format(new Date(report.nextRun))} via {report.channel}
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
                {CONTROL_CHECKPOINTS.filter((checkpoint) =>
                  ["ctl-identity", "ctl-routing"].includes(checkpoint.id),
                ).map((checkpoint) => (
                  <ControlCard key={checkpoint.id} checkpoint={checkpoint} />
                ))}
              </TabsContent>
              <TabsContent value="vendors" className="space-y-4">
                {CONTROL_CHECKPOINTS.filter((checkpoint) =>
                  ["ctl-vendor"].includes(checkpoint.id),
                ).map((checkpoint) => (
                  <ControlCard key={checkpoint.id} checkpoint={checkpoint} />
                ))}
              </TabsContent>
              <TabsContent value="finance" className="space-y-4">
                {CONTROL_CHECKPOINTS.filter((checkpoint) =>
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
