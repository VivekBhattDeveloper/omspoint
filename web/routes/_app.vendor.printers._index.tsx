import { useMemo, useState } from "react";
import { PageHeader } from "@/components/app/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import { AlertTriangle, Clock, Layers, Printer } from "lucide-react";

type PrinterStatus = "Online" | "Maintenance due" | "Calibration scheduled" | "Offline";
type MaintenanceStatus = "Scheduled" | "In progress" | "Pending parts" | "Completed";
type JigStatus = "Approved" | "Pending QA" | "Draft";

interface PrinterRecord {
  id: string;
  label: string;
  vendor: string;
  location: string;
  status: PrinterStatus;
  uptime: number;
  capacityPerHour: number;
  supportedSubstrates: string[];
  lastMaintenance: string;
  nextMaintenance: string;
  nextMaintenanceType: "Calibration" | "Preventative" | "Inspection";
  queueBacklogHours: number;
  jigTemplateIds: string[];
}

interface MaintenanceTask {
  id: string;
  printerId: string;
  task: string;
  type: "Calibration" | "Preventative" | "Repair" | "Inspection";
  dueDate: string;
  dueInDays: number;
  owner: string;
  status: MaintenanceStatus;
  notes?: string;
}

interface JigTemplate {
  id: string;
  label: string;
  mediaType: string;
  dimensions: string;
  thickness: string;
  tolerance: string;
  status: JigStatus;
  lastValidated: string;
  supportedPrinters: string[];
}

const printerFleet: PrinterRecord[] = [
  {
    id: "HP-IND-7900",
    label: "HP Indigo 7900",
    vendor: "RayPrint",
    location: "Line A",
    status: "Online",
    uptime: 98.6,
    capacityPerHour: 420,
    supportedSubstrates: ["Fine art paper", "Synthetics", "Photo stock"],
    lastMaintenance: "2025-01-14",
    nextMaintenance: "2025-02-11",
    nextMaintenanceType: "Calibration",
    queueBacklogHours: 1.2,
    jigTemplateIds: ["JIG-PHONE-MAGSAFE", "JIG-CANVAS-18x24"],
  },
  {
    id: "CAN-COL-1650",
    label: "Canon Colorado 1650",
    vendor: "FlexiFab",
    location: "Line B",
    status: "Maintenance due",
    uptime: 94.1,
    capacityPerHour: 510,
    supportedSubstrates: ["Roll vinyl", "UV flex", "Backlit film"],
    lastMaintenance: "2024-12-28",
    nextMaintenance: "2025-02-06",
    nextMaintenanceType: "Calibration",
    queueBacklogHours: 3.4,
    jigTemplateIds: ["JIG-PHONE-MAGSAFE", "JIG-BANNER-ROLL"],
  },
  {
    id: "DUR-P5-350",
    label: "Durst P5 350",
    vendor: "Northstar",
    location: "Line C",
    status: "Calibration scheduled",
    uptime: 92.7,
    capacityPerHour: 360,
    supportedSubstrates: ["Rigid board", "Aluminum", "Acrylic"],
    lastMaintenance: "2024-11-30",
    nextMaintenance: "2025-02-18",
    nextMaintenanceType: "Inspection",
    queueBacklogHours: 5.1,
    jigTemplateIds: ["JIG-SIGNAGE-MESH", "JIG-BANNER-ROLL"],
  },
  {
    id: "MIM-UJV55",
    label: "Mimaki UJV55-320",
    vendor: "FlexiFab",
    location: "Line D",
    status: "Online",
    uptime: 96.3,
    capacityPerHour: 275,
    supportedSubstrates: ["Fabric", "Mesh", "Backlit film"],
    lastMaintenance: "2025-01-22",
    nextMaintenance: "2025-03-03",
    nextMaintenanceType: "Preventative",
    queueBacklogHours: 0.8,
    jigTemplateIds: ["JIG-FABRIC-FRAME"],
  },
];

const maintenanceTasks: MaintenanceTask[] = [
  {
    id: "task-cal-1650",
    printerId: "CAN-COL-1650",
    task: "Quarterly nozzle calibration",
    type: "Calibration",
    dueDate: "2025-02-06",
    dueInDays: 4,
    owner: "Automation Ops",
    status: "In progress",
    notes: "Live job paused at 02:00 for baseline capture.",
  },
  {
    id: "task-bed-durst",
    printerId: "DUR-P5-350",
    task: "Bed leveling and vacuum alignment",
    type: "Preventative",
    dueDate: "2025-02-12",
    dueInDays: 10,
    owner: "Maintenance",
    status: "Scheduled",
  },
  {
    id: "task-uv-mimaki",
    printerId: "MIM-UJV55",
    task: "UV lamp intensity verification",
    type: "Inspection",
    dueDate: "2025-02-19",
    dueInDays: 17,
    owner: "Quality",
    status: "Scheduled",
  },
  {
    id: "task-vibration-indigo",
    printerId: "HP-IND-7900",
    task: "Vibration motor replacement",
    type: "Repair",
    dueDate: "2025-02-04",
    dueInDays: 2,
    owner: "Mechanical",
    status: "Pending parts",
    notes: "Awaiting replacement motor from HP support ticket #88412.",
  },
];

