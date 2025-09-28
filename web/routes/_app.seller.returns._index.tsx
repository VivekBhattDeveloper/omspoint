import { useEffect, useMemo, useState } from "react";
import {
  addDays,
  addHours,
  subDays,
  subHours,
  format,
  formatDistanceToNowStrict,
} from "date-fns";
import { toast } from "sonner";

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

type ReturnStatus =
  | "awaitingInspection"
  | "awaitingVendor"
  | "refundPending"
  | "restockPending"
  | "settled"
  | "closed";

type ReturnDisposition = "refund" | "restock" | "reprint" | "credit" | "noAction";

type ReturnReasonCode =
  | "damagedOnArrival"
  | "misprint"
  | "wrongItem"
  | "lateDelivery"
  | "customerRemorse";

type CommunicationChannel = "email" | "chat" | "phone" | "note" | "system";

type CommunicationRole = "customer" | "seller" | "vendor" | "system";

type VendorActionType = "reprint" | "credit" | "investigate";

type VendorActionStatus = "pending" | "accepted" | "inProgress" | "completed" | "declined";

type RestockStatus = "pending" | "inProgress" | "completed";

type SettlementStatus = "pending" | "inProgress" | "settled";

type ReturnItem = {
  sku: string;
  description: string;
  quantity: number;
  condition: "sealed" | "opened" | "used";
  inspected: boolean;
};

type ReturnCommunication = {
  id: string;
  timestamp: Date;
  author: string;
  role: CommunicationRole;
  channel: CommunicationChannel;
  summary: string;
  detail?: string;
};

type VendorCoordination = {
  vendorName: string;
  action: VendorActionType;
  status: VendorActionStatus;
  dueDate: Date;
  lastUpdated: Date;
  reference: string;
  notes: string;
};

type RestockPlan = {
  required: boolean;
  location: string;
  status: RestockStatus;
  quantity: number;
  bin: string;
  lastUpdated: Date;
  notes?: string;
};

type SettlementInfo = {
  settlementId: string;
  status: SettlementStatus;
  amount: number;
  currency: string;
  dueDate: Date;
  lastUpdated: Date;
  channel: string;
};

type ReturnCase = {
  id: string;
  rmaNumber: string;
  orderId: string;
  channel: string;
  customerName: string;
  customerEmail: string;
  requestedAt: Date;
  slaDue: Date;
  policyWindow: string;
  status: ReturnStatus;
  disposition: ReturnDisposition;
  reasonCode: ReturnReasonCode;
  reasonDetail: string;
  refundAmount: number;
  restockingFee: number;
  currency: string;
  items: ReturnItem[];
  vendorCoordination?: VendorCoordination;
  restockPlan?: RestockPlan;
  settlement: SettlementInfo;
  communications: ReturnCommunication[];
  lastUpdated: Date;
  tags: string[];
};

const reasonCatalog: Record<ReturnReasonCode, { label: string; description: string }> = {
  damagedOnArrival: {
    label: "Damaged on arrival",
    description: "Customer received item with transit or packaging damage.",
  },
  misprint: {
    label: "Print defect",
    description: "Artwork, color, or placement issue reported by customer.",
  },
  wrongItem: {
    label: "Wrong item",
    description: "Incorrect SKU or variation shipped to customer.",
  },
  lateDelivery: {
    label: "Late delivery",
    description: "Parcel delivered outside promised SLA window.",
  },
  customerRemorse: {
    label: "Customer remorse",
    description: "Buyer changed mind or no longer needs the item.",
  },
};

const dispositionCatalog: Record<ReturnDisposition, { label: string; description: string }> = {
  refund: { label: "Refund", description: "Return funds to customer once inspection clears." },
  restock: { label: "Restock", description: "Return to inventory after QA inspection." },
  reprint: { label: "Reprint", description: "Trigger vendor to manufacture replacement." },
  credit: { label: "Credit", description: "Issue store credit in lieu of refund." },
  noAction: { label: "No action", description: "Close case without financial impact." },
};

const statusStyles: Record<ReturnStatus, { label: string; badge: string }> = {
  awaitingInspection: { label: "Awaiting inspection", badge: "bg-amber-100 text-amber-700" },
  awaitingVendor: { label: "Awaiting vendor", badge: "bg-indigo-100 text-indigo-700" },
  refundPending: { label: "Refund pending", badge: "bg-sky-100 text-sky-700" },
  restockPending: { label: "Restock pending", badge: "bg-emerald-100 text-emerald-700" },
  settled: { label: "Settlement in progress", badge: "bg-slate-200 text-slate-700" },
  closed: { label: "Closed", badge: "bg-zinc-800 text-white" },
};

