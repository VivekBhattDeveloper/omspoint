import { useEffect, useMemo, useRef, useState } from "react";
import { addDays, addHours, subHours, format, formatDistanceToNowStrict } from "date-fns";

import { PageHeader } from "@/components/app/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

type ReturnStatus = "awaitingVendor" | "inspectionPending" | "restockPending" | "reprintPending" | "completed";
type ReasonCode = "addressIssue" | "damaged" | "misprint" | "lostInTransit" | "customerRefused";
type Team = "returnsOps" | "printCell" | "qaCell" | "warehouse";

type VendorReturn = {
  id: string;
  rmaNumber: string;
  orderId: string;
  status: ReturnStatus;
  reasonCode: ReasonCode;
  channel: string;
  customer: { name: string; region: string };
  courier: string;
  trackingNumber: string;
  lastUpdate: Date;
  slaDue: Date;
  ndrType?: string;
  disposition: "restock" | "reprint" | "investigate" | "refund";
  issueSummary: string;
  itemSku: string;
  quantity: number;
  value: number;
};

type FulfillmentAction = {
  id: string;
  rmaNumber: string;
  type: "restock" | "reprint" | "qa";
  ownerTeam: Team;
  status: "pending" | "inProgress" | "completed";
  dueDate: Date;
  instructions: string;
};

type CourierFeedback = {
  id: string;
  rmaNumber: string;
  carrier: string;
  milestone: string;
  disputeStatus: "awaitingEvidence" | "evidenceSubmitted" | "resolved";
  responseDue: Date;
  lastUpdate: Date;
  notes: string;
};

type IntegrationState = {
  provider: string;
  status: "connected" | "error" | "syncing";
  lastSync: Date;
  ticketCount: number;
  linkedQueues: string[];
};

const statusCopy: Record<ReturnStatus, { label: string; tone: string }> = {
  awaitingVendor: { label: "Awaiting vendor", tone: "bg-indigo-100 text-indigo-700" },
  inspectionPending: { label: "Inspection pending", tone: "bg-amber-100 text-amber-700" },
  restockPending: { label: "Restock pending", tone: "bg-emerald-100 text-emerald-700" },
  reprintPending: { label: "Reprint pending", tone: "bg-sky-100 text-sky-700" },
  completed: { label: "Closed", tone: "bg-slate-200 text-slate-700" },
};

const reasonCopy: Record<ReasonCode, { label: string; description: string }> = {
  addressIssue: {
    label: "Address issue",
    description: "Delivery failed owing to address validation or routing error.",
  },
  damaged: {
    label: "Damaged in transit",
    description: "Parcel received with visible transit damage.",
  },
  misprint: {
    label: "Print defect",
    description: "Artwork, color, or placement defect reported.",
  },
  lostInTransit: {
    label: "Lost in transit",
    description: "Carrier marked shipment as lost or untraceable.",
  },
  customerRefused: {
    label: "Customer refused",
    description: "Recipient declined delivery or pickup at doorstep.",
  },
};

const teamLabels: Record<Team, string> = {
  returnsOps: "Returns Ops",
  printCell: "Print Cell A",
  qaCell: "QA Cell",
  warehouse: "Warehouse",
};

const disputeStatusTone: Record<CourierFeedback["disputeStatus"], string> = {
  awaitingEvidence: "bg-amber-100 text-amber-700",
  evidenceSubmitted: "bg-indigo-100 text-indigo-700",
  resolved: "bg-emerald-100 text-emerald-700",
};

const formatDisputeStatus = (status: CourierFeedback["disputeStatus"]) =>
  status
    .replace(/([A-Z])/g, " $1")
    .trim()
    .replace(/^./, (char) => char.toUpperCase());

