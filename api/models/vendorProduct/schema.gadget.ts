import type { GadgetModel } from "gadget-server";

// This file describes the schema for the "vendorProduct" model, go to https://omspoint.gadget.app/edit to view/edit your model in Gadget
// For more information on how to update this file http://docs.gadget.dev

export const schema: GadgetModel = {
  type: "gadget/model-schema/v1",
  storageKey: "CL6sy5qbkXvY",
  comment:
    "Represents a product owned and managed by a vendor in the multi-vendor system.",
  fields: {
    body: { type: "richText", storageKey: "A_K6h6xFgJ3z" },
    category: { type: "string", storageKey: "4wR4hu0Hlv9Y" },
    compareAtPriceRange: { type: "json", storageKey: "XWgMY2IM_KEJ" },
    handle: {
      type: "string",
      validations: { required: true, unique: true },
      storageKey: "cXkDnmuuBG9z",
    },
    media: {
      type: "hasMany",
      children: {
        model: "vendorProductMedia",
        belongsToField: "product",
      },
      storageKey: "lmngbA-QMzwr",
    },
    options: {
      type: "hasMany",
      children: {
        model: "vendorProductOption",
        belongsToField: "product",
      },
      storageKey: "wRvs2XtkZo0i",
    },
    orderLineItems: { type: "json", storageKey: "JUIpfrCOaNrP" },
    productType: { type: "string", storageKey: "U29Yi01cJjoa" },
    publishedAt: {
      type: "dateTime",
      includeTime: true,
      storageKey: "Q6fhECsV5kWB",
    },
    status: {
      type: "enum",
      default: "draft",
      acceptMultipleSelections: false,
      acceptUnlistedOptions: false,
      options: ["active", "draft", "archived"],
      validations: { required: true },
      storageKey: "pR3-4TBqgRfw",
    },
    tags: { type: "string", storageKey: "Q1ypQr6Fa89c" },
    templateSuffix: { type: "string", storageKey: "yY3d3ZhrTHCO" },
    title: {
      type: "string",
      validations: { required: true },
      storageKey: "fP8KGOypV09U",
    },
    variants: {
      type: "hasMany",
      children: {
        model: "vendorProductVariant",
        belongsToField: "product",
      },
      storageKey: "1onVtsVNJPh2",
    },
    variantsData: {
      type: "json",
      storageKey: "vendorProduct::variantsData",
    },
    vendor: {
      type: "belongsTo",
      validations: { required: true },
      parent: { model: "vendor" },
      storageKey: "jmwhrJ4xFlai",
    },
  },
};
