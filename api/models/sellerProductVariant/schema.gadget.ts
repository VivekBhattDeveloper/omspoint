import type { GadgetModel } from "gadget-server";

// This file describes the schema for the "sellerProductVariant" model, go to https://omspoint.gadget.app/edit to view/edit your model in Gadget
// For more information on how to update this file http://docs.gadget.dev

export const schema: GadgetModel = {
  type: "gadget/model-schema/v1",
  storageKey: "BXcLSm4DYF4s",
  comment:
    "The sellerProductVariant model represents product variants for seller products, capturing essential details such as pricing, inventory, and tax information.",
  fields: {
    availableForSale: {
      type: "boolean",
      default: true,
      storageKey: "Wn1ZQTQf5jjk",
    },
    barcode: { type: "string", storageKey: "zuAWBj_XC7v-" },
    compareAtPrice: { type: "string", storageKey: "q3pfRSoLWUF8" },
    inventoryPolicy: { type: "string", storageKey: "YVw3ArQUqY5H" },
    inventoryQuantity: {
      type: "number",
      default: 0,
      storageKey: "ZtrXiKbCmJIM",
    },
    media: {
      type: "hasMany",
      children: {
        model: "sellerProductVariantMedia",
        belongsToField: "productVariant",
      },
      storageKey: "KcttpSNDfiYw",
    },
    option1: { type: "string", storageKey: "FIJAuWqLH9nA" },
    option2: { type: "string", storageKey: "TvqrjU1AGzXn" },
    option3: { type: "string", storageKey: "K7R51s4TLKrk" },
    position: {
      type: "number",
      storageKey: "EfB6aDPHoVwp",
    },
    presentmentPrices: { type: "json", storageKey: "3w7tjmOsbnjh" },
    price: {
      type: "string",
      validations: { required: true },
      storageKey: "E-oKG8USYgef",
    },
    product: {
      type: "belongsTo",
      validations: { required: true },
      parent: { model: "sellerProduct" },
      storageKey: "6UQb-lAsMW4u",
    },
    selectedOptions: {
      type: "json",
      default: "null",
      storageKey: "8stZS6dUOJIc",
    },
    sku: { type: "string", storageKey: "m80Ux7kuiDjC" },
    taxCode: { type: "string", storageKey: "_P-Ck0gmESve" },
    taxable: {
      type: "boolean",
      default: true,
      storageKey: "Lxub6WFY2TBI",
    },
    title: {
      type: "string",
      validations: { required: true },
      storageKey: "CaN8kQCI5RS8",
    },
    weightUnit: {
      type: "string",
      storageKey: "sellerProductVariant",
    },
  },
};
