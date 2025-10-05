import type { GadgetModel } from "gadget-server";

// This file describes the schema for the "routingPolicyAudit" model, go to https://omspoint.gadget.app/edit to view/edit your model in Gadget
// For more information on how to update this file http://docs.gadget.dev

export const schema: GadgetModel = {
  type: "gadget/model-schema/v1",
  storageKey: "RoutingPolicyAuditModel",
  comment:
    "Tracks review and approval history for routing policy updates.",
  fields: {
    actor: {
      type: "string",
      validations: { required: true },
      storageKey: "routingPolicyAuditActor",
    },
    notes: { type: "string", storageKey: "routingPolicyAuditNotes" },
    role: {
      type: "string",
      validations: { required: true },
      storageKey: "routingPolicyAuditRole",
    },
    routingPolicy: {
      type: "belongsTo",
      validations: { required: true },
      parent: { model: "routingPolicy" },
      storageKey: "routingPolicyAuditPolicy",
    },
    status: {
      type: "enum",
      acceptMultipleSelections: false,
      acceptUnlistedOptions: false,
      options: ["approved", "pending", "rejected"],
      validations: { required: true },
      storageKey: "routingPolicyAuditStatus",
    },
    summary: {
      type: "string",
      validations: { required: true },
      storageKey: "routingPolicyAuditSummary",
    },
    timestamp: {
      type: "dateTime",
      includeTime: true,
      validations: { required: true },
      storageKey: "routingPolicyAuditTimestamp",
    },
  },
};
