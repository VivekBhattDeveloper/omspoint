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
    channel: {
      type: "enum",
      acceptMultipleSelections: false,
      acceptUnlistedOptions: true,
      options: [
        "manual",
        "shopify",
        "amazon",
        "etsy",
        "ebay",
        "woocommerce",
        "magento",
        "flipkart",
        "ajio",
        "custom",
      ],
      default: "manual",
      validations: { required: true },
      storageKey: "sellerProduct::channel",
    },
    channelHandle: {
      type: "string",
      storageKey: "sellerProduct::channelHandle",
    },
    channelProductId: {
      type: "string",
      storageKey: "sellerProduct::channelProductId",
    },
    channelPublishingErrors: {
      type: "json",
      storageKey: "sellerProduct::channelPublishingErrors",
    },
    channelSettings: {
      type: "json",
      storageKey: "sellerProduct::channelSettings",
    },
    channelStatus: {
      type: "enum",
      acceptMultipleSelections: false,
      acceptUnlistedOptions: false,
      options: ["draft", "pending", "published", "error", "paused"],
      default: "draft",
      storageKey: "sellerProduct::channelStatus",
    },
    compareAtPriceRange: { type: "json", storageKey: "lPtcxwRvRqPE" },
    continueSellingWhenOutOfStock: {
      type: "boolean",
      default: false,
      storageKey: "sellerProduct::continueSellingWhenOutOfStock",
    },
    customCollections: {
      type: "json",
      storageKey: "sellerProduct::customCollections",
    },
    designAssignments: {
      type: "json",
      storageKey: "sellerProduct::designAssignments",
    },
    designId: {
      type: "string",
      storageKey: "sellerProduct::designId",
    },
    generatedImages: {
      type: "json",
      storageKey: "sellerProduct::generatedImages",
    },
    handle: {
      type: "string",
      validations: { required: true, unique: true },
      storageKey: "quMsovx3h5-l",
    },
    hasVariantsThatRequiresComponents: {
      type: "boolean",
      default: false,
      storageKey: "sellerProduct::hasVariantsThatRequiresComponents",
    },
    mockupAssets: {
      type: "json",
      storageKey: "sellerProduct::mockupAssets",
    },
    mockupConfig: {
      type: "json",
      storageKey: "sellerProduct::mockupConfig",
    },
    media: {
      type: "hasMany",
      children: {
        model: "sellerProductMedia",
        belongsToField: "product",
      },
      storageKey: "bxBLWc8nEZ8_",
    },
    mediaData: {
      type: "json",
      storageKey: "sellerProduct::mediaData",
    },
    options: {
      type: "hasMany",
      children: {
        model: "sellerProductOption",
        belongsToField: "product",
      },
      storageKey: "j352BFTgA4Gu",
    },
    optionsData: {
      type: "json",
      storageKey: "sellerProduct::optionsData",
    },
    order: {
      type: "belongsTo",
      parent: { model: "order" },
      storageKey: "sellerProduct::order",
    },
    orderLineItems: {
      type: "json",
      storageKey: "sellerProduct::orderLineItems",
    },
    productCategory: {
      type: "string",
      storageKey: "sellerProduct::productCategory",
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
    seoDescription: {
      type: "string",
      storageKey: "sellerProduct::seoDescription",
    },
    seoTitle: {
      type: "string",
      storageKey: "sellerProduct::seoTitle",
    },
    shop: {
      type: "belongsTo",
      parent: { model: "shopifyShop" },
      storageKey: "sellerProduct::shop",
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
    trackInventory: {
      type: "boolean",
      default: true,
      storageKey: "sellerProduct::trackInventory",
    },
    variants: {
      type: "hasMany",
      children: {
        model: "sellerProductVariant",
        belongsToField: "product",
      },
      storageKey: "Z7cSr4ao3ewD",
    },
    variantsData: {
      type: "json",
      storageKey: "sellerProduct::variantsData",
    },
    vendor: { type: "string", storageKey: "WnmTlBzSF52E" },
    vendorCode: {
      type: "string",
      storageKey: "sellerProduct::vendorCode",
    },
    vendorProductId: {
      type: "string",
      storageKey: "sellerProduct::vendorProductId",
    },
  },
};
