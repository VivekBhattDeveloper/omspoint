import { useCallback, useMemo, useState, type ReactNode } from "react";
import type { Route } from "./+types/_app.admin.rbac._index";
import { PageHeader } from "@/components/app/page-header";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { permissions } from "../../accessControl/permissions.gadget";

type NormalizedActionGrant = {
  allowed: boolean;
  filter?: string;
  filterContent?: string;
  fields?: string[];
  raw: unknown;
};

type NormalizedModelGrant = {
  name: string;
  read?: NormalizedActionGrant;
  actions: Record<string, NormalizedActionGrant>;
};

type NormalizedFilter = {
  path: string;
  content?: string;
};

type NormalizedRole = {
  key: string;
  label: string;
  storageKey?: string;
  defaultPrivileges: {
    read?: NormalizedActionGrant;
    action?: NormalizedActionGrant;
  };
  models: NormalizedModelGrant[];
  actionKeys: string[];
  filters: NormalizedFilter[];
};

type FeatureFlag = {
  key: string;
  label: string;
  description: string;
  enabledRoles: string[];
  category?: string;
};

const filterModules = import.meta.glob("../../accessControl/filters/**/*.gelly", {
  as: "raw",
  eager: true,
}) as Record<string, string>;

const filterContentByPath: Record<string, string> = Object.fromEntries(
  Object.entries(filterModules).map(([path, content]) => [normalizeFilterKey(path), content])
);

const DEFAULT_FEATURE_FLAGS: FeatureFlag[] = [
  {
    key: "admin.observability",
    label: "Observability suite",
    description: "Expose logs, traces, and SLO dashboards inside the admin workspace.",
    enabledRoles: ["signed-in"],
    category: "Platform",
  },
  {
    key: "admin.audit-export",
    label: "Audit trail exports",
    description: "Allow bulk export of audit events and advanced filtering tools.",
    enabledRoles: ["signed-in"],
    category: "Compliance",
  },
  {
    key: "admin.integration-registry",
    label: "Integration registry",
    description: "Manage third-party integrations, credentials, and webhook status screens.",
    enabledRoles: [],
    category: "Ecosystem",
  },
  {
    key: "admin.catalog-schema",
    label: "Catalog schema editor",
    description: "Toggle access to catalog schema migrations and attribute governance.",
    enabledRoles: [],
    category: "Catalog",
  },
];

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

export const loader = async ({ context }: Route.LoaderArgs) => {
  const manager = (context.api as unknown as Record<string, unknown> | undefined)?.featureFlag as
    | { findMany?: (options: unknown) => Promise<unknown> }
    | undefined;

  if (!manager?.findMany) {
    return {
      featureFlags: DEFAULT_FEATURE_FLAGS,
      source: "fallback" as const,
      error: "FeatureFlag model not available in API client.",
    };
  }

  try {
    const raw = (await manager.findMany({
      select: {
        key: true,
        label: true,
        description: { truncatedHTML: true, plainText: true },
        category: true,
        enabledRoles: true,
        status: true,
      },
      sort: { key: "Ascending" },
      first: 100,
    })) as unknown[];

    const featureFlags: FeatureFlag[] = raw
      .map((record) => {
        const entry = record as Record<string, unknown>;
        const key = typeof entry.key === "string" && entry.key.length > 0 ? entry.key : undefined;
        if (!key) {
          return undefined;
        }

        const descriptionObj = entry.description as { plainText?: string } | string | undefined;
        const description =
          typeof descriptionObj === "object" && descriptionObj !== null
            ? (typeof descriptionObj.plainText === "string" && descriptionObj.plainText.trim().length > 0
                ? descriptionObj.plainText
                : undefined)
            : typeof descriptionObj === "string"
              ? descriptionObj
              : undefined;

        const enabledRoles = Array.isArray(entry.enabledRoles)
          ? (entry.enabledRoles as unknown[]).map((role) => String(role)).filter(Boolean)
          : [];

        return {
          key,
          label: typeof entry.label === "string" && entry.label.length > 0 ? entry.label : key,
          description: description ?? `Feature flag ${key}`,
          enabledRoles,
          category: typeof entry.category === "string" && entry.category.length > 0 ? entry.category : undefined,
        } satisfies FeatureFlag;
      })
      .filter((flag): flag is NonNullable<typeof flag> => flag !== undefined);

    return { featureFlags, source: "api" as const };
  } catch (error) {
    return {
      featureFlags: DEFAULT_FEATURE_FLAGS,
      source: "fallback" as const,
      error: serializeError(error),
    };
  }
};

