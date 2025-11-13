import { useMemo, type ReactNode } from "react";
import type { Route } from "./+types/_app.admin.finance.config._index";
import { PageHeader } from "@/components/app/page-header";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowRight, Globe2, Landmark, ShieldCheck } from "lucide-react";

type NormalizedFeeRule = {
  id: string;
  type: string;
  basis?: string;
  rate?: number;
  fixedAmount?: number;
  min?: number;
  max?: number;
  currency?: string;
};

type NormalizedTaxRule = {
  id: string;
  jurisdiction: string;
  taxType?: string;
  rate?: number;
  withholding?: string;
  owner?: string;
  updatedAt?: string;
};

type NormalizedPayoutSchedule = {
  id: string;
  frequency: string;
  offsetDays?: number;
  cutoffTime?: string;
  timeZone?: string;
  method?: string;
  status?: string;
};

type FinanceConfigRecord = {
  id: string;
  name: string;
  status: "draft" | "active" | "retired";
  description?: string;
  effectiveAt?: string;
  appliesTo: string[];
  feeRules: NormalizedFeeRule[];
  taxRules: NormalizedTaxRule[];
  payoutSchedules: NormalizedPayoutSchedule[];
};

type LoaderData = {
  configs: FinanceConfigRecord[];
  source: "api" | "fallback";
  error?: string;
};

const FALLBACK_CONFIGS: FinanceConfigRecord[] = [
  {
    id: "cfg-marketplace",
    name: "Marketplace core",
    status: "active",
    description: "Primary marketplace economics for Northwind and Contoso partners.",
    effectiveAt: "2025-01-15T14:00:00Z",
    appliesTo: ["Northwind Marketplaces", "Contoso Retail"],
    feeRules: [
      { id: "fee-marketplace-commission", type: "commission", basis: "percentage", rate: 0.04, fixedAmount: 0.3, currency: "USD" },
    ],
    taxRules: [
      { id: "tax-us-ca", jurisdiction: "US-CA", taxType: "Marketplace facilitator", rate: 0.085, withholding: "County overrides auto-applied", owner: "Tax Ops", updatedAt: "2025-01-28T00:00:00Z" },
      { id: "tax-us-ny", jurisdiction: "US-NY", taxType: "Marketplace facilitator", rate: 0.08875, owner: "Tax Ops", updatedAt: "2025-01-28T00:00:00Z" },
    ],
    payoutSchedules: [
      { id: "pay-marketplace-weekly", frequency: "weekly", offsetDays: 2, cutoffTime: "14:00", timeZone: "UTC", method: "ACH · ledger 2100-PAY", status: "active" },
    ],
  },
  {
    id: "cfg-print-network",
    name: "Print network wholesale",
    status: "active",
    description: "Wholesale print economics for FlexiFab network.",
    effectiveAt: "2025-02-01T09:00:00Z",
    appliesTo: ["FlexiFab Printing"],
    feeRules: [
      { id: "fee-print-network", type: "service", basis: "percentage", rate: 0.022, fixedAmount: 0.15, currency: "USD" },
    ],
    taxRules: [
      { id: "tax-ca-on", jurisdiction: "CA-ON", taxType: "GST/HST registrant", rate: 0.13, withholding: "1.5% vendor holdback", owner: "Finance Canada", updatedAt: "2025-02-10T00:00:00Z" },
    ],
    payoutSchedules: [
      { id: "pay-print-weekly", frequency: "weekly", offsetDays: 3, cutoffTime: "17:00", timeZone: "UTC", method: "ACH · ledger 2100-PAY", status: "active" },
    ],
  },
  {
    id: "cfg-eu-pilot",
    name: "EU dropship pilot",
    status: "draft",
    description: "Pilot finance configuration for Globex EU marketplace expansion.",
    effectiveAt: "2025-03-01T09:00:00Z",
    appliesTo: ["Globex EU"],
    feeRules: [
      { id: "fee-eu-dropship", type: "commission", basis: "percentage", rate: 0.035, fixedAmount: 0.25, currency: "EUR" },
    ],
    taxRules: [
      { id: "tax-eu-de", jurisdiction: "EU-DE", taxType: "IOSS + OSS", rate: 0.19, withholding: "0.5% compliance buffer", owner: "EU Finance", updatedAt: "2025-02-14T00:00:00Z" },
    ],
    payoutSchedules: [
      { id: "pay-eu-monthly", frequency: "monthly", offsetDays: 4, cutoffTime: "09:00", timeZone: "CET", method: "SEPA", status: "pilot" },
    ],
  },
];

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

