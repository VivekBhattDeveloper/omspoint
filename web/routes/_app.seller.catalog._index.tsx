import { PageHeader } from "@/components/app/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  AlertTriangle,
  CheckCircle2,
  Filter,
  PackageSearch,
  RefreshCcw,
  ShieldCheck,
  Sparkles,
  Tag,
  UploadCloud,
} from "lucide-react";

type MappingStatus = "complete" | "in-progress" | "needs-attention";
type ChannelStatus = "healthy" | "syncing" | "blocked";
type ChannelUpdateTone = "pass" | "progress" | "risk";
type GuardrailStatus = "pass" | "watch" | "fail";
type ValidationSeverity = "error" | "warning" | "info";

const summaryMetrics = [
  {
    label: "Catalog SKUs",
    value: "1,248",
    hint: "Across 6 assortments",
    icon: PackageSearch,
  },
  {
    label: "Mapped attributes",
    value: "312",
    hint: "Per channel templates",
    icon: Tag,
  },
  {
    label: "Marketplace syncs",
    value: "4",
    hint: "Active connections",
    icon: UploadCloud,
  },
  {
    label: "Policy coverage",
    value: "87%",
    hint: "Guardrails passed pre-publish",
    icon: ShieldCheck,
  },
];

const activeFilters = [
  { label: "Assortment", value: "Marketplace core" },
  { label: "Season", value: "SS24" },
  { label: "Availability", value: "Sellable" },
];

const savedViews = [
  {
    name: "Amazon launch",
    description: "Prime Day preview assortment with compliance-ready copy blocks.",
    total: "114 SKUs",
    delta: "+12 new",
  },
  {
    name: "Wholesale seasonal",
    description: "Faire + NuORDER seasonal set filtered by availability and MOQ tiers.",
    total: "86 SKUs",
    delta: "Live sync",
  },
  {
    name: "Needs enrichment",
    description: "Items missing attribution or imagery before going live.",
    total: "32 SKUs",
    delta: "Guardrail hold",
  },
];

const mappingStatusMeta: Record<MappingStatus, { label: string; variant: "secondary" | "outline" | "destructive" }> = {
  complete: { label: "Complete", variant: "secondary" },
  "in-progress": { label: "In progress", variant: "outline" },
  "needs-attention": { label: "Needs attention", variant: "destructive" },
};

const attributeMappings: Array<{
  channel: string;
  feedAttribute: string;
  catalogSource: string;
  coverage: number;
  status: MappingStatus;
  note: string;
}> = [
  {
    channel: "Amazon",
    feedAttribute: "Bullet points",
    catalogSource: "Merch copy blocks",
    coverage: 92,
    status: "complete",
    note: "Synced 15m ago",
  },
  {
    channel: "Shopify",
    feedAttribute: "SEO description",
    catalogSource: "Brand voice templates",
    coverage: 76,
    status: "in-progress",
    note: "Seasonal imagery alt text pending",
  },
  {
    channel: "Faire",
    feedAttribute: "Material composition",
    catalogSource: "Spec sheet import",
    coverage: 58,
    status: "needs-attention",
    note: "32 SKUs missing compliance data",
  },
  {
    channel: "Walmart",
    feedAttribute: "Compliance documents",
    catalogSource: "Regulatory binder",
    coverage: 34,
    status: "needs-attention",
    note: "Awaiting vendor QA sign-off",
  },
];

const channelStatusMeta: Record<ChannelStatus, { label: string; variant: "secondary" | "outline" | "destructive" }> = {
  healthy: { label: "Healthy", variant: "secondary" },
  syncing: { label: "Syncing", variant: "outline" },
  blocked: { label: "Blocked", variant: "destructive" },
};

const channelUpdateToneMeta: Record<ChannelUpdateTone, { icon: typeof CheckCircle2; className: string }> = {
  pass: { icon: CheckCircle2, className: "text-emerald-500" },
  progress: { icon: RefreshCcw, className: "text-blue-500" },
  risk: { icon: AlertTriangle, className: "text-amber-500" },
};

const channelSyncOverview: Array<{
  channel: string;
  status: ChannelStatus;
  lastSync: string;
  summary: string;
  updates: Array<{ message: string; tone: ChannelUpdateTone }>;
}> = [
  {
    channel: "Amazon",
    status: "healthy",
    lastSync: "Synced 15m ago",
    summary: "Prime Day preview feed ready",
    updates: [
      { message: "ASIN updates applied to 84 SKUs", tone: "pass" },
      { message: "5 SKUs awaiting image refresh", tone: "progress" },
    ],
  },
  {
    channel: "Shopify",
    status: "syncing",
    lastSync: "Publishing now",
    summary: "Pushing 32 updates to storefront",
    updates: [
      { message: "Promo pricing scheduled for Apr 22", tone: "progress" },
      { message: "All metafields validated", tone: "pass" },
    ],
  },
  {
    channel: "Faire",
    status: "healthy",
    lastSync: "Synced 1h ago",
    summary: "Wholesale catalog aligned to MOQ tiers",
    updates: [
      { message: "Seasonal imagery cleared brand review", tone: "pass" },
    ],
  },
  {
    channel: "Walmart",
    status: "blocked",
    lastSync: "Attempted 2h ago",
    summary: "Compliance hold on 8 SKUs",
    updates: [
      { message: "Waiting on regulatory document upload", tone: "risk" },
      { message: "Guardrail preventing publish", tone: "risk" },
    ],
  },
];

