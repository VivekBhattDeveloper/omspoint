import type { GadgetModel } from "gadget-server";

// This file describes the schema for the "catalogAttribute" model, go to https://omspoint.gadget.app/edit to view/edit your model in Gadget
// For more information on how to update this file http://docs.gadget.dev

export const schema: GadgetModel = {
  type: "gadget/model-schema/v1",
  storageKey: "catalogAttribute",
  comment:
    "Governed catalog attribute definition and validation metadata.",
  fields: {
    attributeOptions: {
      type: "hasMany",
      children: {
        model: "attributeOption",
        belongsToField: "catalogAttribute",
      },
      storageKey: "catalogAttributeOptions",
    },
    description: {
      type: "richText",
      storageKey: "catalogAttributeDescription",
    },
    key: {
      type: "string",
      validations: { required: true },
      storageKey: "catalogAttributeKey",
    },
    label: {
      type: "string",
      validations: { required: true },
      storageKey: "catalogAttributeLabel",
    },
    namespace: {
      type: "string",
      storageKey: "catalogAttributeNamespace",
    },
    required: {
      type: "boolean",
      default: false,
      storageKey: "catalogAttributeRequired",
    },
    schemaChanges: {
      type: "hasMany",
      children: {
        model: "schemaChange",
        belongsToField: "catalogAttribute",
      },
      storageKey: "catalogAttributeSchemaChanges",
    },
    status: {
      type: "enum",
      acceptMultipleSelections: false,
      acceptUnlistedOptions: false,
      options: ["draft", "active", "deprecated"],
      validations: { required: true },
      storageKey: "catalogAttributeStatus",
    },
    type: {
      type: "enum",
      acceptMultipleSelections: false,
      acceptUnlistedOptions: false,
      options: ["string", "number", "enum", "boolean", "json"],
      validations: { required: true },
      storageKey: "catalogAttributeType",
    },
    unique: {
      type: "boolean",
      default: false,
      storageKey: "catalogAttributeUnique",
    },
    validationIssues: {
      type: "hasMany",
      children: {
        model: "catalogValidation",
        belongsToField: "catalogAttribute",
      },
      storageKey: "catalogAttributeValidationIssues",
    },
    validationRule: {
      type: "json",
      storageKey: "catalogAttributeValidationRule",
    },
    version: {
      type: "number",
      default: 1,
      decimals: 0,
      storageKey: "catalogAttributeVersion",
    },
  },
};
