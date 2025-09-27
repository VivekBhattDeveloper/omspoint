import { useEffect, useRef, useState } from "react";
import { api } from "../api";

export type TenantType = "vendor" | "seller";
export type OrganizationStatus = "active" | "suspended" | "archived";
export type Environment = "prod" | "staging" | "dev";

export type TenantRole = {
  id: string;
  key: string;
  label: string;
  description?: string;
  tenantType: TenantType;
  default: boolean;
};

export type TenantCandidate = {
  id: string;
  name: string;
  type: TenantType;
  contact?: string;
};

export type OnboardingStep = {
  id: string;
  label: string;
  complete: boolean;
};

export type Workspace = {
  id: string;
  label: string;
  environment: Environment;
  onboarding: {
    steps: OnboardingStep[];
    updatedAt: string;
  };
};

export type MembershipStatus = "pending" | "active" | "revoked";

export type Membership = {
  id: string;
  email: string;
  name?: string;
  status: MembershipStatus;
  roleId: string;
  tenantType: TenantType;
  invitedAt: string;
};

export type TenantAssignment = {
  id: string;
  name: string;
  type: TenantType;
  roleId: string;
  workspaceId: string;
  assignedAt: string;
};

export type Organization = {
  id: string;
  name: string;
  slug: string;
  status: OrganizationStatus;
  createdAt: string;
  memberships: Membership[];
  workspaces: Workspace[];
  tenants: TenantAssignment[];
};

type SnapshotSource = "placeholder" | "remote";

type SnapshotStatus = "loading" | "ready" | "error";

export type TenancySnapshot = {
  organizations: Organization[];
  tenantRoles: TenantRole[];
  availableTenants: TenantCandidate[];
  status: SnapshotStatus;
  source: SnapshotSource;
  version: number;
  error?: Error;
};

type TenancyCapableClient = typeof api & {
  organization?: {
    findMany: (options?: Record<string, unknown>) => Promise<any[]>;
  };
  tenantRole?: {
    findMany: (options?: Record<string, unknown>) => Promise<any[]>;
  };
  vendor?: {
    findMany: (options?: Record<string, unknown>) => Promise<any[]>;
  };
  seller?: {
    findMany: (options?: Record<string, unknown>) => Promise<any[]>;
  };
};

const tenancyApi = api as TenancyCapableClient;

const slugStripper = /[^a-z0-9]+/g;
const slugTrimmer = /(^-|-$)/g;

export const slugifyOrganization = (value: string): string =>
  value
    .toLowerCase()
    .trim()
    .replace(slugStripper, "-")
    .replace(slugTrimmer, "");

const deriveTenantTypeFromRoleKey = (key: string): TenantType =>
  key.startsWith("seller") || key.includes("seller") ? "seller" : "vendor";

const normalizeTenantRoles = (records: any[]): TenantRole[] =>
  records
    .map((record) => {
      const key = String(record?.key ?? "");
      const label = String(record?.label ?? key);
      const id = String(record?.id ?? key);
      return {
        id,
        key,
        label,
        description: record?.description ? String(record.description) : undefined,
        tenantType: deriveTenantTypeFromRoleKey(key),
        default: Boolean(record?.default),
      } satisfies TenantRole;
    })
    .filter((role) => role.id);

const pluckNodes = <T,>(collection: any): T[] => {
  if (!collection) {
    return [];
  }
  if (Array.isArray(collection)) {
    return collection as T[];
  }
  if (Array.isArray(collection?.edges)) {
    return collection.edges
      .map((edge: any) => edge?.node ?? edge)
      .filter(Boolean) as T[];
  }
  if (Array.isArray(collection?.items)) {
    return collection.items as T[];
  }
  return [];
};

const guardString = (value: any, fallback = ""): string => {
  if (typeof value === "string") {
    return value;
  }
  if (typeof value === "number" || typeof value === "boolean") {
    return String(value);
  }
  return fallback;
};

const pickRoleId = (record: any): string => {
  if (typeof record?.roleId === "string" && record.roleId) {
    return record.roleId;
  }

  if (Array.isArray(record?.roles)) {
    const candidate = record.roles
      .map((role: any) => {
        if (typeof role === "string") {
          return role;
        }
        if (role && typeof role === "object") {
          if (typeof role.id === "string" && role.id) {
            return role.id;
          }
          if (typeof role.key === "string" && role.key) {
            return role.key;
          }
        }
        return "";
      })
      .find((value: string) => Boolean(value));

    if (candidate) {
      return candidate;
    }
  }

  if (typeof record?.tenantRoleId === "string" && record.tenantRoleId) {
    return record.tenantRoleId;
  }

  return "";
};

