import type { GadgetModel } from "gadget-server";

// This file describes the schema for the "shopifyFulfillmentOrderDestination" model, go to https://omspoint.gadget.app/edit to view/edit your model in Gadget
// For more information on how to update this file http://docs.gadget.dev

export const schema: GadgetModel = {
  type: "gadget/model-schema/v1",
  storageKey: "DataModel-Shopify-FulfillmentOrderDestination",
  fields: {},
  shopify: {
    fields: [
      "address1",
      "address2",
      "city",
      "company",
      "countryCode",
      "email",
      "firstName",
      "fulfillmentOrder",
      "lastName",
      "location",
      "phone",
      "province",
      "shop",
      "zip",
    ],
  },
};
