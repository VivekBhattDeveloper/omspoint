import type { GadgetModel } from "gadget-server";

// This file describes the schema for the "reportRun" model, go to https://omspoint.gadget.app/edit to view/edit your model in Gadget
// For more information on how to update this file http://docs.gadget.dev

export const schema: GadgetModel = {
  type: "gadget/model-schema/v1",
  storageKey: "reportRun",
  comment: "Execution run for a report definition.",
  fields: {
    completedAt: {
      type: "dateTime",
      includeTime: true,
      storageKey: "reportRunCompletedAt",
    },
    error: { type: "string", storageKey: "reportRunError" },
    reportDefinition: {
      type: "belongsTo",
      validations: { required: true },
      parent: { model: "reportDefinition" },
      storageKey: "reportRunDefinition",
    },
    requestedBy: {
      type: "belongsTo",
      parent: { model: "user" },
      storageKey: "reportRunRequestedBy",
    },
    startedAt: {
      type: "dateTime",
      includeTime: true,
      storageKey: "reportRunStartedAt",
    },
    status: {
      type: "enum",
      acceptMultipleSelections: false,
      acceptUnlistedOptions: false,
      options: ["pending", "running", "completed", "failed"],
      validations: { required: true },
      storageKey: "reportRunStatus",
    },
    storageUrl: { type: "url", storageKey: "reportRunStorageUrl" },
  },
};
