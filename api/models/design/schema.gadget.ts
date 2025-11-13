import type { GadgetModel } from "gadget-server";

// This file describes the schema for the "design" model, go to https://omspoint.gadget.app/edit to view/edit your model in Gadget
// For more information on how to update this file http://docs.gadget.dev

export const schema: GadgetModel = {
  type: "gadget/model-schema/v1",
  storageKey: "design",
  fields: {
    assignedProductCount: {
      type: "number",
      default: 0,
      storageKey: "FdDKIFsyac-n",
    },
    designType: {
      type: "enum",
      default: "print",
      acceptMultipleSelections: false,
      acceptUnlistedOptions: false,
      options: ["print", "embroidery", "uv", "sublimation"],
      storageKey: "Tnlh9u95vOTp",
    },
    lastReviewedAt: {
      type: "dateTime",
      includeTime: true,
      storageKey: "IIDNDW1CuHkf",
    },
    mockupPreviewUrl: { type: "string", storageKey: "M3RqJzFlxk1n" },
    name: {
      type: "string",
      validations: { required: true },
      storageKey: "arWsaIcsVk7g",
    },
    notes: { type: "richText", storageKey: "design-notes::notes" },
    previewUrl: { type: "string", storageKey: "oL1_hUk0LTwg" },
    primaryChannel: { type: "string", storageKey: "HfWAAwmenykK" },
    slug: {
      type: "string",
      validations: { required: true, unique: true },
      storageKey: "QK-vfv2M3-ae",
    },
    status: {
      type: "enum",
      default: "draft",
      acceptMultipleSelections: false,
      acceptUnlistedOptions: false,
      options: ["draft", "inReview", "approved", "archived"],
      validations: { required: true },
      storageKey: "1YV4QlLTxMNg",
    },
    tags: { type: "string", storageKey: "HKBR6Dxd4-bX" },
  },
};
