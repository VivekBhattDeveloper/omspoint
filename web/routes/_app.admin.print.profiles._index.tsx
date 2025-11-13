import type { Route } from "./+types/_app.admin.print.profiles._index";
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

type JigTemplateRecord = {
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

type LoaderData = {
  printerInventory: PrinterInventory[];
  calibrationQueue: CalibrationTask[];
  jigTemplates: JigTemplateRecord[];
  goldenSamples: GoldenSample[];
  source: "api" | "fallback";
  error?: string;
};

const automationHighlights = [
  "Trigger calibration runs directly from printJob status changes.",
  "Sync alerting with incident management when calibration enters \"Waiting for QA\".",
  "Expose bed map deltas back to the print pipeline for automated preflight.",
  "Version print profiles alongside jig template approvals for traceability.",
];

const FALLBACK_DATA: LoaderData = {
  printerInventory: [
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
  ],
  calibrationQueue: [
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
  ],
  jigTemplates: [
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
  ],
  goldenSamples: [
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
  ],
  source: "fallback",
};

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

const guardString = (value: unknown, fallback = ""): string => {
  if (typeof value === "string" && value.trim().length > 0) {
    return value;
  }
  if (typeof value === "number" || typeof value === "boolean") {
    return String(value);
  }
  return fallback;
};

const formatDate = (value?: string | null): string => {
  if (!value) {
    return "—";
  }
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return "—";
  }
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "2-digit",
    year: "numeric",
  }).format(parsed);
};

const computePrinterStatus = (lastCalibrationAt?: string | null): PrinterStatus => {
  if (!lastCalibrationAt) {
    return "Due soon";
  }
  const parsed = new Date(lastCalibrationAt);
  if (Number.isNaN(parsed.getTime())) {
    return "Due soon";
  }
  const elapsedDays = (Date.now() - parsed.getTime()) / (24 * 60 * 60 * 1000);
  if (elapsedDays <= 30) {
    return "Calibrated";
  }
  if (elapsedDays <= 75) {
    return "Due soon";
  }
  return "Overdue";
};

const mapCalibrationStatus = (status?: string | null): CalibrationStatus => {
  switch ((status ?? "").toLowerCase()) {
    case "in_progress":
      return "In progress";
    case "waiting_for_qa":
      return "Waiting for QA";
    default:
      return "Scheduled";
  }
};

const mapJigStatus = (status?: string | null): JigStatus => {
  switch ((status ?? "").toLowerCase()) {
    case "pending_qa":
      return "Pending QA";
    case "draft":
      return "Draft";
    default:
      return "Approved";
  }
};

const mapSampleStatus = (status?: string | null): GoldenSampleStatus =>
  (status && status.toLowerCase() === "needs_review" ? "Needs refresh" : "Approved");

