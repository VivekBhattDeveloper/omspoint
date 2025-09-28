import { PageHeader } from "@/components/app/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  ArrowRight,
  CheckCircle2,
  Clock,
  Filter,
  Layers,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Users,
} from "lucide-react";

type GuardrailStatus = "healthy" | "attention" | "planning";
type TemplateStatus = "live" | "review" | "draft";
type ApprovalStatus = "approved" | "waiting" | "scheduled";

const summaryMetrics = [
  {
    label: "Active assortments",
    value: "12",
    hint: "Across 5 channels",
    icon: Layers,
  },
  {
    label: "Guardrail coverage",
    value: "92%",
    hint: "Brand + regulatory",
    icon: ShieldCheck,
  },
  {
    label: "Pending approvals",
    value: "4",
    hint: "Awaiting channel sign-off",
    icon: Users,
  },
  {
    label: "Templates in flight",
    value: "6",
    hint: "Seasonal & always-on",
    icon: Sparkles,
  },
];

const templateRows: Array<{
  name: string;
  cadence: string;
  channels: string;
  guardrails: string;
  owner: string;
  status: TemplateStatus;
}> = [
  {
    name: "Marketplace essentials",
    cadence: "Always-on core catalog",
    channels: "Amazon • Walmart",
    guardrails: "Brand palette · Margin ≥ 25%",
    owner: "Jess M.",
    status: "live",
  },
  {
    name: "Seasonal spotlight",
    cadence: "Summer 2024 refresh",
    channels: "Shopify • Faire",
    guardrails: "New imagery · Exclude low inventory",
    owner: "Chris P.",
    status: "review",
  },
  {
    name: "Wholesale expansion",
    cadence: "Buyer-specific catalog",
    channels: "NuORDER",
    guardrails: "MOQ tiers · MSRP lock",
    owner: "Jamie L.",
    status: "draft",
  },
  {
    name: "Outlet clearance",
    cadence: "Bi-weekly rotation",
    channels: "Amazon Outlet",
    guardrails: "Aged inventory · Discount band",
    owner: "Taylor R.",
    status: "review",
  },
];

const guardrailPolicies: Array<{
  name: string;
  coverage: number;
  description: string;
  status: GuardrailStatus;
  gaps?: string[];
}> = [
  {
    name: "Brand compliance",
    coverage: 96,
    description: "Color, imagery, and copy blocks validated against brand library.",
    status: "healthy",
  },
  {
    name: "Margin threshold",
    coverage: 88,
    description: "Guardrail enforces blended margin ≥ 25% before publishing.",
    status: "attention",
    gaps: ["3 SKUs flagged below margin target", "Awaiting finance override for bundles"],
  },
  {
    name: "Logistics SLA",
    coverage: 72,
    description: "Pre-check lead times and carrier eligibility per channel.",
    status: "planning",
    gaps: ["Pending merchandising service SLA ingestion"],
  },
];

const roadmapMilestones: Array<{
  quarter: string;
  title: string;
  description: string;
  status: "In progress" | "Planned";
  actions: string[];
}> = [
  {
    quarter: "Q2",
    title: "Merchandising service integration",
    description: "Sync assortment eligibility, hierarchies, and guardrail policies from the upcoming merchandising API.",
    status: "In progress",
    actions: [
      "Map channel taxonomy to merchandising categories",
      "Pre-validate attribute filters before publish",
      "Enable event stream for guardrail breaches",
    ],
  },
  {
    quarter: "Q3",
    title: "Template automation",
    description: "Duplicate assortments per channel cadence with pre-set guardrails and launch windows.",
    status: "Planned",
    actions: [
      "Seasonal template generator",
      "Auto-sync to mappings & pricing services",
      "Preview channel deltas before approval",
    ],
  },
];

const approverTimeline: Array<{
  name: string;
  role: string;
  status: ApprovalStatus;
  note: string;
}> = [
  {
    name: "Jess M.",
    role: "Merchandising lead",
    status: "approved",
    note: "Approved 12 Apr · Guardrails locked for core SKUs",
  },
  {
    name: "Chris P.",
    role: "Channel operations",
    status: "waiting",
    note: "Needs review by 19 Apr · Validate Shopify launch window",
  },
  {
    name: "Legal review",
    role: "Brand & compliance",
    status: "scheduled",
    note: "Auto-trigger when merchandising service streams policy updates",
  },
];

const statusBadgeMap: Record<TemplateStatus, { label: string; variant: "secondary" | "outline" | "default" }> = {
  live: { label: "Live", variant: "secondary" },
  review: { label: "In review", variant: "outline" },
  draft: { label: "Draft", variant: "default" },
};

const guardrailStatusMap: Record<GuardrailStatus, { label: string; icon: typeof ShieldCheck; variant: "secondary" | "outline" | "destructive" }> = {
  healthy: { label: "Healthy", icon: ShieldCheck, variant: "secondary" },
  attention: { label: "Needs attention", icon: ShieldAlert, variant: "destructive" },
  planning: { label: "Planned", icon: Clock, variant: "outline" },
};

const approvalStatusMap: Record<ApprovalStatus, { label: string; variant: "secondary" | "outline" | "default" }> = {
  approved: { label: "Approved", variant: "secondary" },
  waiting: { label: "Awaiting review", variant: "default" },
  scheduled: { label: "Scheduled", variant: "outline" },
};