const normalizeMemberships = (
  memberships: any[],
  roleById: Map<string, TenantRole>,
  roleByKey: Map<string, TenantRole>,
  timestampFallback: string
): Membership[] =>
  memberships
    .map((record) => {
      const email = guardString(record?.email ?? record?.user?.email ?? "").toLowerCase();
      if (!email) {
        return undefined;
      }

      const roleId = pickRoleId(record);
      const role = roleById.get(roleId) ?? roleByKey.get(roleId);
      const tenantType = role?.tenantType ?? deriveTenantTypeFromRoleKey(role?.key ?? "");

      const invitedAt = guardString(record?.invitedAt ?? record?.createdAt ?? timestampFallback, timestampFallback);

      const nameParts: string[] = [];
      const firstName = guardString(record?.user?.firstName ?? record?.firstName ?? "").trim();
      const lastName = guardString(record?.user?.lastName ?? record?.lastName ?? "").trim();
      if (firstName) {
        nameParts.push(firstName);
      }
      if (lastName) {
        nameParts.push(lastName);
      }

      return {
        id: guardString(record?.id ?? `${email}-${invitedAt}`, `${email}-${invitedAt}`),
        email,
        name: nameParts.length > 0 ? nameParts.join(" ") : undefined,
        status: (record?.status ?? "pending") as MembershipStatus,
        roleId,
        tenantType,
        invitedAt,
      } satisfies Membership;
    })
    .filter(Boolean) as Membership[];

const normalizeWorkspaces = (workspaces: any[], timestampFallback: string): Workspace[] =>
  workspaces.map((workspace, index): Workspace => {
    const id = guardString(workspace?.id ?? `workspace-${index}`);
    const label = guardString(workspace?.label ?? workspace?.name ?? `Workspace ${index + 1}`);
    const environment = (guardString(workspace?.environment ?? "prod") as Environment) ?? "prod";

    const onboardingStepsRaw = pluckNodes<any>(workspace?.onboarding?.steps ?? workspace?.onboardingSteps);
    const onboardingSteps: OnboardingStep[] = onboardingStepsRaw.map((step, stepIndex) => ({
      id: guardString(step?.id ?? `${id}-step-${stepIndex}`),
      label: guardString(step?.label ?? `Step ${stepIndex + 1}`),
      complete: Boolean(step?.complete ?? step?.completed ?? step?.completedAt),
    }));

    return {
      id,
      label,
      environment,
      onboarding: {
        steps: onboardingSteps,
        updatedAt: guardString(workspace?.updatedAt ?? workspace?.onboarding?.updatedAt ?? timestampFallback, timestampFallback),
      },
    } satisfies Workspace;
  });

const normalizeOrganizations = (
  records: any[],
  tenantRoles: TenantRole[],
  timestampFallback: string
): Organization[] => {
  const roleById = new Map(tenantRoles.map((role) => [role.id, role]));
  const roleByKey = new Map(tenantRoles.map((role) => [role.key, role]));

  return records.map((record, index) => {
    const membershipsRaw = pluckNodes<any>(record?.memberships);
    const workspacesRaw = pluckNodes<any>(record?.workspaces);

    const normalizedMemberships = normalizeMemberships(membershipsRaw, roleById, roleByKey, timestampFallback);
    const normalizedWorkspaces = normalizeWorkspaces(workspacesRaw, timestampFallback);

    return {
      id: guardString(record?.id ?? `org-${index}`),
      name: guardString(record?.name ?? `Organization ${index + 1}`),
      slug: guardString(record?.slug ?? slugifyOrganization(guardString(record?.name ?? `organization-${index + 1}`))),
      status: (guardString(record?.status ?? "active") as OrganizationStatus) ?? "active",
      createdAt: guardString(record?.createdAt ?? timestampFallback, timestampFallback),
      memberships: normalizedMemberships,
      workspaces: normalizedWorkspaces,
      tenants: [],
    } satisfies Organization;
  });
};

const createTenantCandidatesFromVendors = (records: any[]): TenantCandidate[] =>
  records
    .map((record) => {
      const id = guardString(record?.id);
      const name = guardString(record?.name ?? record?.company ?? "").trim();
      if (!id || !name) {
        return undefined;
      }
      const contact = guardString(record?.email ?? record?.contactEmail ?? "").toLowerCase();
      return {
        id,
        name,
        type: "vendor" as TenantType,
        contact: contact || undefined,
      } satisfies TenantCandidate;
    })
    .filter(Boolean) as TenantCandidate[];

