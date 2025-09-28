import { useMemo } from "react";
import { addHours, format, formatDistanceToNowStrict, subDays, subHours, subMinutes } from "date-fns";

import { PageHeader } from "@/components/app/page-header";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  AlertTriangle,
  Camera,
  CheckCircle2,
  ClipboardList,
  FileText,
  Gauge,
  Ruler,
  ShieldAlert,
  ShieldCheck,
} from "lucide-react";

type LineStatus = "pass" | "attention" | "fail";
type CheckpointStatus = "passing" | "attention" | "blocked";
type Severity = "critical" | "high" | "medium" | "low";
type AttachmentType = "photo" | "measurement" | "note";

type ProductionLine = {
  id: string;
  name: string;
  defectRate: number;
  qaHolds: number;
  goldenSampleStatus: LineStatus;
  lastGoldenSample: Date;
  throughputPerHour: number;
  activeExceptions: number;
  nextAudit: Date;
};

type QualityCheckpoint = {
  id: string;
  lineId: ProductionLine["id"];
  stage: string;
  status: CheckpointStatus;
  inspector: string;
  lastRun: Date;
  nextDue: Date;
  automationCoverage: number;
  notes: string;
};

type QaException = {
  id: string;
  lineId: ProductionLine["id"];
  item: string;
  issue: string;
  severity: Severity;
  correctiveAction: string;
  owner: string;
  due: Date;
  status: "open" | "inProgress";
  attachments: Array<{ id: string; type: AttachmentType; label: string; measurement?: string }>;
};

type GoldenSampleApproval = {
  id: string;
  lineId: ProductionLine["id"];
  item: string;
  inspector: string;
  approvedAt: Date;
  deltaE: number;
  washTest: "pass" | "fail";
  notes: string;
};

const statusTone: Record<LineStatus, string> = {
  pass: "bg-emerald-100 text-emerald-700",
  attention: "bg-amber-100 text-amber-700",
  fail: "bg-rose-100 text-rose-700",
};

const checkpointCopy: Record<CheckpointStatus, { label: string; tone: string; icon: typeof CheckCircle2 }> = {
  passing: { label: "Passing", tone: "bg-emerald-100 text-emerald-700", icon: CheckCircle2 },
  attention: { label: "Needs attention", tone: "bg-amber-100 text-amber-700", icon: ShieldAlert },
  blocked: { label: "Blocked", tone: "bg-rose-100 text-rose-700", icon: AlertTriangle },
};

const severityTone: Record<Severity, string> = {
  critical: "bg-rose-100 text-rose-700",
  high: "bg-amber-100 text-amber-700",
  medium: "bg-sky-100 text-sky-700",
  low: "bg-slate-200 text-slate-700",
};

const attachmentIcon: Record<AttachmentType, typeof Camera> = {
  photo: Camera,
  measurement: Ruler,
  note: FileText,
};

const attachmentTone: Record<AttachmentType, string> = {
  photo: "bg-sky-100 text-sky-700",
  measurement: "bg-indigo-100 text-indigo-700",
  note: "bg-slate-200 text-slate-700",
};

const formatRelative = (value: Date) => formatDistanceToNowStrict(value, { addSuffix: true });

