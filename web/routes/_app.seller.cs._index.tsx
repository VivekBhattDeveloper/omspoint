import { useEffect, useMemo, useState } from "react";
import {
  addHours,
  addMinutes,
  formatDistanceToNowStrict,
  subHours,
  subMinutes,
} from "date-fns";
import { toast } from "sonner";

import { PageHeader } from "@/components/app/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

type TicketPriority = "critical" | "high" | "medium" | "low";
type TicketStatus = "open" | "awaitingVendor" | "awaitingCustomer" | "resolved";

type TicketConversationEntry = {
  author: string;
  role: "customer" | "seller" | "vendor";
  message: string;
  timestamp: Date;
  channel: "email" | "chat" | "phone";
};

type SupportTicket = {
  id: string;
  channelCaseId: string;
  queue: "Zendesk" | "Gorgias" | "Freshdesk";
  orderId: string;
  customerName: string;
  customerEmail: string;
  channel: string;
  topic: string;
  priority: TicketPriority;
  status: TicketStatus;
  createdAt: Date;
  slaDue: Date;
  assignedTo: string;
  tags: string[];
  lastMessagePreview: string;
  suggestedActions: string[];
  items: Array<{ sku: string; name: string; quantity: number }>;
  conversation: TicketConversationEntry[];
  escalation?: {
    vendor: string;
    action: "reprint" | "addressUpdate" | "hold" | "credit";
    status: "pending" | "accepted" | "completed";
    requestedAt: Date;
    notes: string;
  };
  orderSummary: {
    shippingMethod: string;
    currentFulfillmentStatus: string;
    vendor: string;
    promisedShipDate: string;
  };
};

type ReplyMacro = {
  id: string;
  title: string;
  body: string;
  tags: string[];
};

const priorityStyles: Record<TicketPriority, string> = {
  critical: "border-rose-200 bg-rose-50 text-rose-700",
  high: "border-amber-200 bg-amber-50 text-amber-700",
  medium: "border-sky-200 bg-sky-50 text-sky-700",
  low: "border-emerald-200 bg-emerald-50 text-emerald-700",
};

const statusStyles: Record<TicketStatus, string> = {
  open: "border-amber-200 bg-amber-50 text-amber-700",
  awaitingVendor: "border-indigo-200 bg-indigo-50 text-indigo-700",
  awaitingCustomer: "border-slate-200 bg-slate-50 text-slate-700",
  resolved: "border-emerald-200 bg-emerald-50 text-emerald-700",
};

const macros: ReplyMacro[] = [
  {
    id: "ack-delay",
    title: "Acknowledge production delay",
    body:
      "Thanks for your patience while we check on your order. We've escalated this to our production partner and will confirm a new ship date shortly.",
    tags: ["delay", "vendor escalation"],
  },
  {
    id: "offer-comp",
    title: "Offer shipping credit",
    body:
      "We're expediting a replacement and adding a shipping credit to your account. You'll receive tracking details once the carrier picks up the parcel.",
    tags: ["replacement", "credit"],
  },
  {
    id: "awaiting-cust",
    title: "Request customer photos",
    body:
      "Could you share a photo of the item and the packing slip so we can complete the QA review? Once received, we'll trigger the next step immediately.",
    tags: ["evidence", "qa"],
  },
];

