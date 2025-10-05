import type { GadgetModel } from "gadget-server";

// This file describes the schema for the "incident" model, go to https://omspoint.gadget.app/edit to view/edit your model in Gadget
// For more information on how to update this file http://docs.gadget.dev

export const schema: GadgetModel = {
  type: "gadget/model-schema/v1",
  storageKey: "incident",
  comment: "Incident management record for observability workflows.",
  fields: {
    followUp: { type: "json", storageKey: "incidentFollowUp" },
    impact: { type: "string", storageKey: "incidentImpact" },
    postmortemUrl: {
      type: "url",
      storageKey: "incidentPostmortemUrl",
    },
    resolvedAt: {
      type: "dateTime",
      includeTime: true,
      storageKey: "incidentResolvedAt",
    },
    severity: {
      type: "enum",
      acceptMultipleSelections: false,
      acceptUnlistedOptions: false,
      options: ["sev1", "sev2", "sev3"],
      validations: { required: true },
      storageKey: "incidentSeverity",
    },
    startedAt: {
      type: "dateTime",
      includeTime: true,
      validations: { required: true },
      storageKey: "incidentStartedAt",
    },
    status: {
      type: "enum",
      acceptMultipleSelections: false,
      acceptUnlistedOptions: false,
      options: ["open", "monitoring", "resolved"],
      validations: { required: true },
      storageKey: "incidentStatus",
    },
    summary: { type: "richText", storageKey: "incidentSummary" },
    title: {
      type: "string",
      validations: { required: true },
      storageKey: "incidentTitle",
    },
  },
};
