import type { GadgetModel } from "gadget-server";

// This file describes the schema for the "catalogValidation" model, go to https://omspoint.gadget.app/edit to view/edit your model in Gadget
// For more information on how to update this file http://docs.gadget.dev

export const schema: GadgetModel = {
  type: "gadget/model-schema/v1",
  storageKey: "vSAyKfjUCTY7",
  comment:
    "This model tracks validation issues in the product catalog, providing insights into data quality and integrity.",
  fields: {
    attributeKey: {
      type: "string",
      validations: { required: true },
      storageKey: "zuWv_oEG2T1y",
    },
    attributeLabel: {
      type: "string",
      validations: { required: true },
      storageKey: "_rVOBgdyYBrq",
    },
    catalogAttribute: {
      type: "belongsTo",
      parent: { model: "catalogAttribute" },
      storageKey: "2vAJB45mYtKp",
    },
    message: {
      type: "richText",
      validations: { required: true },
      storageKey: "4zl-ZXUOcYUI",
    },
    observedAt: {
      type: "dateTime",
      includeTime: true,
      validations: { required: true },
      storageKey: "HNrMHQ9FeOHG",
    },
    product: {
      type: "belongsTo",
      validations: { required: true },
      parent: { model: "product" },
      storageKey: "P6rlpk4MsmIF",
    },
    productId: {
      type: "string",
      validations: { required: true },
      storageKey: "uBgsY5ZKEkjg",
    },
    productName: {
      type: "string",
      validations: { required: true },
      storageKey: "skvgB2HzfwUj",
    },
    severity: {
      type: "enum",
      acceptMultipleSelections: false,
      acceptUnlistedOptions: false,
      options: ["error", "warning"],
      validations: { required: true },
      storageKey: "ygr5BGUpwc_v",
    },
    source: {
      type: "enum",
      acceptMultipleSelections: false,
      acceptUnlistedOptions: false,
      options: ["ingestion", "manual"],
      validations: { required: true },
      storageKey: "UWNbOrSFBI8H",
    },
    vendor: {
      type: "belongsTo",
      validations: { required: true },
      parent: { model: "vendor" },
      storageKey: "XQjSXeX9C2lt",
    },
    vendorId: {
      type: "string",
      validations: { required: true },
      storageKey: "slXqlI7m66ip",
    },
    vendorName: {
      type: "string",
      validations: { required: true },
      storageKey: "pT3DSIyJOKJG",
    },
  },
};
