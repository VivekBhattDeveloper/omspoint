import { useMemo } from "react";
import { PageHeader } from "@/components/app/page-header";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge, type BadgeProps } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowRight, Building2, Clock, FileText, Globe2, Landmark, ShieldCheck } from "lucide-react";

type PartnerFinanceControl = {
  partner: string;
  partnerCode: string;
  jurisdictions: string[];
  feeModel: string;
  payoutCycle: string;
  ledgerAccount: string;
  taxProfile: string;
  status: "Active" | "Pilot" | "Paused";
};

type FeeSchedule = {
  name: string;
  basis: string;
  variable: string;
  fixed: string;
  effective: string;
  appliesTo: string;
};

type TaxProfile = {
  jurisdiction: string;
  taxType: string;
  rate: string;
  withholding: string;
  lastUpdated: string;
  owner: string;
};

type PayoutPolicy = {
  partner: string;
  region: string;
  frequency: string;
  settlementBuffer: string;
  nextCutoff: string;
  method: string;
  status: "Active" | "Pilot";
};

type LedgerMapping = {
  channel: string;
  clearingAccount: string;
  revenueAccount: string;
  feesAccount: string;
  reconciliation: string;
  status: "Active" | "Pilot" | "Needs review";
};

type AuditEvent = {
  timestamp: string;
  actor: string;
  change: string;
  status: "Published" | "Awaiting approval" | "Draft";
  ticket: string;
};

type BacklogItem = {
  title: string;
  status: "In progress" | "Blocked" | "Design" | "Open";
  description: string;
};

const partnerControls: PartnerFinanceControl[] = [
  {
    partner: "Northwind Marketplaces",
    partnerCode: "nw-market",
    jurisdictions: ["US-CA", "US-NY"],
    feeModel: "Marketplace core · 4.0% + $0.30",
    payoutCycle: "Weekly · Wed 14:00 UTC",
    ledgerAccount: "4000-OMS-NW",
    taxProfile: "Marketplace facilitator",
    status: "Active",
  },
  {
    partner: "Contoso Retail",
    partnerCode: "contoso-rtl",
    jurisdictions: ["US-TX"],
    feeModel: "Retail wholesale · 2.2% + $0.15",
    payoutCycle: "Bi-weekly · Fri 21:00 UTC",
    ledgerAccount: "4010-OMS-CT",
    taxProfile: "Seller of record",
    status: "Active",
  },
  {
    partner: "FlexiFab Printing",
    partnerCode: "flexifab-print",
    jurisdictions: ["US-CA", "CA-ON"],
    feeModel: "Print network · 1.4% net receipts",
    payoutCycle: "Weekly · Thu 17:00 UTC",
    ledgerAccount: "4050-OMS-FF",
    taxProfile: "Supplier remits GST/HST",
    status: "Pilot",
  },
  {
    partner: "Globex EU",
    partnerCode: "globex-eu",
    jurisdictions: ["EU-DE", "EU-FR"],
    feeModel: "EU dropship · 3.5% + €0.25",
    payoutCycle: "Monthly · 1st @ 09:00 CET",
    ledgerAccount: "4020-OMS-GX",
    taxProfile: "IOSS remitter",
    status: "Pilot",
  },
];

const feeSchedules: FeeSchedule[] = [
  {
    name: "Marketplace core",
    basis: "Gross GMV",
    variable: "4.0%",
    fixed: "$0.30 / order",
    effective: "Jan 15, 2025",
    appliesTo: "Northwind Marketplaces, Contoso Retail",
  },
  {
    name: "Print network wholesale",
    basis: "Net receipts",
    variable: "2.2%",
    fixed: "$0.15 / order",
    effective: "Feb 01, 2025",
    appliesTo: "FlexiFab Printing",
  },
  {
    name: "EU dropship pilot",
    basis: "Gross GMV",
    variable: "3.5%",
    fixed: "€0.25 / order",
    effective: "Mar 01, 2025",
    appliesTo: "Globex EU",
  },
];

