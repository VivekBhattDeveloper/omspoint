import type { GadgetModel } from "gadget-server";

// This file describes the schema for the "approvalRequest" model, go to https://omspoint.gadget.app/edit to view/edit your model in Gadget
// For more information on how to update this file http://docs.gadget.dev

export const schema: GadgetModel = {
  type: "gadget/model-schema/v1",
  storageKey: "ApprovalRequestModel",
  comment: "Approval workflow requests used for change control.",
  fields: {
    context: { type: "string", storageKey: "approvalRequestContext" },
    evidence: {
      type: "string",
      storageKey: "approvalRequestEvidence",
    },
    pendingApprovers: {
      type: "json",
      default: "[]",
      storageKey: "approvalRequestPendingApprovers",
    },
    policy: { type: "string", storageKey: "approvalRequestPolicy" },
    risk: {
      type: "enum",
      acceptMultipleSelections: false,
      acceptUnlistedOptions: false,
      options: ["low", "medium", "high"],
      validations: { required: true },
      storageKey: "approvalRequestRisk",
    },
    status: {
      type: "enum",
      acceptMultipleSelections: false,
      acceptUnlistedOptions: false,
      options: ["pending", "approved", "rejected"],
      validations: { required: true },
      storageKey: "approvalRequestStatus",
    },
    submittedAt: {
      type: "dateTime",
      includeTime: true,
      validations: { required: true },
      storageKey: "approvalRequestSubmittedAt",
    },
    submittedBy: {
      type: "string",
      validations: { required: true },
      storageKey: "approvalRequestSubmittedBy",
    },
    title: {
      type: "string",
      validations: { required: true },
      storageKey: "approvalRequestTitle",
    },
  },
};