export const loader = async ({ context }: Route.LoaderArgs): Promise<LoaderData> => {
  const manager = (context.api as unknown as Record<string, unknown> | undefined)?.printerDevice as
    | { findMany?: (options: unknown) => Promise<unknown> }
    | undefined;

  if (!manager?.findMany) {
    return { ...FALLBACK_DATA, error: "Printer device model not available in API client." };
  }

  try {
    const raw = (await manager.findMany({
      select: {
        id: true,
        name: true,
        model: true,
        location: true,
        status: true,
        lastCalibrationAt: true,
        supportedMaterials: true,
        vendor: {
          select: {
            name: true,
          },
        },
        printProfiles: {
          select: {
            id: true,
            name: true,
            status: true,
            lastValidatedAt: true,
            owner: true,
            colorProfile: true,
          },
          sort: { lastValidatedAt: "Descending" },
          first: 20,
        },
        jigTemplates: {
          select: {
            id: true,
            label: true,
            status: true,
            version: true,
            approvals: true,
          },
          sort: { label: "Ascending" },
          first: 20,
        },
        calibrationRuns: {
          select: {
            id: true,
            performedAt: true,
            performedBy: true,
            status: true,
          },
          sort: { performedAt: "Ascending" },
          first: 20,
        },
      },
      sort: { name: "Ascending" },
      first: 50,
    })) as unknown[];

    const printerInventory: PrinterInventory[] = [];
    const calibrationQueueRaw: Array<CalibrationTask & { dueTimestamp: number }> = [];
    const jigTemplates: JigTemplateRecord[] = [];
    const goldenSamplesRaw: Array<GoldenSample & { updatedTimestamp: number }> = [];

    raw.forEach((record) => {
      const printerId = guardString((record as Record<string, unknown>)?.id);
      const printerName = guardString((record as Record<string, unknown>)?.name ?? printerId);
      const vendorObj = (record as Record<string, unknown>)?.vendor as { name?: string } | undefined;
      const vendorName = guardString(vendorObj?.name ?? "Unassigned");
      const location = guardString((record as Record<string, unknown>)?.location ?? "Unknown");
      const model = guardString((record as Record<string, unknown>)?.model ?? "Device");
      const materials = Array.isArray((record as Record<string, unknown>)?.supportedMaterials)
        ? ((record as Record<string, unknown>)?.supportedMaterials as unknown[])
            .map((entry) => guardString(entry))
            .filter(Boolean)
        : [];

      printerInventory.push({
        id: printerId,
        name: printerName,
        vendor: vendorName,
        location,
        bedMap: materials.length > 0 ? `${model} · ${materials[0]}` : model,
        lastCalibration: formatDate((record as Record<string, unknown>)?.lastCalibrationAt as string | undefined),
        status: computePrinterStatus((record as Record<string, unknown>)?.lastCalibrationAt as string | undefined),
      });

      const runs = Array.isArray((record as Record<string, unknown>)?.calibrationRuns)
        ? ((record as Record<string, unknown>)?.calibrationRuns as any[])
        : [];

      runs
        .filter((run) => (run?.status ?? "").toLowerCase() !== "complete")
        .forEach((run) => {
          const dueTimestamp = Date.parse(guardString(run?.performedAt ?? ""));
          calibrationQueueRaw.push({
            dueOn: formatDate(run?.performedAt),
            printer: printerName,
            template: materials[0] ? `${model} · ${materials[0]}` : `${model} calibration`,
            owner: guardString(run?.performedBy ?? "Automation Ops"),
            status: mapCalibrationStatus(run?.status),
            dueTimestamp: Number.isNaN(dueTimestamp) ? Number.MAX_SAFE_INTEGER : dueTimestamp,
          });
        });

      const jigs = Array.isArray((record as Record<string, unknown>)?.jigTemplates)
        ? ((record as Record<string, unknown>)?.jigTemplates as any[])
        : [];

      jigs.forEach((jig) => {
        jigTemplates.push({
          label: guardString(jig?.label ?? `${printerName} jig`),
          vendor: vendorName,
          printer: printerName,
          version: guardString(jig?.version ?? "v1"),
          approvals: guardString(jig?.approvals ?? "—"),
          status: mapJigStatus(jig?.status),
        });
      });

      const profiles = Array.isArray((record as Record<string, unknown>)?.printProfiles)
        ? ((record as Record<string, unknown>)?.printProfiles as any[])
        : [];

      profiles.forEach((profile) => {
        const updatedTimestamp = Date.parse(guardString(profile?.lastValidatedAt ?? ""));
        goldenSamplesRaw.push({
          asset: guardString(profile?.name ?? `${printerName} sample`),
          printer: printerName,
          profile: guardString(profile?.colorProfile ?? profile?.name ?? "Profile"),
          updatedAt: formatDate(profile?.lastValidatedAt),
          qaOwner: guardString(profile?.owner ?? "QA"),
          status: mapSampleStatus(profile?.status),
          updatedTimestamp: Number.isNaN(updatedTimestamp) ? 0 : updatedTimestamp,
        });
      });
    });

    const calibrationQueue = calibrationQueueRaw
      .sort((a, b) => a.dueTimestamp - b.dueTimestamp)
      .map(({ dueTimestamp: _dueTimestamp, ...task }) => task);

    const goldenSamples = goldenSamplesRaw
      .sort((a, b) => b.updatedTimestamp - a.updatedTimestamp)
      .map(({ updatedTimestamp: _updatedTimestamp, ...sample }) => sample);

    return {
      printerInventory,
      calibrationQueue,
      jigTemplates,
      goldenSamples,
      source: "api",
    } satisfies LoaderData;
  } catch (error) {
    return { ...FALLBACK_DATA, error: serializeError(error) } satisfies LoaderData;
  }
};

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

