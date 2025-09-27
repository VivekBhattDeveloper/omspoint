import { type FormEvent, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { PageHeader } from "@/components/app/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import {
  applyTenantAssignment,
  getNextIncompleteStep,
  getWorkspaceProgress,
  resolveDefaultRoleId,
  slugifyOrganization,
  summarizeOrganizationOnboarding,
  type Organization,
  type OrganizationStatus,
  type TenantCandidate,
  type TenantRole,
  type TenantType,
  useTenancySnapshot,
} from "./_app.admin.orgs.tenancy";

type AssignmentFormState = {
  organizationId: string;
  tenantType: TenantType;
  tenantId: string;
  workspaceId: string;
  roleId: string;
};

type InviteFormState = {
  organizationId: string;
  email: string;
  tenantType: TenantType;
  roleId: string;
};

const tenantTypeCopy: Record<TenantType, string> = {
  vendor: "Vendor",
  seller: "Seller",
};

const statusIntent: Record<string, string> = {
  active: "bg-emerald-100 text-emerald-700 border-emerald-200",
  suspended: "bg-amber-100 text-amber-700 border-amber-200",
  archived: "bg-slate-100 text-slate-600 border-slate-200",
};

const generateId = (prefix: string) => `${prefix}-${Math.random().toString(36).slice(2, 10)}`;

const buildAssignmentForm = (
  organizations: Organization[],
  roles: TenantRole[],
  tenants: TenantCandidate[]
): AssignmentFormState => {
  const organizationId = organizations[0]?.id ?? "";
  const tenantType = tenants[0]?.type ?? (roles.find((role) => role.tenantType === "vendor") ? "vendor" : "seller");
  const tenantId = tenants.find((tenant) => tenant.type === tenantType)?.id ?? tenants[0]?.id ?? "";
  const workspaceId = organizations[0]?.workspaces[0]?.id ?? "";
  const roleId = resolveDefaultRoleId(tenantType, roles);

  return {
    organizationId,
    tenantType,
    tenantId: tenantId ?? "",
    workspaceId,
    roleId,
  };
};

const buildInviteForm = (organizations: Organization[], roles: TenantRole[]): InviteFormState => {
  const organizationId = organizations[0]?.id ?? "";
  const preferredRole = roles.find((role) => role.default);
  const tenantType = preferredRole?.tenantType ?? roles[0]?.tenantType ?? "vendor";

  return {
    organizationId,
    email: "",
    tenantType,
    roleId: resolveDefaultRoleId(tenantType, roles),
  };
};

const equalAssignmentForm = (a: AssignmentFormState, b: AssignmentFormState) =>
  a.organizationId === b.organizationId &&
  a.tenantType === b.tenantType &&
  a.tenantId === b.tenantId &&
  a.workspaceId === b.workspaceId &&
  a.roleId === b.roleId;

const equalInviteForm = (a: InviteFormState, b: InviteFormState) =>
  a.organizationId === b.organizationId &&
  a.email === b.email &&
  a.tenantType === b.tenantType &&
  a.roleId === b.roleId;

