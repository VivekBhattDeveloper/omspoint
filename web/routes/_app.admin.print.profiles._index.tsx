import { PageHeader } from "@/components/app/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

type PrinterStatus = "Calibrated" | "Due soon" | "Overdue";
type CalibrationStatus = "Scheduled" | "In progress" | "Waiting for QA";
type JigStatus = "Approved" | "Pending QA" | "Draft";
type GoldenSampleStatus = "Approved" | "Needs refresh";

type PrinterInventory = {
  id: string;
  name: string;
  vendor: string;
  location: string;
  bedMap: string;
  lastCalibration: string;
  status: PrinterStatus;
};

type CalibrationTask = {
  dueOn: string;
  printer: string;
  template: string;
  owner: string;
  status: CalibrationStatus;
};

type JigTemplate = {
  label: string;
  vendor: string;
  printer: string;
  version: string;
  approvals: string;
  status: JigStatus;
};

type GoldenSample = {
  asset: string;
  printer: string;
  profile: string;
  updatedAt: string;
  qaOwner: string;
  status: GoldenSampleStatus;
};

const printerInventory: PrinterInventory[] = [
  {
    id: "HP-IND-7900",
    name: "HP Indigo 7900",
    vendor: "RayPrint",
    location: "Line A",
    bedMap: "Indigo · A1 fine art (4-up)",
    lastCalibration: "Jan 14, 2025",
    status: "Calibrated",
  },
  {
    id: "CAN-COL-1650",
    name: "Canon Colorado 1650",
    vendor: "FlexiFab",
    location: "Line B",
    bedMap: "Colorado · Roll feed signage",
    lastCalibration: "Dec 28, 2024",
    status: "Due soon",
  },
  {
    id: "DUR-P5-350",
    name: "Durst P5 350",
    vendor: "Northstar",
    location: "Line C",
    bedMap: "Durst · Bed map C",
    lastCalibration: "Nov 30, 2024",
    status: "Overdue",
  },
];

const calibrationQueue: CalibrationTask[] = [
  {
    dueOn: "Feb 04, 2025",
    printer: "Canon Colorado 1650",
    template: "Wide format roll calibration",
    owner: "Automation Ops",
    status: "In progress",
  },
  {
    dueOn: "Feb 10, 2025",
    printer: "Durst P5 350",
    template: "Quarterly bed leveling",
    owner: "Maintenance",
    status: "Waiting for QA",
  },
  {
    dueOn: "Feb 18, 2025",
    printer: "HP Indigo 7900",
    template: "Color profile validation",
    owner: "Automation Ops",
    status: "Scheduled",
  },
];

const jigTemplates: JigTemplate[] = [
  {
    label: "Phone case · MagSafe v4",
    vendor: "FlexiFab",
    printer: "Canon Colorado 1650",
    version: "v4.2",
    approvals: "QA-2118",
    status: "Pending QA",
  },
  {
    label: "Canvas frame · 18x24",
    vendor: "RayPrint",
    printer: "HP Indigo 7900",
    version: "v2.7",
    approvals: "QA-2044",
    status: "Approved",
  },
  {
    label: "Signage · Outdoor mesh",
    vendor: "Northstar",
    printer: "Durst P5 350",
    version: "v1.6",
    approvals: "QA-2099",
    status: "Draft",
  },
];

const goldenSamples: GoldenSample[] = [
  {
    asset: "Canvas print · Sunset",
    printer: "HP Indigo 7900",
    profile: "Fine art matte",
    updatedAt: "Jan 18, 2025",
    qaOwner: "M. Lopez",
    status: "Approved",
  },
  {
    asset: "Phone case · Midnight",
    printer: "Canon Colorado 1650",
    profile: "UV flex",
    updatedAt: "Jan 12, 2025",
    qaOwner: "T. Singh",
    status: "Needs refresh",
  },
  {
    asset: "Outdoor banner · Spring promo",
    printer: "Durst P5 350",
    profile: "Weather-resistant",
    updatedAt: "Dec 02, 2024",
    qaOwner: "J. Carter",
    status: "Approved",
  },
];

const automationHighlights = [
  "Trigger calibration runs directly from printJob status changes.",
  "Sync alerting with incident management when calibration enters \"Waiting for QA\".",
  "Expose bed map deltas back to the print pipeline for automated preflight.",
  "Version print profiles alongside jig template approvals for traceability.",
];