export default function AdminPrintProfilesPage({ loaderData }: Route.ComponentProps) {
  const { printerInventory, calibrationQueue, jigTemplates, goldenSamples, source } = loaderData;

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
            <p className="text-sm text-muted-foreground">
              Across {new Set(printerInventory.map((printer) => printer.vendor)).size} vendors with current bed maps.
            </p>
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
              {approvedSamples}/{goldenSamples.length || 1}
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
          <div className="flex items-center gap-2">
            {source === "fallback" ? (
              <Badge variant="outline" className="text-xs font-semibold uppercase tracking-wide">
                Sample data
              </Badge>
            ) : null}
            <Button type="button" variant="outline" size="sm">
              Plan integration
            </Button>
          </div>
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
        <CardHeader>
          <CardTitle>Printer inventory</CardTitle>
          <CardDescription>Fleet overview including vendors, locations, and calibration posture.</CardDescription>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Printer</TableHead>
                <TableHead>Vendor</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Bed map</TableHead>
                <TableHead>Last calibration</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {printerInventory.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground">
                    No printers registered yet.
                  </TableCell>
                </TableRow>
              ) : (
                printerInventory.map((printer) => (
                  <TableRow key={printer.id}>
                    <TableCell>
                      <div className="font-medium">{printer.name}</div>
                      <div className="text-xs text-muted-foreground">{printer.id}</div>
                    </TableCell>
                    <TableCell>{printer.vendor}</TableCell>
                    <TableCell>{printer.location}</TableCell>
                    <TableCell>{printer.bedMap}</TableCell>
                    <TableCell>{printer.lastCalibration}</TableCell>
                    <TableCell>{statusBadge(printer.status)}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Calibration queue</CardTitle>
            <CardDescription>Automation, maintenance, and QA checkpoints.</CardDescription>
          </CardHeader>
          <CardContent className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Due</TableHead>
                  <TableHead>Printer</TableHead>
                  <TableHead>Template</TableHead>
                  <TableHead>Owner</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {calibrationQueue.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-muted-foreground">
                      No active calibration tasks.
                    </TableCell>
                  </TableRow>
                ) : (
                  calibrationQueue.map((task, index) => (
                    <TableRow key={`${task.printer}-${index}`}>
                      <TableCell>{task.dueOn}</TableCell>
                      <TableCell>{task.printer}</TableCell>
                      <TableCell>{task.template}</TableCell>
                      <TableCell>{task.owner}</TableCell>
                      <TableCell>{statusBadge(task.status)}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Jig templates</CardTitle>
            <CardDescription>Versioned production assets with QA approvals.</CardDescription>
          </CardHeader>
          <CardContent className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Template</TableHead>
                  <TableHead>Vendor</TableHead>
                  <TableHead>Printer</TableHead>
                  <TableHead>Version</TableHead>
                  <TableHead>Approvals</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {jigTemplates.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-muted-foreground">
                      No jig templates synced yet.
                    </TableCell>
                  </TableRow>
                ) : (
                  jigTemplates.map((template) => (
                    <TableRow key={`${template.printer}-${template.label}`}>
                      <TableCell>{template.label}</TableCell>
                      <TableCell>{template.vendor}</TableCell>
                      <TableCell>{template.printer}</TableCell>
                      <TableCell>{template.version}</TableCell>
                      <TableCell>{template.approvals}</TableCell>
                      <TableCell>{statusBadge(template.status)}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Golden samples</CardTitle>
          <CardDescription>QA-maintained baselines per printer profile.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {goldenSamples.length === 0 ? (
            <div className="col-span-full rounded-lg border border-dashed py-12 text-center text-sm text-muted-foreground">
              Publish at least one print profile with QA approval to populate golden samples.
            </div>
          ) : (
            goldenSamples.map((sample) => (
              <div key={`${sample.printer}-${sample.asset}`} className="rounded-lg border bg-card p-4">
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>{sample.printer}</span>
                  {statusBadge(sample.status)}
                </div>
                <div className="mt-2 text-sm font-semibold">{sample.asset}</div>
                <div className="text-xs text-muted-foreground">{sample.profile}</div>
                <dl className="mt-3 space-y-2 text-xs text-muted-foreground">
                  <div className="flex justify-between">
                    <dt>Updated</dt>
                    <dd>{sample.updatedAt}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt>QA owner</dt>
                    <dd>{sample.qaOwner}</dd>
                  </div>
                </dl>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
