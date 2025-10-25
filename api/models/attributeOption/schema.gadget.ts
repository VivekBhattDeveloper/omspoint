import type { GadgetModel } from "gadget-server";

// This file describes the schema for the "attributeOption" model, go to https://omspoint.gadget.app/edit to view/edit your model in Gadget
// For more information on how to update this file http://docs.gadget.dev

export const schema: GadgetModel = {
  type: "gadget/model-schema/v1",
  storageKey: "attributeOption",
  comment: "Enumerated option for a catalog attribute.",
  fields: {
    catalogAttribute: {
      type: "belongsTo",
      validations: { required: true },
      parent: { model: "catalogAttribute" },
      storageKey: "attributeOptionCatalogAttribute",
    },
    label: { type: "string", storageKey: "attributeOptionLabel" },
    sortOrder: {
      type: "number",
      storageKey: "attributeOptionSortOrder",
    },
    value: {
      type: "string",
      validations: { required: true },
      storageKey: "attributeOptionValue",
    },
  },
};