const vendorStatusStyles: Record<VendorActionStatus, string> = {
  pending: "bg-amber-100 text-amber-700",
  accepted: "bg-sky-100 text-sky-700",
  inProgress: "bg-indigo-100 text-indigo-700",
  completed: "bg-emerald-100 text-emerald-700",
  declined: "bg-rose-100 text-rose-700",
};

const settlementStatusStyles: Record<SettlementStatus, string> = {
  pending: "bg-amber-100 text-amber-700",
  inProgress: "bg-sky-100 text-sky-700",
  settled: "bg-emerald-100 text-emerald-700",
};

const vendorActionLabels: Record<VendorActionType, string> = {
  credit: "Credit",
  reprint: "Reprint",
  investigate: "Investigate defect",
};

const buildReturnCases = (): ReturnCase[] => {
  const now = new Date();

  return [
    {
      id: "ret-1021",
      rmaNumber: "RMA-2418",
      orderId: "ORD-10592",
      channel: "Shopify · US",
      customerName: "Lena Ortiz",
      customerEmail: "lena.ortiz@example.com",
      requestedAt: subDays(now, 2),
      slaDue: addHours(subDays(now, 2), 72),
      policyWindow: "30 day return window",
      status: "awaitingInspection",
      disposition: "refund",
      reasonCode: "damagedOnArrival",
      reasonDetail: "Box arrived crushed and water damaged."
        + " Customer provided photos of damaged packaging and item.",
      refundAmount: 68,
      restockingFee: 0,
      currency: "USD",
      items: [
        {
          sku: "MERCH-TEE-CH",
          description: "MerchX Skyline Tee · Charcoal · L",
          quantity: 1,
          condition: "opened",
          inspected: false,
        },
        {
          sku: "MERCH-MUG-01",
          description: "Ceramic Mug · 11oz",
          quantity: 1,
          condition: "used",
          inspected: false,
        },
      ],
      vendorCoordination: {
        vendorName: "PrintWorks Chicago",
        action: "credit",
        status: "pending",
        dueDate: addHours(now, 18),
        lastUpdated: subHours(now, 5),
        reference: "VN-8891",
        notes: "Awaiting carrier damage confirmation before issuing vendor credit.",
      },
      restockPlan: {
        required: false,
        location: "Returns Hub · Los Angeles",
        status: "pending",
        quantity: 0,
        bin: "N/A",
        lastUpdated: subHours(now, 5),
      },
      settlement: {
        settlementId: "SET-7781",
        status: "pending",
        amount: 68,
        currency: "USD",
        dueDate: addDays(now, 2),
        lastUpdated: subHours(now, 3),
        channel: "Stripe Payout",
      },
      communications: [
        {
          id: "comm-1",
          timestamp: subHours(now, 1),
          author: "Returns Bot",
          role: "system",
          channel: "system",
          summary: "Inspection task assigned to LA Returns Hub",
          detail: "Queued inspection checklist RET-LA-442 for next pickup window.",
        },
        {
          id: "comm-2",
          timestamp: subHours(now, 6),
          author: "Lena Ortiz",
          role: "customer",
          channel: "email",
          summary: "Uploaded damage photos",
          detail: "Provided three attachments of damaged packaging and mug handle crack.",
        },
        {
          id: "comm-3",
          timestamp: subHours(now, 8),
          author: "Aarav Patel",
          role: "seller",
          channel: "email",
          summary: "Acknowledged return request",
          detail: "Confirmed prepaid return label issued and inspection scheduled.",
        },
      ],
      lastUpdated: subHours(now, 1),
      tags: ["carrier damage", "photo evidence"],
    },
    {
      id: "ret-1025",
      rmaNumber: "RMA-2422",
      orderId: "ORD-10588",
      channel: "Amazon Marketplace",
      customerName: "Malik Johnson",
      customerEmail: "malik.j@example.com",
      requestedAt: subDays(now, 4),
      slaDue: addHours(subDays(now, 4), 96),
      policyWindow: "45 day return window",
      status: "awaitingVendor",
      disposition: "reprint",
      reasonCode: "misprint",
      reasonDetail: "Print misalignment by 1.5cm to the left on hoodie front graphic.",
      refundAmount: 0,
      restockingFee: 0,
      currency: "USD",
      items: [
        {
          sku: "MERCH-HOOD-01",
          description: "Signature Hoodie · Navy · XL",
          quantity: 1,
          condition: "opened",
          inspected: true,
        },
      ],
      vendorCoordination: {
        vendorName: "Northwind Print Labs",
        action: "reprint",
        status: "inProgress",
        dueDate: addDays(now, 1),
        lastUpdated: subHours(now, 2),
        reference: "VN-7744",
        notes: "Vendor accepted reprint. Awaiting press slot confirmation.",
      },
      restockPlan: {
        required: false,
        location: "Production scrap",
        status: "completed",
        quantity: 0,
        bin: "Recycle",
        lastUpdated: subHours(now, 10),
        notes: "Damaged item scrapped per QA policy.",
      },
      settlement: {
        settlementId: "SET-7778",
        status: "inProgress",
        amount: 0,
        currency: "USD",
        dueDate: addDays(now, 5),
        lastUpdated: subHours(now, 2),
        channel: "Vendor credit memo",
      },
      communications: [
        {
          id: "comm-4",
          timestamp: subHours(now, 2),
          author: "Northwind OPS",
          role: "vendor",
          channel: "chat",
          summary: "Reprint scheduled",
          detail: "Replacement queued on DTG line B for Feb 18 morning run.",
        },
        {
          id: "comm-5",
          timestamp: subHours(now, 6),
          author: "Malik Johnson",
          role: "customer",
          channel: "email",
          summary: "Requested status update",
          detail: "Customer asking when replacement will ship.",
        },
        {
          id: "comm-6",
          timestamp: subHours(now, 9),
          author: "Riley Chen",
          role: "seller",
          channel: "email",
          summary: "Provided reprint ETA",
          detail: "Shared target ship date Feb 18 and tracking to follow.",
        },
      ],
      lastUpdated: subHours(now, 2),
      tags: ["reprint", "quality defect"],
    },
    {
      id: "ret-1029",
      rmaNumber: "RMA-2427",
      orderId: "ORD-10571",
      channel: "Shopify · EU",
      customerName: "Elena Rossi",
      customerEmail: "elena.rossi@example.eu",
      requestedAt: subDays(now, 6),
      slaDue: addHours(subDays(now, 6), 120),
      policyWindow: "30 day return window",
      status: "refundPending",
      disposition: "refund",
      reasonCode: "lateDelivery",
      reasonDetail: "Parcel arrived 5 days late for event despite expedited shipping.",
      refundAmount: 92,
      restockingFee: 0,
      currency: "USD",
      items: [
        {
          sku: "MERCH-POST-03",
          description: "Limited Poster · 18x24",
          quantity: 2,
          condition: "sealed",
          inspected: true,
        },
      ],
      vendorCoordination: {
        vendorName: "EuroPrint Collective",
        action: "credit",
        status: "accepted",
        dueDate: addDays(now, 3),
        lastUpdated: subHours(now, 12),
        reference: "VN-7719",
        notes: "Carrier delay accepted. Vendor to credit expedited label cost.",
      },
      restockPlan: {
        required: true,
        location: "EU Fulfillment · Amsterdam",
        status: "inProgress",
        quantity: 2,
        bin: "A2-14",
        lastUpdated: subHours(now, 4),
        notes: "Waiting QA confirmation before bin move.",
      },
      settlement: {
        settlementId: "SET-7763",
        status: "pending",
        amount: 92,
        currency: "USD",
        dueDate: addDays(now, 1),
        lastUpdated: subHours(now, 6),
        channel: "Adyen",
      },
      communications: [
        {
          id: "comm-7",
          timestamp: subHours(now, 4),
          author: "Elena Rossi",
          role: "customer",
          channel: "email",
          summary: "Confirmed items returned",
          detail: "Customer confirmed drop-off with DHL tracking EU44319812.",
        },
        {
          id: "comm-8",
          timestamp: subHours(now, 10),
          author: "Returns Bot",
          role: "system",
          channel: "system",
          summary: "Refund queued",
          detail: "Refund job FR-5512 staged for nightly payout run.",
        },
      ],
      lastUpdated: subHours(now, 4),
      tags: ["late delivery", "SLA miss"],
    },
    {
      id: "ret-1034",
      rmaNumber: "RMA-2435",
      orderId: "ORD-10540",
      channel: "Etsy",
      customerName: "Hannah Lee",
      customerEmail: "hannah.lee@example.com",
      requestedAt: subDays(now, 12),
      slaDue: addHours(subDays(now, 12), 144),
      policyWindow: "60 day return window",
      status: "settled",
      disposition: "credit",
      reasonCode: "customerRemorse",
      reasonDetail: "Customer decided item not needed after gifting duplicate received.",
      refundAmount: 0,
      restockingFee: 5,
      currency: "USD",
      items: [
        {
          sku: "MERCH-TOTE-02",
          description: "Canvas Tote · Natural",
          quantity: 1,
          condition: "sealed",
          inspected: true,
        },
      ],
      vendorCoordination: {
        vendorName: "Coastal Stitch",
        action: "investigate",
        status: "completed",
        dueDate: subDays(now, 5),
        lastUpdated: subDays(now, 5),
        reference: "VN-7611",
        notes: "No vendor action needed. Closed with restocking fee applied.",
      },
      restockPlan: {
        required: true,
        location: "Seller Warehouse · Newark",
        status: "completed",
        quantity: 1,
        bin: "B04-22",
        lastUpdated: subDays(now, 4),
        notes: "Returned to stock and inventory sync pushed to channels.",
      },
      settlement: {
        settlementId: "SET-7701",
        status: "settled",
        amount: -5,
        currency: "USD",
        dueDate: subDays(now, 3),
        lastUpdated: subDays(now, 3),
        channel: "Shopify Balance",
      },
      communications: [
        {
          id: "comm-9",
          timestamp: subDays(now, 3),
          author: "Settlement Bot",
          role: "system",
          channel: "system",
          summary: "Credit applied",
          detail: "Issued $25 store credit minus $5 restocking fee.",
        },
        {
          id: "comm-10",
          timestamp: subDays(now, 5),
          author: "Hannah Lee",
          role: "customer",
          channel: "chat",
          summary: "Confirmed store credit received",
          detail: "Customer acknowledged voucher code delivery.",
        },
      ],
      lastUpdated: subDays(now, 3),
      tags: ["restock", "store credit"],
    },
  ];
};

