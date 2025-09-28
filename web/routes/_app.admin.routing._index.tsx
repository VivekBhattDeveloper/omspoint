import { useEffect, useMemo, useState } from "react";
import { PageHeader } from "@/components/app/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";
import { Activity, AlertTriangle, CheckCircle2, Clock, PlugZap, RefreshCcw, ShieldAlert } from "lucide-react";

type PolicyStatus = "active" | "draft";
type FailoverStrategy = "cascading" | "parallel" | "round_robin";
type OrchestrationStatus = "synced" | "pending" | "error";
type VendorHealth = "healthy" | "warning" | "critical";
type AuditStatus = "approved" | "pending" | "rejected";

type VendorProfile = {
  id: string;
  name: string;
  region: string;
  specialization: string[];
  weight: number;
  capacityPerHour: number;
  currentLoadPercent: number;
  slaMinutes: number;
  failoverPriority: number;
  health: VendorHealth;
  autoPauseThreshold: number;
  lastIncidentAt?: string;
};

type AuditEntry = {
  id: string;
  summary: string;
  actor: string;
  role: string;
  status: AuditStatus;
  timestamp: string;
  notes?: string;
};

type RoutingPolicy = {
  id: string;
  name: string;
  status: PolicyStatus;
  channel: string;
  region: string;
  slaMinutes: number;
  maxLagMinutes: number;
  allowPartialFulfillment: boolean;
  failoverStrategy: FailoverStrategy;
  orchestrationStatus: OrchestrationStatus;
  orchestrationLastSync?: string;
  vendorProfiles: VendorProfile[];
  auditTrail: AuditEntry[];
};

type SimulationScenario = {
  volume: number;
  regionFocus: string;
  specialization: string;
  targetSla: number;
  expeditePercent: number;
  failureRate: number;
  peakWindow: "off_peak" | "business_hours" | "overnight";
};

type SimulationResult = {
  vendorId: string;
  share: number;
  expectedOrders: number;
  expediteOrders: number;
  projectedSlaMinutes: number;
  breachProbability: number;
  fallbackVendor?: string;
};

const percentFormatter = new Intl.NumberFormat("en-US", {
  style: "percent",
  maximumFractionDigits: 1,
});

const numberFormatter = new Intl.NumberFormat("en-US", {
  maximumFractionDigits: 0,
});

const DEFAULT_POLICIES: RoutingPolicy[] = [
  {
    id: "standard-us",
    name: "Standard - US Direct Fulfillment",
    status: "active",
    channel: "Marketplace",
    region: "US & Canada",
    slaMinutes: 360,
    maxLagMinutes: 120,
    allowPartialFulfillment: true,
    failoverStrategy: "cascading",
    orchestrationStatus: "synced",
    orchestrationLastSync: "2025-02-16T04:32:00Z",
    vendorProfiles: [
      {
        id: "omni-print",
        name: "OmniPrint Logistics",
        region: "US-East",
        specialization: ["Apparel", "Embellishment"],
        weight: 40,
        capacityPerHour: 420,
        currentLoadPercent: 68,
        slaMinutes: 300,
        failoverPriority: 1,
        health: "healthy",
        autoPauseThreshold: 94,
      },
      {
        id: "northland",
        name: "Northland Fulfillment",
        region: "US-Central",
        specialization: ["Hardgoods", "On-demand"],
        weight: 35,
        capacityPerHour: 380,
        currentLoadPercent: 74,
        slaMinutes: 330,
        failoverPriority: 2,
        health: "warning",
        autoPauseThreshold: 90,
        lastIncidentAt: "2025-02-09T19:45:00Z",
      },
      {
        id: "coastal",
        name: "Coastal Print Co.",
        region: "US-West",
        specialization: ["Apparel", "Custom"],
        weight: 25,
        capacityPerHour: 260,
        currentLoadPercent: 59,
        slaMinutes: 420,
        failoverPriority: 3,
        health: "healthy",
        autoPauseThreshold: 92,
      },
    ],
    auditTrail: [
      {
        id: "audit-1",
        summary: "Increased OmniPrint allocation from 35% to 40%",
        actor: "Leah Gomez",
        role: "Operations Manager",
        status: "approved",
        timestamp: "2025-02-18T15:12:00Z",
      },
      {
        id: "audit-2",
        summary: "Requested SLA reduction to 6h for expedited orders",
        actor: "Caleb Bryant",
        role: "Logistics Lead",
        status: "pending",
        timestamp: "2025-02-21T11:04:00Z",
        notes: "Awaiting Finance review",
      },
    ],
  },
  {
    id: "expedited-na",
    name: "Expedited - North America",
    status: "draft",
    channel: "Direct Ship",
    region: "US & Canada",
    slaMinutes: 180,
    maxLagMinutes: 45,
    allowPartialFulfillment: false,
    failoverStrategy: "parallel",
    orchestrationStatus: "pending",
    vendorProfiles: [
      {
        id: "velocity",
        name: "Velocity Printworks",
        region: "US-West",
        specialization: ["Fast-turn Apparel", "Promo"],
        weight: 45,
        capacityPerHour: 310,
        currentLoadPercent: 81,
        slaMinutes: 150,
        failoverPriority: 1,
        health: "warning",
        autoPauseThreshold: 88,
      },
      {
        id: "metro",
        name: "Metro Supply Labs",
        region: "US-East",
        specialization: ["On-demand", "Kitting"],
        weight: 35,
        capacityPerHour: 275,
        currentLoadPercent: 64,
        slaMinutes: 165,
        failoverPriority: 2,
        health: "healthy",
        autoPauseThreshold: 90,
      },
      {
        id: "polar",
        name: "Polar Manufacturing",
        region: "CA-East",
        specialization: ["Cold-weather", "Outerwear"],
        weight: 20,
        capacityPerHour: 190,
        currentLoadPercent: 52,
        slaMinutes: 210,
        failoverPriority: 3,
        health: "healthy",
        autoPauseThreshold: 94,
      },
    ],
    auditTrail: [
      {
        id: "audit-3",
        summary: "Created expedited pilot policy",
        actor: "Rina Patel",
        role: "Program Manager",
        status: "approved",
        timestamp: "2025-01-28T08:43:00Z",
      },
      {
        id: "audit-4",
        summary: "Awaiting approval for Velocity as primary vendor",
        actor: "Elliot Chen",
        role: "Supply Chain Director",
        status: "pending",
        timestamp: "2025-02-20T17:25:00Z",
      },
    ],
  },
];

