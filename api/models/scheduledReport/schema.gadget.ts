import type { GadgetModel } from "gadget-server";

// This file describes the schema for the "scheduledReport" model, go to https://omspoint.gadget.app/edit to view/edit your model in Gadget
// For more information on how to update this file http://docs.gadget.dev

export const schema: GadgetModel = {
  type: "gadget/model-schema/v1",
  storageKey: "ScheduledReportModel",
  comment:
    "Metadata for recurring scheduled reports and their delivery channels.",
  fields: {
    audience: {
      type: "string",
      storageKey: "scheduledReportAudience",
    },
    channel: {
      type: "enum",
      acceptMultipleSelections: false,
      acceptUnlistedOptions: false,
      options: ["SFTP", "Email", "Webhook"],
      validations: { required: true },
      storageKey: "scheduledReportChannel",
    },
    format: { type: "string", storageKey: "scheduledReportFormat" },
    frequency: {
      type: "string",
      storageKey: "scheduledReportFrequency",
    },
    name: {
      type: "string",
      validations: { required: true },
      storageKey: "scheduledReportName",
    },
    nextRun: {
      type: "dateTime",
      includeTime: true,
      storageKey: "scheduledReportNextRun",
    },
    owner: { type: "string", storageKey: "scheduledReportOwner" },
    status: {
      type: "enum",
      acceptMultipleSelections: false,
      acceptUnlistedOptions: false,
      options: ["active", "paused"],
      validations: { required: true },
      storageKey: "scheduledReportStatus",
    },
  },
};
