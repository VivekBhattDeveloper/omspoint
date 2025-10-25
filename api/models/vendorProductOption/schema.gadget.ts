import type { GadgetModel } from "gadget-server";

// This file describes the schema for the "vendorProductOption" model, go to https://omspoint.gadget.app/edit to view/edit your model in Gadget
// For more information on how to update this file http://docs.gadget.dev

export const schema: GadgetModel = {
  type: "gadget/model-schema/v1",
  storageKey: "T9D2eNl7Z4le",
  fields: {
    name: {
      type: "string",
      validations: { required: true },
      storageKey: "oAKAFX8CR3sx",
    },
    position: {
      type: "number",
      storageKey: "Ywg28NaN1bid",
    },
    product: {
      type: "belongsTo",
      validations: { required: true },
      parent: { model: "vendorProduct" },
      storageKey: "LgIYZeLI00JU",
    },
    values: { type: "json", storageKey: "vRJY-_dnp0Zb" },
  },
};
