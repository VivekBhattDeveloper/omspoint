import type { GadgetModel } from "gadget-server";

// This file describes the schema for the "payment" model, go to https://omspoint.gadget.app/edit to view/edit your model in Gadget
// For more information on how to update this file http://docs.gadget.dev

export const schema: GadgetModel = {
  type: "gadget/model-schema/v1",
  storageKey: "HeE-ZsWaVSZC",
  fields: {
    amount: {
      type: "number",
      validations: { required: true },
      storageKey: "2e5bOH5EiTQe::9dyP5rIo-sdF",
    },
    order: {
      type: "belongsTo",
      parent: { model: "order" },
      storageKey: "o78Uf4ekQcAM::H-5qCZhkfSGt",
    },
    paymentDate: {
      type: "dateTime",
      includeTime: true,
      validations: { required: true },
      storageKey: "DBfoTh2yQ9OP::a0Mcv9f5GtLE",
    },
    paymentMethod: {
      type: "enum",
      acceptMultipleSelections: false,
      acceptUnlistedOptions: false,
      options: ["creditCard", "paypal", "bankTransfer"],
      validations: { required: true },
      storageKey: "WlygY7QdEtKm::Qpb5ZRckNpAe",
    },
  },
};
