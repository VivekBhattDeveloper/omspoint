import type { GadgetModel } from "gadget-server";

// This file describes the schema for the "vendorProductMedia" model, go to https://omspoint.gadget.app/edit to view/edit your model in Gadget
// For more information on how to update this file http://docs.gadget.dev

export const schema: GadgetModel = {
  type: "gadget/model-schema/v1",
  storageKey: "iO9FhgfvpixV",
  fields: {
    alt: { type: "string", storageKey: "vendorProductMedia::alt" },
    featuredMediaForProduct: {
      type: "belongsTo",
      parent: { model: "vendorProduct" },
      storageKey: "m1A1uvg6QcGA",
    },
    position: {
      type: "number",
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