const buildReturns = (): VendorReturn[] => {
  const now = new Date();

  return [
    {
      id: "ret-3201",
      rmaNumber: "RMA-3201",
      orderId: "ORD-78214",
      status: "awaitingVendor",
      reasonCode: "addressIssue",
      channel: "Amazon",
      customer: { name: "Mika Patel", region: "Bengaluru" },
      courier: "Delhivery",
      trackingNumber: "DLV9843745",
      lastUpdate: subHours(now, 3),
      slaDue: addHours(now, 12),
      ndrType: "Address mismatch - apartment not found",
      disposition: "reprint",
      issueSummary: "Carrier flagged address mismatch twice; customer confirmed updated flat number.",
      itemSku: "TS-INK-HEAT-XL",
      quantity: 2,
      value: 48,
    },
    {
      id: "ret-3206",
      rmaNumber: "RMA-3206",
      orderId: "ORD-78302",
      status: "inspectionPending",
      reasonCode: "damaged",
      channel: "Shopify",
      customer: { name: "Noah Fernandes", region: "Goa" },
      courier: "BlueDart",
      trackingNumber: "BDRT5569012",
      lastUpdate: subHours(now, 1),
      slaDue: addHours(now, 6),
      disposition: "restock",
      issueSummary: "Box corner crushed; needs QA photos to approve restock.",
      itemSku: "MUG-PREMIUM-11OZ",
      quantity: 4,
      value: 36,
    },
    {
      id: "ret-3210",
      rmaNumber: "RMA-3210",
      orderId: "ORD-78415",
      status: "reprintPending",
      reasonCode: "misprint",
      channel: "Flipkart",
      customer: { name: "Aditi Rao", region: "Hyderabad" },
      courier: "Ecom Express",
      trackingNumber: "ECX4421900",
      lastUpdate: subHours(now, 7),
      slaDue: addDays(now, 1),
      disposition: "reprint",
      issueSummary: "Color variance > DeltaE 3.5 compared to proof; reprint required.",
      itemSku: "TS-INK-HEAT-M",
      quantity: 1,
      value: 18,
    },
    {
      id: "ret-3224",
      rmaNumber: "RMA-3224",
      orderId: "ORD-78491",
      status: "restockPending",
      reasonCode: "customerRefused",
      channel: "Amazon",
      customer: { name: "Divya Narang", region: "Delhi NCR" },
      courier: "Shadowfax",
      trackingNumber: "SFX9983120",
      lastUpdate: subHours(now, 5),
      slaDue: addHours(now, 30),
      disposition: "restock",
      issueSummary: "Refused at doorstep; restock after verifying packaging integrity.",
      itemSku: "POSTER-A2-PREMIUM",
      quantity: 3,
      value: 27,
    },
    {
      id: "ret-3230",
      rmaNumber: "RMA-3230",
      orderId: "ORD-78540",
      status: "completed",
      reasonCode: "lostInTransit",
      channel: "Amazon",
      customer: { name: "Rahul Sharma", region: "Jaipur" },
      courier: "DTDC",
      trackingNumber: "DTDC5542109",
      lastUpdate: addDays(subHours(now, 2), -1),
      slaDue: addDays(now, -1),
      disposition: "refund",
      issueSummary: "Carrier payout received; refund settled to seller wallet.",
      itemSku: "FRAME-A4-BLACK",
      quantity: 1,
      value: 22,
    },
  ];
};

const buildActionQueue = (): FulfillmentAction[] => {
  const now = new Date();
  return [
    {
      id: "act-101",
      rmaNumber: "RMA-3201",
      type: "reprint",
      ownerTeam: "printCell",
      status: "inProgress",
      dueDate: addHours(now, 10),
      instructions: "Reprint art file REV-14 with updated address label before 3rd shift.",
    },
    {
      id: "act-104",
      rmaNumber: "RMA-3206",
      type: "qa",
      ownerTeam: "qaCell",
      status: "pending",
      dueDate: addHours(now, 4),
      instructions: "Capture defect photos and upload to Loop ticket #LP-2291.",
    },
    {
      id: "act-108",
      rmaNumber: "RMA-3224",
      type: "restock",
      ownerTeam: "warehouse",
      status: "pending",
      dueDate: addHours(now, 20),
      instructions: "Inspect packaging and return to BIN-A3; apply 15% restock fee.",
    },
  ];
};

const buildCourierFeedback = (): CourierFeedback[] => {
  const now = new Date();
  return [
    {
      id: "cf-301",
      rmaNumber: "RMA-3201",
      carrier: "Delhivery",
      milestone: "Awaiting corrected address",
      disputeStatus: "awaitingEvidence",
      responseDue: addHours(now, 6),
      lastUpdate: subHours(now, 2),
      notes: "Need signed customer affidavit before carrier will attempt re-route.",
    },
    {
      id: "cf-304",
      rmaNumber: "RMA-3206",
      carrier: "BlueDart",
      milestone: "Damage claim opened",
      disputeStatus: "evidenceSubmitted",
      responseDue: addHours(now, 18),
      lastUpdate: subHours(now, 1),
      notes: "QA photos uploaded; awaiting carrier adjudication for reimbursement.",
    },
    {
      id: "cf-309",
      rmaNumber: "RMA-3224",
      carrier: "Shadowfax",
      milestone: "Customer refused delivery",
      disputeStatus: "resolved",
      responseDue: addHours(now, -2),
      lastUpdate: subHours(now, 5),
      notes: "Recorded refusal on driver app; SLA clock stopped on return-to-origin.",
    },
  ];
};

