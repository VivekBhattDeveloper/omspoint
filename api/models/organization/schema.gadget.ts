import type { GadgetModel } from "gadget-server";

// This file describes the schema for the "organization" model, go to https://omspoint.gadget.app/edit to view/edit your model in Gadget
// For more information on how to update this file http://docs.gadget.dev

export const schema: GadgetModel = {
  type: "gadget/model-schema/v1",
  storageKey: "organization",
  comment:
    "Tenant organization representing a seller or vendor entity.",
  fields: {
    memberships: {
      type: "hasMany",
      children: {
        model: "membership",
        belongsToField: "organization",
      },
      storageKey: "organizationMemberships",
    },
    name: {
      type: "string",
      validations: { required: true },
      storageKey: "organizationName",
    },
    notes: { type: "richText", storageKey: "organizationNotes" },
    slug: {
      type: "string",
      validations: { required: true },
      storageKey: "organizationSlug",
    },
    status: {
      type: "enum",
      default: "active",
      acceptMultipleSelections: false,
      acceptUnlistedOptions: false,
      options: ["active", "suspended", "archived"],
      validations: { required: true },
      storageKey: "organizationStatus",
    },
    workspaces: {
      type: "hasMany",
      children: {
        model: "workspace",
        belongsToField: "organization",
      },
      storageKey: "organizationWorkspaces",
    },
  },
};
