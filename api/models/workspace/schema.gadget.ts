import type { GadgetModel } from "gadget-server";

// This file describes the schema for the "workspace" model, go to https://omspoint.gadget.app/edit to view/edit your model in Gadget
// For more information on how to update this file http://docs.gadget.dev

export const schema: GadgetModel = {
  type: "gadget/model-schema/v1",
  storageKey: "workspace",
  comment:
    "Workspace instance within an organization (prod, staging, etc).",
  fields: {
    domains: { type: "json", storageKey: "workspaceDomains" },
    environment: {
      type: "enum",
      acceptMultipleSelections: false,
      acceptUnlistedOptions: false,
      options: ["prod", "staging", "dev"],
      validations: { required: true },
      storageKey: "workspaceEnvironment",
    },
    label: {
      type: "string",
      validations: { required: true },
      storageKey: "workspaceLabel",
    },
    onboardingState: {
      type: "json",
      storageKey: "workspaceOnboardingState",
    },
    onboardingUpdatedAt: {
      type: "dateTime",
      includeTime: true,
      storageKey: "workspaceOnboardingUpdatedAt",
    },
    organization: {
      type: "belongsTo",
      validations: { required: true },
      parent: { model: "organization" },
      storageKey: "workspaceOrganization",
    },
  },
};
