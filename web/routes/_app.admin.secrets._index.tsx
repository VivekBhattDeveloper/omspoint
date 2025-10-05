import { useMemo } from "react";
import type { Route } from "./+types/_app.admin.secrets._index";
import { PageHeader } from "@/components/app/page-header";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const ROTATION_DUE_THRESHOLD_DAYS = 90;
const RECENT_ROTATION_DAYS = 30;

type SecretStatus = "active" | "retired";
type SecretEnvironment = "production" | "staging" | "sandbox" | "development";

type SecretVersionRecord = {
  id: string;
  versionNumber: number;
  createdAt?: string | null;
  createdByName?: string | null;
  checksum?: string | null;
};

type SecretRecord = {
  id: string;
  key: string;
  environment: SecretEnvironment;
  status: SecretStatus;
  version: number;
  lastRotatedAt?: string | null;
  createdAt?: string | null;
  createdByName?: string | null;
  versions: SecretVersionRecord[];
};

type LoaderResult = {
  secrets: SecretRecord[];
  source: "api" | "fallback";
  error?: string;
};

const FALLBACK_SECRETS: SecretRecord[] = [
  {
    id: "secret-core-signing",
    key: "core.signing.key",
    environment: "production",
    status: "active",
    version: 5,
    lastRotatedAt: "2025-02-10T12:30:00Z",
    createdAt: "2024-09-15T18:20:00Z",
    createdByName: "Platform Ops",
    versions: [
      {
        id: "secret-core-signing-v5",
        versionNumber: 5,
        createdAt: "2025-02-10T12:30:00Z",
        createdByName: "M. Lopez",
        checksum: "9fd8c7",
      },
      {
        id: "secret-core-signing-v4",
        versionNumber: 4,
        createdAt: "2024-11-20T09:12:00Z",
        createdByName: "M. Lopez",
        checksum: "aa45b1",
      },
    ],
  },
  {
    id: "secret-print-network",
    key: "print.network.apiToken",
    environment: "staging",
    status: "active",
    version: 3,
    lastRotatedAt: "2024-12-18T08:15:00Z",
    createdAt: "2024-05-02T15:04:00Z",
    createdByName: "Automation Ops",
    versions: [
      {
        id: "secret-print-network-v3",
        versionNumber: 3,
        createdAt: "2024-12-18T08:15:00Z",
        createdByName: "Automation Ops",
        checksum: "51cd70",
      },
      {
        id: "secret-print-network-v2",
        versionNumber: 2,
        createdAt: "2024-09-12T10:40:00Z",
        createdByName: "Automation Ops",
        checksum: "7b11da",
      },
    ],
  },
  {
    id: "secret-legacy-webhook",
    key: "legacy.webhook.secret",
    environment: "production",
    status: "retired",
    version: 1,
    lastRotatedAt: "2023-11-05T21:00:00Z",
    createdAt: "2023-11-05T21:00:00Z",
    createdByName: "Legacy Ops",
    versions: [
      {
        id: "secret-legacy-webhook-v1",
        versionNumber: 1,
        createdAt: "2023-11-05T21:00:00Z",
        createdByName: "Legacy Ops",
        checksum: "0f31c2",
      },
    ],
  },
];

const statusTone: Record<SecretStatus, string> = {
  active: "border-emerald-200 bg-emerald-50 text-emerald-700",
  retired: "border-slate-200 bg-slate-50 text-slate-600",
};

const environmentLabel: Record<SecretEnvironment, string> = {
  production: "Production",
  staging: "Staging",
  sandbox: "Sandbox",
  development: "Development",
};