const DEFAULT_SCENARIO: SimulationScenario = {
  volume: 950,
  regionFocus: "US-East",
  specialization: "Apparel",
  targetSla: 320,
  expeditePercent: 12,
  failureRate: 3,
  peakWindow: "business_hours",
};

type SummaryMetricProps = {
  icon: LucideIcon;
  label: string;
  value: string;
  hint?: string;
  tone?: "neutral" | "success" | "warning" | "info";
};

function SummaryMetric({ icon: Icon, label, value, hint, tone = "neutral" }: SummaryMetricProps) {
  return (
    <div className="flex flex-col justify-between gap-3 rounded-lg border bg-card p-4">
      <div className="flex items-center justify-between gap-3">
        <Icon
          className={cn(
            "h-5 w-5",
            tone === "success" && "text-emerald-500",
            tone === "warning" && "text-amber-500",
            tone === "info" && "text-blue-500",
            tone === "neutral" && "text-muted-foreground"
          )}
        />
        {hint ? <span className="text-xs text-muted-foreground">{hint}</span> : null}
      </div>
      <div>
        <p className="text-sm text-muted-foreground">{label}</p>
        <p className="text-2xl font-semibold leading-tight">{value}</p>
      </div>
    </div>
  );
}

type HealthIndicatorProps = {
  health: VendorHealth;
};

function HealthIndicator({ health }: HealthIndicatorProps) {
  const label = health === "healthy" ? "Healthy" : health === "warning" ? "Warning" : "Critical";
  const tone =
    health === "healthy"
      ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-600"
      : health === "warning"
        ? "border-amber-500/40 bg-amber-500/10 text-amber-700"
        : "border-red-500/40 bg-red-500/10 text-red-600";

  return (
    <Badge variant="outline" className={cn("px-2 py-1 capitalize", tone)}>
      {label}
    </Badge>
  );
}

