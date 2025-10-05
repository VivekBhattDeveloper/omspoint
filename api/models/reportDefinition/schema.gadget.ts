import type { GadgetModel } from "gadget-server";

// This file describes the schema for the "reportDefinition" model, go to https://omspoint.gadget.app/edit to view/edit your model in Gadget
// For more information on how to update this file http://docs.gadget.dev

export const schema: GadgetModel = {
  type: "gadget/model-schema/v1",
  storageKey: "reportDefinition",
  comment: "Configurable report definition and scheduling metadata.",
  fields: {
    category: {
      type: "string",
      storageKey: "reportDefinitionCategory",
    },
    createdBy: {
      type: "belongsTo",
      parent: { model: "user" },
      storageKey: "reportDefinitionCreatedBy",
    },
    description: {
      type: "richText",
      storageKey: "reportDefinitionDescription",
    },
    format: {
      type: "enum",
      acceptMultipleSelections: false,
      acceptUnlistedOptions: false,
      options: ["csv", "xlsx", "json"],
      validations: { required: true },
      storageKey: "reportDefinitionFormat",
    },
    name: {
      type: "string",
      validations: { required: true },
      storageKey: "reportDefinitionName",
    },
    parameters: {
      type: "json",
      storageKey: "reportDefinitionParameters",
    },
    reportRuns: {
      type: "hasMany",
      children: {
        model: "reportRun",
        belongsToField: "reportDefinition",
      },
      storageKey: "reportDefinitionRuns",
    },
    schedule: {
      type: "enum",
      acceptMultipleSelections: false,
      acceptUnlistedOptions: false,
      options: ["manual", "daily", "weekly", "monthly"],
      validations: { required: true },
      storageKey: "reportDefinitionSchedule",
    },
  },
};