const taxProfiles: TaxProfile[] = [
  {
    jurisdiction: "US-CA",
    taxType: "Marketplace facilitator",
    rate: "8.50% remitted",
    withholding: "County overrides auto-applied",
    lastUpdated: "Jan 28, 2025",
    owner: "Tax Ops",
  },
  {
    jurisdiction: "US-NY",
    taxType: "Marketplace facilitator",
    rate: "8.875% remitted",
    withholding: "N/A",
    lastUpdated: "Jan 28, 2025",
    owner: "Tax Ops",
  },
  {
    jurisdiction: "CA-ON",
    taxType: "GST/HST registrant",
    rate: "13% HST",
    withholding: "1.5% vendor holdback",
    lastUpdated: "Feb 10, 2025",
    owner: "Finance Canada",
  },
  {
    jurisdiction: "EU-DE",
    taxType: "IOSS + OSS",
    rate: "19% VAT",
    withholding: "0.5% compliance buffer",
    lastUpdated: "Feb 14, 2025",
    owner: "EU Finance",
  },
];

const payoutPolicies: PayoutPolicy[] = [
  {
    partner: "Northwind Marketplaces",
    region: "US",
    frequency: "Weekly",
    settlementBuffer: "2 business days",
    nextCutoff: "Feb 21, 2025 · 18:00 UTC",
    method: "ACH · ledger 2100-PAY",
    status: "Active",
  },
  {
    partner: "Contoso Retail",
    region: "US",
    frequency: "Bi-weekly",
    settlementBuffer: "3 business days",
    nextCutoff: "Feb 28, 2025 · 21:00 UTC",
    method: "ACH · ledger 2100-PAY",
    status: "Active",
  },
  {
    partner: "Globex EU",
    region: "EU",
    frequency: "Monthly",
    settlementBuffer: "5 business days",
    nextCutoff: "Mar 01, 2025 · 09:00 CET",
    method: "SEPA · ledger 2150-EU",
    status: "Pilot",
  },
];

const ledgerMappings: LedgerMapping[] = [
  {
    channel: "Northwind Marketplaces",
    clearingAccount: "2100-AR-MKT",
    revenueAccount: "4000-MKT",
    feesAccount: "5100-FEE-MKT",
    reconciliation: "Auto via payout-service",
    status: "Active",
  },
  {
    channel: "Contoso Retail",
    clearingAccount: "2105-AR-RTL",
    revenueAccount: "4010-RTL",
    feesAccount: "5110-FEE-RTL",
    reconciliation: "Manual review pending",
    status: "Needs review",
  },
  {
    channel: "Globex EU",
    clearingAccount: "2110-AR-EU",
    revenueAccount: "4020-EU",
    feesAccount: "5120-FEE-EU",
    reconciliation: "Pending go-live",
    status: "Pilot",
  },
];

const auditTrail: AuditEvent[] = [
  {
    timestamp: "Feb 16, 2025 · 13:45 UTC",
    actor: "A. Patel",
    change: "Updated Globex EU VAT buffer to 0.5%.",
    status: "Published",
    ticket: "FIN-2132",
  },
  {
    timestamp: "Feb 14, 2025 · 21:10 UTC",
    actor: "R. Chen",
    change: "Proposed marketplace fee escalation from 3.6% → 4.0%.",
    status: "Awaiting approval",
    ticket: "FIN-2127",
  },
  {
    timestamp: "Feb 12, 2025 · 17:40 UTC",
    actor: "K. Morales",
    change: "Linked Northwind schedule to payout-service cluster us-east-2.",
    status: "Published",
    ticket: "FIN-2121",
  },
  {
    timestamp: "Feb 08, 2025 · 09:15 UTC",
    actor: "M. Gomez",
    change: "Drafted Ontario HST onboarding playbook.",
    status: "Draft",
    ticket: "FIN-2114",
  },
];

