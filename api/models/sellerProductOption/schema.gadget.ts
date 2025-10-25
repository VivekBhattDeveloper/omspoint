import type { GadgetModel } from "gadget-server";

// This file describes the schema for the "sellerProductOption" model, go to https://omspoint.gadget.app/edit to view/edit your model in Gadget
// For more information on how to update this file http://docs.gadget.dev

export const schema: GadgetModel = {
  type: "gadget/model-schema/v1",
  storageKey: "fTzw2TnpN9uB",
  comment:
    "The sellerProductOption model represents product options that can be selected by customers, such as size or color, for seller products.",
  fields: {
    name: {
      type: "string",
      validations: { required: true },
      storageKey: "1Ifbgs4g8uRZ",
    },
    position: {
      type: "number",
      storageKey: "Ewkkqbo-R785",
    },
    product: {
      type: "belongsTo",
      validations: { required: true },
      parent: { model: "sellerProduct" },
      storageKey: "8Z65lT0eWCx4",
    },
    values: {
      type: "json",
      default: "null",
      validations: { required: true },
      storageKey: "OSLzQXaXOIAY",
    },
  },
};