export default function SellerAssortmentsPage() {
  return (
    <div className="space-y-8">
      <PageHeader
        title="Assortments"
        description="Group catalog items into channel-specific assortments with guardrails and collaborative approvals."
        actions={
          <>
            <Button variant="outline" size="sm" className="hidden md:flex">
              <Filter className="h-4 w-4" />
              Apply filters
            </Button>
            <Button size="sm" className="md:px-6">
              New assortment
              <ArrowRight className="h-4 w-4" />
            </Button>
          </>
        }
      />

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {summaryMetrics.map((metric) => {
          const Icon = metric.icon;
          return (
            <Card key={metric.label}>
              <CardContent className="flex flex-col gap-3 p-5">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-muted-foreground">{metric.label}</p>
                    <p className="text-3xl font-semibold tracking-tight">{metric.value}</p>
                  </div>
                  <span className="rounded-full bg-muted p-2 text-muted-foreground">
                    <Icon className="h-5 w-5" />
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">{metric.hint}</p>
              </CardContent>
            </Card>
          );
        })}
      </section>

      <section className="grid gap-6 xl:grid-cols-[2fr_1fr]">
        <Card>
          <CardHeader className="pb-4">
            <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
              <div>
                <CardTitle>Assortment templates</CardTitle>
                <CardDescription>Use templates to launch channel-specific assortments with guardrails baked in.</CardDescription>
              </div>
              <Button variant="outline" size="sm">
                Duplicate template
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="min-w-[200px]">Template</TableHead>
                    <TableHead>Channels</TableHead>
                    <TableHead>Guardrails</TableHead>
                    <TableHead>Owner</TableHead>
                    <TableHead className="text-right">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {templateRows.map((template) => {
                    const badge = statusBadgeMap[template.status];
                    return (
                      <TableRow key={template.name}>
                        <TableCell>
                          <div className="space-y-1">
                            <p className="font-medium leading-none">{template.name}</p>
                            <p className="text-xs text-muted-foreground">{template.cadence}</p>
                          </div>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">{template.channels}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">{template.guardrails}</TableCell>
                        <TableCell className="text-sm">{template.owner}</TableCell>
                        <TableCell className="text-right">
                          <Badge variant={badge.variant}>{badge.label}</Badge>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        <Card className="h-full">
          <CardHeader>
            <CardTitle>Guardrail coverage</CardTitle>
            <CardDescription>Track enforced policies before pushing assortments to channels.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {guardrailPolicies.map((policy) => {
              const statusMeta = guardrailStatusMap[policy.status];
              const StatusIcon = statusMeta.icon;
              return (
                <div key={policy.name} className="rounded-lg border p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm font-medium">
                        <StatusIcon className="h-4 w-4 text-muted-foreground" />
                        <span>{policy.name}</span>
                      </div>
                      <p className="text-xs text-muted-foreground">{policy.description}</p>
                    </div>
                    <Badge variant={statusMeta.variant}>{statusMeta.label}</Badge>
                  </div>
                  <div className="mt-4 space-y-2">
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>Coverage</span>
                      <span>{policy.coverage}%</span>
                    </div>
                    <Progress value={policy.coverage} />
                  </div>
                  {policy.gaps ? (
                    <ul className="mt-3 space-y-2 text-xs text-muted-foreground">
                      {policy.gaps.map((gap) => (
                        <li key={gap} className="flex items-start gap-2">
                          <ShieldAlert className="mt-0.5 h-3.5 w-3.5 text-amber-500" />
                          <span>{gap}</span>
                        </li>
                      ))}
                    </ul>
                  ) : null}
                </div>
              );
            })}
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-6 xl:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Planning roadmap</CardTitle>
            <CardDescription>Sequence integration work with the merchandising service and channel teams.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {roadmapMilestones.map((milestone, index) => {
              const isLast = index === roadmapMilestones.length - 1;
              return (
                <div key={milestone.title} className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full border bg-background text-sm font-semibold">
                      {milestone.quarter}
                    </div>
                    {!isLast ? <div className="mt-2 h-full w-px bg-border" /> : null}
                  </div>
                  <div className="flex-1 space-y-3">
                    <div className="flex items-center gap-2">
                      <p className="font-medium leading-tight">{milestone.title}</p>
                      <Badge variant={milestone.status === "In progress" ? "secondary" : "outline"}>{milestone.status}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{milestone.description}</p>
                    <ul className="list-disc space-y-1 pl-5 text-xs text-muted-foreground">
                      {milestone.actions.map((action) => (
                        <li key={action}>{action}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>

        <Card className="h-full">
          <CardHeader className="pb-4">
            <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
              <div>
                <CardTitle>Collaboration & approvals</CardTitle>
                <CardDescription>Share drafts with stakeholders and track sign-offs for each channel.</CardDescription>
              </div>
              <Button size="sm" variant="outline">
                <CheckCircle2 className="h-4 w-4" />
                Request approval
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {approverTimeline.map((approver) => {
              const badge = approvalStatusMap[approver.status];
              return (
                <div key={approver.name} className="flex items-start gap-3 rounded-lg border p-4">
                  <Avatar className="h-9 w-9">
                    <AvatarFallback>{approver.name.slice(0, 2).toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-sm font-medium leading-tight">{approver.name}</p>
                      <Badge variant={badge.variant}>{badge.label}</Badge>
                    </div>
                    <p className="text-xs uppercase tracking-wide text-muted-foreground">{approver.role}</p>
                    <p className="text-xs text-muted-foreground">{approver.note}</p>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