const buildTickets = () => {
  const now = new Date();

  const tickets: SupportTicket[] = [
    {
      id: "TIC-2108",
      channelCaseId: "ZD-81245",
      queue: "Zendesk",
      orderId: "ORD-10592",
      customerName: "Lena Ortiz",
      customerEmail: "lena.ortiz@example.com",
      channel: "Shopify · US Store",
      topic: "Shipment stalled at carrier",
      priority: "high",
      status: "open",
      createdAt: subHours(now, 2),
      slaDue: addHours(subHours(now, 2), 4),
      assignedTo: "Aarav Patel",
      tags: ["delay", "shipping"],
      lastMessagePreview: "Carrier hasn't scanned the parcel since Friday.",
      suggestedActions: [
        "Confirm manifest hand-off with PrintWorks Chicago.",
        "Proactively upgrade shipping to 2-day and share new ETA.",
        "Post shipment note back to Shopify customer timeline.",
      ],
      items: [
        { sku: "MERCH-TEE-CH", name: "MerchX Skyline Tee", quantity: 2 },
        { sku: "MERCH-MUG-01", name: "Ceramic Mug", quantity: 1 },
      ],
      conversation: [
        {
          author: "Lena Ortiz",
          role: "customer",
          message: "Hi team, tracking still shows 'Label Created' after 3 days. Can you confirm ship timing?",
          timestamp: subMinutes(now, 140),
          channel: "email",
        },
        {
          author: "Aarav Patel",
          role: "seller",
          message: "Thanks for flagging! I'm checking with production to confirm if it left the facility.",
          timestamp: subMinutes(now, 110),
          channel: "email",
        },
        {
          author: "PrintWorks OPS",
          role: "vendor",
          message: "Parcel left dock Friday 18:20 CT with manifest #PW-4431. Checking with UPS for first scan.",
          timestamp: subMinutes(now, 55),
          channel: "chat",
        },
      ],
      escalation: {
        vendor: "PrintWorks Chicago",
        action: "reprint",
        status: "pending",
        requestedAt: subMinutes(now, 50),
        notes: "Requesting confirmation of pickup or launch reprint if lost in transit.",
      },
      orderSummary: {
        shippingMethod: "UPS Ground",
        currentFulfillmentStatus: "Awaiting carrier acceptance",
        vendor: "PrintWorks Chicago",
        promisedShipDate: "2025-02-16",
      },
    },
    {
      id: "TIC-2111",
      channelCaseId: "GOR-5611",
      queue: "Gorgias",
      orderId: "ORD-10546",
      customerName: "Malik Johnson",
      customerEmail: "malik.j@example.com",
      channel: "Etsy",
      topic: "Print quality issue",
      priority: "critical",
      status: "awaitingVendor",
      createdAt: subHours(now, 5),
      slaDue: addMinutes(now, 45),
      assignedTo: "Riley Chen",
      tags: ["quality", "reprint"],
      lastMessagePreview: "Uploaded photos showing banding across the artwork.",
      suggestedActions: [
        "Send vendor approved artwork for color calibration.",
        "Arrange no-cost reprint with overnight shipping.",
        "Attach QC checklist to ticket once replacement confirmed.",
      ],
      items: [{ sku: "MERCH-POST-XL", name: "Gallery Poster 24x36", quantity: 1 }],
      conversation: [
        {
          author: "Malik Johnson",
          role: "customer",
          message: "Received the poster today but there are visible stripes across the top.",
          timestamp: subMinutes(now, 210),
          channel: "email",
        },
        {
          author: "Riley Chen",
          role: "seller",
          message: "I'm so sorry about that, Malik. Could you send a couple of photos so I can work with production?",
          timestamp: subMinutes(now, 180),
          channel: "email",
        },
        {
          author: "Malik Johnson",
          role: "customer",
          message: "Photos attached. I'd like a replacement before the event this weekend.",
          timestamp: subMinutes(now, 75),
          channel: "email",
        },
      ],
      escalation: {
        vendor: "ColorLab Austin",
        action: "reprint",
        status: "accepted",
        requestedAt: subMinutes(now, 70),
        notes: "Vendor confirming calibration before reprint batch 2211.",
      },
      orderSummary: {
        shippingMethod: "FedEx 2Day",
        currentFulfillmentStatus: "Reprint scheduled",
        vendor: "ColorLab Austin",
        promisedShipDate: "2025-02-15",
      },
    },
    {
      id: "TIC-2117",
      channelCaseId: "ZD-81292",
      queue: "Zendesk",
      orderId: "ORD-10503",
      customerName: "Grace Liu",
      customerEmail: "grace.liu@example.com",
      channel: "Amazon",
      topic: "Address confirmation",
      priority: "medium",
      status: "awaitingCustomer",
      createdAt: subHours(now, 10),
      slaDue: addMinutes(now, -35),
      assignedTo: "Imani Davis",
      tags: ["address", "hold"],
      lastMessagePreview: "Need apartment number before label can print.",
      suggestedActions: [
        "Hold fulfillment to prevent mis-ship until customer responds.",
        "Auto-remind customer via SMS after 4 business hours.",
        "If no response in 12 hours, route to marketplace cancellation policy.",
      ],
      items: [{ sku: "MERCH-TOTE-02", name: "Canvas Tote", quantity: 1 }],
      conversation: [
        {
          author: "Imani Davis",
          role: "seller",
          message: "Hi Grace! We noticed the apartment number is missing. Could you share it so we can ship today?",
          timestamp: subHours(now, 6),
          channel: "chat",
        },
        {
          author: "System",
          role: "seller",
          message: "Automated reminder sent via SMS.",
          timestamp: subHours(now, 2),
          channel: "chat",
        },
      ],
      orderSummary: {
        shippingMethod: "USPS Priority",
        currentFulfillmentStatus: "On hold – address verification",
        vendor: "FulfillRight NJ",
        promisedShipDate: "2025-02-14",
      },
    },
  ];

  return tickets;
};