const environmentTone: Record<SecretEnvironment, string> = {
  production: "border-rose-200 bg-rose-50 text-rose-700",
  staging: "border-blue-200 bg-blue-50 text-blue-700",
  sandbox: "border-amber-200 bg-amber-50 text-amber-700",
  development: "border-slate-200 bg-slate-50 text-slate-600",
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

const toOptionalString = (value: unknown): string | undefined => {
  if (typeof value === "string" && value.length > 0) {
    return value;
  }
  if (typeof value === "number" || typeof value === "boolean") {
    return String(value);
  }
  return undefined;
};

const normalizeSecret = (record: any): SecretRecord | undefined => {
  const id = toOptionalString(record?.id);
  const key = toOptionalString(record?.key);
  if (!id || !key) {
    return undefined;
  }

  const environmentRaw = toOptionalString(record?.environment)?.toLowerCase();
  const environment: SecretEnvironment =
    environmentRaw === "production" ||
    environmentRaw === "staging" ||
    environmentRaw === "sandbox" ||
    environmentRaw === "development"
      ? environmentRaw
      : "production";

  const statusRaw = toOptionalString(record?.status)?.toLowerCase();
  const status: SecretStatus = statusRaw === "retired" ? "retired" : "active";

  const versionsRaw = Array.isArray(record?.secretVersions) ? record.secretVersions : [];
  const versions: SecretVersionRecord[] = versionsRaw
    .map((version: any) => {
      const versionId = toOptionalString(version?.id) ?? `${id}-v${version?.versionNumber ?? 0}`;
      const versionNumber = Number(version?.versionNumber ?? 0);
      return {
        id: versionId,
        versionNumber,
        createdAt: toOptionalString(version?.createdAt),
        createdByName:
          toOptionalString(version?.createdBy?.name) ??
          ([toOptionalString(version?.createdBy?.firstName), toOptionalString(version?.createdBy?.lastName)]
            .filter(Boolean)
            .join(" ") ||
          toOptionalString(version?.createdByName)),
        checksum: toOptionalString(version?.checksum),
      } satisfies SecretVersionRecord;
    })
    .sort((a, b) => b.versionNumber - a.versionNumber);

  const createdByName =
    toOptionalString(record?.createdBy?.name) ??
    ([toOptionalString(record?.createdBy?.firstName), toOptionalString(record?.createdBy?.lastName)]
      .filter(Boolean)
      .join(" ") ||
    toOptionalString(record?.createdByName));

  return {
    id,
    key,
    environment,
    status,
    version: Number(record?.version ?? versions[0]?.versionNumber ?? 1),
    lastRotatedAt: toOptionalString(record?.lastRotatedAt),
    createdAt: toOptionalString(record?.createdAt),
    createdByName,
    versions,
  } satisfies SecretRecord;
};

export const loader = async ({ context }: Route.LoaderArgs): Promise<LoaderResult> => {
  const manager = (context.api as Record<string, unknown> | undefined)?.secret as
    | { findMany?: (options: unknown) => Promise<unknown> }
    | undefined;

  if (!manager?.findMany) {
    return { secrets: FALLBACK_SECRETS, source: "fallback", error: "Secret model not available in API client." };
  }

  try {
    const raw = (await manager.findMany({
      select: {
        id: true,
        key: true,
        environment: true,
        status: true,
        version: true,
        lastRotatedAt: true,
        createdAt: true,
        createdBy: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
        secretVersions: {
          select: {
            id: true,
            versionNumber: true,
            createdAt: true,
            checksum: true,
            createdBy: {
              select: {
                firstName: true,
                lastName: true,
              },
            },
          },
          sort: { versionNumber: "Descending" },
          first: 10,
        },
      },
      sort: { key: "Ascending" },
      first: 100,
    })) as unknown[];

    const secrets = raw
      .map((record) => normalizeSecret(record))
      .filter((secret): secret is SecretRecord => Boolean(secret));

    return { secrets, source: "api" };
  } catch (error) {
    return {
      secrets: FALLBACK_SECRETS,
      source: "fallback",
      error: serializeError(error),
    };
  }
};

type SecretSummary = {
  total: number;
  active: number;
  retired: number;
  rotationDue: number;
  recentRotations: number;
};

const computeSummary = (secrets: SecretRecord[]): SecretSummary => {
  const now = Date.now();
  const rotationDueCutoff = now - ROTATION_DUE_THRESHOLD_DAYS * 24 * 60 * 60 * 1000;
  const recentRotationCutoff = now - RECENT_ROTATION_DAYS * 24 * 60 * 60 * 1000;

  return secrets.reduce<SecretSummary>(
    (accumulator, secret) => {
      if (secret.status === "active") {
        accumulator.active += 1;
      } else {
        accumulator.retired += 1;
      }

      const rotatedAt = secret.lastRotatedAt ? Date.parse(secret.lastRotatedAt) : undefined;
      if (rotatedAt && rotatedAt >= recentRotationCutoff) {
        accumulator.recentRotations += 1;
      }
      if (secret.status === "active" && rotatedAt && rotatedAt < rotationDueCutoff) {
        accumulator.rotationDue += 1;
      }

      accumulator.total += 1;
      return accumulator;
    },
    {
      total: 0,
      active: 0,
      retired: 0,
      rotationDue: 0,
      recentRotations: 0,
    }
  );
};

const formatDateTime = (value?: string | null) => {
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

const formatRelative = (value?: string | null) => {
  if (!value) {
    return "—";
  }
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return "—";
  }
  const delta = Date.now() - parsed.getTime();
  const formatter = new Intl.RelativeTimeFormat("en", { numeric: "auto" });
  const days = Math.round(delta / (24 * 60 * 60 * 1000));
  if (Math.abs(days) >= 7) {
    const weeks = Math.round(days / 7);
    return formatter.format(-weeks, "week");
  }
  return formatter.format(-days, "day");
};

const StatusBadge = ({ status }: { status: SecretStatus }) => (
  <Badge variant="outline" className={`font-medium ${statusTone[status]}`}>
    {status === "active" ? "Active" : "Retired"}
  </Badge>
);

const EnvironmentBadge = ({ environment }: { environment: SecretEnvironment }) => (
  <Badge variant="outline" className={`font-medium ${environmentTone[environment]}`}>
    {environmentLabel[environment]}
  </Badge>
);

export default function AdminSecretsPage({ loaderData }: Route.ComponentProps) {
  const { secrets, source } = loaderData;
  const summary = useMemo(() => computeSummary(secrets), [secrets]);
  const number = useMemo(() => new Intl.NumberFormat("en-US"), []);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Secrets Vault"
        description="Inventory and monitor credential material across environments."
      />

      <Card>
        <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <CardTitle>Vault posture</CardTitle>
            <CardDescription>Rotation hygiene and lifecycle status for managed secrets.</CardDescription>
          </div>
          {source === "fallback" ? (
            <Badge variant="outline" className="text-xs font-semibold uppercase tracking-wide">
              Sample data
            </Badge>
          ) : null}
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <MetricTile label="Secrets tracked" value={number.format(summary.total)} hint="Across all environments" tone="neutral" />
            <MetricTile label="Active secrets" value={number.format(summary.active)} hint="Ready for use" tone="success" />
            <MetricTile
              label="Rotation due"
              value={number.format(summary.rotationDue)}
              hint={`Older than ${ROTATION_DUE_THRESHOLD_DAYS} days`}
              tone={summary.rotationDue > 0 ? "warning" : "success"}
            />
            <MetricTile
              label="Rotated recently"
              value={number.format(summary.recentRotations)}
              hint={`Within ${RECENT_ROTATION_DAYS} days`}
              tone="info"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Secrets inventory</CardTitle>
          <CardDescription>Version history and rotation cadence per secret.</CardDescription>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="min-w-[220px]">Key</TableHead>
                <TableHead>Environment</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Version</TableHead>
                <TableHead>Last rotation</TableHead>
                <TableHead>Owner</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {secrets.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground">
                    No secrets recorded yet.
                  </TableCell>
                </TableRow>
              ) : (
                secrets.map((secret) => {
                  const latestVersion = secret.versions[0];
                  return (
                    <TableRow key={secret.id}>
                      <TableCell>
                        <div className="font-medium">{secret.key}</div>
                        <div className="text-xs text-muted-foreground">
                          Created {formatDateTime(secret.createdAt)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <EnvironmentBadge environment={secret.environment} />
                      </TableCell>
                      <TableCell>
                        <StatusBadge status={secret.status} />
                      </TableCell>
                      <TableCell>
                        v{secret.version}
                        {latestVersion && latestVersion.versionNumber !== secret.version ? (
                          <span className="ml-1 text-xs text-muted-foreground">(latest v{latestVersion.versionNumber})</span>
                        ) : null}
                      </TableCell>
                      <TableCell>
                        <div>{formatDateTime(secret.lastRotatedAt)}</div>
                        <div className="text-xs text-muted-foreground">{formatRelative(secret.lastRotatedAt)}</div>
                      </TableCell>
                      <TableCell>
                        {secret.createdByName ? secret.createdByName : "—"}
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Version history spot check</CardTitle>
          <CardDescription>Latest version metadata with checksums and operators.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {secrets.flatMap((secret) => secret.versions.slice(0, 1).map((version) => ({ secret, version }))).map(({ secret, version }) => (
            <div key={`${secret.id}-${version.id}`} className="rounded-lg border bg-card p-4">
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>{environmentLabel[secret.environment]}</span>
                <StatusBadge status={secret.status} />
              </div>
              <div className="mt-2 text-sm font-semibold">{secret.key}</div>
              <div className="mt-1 text-xs text-muted-foreground">Version {version.versionNumber}</div>
              <dl className="mt-3 space-y-2 text-xs text-muted-foreground">
                <div className="flex justify-between">
                  <dt>Rotated</dt>
                  <dd>{formatDateTime(version.createdAt)}</dd>
                </div>
                <div className="flex justify-between">
                  <dt>Operator</dt>
                  <dd>{version.createdByName ?? "—"}</dd>
                </div>
                <div className="flex justify-between">
                  <dt>Checksum</dt>
                  <dd>{version.checksum ?? "—"}</dd>
                </div>
              </dl>
            </div>
          ))}
          {secrets.length === 0 ? (
            <div className="col-span-full rounded-lg border border-dashed py-8 text-center text-sm text-muted-foreground">
              Version records will appear here once secrets are rotated.
            </div>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}

type MetricTileProps = {
  label: string;
  value: string;
  hint: string;
  tone: "neutral" | "success" | "warning" | "info";
};

const toneClass: Record<MetricTileProps["tone"], string> = {
  neutral: "border-slate-200",
  success: "border-emerald-200 bg-emerald-50",
  warning: "border-amber-200 bg-amber-50",
  info: "border-blue-200 bg-blue-50",
};

function MetricTile({ label, value, hint, tone }: MetricTileProps) {
  return (
    <div className={`flex flex-col justify-between gap-3 rounded-lg border bg-background p-4 ${toneClass[tone]}`}>
      <div className="text-sm text-muted-foreground">{label}</div>
      <div className="text-2xl font-semibold leading-tight">{value}</div>
      <div className="text-xs text-muted-foreground">{hint}</div>
    </div>
  );
}
