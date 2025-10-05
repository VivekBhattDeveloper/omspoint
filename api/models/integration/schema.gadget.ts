import type { GadgetModel } from "gadget-server";

// This file describes the schema for the "integration" model, go to https://omspoint.gadget.app/edit to view/edit your model in Gadget
// For more information on how to update this file http://docs.gadget.dev

export const schema: GadgetModel = {
  type: "gadget/model-schema/v1",
  storageKey: "integration",
  comment: "Third-party integration registry entry.",
  fields: {
    integrationCredentials: {
      type: "hasMany",
      children: {
        model: "integrationCredential",
        belongsToField: "integration",
      },
      storageKey: "integrationCredentials",
    },
    label: {
      type: "string",
      validations: { required: true },
      storageKey: "integrationLabel",
    },
    lastSyncAt: {
      type: "dateTime",
      includeTime: true,
      storageKey: "integrationLastSyncAt",
    },
    metadata: { type: "json", storageKey: "integrationMetadata" },
    mode: {
      type: "enum",
      acceptMultipleSelections: false,
      acceptUnlistedOptions: false,
      options: ["live", "sandbox"],
      validations: { required: true },
      storageKey: "integrationMode",
    },
    notes: { type: "richText", storageKey: "integrationNotes" },
    provider: {
      type: "string",
      validations: { required: true },
      storageKey: "integrationProvider",
    },
    scopes: { type: "json", storageKey: "integrationScopes" },
    status: {
      type: "enum",
      acceptMultipleSelections: false,
      acceptUnlistedOptions: false,
      options: [
        "connected",
        "degraded",
        "requires_action",
        "disconnected",
      ],
      validations: { required: true },
      storageKey: "integrationStatus",
    },
    type: {
      type: "enum",
      acceptMultipleSelections: false,
      acceptUnlistedOptions: false,
      options: ["marketplace", "courier", "printer"],
      validations: { required: true },
      storageKey: "integrationType",
    },
    webhookEndpoints: {
      type: "hasMany",
      children: {
        model: "webhookEndpoint",
        belongsToField: "integration",
      },
      storageKey: "integrationWebhookEndpoints",
    },
  },
};