const createTenantCandidatesFromSellers = (records: any[]): TenantCandidate[] =>
  records
    .map((record) => {
      const id = guardString(record?.id);
      const name = guardString(record?.name ?? record?.displayName ?? "").trim();
      if (!id || !name) {
        return undefined;
      }
      const contact = guardString(record?.email ?? record?.contactEmail ?? "").toLowerCase();
      return {
        id,
        name,
        type: "seller" as TenantType,
        contact: contact || undefined,
      } satisfies TenantCandidate;
    })
    .filter(Boolean) as TenantCandidate[];

const safeFindMany = async (manager: any, options: Record<string, unknown>): Promise<{ data: any[]; error?: Error }> => {
  if (!manager || typeof manager.findMany !== "function") {
    return { data: [] };
  }
  try {
    const data = await manager.findMany(options);
    return { data: Array.isArray(data) ? data : [] };
  } catch (rawError) {
    const error = rawError instanceof Error ? rawError : new Error("Failed to fetch records");
    return { data: [], error };
  }
};

export const placeholderTenantRoles: TenantRole[] = [
  {
    id: "role-vendor-admin",
    key: "vendor-admin",
    label: "Vendor Administrator",
    description: "Full access to vendor production and finance modules.",
    tenantType: "vendor",
    default: true,
  },
  {
    id: "role-vendor-ops",
    key: "vendor-ops",
    label: "Production Supervisor",
    description: "Manage print jobs, QA, and routing rules for vendor workspaces.",
    tenantType: "vendor",
    default: false,
  },
  {
    id: "role-seller-admin",
    key: "seller-admin",
    label: "Seller Administrator",
    description: "Configure channels, listings, and settlements for the seller.",
    tenantType: "seller",
    default: true,
  },
  {
    id: "role-seller-ops",
    key: "seller-ops",
    label: "Seller Operations",
    description: "Manage catalog imports, orders, and customer escalations.",
    tenantType: "seller",
    default: false,
  },
];

export const placeholderTenantPool: TenantCandidate[] = [
  {
    id: "tenant-vendor-brightprint",
    name: "BrightPrint Studios",
    type: "vendor",
    contact: "ops@brightprint.io",
  },
  {
    id: "tenant-seller-urbanfit",
    name: "UrbanFit Marketplace",
    type: "seller",
    contact: "merch@urbanfit.shop",
  },
  {
    id: "tenant-seller-retrothreads",
    name: "Retro Threads Co",
    type: "seller",
    contact: "hello@retrothreads.store",
  },
  {
    id: "tenant-vendor-fineink",
    name: "FineInk Printworks",
    type: "vendor",
    contact: "success@fineink.print",
  },
];

