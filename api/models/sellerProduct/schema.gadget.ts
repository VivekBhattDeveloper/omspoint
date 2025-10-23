import type { GadgetModel } from "gadget-server";

// This file describes the schema for the "sellerProduct" model, go to https://omspoint.gadget.app/edit to view/edit your model in Gadget
// For more information on how to update this file http://docs.gadget.dev

export const schema: GadgetModel = {
  type: "gadget/model-schema/v1",
  storageKey: "TKU1n8Ab1FoK",
  comment:
    "Represents a seller-managed product mirrored from Shopify structure with support for multi-channel enrichment and vendor linking.",
  fields: {
    body: { type: "richText", storageKey: "WEUwfTQMTvTg" },
    category: { type: "string", storageKey: "3OmcsAdgaytT" },
    compareAtPriceRange: { type: "json", storageKey: "lPtcxwRvRqPE" },
    handle: {
      type: "string",
      validations: { required: true, unique: true },
      storageKey: "quMsovx3h5-l",
    },
    media: {
      type: "hasMany",
      children: {
        model: "sellerProductMedia",
        belongsToField: "product",
      },
      storageKey: "bxBLWc8nEZ8_",
    },
    options: {
      type: "hasMany",
      children: {
        model: "sellerProductOption",
        belongsToField: "product",
      },
      storageKey: "j352BFTgA4Gu",
    },
    productType: { type: "string", storageKey: "mQNXR87oPvsZ" },
    publishedAt: {
      type: "dateTime",
      includeTime: true,
      storageKey: "ghiWJ-_iN2Es",
    },
    seller: {
      type: "belongsTo",
      validations: { required: true },
      parent: { model: "seller" },
      storageKey: "lqgDolHxxklt",
    },
    status: {
      type: "enum",
      default: "draft",
      acceptMultipleSelections: false,
      acceptUnlistedOptions: false,
      options: ["active", "draft", "archived"],
      validations: { required: true },
      storageKey: "U04qThg-Hhqt",
    },
    tags: { type: "string", storageKey: "jlgjDvL0HFQI" },
    templateSuffix: { type: "string", storageKey: "WZX6aAn6FFkJ" },
    title: {
      type: "string",
      validations: { required: true },
      storageKey: "7BI6ZAUhSbMH",
    },
    variants: {
      type: "hasMany",
      children: {
        model: "sellerProductVariant",
        belongsToField: "product",
      },
      storageKey: "Z7cSr4ao3ewD",
    },
    vendor: { type: "string", storageKey: "WnmTlBzSF52E" },
    vendorProductId: {
      type: "string",
      storageKey: "sellerProduct::vendorProductId",
    },
  },
};
