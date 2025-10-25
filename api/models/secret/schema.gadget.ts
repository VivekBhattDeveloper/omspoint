import type { GadgetModel } from "gadget-server";

// This file describes the schema for the "secret" model, go to https://omspoint.gadget.app/edit to view/edit your model in Gadget
// For more information on how to update this file http://docs.gadget.dev

export const schema: GadgetModel = {
  type: "gadget/model-schema/v1",
  storageKey: "secret",
  comment: "Managed secret metadata for credential rotation.",
  fields: {
    createdBy: {
      type: "belongsTo",
      parent: { model: "user" },
      storageKey: "secretCreatedBy",
    },
    description: {
      type: "richText",
      storageKey: "secretDescription",
    },
    environment: {
      type: "enum",
      acceptMultipleSelections: false,
      acceptUnlistedOptions: false,
      options: ["production", "staging", "sandbox", "development"],
      validations: { required: true },
      storageKey: "secretEnvironment",
    },
    key: {
      type: "string",
      validations: { required: true },
      storageKey: "secretKey",
    },
    lastRotatedAt: {
      type: "dateTime",
      includeTime: true,
      storageKey: "secretLastRotatedAt",
    },
    secretVersions: {
      type: "hasMany",
      children: { model: "secretVersion", belongsToField: "secret" },
      storageKey: "secretVersions",
    },
    status: {
      type: "enum",
      acceptMultipleSelections: false,
      acceptUnlistedOptions: false,
      options: ["active", "retired"],
      validations: { required: true },
      storageKey: "secretStatus",
    },
    version: {
      type: "number",
      default: 1,
      storageKey: "secretVersion",
    },
  },
};