const guardArray = (value: unknown): unknown[] => (Array.isArray(value) ? value : []);

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

const parseAppliesTo = (value: unknown): string[] => {
  if (!value) {
    return [];
  }
  if (Array.isArray(value)) {
    return value.map((entry) => String(entry)).filter(Boolean);
  }
  if (typeof value === "string" && value.trim().length > 0) {
    try {
      const parsed = JSON.parse(value);
      if (Array.isArray(parsed)) {
        return parsed.map((entry: unknown) => String(entry)).filter(Boolean);
      }
    } catch {
      // fall through to treat as comma separated string
    }
    return value
      .split(",")
      .map((entry) => entry.trim())
      .filter(Boolean);
  }
  return [];
};

export const loader = async ({ context }: Route.LoaderArgs): Promise<LoaderData> => {
  const manager = (context.api as unknown as Record<string, unknown> | undefined)?.financeConfig as
    | { findMany?: (options: unknown) => Promise<unknown> }
    | undefined;

  if (!manager?.findMany) {
    return { configs: FALLBACK_CONFIGS, source: "fallback", error: "FinanceConfig model not available in API client." };
  }

  try {
    const raw = (await manager.findMany({
      select: {
        id: true,
        name: true,
        status: true,
        description: { truncatedHTML: true, plainText: true },
        effectiveAt: true,
        appliesTo: true,
        feeRules: {
          select: {
            id: true,
            type: true,
            basis: true,
            rate: true,
            fixedAmount: true,
            min: true,
            max: true,
            currency: true,
          },
          sort: { type: "Ascending" },
          first: 25,
        },
        taxRules: {
          select: {
            id: true,
            jurisdiction: true,
            taxType: true,
            rate: true,
            withholding: true,
            owner: true,
            updatedAt: true,
          },
          sort: { jurisdiction: "Ascending" },
          first: 25,
        },
        payoutSchedules: {
          select: {
            id: true,
            frequency: true,
            offsetDays: true,
            cutoffTime: true,
            timeZone: true,
            method: true,
            status: true,
          },
          sort: { frequency: "Ascending" },
          first: 10,
        },
      },
      sort: { name: "Ascending" },
      first: 20,
    })) as unknown[];

    const configs: FinanceConfigRecord[] = raw.map((record, index) => {
      const entry = record as Record<string, unknown>;
      const id = typeof entry.id === "string" && entry.id.length > 0 ? entry.id : `finance-config-${index}`;
      const name = typeof entry.name === "string" && entry.name.length > 0 ? entry.name : `Finance config ${index + 1}`;
      const status = (typeof entry.status === "string" && ["draft", "active", "retired"].includes(entry.status))
        ? (entry.status as FinanceConfigRecord["status"])
        : "draft";

      const descriptionObj = entry.description as { plainText?: string } | undefined;
      const description =
        typeof descriptionObj?.plainText === "string" && descriptionObj.plainText.trim().length > 0
          ? descriptionObj.plainText
          : undefined;

      const feeRules = guardArray(entry.feeRules).map((fee: unknown, feeIndex: number) => {
        const feeEntry = fee as Record<string, unknown>;
        return {
          id: typeof feeEntry.id === "string" && feeEntry.id.length > 0 ? (feeEntry.id as string) : `${id}-fee-${feeIndex}`,
          type: typeof feeEntry.type === "string" ? feeEntry.type : "service",
          basis: typeof feeEntry.basis === "string" ? feeEntry.basis : undefined,
          rate: guardNumber(feeEntry.rate),
          fixedAmount: guardNumber(feeEntry.fixedAmount),
          min: guardNumber(feeEntry.min),
          max: guardNumber(feeEntry.max),
          currency: typeof feeEntry.currency === "string" ? feeEntry.currency : undefined,
        } satisfies NormalizedFeeRule;
      });

      const taxRules = guardArray(entry.taxRules).map((tax: unknown, taxIndex: number) => {
        const taxEntry = tax as Record<string, unknown>;
        return {
          id: typeof taxEntry.id === "string" && taxEntry.id.length > 0 ? (taxEntry.id as string) : `${id}-tax-${taxIndex}`,
          jurisdiction: typeof taxEntry.jurisdiction === "string" ? taxEntry.jurisdiction : "Unassigned",
          taxType: typeof taxEntry.taxType === "string" ? taxEntry.taxType : undefined,
          rate: guardNumber(taxEntry.rate),
          withholding: typeof taxEntry.withholding === "string" ? taxEntry.withholding : undefined,
          owner: typeof taxEntry.owner === "string" ? taxEntry.owner : undefined,
          updatedAt: typeof taxEntry.updatedAt === "string" ? taxEntry.updatedAt : undefined,
        } satisfies NormalizedTaxRule;
      });

      const payoutSchedules = guardArray(entry.payoutSchedules).map((schedule: unknown, scheduleIndex: number) => {
        const scheduleEntry = schedule as Record<string, unknown>;
        return {
          id:
            typeof scheduleEntry.id === "string" && scheduleEntry.id.length > 0
              ? (scheduleEntry.id as string)
              : `${id}-payout-${scheduleIndex}`,
          frequency: typeof scheduleEntry.frequency === "string" ? scheduleEntry.frequency : "weekly",
          offsetDays: guardNumber(scheduleEntry.offsetDays),
          cutoffTime: typeof scheduleEntry.cutoffTime === "string" ? scheduleEntry.cutoffTime : undefined,
          timeZone: typeof scheduleEntry.timeZone === "string" ? scheduleEntry.timeZone : undefined,
          method: typeof scheduleEntry.method === "string" ? scheduleEntry.method : undefined,
          status: typeof scheduleEntry.status === "string" ? scheduleEntry.status : undefined,
        } satisfies NormalizedPayoutSchedule;
      });

      return {
        id,
        name,
        status,
        description,
        effectiveAt: typeof entry.effectiveAt === "string" ? entry.effectiveAt : undefined,
        appliesTo: parseAppliesTo(entry.appliesTo),
        feeRules,
        taxRules,
        payoutSchedules,
      } satisfies FinanceConfigRecord;
    });

    return { configs, source: "api" } satisfies LoaderData;
  } catch (error) {
    return {
      configs: FALLBACK_CONFIGS,
      source: "fallback",
      error: serializeError(error),
    } satisfies LoaderData;
  }
};