export default function VendorQaPage() {
  const {
    lines,
    checkpoints,
    exceptions,
    approvals,
    incidentAttachments,
    summary,
  } = useMemo(() => {
    const now = new Date();

    const lines: ProductionLine[] = [
      {
        id: "press-a",
        name: "Press Cell A",
        defectRate: 1.8,
        qaHolds: 3,
        goldenSampleStatus: "pass",
        lastGoldenSample: subHours(now, 2),
        throughputPerHour: 132,
        activeExceptions: 2,
        nextAudit: addHours(now, 6),
      },
      {
        id: "press-b",
        name: "Sublimation Cell B",
        defectRate: 2.7,
        qaHolds: 5,
        goldenSampleStatus: "attention",
        lastGoldenSample: subHours(now, 5),
        throughputPerHour: 118,
        activeExceptions: 3,
        nextAudit: addHours(now, 3),
      },
      {
        id: "stitch-1",
        name: "Cut & Sew Line 1",
        defectRate: 1.2,
        qaHolds: 1,
        goldenSampleStatus: "pass",
        lastGoldenSample: subMinutes(now, 45),
        throughputPerHour: 96,
        activeExceptions: 1,
        nextAudit: addHours(now, 9),
      },
      {
        id: "emb-2",
        name: "Embroidery Line 2",
        defectRate: 3.4,
        qaHolds: 7,
        goldenSampleStatus: "fail",
        lastGoldenSample: subDays(now, 1),
        throughputPerHour: 84,
        activeExceptions: 4,
        nextAudit: addHours(now, 2),
      },
    ];

    const checkpoints: QualityCheckpoint[] = [
      {
        id: "qc-ink-1",
        lineId: "press-a",
        stage: "Ink calibration",
        status: "passing",
        inspector: "Riya Malik",
        lastRun: subHours(now, 1),
        nextDue: addHours(now, 7),
        automationCoverage: 78,
        notes: "DeltaE drift within tolerance (<2.0).",
      },
      {
        id: "qc-prepress-1",
        lineId: "press-a",
        stage: "Pre-press proof",
        status: "attention",
        inspector: "Dev Patel",
        lastRun: subMinutes(now, 35),
        nextDue: addHours(now, 4),
        automationCoverage: 64,
        notes: "Two proof approvals pending product manager sign-off.",
      },
      {
        id: "qc-fabric-2",
        lineId: "press-b",
        stage: "Fabric moisture",
        status: "blocked",
        inspector: "Akshara Iyer",
        lastRun: subHours(now, 6),
        nextDue: addHours(now, 1),
        automationCoverage: 52,
        notes: "Sensor flagged humidity > 55%. Dryer purge in progress.",
      },
      {
        id: "qc-thermal-2",
        lineId: "press-b",
        stage: "Thermal cycle",
        status: "attention",
        inspector: "Rohit Shah",
        lastRun: subMinutes(now, 55),
        nextDue: addHours(now, 5),
        automationCoverage: 71,
        notes: "Pressure variation observed on platen 3 (+8%).",
      },
      {
        id: "qc-stitch-1",
        lineId: "stitch-1",
        stage: "Stitch density",
        status: "passing",
        inspector: "Mira Saini",
        lastRun: subMinutes(now, 20),
        nextDue: addHours(now, 3),
        automationCoverage: 81,
        notes: "Pattern 18B auto-verified via camera vision.",
      },
      {
        id: "qc-fit-1",
        lineId: "stitch-1",
        stage: "Fit audit",
        status: "attention",
        inspector: "Mira Saini",
        lastRun: subHours(now, 4),
        nextDue: addHours(now, 10),
        automationCoverage: 48,
        notes: "Size M hoodie tolerance breach at chest +1.4 cm.",
      },
      {
        id: "qc-thread-2",
        lineId: "emb-2",
        stage: "Thread tension",
        status: "blocked",
        inspector: "Jai Kapoor",
        lastRun: subHours(now, 8),
        nextDue: addHours(now, 1),
        automationCoverage: 57,
        notes: "Machine 4 tensioner alarm; maintenance ticket VEND-981 queued.",
      },
      {
        id: "qc-needle-2",
        lineId: "emb-2",
        stage: "Needle integrity",
        status: "attention",
        inspector: "Jai Kapoor",
        lastRun: subMinutes(now, 70),
        nextDue: addHours(now, 6),
        automationCoverage: 63,
        notes: "Needle set 7 approaching cycle threshold (92%).",
      },
    ];

    const exceptions: QaException[] = [
      {
        id: "qa-1020",
        lineId: "press-b",
        item: "Sublimation Tee · Skyline",
        issue: "Color variance > DeltaE 3.8",
        severity: "critical",
        correctiveAction: "Recalibrate ink set and rerun proof lot",
        owner: "QA Cell B",
        due: addHours(now, 2),
        status: "inProgress",
        attachments: [
          { id: "att-201", type: "photo", label: "Panel RGB drift" },
          { id: "att-202", type: "measurement", label: "Spectro read", measurement: "ΔE 3.8" },
        ],
      },
      {
        id: "qa-1024",
        lineId: "emb-2",
        item: "Crewneck · Crest Badge",
        issue: "Needle breakage on motif center",
        severity: "high",
        correctiveAction: "Swap needle set 7 and run 10-piece validation",
        owner: "Maintenance",
        due: addHours(now, 4),
        status: "open",
        attachments: [
          { id: "att-204", type: "photo", label: "Frame fracture" },
          { id: "att-205", type: "note", label: "Operator log excerpt" },
        ],
      },
      {
        id: "qa-1030",
        lineId: "stitch-1",
        item: "Hoodie · Velocity",
        issue: "Stitch density drift on sleeve hem",
        severity: "medium",
        correctiveAction: "Increase feed rate +2% and confirm on golden sample",
        owner: "Cut & Sew",
        due: addHours(now, 8),
        status: "inProgress",
        attachments: [
          { id: "att-210", type: "measurement", label: "Density log", measurement: "7.4 SPI" },
        ],
      },
      {
        id: "qa-1033",
        lineId: "press-a",
        item: "Poster · Neon Wave",
        issue: "Banding observed on gradient",
        severity: "medium",
        correctiveAction: "Purge CMYK nozzles and capture validation scan",
        owner: "Print Ops",
        due: addHours(now, 6),
        status: "open",
        attachments: [
          { id: "att-220", type: "photo", label: "Scanner capture" },
          { id: "att-221", type: "note", label: "Hold lot 1142" },
        ],
      },
    ];

    const approvals: GoldenSampleApproval[] = [
      {
        id: "gs-410",
        lineId: "stitch-1",
        item: "Hoodie · Velocity",
        inspector: "Nandini Varma",
        approvedAt: subMinutes(now, 40),
        deltaE: 1.6,
        washTest: "pass",
        notes: "Sleeve hem adjustments validated against control sample.",
      },
      {
        id: "gs-409",
        lineId: "press-a",
        item: "Poster · Neon Wave",
        inspector: "Dev Patel",
        approvedAt: subHours(now, 3),
        deltaE: 1.9,
        washTest: "pass",
        notes: "Banding resolved post nozzle purge; gradient within spec.",
      },
      {
        id: "gs-408",
        lineId: "press-b",
        item: "Sublimation Tee · Skyline",
        inspector: "Akshara Iyer",
        approvedAt: subHours(now, 7),
        deltaE: 3.1,
        washTest: "pass",
        notes: "Approved with action item to monitor humidity purge cycle.",
      },
      {
        id: "gs-407",
        lineId: "emb-2",
        item: "Crewneck · Crest Badge",
        inspector: "Jai Kapoor",
        approvedAt: subDays(now, 1),
        deltaE: 1.2,
        washTest: "pass",
        notes: "Pre-failure reference captured for motif tension check.",
      },
    ];

    const incidentAttachments = exceptions.flatMap((exception) =>
      exception.attachments.map((attachment) => ({
        ...attachment,
        exceptionId: exception.id,
        lineId: exception.lineId,
        item: exception.item,
      }))
    );

    const totalQaHolds = lines.reduce((acc, line) => acc + line.qaHolds, 0);
    const averageDefectRate =
      lines.length > 0
        ? lines.reduce((acc, line) => acc + line.defectRate, 0) / lines.length
        : 0;

    const summary = {
      totalGoldenSamples: approvals.length,
      openExceptions: exceptions.length,
      qaHolds: totalQaHolds,
      averageDefectRate,
    };

    return { lines, checkpoints, exceptions, approvals, incidentAttachments, summary };
  }, []);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Quality Assurance"
        description="Track golden samples, defect rates, and QA holds across production lines."
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Active QA holds</CardDescription>
            <CardTitle className="text-3xl font-semibold">{summary.qaHolds}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Across {lines.length} production lines with holds awaiting clearance.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Average defect rate</CardDescription>
            <CardTitle className="text-3xl font-semibold">
              {summary.averageDefectRate.toFixed(1)}%
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Gauge className="h-4 w-4" aria-hidden="true" />
              <span>Includes in-process and finished goods inspection.</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Golden sample approvals (24h)</CardDescription>
            <CardTitle className="text-3xl font-semibold">{summary.totalGoldenSamples}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <ShieldCheck className="h-4 w-4" aria-hidden="true" />
              <span>Latest approvals logged with timestamps and measurements.</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Open QA exceptions</CardDescription>
            <CardTitle className="text-3xl font-semibold">{summary.openExceptions}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <AlertTriangle className="h-4 w-4" aria-hidden="true" />
              <span>Exceptions require corrective actions before release.</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="pb-4">
          <CardTitle>Production line QA snapshot</CardTitle>
          <CardDescription>Defect rates, golden samples, and upcoming audits per line.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Line</TableHead>
                <TableHead className="hidden xl:table-cell">Status</TableHead>
                <TableHead>Defect rate</TableHead>
                <TableHead>QA holds</TableHead>
                <TableHead className="hidden md:table-cell">Throughput/hr</TableHead>
                <TableHead className="hidden lg:table-cell">Last golden sample</TableHead>
                <TableHead className="hidden lg:table-cell">Next audit</TableHead>
                <TableHead>Exceptions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {lines.map((line) => (
                <TableRow key={line.id}>
                  <TableCell>
                    <div className="font-medium">{line.name}</div>
                    <div className="text-xs text-muted-foreground">
                      Golden sample {formatRelative(line.lastGoldenSample)}
                    </div>
                  </TableCell>
                  <TableCell className="hidden xl:table-cell">
                    <Badge className={statusTone[line.goldenSampleStatus]}>
                      {line.goldenSampleStatus === "pass"
                        ? "On track"
                        : line.goldenSampleStatus === "attention"
                          ? "Watch"
                          : "Hold"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="font-medium">{line.defectRate.toFixed(1)}%</div>
                    <Progress value={Math.min(line.defectRate * 20, 100)} className="mt-2" />
                  </TableCell>
                  <TableCell>
                    <span className="font-medium">{line.qaHolds}</span>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">{line.throughputPerHour}</TableCell>
                  <TableCell className="hidden lg:table-cell text-sm text-muted-foreground">
                    {format(line.lastGoldenSample, "MMM d · HH:mm")}
                  </TableCell>
                  <TableCell className="hidden lg:table-cell text-sm text-muted-foreground">
                    {format(line.nextAudit, "MMM d · HH:mm")}
                  </TableCell>
                  <TableCell>{line.activeExceptions}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Quality control checkpoints</CardTitle>
          <CardDescription>Integrations with in-line inspections, humidity probes, and stitch vision systems.</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue={lines[0]?.id ?? ""} className="space-y-4">
            <TabsList>
              {lines.map((line) => (
                <TabsTrigger key={line.id} value={line.id}>
                  {line.name}
                </TabsTrigger>
              ))}
            </TabsList>
            {lines.map((line) => (
              <TabsContent key={line.id} value={line.id}>
                <div className="space-y-4">
                  {checkpoints
                    .filter((checkpoint) => checkpoint.lineId === line.id)
                    .map((checkpoint) => {
                      const badge = checkpointCopy[checkpoint.status];
                      const BadgeIcon = badge.icon;
                      return (
                        <div
                          key={checkpoint.id}
                          className="grid gap-4 rounded-lg border border-border/60 p-4 md:grid-cols-[minmax(0,1fr)_auto]"
                        >
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <Badge className={badge.tone}>
                                <BadgeIcon className="mr-1 h-3 w-3" aria-hidden="true" />
                                {badge.label}
                              </Badge>
                              <span className="text-sm font-medium">{checkpoint.stage}</span>
                            </div>
                            <p className="text-sm text-muted-foreground">{checkpoint.notes}</p>
                            <div className="flex flex-wrap gap-x-4 gap-y-2 text-xs text-muted-foreground">
                              <span>Inspector: {checkpoint.inspector}</span>
                              <span>Last run {formatRelative(checkpoint.lastRun)}</span>
                              <span>Next due {formatRelative(checkpoint.nextDue)}</span>
                            </div>
                          </div>
                          <div className="flex flex-col justify-between gap-2 text-sm">
                            <div className="text-right font-medium">Automation coverage</div>
                            <Progress value={checkpoint.automationCoverage} className="h-2" />
                            <div className="text-right text-xs text-muted-foreground">
                              {checkpoint.automationCoverage}% instrumented
                            </div>
                          </div>
                        </div>
                      );
                    })}
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Active QA exceptions</CardTitle>
          <CardDescription>Exceptions linked to corrective actions and attachments for review.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <ScrollArea className="max-h-[360px] pr-4">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Item</TableHead>
                  <TableHead>Issue</TableHead>
                  <TableHead>Severity</TableHead>
                  <TableHead className="hidden lg:table-cell">Corrective action</TableHead>
                  <TableHead>Owner</TableHead>
                  <TableHead>Due</TableHead>
                  <TableHead>Attachments</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {exceptions.map((exception) => (
                  <TableRow key={exception.id}>
                    <TableCell>
                      <div className="font-medium">{exception.item}</div>
                      <div className="text-xs text-muted-foreground">{exception.id}</div>
                    </TableCell>
                    <TableCell className="max-w-[220px]">
                      <div className="text-sm">{exception.issue}</div>
                      <div className="text-xs text-muted-foreground">Line: {exception.lineId}</div>
                    </TableCell>
                    <TableCell>
                      <Badge className={severityTone[exception.severity]}>
                        {exception.severity.charAt(0).toUpperCase() + exception.severity.slice(1)}
                      </Badge>
                    </TableCell>
                    <TableCell className="hidden lg:table-cell text-sm text-muted-foreground">
                      {exception.correctiveAction}
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">{exception.owner}</div>
                      <div className="text-xs text-muted-foreground">
                        {exception.status === "inProgress" ? "In progress" : "Awaiting start"}
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {format(exception.due, "MMM d · HH:mm")}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {exception.attachments.map((attachment) => {
                          const Icon = attachmentIcon[attachment.type];
                          return (
                            <Badge
                              key={attachment.id}
                              className={`${attachmentTone[attachment.type]} flex items-center gap-1`}
                            >
                              <Icon className="h-3 w-3" aria-hidden="true" />
                              <span>{attachment.measurement ?? attachment.label}</span>
                            </Badge>
                          );
                        })}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </ScrollArea>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <ClipboardList className="h-4 w-4" aria-hidden="true" />
            <span>Exceptions remain on QA hold until corrective actions are marked complete.</span>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Golden sample approvals</CardTitle>
            <CardDescription>Timestamped approvals with deltaE measurements and wash tests.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {approvals.map((approval) => (
                <div key={approval.id} className="rounded-lg border border-border/60 p-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <div className="font-medium">{approval.item}</div>
                      <div className="text-xs text-muted-foreground">
                        Approved {formatRelative(approval.approvedAt)} · {approval.id}
                      </div>
                    </div>
                    <Badge className="bg-emerald-100 text-emerald-700">
                      ΔE {approval.deltaE.toFixed(1)}
                    </Badge>
                  </div>
                  <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                    <span>Inspector: {approval.inspector}</span>
                    <span>Line: {approval.lineId}</span>
                    <span>Wash test: {approval.washTest === "pass" ? "Pass" : "Fail"}</span>
                  </div>
                  <p className="mt-3 text-sm text-muted-foreground">{approval.notes}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Incident evidence library</CardTitle>
            <CardDescription>Photos, measurements, and operator notes attached to QA holds.</CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="max-h-[320px] pr-2">
              <div className="space-y-3">
                {incidentAttachments.map((attachment) => {
                  const Icon = attachmentIcon[attachment.type];
                  return (
                    <div
                      key={`${attachment.exceptionId}-${attachment.id}`}
                      className="rounded-lg border border-border/60 p-3"
                    >
                      <div className="flex items-start gap-3">
                        <Badge className={`${attachmentTone[attachment.type]} flex items-center gap-1`}>
                          <Icon className="h-3 w-3" aria-hidden="true" />
                          {attachment.type === "photo"
                            ? "Photo"
                            : attachment.type === "measurement"
                              ? "Measurement"
                              : "Note"}
                        </Badge>
                        <div className="flex-1 space-y-1">
                          <div className="text-sm font-medium">{attachment.label}</div>
                          <div className="text-xs text-muted-foreground">
                            Exception {attachment.exceptionId} · {attachment.item}
                          </div>
                          <div className="text-xs text-muted-foreground">Line: {attachment.lineId}</div>
                          {attachment.measurement ? (
                            <div className="text-sm text-muted-foreground">
                              Measurement: {attachment.measurement}
                            </div>
                          ) : null}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