const jigTemplates: JigTemplate[] = [
  {
    id: "JIG-PHONE-MAGSAFE",
    label: "Phone case · MagSafe v4",
    mediaType: "UV flex resin",
    dimensions: "148 × 72 mm",
    thickness: "3.1 mm",
    tolerance: "±0.15 mm",
    status: "Pending QA",
    lastValidated: "2025-01-18",
    supportedPrinters: ["CAN-COL-1650", "HP-IND-7900"],
  },
  {
    id: "JIG-CANVAS-18x24",
    label: "Canvas frame · 18×24",
    mediaType: "Fine art canvas",
    dimensions: "457 × 610 mm",
    thickness: "18 mm",
    tolerance: "±0.25 mm",
    status: "Approved",
    lastValidated: "2025-01-29",
    supportedPrinters: ["HP-IND-7900"],
  },
  {
    id: "JIG-SIGNAGE-MESH",
    label: "Mesh signage · Outdoor",
    mediaType: "PVC mesh",
    dimensions: "1220 × 2440 mm",
    thickness: "4.8 mm",
    tolerance: "±0.30 mm",
    status: "Draft",
    lastValidated: "2024-12-09",
    supportedPrinters: ["DUR-P5-350"],
  },
  {
    id: "JIG-BANNER-ROLL",
    label: "Roll banner · Edge-grip",
    mediaType: "Backlit PET",
    dimensions: "914 mm roll",
    thickness: "0.28 mm",
    tolerance: "±0.10 mm",
    status: "Approved",
    lastValidated: "2025-02-01",
    supportedPrinters: ["CAN-COL-1650", "DUR-P5-350"],
  },
  {
    id: "JIG-FABRIC-FRAME",
    label: "Fabric frame · 32×48",
    mediaType: "Dye-sub fabric",
    dimensions: "813 × 1219 mm",
    thickness: "2.4 mm",
    tolerance: "±0.20 mm",
    status: "Approved",
    lastValidated: "2025-01-24",
    supportedPrinters: ["MIM-UJV55"],
  },
];

