import type { GadgetModel } from "gadget-server";

// This file describes the schema for the "sellerProductVariantMedia" model, go to https://omspoint.gadget.app/edit to view/edit your model in Gadget
// For more information on how to update this file http://docs.gadget.dev

export const schema: GadgetModel = {
  type: "gadget/model-schema/v1",
  storageKey: "4PbY3gkC5b1b",
  comment:
    "This model represents media associated with seller product variants, allowing for variant-specific images or other media.",
  fields: {
    position: {
      type: "number",
      storageKey: "sellerProductVariantMedia",
    },
    productVariant: {
      type: "belongsTo",
      validations: { required: true },
      parent: { model: "sellerProductVariant" },
      storageKey: "46JJl8ixMk0w",
    },
  },
};
