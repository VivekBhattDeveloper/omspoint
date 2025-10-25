import type { GadgetModel } from "gadget-server";

// This file describes the schema for the "vendorProductVariant" model, go to https://omspoint.gadget.app/edit to view/edit your model in Gadget
// For more information on how to update this file http://docs.gadget.dev

export const schema: GadgetModel = {
  type: "gadget/model-schema/v1",
  storageKey: "c569Xw_H0vFR",
  fields: {
    availableForSale: {
      type: "boolean",
      default: true,
      storageKey: "y9-f1ZpQHLXn",
    },
    barcode: { type: "string", storageKey: "dN3jVTqAifBl" },
    compareAtPrice: { type: "string", storageKey: "1Vxk-5KT-mkr" },
    inventoryItem: {
      type: "belongsTo",
      parent: { model: "shopifyInventoryItem" },
      storageKey: "vendorProductVariant::inventoryItem",
    },
    inventoryPolicy: { type: "string", storageKey: "EVeH6_EnYHox" },
    inventoryQuantity: {
      type: "number",
      default: 0,
      storageKey: "yiWzTGE0e04k",
    },
    mockupConfig: { type: "json", storageKey: "vendorProductVariant::mockupConfig" },
    media: {
      type: "hasMany",
      children: {
        model: "vendorProductVariantMedia",
        belongsToField: "productVariant",
      },
      storageKey: "q_395_VVaWaX",
    },
    optionLabels: { type: "json", storageKey: "vendorProductVariant::optionLabels" },
    option1: { type: "string", storageKey: "XV-N-jRMkbJe" },
    option2: { type: "string", storageKey: "RJ9r4irL15Ci" },
    option3: { type: "string", storageKey: "_z4bpZeNw5dK" },
    position: { type: "number", storageKey: "n7gThHzc5Yq5" },
    presentmentPrices: { type: "json", storageKey: "qKm-CdkauftZ" },
    price: {
      type: "string",
      validations: { required: true },
      storageKey: "dNT9DS_nQXFl",
    },
    product: {
      type: "belongsTo",
      validations: { required: true },
      parent: { model: "vendorProduct" },
      storageKey: "xi_qfoVodz-k",
    },
    selectedOptions: {
      type: "json",
      default: "null",
      storageKey: "SeNZEKnKaX09",
    },
    designId: { type: "string", storageKey: "vendorProductVariant::designId" },
    shippingProfile: { type: "string", storageKey: "vendorProductVariant::shippingProfile" },
    requiresShipping: {
      type: "boolean",
      default: true,
      storageKey: "vendorProductVariant::requiresShipping",
    },
    sku: { type: "string", storageKey: "Gpepa9QgY59O" },
    unitCost: { type: "string", storageKey: "vendorProductVariant::unitCost" },
    taxCode: { type: "string", storageKey: "XOOiuJeN-Scs" },
    taxable: {
      type: "boolean",
      default: true,
      storageKey: "T-H1JTZMHMj5",
    },
    weight: { type: "number", storageKey: "vendorProductVariant::weight" },
    weightUnit: { type: "string", storageKey: "vendorProductVariant::weightUnit" },
    title: {
      type: "string",
      validations: { required: true },
      storageKey: "V254y4Mq6D-A",
    },
  },
};