function printerStatusBadge(status: PrinterStatus) {
  switch (status) {
    case "Online":
      return <Badge variant="secondary">{status}</Badge>;
    case "Maintenance due":
    case "Calibration scheduled":
      return <Badge variant="outline">{status}</Badge>;
    case "Offline":
      return <Badge variant="destructive">{status}</Badge>;
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
}

function maintenanceStatusBadge(status: MaintenanceStatus) {
  switch (status) {
    case "In progress":
      return <Badge>{status}</Badge>;
    case "Pending parts":
      return <Badge variant="destructive">{status}</Badge>;
    case "Scheduled":
      return <Badge variant="outline">{status}</Badge>;
    case "Completed":
      return <Badge variant="secondary">{status}</Badge>;
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
}

function jigStatusBadge(status: JigStatus) {
  switch (status) {
    case "Approved":
      return <Badge variant="secondary">{status}</Badge>;
    case "Pending QA":
      return <Badge variant="outline">{status}</Badge>;
    case "Draft":
      return <Badge variant="destructive">{status}</Badge>;
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
}

export default function VendorPrintersPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<PrinterStatus | "all">("all");
  const [substrateFilter, setSubstrateFilter] = useState("all");

  const printersById = useMemo(() => {
    return Object.fromEntries(printerFleet.map((printer) => [printer.id, printer]));
  }, []);

  const substrateOptions = useMemo(() => {
    const options = new Set<string>();
    printerFleet.forEach((printer) => {
      printer.supportedSubstrates.forEach((substrate) => options.add(substrate));
    });
    return Array.from(options).sort();
  }, []);

  const filteredPrinters = useMemo(() => {
    const term = search.trim().toLowerCase();
    return printerFleet.filter((printer) => {
      const matchesSearch = !term
        || printer.label.toLowerCase().includes(term)
        || printer.id.toLowerCase().includes(term)
        || printer.vendor.toLowerCase().includes(term)
        || printer.location.toLowerCase().includes(term);
      const matchesStatus = statusFilter === "all" || printer.status === statusFilter;
      const matchesSubstrate = substrateFilter === "all"
        || printer.supportedSubstrates.includes(substrateFilter);
      return matchesSearch && matchesStatus && matchesSubstrate;
    });
  }, [search, statusFilter, substrateFilter]);

  const maintenanceByDueDate = useMemo(() => {
    return [...maintenanceTasks].sort((a, b) => a.dueInDays - b.dueInDays);
  }, []);

  const maintenanceAlerts = useMemo(() => {
    return maintenanceTasks.filter((task) => task.status !== "Completed" && task.dueInDays <= 7);
  }, []);

  const onlineCount = useMemo(
    () => printerFleet.filter((printer) => printer.status === "Online").length,
    []
  );

  const averageUptime = useMemo(() => {
    if (printerFleet.length === 0) return 0;
    const total = printerFleet.reduce((sum, printer) => sum + printer.uptime, 0);
    return Math.round((total / printerFleet.length) * 10) / 10;
  }, []);

  const totalCapacity = useMemo(() => {
    return printerFleet.reduce((sum, printer) => sum + printer.capacityPerHour, 0);
  }, []);

  const activeJigs = useMemo(() => jigTemplates.filter((jig) => jig.status !== "Draft").length, []);

  const dateFormatter = useMemo(
    () =>
      new Intl.DateTimeFormat(undefined, {
        month: "short",
        day: "2-digit",
        year: "numeric",
      }),
    []
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Printers & Jigs"
        description="Catalog hardware, maintenance cycles, and jig templates configured per device."
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Card>
          <CardHeader className="flex items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active printers</CardTitle>
            <Printer className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold">{printerFleet.length}</div>
            <p className="text-xs text-muted-foreground">{onlineCount} online · {maintenanceAlerts.length} flagged</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average uptime</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold">{averageUptime.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">Weighted across all production devices.</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Hourly capacity</CardTitle>
            <Layers className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold">{totalCapacity} units</div>
            <p className="text-xs text-muted-foreground">Configured throughput for the current fleet.</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Jig templates</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold">{jigTemplates.length}</div>
            <p className="text-xs text-muted-foreground">{activeJigs} validated · {jigTemplates.length - activeJigs} in draft.</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <CardTitle>Device fleet</CardTitle>
            <CardDescription>Track printer uptime, capacity, and supported substrates.</CardDescription>
          </div>
          <div className="flex gap-2">
            <Button type="button" variant="outline" size="sm">
              Sync asset inventory
            </Button>
            <Button type="button" size="sm">
              Schedule maintenance
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <Input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search printers, vendors, or locations"
              className="max-w-sm"
            />
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as PrinterStatus | "all")}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All statuses</SelectItem>
                  <SelectItem value="Online">Online</SelectItem>
                  <SelectItem value="Maintenance due">Maintenance due</SelectItem>
                  <SelectItem value="Calibration scheduled">Calibration scheduled</SelectItem>
                  <SelectItem value="Offline">Offline</SelectItem>
                </SelectContent>
              </Select>
              <Select value={substrateFilter} onValueChange={setSubstrateFilter}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Filter substrate" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All substrates</SelectItem>
                  {substrateOptions.map((substrate) => (
                    <SelectItem key={substrate} value={substrate}>
                      {substrate}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Printer</TableHead>
                  <TableHead>Vendor</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Uptime</TableHead>
                  <TableHead>Capacity</TableHead>
                  <TableHead>Substrates</TableHead>
                  <TableHead>Next maintenance</TableHead>
                  <TableHead className="text-right">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPrinters.map((printer) => (
                  <TableRow key={printer.id}>
                    <TableCell className="font-medium">{printer.label}</TableCell>
                    <TableCell>{printer.vendor}</TableCell>
                    <TableCell>{printer.location}</TableCell>
                    <TableCell className="min-w-[160px]">
                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <span>{printer.uptime.toFixed(1)}%</span>
                          <span>{printer.queueBacklogHours.toFixed(1)}h backlog</span>
                        </div>
                        <Progress value={printer.uptime} />
                      </div>
                    </TableCell>
                    <TableCell>{printer.capacityPerHour} units/hr</TableCell>
                    <TableCell className="max-w-[220px]">
                      <span className="text-sm text-muted-foreground">
                        {printer.supportedSubstrates.join(", ")}
                      </span>
                    </TableCell>
                    <TableCell className="min-w-[160px]">
                      <div className="flex flex-col gap-1">
                        <span>{dateFormatter.format(new Date(printer.nextMaintenance))}</span>
                        <Badge variant="outline" className="w-fit text-xs">
                          {printer.nextMaintenanceType}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">{printerStatusBadge(printer.status)}</TableCell>
                  </TableRow>
                ))}
                {filteredPrinters.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={8} className="h-24 text-center text-sm text-muted-foreground">
                      No printers match the current filters.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle>Maintenance queue</CardTitle>
              <CardDescription>Blend calibration slots with preventative tasks.</CardDescription>
            </div>
            <Button type="button" variant="outline" size="sm">
              Export schedule
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Due</TableHead>
                    <TableHead>Task</TableHead>
                    <TableHead>Printer</TableHead>
                    <TableHead>Owner</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {maintenanceByDueDate.map((task) => (
                    <TableRow key={task.id}>
                      <TableCell className="font-medium">
                        <div className="flex flex-col">
                          <span>{dateFormatter.format(new Date(task.dueDate))}</span>
                          <span className="text-xs text-muted-foreground">Due in {task.dueInDays} days</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col gap-1">
                          <span>{task.task}</span>
                          <Badge variant="outline" className="w-fit text-xs">
                            {task.type}
                          </Badge>
                          {task.notes ? (
                            <span className="text-xs text-muted-foreground">{task.notes}</span>
                          ) : null}
                        </div>
                      </TableCell>
                      <TableCell>{printersById[task.printerId]?.label ?? task.printerId}</TableCell>
                      <TableCell>{task.owner}</TableCell>
                      <TableCell>{maintenanceStatusBadge(task.status)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            <p className="text-xs text-muted-foreground">
              Align calibration slots with production downtime to avoid unplanned stops.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Calibration & maintenance alerts</CardTitle>
            <CardDescription>Flag devices that need action within the next week.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {maintenanceAlerts.map((alert) => {
              const severity = alert.dueInDays <= 2 ? "destructive" : "default";
              const printer = printersById[alert.printerId];
              return (
                <div key={alert.id} className="flex items-start gap-3 rounded-md border p-3">
                  <AlertTriangle className="h-4 w-4 text-destructive" />
                  <div className="flex flex-col gap-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge variant={severity === "destructive" ? "destructive" : "outline"} className="text-xs">
                        {severity === "destructive" ? "Urgent" : "Upcoming"}
                      </Badge>
                      <span className="font-medium">{printer?.label ?? alert.printerId}</span>
                    </div>
                    <p className="text-sm">
                      {alert.task} • due in {alert.dueInDays} days ({dateFormatter.format(new Date(alert.dueDate))})
                    </p>
                    {alert.notes ? <p className="text-xs text-muted-foreground">{alert.notes}</p> : null}
                    <div className="flex flex-wrap gap-2 pt-1">
                      <Button type="button" size="sm" variant="outline">
                        Acknowledge
                      </Button>
                      <Button type="button" size="sm">
                        Assign follow-up
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
            {maintenanceAlerts.length === 0 ? (
              <p className="text-sm text-muted-foreground">No outstanding calibration or maintenance alerts.</p>
            ) : null}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle>Jig templates & compatibility</CardTitle>
            <CardDescription>Store measurements and confirm fitment across devices.</CardDescription>
          </div>
          <Button type="button" size="sm">
            Upload jig template
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Template</TableHead>
                  <TableHead>Measurements</TableHead>
                  <TableHead>Tolerance</TableHead>
                  <TableHead>Compatible printers</TableHead>
                  <TableHead>Last validated</TableHead>
                  <TableHead className="text-right">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {jigTemplates.map((jig) => (
                  <TableRow key={jig.id}>
                    <TableCell className="font-medium">
                      <div className="flex flex-col gap-1">
                        <span>{jig.label}</span>
                        <span className="text-xs text-muted-foreground">{jig.mediaType}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-1">
                        <span>{jig.dimensions}</span>
                        <span className="text-xs text-muted-foreground">Thickness: {jig.thickness}</span>
                      </div>
                    </TableCell>
                    <TableCell>{jig.tolerance}</TableCell>
                    <TableCell className="max-w-[240px]">
                      <div className="flex flex-wrap gap-2">
                        {jig.supportedPrinters.map((printerId) => (
                          <Badge key={printerId} variant="outline" className="text-xs">
                            {printersById[printerId]?.label ?? printerId}
                          </Badge>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell>{dateFormatter.format(new Date(jig.lastValidated))}</TableCell>
                    <TableCell className="text-right">{jigStatusBadge(jig.status)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          <p className="text-xs text-muted-foreground">
            Keep jig tolerances in sync with calibration results to catch drift before QA escalations.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
