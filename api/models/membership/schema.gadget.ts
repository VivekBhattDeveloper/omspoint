import type { GadgetModel } from "gadget-server";

// This file describes the schema for the "membership" model, go to https://omspoint.gadget.app/edit to view/edit your model in Gadget
// For more information on how to update this file http://docs.gadget.dev

export const schema: GadgetModel = {
  type: "gadget/model-schema/v1",
  storageKey: "membership",
  comment:
    "Connects a user to an organization with tenant-specific role assignments.",
  fields: {
    acceptedAt: {
      type: "dateTime",
      includeTime: true,
      storageKey: "membershipAcceptedAt",
    },
    email: {
      type: "email",
      validations: { required: true },
      storageKey: "membershipEmail",
    },
    invitedAt: {
      type: "dateTime",
      includeTime: true,
      storageKey: "membershipInvitedAt",
    },
    invitedBy: {
      type: "belongsTo",
      parent: { model: "user" },
      storageKey: "membershipInvitedBy",
    },
    organization: {
      type: "belongsTo",
      validations: { required: true },
      parent: { model: "organization" },
      storageKey: "membershipOrganization",
    },
    roles: { type: "json", storageKey: "membershipRoles" },
    status: {
      type: "enum",
      acceptMultipleSelections: false,
      acceptUnlistedOptions: false,
      options: ["pending", "active", "revoked"],
      validations: { required: true },
      storageKey: "membershipStatus",
    },
    tenantRole: {
      type: "belongsTo",
      parent: { model: "tenantRole" },
      storageKey: "membershipTenantRole",
    },
    tenantType: {
      type: "enum",
      acceptMultipleSelections: false,
      acceptUnlistedOptions: false,
      options: ["vendor", "seller"],
      storageKey: "membershipTenantType",
    },
    user: {
      type: "belongsTo",
      validations: { required: true },
      parent: { model: "user" },
      storageKey: "membershipUser",
    },
  },
};