const backlogItems: BacklogItem[] = [
  {
    title: "Ledger & payout orchestration",
    status: "In progress",
    description: "Wire config publishing into ledger-service + payout-service to keep entries and schedules synchronized.",
  },
  {
    title: "Jurisdictional fee schedules",
    status: "Blocked",
    description: "Model layered fees and tax overrides per jurisdiction with sunset/activation windows.",
  },
  {
    title: "Settlement impact previews",
    status: "Design",
    description: "Simulate gross-to-net deltas before publishing changes, including partner-level what-ifs.",
  },
  {
    title: "Audit trail export",
    status: "Open",
    description: "Expose approval trail, diff history, and exportable evidence packages for finance governance.",
  },
];

const settlementPreview = {
  scenario: "Increase marketplace core fee to 4.0%",
  effectiveDate: "Mar 01, 2025",
  grossVolume: 540_000,
  currentFees: 19_440,
  proposedFees: 21_600,
  impactedPartners: ["Northwind Marketplaces", "Contoso Retail"],
  payoutBatches: ["US-W1 · Mar 03", "US-E2 · Mar 05", "US-W1 · Mar 10"],
  approvals: ["Finance Ops", "Tax Ops"],
};

const badgeVariantFor = (status: string): BadgeProps["variant"] => {
  switch (status) {
    case "Active":
    case "Published":
    case "In progress":
      return "secondary";
    case "Awaiting approval":
    case "Design":
      return "default";
    case "Pilot":
    case "Open":
      return "outline";
    case "Draft":
    case "Needs review":
    case "Blocked":
      return "destructive";
    default:
      return "outline";
  }
};

