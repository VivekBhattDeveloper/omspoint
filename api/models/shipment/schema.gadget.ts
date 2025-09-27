import type { GadgetModel } from "gadget-server";

// This file describes the schema for the "shipment" model, go to https://omspoint.gadget.app/edit to view/edit your model in Gadget
// For more information on how to update this file http://docs.gadget.dev

export const schema: GadgetModel = {
  type: "gadget/model-schema/v1",
  storageKey: "giryABqCcloA",
  fields: {
    order: {
      type: "belongsTo",
      parent: { model: "order" },
      storageKey: "U6Oo2eS-fOjQ::Ew8X6YtZ6oQx",
    },
    shipmentDate: {
      type: "dateTime",
      includeTime: true,
      validations: { required: true },
      storageKey: "qnSdZAJZbRfN::AoO9yF5WTxh7",
    },
    shipmentMethod: {
      type: "enum",
      acceptMultipleSelections: false,
      acceptUnlistedOptions: false,
      options: ["ground", "air", "express"],
      validations: { required: true },
      storageKey: "XclBFbKWSPr5::i3vJA20gIyzm",
    },
    trackingNumber: {
      type: "string",
      validations: { required: true, unique: true },
      storageKey: "m7dCi8zALhWG::iACjGa3xtBAB",
    },
  },
};
