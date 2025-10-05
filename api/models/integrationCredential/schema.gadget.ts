import type { GadgetModel } from "gadget-server";

// This file describes the schema for the "integrationCredential" model, go to https://omspoint.gadget.app/edit to view/edit your model in Gadget
// For more information on how to update this file http://docs.gadget.dev

export const schema: GadgetModel = {
  type: "gadget/model-schema/v1",
  storageKey: "integrationCredential",
  comment: "Credentials for authenticating with an integration.",
  fields: {
    clientId: {
      type: "string",
      validations: { required: true },
      storageKey: "integrationCredentialClientId",
    },
    connectionType: {
      type: "string",
      validations: { required: true },
      storageKey: "integrationCredentialType",
    },
    env: {
      type: "string",
      validations: { required: true },
      storageKey: "integrationCredentialEnv",
    },
    expiresAt: {
      type: "dateTime",
      includeTime: true,
      storageKey: "integrationCredentialExpiresAt",
    },
    integration: {
      type: "belongsTo",
      validations: { required: true },
      parent: { model: "integration" },
      storageKey: "integrationCredentialIntegration",
    },
    lastRotatedAt: {
      type: "dateTime",
      includeTime: true,
      storageKey: "integrationCredentialLastRotatedAt",
    },
    notes: {
      type: "richText",
      storageKey: "integrationCredentialNotes",
    },
    owner: {
      type: "string",
      storageKey: "integrationCredentialOwner",
    },
    status: {
      type: "enum",
      acceptMultipleSelections: false,
      acceptUnlistedOptions: false,
      options: ["active", "rotation_due", "expired"],
      validations: { required: true },
      storageKey: "integrationCredentialStatus",
    },
  },
};
