import type { GadgetModel } from "gadget-server";

// This file describes the schema for the "sellerProductMedia" model, go to https://omspoint.gadget.app/edit to view/edit your model in Gadget
// For more information on how to update this file http://docs.gadget.dev

export const schema: GadgetModel = {
  type: "gadget/model-schema/v1",
  storageKey: "GK7iDONUaGxB",
  fields: {
    alt: { type: "string", storageKey: "sellerProductMedia" },
    featuredMediaForProduct: {
      type: "belongsTo",
      parent: { model: "sellerProduct" },
      storageKey: "9GgxFdnS_HFr",
    },
    position: {
      type: "number",
      validations: { required: true },
      storageKey: "WHZ8x-2NpY2k",
    },
    product: {
      type: "belongsTo",
      validations: { required: true },
      parent: { model: "sellerProduct" },
      storageKey: "e0c-GJbnbjCQ",
    },
  },
};
