import type { GadgetModel } from "gadget-server";

// This file describes the schema for the "tenantRole" model, go to https://omspoint.gadget.app/edit to view/edit your model in Gadget
// For more information on how to update this file http://docs.gadget.dev

export const schema: GadgetModel = {
  type: "gadget/model-schema/v1",
  storageKey: "tenantRole",
  comment:
    "Role definitions assignable within a tenant organization context.",
  fields: {
    default: {
      type: "boolean",
      default: false,
      validations: { required: true },
      storageKey: "tenantRoleDefault",
    },
    description: {
      type: "richText",
      storageKey: "tenantRoleDescription",
    },
    key: {
      type: "string",
      validations: { required: true },
      storageKey: "tenantRoleKey",
    },
    label: {
      type: "string",
      validations: { required: true },
      storageKey: "tenantRoleLabel",
    },
    memberships: {
      type: "hasMany",
      children: { model: "membership", belongsToField: "tenantRole" },
      storageKey: "tenantRoleMemberships",
    },
    scopes: { type: "json", storageKey: "tenantRoleScopes" },
    tenantType: {
      type: "enum",
      acceptMultipleSelections: false,
      acceptUnlistedOptions: false,
      options: ["vendor", "seller"],
      validations: { required: true },
      storageKey: "tenantRoleTenantType",
    },
  },
};