const guardrailStatusMeta: Record<GuardrailStatus, { label: string; variant: "secondary" | "outline" | "destructive" }> = {
  pass: { label: "Pass", variant: "secondary" },
  watch: { label: "Watch", variant: "outline" },
  fail: { label: "Fail", variant: "destructive" },
};

const brandRuleChecks: Array<{
  rule: string;
  coverage: number;
  owner: string;
  status: GuardrailStatus;
  note: string;
}> = [
  {
    rule: "Visual guardrails",
    coverage: 94,
    owner: "Brand team",
    status: "pass",
    note: "Seasonal imagery locked for SS24 assortments",
  },
  {
    rule: "Margin protection",
    coverage: 82,
    owner: "Finance",
    status: "watch",
    note: "3 SKUs below blended margin target",
  },
  {
    rule: "Channel exclusives",
    coverage: 68,
    owner: "Sales",
    status: "watch",
    note: "Awaiting approvals for cross-post SKUs",
  },
  {
    rule: "Regulatory content",
    coverage: 54,
    owner: "Compliance",
    status: "fail",
    note: "EU instructions pending localization",
  },
];

const validationSeverityMeta: Record<ValidationSeverity, { label: string; variant: "secondary" | "outline" | "destructive" }> = {
  error: { label: "Error", variant: "destructive" },
  warning: { label: "Warning", variant: "outline" },
  info: { label: "Info", variant: "secondary" },
};

const validationFeed: Array<{
  id: string;
  channel: string;
  severity: ValidationSeverity;
  message: string;
  resolution: string;
  timestamp: string;
}> = [
  {
    id: "SKU-4821",
    channel: "Amazon",
    severity: "error",
    message: "Missing bullet copy for attribute set",
    resolution: "Add mandatory bullet 3 via merchandising template.",
    timestamp: "5m ago",
  },
  {
    id: "SKU-3020",
    channel: "Shopify",
    severity: "warning",
    message: "Season tag mismatch vs assortment filter",
    resolution: "Confirm tag matches 'SS24' before next publish window.",
    timestamp: "24m ago",
  },
  {
    id: "SKU-1992",
    channel: "Faire",
    severity: "error",
    message: "Wholesale price tier missing",
    resolution: "Sync price list from finance service.",
    timestamp: "1h ago",
  },
  {
    id: "BUNDLE-882",
    channel: "Walmart",
    severity: "info",
    message: "Content awaiting compliance review",
    resolution: "Auto escalate once regulatory documents upload completes.",
    timestamp: "2h ago",
  },
];

const futureHighlights = [
  {
    title: "Tie into product & listing services",
    detail: "Surface authoritative product data, lifecycle status, and listing ownership to keep catalog content in sync.",
  },
  {
    title: "Assortment-aware filters",
    detail: "Filter by assortment, season, or availability with saved presets that drive marketplace exports.",
  },
  {
    title: "Brand rule enforcement",
    detail: "Run guardrail checks on imagery, copy, and pricing before publish, with overrides routed for approval.",
  },
  {
    title: "Listing ingestion health",
    detail: "Stream validation errors directly from channel ingestion to unblock publishing faster.",
  },
];