export default function AdminOrganizationsPage() {
  const tenancySnapshot = useTenancySnapshot();
  const snapshotVersionRef = useRef(tenancySnapshot.version);

  const [tenantRoles, setTenantRoles] = useState<TenantRole[]>(tenancySnapshot.tenantRoles);
  const [organizations, setOrganizations] = useState<Organization[]>(tenancySnapshot.organizations);
  const [availableTenants, setAvailableTenants] = useState<TenantCandidate[]>(tenancySnapshot.availableTenants);

  const [createForm, setCreateForm] = useState({
    name: "",
    slug: "",
    status: "active" as OrganizationStatus,
  });
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(false);

  const [assignmentForm, setAssignmentForm] = useState<AssignmentFormState>(() =>
    buildAssignmentForm(tenancySnapshot.organizations, tenancySnapshot.tenantRoles, tenancySnapshot.availableTenants)
  );
  const [inviteForm, setInviteForm] = useState<InviteFormState>(() =>
    buildInviteForm(tenancySnapshot.organizations, tenancySnapshot.tenantRoles)
  );

  const getDefaultRoleIdForType = useCallback(
    (type: TenantType) => resolveDefaultRoleId(type, tenantRoles),
    [tenantRoles]
  );

  useEffect(() => {
    if (tenancySnapshot.source === "remote" && tenancySnapshot.version !== snapshotVersionRef.current) {
      setTenantRoles(tenancySnapshot.tenantRoles);
      setOrganizations(tenancySnapshot.organizations);
      setAvailableTenants(tenancySnapshot.availableTenants);
      setAssignmentForm((previous) => {
        const next = ensureAssignmentForm(previous, tenancySnapshot.organizations, tenancySnapshot.tenantRoles, tenancySnapshot.availableTenants);
        return equalAssignmentForm(previous, next) ? previous : next;
      });
      setInviteForm((previous) => {
        const next = ensureInviteForm(previous, tenancySnapshot.organizations, tenancySnapshot.tenantRoles);
        return equalInviteForm(previous, next) ? previous : next;
      });
      snapshotVersionRef.current = tenancySnapshot.version;
    }
  }, [tenancySnapshot]);

  useEffect(() => {
    setAssignmentForm((previous) => {
      const next = ensureAssignmentForm(previous, organizations, tenantRoles, availableTenants);
      return equalAssignmentForm(previous, next) ? previous : next;
    });
  }, [organizations, tenantRoles, availableTenants]);

  useEffect(() => {
    setInviteForm((previous) => {
      const next = ensureInviteForm(previous, organizations, tenantRoles);
      return equalInviteForm(previous, next) ? previous : next;
    });
  }, [organizations, tenantRoles]);

  const availableTenantsForType = useMemo(
    () => availableTenants.filter((tenant) => tenant.type === assignmentForm.tenantType),
    [availableTenants, assignmentForm.tenantType]
  );

  const availableRolesForAssignment = useMemo(
    () => tenantRoles.filter((role) => role.tenantType === assignmentForm.tenantType),
    [tenantRoles, assignmentForm.tenantType]
  );

  const availableRolesForInvite = useMemo(
    () => tenantRoles.filter((role) => role.tenantType === inviteForm.tenantType),
    [tenantRoles, inviteForm.tenantType]
  );

  const pendingInvites = useMemo(
    () =>
      organizations
        .flatMap((org) =>
          org.memberships
            .filter((membership) => membership.status === "pending")
            .map((membership) => ({
              orgId: org.id,
              orgName: org.name,
              membership,
            }))
        )
        .sort((a, b) => (a.membership.invitedAt < b.membership.invitedAt ? 1 : -1)),
    [organizations]
  );

  const workspaceProgress = useMemo(
    () =>
      organizations
        .flatMap((org) =>
          org.workspaces.map((workspace) => ({
            orgId: org.id,
            orgName: org.name,
            workspace,
            progress: getWorkspaceProgress(workspace),
            nextStep: getNextIncompleteStep(workspace),
          }))
        )
        .sort((a, b) => a.progress - b.progress),
    [organizations]
  );

  const tenantAssignments = useMemo(
    () =>
      organizations.flatMap((org) =>
        org.tenants.map((tenant) => ({
          orgId: org.id,
          orgName: org.name,
          tenant,
          workspace: org.workspaces.find((workspace) => workspace.id === tenant.workspaceId),
          role: tenantRoles.find((role) => role.id === tenant.roleId),
        }))
      ),
    [organizations, tenantRoles]
  );

  const handleCreateNameChange = useCallback((value: string) => {
    setCreateForm((current) => {
      const nextSlug = !slugManuallyEdited ? slugifyOrganization(value) : current.slug;
      return {
        ...current,
        name: value,
        slug: nextSlug,
      };
    });
  }, [slugManuallyEdited]);

  const handleCreateOrganization = useCallback(
    (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      const trimmedName = createForm.name.trim();
      const trimmedSlug = createForm.slug.trim();

      if (!trimmedName || !trimmedSlug) {
        toast.error("Organization name and slug are required.");
        return;
      }

      const organizationId = generateId("org");
      const workspaceId = generateId("ws");

      const defaultWorkspace = {
        id: workspaceId,
        label: `${trimmedName} Sandbox`,
        environment: "staging" as const,
        onboarding: {
          updatedAt: new Date().toISOString(),
          steps: [
            { id: "created", label: "Organization created", complete: true },
            { id: "workspace", label: "Workspace provisioned", complete: false },
            { id: "invite", label: "Invite first member", complete: false },
            { id: "assign", label: "Assign tenant roles", complete: false },
            { id: "finance", label: "Configure settlements", complete: false },
          ],
        },
      };

      const newOrganization: Organization = {
        id: organizationId,
        name: trimmedName,
        slug: trimmedSlug,
        status: createForm.status,
        createdAt: new Date().toISOString(),
        memberships: [],
        workspaces: [defaultWorkspace],
        tenants: [],
      };

      setOrganizations((current) => [...current, newOrganization]);
      setCreateForm({ name: "", slug: "", status: "active" });
      setSlugManuallyEdited(false);

      setAssignmentForm((previous) => {
        const tenantsForType = availableTenants.filter((tenant) => tenant.type === previous.tenantType);
        return {
          ...previous,
          organizationId,
          workspaceId,
          tenantId: tenantsForType[0]?.id ?? previous.tenantId ?? "",
        };
      });
      setInviteForm((previous) => ({
        ...previous,
        organizationId,
      }));

      toast.success(`Created ${trimmedName} with default sandbox workspace.`);
    },
    [availableTenants, createForm]
  );

  const resetCreateForm = useCallback(() => {
    setCreateForm({ name: "", slug: "", status: "active" });
    setSlugManuallyEdited(false);
  }, []);

  const handleAssignTenant = useCallback(() => {
    const org = organizations.find((item) => item.id === assignmentForm.organizationId);
    const tenant = availableTenants.find((candidate) => candidate.id === assignmentForm.tenantId);
    const role = tenantRoles.find((item) => item.id === assignmentForm.roleId);
    const workspace = org?.workspaces.find((item) => item.id === assignmentForm.workspaceId);

    if (!org || !tenant || !role || !workspace) {
      toast.error("Select an organization, tenant, workspace, and role first.");
      return;
    }

    const timestamp = new Date().toISOString();
    const { organizations: updatedOrganizations } = applyTenantAssignment({
      organizations,
      assignment: {
        organizationId: org.id,
        tenant,
        role,
        workspaceId: workspace.id,
      },
      timestamp,
      createMembershipId: () => generateId("membership"),
    });

    const remainingTenants = availableTenants.filter((candidate) => candidate.id !== tenant.id);

    setOrganizations(updatedOrganizations);
    setAvailableTenants(remainingTenants);
    setAssignmentForm((previous) => {
      const tenantsForType = remainingTenants.filter((candidate) => candidate.type === previous.tenantType);
      return {
        ...previous,
        tenantId: tenantsForType[0]?.id ?? "",
      };
    });

    toast.success(`Assigned ${tenant.name} to ${workspace.label} as ${role.label}.`);
  }, [assignmentForm, availableTenants, organizations, tenantRoles]);

  const handleInviteSubmission = useCallback(
    (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      const org = organizations.find((item) => item.id === inviteForm.organizationId);
      const role = tenantRoles.find((item) => item.id === inviteForm.roleId);
      const trimmedEmail = inviteForm.email.trim().toLowerCase();

      if (!org || !role || !trimmedEmail) {
        toast.error("Provide an email, organization, and role preset.");
        return;
      }

      const membership = {
        id: generateId("invite"),
        email: trimmedEmail,
        status: "pending" as const,
        roleId: role.id,
        tenantType: inviteForm.tenantType,
        invitedAt: new Date().toISOString(),
      };

      setOrganizations((current) =>
        current.map((item) => {
          if (item.id !== org.id) {
            return item;
          }

          const existingIndex = item.memberships.findIndex(
            (entry) => entry.email.toLowerCase() === trimmedEmail
          );

          if (existingIndex >= 0) {
            const updatedMemberships = [...item.memberships];
            updatedMemberships[existingIndex] = {
              ...updatedMemberships[existingIndex],
              ...membership,
            };
            return {
              ...item,
              memberships: updatedMemberships,
            };
          }

          return {
            ...item,
            memberships: [...item.memberships, membership],
          };
        })
      );

      setInviteForm((previous) => ({
        ...previous,
        email: "",
      }));

      toast.success(`Invite sent to ${trimmedEmail} with ${role.label} access.`);
    },
    [inviteForm, organizations, tenantRoles]
  );

  const assignmentDisabled =
    !assignmentForm.organizationId ||
    !assignmentForm.workspaceId ||
    !assignmentForm.tenantId ||
    !assignmentForm.roleId;

  const createDisabled = !createForm.name.trim() || !createForm.slug.trim();

  const inviteDisabled = !inviteForm.email.trim() || !inviteForm.organizationId || !inviteForm.roleId;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Organizations & Tenancy"
        description="Create and manage organizations, assign tenancy, and review associated workspaces."
      />

      <Card>
        <CardHeader>
          <CardTitle>Organization directory</CardTitle>
          <CardDescription>
            Connect this table to the Gadget `organization`, `membership`, and `workspace` models once they are available.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Organization</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Members</TableHead>
                <TableHead>Workspaces</TableHead>
                <TableHead>Onboarding</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {organizations.map((org) => {
                const memberCount = org.memberships.filter((member) => member.status !== "revoked").length;
                const onboardingSummary = summarizeOrganizationOnboarding(org);

                return (
                  <TableRow key={org.id}>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-medium">{org.name}</span>
                        <span className="text-xs text-muted-foreground">{org.slug}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={statusIntent[org.status] ?? ""}>
                        {org.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{memberCount}</TableCell>
                    <TableCell>
                      <ul className="text-xs text-muted-foreground space-y-1">
                        {org.workspaces.map((workspace) => (
                          <li key={workspace.id} className="flex items-center gap-2">
                            <span className="font-medium text-foreground">{workspace.label}</span>
                            <Badge variant="outline" className="uppercase text-[10px]">
                              {workspace.environment}
                            </Badge>
                          </li>
                        ))}
                      </ul>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-2">
                        <Progress value={onboardingSummary.progress} />
                        <span className="text-xs text-muted-foreground">
                          {onboardingSummary.nextStep
                            ? `Next: ${onboardingSummary.nextStep}`
                            : "Checklist complete"}
                        </span>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
          <p className="text-xs text-muted-foreground">
            {tenancySnapshot.source === "remote"
              ? "Live data loaded from Gadget tenancy models."
              : "Prototype data shown until Gadget tenancy models sync."}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Tenancy quick actions</CardTitle>
          <CardDescription>
            Enable quick assignment of vendor/seller tenants after the `membership` and `tenantRole` models are exposed.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-8">
          <div className="grid gap-6 lg:grid-cols-2">
            <form className="space-y-4 rounded-lg border p-4" onSubmit={handleCreateOrganization}>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="text-sm font-semibold">Create organization</h3>
                  <p className="text-xs text-muted-foreground">
                    Provision a new organization record with default status and sandbox workspace.
                  </p>
                </div>
                <Badge variant="outline" className="border-dashed">
                  Default: {createForm.status}
                </Badge>
              </div>
              <div className="space-y-3">
                <div className="space-y-1">
                  <Label htmlFor="org-name">Organization name</Label>
                  <Input
                    id="org-name"
                    value={createForm.name}
                    placeholder="Acme Collective"
                    onChange={(event) => handleCreateNameChange(event.target.value)}
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="org-slug">Slug</Label>
                  <Input
                    id="org-slug"
                    value={createForm.slug}
                    placeholder="acme-collective"
                    onChange={(event) => {
                      setCreateForm((current) => ({ ...current, slug: event.target.value }));
                      setSlugManuallyEdited(true);
                    }}
                  />
                  <p className="text-[11px] text-muted-foreground">Used for URLs and workspace identifiers.</p>
                </div>
                <div className="space-y-1">
                  <Label>Status</Label>
                  <Select
                    value={createForm.status}
                    onValueChange={(value) =>
                      setCreateForm((current) => ({ ...current, status: value as OrganizationStatus }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="suspended">Suspended</SelectItem>
                      <SelectItem value="archived">Archived</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex items-center justify-end gap-2">
                <Button type="button" variant="outline" onClick={resetCreateForm}>
                  Reset
                </Button>
                <Button type="submit" disabled={createDisabled}>
                  Create organization
                </Button>
              </div>
            </form>

            <div className="space-y-4 rounded-lg border p-4">
              <div>
                <h3 className="text-sm font-semibold">Quick tenant assignment</h3>
                <p className="text-xs text-muted-foreground">
                  Attach vendor or seller tenants to a workspace with the right role preset.
                </p>
              </div>
              <div className="space-y-3">
                <div className="space-y-1">
                  <Label>Organization</Label>
                  <Select
                    value={assignmentForm.organizationId}
                    onValueChange={(value) => {
                      const nextOrg = organizations.find((org) => org.id === value);
                      setAssignmentForm((previous) => ({
                        ...previous,
                        organizationId: value,
                        workspaceId: nextOrg?.workspaces[0]?.id ?? "",
                      }));
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select organization" />
                    </SelectTrigger>
                    <SelectContent>
                      {organizations.map((org) => (
                        <SelectItem key={org.id} value={org.id}>
                          {org.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="space-y-1">
                    <Label>Tenant type</Label>
                    <Select
                      value={assignmentForm.tenantType}
                      onValueChange={(value) => {
                        const type = value as TenantType;
                        const nextTenants = availableTenants.filter((tenant) => tenant.type === type);
                        setAssignmentForm((previous) => ({
                          ...previous,
                          tenantType: type,
                          tenantId: nextTenants[0]?.id ?? "",
                          roleId: getDefaultRoleIdForType(type),
                        }));
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select tenant type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="vendor">Vendor</SelectItem>
                        <SelectItem value="seller">Seller</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1">
                    <Label>Tenant</Label>
                    <Select
                      value={assignmentForm.tenantId}
                      onValueChange={(value) =>
                        setAssignmentForm((previous) => ({
                          ...previous,
                          tenantId: value,
                        }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={`Select ${tenantTypeCopy[assignmentForm.tenantType]} tenant`} />
                      </SelectTrigger>
                      <SelectContent>
                        {availableTenantsForType.length === 0 ? (
                          <SelectItem value="" disabled>
                            All {tenantTypeCopy[assignmentForm.tenantType]} tenants assigned
                          </SelectItem>
                        ) : (
                          availableTenantsForType.map((tenant) => (
                            <SelectItem key={tenant.id} value={tenant.id}>
                              {tenant.name}
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="space-y-1">
                    <Label>Workspace</Label>
                    <Select
                      value={assignmentForm.workspaceId}
                      onValueChange={(value) =>
                        setAssignmentForm((previous) => ({
                          ...previous,
                          workspaceId: value,
                        }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select workspace" />
                      </SelectTrigger>
                      <SelectContent>
                        {(organizations.find((org) => org.id === assignmentForm.organizationId)?.workspaces ?? []).map((workspace) => (
                          <SelectItem key={workspace.id} value={workspace.id}>
                            {workspace.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1">
                    <Label>Role preset</Label>
                    <Select
                      value={assignmentForm.roleId}
                      onValueChange={(value) =>
                        setAssignmentForm((previous) => ({
                          ...previous,
                          roleId: value,
                        }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select role" />
                      </SelectTrigger>
                      <SelectContent>
                        {availableRolesForAssignment.map((role) => (
                          <SelectItem key={role.id} value={role.id}>
                            {role.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
              <Button onClick={handleAssignTenant} disabled={assignmentDisabled} className="w-full">
                Assign tenant
              </Button>
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <form className="space-y-4 rounded-lg border p-4" onSubmit={handleInviteSubmission}>
              <div>
                <h3 className="text-sm font-semibold">Membership invite</h3>
                <p className="text-xs text-muted-foreground">
                  Send structured invites with tenant role presets for rapid onboarding.
                </p>
              </div>
              <div className="space-y-3">
                <div className="space-y-1">
                  <Label htmlFor="invite-email">Email</Label>
                  <Input
                    id="invite-email"
                    type="email"
                    value={inviteForm.email}
                    placeholder="team@partner.com"
                    onChange={(event) =>
                      setInviteForm((previous) => ({
                        ...previous,
                        email: event.target.value,
                      }))
                    }
                  />
                </div>
                <div className="space-y-1">
                  <Label>Organization</Label>
                  <Select
                    value={inviteForm.organizationId}
                    onValueChange={(value) =>
                      setInviteForm((previous) => ({
                        ...previous,
                        organizationId: value,
                      }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select organization" />
                    </SelectTrigger>
                    <SelectContent>
                      {organizations.map((org) => (
                        <SelectItem key={org.id} value={org.id}>
                          {org.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="space-y-1">
                    <Label>Tenant type</Label>
                    <Select
                      value={inviteForm.tenantType}
                      onValueChange={(value) => {
                        const type = value as TenantType;
                        setInviteForm((previous) => ({
                          ...previous,
                          tenantType: type,
                          roleId: resolveDefaultRoleId(type, tenantRoles),
                        }));
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select tenant type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="vendor">Vendor</SelectItem>
                        <SelectItem value="seller">Seller</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1">
                    <Label>Role preset</Label>
                    <Select
                      value={inviteForm.roleId}
                      onValueChange={(value) =>
                        setInviteForm((previous) => ({
                          ...previous,
                          roleId: value,
                        }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select role" />
                      </SelectTrigger>
                      <SelectContent>
                        {availableRolesForInvite.map((role) => (
                          <SelectItem key={role.id} value={role.id}>
                            {role.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
              <Button type="submit" disabled={inviteDisabled} className="w-full">
                Send invite
              </Button>

              {pendingInvites.length > 0 ? (
                <div className="rounded-md bg-muted/40 p-3 text-xs text-muted-foreground">
                  <span className="font-medium text-foreground">Pending invites:</span>
                  <ul className="mt-2 space-y-1">
                    {pendingInvites.slice(0, 4).map(({ membership }) => {
                      const role = tenantRoles.find((item) => item.id === membership.roleId);
                      return (
                        <li key={`${membership.id}`} className="flex items-center justify-between gap-2">
                          <span className="truncate">{membership.email}</span>
                          <span className="flex items-center gap-2 text-[11px] uppercase">
                            <Badge variant="outline">{tenantTypeCopy[membership.tenantType]}</Badge>
                            <span>{role?.label ?? "Role"}</span>
                          </span>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              ) : null}
            </form>

            <div className="space-y-4 rounded-lg border p-4">
              <div>
                <h3 className="text-sm font-semibold">Workspace onboarding</h3>
                <p className="text-xs text-muted-foreground">
                  Monitor launch progress per workspace across organizations.
                </p>
              </div>
              <div className="space-y-3">
                {workspaceProgress.length === 0 ? (
                  <p className="text-xs text-muted-foreground">No workspaces provisioned yet.</p>
                ) : (
                  workspaceProgress.slice(0, 5).map(({ orgId, orgName, workspace, progress, nextStep }) => (
                    <div key={`${orgId}-${workspace.id}`} className="rounded-md border bg-card p-3">
                      <div className="flex items-center justify-between text-sm font-medium">
                        <span>{workspace.label}</span>
                        <Badge variant="outline" className="uppercase text-[10px]">
                          {workspace.environment}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">{orgName}</p>
                      <div className="pt-2">
                        <Progress value={progress} />
                        <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
                          <span>{progress}% complete</span>
                          <span>{nextStep ? `Next: ${nextStep.label}` : "Checklist done"}</span>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          <div className="rounded-lg border p-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold">Assigned tenants overview</h3>
              <Badge variant="outline">{tenantAssignments.length}</Badge>
            </div>
            <p className="text-xs text-muted-foreground">
              Snapshot of vendor and seller tenants mapped to workspaces with their role context.
            </p>
            <div className="mt-3 grid gap-3 md:grid-cols-2">
              {tenantAssignments.length === 0 ? (
                <p className="text-xs text-muted-foreground">No tenants assigned yet.</p>
              ) : (
                tenantAssignments.slice(0, 6).map(({ orgId, orgName, tenant, workspace, role }) => (
                  <div key={`${orgId}-${tenant.id}`} className="rounded-md border bg-card p-3 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-sm">{tenant.name}</span>
                      <Badge variant="outline" className="uppercase text-[10px]">
                        {tenantTypeCopy[tenant.type]}
                      </Badge>
                    </div>
                    <p className="text-muted-foreground">{orgName}</p>
                    <div className="mt-2 flex flex-col gap-1">
                      <span className="text-muted-foreground">
                        Workspace: <span className="text-foreground">{workspace?.label ?? "--"}</span>
                      </span>
                      <span className="text-muted-foreground">
                        Role preset: <span className="text-foreground">{role?.label ?? "--"}</span>
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

const ensureAssignmentForm = (
  form: AssignmentFormState,
  organizations: Organization[],
  roles: TenantRole[],
  tenants: TenantCandidate[]
): AssignmentFormState => {
  let organizationId = form.organizationId;
  if (!organizations.some((org) => org.id === organizationId)) {
    organizationId = organizations[0]?.id ?? "";
  }

  const organization = organizations.find((org) => org.id === organizationId);

  let workspaceId = form.workspaceId;
  if (!organization?.workspaces.some((workspace) => workspace.id === workspaceId)) {
    workspaceId = organization?.workspaces[0]?.id ?? "";
  }

  let tenantType = form.tenantType;
  if (!tenants.some((tenant) => tenant.type === tenantType)) {
    tenantType = tenants[0]?.type ?? tenantType;
  }

  let tenantId = form.tenantId;
  const tenantsForType = tenants.filter((tenant) => tenant.type === tenantType);
  if (!tenantsForType.some((tenant) => tenant.id === tenantId)) {
    tenantId = tenantsForType[0]?.id ?? "";
  }

  let roleId = form.roleId;
  if (!roles.some((role) => role.id === roleId && role.tenantType === tenantType)) {
    roleId = resolveDefaultRoleId(tenantType, roles);
  }

  return {
    organizationId,
    tenantType,
    tenantId,
    workspaceId,
    roleId,
  };
};

const ensureInviteForm = (
  form: InviteFormState,
  organizations: Organization[],
  roles: TenantRole[]
): InviteFormState => {
  let organizationId = form.organizationId;
  if (!organizations.some((org) => org.id === organizationId)) {
    organizationId = organizations[0]?.id ?? "";
  }

  let tenantType = form.tenantType;
  if (!roles.some((role) => role.tenantType === tenantType)) {
    tenantType = roles[0]?.tenantType ?? tenantType;
  }

  let roleId = form.roleId;
  if (!roles.some((role) => role.id === roleId && role.tenantType === tenantType)) {
    roleId = resolveDefaultRoleId(tenantType, roles);
  }

  return {
    organizationId,
    email: form.email,
    tenantType,
    roleId,
  };
};
