import type { GadgetModel } from "gadget-server";

// This file describes the schema for the "vendorProductMedia" model, go to https://omspoint.gadget.app/edit to view/edit your model in Gadget
// For more information on how to update this file http://docs.gadget.dev

export const schema: GadgetModel = {
  type: "gadget/model-schema/v1",
  storageKey: "iO9FhgfvpixV",
  fields: {
    featuredMediaForProduct: {
      type: "belongsTo",
      parent: { model: "vendorProduct" },
      storageKey: "m1A1uvg6QcGA",
    },
    file: {
      type: "belongsTo",
      validations: { required: true },
      parent: { model: "shopifyFile" },
      storageKey: "vendorProductMedia::file",
    },
    position: {
      type: "number",
      decimals: 0,
      validations: { required: true },
      storageKey: "ZxmxfXCUYwe0",
    },
    product: {
      type: "belongsTo",
      validations: { required: true },
      parent: { model: "vendorProduct" },
      storageKey: "H10P_-h9oS8k",
    },
  },
};