const initialTickets = buildTickets();

const formatSlaCountdown = (due: Date, now: Date) => {
  const diff = due.getTime() - now.getTime();
  const absolute = Math.abs(diff);
  const totalMinutes = Math.max(1, Math.round(absolute / 60000));
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  const label = hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
  return diff >= 0 ? `Due in ${label}` : `Overdue ${label}`;
};

const withinSlaRiskWindow = (due: Date, now: Date) => due.getTime() - now.getTime() <= 60 * 60 * 1000;

const computeSlaProgress = (ticket: SupportTicket, now: Date) => {
  const total = ticket.slaDue.getTime() - ticket.createdAt.getTime();
  if (total <= 0) return 100;
  const elapsed = now.getTime() - ticket.createdAt.getTime();
  const rawValue = (elapsed / total) * 100;
  if (!Number.isFinite(rawValue)) {
    return 0;
  }
  return Math.max(0, Math.min(120, Math.round(rawValue)));
};

export default function SellerCustomerServicePage() {
  const [tickets] = useState<SupportTicket[]>(initialTickets);
  const [search, setSearch] = useState("");
  const [queueFilter, setQueueFilter] = useState<string>("all");
  const [viewFilter, setViewFilter] = useState<string>("inbox");
  const [priorityFilter, setPriorityFilter] = useState<string>("all");
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(
    tickets.length > 0 ? tickets[0].id : null
  );
  const [replyDraft, setReplyDraft] = useState("");
  const [now, setNow] = useState(() => new Date());
  const [escalationVendor, setEscalationVendor] = useState("PrintWorks Chicago");
  const [escalationAction, setEscalationAction] = useState("reprint");
  const [escalationNotes, setEscalationNotes] = useState("Requesting carrier trace before reprint.");

  useEffect(() => {
    const interval = window.setInterval(() => setNow(new Date()), 60_000);
    return () => window.clearInterval(interval);
  }, []);

  const filteredTickets = useMemo(() => {
    return tickets.filter((ticket) => {
      if (queueFilter !== "all" && ticket.queue !== queueFilter) {
        return false;
      }

      if (priorityFilter !== "all" && ticket.priority !== priorityFilter) {
        return false;
      }

      if (viewFilter === "slaRisk" && !withinSlaRiskWindow(ticket.slaDue, now)) {
        return false;
      }

      if (viewFilter === "escalated" && !ticket.escalation) {
        return false;
      }

      if (viewFilter === "awaitingCustomer" && ticket.status !== "awaitingCustomer") {
        return false;
      }

      if (search) {
        const query = search.toLowerCase();
        const haystack = [
          ticket.id,
          ticket.orderId,
          ticket.customerName,
          ticket.customerEmail,
          ticket.topic,
          ticket.tags.join(" "),
        ]
          .join(" ")
          .toLowerCase();
        if (!haystack.includes(query)) {
          return false;
        }
      }

      return ticket.status !== "resolved" || viewFilter === "escalated" || viewFilter === "awaitingCustomer";
    });
  }, [tickets, queueFilter, priorityFilter, viewFilter, search, now]);

  useEffect(() => {
    if (filteredTickets.length === 0) {
      setSelectedTicketId(null);
      return;
    }

    if (!selectedTicketId || !filteredTickets.some((ticket) => ticket.id === selectedTicketId)) {
      setSelectedTicketId(filteredTickets[0].id);
    }
  }, [filteredTickets, selectedTicketId]);

  useEffect(() => {
    setReplyDraft("");
  }, [selectedTicketId]);

  const selectedTicket = selectedTicketId
    ? tickets.find((ticket) => ticket.id === selectedTicketId) ?? null
    : null;

  const metrics = useMemo(() => {
    const openTickets = tickets.filter((ticket) => ticket.status !== "resolved").length;
    const slaBreaches = tickets.filter(
      (ticket) => ticket.status !== "resolved" && ticket.slaDue.getTime() - now.getTime() <= 0
    ).length;
    const escalationsPending = tickets.filter(
      (ticket) => ticket.escalation && ticket.escalation.status === "pending"
    ).length;
    const awaitingCustomer = tickets.filter((ticket) => ticket.status === "awaitingCustomer").length;

    return { openTickets, slaBreaches, escalationsPending, awaitingCustomer };
  }, [tickets, now]);

  const handleInsertMacro = (macro: ReplyMacro) => {
    setReplyDraft((draft) => {
      if (!draft) return macro.body;
      return `${draft}\n\n${macro.body}`;
    });
    toast.success("Macro inserted into reply draft");
  };

  const handleSendReply = () => {
    if (!selectedTicket) return;
    if (!replyDraft.trim()) {
      toast.error("Add a response before sending");
      return;
    }
    toast.success(`Reply queued to ${selectedTicket.customerName}`);
    setReplyDraft("");
  };

  const handleEscalationSubmit = () => {
    toast.success(`Escalation sent to ${escalationVendor}`);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Customer Service"
        description="Surface customer inquiries, order issues, and suggested resolutions."
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Open tickets</CardDescription>
            <CardTitle className="text-3xl font-semibold">{metrics.openTickets}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">
              Active conversations syncing from Zendesk and Gorgias queues.
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>SLA breaches</CardDescription>
            <CardTitle className="text-3xl font-semibold">{metrics.slaBreaches}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">Tickets exceeding customer promise windows.</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Vendor escalations</CardDescription>
            <CardTitle className="text-3xl font-semibold">{metrics.escalationsPending}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">Actions awaiting production partner confirmation.</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Awaiting customer</CardDescription>
            <CardTitle className="text-3xl font-semibold">{metrics.awaitingCustomer}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">Follow-ups waiting on shopper responses.</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 xl:grid-cols-[2fr,1fr]">
        <Card className="h-full">
          <CardHeader className="gap-2">
            <CardTitle>Support backlog</CardTitle>
            <CardDescription>Integrate with your ticketing system and monitor SLA countdowns.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex flex-col gap-3 md:flex-row">
                <Select value={queueFilter} onValueChange={setQueueFilter}>
                  <SelectTrigger className="w-[200px]">
                    <SelectValue placeholder="Queue" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All queues</SelectItem>
                    <SelectItem value="Zendesk">Zendesk</SelectItem>
                    <SelectItem value="Gorgias">Gorgias</SelectItem>
                    <SelectItem value="Freshdesk">Freshdesk</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={viewFilter} onValueChange={setViewFilter}>
                  <SelectTrigger className="w-[200px]">
                    <SelectValue placeholder="Focus view" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="inbox">Active queue</SelectItem>
                    <SelectItem value="slaRisk">SLA risk ≤ 1h</SelectItem>
                    <SelectItem value="escalated">Escalated to vendor</SelectItem>
                    <SelectItem value="awaitingCustomer">Awaiting customer</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All priorities</SelectItem>
                    <SelectItem value="critical">Critical</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="low">Low</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search ticket, order, customer…"
                className="w-full max-w-xs"
              />
            </div>

            <div className="overflow-hidden rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Ticket</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Priority</TableHead>
                    <TableHead>SLA</TableHead>
                    <TableHead>Assigned</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTickets.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="py-8 text-center text-sm text-muted-foreground">
                        No tickets match the current filters.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredTickets.map((ticket) => {
                      const isSelected = ticket.id === selectedTicketId;
                      const slaText = formatSlaCountdown(ticket.slaDue, now);
                      const slaOverdue = ticket.slaDue.getTime() - now.getTime() < 0;

                      return (
                        <TableRow
                          key={ticket.id}
                          onClick={() => setSelectedTicketId(ticket.id)}
                          className={cn(
                            "cursor-pointer transition-colors",
                            isSelected ? "bg-muted" : "hover:bg-muted/60"
                          )}
                        >
                          <TableCell className="space-y-1">
                            <div className="font-medium">{ticket.id}</div>
                            <div className="text-xs text-muted-foreground">
                              {ticket.orderId} · {ticket.queue}
                            </div>
                          </TableCell>
                          <TableCell className="space-y-1">
                            <div className="font-medium">{ticket.customerName}</div>
                            <div className="text-xs text-muted-foreground">{ticket.channel}</div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className={cn(priorityStyles[ticket.priority], "capitalize")}>{ticket.priority}</Badge>
                          </TableCell>
                          <TableCell className="space-y-2">
                            <Badge
                              variant="outline"
                              className={cn(
                                slaOverdue ? "border-rose-200 bg-rose-50 text-rose-700" : "border-emerald-200 bg-emerald-50 text-emerald-700"
                              )}
                            >
                              {slaText}
                            </Badge>
                            <Progress value={computeSlaProgress(ticket, now)} />
                          </TableCell>
                          <TableCell>
                            <div className="font-medium">{ticket.assignedTo}</div>
                            <div className="text-xs text-muted-foreground">{ticket.status.replace(/([A-Z])/g, " $1").toLowerCase()}</div>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Escalate to vendor operations</CardTitle>
              <CardDescription>Trigger production actions and capture audit notes.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Select value={escalationVendor} onValueChange={setEscalationVendor}>
                <SelectTrigger>
                  <SelectValue placeholder="Select vendor" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PrintWorks Chicago">PrintWorks Chicago</SelectItem>
                  <SelectItem value="ColorLab Austin">ColorLab Austin</SelectItem>
                  <SelectItem value="FulfillRight NJ">FulfillRight NJ</SelectItem>
                </SelectContent>
              </Select>
              <Select value={escalationAction} onValueChange={setEscalationAction}>
                <SelectTrigger>
                  <SelectValue placeholder="Select action" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="reprint">Launch reprint</SelectItem>
                  <SelectItem value="addressUpdate">Update address</SelectItem>
                  <SelectItem value="hold">Hold production</SelectItem>
                  <SelectItem value="credit">Issue credit</SelectItem>
                </SelectContent>
              </Select>
              <Textarea
                value={escalationNotes}
                onChange={(event) => setEscalationNotes(event.target.value)}
                placeholder="Provide context for vendor ops…"
                className="min-h-[96px]"
              />
              <Button onClick={handleEscalationSubmit}>Send escalation</Button>
            </CardContent>
          </Card>

          {selectedTicket ? (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between gap-4 text-base">
                  <span>
                    {selectedTicket.topic}
                    <span className="ml-2 text-xs font-normal text-muted-foreground">
                      {selectedTicket.id} · {selectedTicket.channelCaseId}
                    </span>
                  </span>
                  <Badge variant="outline" className={cn(statusStyles[selectedTicket.status], "capitalize")}>
                    {selectedTicket.status.replace(/([A-Z])/g, " $1").toLowerCase()}
                  </Badge>
                </CardTitle>
                <CardDescription>
                  Order {selectedTicket.orderId} · {selectedTicket.orderSummary.currentFulfillmentStatus}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Tabs defaultValue="conversation">
                  <TabsList>
                    <TabsTrigger value="conversation">Conversation</TabsTrigger>
                    <TabsTrigger value="context">Order context</TabsTrigger>
                    <TabsTrigger value="macros">Macros</TabsTrigger>
                  </TabsList>
                  <TabsContent value="conversation" className="space-y-3">
                    <div className="rounded-md border">
                      <ScrollArea className="max-h-64">
                        <div className="space-y-4 p-4">
                          {selectedTicket.conversation.map((entry, index) => (
                            <div key={`${entry.author}-${index}`} className="space-y-1">
                              <div className="flex items-center justify-between text-sm">
                                <span className="font-medium">
                                  {entry.author}
                                  <span className="ml-2 text-xs uppercase text-muted-foreground">{entry.role}</span>
                                </span>
                                <span className="text-xs text-muted-foreground">
                                  {formatDistanceToNowStrict(entry.timestamp, { addSuffix: true })}
                                </span>
                              </div>
                              <p className="text-sm text-muted-foreground">{entry.message}</p>
                              <div className="text-xs text-muted-foreground">Via {entry.channel}</div>
                            </div>
                          ))}
                        </div>
                      </ScrollArea>
                    </div>
                  </TabsContent>
                  <TabsContent value="context" className="space-y-4">
                    <div>
                      <h4 className="text-sm font-semibold">Fulfillment</h4>
                      <p className="text-sm text-muted-foreground">
                        {selectedTicket.orderSummary.vendor} · {selectedTicket.orderSummary.currentFulfillmentStatus}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Ship method {selectedTicket.orderSummary.shippingMethod} · Promise {selectedTicket.orderSummary.promisedShipDate}
                      </p>
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold">Items</h4>
                      <ul className="space-y-1 text-sm text-muted-foreground">
                        {selectedTicket.items.map((item) => (
                          <li key={item.sku}>
                            {item.name} · {item.quantity} × {item.sku}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold">Suggested actions</h4>
                      <ul className="list-disc space-y-1 pl-5 text-sm text-muted-foreground">
                        {selectedTicket.suggestedActions.map((action) => (
                          <li key={action}>{action}</li>
                        ))}
                      </ul>
                    </div>
                  </TabsContent>
                  <TabsContent value="macros" className="space-y-3">
                    {macros.map((macro) => (
                      <div key={macro.id} className="rounded-md border p-3">
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <p className="text-sm font-semibold">{macro.title}</p>
                            <p className="text-xs text-muted-foreground">{macro.tags.join(" · ")}</p>
                          </div>
                          <Button size="sm" variant="secondary" onClick={() => handleInsertMacro(macro)}>
                            Insert
                          </Button>
                        </div>
                        <p className="mt-2 text-sm text-muted-foreground">{macro.body}</p>
                      </div>
                    ))}
                  </TabsContent>
                </Tabs>

                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>Reply as {selectedTicket.assignedTo}</span>
                    <span>
                      SLA {formatSlaCountdown(selectedTicket.slaDue, now)}
                    </span>
                  </div>
                  <Textarea
                    value={replyDraft}
                    onChange={(event) => setReplyDraft(event.target.value)}
                    placeholder="Draft response to customer…"
                    className="min-h-[112px]"
                  />
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-muted-foreground">Conversation syncs back to {selectedTicket.queue}.</p>
                    <Button onClick={handleSendReply}>Send reply</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>No ticket selected</CardTitle>
                <CardDescription>Select a ticket from the backlog to review details.</CardDescription>
              </CardHeader>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