export default function SellerCatalogPage() {
  return (
    <div className="space-y-8">
      <PageHeader
        title="Catalog"
        description="Curate assortments, map attributes, and sync listings with marketplaces."
        actions={
          <>
            <Button variant="outline" size="sm" className="hidden md:flex">
              <Filter className="h-4 w-4" />
              Saved filters
            </Button>
            <Button size="sm" className="md:px-6">
              Sync listings
              <RefreshCcw className="h-4 w-4" />
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
                <CardTitle>Filter catalog</CardTitle>
                <CardDescription>Slice catalog by assortments, seasons, and availability to stage marketplace exports.</CardDescription>
              </div>
              <Button variant="outline" size="sm">
                <Filter className="h-4 w-4" />
                Manage filters
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-5">
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Active filters</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {activeFilters.map((filter) => (
                  <Badge key={filter.label} variant="secondary">
                    {filter.label}: {filter.value}
                  </Badge>
                ))}
              </div>
            </div>
            <div className="space-y-3 rounded-lg border p-4">
              <div className="flex items-center justify-between gap-4">
                <p className="text-sm font-medium">Saved filter sets</p>
                <Badge variant="outline">Auto-sync ready</Badge>
              </div>
              <div className="space-y-4">
                {savedViews.map((view) => (
                  <div key={view.name} className="flex items-start justify-between gap-4">
                    <div className="space-y-1">
                      <p className="text-sm font-medium leading-tight">{view.name}</p>
                      <p className="text-xs text-muted-foreground">{view.description}</p>
                    </div>
                    <div className="text-right text-xs text-muted-foreground">
                      <p className="text-sm font-semibold text-foreground">{view.total}</p>
                      <p>{view.delta}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="h-full">
          <CardHeader>
            <CardTitle>Marketplace sync</CardTitle>
            <CardDescription>Monitor channel publishing states and unblock holds before exports fail.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {channelSyncOverview.map((channel) => {
              const badge = channelStatusMeta[channel.status];
              return (
                <div key={channel.channel} className="space-y-3 rounded-lg border p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-1">
                      <p className="text-sm font-medium leading-tight">{channel.channel}</p>
                      <p className="text-xs text-muted-foreground">{channel.summary}</p>
                      <p className="text-xs text-muted-foreground">{channel.lastSync}</p>
                    </div>
                    <Badge variant={badge.variant}>{badge.label}</Badge>
                  </div>
                  <ul className="space-y-2">
                    {channel.updates.map((update) => {
                      const toneMeta = channelUpdateToneMeta[update.tone];
                      const ToneIcon = toneMeta.icon;
                      return (
                        <li key={update.message} className="flex items-start gap-2 text-xs text-muted-foreground">
                          <ToneIcon className={`mt-0.5 h-4 w-4 ${toneMeta.className}`} />
                          <span>{update.message}</span>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              );
            })}
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-6 xl:grid-cols-[3fr_2fr]">
        <Card>
          <CardHeader className="pb-4">
            <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
              <div>
                <CardTitle>Attribute mapping</CardTitle>
                <CardDescription>Map catalog attributes to channel schemas before sending feed updates.</CardDescription>
              </div>
              <Button variant="outline" size="sm">
                <Sparkles className="h-4 w-4" />
                Auto-map attributes
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="min-w-[160px]">Channel</TableHead>
                    <TableHead>Feed attribute</TableHead>
                    <TableHead>Catalog source</TableHead>
                    <TableHead>Coverage</TableHead>
                    <TableHead className="text-right">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {attributeMappings.map((mapping) => {
                    const statusMeta = mappingStatusMeta[mapping.status];
                    return (
                      <TableRow key={`${mapping.channel}-${mapping.feedAttribute}`}>
                        <TableCell className="space-y-1">
                          <p className="font-medium leading-tight">{mapping.channel}</p>
                          <p className="text-xs text-muted-foreground">{mapping.note}</p>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">{mapping.feedAttribute}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">{mapping.catalogSource}</TableCell>
                        <TableCell className="w-[160px]">
                          <div className="space-y-1">
                            <div className="flex items-center justify-between text-xs text-muted-foreground">
                              <span>Coverage</span>
                              <span>{mapping.coverage}%</span>
                            </div>
                            <Progress value={mapping.coverage} />
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <Badge variant={statusMeta.variant}>{statusMeta.label}</Badge>
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
            <CardTitle>Brand guardrails</CardTitle>
            <CardDescription>Enforce brand rules before publishing to channels.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {brandRuleChecks.map((rule) => {
              const status = guardrailStatusMeta[rule.status];
              return (
                <div key={rule.rule} className="space-y-3 rounded-lg border p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-1">
                      <p className="text-sm font-medium leading-tight">{rule.rule}</p>
                      <p className="text-xs text-muted-foreground">{rule.note}</p>
                    </div>
                    <Badge variant={status.variant}>{status.label}</Badge>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>Coverage</span>
                      <span>{rule.coverage}%</span>
                    </div>
                    <Progress value={rule.coverage} />
                    <p className="text-xs text-muted-foreground">Owner: {rule.owner}</p>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-6 lg:grid-cols-[3fr_2fr]">
        <Card>
          <CardHeader>
            <CardTitle>Validation feed</CardTitle>
            <CardDescription>Show channel ingestion errors with actionable resolutions.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {validationFeed.map((item) => {
              const severity = validationSeverityMeta[item.severity];
              return (
                <div key={item.id} className="space-y-2 rounded-lg border p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-1">
                      <p className="text-sm font-medium leading-tight">{item.id}</p>
                      <p className="text-xs text-muted-foreground">{item.message}</p>
                    </div>
                    <Badge variant={severity.variant}>{severity.label}</Badge>
                  </div>
                  <div className="flex flex-wrap justify-between gap-2 text-xs text-muted-foreground">
                    <span>Channel: {item.channel}</span>
                    <span>{item.timestamp}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">Resolution: {item.resolution}</p>
                </div>
              );
            })}
          </CardContent>
        </Card>

        <Card className="h-full">
          <CardHeader>
            <CardTitle>Future functionality</CardTitle>
            <CardDescription>Tie catalog work into product and listing services as the platform expands.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {futureHighlights.map((item) => (
              <div key={item.title} className="space-y-1 rounded-lg border p-4">
                <p className="text-sm font-medium leading-tight">{item.title}</p>
                <p className="text-xs text-muted-foreground">{item.detail}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
