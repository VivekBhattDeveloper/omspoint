import type { GadgetModel } from "gadget-server";

// This file describes the schema for the "shopifyFulfillmentHold" model, go to https://omspoint.gadget.app/edit to view/edit your model in Gadget
// For more information on how to update this file http://docs.gadget.dev

export const schema: GadgetModel = {
  type: "gadget/model-schema/v1",
  storageKey: "DataModel-Shopify-FulfillmentHold",
  fields: {},
  shopify: {
    fields: [
      "displayReason",
      "fulfillmentOrder",
      "handle",
      "heldByApp",
      "heldByRequestingApp",
      "reason",
      "reasonNotes",
      "shop",
    ],
  },
};
