import type { GadgetModel } from "gadget-server";

// This file describes the schema for the "courierFeedback" model, go to https://omspoint.gadget.app/edit to view/edit your model in Gadget
// For more information on how to update this file http://docs.gadget.dev

export const schema: GadgetModel = {
  type: "gadget/model-schema/v1",
  storageKey: "V-TD08yz4IvR",
  comment:
    "Model for tracking courier feedback and disputes, linked to vendor returns via RMA number",
  fields: {
    carrier: {
      type: "string",
      validations: { required: true },
      storageKey: "w_p1jGIbNV5J",
    },
    disputeStatus: {
      type: "enum",
      acceptMultipleSelections: false,
      acceptUnlistedOptions: false,
      options: ["awaitingEvidence", "evidenceSubmitted", "resolved"],
      validations: { required: true },
      storageKey: "Ub_iqtQG3tKA",
    },
    lastUpdate: {
      type: "dateTime",
      includeTime: true,
      validations: { required: true },
      storageKey: "sNHmKyQTxccP",
    },
    milestone: {
      type: "string",
      validations: { required: true },
      storageKey: "lsPpGD-8OIJO",
    },
    notes: {
      type: "richText",
      validations: { required: true },
      storageKey: "xFTjVjbtWogu",
    },
    responseDue: {
      type: "dateTime",
      includeTime: true,
      validations: { required: true },
      storageKey: "pWfdQb8JtlHz",
    },
    rmaNumber: {
      type: "string",
      validations: { required: true },
      storageKey: "bkMZ2pbeFoNV",
    },
    vendorReturn: {
      type: "belongsTo",
      validations: { required: true },
      parent: { model: "vendorReturn" },
      storageKey: "IuzZ_n5O2geb",
    },
  },
};