const reasonOptions: Array<{ value: ReturnReasonCode; label: string }> = Object.entries(reasonCatalog).map(
  ([value, meta]) => ({ value: value as ReturnReasonCode, label: meta.label })
);

const dispositionOptions = (Object.entries(dispositionCatalog) as Array<[
  ReturnDisposition,
  { label: string; description: string }
]>).map(([value, { label }]) => ({ value, label }));

export default function SellerReturnsPage() {
  const [returns, setReturns] = useState<ReturnCase[]>(buildReturnCases);
  const [selectedReturnId, setSelectedReturnId] = useState<string>("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<ReturnStatus | "all">("all");
  const [dispositionFilter, setDispositionFilter] = useState<ReturnDisposition | "all">("all");
  const [noteDraft, setNoteDraft] = useState("");

  useEffect(() => {
    if (!selectedReturnId && returns.length > 0) {
      setSelectedReturnId(returns[0].id);
    }
  }, [selectedReturnId, returns]);

  const currency = useMemo(
    () =>
      new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
        minimumFractionDigits: 2,
      }),
    []
  );

  const filteredReturns = useMemo(() => {
    return returns.filter((record) => {
      const matchesSearch = [
        record.rmaNumber,
        record.orderId,
        record.customerName,
        record.channel,
        reasonCatalog[record.reasonCode].label,
      ]
        .join(" ")
        .toLowerCase()
        .includes(search.trim().toLowerCase());

      const matchesStatus = statusFilter === "all" || record.status === statusFilter;
      const matchesDisposition =
        dispositionFilter === "all" || record.disposition === dispositionFilter;

      return matchesSearch && matchesStatus && matchesDisposition;
    });
  }, [returns, search, statusFilter, dispositionFilter]);

  const selectedReturn = useMemo(
    () => returns.find((record) => record.id === selectedReturnId),
    [returns, selectedReturnId]
  );

  const updateReturn = (id: string, updater: (record: ReturnCase) => ReturnCase) => {
    setReturns((prev) => prev.map((record) => (record.id === id ? updater(record) : record)));
  };

  const handleApproveRefund = () => {
    if (!selectedReturn) return;

    updateReturn(selectedReturn.id, (record) => {
      const timestamp = new Date();

      return {
        ...record,
        status: record.status === "refundPending" ? "settled" : "refundPending",
        settlement: {
          ...record.settlement,
          status: record.status === "refundPending" ? "settled" : "inProgress",
          lastUpdated: timestamp,
          dueDate:
            record.status === "refundPending" ? timestamp : addDays(timestamp, 1),
        },
        communications: [
          {
            id: `comm-${timestamp.getTime()}`,
            timestamp,
            author: "Returns Bot",
            role: "system",
            channel: "system",
            summary:
              record.status === "refundPending"
                ? "Refund posted to settlement"
                : "Refund approved",
            detail:
              record.status === "refundPending"
                ? `Marked settlement ${record.settlement.settlementId} as complete.`
                : `Approved refund of ${currency.format(record.refundAmount)} for order ${record.orderId}.`,
          },
          ...record.communications,
        ],
        lastUpdated: timestamp,
      };
    });

    toast.success("Refund workflow updated");
  };

  const handleTriggerRestock = () => {
    if (!selectedReturn || !selectedReturn.restockPlan) return;

    updateReturn(selectedReturn.id, (record) => {
      const timestamp = new Date();
      const nextStatus: ReturnStatus = record.restockPlan?.status === "completed" ? "closed" : "restockPending";

      return {
        ...record,
        status: nextStatus,
        restockPlan: record.restockPlan
          ? {
              ...record.restockPlan,
              status:
                record.restockPlan.status === "pending"
                  ? "inProgress"
                  : record.restockPlan.status === "inProgress"
                    ? "completed"
                    : "completed",
              lastUpdated: timestamp,
            }
          : undefined,
        communications: [
          {
            id: `comm-${timestamp.getTime()}`,
            timestamp,
            author: "Operations",
            role: "seller",
            channel: "note",
            summary:
              record.restockPlan?.status === "completed"
                ? "Restock complete"
                : "Restock queue updated",
            detail:
              record.restockPlan?.status === "completed"
                ? `Marked inventory bin ${record.restockPlan.bin} as restocked.`
                : "Triggered restock workflow and notified warehouse team.",
          },
          ...record.communications,
        ],
        lastUpdated: timestamp,
      };
    });

    toast.success("Restock workflow updated");
  };

  const handleRequestVendorFollowUp = () => {
    if (!selectedReturn || !selectedReturn.vendorCoordination) return;

    updateReturn(selectedReturn.id, (record) => {
      const timestamp = new Date();
      const vendorStatus = record.vendorCoordination?.status;
      const nextStatus: VendorActionStatus =
        vendorStatus === "pending"
          ? "inProgress"
          : vendorStatus === "inProgress"
            ? "completed"
            : "pending";

      return {
        ...record,
        vendorCoordination: record.vendorCoordination
          ? {
              ...record.vendorCoordination,
              status: nextStatus,
              lastUpdated: timestamp,
              notes:
                nextStatus === "completed"
                  ? `${record.vendorCoordination.vendorName} confirmed resolution.`
                  : record.vendorCoordination.notes,
            }
          : undefined,
        status:
          nextStatus === "completed" && record.status === "awaitingVendor"
            ? "refundPending"
            : record.status,
        communications: [
          {
            id: `comm-${timestamp.getTime()}`,
            timestamp,
            author: "Vendor Ops",
            role: "vendor",
            channel: "system",
            summary:
              nextStatus === "completed"
                ? "Vendor resolution confirmed"
                : "Vendor follow-up triggered",
            detail:
              nextStatus === "completed"
                ? `Marked vendor reference ${record.vendorCoordination?.reference} as complete.`
                : `Sent reminder to ${record.vendorCoordination?.vendorName} for action ${record.vendorCoordination?.action}.`,
          },
          ...record.communications,
        ],
        lastUpdated: timestamp,
      };
    });

    toast.success("Vendor coordination updated");
  };

  const handleDispositionChange = (value: ReturnDisposition) => {
    if (!selectedReturn) return;

    updateReturn(selectedReturn.id, (record) => ({
      ...record,
      disposition: value,
      communications: [
        {
          id: `comm-${Date.now()}`,
          timestamp: new Date(),
          author: "Returns Analyst",
          role: "seller",
          channel: "note",
          summary: "Disposition updated",
          detail: `Set disposition to ${dispositionCatalog[value].label}.`,
        },
        ...record.communications,
      ],
      lastUpdated: new Date(),
    }));
  };

  const handleReasonChange = (value: ReturnReasonCode) => {
    if (!selectedReturn) return;

    updateReturn(selectedReturn.id, (record) => ({
      ...record,
      reasonCode: value,
      communications: [
        {
          id: `comm-${Date.now()}`,
          timestamp: new Date(),
          author: "Returns Analyst",
          role: "seller",
          channel: "note",
          summary: "Reason code updated",
          detail: `Tagged case as ${reasonCatalog[value].label}.`,
        },
        ...record.communications,
      ],
      lastUpdated: new Date(),
    }));
  };

  const handleAddNote = () => {
    if (!selectedReturn || !noteDraft.trim()) return;
    const timestamp = new Date();

    updateReturn(selectedReturn.id, (record) => ({
      ...record,
      communications: [
        {
          id: `comm-${timestamp.getTime()}`,
          timestamp,
          author: "Returns Analyst",
          role: "seller",
          channel: "note",
          summary: noteDraft.trim(),
        },
        ...record.communications,
      ],
      lastUpdated: timestamp,
    }));

    setNoteDraft("");
    toast.success("Note added to case");
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Returns & RMA"
        description="Manage customer returns, approve refunds, and trigger restock actions."
      />

      <Card>
        <CardHeader>
          <CardTitle>Returns backlog</CardTitle>
          <CardDescription>Wire up return management workflows.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <Input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search by RMA, order, channel, or customer..."
              className="max-w-sm"
            />
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <Select
                value={statusFilter}
                onValueChange={(value) => setStatusFilter(value as ReturnStatus | "all")}
              >
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All statuses</SelectItem>
                  {Object.entries(statusStyles).map(([value, meta]) => (
                    <SelectItem key={value} value={value}>
                      {meta.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select
                value={dispositionFilter}
                onValueChange={(value) =>
                  setDispositionFilter(value as ReturnDisposition | "all")
                }
              >
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Disposition" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All dispositions</SelectItem>
                  {dispositionOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>RMA</TableHead>
                  <TableHead>Order</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead className="min-w-[160px]">Reason</TableHead>
                  <TableHead>Disposition</TableHead>
                  <TableHead>Refund</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Age</TableHead>
                  <TableHead>Last update</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredReturns.map((record) => (
                  <TableRow
                    key={record.id}
                    className={cn(
                      "cursor-pointer",
                      selectedReturnId === record.id && "bg-muted/40"
                    )}
                    onClick={() => setSelectedReturnId(record.id)}
                  >
                    <TableCell className="font-medium">{record.rmaNumber}</TableCell>
                    <TableCell>{record.orderId}</TableCell>
                    <TableCell className="whitespace-nowrap">
                      <div className="flex flex-col">
                        <span>{record.customerName}</span>
                        <span className="text-xs text-muted-foreground">{record.channel}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-1">
                        <span>{reasonCatalog[record.reasonCode].label}</span>
                        <span className="text-xs text-muted-foreground">
                          {reasonCatalog[record.reasonCode].description}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">{dispositionCatalog[record.disposition].label}</Badge>
                    </TableCell>
                    <TableCell>
                      {record.refundAmount > 0 ? (
                        <span>{currency.format(record.refundAmount)}</span>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge className={statusStyles[record.status].badge}>
                        {statusStyles[record.status].label}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {formatDistanceToNowStrict(record.requestedAt)}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {formatDistanceToNowStrict(record.lastUpdated)} ago
                    </TableCell>
                  </TableRow>
                ))}
                {filteredReturns.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={9} className="py-10 text-center text-muted-foreground">
                      No returns match the selected filters.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 xl:grid-cols-[2fr,1fr]">
        <Card className="min-h-[420px]">
          <CardHeader className="flex flex-col gap-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <CardTitle className="text-xl">Case details</CardTitle>
                <CardDescription>Provide reason codes, notes, and dispositions.</CardDescription>
              </div>
              {selectedReturn ? (
                <Badge className={statusStyles[selectedReturn.status].badge}>
                  {statusStyles[selectedReturn.status].label}
                </Badge>
              ) : null}
            </div>
            {selectedReturn ? (
              <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                <span>RMA {selectedReturn.rmaNumber}</span>
                <Separator orientation="vertical" className="h-4" />
                <span>Order {selectedReturn.orderId}</span>
                <Separator orientation="vertical" className="h-4" />
                <span>
                  Open {formatDistanceToNowStrict(selectedReturn.requestedAt, { addSuffix: true })}
                </span>
                <Separator orientation="vertical" className="h-4" />
                <span>
                  SLA due {format(selectedReturn.slaDue, "MMM d · HH:mm")}
                </span>
              </div>
            ) : null}
          </CardHeader>
          <CardContent>
            {selectedReturn ? (
              <Tabs defaultValue="summary" className="space-y-4">
                <TabsList>
                  <TabsTrigger value="summary">Summary</TabsTrigger>
                  <TabsTrigger value="vendor">Vendor coordination</TabsTrigger>
                  <TabsTrigger value="communications">Communications</TabsTrigger>
                </TabsList>

                <TabsContent value="summary" className="space-y-6">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="rounded-lg border bg-muted/30 p-4">
                      <div className="text-sm font-medium">Customer</div>
                      <div className="text-sm text-muted-foreground">
                        {selectedReturn.customerName}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {selectedReturn.customerEmail}
                      </div>
                      <div className="mt-2 text-xs uppercase tracking-wide text-muted-foreground">
                        Channel
                      </div>
                      <div className="text-sm">{selectedReturn.channel}</div>
                    </div>
                    <div className="rounded-lg border bg-muted/30 p-4">
                      <div className="text-sm font-medium">Reason code</div>
                      <div className="text-sm text-muted-foreground">
                        {reasonCatalog[selectedReturn.reasonCode].label}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {reasonCatalog[selectedReturn.reasonCode].description}
                      </div>
                      <div className="mt-4 text-sm font-medium">Disposition</div>
                      <div className="text-sm text-muted-foreground">
                        {dispositionCatalog[selectedReturn.disposition].label}
                      </div>
                    </div>
                  </div>

                  <div className="rounded-lg border">
                    <div className="border-b px-4 py-3 text-sm font-medium">
                      Items & inspection
                    </div>
                    <div className="divide-y text-sm">
                      {selectedReturn.items.map((item) => (
                        <div key={`${selectedReturn.id}-${item.sku}`} className="flex flex-wrap items-center justify-between gap-3 px-4 py-3">
                          <div className="space-y-1">
                            <div className="font-medium">{item.description}</div>
                            <div className="text-xs text-muted-foreground">
                              SKU {item.sku} · Qty {item.quantity}
                            </div>
                          </div>
                          <div className="flex flex-col items-end">
                            <Badge variant="secondary">Condition · {item.condition}</Badge>
                            <span className="text-xs text-muted-foreground">
                              {item.inspected ? "Inspection complete" : "Inspection pending"}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="rounded-lg border bg-muted/20 p-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Financial impact</span>
                        <Badge className={settlementStatusStyles[selectedReturn.settlement.status]}>
                          {selectedReturn.settlement.status === "settled"
                            ? "Settled"
                            : selectedReturn.settlement.status === "inProgress"
                              ? "In progress"
                              : "Pending"}
                        </Badge>
                      </div>
                      <div className="mt-2 text-2xl font-semibold">
                        {currency.format(selectedReturn.refundAmount || selectedReturn.settlement.amount)}
                      </div>
                      {selectedReturn.restockingFee !== 0 ? (
                        <div className="text-xs text-muted-foreground">
                          Includes restocking fee {currency.format(selectedReturn.restockingFee)}
                        </div>
                      ) : null}
                      <div className="mt-3 text-xs text-muted-foreground">
                        Settlement via {selectedReturn.settlement.channel} · due {format(selectedReturn.settlement.dueDate, "MMM d")}
                      </div>
                    </div>
                    <div className="rounded-lg border bg-muted/20 p-4">
                      <div className="text-sm font-medium">Narrative</div>
                      <div className="mt-2 text-sm text-muted-foreground">
                        {selectedReturn.reasonDetail}
                      </div>
                      <div className="mt-3 text-xs uppercase tracking-wide text-muted-foreground">
                        Policy window
                      </div>
                      <div className="text-sm">{selectedReturn.policyWindow}</div>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="vendor" className="space-y-4">
                  {selectedReturn.vendorCoordination ? (
                    <div className="space-y-4">
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <div>
                          <div className="text-sm font-semibold">{selectedReturn.vendorCoordination.vendorName}</div>
                          <div className="text-xs text-muted-foreground">
                            Action · {vendorActionLabels[selectedReturn.vendorCoordination.action]}
                          </div>
                        </div>
                        <Badge className={vendorStatusStyles[selectedReturn.vendorCoordination.status]}>
                          {selectedReturn.vendorCoordination.status}
                        </Badge>
                      </div>
                      <div className="rounded-lg border bg-muted/20 p-4 text-sm">
                        <div className="font-medium">Notes</div>
                        <div className="mt-1 text-muted-foreground">
                          {selectedReturn.vendorCoordination.notes}
                        </div>
                        <div className="mt-3 grid gap-1 text-xs text-muted-foreground">
                          <span>Reference · {selectedReturn.vendorCoordination.reference}</span>
                          <span>
                            Due {format(selectedReturn.vendorCoordination.dueDate, "MMM d · HH:mm")}
                          </span>
                          <span>
                            Last update {formatDistanceToNowStrict(selectedReturn.vendorCoordination.lastUpdated)} ago
                          </span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
                      No vendor coordination required for this case.
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="communications">
                  <ScrollArea className="h-[260px] pr-4">
                    <div className="space-y-4">
                      {[...selectedReturn.communications]
                        .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
                        .map((entry) => (
                          <div key={entry.id} className="rounded-lg border bg-muted/20 p-4">
                            <div className="flex items-center justify-between">
                              <div className="text-sm font-semibold">{entry.author}</div>
                              <div className="text-xs text-muted-foreground">
                                {format(entry.timestamp, "MMM d · HH:mm")}
                              </div>
                            </div>
                            <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                              <Badge variant="outline" className="font-normal">
                                {entry.role}
                              </Badge>
                              <span>via {entry.channel}</span>
                            </div>
                            <div className="mt-2 text-sm">{entry.summary}</div>
                            {entry.detail ? (
                              <div className="mt-1 text-xs text-muted-foreground">{entry.detail}</div>
                            ) : null}
                          </div>
                        ))}
                    </div>
                  </ScrollArea>
                </TabsContent>
              </Tabs>
            ) : (
              <div className="flex h-60 items-center justify-center text-sm text-muted-foreground">
                Select a return to review its details.
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="min-h-[420px]">
          <CardHeader>
            <CardTitle>Workflow actions</CardTitle>
            <CardDescription>
              Coordinate with vendor to approve reprints or credits.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {selectedReturn ? (
              <>
                <div className="space-y-3">
                  <div className="text-sm font-medium">Disposition</div>
                  <Select
                    value={selectedReturn.disposition}
                    onValueChange={(value) => handleDispositionChange(value as ReturnDisposition)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {dispositionOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-3">
                  <div className="text-sm font-medium">Reason code</div>
                  <Select
                    value={selectedReturn.reasonCode}
                    onValueChange={(value) => handleReasonChange(value as ReturnReasonCode)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {reasonOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <div className="text-sm font-medium">Next steps</div>
                  <div className="grid gap-2">
                    <Button variant="default" onClick={handleApproveRefund} disabled={selectedReturn.refundAmount === 0 && selectedReturn.settlement.amount === 0}>
                      {selectedReturn.status === "refundPending" ? "Post refund" : "Approve refund"}
                    </Button>
                    <Button
                      variant="secondary"
                      onClick={handleTriggerRestock}
                      disabled={!selectedReturn.restockPlan}
                    >
                      {selectedReturn.restockPlan?.status === "completed"
                        ? "Close restock"
                        : "Trigger restock"}
                    </Button>
                    <Button
                      variant="secondary"
                      onClick={handleRequestVendorFollowUp}
                      disabled={!selectedReturn.vendorCoordination}
                    >
                      {selectedReturn.vendorCoordination?.status === "completed"
                        ? "Confirm vendor closure"
                        : "Nudge vendor"}
                    </Button>
                  </div>
                </div>

                <Separator />

                <div className="space-y-3">
                  <div className="text-sm font-medium">Track customer communications</div>
                  <Textarea
                    value={noteDraft}
                    onChange={(event) => setNoteDraft(event.target.value)}
                    placeholder="Add note or customer follow-up summary"
                    rows={4}
                  />
                  <div className="flex justify-end">
                    <Button onClick={handleAddNote} disabled={!noteDraft.trim()}>
                      Log note
                    </Button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex h-60 items-center justify-center text-sm text-muted-foreground">
                Select a return to take action.
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
