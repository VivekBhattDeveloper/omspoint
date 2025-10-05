import type { GadgetModel } from "gadget-server";

// This file describes the schema for the "shopifyInventoryQuantity" model, go to https://omspoint.gadget.app/edit to view/edit your model in Gadget
// For more information on how to update this file http://docs.gadget.dev

export const schema: GadgetModel = {
  type: "gadget/model-schema/v1",
  storageKey: "DataModel-Shopify-InventoryQuantity",
  fields: {},
  shopify: {
    fields: [
      "inventoryLevel",
      "quantity",
      "shop",
      "shopifyUpdatedAt",
    ],
  },
};
