import type { GadgetModel } from "gadget-server";

// This file describes the schema for the "shopifyCheckoutLineItem" model, go to https://omspoint.gadget.app/edit to view/edit your model in Gadget
// For more information on how to update this file http://docs.gadget.dev

export const schema: GadgetModel = {
  type: "gadget/model-schema/v1",
  storageKey: "DataModel-Shopify-CheckoutLineItem",
  fields: {},
  shopify: {
    fields: [
      "appliedDiscounts",
      "checkout",
      "compareAtPrice",
      "discountAllocations",
      "fulfillmentService",
      "grams",
      "linePrice",
      "price",
      "product",
      "quantity",
      "requiresShipping",
      "shop",
      "sku",
      "taxable",
      "title",
      "variant",
      "variantTitle",
      "vendor",
    ],
  },
};