function statusBadge(status: PrinterStatus | CalibrationStatus | JigStatus | GoldenSampleStatus) {
  switch (status) {
    case "Calibrated":
    case "Approved":
      return <Badge variant="secondary">{status}</Badge>;
    case "Due soon":
    case "Scheduled":
      return <Badge variant="outline">{status}</Badge>;
    case "In progress":
      return <Badge>{status}</Badge>;
    case "Waiting for QA":
    case "Pending QA":
      return <Badge variant="outline">{status}</Badge>;
    case "Needs refresh":
    case "Draft":
    case "Overdue":
      return <Badge variant="destructive">{status}</Badge>;
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
}

export default function AdminPrintProfilesPage() {
  const pendingApprovals = jigTemplates.filter((template) => template.status !== "Approved").length;
  const openCalibrations = calibrationQueue.filter((task) => task.status !== "Scheduled").length;
  const approvedSamples = goldenSamples.filter((sample) => sample.status === "Approved").length;

  return (
    <div className="space-y-8">
      <PageHeader
        title="Print Profiles & Jigs"
        description="Manage devices, calibration templates, and golden samples for every production line."
      />

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Active printers</CardDescription>
            <CardTitle className="text-3xl font-semibold">{printerInventory.length}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">Across {new Set(printerInventory.map((printer) => printer.vendor)).size} vendors with current bed maps.</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Calibrations in motion</CardDescription>
            <CardTitle className="text-3xl font-semibold">{openCalibrations}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">Include tasks flagged as in progress or awaiting QA.</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Golden sample coverage</CardDescription>
            <CardTitle className="text-3xl font-semibold">
              {approvedSamples}/{goldenSamples.length}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">Approved QA baselines ready to share with vendors.</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle>Automation roadmap</CardTitle>
            <CardDescription>Outline future integration with printJob automation.</CardDescription>
          </div>
          <Button type="button" variant="outline" size="sm">
            Plan integration
          </Button>
        </CardHeader>
        <CardContent>
          <ul className="list-disc space-y-2 pl-5 text-sm text-muted-foreground">
            {automationHighlights.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle>Printer coverage</CardTitle>
            <CardDescription>Surface printers, bed maps, and last calibration date.</CardDescription>
          </div>
          <Button type="button" size="sm">
            Add printer
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Device</TableHead>
                <TableHead>Vendor</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Bed map</TableHead>
                <TableHead>Last calibration</TableHead>
                <TableHead className="text-right">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {printerInventory.map((printer) => (
                <TableRow key={printer.id}>
                  <TableCell className="font-medium">{printer.name}</TableCell>
                  <TableCell>{printer.vendor}</TableCell>
                  <TableCell>{printer.location}</TableCell>
                  <TableCell>{printer.bedMap}</TableCell>
                  <TableCell>{printer.lastCalibration}</TableCell>
                  <TableCell className="text-right">{statusBadge(printer.status)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle>Calibration queue</CardTitle>
            <CardDescription>Coordinate calibration templates and ownership.</CardDescription>
          </div>
          <Button type="button" size="sm">
            Schedule calibration
          </Button>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Due</TableHead>
                <TableHead>Printer</TableHead>
                <TableHead>Template</TableHead>
                <TableHead>Owner</TableHead>
                <TableHead className="text-right">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {calibrationQueue.map((task) => (
                <TableRow key={`${task.printer}-${task.dueOn}`}>
                  <TableCell className="font-medium">{task.dueOn}</TableCell>
                  <TableCell>{task.printer}</TableCell>
                  <TableCell>{task.template}</TableCell>
                  <TableCell>{task.owner}</TableCell>
                  <TableCell className="text-right">{statusBadge(task.status)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle>Jig templates</CardTitle>
            <CardDescription>Assign jig templates to vendors and track approvals.</CardDescription>
          </div>
          <Button type="button" size="sm">
            Upload jig template
          </Button>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Template</TableHead>
                <TableHead>Vendor</TableHead>
                <TableHead>Printer</TableHead>
                <TableHead>Version</TableHead>
                <TableHead>QA reference</TableHead>
                <TableHead className="text-right">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {jigTemplates.map((template) => (
                <TableRow key={`${template.label}-${template.version}`}>
                  <TableCell className="font-medium">{template.label}</TableCell>
                  <TableCell>{template.vendor}</TableCell>
                  <TableCell>{template.printer}</TableCell>
                  <TableCell>{template.version}</TableCell>
                  <TableCell>{template.approvals}</TableCell>
                  <TableCell className="text-right">{statusBadge(template.status)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
        <CardContent className="pt-0">
          <p className="text-xs text-muted-foreground">
            Pending approvals: {pendingApprovals}. Ensure QA sign-off before promoting templates to production.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle>Golden samples</CardTitle>
            <CardDescription>Attach QA documentation and golden sample assets.</CardDescription>
          </div>
          <Button type="button" size="sm" variant="outline">
            Attach asset
          </Button>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Asset</TableHead>
                <TableHead>Printer</TableHead>
                <TableHead>Profile</TableHead>
                <TableHead>Updated</TableHead>
                <TableHead>QA owner</TableHead>
                <TableHead className="text-right">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {goldenSamples.map((sample) => (
                <TableRow key={`${sample.asset}-${sample.profile}`}>
                  <TableCell className="font-medium">{sample.asset}</TableCell>
                  <TableCell>{sample.printer}</TableCell>
                  <TableCell>{sample.profile}</TableCell>
                  <TableCell>{sample.updatedAt}</TableCell>
                  <TableCell>{sample.qaOwner}</TableCell>
                  <TableCell className="text-right">{statusBadge(sample.status)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