export default function AdminFinanceConfigPage() {
  const currency = useMemo(() => new Intl.NumberFormat(undefined, { style: "currency", currency: "USD" }), []);
  const activePartners = partnerControls.filter((control) => control.status === "Active").length;
  const jurisdictionCount = new Set(partnerControls.flatMap((control) => control.jurisdictions)).size;
  const approvalQueue = auditTrail.filter((event) => event.status === "Awaiting approval").length;
  const activePolicies = payoutPolicies.filter((policy) => policy.status === "Active");
  const nextCutoff = activePolicies.length ? activePolicies[0].nextCutoff : "No active payouts scheduled";
  const feeDelta = settlementPreview.proposedFees - settlementPreview.currentFees;

  return (
    <div className="space-y-8">
      <PageHeader
        title="Finance Configuration"
        description="Govern fees, taxes, payout cycles, and ledger mappings across every commerce partner."
        actions={
          <Button>
            Propose change
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        }
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Connected partners</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activePartners} / {partnerControls.length}</div>
            <p className="text-xs text-muted-foreground">Finance controls live vs. total onboarded partners.</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Jurisdictions governed</CardTitle>
            <Globe2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{jurisdictionCount}</div>
            <p className="text-xs text-muted-foreground">Fee schedules and tax logic coverage across regions.</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Next payout cutoff</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-lg font-semibold">{nextCutoff}</div>
            <p className="text-xs text-muted-foreground">Based on active payout policies managed by finance.</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Approvals in queue</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{approvalQueue}</div>
            <p className="text-xs text-muted-foreground">Configuration changes awaiting dual control sign-off.</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Commerce partner governance</CardTitle>
          <CardDescription>Track financial guardrails, payout cadence, and tax alignment per partner.</CardDescription>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Partner</TableHead>
                <TableHead>Jurisdictions</TableHead>
                <TableHead>Fee & tax profile</TableHead>
                <TableHead>Payout cycle</TableHead>
                <TableHead>Ledger mapping</TableHead>
                <TableHead className="text-right">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {partnerControls.map((control) => (
                <TableRow key={control.partnerCode}>
                  <TableCell>
                    <div className="font-medium">{control.partner}</div>
                    <div className="text-xs text-muted-foreground">{control.partnerCode}</div>
                  </TableCell>
                  <TableCell className="align-top">{control.jurisdictions.join(", ")}</TableCell>
                  <TableCell className="align-top space-y-1">
                    <div>{control.feeModel}</div>
                    <p className="text-xs text-muted-foreground">Tax: {control.taxProfile}</p>
                  </TableCell>
                  <TableCell className="align-top">{control.payoutCycle}</TableCell>
                  <TableCell className="align-top">{control.ledgerAccount}</TableCell>
                  <TableCell className="align-top text-right">
                    <Badge variant={badgeVariantFor(control.status)}>{control.status}</Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Tabs defaultValue="fees" className="space-y-4">
        <TabsList className="w-full justify-start gap-2 overflow-x-auto">
          <TabsTrigger value="fees">Fee schedules</TabsTrigger>
          <TabsTrigger value="taxes">Taxes & withholding</TabsTrigger>
          <TabsTrigger value="payouts">Payout cycles</TabsTrigger>
          <TabsTrigger value="ledger">Ledger mapping</TabsTrigger>
        </TabsList>
        <TabsContent value="fees" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Fee schedules</CardTitle>
              <CardDescription>Define how revenue share, platform fees, and fixed charges apply per partner cohort.</CardDescription>
            </CardHeader>
            <CardContent className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Schedule</TableHead>
                    <TableHead>Basis</TableHead>
                    <TableHead>Variable</TableHead>
                    <TableHead>Fixed</TableHead>
                    <TableHead>Effective</TableHead>
                    <TableHead>Applies to</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {feeSchedules.map((schedule) => (
                    <TableRow key={schedule.name}>
                      <TableCell className="font-medium">{schedule.name}</TableCell>
                      <TableCell>{schedule.basis}</TableCell>
                      <TableCell>{schedule.variable}</TableCell>
                      <TableCell>{schedule.fixed}</TableCell>
                      <TableCell>{schedule.effective}</TableCell>
                      <TableCell>{schedule.appliesTo}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
          <Alert>
            <ShieldCheck className="h-4 w-4" />
            <AlertTitle>Governance checkpoint</AlertTitle>
            <AlertDescription>
              Publishing fee changes pushes a preview to payout-service and generates a journal proposal in ledger-service for dual approval.
            </AlertDescription>
          </Alert>
        </TabsContent>

        <TabsContent value="taxes">
          <Card>
            <CardHeader>
              <CardTitle>Tax & withholding rules</CardTitle>
              <CardDescription>Jurisdiction-specific logic for remittance, marketplace obligations, and vendor holdbacks.</CardDescription>
            </CardHeader>
            <CardContent className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Jurisdiction</TableHead>
                    <TableHead>Tax type</TableHead>
                    <TableHead>Rate</TableHead>
                    <TableHead>Withholding</TableHead>
                    <TableHead>Last updated</TableHead>
                    <TableHead>Owner</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {taxProfiles.map((profile) => (
                    <TableRow key={profile.jurisdiction}>
                      <TableCell className="font-medium">{profile.jurisdiction}</TableCell>
                      <TableCell>{profile.taxType}</TableCell>
                      <TableCell>{profile.rate}</TableCell>
                      <TableCell>{profile.withholding}</TableCell>
                      <TableCell>{profile.lastUpdated}</TableCell>
                      <TableCell>{profile.owner}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payouts">
          <Card>
            <CardHeader>
              <CardTitle>Payout cycles</CardTitle>
              <CardDescription>Control cadence, buffers, and routing for finance settlements per partner and region.</CardDescription>
            </CardHeader>
            <CardContent className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Partner</TableHead>
                    <TableHead>Region</TableHead>
                    <TableHead>Frequency</TableHead>
                    <TableHead>Buffer</TableHead>
                    <TableHead>Next cutoff</TableHead>
                    <TableHead>Method</TableHead>
                    <TableHead className="text-right">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {payoutPolicies.map((policy) => (
                    <TableRow key={policy.partner}>
                      <TableCell className="font-medium">{policy.partner}</TableCell>
                      <TableCell>{policy.region}</TableCell>
                      <TableCell>{policy.frequency}</TableCell>
                      <TableCell>{policy.settlementBuffer}</TableCell>
                      <TableCell>{policy.nextCutoff}</TableCell>
                      <TableCell>{policy.method}</TableCell>
                      <TableCell className="text-right">
                        <Badge variant={badgeVariantFor(policy.status)}>{policy.status}</Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="ledger">
          <Card>
            <CardHeader>
              <CardTitle>Ledger mappings</CardTitle>
              <CardDescription>Ensure every payout and fee posts to the correct clearing and revenue accounts.</CardDescription>
            </CardHeader>
            <CardContent className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Channel</TableHead>
                    <TableHead>Clearing</TableHead>
                    <TableHead>Revenue</TableHead>
                    <TableHead>Fees</TableHead>
                    <TableHead>Reconciliation</TableHead>
                    <TableHead className="text-right">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {ledgerMappings.map((mapping) => (
                    <TableRow key={mapping.channel}>
                      <TableCell className="font-medium">{mapping.channel}</TableCell>
                      <TableCell>{mapping.clearingAccount}</TableCell>
                      <TableCell>{mapping.revenueAccount}</TableCell>
                      <TableCell>{mapping.feesAccount}</TableCell>
                      <TableCell>{mapping.reconciliation}</TableCell>
                      <TableCell className="text-right">
                        <Badge variant={badgeVariantFor(mapping.status)}>{mapping.status}</Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Settlement impact preview</CardTitle>
            <CardDescription>
              {settlementPreview.scenario} · Effective {settlementPreview.effectiveDate}.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <p className="text-sm text-muted-foreground">Gross volume (lookback 30d)</p>
                <p className="text-lg font-semibold">{currency.format(settlementPreview.grossVolume)}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Current platform fees</p>
                <p className="text-lg font-semibold">{currency.format(settlementPreview.currentFees)}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Proposed platform fees</p>
                <p className="text-lg font-semibold">{currency.format(settlementPreview.proposedFees)}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Delta on next cycle</p>
                <p className={`text-lg font-semibold ${feeDelta >= 0 ? "text-amber-600" : "text-emerald-600"}`}>
                  {feeDelta >= 0 ? "+" : "-"}
                  {currency.format(Math.abs(feeDelta))}
                </p>
              </div>
            </div>
            <Separator />
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">Impacted partners</p>
              <div className="flex flex-wrap gap-2">
                {settlementPreview.impactedPartners.map((partner) => (
                  <Badge key={partner} variant="outline">
                    <Landmark className="mr-1.5 h-3.5 w-3.5" />
                    {partner}
                  </Badge>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">Payout batches</p>
              <ul className="list-disc space-y-1 pl-4 text-sm text-muted-foreground">
                {settlementPreview.payoutBatches.map((batch) => (
                  <li key={batch}>{batch}</li>
                ))}
              </ul>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <p className="text-sm text-muted-foreground">Approvals required:</p>
              {settlementPreview.approvals.map((team) => (
                <Badge key={team} variant="secondary">
                  <ShieldCheck className="mr-1 h-3.5 w-3.5" />
                  {team}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Audit trail</CardTitle>
            <CardDescription>Dual-control history of adjustments, proposals, and published changes.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {auditTrail.map((event, index) => (
              <div key={event.ticket} className="space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-sm font-medium">{event.change}</p>
                    <p className="text-xs text-muted-foreground">
                      {event.actor} · {event.timestamp}
                    </p>
                  </div>
                  <Badge variant={badgeVariantFor(event.status)}>{event.status}</Badge>
                </div>
                <p className="text-xs text-muted-foreground uppercase tracking-wide">Ticket {event.ticket}</p>
                {index < auditTrail.length - 1 ? <Separator /> : null}
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Finance backlog</CardTitle>
          <CardDescription>Execution focus areas to harden the finance configuration surface.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          {backlogItems.map((item) => (
            <div key={item.title} className="space-y-2 rounded-lg border p-4">
              <div className="flex items-center justify-between">
                <h3 className="font-medium">{item.title}</h3>
                <Badge variant={badgeVariantFor(item.status)}>{item.status}</Badge>
              </div>
              <p className="text-sm text-muted-foreground">{item.description}</p>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