const formatPercent = (value?: number) => {
  if (typeof value !== "number" || Number.isNaN(value)) {
    return "—";
  }
  return `${(value * 100).toFixed(2).replace(/\.00$/, "")} %`;
};

const formatCurrency = (value?: number, currency = "USD") => {
  if (typeof value !== "number" || Number.isNaN(value)) {
    return "—";
  }
  return new Intl.NumberFormat("en-US", { style: "currency", currency }).format(value);
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

const summarizeBuffer = (schedule: NormalizedPayoutSchedule) => {
  const parts: string[] = [];
  if (typeof schedule.offsetDays === "number") {
    parts.push(`${schedule.offsetDays} day${schedule.offsetDays === 1 ? "" : "s"}`);
  }
  if (schedule.cutoffTime) {
    parts.push(`Cutoff ${schedule.cutoffTime}${schedule.timeZone ? ` ${schedule.timeZone}` : ""}`);
  }
  return parts.length > 0 ? parts.join(" · ") : "—";
};

export default function FinanceConfigPage({ loaderData }: Route.ComponentProps) {
  const { configs, source, error } = loaderData;

  const metrics = useMemo(() => {
    const active = configs.filter((config) => config.status === "active");
    const partners = new Set<string>();
    configs.forEach((config) => config.appliesTo.forEach((partner) => partners.add(partner)));

    const nextEffective = configs
      .map((config) => config.effectiveAt)
      .filter((value): value is string => Boolean(value))
      .map((value) => Date.parse(value))
      .filter((timestamp) => !Number.isNaN(timestamp) && timestamp >= Date.now())
      .sort((a, b) => a - b)[0];

    const totalFeeRules = configs.reduce((total, config) => total + config.feeRules.length, 0);

    return {
      active: active.length,
      partners: partners.size,
      nextEffective: nextEffective ? formatDateTime(new Date(nextEffective).toISOString()) : "—",
      totalFeeRules,
    };
  }, [configs]);

  const firstConfigId = configs[0]?.id ?? "";

  return (
    <div className="space-y-6">
      <PageHeader
        title="Finance Configuration"
        description="Govern platform fee structures, tax policies, and payout cadences."
      />

      {error && source === "fallback" ? (
        <Alert variant="destructive">
          <AlertTitle>Using sample data</AlertTitle>
          <AlertDescription>
            {error}
          </AlertDescription>
        </Alert>
      ) : null}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <SummaryTile icon={<ShieldCheck className="h-5 w-5 text-emerald-600" />} label="Active configurations" value={metrics.active} subtext="Ready for settlement" />
        <SummaryTile icon={<Globe2 className="h-5 w-5 text-blue-600" />} label="Partners covered" value={metrics.partners} subtext="Across all business units" />
        <SummaryTile icon={<Landmark className="h-5 w-5 text-amber-600" />} label="Fee rules" value={metrics.totalFeeRules} subtext="Applied across configurations" />
        <SummaryTile icon={<ArrowRight className="h-5 w-5 text-slate-600" />} label="Next effective" value={metrics.nextEffective} subtext="Upcoming go-live" />
      </div>

      {configs.length === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>No finance configurations found</CardTitle>
            <CardDescription>Publish at least one configuration to manage partner economics.</CardDescription>
          </CardHeader>
        </Card>
      ) : (
        <Tabs defaultValue={firstConfigId} className="space-y-6">
          <TabsList>
            {configs.map((config) => (
              <TabsTrigger key={config.id} value={config.id}>
                {config.name}
              </TabsTrigger>
            ))}
          </TabsList>

          {configs.map((config) => (
            <TabsContent key={config.id} value={config.id} className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>{config.name}</CardTitle>
                  <CardDescription>
                    {config.description ?? "Finance policy covering partners and associated rules."}
                  </CardDescription>
                </CardHeader>
                <CardContent className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                  <MetadataItem label="Status" value={<StatusBadge status={config.status} />} />
                  <MetadataItem label="Effective" value={formatDateTime(config.effectiveAt)} />
                  <MetadataItem
                    label="Partners"
                    value={config.appliesTo.length > 0 ? config.appliesTo.join(", ") : "—"}
                  />
                  <MetadataItem
                    label="Fee rules"
                    value={`${config.feeRules.length} rule${config.feeRules.length === 1 ? "" : "s"}`}
                  />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Fee rules</CardTitle>
                  <CardDescription>Commission, processing, and service fees applied to transactions.</CardDescription>
                </CardHeader>
                <CardContent className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Type</TableHead>
                        <TableHead>Basis</TableHead>
                        <TableHead>Rate</TableHead>
                        <TableHead>Fixed</TableHead>
                        <TableHead>Bounds</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {config.feeRules.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center text-muted-foreground">
                            No fee rules configured.
                          </TableCell>
                        </TableRow>
                      ) : (
                        config.feeRules.map((rule) => (
                          <TableRow key={rule.id}>
                            <TableCell className="capitalize">{rule.type.replace(/_/g, " ")}</TableCell>
                            <TableCell className="capitalize">{rule.basis ?? "—"}</TableCell>
                            <TableCell>{formatPercent(rule.rate)}</TableCell>
                            <TableCell>{formatCurrency(rule.fixedAmount, rule.currency)}</TableCell>
                            <TableCell>
                              {rule.min || rule.max
                                ? `${rule.min ? formatCurrency(rule.min, rule.currency) : "—"} – ${rule.max ? formatCurrency(rule.max, rule.currency) : "—"}`
                                : "—"}
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Tax profiles</CardTitle>
                  <CardDescription>Jurisdictional rules governing indirect tax treatment.</CardDescription>
                </CardHeader>
                <CardContent className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Jurisdiction</TableHead>
                        <TableHead>Tax type</TableHead>
                        <TableHead>Rate</TableHead>
                        <TableHead>Withholding</TableHead>
                        <TableHead>Owner</TableHead>
                        <TableHead>Updated</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {config.taxRules.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center text-muted-foreground">
                            No tax rules defined.
                          </TableCell>
                        </TableRow>
                      ) : (
                        config.taxRules.map((rule) => (
                          <TableRow key={rule.id}>
                            <TableCell>{rule.jurisdiction}</TableCell>
                            <TableCell>{rule.taxType ?? "—"}</TableCell>
                            <TableCell>{formatPercent(rule.rate)}</TableCell>
                            <TableCell>{rule.withholding ?? "—"}</TableCell>
                            <TableCell>{rule.owner ?? "—"}</TableCell>
                            <TableCell>{formatDateTime(rule.updatedAt)}</TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Payout schedules</CardTitle>
                  <CardDescription>Settlement cadence for partner disbursements.</CardDescription>
                </CardHeader>
                <CardContent className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Frequency</TableHead>
                        <TableHead>Buffer</TableHead>
                        <TableHead>Method</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {config.payoutSchedules.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={4} className="text-center text-muted-foreground">
                            No payout schedules configured.
                          </TableCell>
                        </TableRow>
                      ) : (
                        config.payoutSchedules.map((schedule) => (
                          <TableRow key={schedule.id}>
                            <TableCell className="capitalize">{schedule.frequency.replace(/_/g, " ")}</TableCell>
                            <TableCell>{summarizeBuffer(schedule)}</TableCell>
                            <TableCell>{schedule.method ?? "—"}</TableCell>
                            <TableCell>
                              {schedule.status ? (
                                <Badge variant="outline" className="capitalize">
                                  {schedule.status}
                                </Badge>
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
          ))}
        </Tabs>
      )}
    </div>
  );
}

type SummaryTileProps = {
  icon: ReactNode;
  label: string;
  value: string | number;
  subtext: string;
};

function SummaryTile({ icon, label, value, subtext }: SummaryTileProps) {
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

type StatusBadgeProps = {
  status: FinanceConfigRecord["status"];
};

function StatusBadge({ status }: StatusBadgeProps) {
  const tone: Record<FinanceConfigRecord["status"], "secondary" | "outline" | "destructive"> = {
    active: "secondary",
    draft: "outline",
    retired: "destructive",
  };

  return (
    <Badge variant={tone[status]} className="capitalize">
      {status}
    </Badge>
  );
}

type MetadataItemProps = {
  label: string;
  value: React.ReactNode;
};

function MetadataItem({ label, value }: MetadataItemProps) {
  return (
    <div className="space-y-1">
      <p className="text-xs uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="text-sm font-medium leading-tight">{typeof value === "string" ? value : value ?? "—"}</p>
    </div>
  );
}