const buildIntegrationState = (): IntegrationState => ({
  provider: "Loop Returns",
  status: "connected",
  lastSync: subHours(new Date(), 1),
  ticketCount: 14,
  linkedQueues: ["NDR escalations", "RMA ingestion", "Courier disputes"],
});

export default function VendorReturnsPage() {
  const [mounted, setMounted] = useState(false);
  const [search, setSearch] = useState("");
  const [reasonFilter, setReasonFilter] = useState<ReasonCode | "all">("all");
  const [statusFilter, setStatusFilter] = useState<ReturnStatus | "all">("all");
  const returns = useMemo(() => buildReturns(), []);
  const [selectedRma, setSelectedRma] = useState<VendorReturn | null>(returns[0] ?? null);
  const [actions, setActions] = useState(() => buildActionQueue());
  const [integration, setIntegration] = useState(() => buildIntegrationState());
  const courierFeedback = useMemo(() => buildCourierFeedback(), []);
  const syncTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const formatDateSafely = (date: Date, formatString: string) => {
    if (!mounted) return "Loading...";
    return format(date, formatString);
  };

  useEffect(() => {
    if (selectedRma) return;
    setSelectedRma(returns[0] ?? null);
  }, [returns, selectedRma]);

  const filteredReturns = useMemo(() => {
    const term = search.trim().toLowerCase();

    return returns.filter((item) => {
      const matchesSearch = !term
        ? true
        : [item.rmaNumber, item.orderId, item.customer.name, item.channel].some((field) =>
            field.toLowerCase().includes(term),
          );

      const matchesReason = reasonFilter === "all" ? true : item.reasonCode === reasonFilter;
      const matchesStatus = statusFilter === "all" ? true : item.status === statusFilter;

      return matchesSearch && matchesReason && matchesStatus;
    });
  }, [returns, search, reasonFilter, statusFilter]);

  useEffect(() => {
    if (!selectedRma) return;
    const stillVisible = filteredReturns.some((item) => item.id === selectedRma.id);
    if (!stillVisible) {
      setSelectedRma(filteredReturns[0] ?? null);
    }
  }, [filteredReturns, selectedRma]);

  useEffect(() => {
    return () => {
      if (syncTimer.current) {
        clearTimeout(syncTimer.current);
      }
    };
  }, []);

  const selectedFeedback = useMemo(
    () => (selectedRma ? courierFeedback.filter((item) => item.rmaNumber === selectedRma.rmaNumber) : []),
    [courierFeedback, selectedRma],
  );

  const selectedActions = useMemo(
    () => actions.filter((action) => (selectedRma ? action.rmaNumber === selectedRma.rmaNumber : true)),
    [actions, selectedRma],
  );

  const handleTeamChange = (id: string, team: Team) => {
    setActions((prev) => prev.map((action) => (action.id === id ? { ...action, ownerTeam: team } : action)));
  };

  const handleMarkComplete = (id: string) => {
    setActions((prev) =>
      prev.map((action) => (action.id === id ? { ...action, status: "completed", dueDate: action.dueDate } : action)),
    );
  };

  const handleTriggerSync = () => {
    if (syncTimer.current) {
      clearTimeout(syncTimer.current);
      syncTimer.current = null;
    }

    setIntegration({
      ...integration,
      status: "syncing",
    });

    syncTimer.current = setTimeout(() => {
      setIntegration({
        ...integration,
        status: "connected",
        lastSync: new Date(),
        ticketCount: integration.ticketCount,
      });
      syncTimer.current = null;
    }, 800);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Returns & NDR"
        description="Surface non-delivery reports, RMAs, and corrective follow-up."
      />

      <Card>
        <CardHeader className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <CardTitle>Returns processing service</CardTitle>
            <CardDescription>
              Synchronize Loop Returns tickets with vendor production and courier dispute queues.
            </CardDescription>
          </div>
          <Button onClick={handleTriggerSync} disabled={integration.status === "syncing"}>
            {integration.status === "syncing" ? "Syncing…" : "Sync now"}
          </Button>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-4">
          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground">Provider</p>
            <p className="text-base font-semibold">{integration.provider}</p>
          </div>
          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground">Connection</p>
            <div className="flex items-center gap-2">
              <span
                className={cn(
                  "h-2 w-2 rounded-full",
                  integration.status === "connected"
                    ? "bg-emerald-500"
                    : integration.status === "syncing"
                      ? "bg-sky-500"
                      : "bg-rose-500",
                )}
              />
              <span className="text-sm font-semibold capitalize">{integration.status}</span>
            </div>
          </div>
          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground">Last sync</p>
            <p className="text-sm">{formatDateSafely(integration.lastSync, "dd MMM yyyy, HH:mm")}</p>
          </div>
          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground">Linked queues</p>
            <p className="text-sm">{integration.linkedQueues.join(", ")}</p>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 xl:grid-cols-[2fr_1fr]">
        <div className="flex flex-col gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Open RMAs</CardTitle>
              <CardDescription>Monitor non-delivery and defect cases with SLA coverage.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <Input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search by RMA, order, customer, or channel"
                  className="max-w-sm"
                />
                <div className="flex flex-wrap items-center gap-2">
                  <Select value={reasonFilter} onValueChange={(value) => setReasonFilter(value as ReasonCode | "all")}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Reason" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All reasons</SelectItem>
                      {Object.entries(reasonCopy).map(([key, copy]) => (
                        <SelectItem key={key} value={key}>
                          {copy.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as ReturnStatus | "all")}>
                    <SelectTrigger className="w-[170px]">
                      <SelectValue placeholder="Stage" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All stages</SelectItem>
                      {Object.entries(statusCopy).map(([key, copy]) => (
                        <SelectItem key={key} value={key}>
                          {copy.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="rounded-md border">
                <ScrollArea className="max-h-[320px]">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[120px]">RMA</TableHead>
                        <TableHead>Order</TableHead>
                        <TableHead>Customer</TableHead>
                        <TableHead>Reason</TableHead>
                        <TableHead>SLA</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredReturns.map((item) => {
                        const isSelected = selectedRma?.id === item.id;
                        const timeDiff = formatDistanceToNowStrict(item.slaDue, { addSuffix: true });
                        const overdue = item.slaDue.getTime() < Date.now();

                        return (
                          <TableRow
                            key={item.id}
                            className={cn("cursor-pointer", isSelected && "bg-muted/60")}
                            onClick={() => setSelectedRma(item)}
                          >
                            <TableCell className="font-medium">{item.rmaNumber}</TableCell>
                            <TableCell>
                              <div className="flex flex-col">
                                <span>{item.orderId}</span>
                                <span className="text-xs text-muted-foreground">{item.channel}</span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex flex-col">
                                <span>{item.customer.name}</span>
                                <span className="text-xs text-muted-foreground">{item.customer.region}</span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline">{reasonCopy[item.reasonCode].label}</Badge>
                            </TableCell>
                            <TableCell>
                              <span className={cn("text-sm", overdue && "text-rose-600 font-semibold")}>{timeDiff}</span>
                            </TableCell>
                            <TableCell>
                              <Badge className={cn("text-xs font-medium", statusCopy[item.status].tone)}>
                                {statusCopy[item.status].label}
                              </Badge>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                  {filteredReturns.length === 0 && (
                    <div className="flex items-center justify-center px-6 py-10 text-sm text-muted-foreground">
                      No RMAs match the current filters.
                    </div>
                  )}
                </ScrollArea>
              </div>
            </CardContent>
          </Card>

          {selectedRma && (
            <Card>
              <CardHeader>
                <CardTitle>{selectedRma.rmaNumber}</CardTitle>
                <CardDescription>{selectedRma.issueSummary}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-wrap gap-2">
                  <Badge className={cn("text-xs font-medium", statusCopy[selectedRma.status].tone)}>
                    {statusCopy[selectedRma.status].label}
                  </Badge>
                  <Badge variant="outline">{reasonCopy[selectedRma.reasonCode].label}</Badge>
                  {selectedRma.ndrType ? <Badge variant="outline">NDR • {selectedRma.ndrType}</Badge> : null}
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-muted-foreground">Order</p>
                    <p className="text-sm font-semibold">{selectedRma.orderId}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-muted-foreground">Courier</p>
                    <p className="text-sm font-semibold">
                      {selectedRma.courier} · {selectedRma.trackingNumber}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-muted-foreground">Customer</p>
                    <p className="text-sm font-semibold">
                      {selectedRma.customer.name} · {selectedRma.customer.region}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-muted-foreground">SLA deadline</p>
                    <p className="text-sm font-semibold">
                      {formatDateSafely(selectedRma.slaDue, "dd MMM yyyy, HH:mm")} ({
                        formatDistanceToNowStrict(selectedRma.slaDue, { addSuffix: true })
                      })
                    </p>
                  </div>
                </div>

                <Separator />

                <div className="grid gap-3 md:grid-cols-3">
                  <div>
                    <p className="text-xs uppercase text-muted-foreground">Disposition</p>
                    <p className="text-sm font-medium capitalize">{selectedRma.disposition}</p>
                  </div>
                  <div>
                    <p className="text-xs uppercase text-muted-foreground">Items</p>
                    <p className="text-sm font-medium">
                      {selectedRma.itemSku} × {selectedRma.quantity}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs uppercase text-muted-foreground">Value</p>
                    <p className="text-sm font-medium">${selectedRma.value.toFixed(2)}</p>
                  </div>
                </div>

                <Tabs defaultValue="handoff" className="w-full">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="handoff">Vendor hand-off</TabsTrigger>
                    <TabsTrigger value="notes">Internal notes</TabsTrigger>
                  </TabsList>
                  <TabsContent value="handoff" className="rounded-md border p-4 text-sm text-muted-foreground">
                    Ensure Loop ticket is updated once the action queue (right) is completed so that the seller can
                    refund or reprint automatically. Courier dispute status is mirrored below for the same RMA.
                  </TabsContent>
                  <TabsContent value="notes" className="space-y-2">
                    <Textarea rows={4} placeholder="Drop coordination notes for production or warehouse…" />
                    <div className="flex justify-end">
                      <Button size="sm" variant="outline">
                        Save note
                      </Button>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="flex flex-col gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Fulfillment actions</CardTitle>
              <CardDescription>Assign restock or reprint steps to operational teams.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {selectedActions.length === 0 ? (
                <p className="text-sm text-muted-foreground">No actions are assigned to this RMA.</p>
              ) : (
                selectedActions.map((action) => {
                  const dueLabel = formatDistanceToNowStrict(action.dueDate, { addSuffix: true });
                  const isOverdue = action.dueDate.getTime() < Date.now() && action.status !== "completed";

                  return (
                    <div key={action.id} className="rounded-lg border p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">{action.type}</p>
                          <p className="text-sm text-muted-foreground">{action.instructions}</p>
                        </div>
                        <Badge
                          variant={action.status === "completed" ? "secondary" : "outline"}
                          className={cn(
                            "text-xs font-medium",
                            action.status === "completed" && "bg-emerald-100 text-emerald-700",
                          )}
                        >
                          {action.status === "inProgress" ? "In progress" : action.status.charAt(0).toUpperCase() + action.status.slice(1)}
                        </Badge>
                      </div>

                      <div className="mt-3 flex flex-col gap-3">
                        <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                          <span>
                            Due {dueLabel}
                            {isOverdue ? " • Attention" : ""}
                          </span>
                          <span> · Owner</span>
                          <Select value={action.ownerTeam} onValueChange={(value) => handleTeamChange(action.id, value as Team)}>
                            <SelectTrigger className="h-8 w-[160px] text-xs">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {Object.entries(teamLabels).map(([key, label]) => (
                                <SelectItem key={key} value={key}>
                                  {label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            disabled={action.status === "completed"}
                            onClick={() => handleMarkComplete(action.id)}
                          >
                            Mark completed
                          </Button>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Courier feedback</CardTitle>
              <CardDescription>Dispute status and promised carrier touchpoints.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {selectedFeedback.length === 0 ? (
                <p className="text-sm text-muted-foreground">No courier escalations recorded for this RMA.</p>
              ) : (
                selectedFeedback.map((entry) => (
                  <div key={entry.id} className="rounded-lg border p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold">{entry.carrier}</p>
                        <p className="text-xs uppercase text-muted-foreground">{entry.milestone}</p>
                      </div>
                      <Badge className={cn("text-xs font-medium", disputeStatusTone[entry.disputeStatus])}>
                        {formatDisputeStatus(entry.disputeStatus)}
                      </Badge>
                    </div>
                    <p className="mt-2 text-sm text-muted-foreground">{entry.notes}</p>
                    <div className="mt-3 text-xs text-muted-foreground">
                      <p>Response due {formatDistanceToNowStrict(entry.responseDue, { addSuffix: true })}</p>
                      <p>Last update {formatDistanceToNowStrict(entry.lastUpdate, { addSuffix: true })}</p>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
