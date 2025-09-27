import { describe, expect, it } from "vitest";
import {
  applyTenantAssignment,
  slugifyOrganization,
  type Organization,
  type TenantCandidate,
  type TenantRole,
} from "../../web/routes/_app.admin.orgs.tenancy";

const baseRoles: TenantRole[] = [
  {
    id: "role-vendor-admin",
    key: "vendor-admin",
    label: "Vendor Administrator",
    tenantType: "vendor",
    default: true,
  },
  {
    id: "role-seller-admin",
    key: "seller-admin",
    label: "Seller Administrator",
    tenantType: "seller",
    default: true,
  },
];

const createBaseOrganization = (): Organization => ({
  id: "org-1",
  name: "MerchX HQ",
  slug: "merchx-hq",
  status: "active",
  createdAt: "2024-01-01T00:00:00.000Z",
  memberships: [],
  workspaces: [
    {
      id: "ws-1",
      label: "Production",
      environment: "prod",
      onboarding: {
        updatedAt: "2024-01-01T00:00:00.000Z",
        steps: [
          { id: "step-1", label: "Provisioned", complete: true },
          { id: "step-2", label: "Invite team", complete: false },
        ],
      },
    },
  ],
  tenants: [],
});

describe("slugifyOrganization", () => {
  it("normalizes whitespace and punctuation", () => {
    expect(slugifyOrganization("  MerchX HQ  ")).toBe("merchx-hq");
    expect(slugifyOrganization("MerchX HQ 2024!")).toBe("merchx-hq-2024");
    expect(slugifyOrganization("Multi   Word___Value")).toBe("multi-word-value");
  });
});

describe("applyTenantAssignment", () => {
  it("creates tenant assignment and pending membership for new contact", () => {
    const organizations = [createBaseOrganization()];
    const tenant: TenantCandidate = {
      id: "vendor-1",
      name: "BrightPrint Studios",
      type: "vendor",
      contact: "Ops@BrightPrint.io",
    };

    const result = applyTenantAssignment({
      organizations,
      assignment: {
        organizationId: "org-1",
        tenant,
        role: baseRoles[0],
        workspaceId: "ws-1",
      },
      timestamp: "2024-05-01T00:00:00.000Z",
      createMembershipId: () => "membership-123",
    });

    expect(organizations[0].tenants).toHaveLength(0);
    const updatedOrg = result.organizations.find((org) => org.id === "org-1");
    expect(updatedOrg?.tenants).toHaveLength(1);
    expect(updatedOrg?.tenants[0]).toMatchObject({
      id: "vendor-1",
      workspaceId: "ws-1",
      roleId: "role-vendor-admin",
      type: "vendor",
    });

    expect(updatedOrg?.memberships).toHaveLength(1);
    expect(updatedOrg?.memberships[0]).toMatchObject({
      id: "membership-123",
      email: "ops@brightprint.io",
      status: "pending",
      tenantType: "vendor",
    });
  });

  it("avoids duplicating memberships for existing contacts", () => {
    const organizations = [createBaseOrganization()];
    organizations[0].memberships.push({
      id: "membership-existing",
      email: "ops@brightprint.io",
      status: "pending",
      roleId: "role-vendor-admin",
      tenantType: "vendor",
      invitedAt: "2024-04-01T00:00:00.000Z",
    });

    const tenant: TenantCandidate = {
      id: "vendor-2",
      name: "FineInk Printworks",
      type: "vendor",
      contact: "ops@brightprint.io",
    };

    const result = applyTenantAssignment({
      organizations,
      assignment: {
        organizationId: "org-1",
        tenant,
        role: baseRoles[0],
        workspaceId: "ws-1",
      },
      timestamp: "2024-05-01T00:00:00.000Z",
      createMembershipId: () => "membership-ignored",
    });

    const updatedOrg = result.organizations.find((org) => org.id === "org-1");
    expect(updatedOrg?.tenants).toHaveLength(1);
    expect(updatedOrg?.memberships).toHaveLength(1);
    expect(updatedOrg?.memberships[0].id).toBe("membership-existing");
  });
});