export default function AdminRbacPage({ loaderData }: Route.ComponentProps) {
  const { featureFlags: initialFeatureFlags = DEFAULT_FEATURE_FLAGS, source = "fallback", error } =
    (loaderData ?? {}) as {
      featureFlags?: FeatureFlag[];
      source?: "api" | "fallback";
      error?: string;
    };

  const roles = useMemo(() => computeNormalizedRoles(permissions, filterContentByPath), []);
  const [featureFlags, setFeatureFlags] = useState<FeatureFlag[]>(() => initialFeatureFlags.map((flag) => ({ ...flag })));
  const [activeRoleKey, setActiveRoleKey] = useState(() => roles[0]?.key ?? "");

  const handleToggleFeatureFlag = useCallback(
    (flagKey: string, roleKey: string, enabled: boolean) => {
      let changed = false;
      let flagLabel = "";

      setFeatureFlags((previous) =>
        previous.map((flag) => {
          if (flag.key !== flagKey) {
            return flag;
          }

          flagLabel = flag.label;
          const enabledRoles = new Set(flag.enabledRoles);

          if (enabled) {
            if (!enabledRoles.has(roleKey)) {
              enabledRoles.add(roleKey);
              changed = true;
            }
          } else if (enabledRoles.delete(roleKey)) {
            changed = true;
          }

          return changed ? { ...flag, enabledRoles: Array.from(enabledRoles).sort() } : flag;
        })
      );

      if (changed && flagLabel) {
        toast.success(`${enabled ? "Enabled" : "Disabled"} ${flagLabel} for ${humanizeRoleKey(roleKey)}`);
      }
    },
    []
  );

  return (
    <TooltipProvider delayDuration={50}>
      <div className="space-y-6">
        <PageHeader
          title="Roles & Permissions"
          description="Define RBAC scopes, manage feature flags per role, and sync with access control policies."
        />
        {source === "fallback" ? (
          <p className="text-sm text-muted-foreground">
            Feature flags loaded from sample data{error ? ` – ${error}` : "."}
          </p>
        ) : null}

        {roles.length === 0 ? (
          <Card>
            <CardHeader>
              <CardTitle>Metadata unavailable</CardTitle>
              <CardDescription>No Gadget roles were found in `accessControl/permissions.gadget.ts`.</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Add role definitions to your Gadget project and re-run the build to audit permissions here.
              </p>
            </CardContent>
          </Card>
        ) : (
          <Tabs value={activeRoleKey} onValueChange={setActiveRoleKey} className="space-y-6">
            <TabsList>
              {roles.map((role) => (
                <TabsTrigger key={role.key} value={role.key}>
                  {role.label}
                </TabsTrigger>
              ))}
            </TabsList>

            {roles.map((role) => (
              <TabsContent key={role.key} value={role.key} className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>{role.label} overview</CardTitle>
                    <CardDescription>
                      Aggregated from Gadget metadata for {role.models.length} configured model
                      {role.models.length === 1 ? "" : "s"}.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
                      <InfoItem label="Storage key" value={role.storageKey ? <code>{role.storageKey}</code> : "—"} />
                      <InfoItem
                        label="Default read"
                        value={<PermissionBadge grant={role.defaultPrivileges.read} />}
                      />
                      <InfoItem
                        label="Default actions"
                        value={<PermissionBadge grant={role.defaultPrivileges.action} />}
                      />
                      <InfoItem
                        label="Explicit model grants"
                        value={<span className="text-lg font-semibold">{role.models.length}</span>}
                      />
                      <InfoItem
                        label="Referenced filters"
                        value={<span className="text-lg font-semibold">{role.filters.length}</span>}
                      />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Model access matrix</CardTitle>
                    <CardDescription>
                      Each cell reflects explicit grants or inherited defaults from Gadget permissions.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-48">Model</TableHead>
                          <TableHead>Read</TableHead>
                          {role.actionKeys.map((action) => (
                            <TableHead key={action}>{formatIdentifier(action)}</TableHead>
                          ))}
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {role.models.map((model) => (
                          <TableRow key={model.name}>
                            <TableCell className="font-medium">{formatIdentifier(model.name)}</TableCell>
                            <TableCell>
                              <PermissionBadge grant={model.read} fallback={role.defaultPrivileges.read} />
                            </TableCell>
                            {role.actionKeys.map((action) => (
                              <TableCell key={action}>
                                <PermissionBadge
                                  grant={model.actions[action]}
                                  fallback={role.defaultPrivileges.action}
                                />
                              </TableCell>
                            ))}
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Feature flags</CardTitle>
                    <CardDescription>Toggle feature availability for the {role.label.toLowerCase()} role.</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <FeatureFlagList
                      roleKey={role.key}
                      featureFlags={featureFlags}
                      onToggle={handleToggleFeatureFlag}
                    />
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Gelly filters</CardTitle>
                    <CardDescription>Row-level policies referenced by this role&apos;s grants.</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {role.filters.length === 0 ? (
                      <p className="text-sm text-muted-foreground">No gelly filters referenced by this role.</p>
                    ) : (
                      <Accordion type="multiple" className="space-y-2">
                        {role.filters.map((filter) => (
                          <AccordionItem key={filter.path} value={filter.path}>
                            <AccordionTrigger>
                              <div className="flex w-full items-center justify-between gap-3">
                                <span className="truncate text-left text-sm font-medium">{filter.path}</span>
                                <Badge variant="outline" className="shrink-0">
                                  {filter.content ? "Synced" : "Missing"}
                                </Badge>
                              </div>
                            </AccordionTrigger>
                            <AccordionContent>
                              <pre className="mt-2 whitespace-pre-wrap rounded-md bg-muted p-3 text-xs font-mono leading-tight text-muted-foreground">
                                {filter.content ?? "Filter source could not be loaded. Confirm the file exists."}
                              </pre>
                            </AccordionContent>
                          </AccordionItem>
                        ))}
                      </Accordion>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            ))}
          </Tabs>
        )}
      </div>
    </TooltipProvider>
  );
}

const FeatureFlagList = ({
  roleKey,
  featureFlags,
  onToggle,
}: {
  roleKey: string;
  featureFlags: FeatureFlag[];
  onToggle: (flagKey: string, roleKey: string, enabled: boolean) => void;
}) => {
  if (featureFlags.length === 0) {
    return <p className="text-sm text-muted-foreground">No feature flags have been defined yet.</p>;
  }

  return (
    <div className="space-y-3">
      {featureFlags.map((flag) => {
        const checked = flag.enabledRoles.includes(roleKey);
        const inputId = `${flag.key}-${roleKey}`;

        return (
          <div key={flag.key} className="flex flex-col gap-3 rounded-lg border bg-background p-4 md:flex-row md:items-center">
            <div className="flex-1 space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <p className="font-medium leading-tight">{flag.label}</p>
                {flag.category ? (
                  <Badge variant="outline" className="text-xs uppercase tracking-wide text-muted-foreground">
                    {flag.category}
                  </Badge>
                ) : null}
              </div>
              <p className="text-sm text-muted-foreground">{flag.description}</p>
              <div className="flex flex-wrap items-center gap-1 text-xs text-muted-foreground">
                <span className="font-medium">Active for:</span>
                {flag.enabledRoles.length === 0 ? (
                  <span>no roles</span>
                ) : (
                  flag.enabledRoles.map((role) => (
                    <Badge key={role} variant="outline" className="text-[11px]">
                      {humanizeRoleKey(role)}
                    </Badge>
                  ))
                )}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Checkbox id={inputId} checked={checked} onCheckedChange={(state) => onToggle(flag.key, roleKey, state === true)} />
              <Label htmlFor={inputId} className="text-sm text-muted-foreground">
                {checked ? "Enabled" : "Disabled"}
              </Label>
            </div>
          </div>
        );
      })}
    </div>
  );
};

const PermissionBadge = ({
  grant,
  fallback,
}: {
  grant?: NormalizedActionGrant;
  fallback?: NormalizedActionGrant;
}) => {
  const effective = grant ?? fallback;
  const isInherited = !grant && !!fallback;

  if (!effective) {
    return (
      <Badge variant="outline" className="border-dashed border-muted-foreground/40 bg-transparent text-muted-foreground">
        —
      </Badge>
    );
  }

  const { allowed, filter, filterContent, fields } = effective;

  const badgeClass = cn(
    "font-medium",
    allowed
      ? filter
        ? "bg-sky-50 text-sky-700 border-sky-200"
        : "bg-emerald-50 text-emerald-700 border-emerald-200"
      : "bg-rose-50 text-rose-700 border-rose-200",
    isInherited && "border-dashed opacity-80"
  );

  const label = !allowed
    ? isInherited
      ? "Deny (default)"
      : "Denied"
    : filter
    ? isInherited
      ? "Filtered (default)"
      : "Filtered"
    : isInherited
    ? "Allow (default)"
    : "Allowed";

  const badge = (
    <Badge variant="outline" className={badgeClass}>
      {label}
    </Badge>
  );

  if (!filter && (!fields || fields.length === 0)) {
    return badge;
  }

  return (
    <Tooltip>
      <TooltipTrigger asChild>{badge}</TooltipTrigger>
      <TooltipContent className="max-w-xs space-y-2">
        {filter ? (
          <div>
            <p className="text-xs font-semibold">{filter}</p>
            <pre className="mt-1 whitespace-pre-wrap rounded bg-muted p-2 text-[11px] font-mono leading-tight text-muted-foreground">
              {filterContent ?? "Filter definition not found"}
            </pre>
          </div>
        ) : null}
        {fields && fields.length ? (
          <div>
            <p className="text-xs font-semibold">Fields</p>
            <p className="text-xs text-muted-foreground">{fields.join(", ")}</p>
          </div>
        ) : null}
      </TooltipContent>
    </Tooltip>
  );
};

const InfoItem = ({ label, value }: { label: string; value: ReactNode }) => (
  <div className="rounded-lg border bg-muted/40 p-4">
    <p className="text-xs font-medium uppercase text-muted-foreground">{label}</p>
    <div className="mt-2 text-sm leading-tight text-foreground">{value}</div>
  </div>
);

function computeNormalizedRoles(
  source: typeof permissions,
  filterMap: Record<string, string>
): NormalizedRole[] {
  const roleEntries = Object.entries(source.roles ?? {});

  return roleEntries
    .map<NormalizedRole>(([roleKey, roleDefinition]) => {
      const definition = roleDefinition as Record<string, unknown>;
      const defaultDefinition = (definition.default as Record<string, unknown>) ?? {};

      const defaultRead = Object.prototype.hasOwnProperty.call(defaultDefinition, "read")
        ? normalizeActionGrant((defaultDefinition as Record<string, unknown>).read, filterMap)
        : undefined;
      const defaultAction = Object.prototype.hasOwnProperty.call(defaultDefinition, "action")
        ? normalizeActionGrant((defaultDefinition as Record<string, unknown>).action, filterMap)
        : undefined;

      const filterPaths = new Map<string, NormalizedFilter>();

      if (defaultRead?.filter) {
        filterPaths.set(defaultRead.filter, { path: defaultRead.filter, content: defaultRead.filterContent });
      }
      if (defaultAction?.filter) {
        filterPaths.set(defaultAction.filter, { path: defaultAction.filter, content: defaultAction.filterContent });
      }

      const modelsDefinition = (definition.models as Record<string, any>) ?? {};

      const models: NormalizedModelGrant[] = Object.entries(modelsDefinition).map(([modelName, modelDefinition]) => {
        const readGrant = Object.prototype.hasOwnProperty.call(modelDefinition, "read")
          ? normalizeActionGrant(modelDefinition.read, filterMap)
          : undefined;

        if (readGrant?.filter) {
          filterPaths.set(readGrant.filter, { path: readGrant.filter, content: readGrant.filterContent });
        }

        const actionsDefinition = (modelDefinition.actions as Record<string, unknown>) ?? {};

        const actions = Object.entries(actionsDefinition).reduce<Record<string, NormalizedActionGrant>>(
          (acc, [actionName, actionValue]) => {
            const normalized = normalizeActionGrant(actionValue, filterMap);
            if (normalized.filter) {
              filterPaths.set(normalized.filter, {
                path: normalized.filter,
                content: normalized.filterContent,
              });
            }
            acc[actionName] = normalized;
            return acc;
          },
          {}
        );

        return {
          name: modelName,
          read: readGrant,
          actions,
        };
      });

      models.sort((a, b) => a.name.localeCompare(b.name));

      const actionKeys = Array.from(new Set(models.flatMap((model) => Object.keys(model.actions)))).sort();

      const filters = Array.from(filterPaths.values()).sort((a, b) => a.path.localeCompare(b.path));

      return {
        key: roleKey,
        label: (definition.label as string) ?? humanizeRoleKey(roleKey),
        storageKey: definition.storageKey as string | undefined,
        defaultPrivileges: {
          read: defaultRead,
          action: defaultAction,
        },
        models,
        actionKeys,
        filters,
      };
    })
    .sort((a, b) => a.label.localeCompare(b.label));
}

function normalizeActionGrant(value: unknown, filterMap: Record<string, string>): NormalizedActionGrant {
  if (value === false || value === null || value === undefined) {
    return {
      allowed: false,
      raw: value,
    };
  }

  if (value === true) {
    return {
      allowed: true,
      raw: value,
    };
  }

  if (typeof value === "object") {
    const raw = value as Record<string, unknown>;
    const filter = typeof raw.filter === "string" ? raw.filter : undefined;
    const fields = Array.isArray(raw.fields) ? (raw.fields.filter((item): item is string => typeof item === "string")) : undefined;
    const allow = typeof raw.allow === "boolean" ? raw.allow : true;

    return {
      allowed: allow,
      filter,
      filterContent: filter ? filterMap[filter] : undefined,
      fields,
      raw,
    };
  }

  return {
    allowed: Boolean(value),
    raw: value,
  };
}

function normalizeFilterKey(path: string): string {
  const marker = "accessControl/";
  const markerIndex = path.lastIndexOf(marker);
  if (markerIndex >= 0) {
    return path.slice(markerIndex);
  }
  return path.replace(/^\.?\/?/, "");
}

function humanizeRoleKey(value: string): string {
  return value
    .split(/[._-]/)
    .filter(Boolean)
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
    .join(" ");
}

function formatIdentifier(value: string): string {
  return humanizeRoleKey(value.replace(/([a-z0-9])([A-Z])/g, "$1-$2"));
}
