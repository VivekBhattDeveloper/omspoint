import type { GadgetModel } from "gadget-server";

// This file describes the schema for the "featureFlag" model, go to https://omspoint.gadget.app/edit to view/edit your model in Gadget
// For more information on how to update this file http://docs.gadget.dev

export const schema: GadgetModel = {
  type: "gadget/model-schema/v1",
  storageKey: "featureFlag",
  comment: "Feature flag configuration keyed by role access.",
  fields: {
    category: { type: "string", storageKey: "featureFlagCategory" },
    description: {
      type: "richText",
      storageKey: "featureFlagDescription",
    },
    enabledRoles: {
      type: "json",
      storageKey: "featureFlagEnabledRoles",
    },
    key: {
      type: "string",
      validations: { required: true },
      storageKey: "featureFlagKey",
    },
    label: {
      type: "string",
      validations: { required: true },
      storageKey: "featureFlagLabel",
    },
    status: {
      type: "enum",
      default: "active",
      acceptMultipleSelections: false,
      acceptUnlistedOptions: false,
      options: ["active", "inactive"],
      storageKey: "featureFlagStatus",
    },
  },
};