export const placeholderOrganizations: Organization[] = [
  {
    id: "org-merchx",
    name: "MerchX HQ",
    slug: "merchx-hq",
    status: "active",
    createdAt: "2024-04-18T08:30:00.000Z",
    memberships: [
      {
        id: "mem-amy",
        email: "amy@merchx.io",
        name: "Amy Chen",
        status: "active",
        roleId: "role-vendor-admin",
        tenantType: "vendor",
        invitedAt: "2024-04-12T07:15:00.000Z",
      },
      {
        id: "mem-jordan",
        email: "jordan@merchx.io",
        name: "Jordan Patel",
        status: "pending",
        roleId: "role-seller-admin",
        tenantType: "seller",
        invitedAt: "2024-05-02T12:05:00.000Z",
      },
    ],
    workspaces: [
      {
        id: "ws-merchx-prod",
        label: "HQ – Production",
        environment: "prod",
        onboarding: {
          updatedAt: "2024-05-18T10:05:00.000Z",
          steps: [
            { id: "kyc", label: "Vendor KYC completed", complete: true },
            { id: "workspace", label: "Production workspace provisioned", complete: true },
            { id: "assign-tenants", label: "Assign vendor tenants", complete: true },
            { id: "invite-team", label: "Invite seller operations", complete: false },
            { id: "finance", label: "Connect payouts banking", complete: false },
          ],
        },
      },
      {
        id: "ws-merchx-sbx",
        label: "HQ – Sandbox",
        environment: "staging",
        onboarding: {
          updatedAt: "2024-05-14T09:00:00.000Z",
          steps: [
            { id: "workspace", label: "Sandbox workspace created", complete: true },
            { id: "seed-data", label: "Seed sample catalog", complete: true },
            { id: "invite", label: "Invite vendor supervisor", complete: false },
            { id: "webhooks", label: "Configure webhook destinations", complete: false },
          ],
        },
      },
    ],
    tenants: [
      {
        id: "tenant-merchx-factory",
        name: "MerchX Print Factory",
        type: "vendor",
        roleId: "role-vendor-admin",
        workspaceId: "ws-merchx-prod",
        assignedAt: "2024-04-20T11:15:00.000Z",
      },
    ],
  },
  {
    id: "org-printops",
    name: "Print Ops Collective",
    slug: "print-ops",
    status: "suspended",
    createdAt: "2024-03-02T14:10:00.000Z",
    memberships: [
      {
        id: "mem-lila",
        email: "lila@printops.io",
        name: "Lila Gomez",
        status: "active",
        roleId: "role-vendor-ops",
        tenantType: "vendor",
        invitedAt: "2024-03-04T09:05:00.000Z",
      },
      {
        id: "mem-ray",
        email: "ray@sellerpartners.com",
        name: "Ray Shelton",
        status: "pending",
        roleId: "role-seller-ops",
        tenantType: "seller",
        invitedAt: "2024-05-05T18:25:00.000Z",
      },
    ],
    workspaces: [
      {
        id: "ws-printops-fulfillment",
        label: "Fulfillment",
        environment: "prod",
        onboarding: {
          updatedAt: "2024-05-11T16:30:00.000Z",
          steps: [
            { id: "kyc", label: "Legal & KYC approved", complete: true },
            { id: "printer", label: "Register primary printers", complete: true },
            { id: "sla", label: "Confirm SLA templates", complete: false },
            { id: "finance", label: "Submit payout banking", complete: false },
          ],
        },
      },
    ],
    tenants: [
      {
        id: "tenant-printops-main",
        name: "Print Ops Main Vendor",
        type: "vendor",
        roleId: "role-vendor-ops",
        workspaceId: "ws-printops-fulfillment",
        assignedAt: "2024-03-04T09:45:00.000Z",
      },
    ],
  },
];

export const fallbackTenancySnapshot: TenancySnapshot = {
  organizations: placeholderOrganizations,
  tenantRoles: placeholderTenantRoles,
  availableTenants: placeholderTenantPool,
  status: "ready",
  source: "placeholder",
  version: 0,
};

const buildRemoteSnapshot = async (): Promise<{
  organizations: Organization[];
  tenantRoles: TenantRole[];
  availableTenants: TenantCandidate[];
  error?: Error;
}> => {
  const timestampFallback = new Date().toISOString();

  const [{ data: organizationRecords, error: organizationError }, { data: tenantRoleRecords, error: tenantRoleError }, { data: vendorRecords }, { data: sellerRecords }] = await Promise.all([
    safeFindMany(tenancyApi.organization, {
      select: {
        id: true,
        name: true,
        slug: true,
        status: true,
        createdAt: true,
        memberships: {
          select: {
            id: true,
            email: true,
            status: true,
            invitedAt: true,
            roles: true,
            user: {
              select: {
                firstName: true,
                lastName: true,
              },
            },
          },
        },
        workspaces: {
          select: {
            id: true,
            label: true,
            environment: true,
            updatedAt: true,
            onboarding: {
              select: {
                updatedAt: true,
                steps: {
                  select: {
                    id: true,
                    label: true,
                    complete: true,
                    completed: true,
                    completedAt: true,
                  },
                },
              },
            },
          },
        },
      },
    }),
    safeFindMany(tenancyApi.tenantRole, {
      select: {
        id: true,
        key: true,
        label: true,
        description: true,
        default: true,
      },
    }),
    safeFindMany(tenancyApi.vendor, {
      select: {
        id: true,
        name: true,
        email: true,
      },
    }),
    safeFindMany(tenancyApi.seller, {
      select: {
        id: true,
        name: true,
        email: true,
      },
    }),
  ]);

  const tenantRoles = tenantRoleRecords.length > 0 ? normalizeTenantRoles(tenantRoleRecords) : placeholderTenantRoles;
  const organizations = organizationRecords.length > 0
    ? normalizeOrganizations(organizationRecords, tenantRoles, timestampFallback)
    : placeholderOrganizations;

  const vendorCandidates = createTenantCandidatesFromVendors(vendorRecords);
  const sellerCandidates = createTenantCandidatesFromSellers(sellerRecords);
  const availableTenants = [...vendorCandidates, ...sellerCandidates];

  const error = organizationError ?? tenantRoleError;

  return {
    organizations,
    tenantRoles,
    availableTenants: availableTenants.length > 0 ? availableTenants : placeholderTenantPool,
    error,
  };
};

