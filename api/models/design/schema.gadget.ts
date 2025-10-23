import type { GadgetModel } from "gadget-server";

// Schema definition for the "design" model. Edit via https://omspoint.gadget.app/edit or maintain this file.

export const schema: GadgetModel = {
  type: "gadget/model-schema/v1",
  storageKey: "design",
  fields: {
    name: {
      type: "string",
      validations: { required: true },
      storageKey: "design::name",
    },
    slug: {
      type: "string",
      validations: { required: true, unique: true },
      storageKey: "design::slug",
    },
    status: {
      type: "enum",
      options: ["draft", "inReview", "approved", "archived"],
      default: "draft",
      validations: { required: true },
      storageKey: "design::status",
    },
    designType: {
      type: "enum",
      options: ["print", "embroidery", "uv", "sublimation"],
      default: "print",
      storageKey: "design::type",
    },
    primaryChannel: {
      type: "string",
      storageKey: "design::primaryChannel",
    },
    assignedProductCount: {
      type: "number",
      default: 0,
      storageKey: "design::assignedProductCount",
    },
    tags: {
      type: "json",
      storageKey: "design::tags",
    },
    previewUrl: {
      type: "url",
      storageKey: "design::previewUrl",
    },
    owner: {
      type: "belongsTo",
      parent: { model: "seller" },
      storageKey: "design::owner",
    },
    lastReviewedAt: {
      type: "dateTime",
      storageKey: "design::lastReviewedAt",
    },
    notes: {
      type: "richText",
      storageKey: "design::notes",
    },
  },
};
