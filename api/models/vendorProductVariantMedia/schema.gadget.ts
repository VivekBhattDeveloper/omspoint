import type { GadgetModel } from "gadget-server";

// This file describes the schema for the "vendorProductVariantMedia" model, go to https://omspoint.gadget.app/edit to view/edit your model in Gadget
// For more information on how to update this file http://docs.gadget.dev

export const schema: GadgetModel = {
  type: "gadget/model-schema/v1",
  storageKey: "a9sjA0ujDWJM",
  comment:
    "Represents media assets specifically associated with vendor product variants, allowing for variant-level images or other media.",
  fields: {
    position: {
      type: "number",
      decimals: 0,
      storageKey: "vendorProductVariantMedia::position",
    },
    productVariant: {
      type: "belongsTo",
      validations: { required: true },
      parent: { model: "vendorProductVariant" },
      storageKey: "a-xXXO06UwXP",
    },
  },
};
