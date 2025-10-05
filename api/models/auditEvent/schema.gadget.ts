import type { GadgetModel } from "gadget-server";

// This file describes the schema for the "auditEvent" model, go to https://omspoint.gadget.app/edit to view/edit your model in Gadget
// For more information on how to update this file http://docs.gadget.dev

export const schema: GadgetModel = {
  type: "gadget/model-schema/v1",
  storageKey: "AuditEventModel",
  comment:
    "Normalized audit log event data for compliance reporting.",
  fields: {
    action: {
      type: "string",
      validations: { required: true },
      storageKey: "auditEventAction",
    },
    actor: {
      type: "string",
      validations: { required: true },
      storageKey: "auditEventActor",
    },
    actorRole: {
      type: "string",
      validations: { required: true },
      storageKey: "auditEventActorRole",
    },
    changeTicket: {
      type: "string",
      storageKey: "auditEventChangeTicket",
    },
    channel: {
      type: "string",
      validations: { required: true },
      storageKey: "auditEventChannel",
    },
    diffSummary: {
      type: "string",
      validations: { required: true },
      storageKey: "auditEventDiffSummary",
    },
    evidencePack: {
      type: "string",
      storageKey: "auditEventEvidencePack",
    },
    model: {
      type: "string",
      validations: { required: true },
      storageKey: "auditEventModel",
    },
    severity: {
      type: "enum",
      acceptMultipleSelections: false,
      acceptUnlistedOptions: false,
      options: ["info", "warning", "critical"],
      validations: { required: true },
      storageKey: "auditEventSeverity",
    },
    status: {
      type: "enum",
      acceptMultipleSelections: false,
      acceptUnlistedOptions: false,
      options: ["recorded", "awaiting_approval", "rejected"],
      validations: { required: true },
      storageKey: "auditEventStatus",
    },
    target: {
      type: "string",
      validations: { required: true },
      storageKey: "auditEventTarget",
    },
    timestamp: {
      type: "dateTime",
      includeTime: true,
      validations: { required: true },
      storageKey: "auditEventTimestamp",
    },
  },
};
