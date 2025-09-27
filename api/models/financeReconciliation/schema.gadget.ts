import type { GadgetModel } from "gadget-server";

// This file describes the schema for the "financeReconciliation" model, go to https://omspoint.gadget.app/edit to view/edit your model in Gadget
// For more information on how to update this file http://docs.gadget.dev

export const schema: GadgetModel = {
  type: "gadget/model-schema/v1",
  storageKey: "A02MKfROw9Hy",
  fields: {
    order: {
      type: "belongsTo",
      parent: { model: "order" },
      storageKey: "-c7QQt1SpIps::DhwXsoCQRTU9",
    },
    reconciliationDate: {
      type: "dateTime",
      includeTime: true,
      validations: { required: true },
      storageKey: "Y6EM0qnvgYjI::TiLPFim-jP1j",
    },
    reconciliationId: {
      type: "string",
      validations: { required: true, unique: true },
      storageKey: "Hogak5_4foSh::CmvfmL19X4pG",
    },
    status: {
      type: "enum",
      acceptMultipleSelections: false,
      acceptUnlistedOptions: false,
      options: ["pending", "complete", "failed"],
      validations: { required: true },
      storageKey: "w2vmk30PgHEm::3hBNn1twKOF9",
    },
  },
};