export const useTenancySnapshot = (): TenancySnapshot => {
  const [snapshot, setSnapshot] = useState<TenancySnapshot>({
    ...fallbackTenancySnapshot,
    status: "loading",
  });
  const hasHydratedRef = useRef(false);

  useEffect(() => {
    let cancelled = false;

    const hydrate = async () => {
      if (!tenancyApi.organization?.findMany || hasHydratedRef.current) {
        setSnapshot((current) => ({
          ...current,
          status: "ready",
        }));
        return;
      }

      const { organizations, tenantRoles, availableTenants, error } = await buildRemoteSnapshot();
      if (cancelled) {
        return;
      }

      setSnapshot({
        organizations,
        tenantRoles,
        availableTenants,
        status: error ? "error" : "ready",
        source: "remote",
        version: Date.now(),
        error,
      });
      hasHydratedRef.current = true;
    };

    void hydrate();

    return () => {
      cancelled = true;
    };
  }, []);

  return snapshot;
};

export const getWorkspaceProgress = (workspace: Workspace): number => {
  const total = workspace.onboarding.steps.length || 1;
  const completed = workspace.onboarding.steps.filter((step) => step.complete).length;
  return Math.round((completed / total) * 100);
};

export const getNextIncompleteStep = (workspace: Workspace): OnboardingStep | undefined =>
  workspace.onboarding.steps.find((step) => !step.complete);

export const summarizeOrganizationOnboarding = (organization: Organization): { progress: number; nextStep?: string } => {
  if (organization.workspaces.length === 0) {
    return { progress: 0, nextStep: undefined };
  }

  const workspaceEntries = organization.workspaces.map((workspace) => ({
    progress: getWorkspaceProgress(workspace),
    nextStep: getNextIncompleteStep(workspace)?.label,
  }));

  const averageProgress = Math.round(
    workspaceEntries.reduce((total, entry) => total + entry.progress, 0) / workspaceEntries.length
  );

  const lowestProgress = [...workspaceEntries].sort((a, b) => a.progress - b.progress)[0];

  return {
    progress: averageProgress,
    nextStep: lowestProgress?.nextStep,
  };
};

export const resolveDefaultRoleId = (type: TenantType, roles: TenantRole[]): string => {
  const defaults = roles.filter((role) => role.tenantType === type && role.default);
  if (defaults.length > 0) {
    return defaults[0].id;
  }
  const roleForType = roles.find((role) => role.tenantType === type);
  if (roleForType) {
    return roleForType.id;
  }
  const heuristic = roles.find((role) =>
    type === "vendor" ? role.key.includes("vendor") : role.key.includes("seller")
  );
  return heuristic?.id ?? roles[0]?.id ?? "";
};

export const applyTenantAssignment = ({
  organizations,
  assignment,
  timestamp,
  createMembershipId,
}: {
  organizations: Organization[];
  assignment: {
    organizationId: string;
    tenant: TenantCandidate;
    role: TenantRole;
    workspaceId: string;
  };
  timestamp: string;
  createMembershipId: () => string;
}): {
  organizations: Organization[];
  membership?: Membership;
  assignment: TenantAssignment;
} => {
  const { organizationId, tenant, role, workspaceId } = assignment;

  let membership: Membership | undefined;
  const assignmentRecord: TenantAssignment = {
    id: tenant.id,
    name: tenant.name,
    type: tenant.type,
    roleId: role.id,
    workspaceId,
    assignedAt: timestamp,
  };

  const updatedOrganizations = organizations.map((org) => {
    if (org.id !== organizationId) {
      return org;
    }

    const existingMembershipEmails = new Set(org.memberships.map((member) => member.email.toLowerCase()));

    let memberships = org.memberships;
    if (tenant.contact && !existingMembershipEmails.has(tenant.contact.toLowerCase())) {
      membership = {
        id: createMembershipId(),
        email: tenant.contact.toLowerCase(),
        status: "pending",
        roleId: role.id,
        tenantType: tenant.type,
        invitedAt: timestamp,
      } satisfies Membership;

      memberships = [...memberships, membership];
    }

    return {
      ...org,
      tenants: [...org.tenants, assignmentRecord],
      memberships,
    } satisfies Organization;
  });

  return {
    organizations: updatedOrganizations,
    membership,
    assignment: assignmentRecord,
  };
};
