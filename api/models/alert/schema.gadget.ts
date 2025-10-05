import type { GadgetModel } from "gadget-server";

// This file describes the schema for the "alert" model, go to https://omspoint.gadget.app/edit to view/edit your model in Gadget
// For more information on how to update this file http://docs.gadget.dev

export const schema: GadgetModel = {
  type: "gadget/model-schema/v1",
  storageKey: "alert",
  comment: "Operational alert tracked for observability purposes.",
  fields: {
    acknowledgedAt: {
      type: "dateTime",
      includeTime: true,
      storageKey: "alertAcknowledgedAt",
    },
    notes: { type: "richText", storageKey: "alertNotes" },
    openedAt: {
      type: "dateTime",
      includeTime: true,
      storageKey: "alertOpenedAt",
    },
    resolvedAt: {
      type: "dateTime",
      includeTime: true,
      storageKey: "alertResolvedAt",
    },
    runbookUrl: { type: "url", storageKey: "alertRunbookUrl" },
    serviceName: {
      type: "string",
      validations: { required: true },
      storageKey: "alertServiceName",
    },
    severity: {
      type: "enum",
      acceptMultipleSelections: false,
      acceptUnlistedOptions: false,
      options: ["critical", "high", "warning"],
      validations: { required: true },
      storageKey: "alertSeverity",
    },
    status: {
      type: "enum",
      acceptMultipleSelections: false,
      acceptUnlistedOptions: false,
      options: ["open", "acknowledged", "resolved"],
      validations: { required: true },
      storageKey: "alertStatus",
    },
    summary: { type: "string", storageKey: "alertSummary" },
    type: { type: "string", storageKey: "alertType" },
  },
};