function formatTimestamp(value?: string) {
  if (!value) {
    return "—";
  }

  try {
    return new Intl.DateTimeFormat("en-US", {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(new Date(value));
  } catch (error) {
    return value;
  }
}

export default function AdminRoutingPage() {
  const [policies, setPolicies] = useState<RoutingPolicy[]>(DEFAULT_POLICIES);
  const [selectedPolicyId, setSelectedPolicyId] = useState<string>(DEFAULT_POLICIES[0]?.id ?? "");
  const [scenario, setScenario] = useState<SimulationScenario>(DEFAULT_SCENARIO);
  const [auditDraft, setAuditDraft] = useState<string>("");
  const [syncBanner, setSyncBanner] = useState<{ tone: "success" | "error"; message: string } | null>(null);

  const selectedPolicy = useMemo(() => {
    return policies.find((policy) => policy.id === selectedPolicyId) ?? policies[0] ?? null;
  }, [policies, selectedPolicyId]);

  useEffect(() => {
    setSyncBanner(null);
  }, [selectedPolicyId]);

  const summaryMetrics = useMemo(() => {
    const totalPolicies = policies.length;
    const activePolicies = policies.filter((policy) => policy.status === "active").length;
    const pendingApprovals = policies.reduce((sum, policy) => sum + policy.auditTrail.filter((entry) => entry.status === "pending").length, 0);
    const averageSlaMinutes = Math.round(
      policies.reduce((sum, policy) => sum + policy.slaMinutes, 0) / Math.max(1, totalPolicies)
    );
    const orchestrationReady = policies.filter((policy) => policy.orchestrationStatus === "synced").length;

    return {
      totalPolicies,
      activePolicies,
      pendingApprovals,
      averageSlaMinutes,
      orchestrationReady,
    };
  }, [policies]);

  const weightTotal = useMemo(() => {
    if (!selectedPolicy) {
      return 0;
    }

    return selectedPolicy.vendorProfiles.reduce((sum, vendor) => sum + vendor.weight, 0);
  }, [selectedPolicy]);

  const pendingApprovalsForPolicy = selectedPolicy?.auditTrail.filter((entry) => entry.status === "pending").length ?? 0;

  const availableRegions = useMemo(() => {
    if (!selectedPolicy) {
      return [] as string[];
    }

    const regionSet = new Set<string>();
    selectedPolicy.vendorProfiles.forEach((vendor) => regionSet.add(vendor.region));
    return Array.from(regionSet);
  }, [selectedPolicy]);

  const availableSpecializations = useMemo(() => {
    if (!selectedPolicy) {
      return [] as string[];
    }

    const specializationSet = new Set<string>();
    selectedPolicy.vendorProfiles.forEach((vendor) => {
      vendor.specialization.forEach((value) => specializationSet.add(value));
    });
    return Array.from(specializationSet);
  }, [selectedPolicy]);

  const sortedFailoverSequence = useMemo(() => {
    if (!selectedPolicy) {
      return [] as VendorProfile[];
    }

    return [...selectedPolicy.vendorProfiles].sort((a, b) => a.failoverPriority - b.failoverPriority);
  }, [selectedPolicy]);

  const scenarioResults = useMemo<SimulationResult[]>(() => {
    if (!selectedPolicy || selectedPolicy.vendorProfiles.length === 0) {
      return [];
    }

    const regionFocus = scenario.regionFocus;
    const specializationFocus = scenario.specialization;
    const peakWindow = scenario.peakWindow;
    const targetSla = Math.max(1, scenario.targetSla);

    const vendorScores = selectedPolicy.vendorProfiles.map((vendor) => {
      let score = vendor.weight;

      if (regionFocus !== "all") {
        score *= vendor.region === regionFocus ? 1.15 : 0.82;
      }

      if (specializationFocus !== "all") {
        score *= vendor.specialization.includes(specializationFocus) ? 1.2 : 0.9;
      }

      if (peakWindow === "overnight") {
        score *= vendor.region.includes("East") ? 0.92 : 1;
      } else if (peakWindow === "off_peak") {
        score *= 1.05;
      }

      if (vendor.health === "warning") {
        score *= 0.85;
      } else if (vendor.health === "critical") {
        score *= 0.6;
      }

      if (vendor.currentLoadPercent > 88) {
        score *= 0.68;
      } else if (vendor.currentLoadPercent > 75) {
        score *= 0.82;
      }

      return { vendorId: vendor.id, score: Math.max(score, 0) };
    });

    const totalScore = vendorScores.reduce((sum, entry) => sum + entry.score, 0) || 1;
    const vendorsByPriority = [...selectedPolicy.vendorProfiles].sort((a, b) => a.failoverPriority - b.failoverPriority);

    return vendorScores.map((entry) => {
      const vendor = selectedPolicy.vendorProfiles.find((candidate) => candidate.id === entry.vendorId)!;
      const share = entry.score / totalScore;
      const expectedOrders = Math.round(share * scenario.volume);
      const expediteOrders = Math.round(expectedOrders * (scenario.expeditePercent / 100));
      const expediteModifier = scenario.expeditePercent > 0 ? 0.88 : 1;
      const peakModifier = scenario.peakWindow === "business_hours" ? 1 : scenario.peakWindow === "overnight" ? 1.05 : 0.95;
      const projectedSlaMinutes = Math.max(1, Math.round(vendor.slaMinutes * expediteModifier * peakModifier));
      const breachProbability = Math.min(
        1,
        Math.max(
          0,
          (projectedSlaMinutes - targetSla) / targetSla + scenario.failureRate / 100 + vendor.currentLoadPercent / 260
        )
      );

      const currentPriority = vendor.failoverPriority;
      const fallbackVendor = vendorsByPriority.find((candidate) => candidate.failoverPriority > currentPriority)?.name;

      return {
        vendorId: vendor.id,
        share,
        expectedOrders,
        expediteOrders,
        projectedSlaMinutes,
        breachProbability,
        fallbackVendor,
      } satisfies SimulationResult;
    });
  }, [scenario, selectedPolicy]);

  const scenarioSummary = useMemo(() => {
    if (scenarioResults.length === 0) {
      return { projectedOrders: 0, expediteOrders: 0, averageBreachProbability: 0, highestRiskVendorId: "" };
    }

    const projectedOrders = scenarioResults.reduce((sum, entry) => sum + entry.expectedOrders, 0);
    const expediteOrders = scenarioResults.reduce((sum, entry) => sum + entry.expediteOrders, 0);
    const averageBreachProbability =
      scenarioResults.reduce((sum, entry) => sum + entry.breachProbability, 0) / scenarioResults.length;
    const highestRiskVendor = scenarioResults.reduce((worst, entry) =>
      entry.breachProbability > worst.breachProbability ? entry : worst
    );

    return {
      projectedOrders,
      expediteOrders,
      averageBreachProbability,
      highestRiskVendorId: highestRiskVendor.vendorId,
    };
  }, [scenarioResults]);

  const handleSelectPolicy = (policyId: string) => {
    setSelectedPolicyId(policyId);
  };

  const handlePolicyUpdate = <K extends keyof RoutingPolicy>(field: K, value: RoutingPolicy[K]) => {
    if (!selectedPolicy) {
      return;
    }

    setPolicies((previous) =>
      previous.map((policy) => (policy.id === selectedPolicy.id ? { ...policy, [field]: value } : policy))
    );
  };

  const handleVendorUpdate = <K extends keyof VendorProfile>(vendorId: string, field: K, value: VendorProfile[K]) => {
    if (!selectedPolicy) {
      return;
    }

    setPolicies((previous) =>
      previous.map((policy) => {
        if (policy.id !== selectedPolicy.id) {
          return policy;
        }

        return {
          ...policy,
          vendorProfiles: policy.vendorProfiles.map((vendor) =>
            vendor.id === vendorId ? { ...vendor, [field]: value } : vendor
          ),
        };
      })
    );
  };

  const handleAutoBalanceWeights = () => {
    if (!selectedPolicy || selectedPolicy.vendorProfiles.length === 0) {
      return;
    }

    setPolicies((previous) =>
      previous.map((policy) => {
        if (policy.id !== selectedPolicy.id) {
          return policy;
        }

        const totalCapacity = policy.vendorProfiles.reduce((sum, vendor) => sum + vendor.capacityPerHour, 0) || 1;
        let balancedVendors = policy.vendorProfiles.map((vendor) => {
          const capacityShare = vendor.capacityPerHour / totalCapacity;
          return {
            ...vendor,
            weight: Math.round(capacityShare * 100),
          } satisfies VendorProfile;
        });

        const adjustedTotal = balancedVendors.reduce((sum, vendor) => sum + vendor.weight, 0);
        const correction = 100 - adjustedTotal;

        if (correction !== 0 && balancedVendors.length > 0) {
          const lastVendor = balancedVendors[balancedVendors.length - 1];
          balancedVendors = [
            ...balancedVendors.slice(0, -1),
            {
              ...lastVendor,
              weight: Math.max(0, lastVendor.weight + correction),
            },
          ];
        }

        return {
          ...policy,
          vendorProfiles: balancedVendors,
        };
      })
    );
  };

  const handleSyncPolicy = () => {
    if (!selectedPolicy) {
      return;
    }

    if (Math.abs(100 - weightTotal) > 0.1) {
      setSyncBanner({
        tone: "error",
        message: "Weights must total 100% before syncing with orchestration.",
      });
      return;
    }

    if (pendingApprovalsForPolicy > 0) {
      setSyncBanner({
        tone: "error",
        message: "Resolve pending approvals before pushing updates to orchestration.",
      });
      return;
    }

    const syncTimestamp = new Date().toISOString();

    setPolicies((previous) =>
      previous.map((policy) =>
        policy.id === selectedPolicy.id
          ? {
              ...policy,
              orchestrationStatus: "synced",
              orchestrationLastSync: syncTimestamp,
            }
          : policy
      )
    );

    setSyncBanner({
      tone: "success",
      message: "Orchestration sync staged. The control plane will pull the new weights within 5 minutes.",
    });
  };

  const handleAuditStatusChange = (auditId: string, status: AuditStatus) => {
    if (!selectedPolicy) {
      return;
    }

    setPolicies((previous) =>
      previous.map((policy) => {
        if (policy.id !== selectedPolicy.id) {
          return policy;
        }

        return {
          ...policy,
          auditTrail: policy.auditTrail.map((entry) =>
            entry.id === auditId ? { ...entry, status, timestamp: entry.timestamp ?? new Date().toISOString() } : entry
          ),
        };
      })
    );
  };

  const handleCreateAuditEntry = () => {
    if (!selectedPolicy) {
      return;
    }

    const trimmed = auditDraft.trim();
    if (!trimmed) {
      return;
    }

    const newEntry: AuditEntry = {
      id: `audit-${Date.now()}`,
      summary: trimmed,
      actor: "Routing Automation",
      role: "System",
      status: "pending",
      timestamp: new Date().toISOString(),
      notes: `Total weight now at ${weightTotal.toFixed(1)}%.`,
    };

    setPolicies((previous) =>
      previous.map((policy) =>
        policy.id === selectedPolicy.id
          ? {
              ...policy,
              auditTrail: [newEntry, ...policy.auditTrail],
            }
          : policy
      )
    );

    setAuditDraft("");
  };

  if (!selectedPolicy) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Routing & SLA Policies"
          description="Configure routing weights, SLA targets, and failover strategies for order distribution."
        />
        <Card>
          <CardHeader>
            <CardTitle>No policies available</CardTitle>
            <CardDescription>Add routing policies in Gadget to manage them here.</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Routing & SLA Policies"
        description="Configure routing weights, SLA targets, and failover strategies for order distribution."
      />

      <Card>
        <CardHeader>
          <CardTitle>Operational snapshot</CardTitle>
          <CardDescription>Monitor policy readiness before connecting changes to the orchestration service.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <SummaryMetric
              icon={Activity}
              label="Active policies"
              value={`${summaryMetrics.activePolicies}`}
              hint={`of ${summaryMetrics.totalPolicies} total`}
              tone="info"
            />
            <SummaryMetric
              icon={Clock}
              label="Average SLA target"
              value={`${summaryMetrics.averageSlaMinutes} min`}
              hint="across environments"
              tone="neutral"
            />
            <SummaryMetric
              icon={PlugZap}
              label="Policies synced"
              value={`${summaryMetrics.orchestrationReady}`}
              hint="connected to orchestration"
              tone="success"
            />
            <SummaryMetric
              icon={AlertTriangle}
              label="Pending approvals"
              value={`${summaryMetrics.pendingApprovals}`}
              hint="action required"
              tone={summaryMetrics.pendingApprovals > 0 ? "warning" : "success"}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="space-y-2">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <CardTitle>Routing policy design</CardTitle>
              <CardDescription>
                Model capacity, region coverage, and failover strategy per vendor before syncing with orchestration.
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Badge
                variant="outline"
                className={cn(
                  "px-3 py-1 text-xs font-medium capitalize",
                  selectedPolicy.status === "active"
                    ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-600"
                    : "border-amber-500/40 bg-amber-500/10 text-amber-700"
                )}
              >
                {selectedPolicy.status}
              </Badge>
              <Badge
                variant="outline"
                className={cn(
                  "px-3 py-1 text-xs font-medium capitalize",
                  selectedPolicy.orchestrationStatus === "synced"
                    ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-600"
                    : selectedPolicy.orchestrationStatus === "pending"
                      ? "border-amber-500/40 bg-amber-500/10 text-amber-700"
                      : "border-red-500/40 bg-red-500/10 text-red-600"
                )}
              >
                {selectedPolicy.orchestrationStatus === "synced" ? "orchestrator synced" : selectedPolicy.orchestrationStatus}
              </Badge>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 pt-2">
            {policies.map((policy) => (
              <Button
                key={policy.id}
                type="button"
                variant={policy.id === selectedPolicy.id ? "secondary" : "outline"}
                size="sm"
                onClick={() => handleSelectPolicy(policy.id)}
              >
                {policy.name}
                {policy.auditTrail.some((entry) => entry.status === "pending") ? (
                  <span className="ml-1 text-xs text-amber-600">•</span>
                ) : null}
              </Button>
            ))}
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {syncBanner ? (
            <div
              className={cn(
                "rounded-md border px-4 py-3 text-sm",
                syncBanner.tone === "success"
                  ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-700"
                  : "border-red-500/40 bg-red-500/10 text-red-600"
              )}
            >
              {syncBanner.message}
            </div>
          ) : null}

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="policy-name">Policy name</Label>
              <Input
                id="policy-name"
                value={selectedPolicy.name}
                onChange={(event) => handlePolicyUpdate("name", event.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="policy-channel">Distribution channel</Label>
              <Input
                id="policy-channel"
                value={selectedPolicy.channel}
                onChange={(event) => handlePolicyUpdate("channel", event.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="policy-region">Region coverage</Label>
              <Input
                id="policy-region"
                value={selectedPolicy.region}
                onChange={(event) => handlePolicyUpdate("region", event.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="policy-status">Policy status</Label>
              <Select
                value={selectedPolicy.status}
                onValueChange={(value) => handlePolicyUpdate("status", value as PolicyStatus)}
              >
                <SelectTrigger id="policy-status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="policy-sla">SLA target (minutes)</Label>
              <Input
                id="policy-sla"
                type="number"
                min={60}
                value={selectedPolicy.slaMinutes}
                onChange={(event) => handlePolicyUpdate("slaMinutes", Number(event.target.value))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="policy-lag">Max lag before escalation (minutes)</Label>
              <Input
                id="policy-lag"
                type="number"
                min={0}
                value={selectedPolicy.maxLagMinutes}
                onChange={(event) => handlePolicyUpdate("maxLagMinutes", Number(event.target.value))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="policy-failover">Failover strategy</Label>
              <Select
                value={selectedPolicy.failoverStrategy}
                onValueChange={(value) => handlePolicyUpdate("failoverStrategy", value as FailoverStrategy)}
              >
                <SelectTrigger id="policy-failover">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cascading">Cascading fallback</SelectItem>
                  <SelectItem value="parallel">Parallel reroute</SelectItem>
                  <SelectItem value="round_robin">Round robin</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2 pt-6">
              <Checkbox
                id="policy-partial"
                checked={selectedPolicy.allowPartialFulfillment}
                onCheckedChange={(checked) => handlePolicyUpdate("allowPartialFulfillment", checked === true)}
              />
              <Label htmlFor="policy-partial" className="text-sm font-medium">
                Allow partial fulfillment when SLA is threatened
              </Label>
            </div>
            <div className="space-y-1 text-sm text-muted-foreground md:col-span-2 xl:col-span-3">
              <div className="font-medium text-foreground">Failover sequence</div>
              <div>{sortedFailoverSequence.map((vendor) => vendor.name).join(" → ")}</div>
            </div>
          </div>

          <div
            className={cn(
              "rounded-md border px-4 py-3 text-sm",
              Math.abs(100 - weightTotal) <= 0.1
                ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-700"
                : "border-amber-500/40 bg-amber-500/10 text-amber-700"
            )}
          >
            {Math.abs(100 - weightTotal) <= 0.1
              ? "Vendor weights total 100%. Policy can be staged for orchestration."
              : `Weights are at ${weightTotal.toFixed(1)}%. Rebalance to reach 100% before syncing.`}
          </div>

          <div className="flex flex-wrap gap-2">
            <Button type="button" onClick={handleAutoBalanceWeights} variant="outline" size="sm">
              <RefreshCcw className="h-4 w-4" />
              Auto balance by capacity
            </Button>
            <Button type="button" onClick={handleSyncPolicy} size="sm" variant="secondary">
              <CheckCircle2 className="h-4 w-4" />
              Stage orchestration sync
            </Button>
            {selectedPolicy.orchestrationLastSync ? (
              <span className="text-xs text-muted-foreground">
                Last sync {formatTimestamp(selectedPolicy.orchestrationLastSync)}
              </span>
            ) : null}
          </div>

          <div className="overflow-hidden rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Vendor</TableHead>
                  <TableHead>Region</TableHead>
                  <TableHead className="w-32">Weight %</TableHead>
                  <TableHead className="w-32">Capacity/hr</TableHead>
                  <TableHead className="w-32">SLA (min)</TableHead>
                  <TableHead>Load</TableHead>
                  <TableHead className="w-32">Failover priority</TableHead>
                  <TableHead>Health</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {selectedPolicy.vendorProfiles.map((vendor) => (
                  <TableRow key={vendor.id} className="align-top">
                    <TableCell className="min-w-[180px]">
                      <div className="font-medium text-foreground">{vendor.name}</div>
                      <div className="text-xs text-muted-foreground">
                        {vendor.specialization.join(", ")}
                      </div>
                      {vendor.lastIncidentAt ? (
                        <div className="pt-2 text-xs text-muted-foreground">
                          Last incident {formatTimestamp(vendor.lastIncidentAt)}
                        </div>
                      ) : null}
                    </TableCell>
                    <TableCell className="whitespace-nowrap text-sm">{vendor.region}</TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        min={0}
                        max={100}
                        value={vendor.weight}
                        onChange={(event) => handleVendorUpdate(vendor.id, "weight", Number(event.target.value))}
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        min={0}
                        value={vendor.capacityPerHour}
                        onChange={(event) =>
                          handleVendorUpdate(vendor.id, "capacityPerHour", Number(event.target.value))
                        }
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        min={30}
                        value={vendor.slaMinutes}
                        onChange={(event) => handleVendorUpdate(vendor.id, "slaMinutes", Number(event.target.value))}
                      />
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                          <span>{vendor.currentLoadPercent}%</span>
                          <span>pause @{vendor.autoPauseThreshold}%</span>
                        </div>
                        <Progress value={vendor.currentLoadPercent} />
                        <Input
                          type="number"
                          min={0}
                          max={100}
                          value={vendor.currentLoadPercent}
                          onChange={(event) =>
                            handleVendorUpdate(vendor.id, "currentLoadPercent", Number(event.target.value))
                          }
                        />
                      </div>
                    </TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        min={1}
                        value={vendor.failoverPriority}
                        onChange={(event) =>
                          handleVendorUpdate(vendor.id, "failoverPriority", Number(event.target.value))
                        }
                      />
                    </TableCell>
                    <TableCell>
                      <Select
                        value={vendor.health}
                        onValueChange={(value) => handleVendorUpdate(vendor.id, "health", value as VendorHealth)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="healthy">Healthy</SelectItem>
                          <SelectItem value="warning">Warning</SelectItem>
                          <SelectItem value="critical">Critical</SelectItem>
                        </SelectContent>
                      </Select>
                      <div className="pt-2">
                        <HealthIndicator health={vendor.health} />
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Scenario simulation</CardTitle>
          <CardDescription>Estimate order distribution, SLA compliance, and failover exposure before activation.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="scenario-volume">Projected order volume</Label>
              <Input
                id="scenario-volume"
                type="number"
                min={0}
                value={scenario.volume}
                onChange={(event) => setScenario({ ...scenario, volume: Number(event.target.value) })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="scenario-region">Region focus</Label>
              <Select
                value={scenario.regionFocus}
                onValueChange={(value) => setScenario({ ...scenario, regionFocus: value })}
              >
                <SelectTrigger id="scenario-region">
                  <SelectValue placeholder="Select region" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All regions</SelectItem>
                  {availableRegions.map((region) => (
                    <SelectItem key={region} value={region}>
                      {region}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="scenario-specialization">Specialization emphasis</Label>
              <Select
                value={scenario.specialization}
                onValueChange={(value) => setScenario({ ...scenario, specialization: value })}
              >
                <SelectTrigger id="scenario-specialization">
                  <SelectValue placeholder="Select capability" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All capabilities</SelectItem>
                  {availableSpecializations.map((capability) => (
                    <SelectItem key={capability} value={capability}>
                      {capability}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="scenario-target-sla">Scenario SLA target (minutes)</Label>
              <Input
                id="scenario-target-sla"
                type="number"
                min={30}
                value={scenario.targetSla}
                onChange={(event) => setScenario({ ...scenario, targetSla: Number(event.target.value) })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="scenario-expedite">Expedite share (%)</Label>
              <Input
                id="scenario-expedite"
                type="number"
                min={0}
                max={100}
                value={scenario.expeditePercent}
                onChange={(event) =>
                  setScenario({ ...scenario, expeditePercent: Number(event.target.value) })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="scenario-failure">Anticipated failure rate (%)</Label>
              <Input
                id="scenario-failure"
                type="number"
                min={0}
                max={100}
                value={scenario.failureRate}
                onChange={(event) => setScenario({ ...scenario, failureRate: Number(event.target.value) })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="scenario-window">Peak window</Label>
              <Select
                value={scenario.peakWindow}
                onValueChange={(value) => setScenario({ ...scenario, peakWindow: value as SimulationScenario["peakWindow"] })}
              >
                <SelectTrigger id="scenario-window">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="business_hours">Business hours</SelectItem>
                  <SelectItem value="off_peak">Off-peak</SelectItem>
                  <SelectItem value="overnight">Overnight</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="overflow-hidden rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Vendor</TableHead>
                  <TableHead>Allocation</TableHead>
                  <TableHead className="w-32">Projected orders</TableHead>
                  <TableHead className="w-32">Expedite load</TableHead>
                  <TableHead className="w-32">Projected SLA</TableHead>
                  <TableHead className="w-32">Breach risk</TableHead>
                  <TableHead>Failover target</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {scenarioResults.map((result) => {
                  const vendor = selectedPolicy.vendorProfiles.find((entry) => entry.id === result.vendorId)!;
                  const isHighestRisk = result.vendorId === scenarioSummary.highestRiskVendorId;

                  return (
                    <TableRow key={result.vendorId} className={cn(isHighestRisk && "bg-amber-500/5")}>
                      <TableCell>
                        <div className="font-medium text-foreground">{vendor.name}</div>
                        <div className="text-xs text-muted-foreground">{vendor.region}</div>
                      </TableCell>
                      <TableCell className="text-sm">
                        {percentFormatter.format(result.share)}
                      </TableCell>
                      <TableCell className="text-sm">
                        {numberFormatter.format(result.expectedOrders)}
                      </TableCell>
                      <TableCell className="text-sm">
                        {numberFormatter.format(result.expediteOrders)}
                      </TableCell>
                      <TableCell className="text-sm">
                        {result.projectedSlaMinutes} min
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={cn(
                            "px-2 py-1 text-xs",
                            result.breachProbability > 0.45
                              ? "border-red-500/40 bg-red-500/10 text-red-600"
                              : result.breachProbability > 0.25
                                ? "border-amber-500/40 bg-amber-500/10 text-amber-700"
                                : "border-emerald-500/40 bg-emerald-500/10 text-emerald-600"
                          )}
                        >
                          {percentFormatter.format(result.breachProbability)}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {selectedPolicy.failoverStrategy === "parallel"
                          ? "Distribute to remaining vendors"
                          : result.fallbackVendor ?? "—"}
                      </TableCell>
                    </TableRow>
                  );
                })}
                {scenarioResults.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-sm text-muted-foreground">
                      Configure vendors to simulate routing outcomes.
                    </TableCell>
                  </TableRow>
                ) : null}
              </TableBody>
            </Table>
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <div className="rounded-lg border bg-card p-4">
              <div className="text-sm text-muted-foreground">Orders covered</div>
              <div className="text-2xl font-semibold">
                {numberFormatter.format(scenarioSummary.projectedOrders)} / {numberFormatter.format(scenario.volume)}
              </div>
            </div>
            <div className="rounded-lg border bg-card p-4">
              <div className="text-sm text-muted-foreground">Expedite throughput</div>
              <div className="text-2xl font-semibold">
                {numberFormatter.format(scenarioSummary.expediteOrders)} orders
              </div>
            </div>
            <div className="rounded-lg border bg-card p-4">
              <div className="text-sm text-muted-foreground">Average breach risk</div>
              <div className="text-2xl font-semibold">
                {percentFormatter.format(scenarioSummary.averageBreachProbability)}
              </div>
            </div>
            <div className="rounded-lg border bg-card p-4">
              <div className="text-sm text-muted-foreground">Highest risk vendor</div>
              <div className="text-sm font-semibold text-foreground">
                {selectedPolicy.vendorProfiles.find((vendor) => vendor.id === scenarioSummary.highestRiskVendorId)?.name ?? "—"}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Audit history & approvals</CardTitle>
          <CardDescription>Capture who changed routing posture, when it happened, and required approvers.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="audit-draft">Log a pending change</Label>
            <Textarea
              id="audit-draft"
              placeholder="Example: Shift 5% from Coastal to OmniPrint before Q2 demand test"
              value={auditDraft}
              onChange={(event) => setAuditDraft(event.target.value)}
            />
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>{pendingApprovalsForPolicy} approvals required before orchestration push.</span>
              <Button type="button" size="sm" onClick={handleCreateAuditEntry}>
                <ShieldAlert className="h-4 w-4" />
                Stage approval
              </Button>
            </div>
          </div>

          <div className="overflow-hidden rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Summary</TableHead>
                  <TableHead>Actor</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Timestamp</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {selectedPolicy.auditTrail.map((entry) => (
                  <TableRow key={entry.id}>
                    <TableCell className="max-w-[240px]">
                      <div className="text-sm text-foreground">{entry.summary}</div>
                      {entry.notes ? (
                        <div className="text-xs text-muted-foreground">{entry.notes}</div>
                      ) : null}
                    </TableCell>
                    <TableCell className="whitespace-nowrap text-sm">{entry.actor}</TableCell>
                    <TableCell className="whitespace-nowrap text-sm text-muted-foreground">{entry.role}</TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={cn(
                          "px-2 py-1 text-xs capitalize",
                          entry.status === "approved"
                            ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-600"
                            : entry.status === "pending"
                              ? "border-amber-500/40 bg-amber-500/10 text-amber-700"
                              : "border-red-500/40 bg-red-500/10 text-red-600"
                        )}
                      >
                        {entry.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="whitespace-nowrap text-sm text-muted-foreground">
                      {formatTimestamp(entry.timestamp)}
                    </TableCell>
                    <TableCell>
                      {entry.status === "pending" ? (
                        <div className="flex gap-2">
                          <Button
                            type="button"
                            size="sm"
                            variant="secondary"
                            onClick={() => handleAuditStatusChange(entry.id, "approved")}
                          >
                            Approve
                          </Button>
                          <Button
                            type="button"
                            size="sm"
                            variant="ghost"
                            onClick={() => handleAuditStatusChange(entry.id, "rejected")}
                          >
                            Reject
                          </Button>
                        </div>
                      ) : (
                        <span className="text-xs text-muted-foreground">—</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
