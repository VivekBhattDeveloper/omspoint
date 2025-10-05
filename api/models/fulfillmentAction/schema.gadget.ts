import type { GadgetModel } from "gadget-server";

// This file describes the schema for the "fulfillmentAction" model, go to https://omspoint.gadget.app/edit to view/edit your model in Gadget
// For more information on how to update this file http://docs.gadget.dev

export const schema: GadgetModel = {
  type: "gadget/model-schema/v1",
  storageKey: "mk5kLvlqlK4Z",
  comment:
    "Model for tracking fulfillment actions in the returns workflow, allowing for efficient management and monitoring of return merchandise authorization (RMA) processes.",
  fields: {
    actionType: {
      type: "enum",
      acceptMultipleSelections: false,
      acceptUnlistedOptions: false,
      options: ["restock", "reprint", "qa"],
      validations: { required: true },
      storageKey: "I_EbejXqUpmJ",
    },
    dueDate: {
      type: "dateTime",
      includeTime: true,
      validations: { required: true },
      storageKey: "LwRAqhbgU9aA",
    },
    instructions: {
      type: "richText",
      validations: { required: true },
      storageKey: "wuE28mk17W6H",
    },
    ownerTeam: {
      type: "enum",
      acceptMultipleSelections: false,
      acceptUnlistedOptions: false,
      options: ["returnsOps", "printCell", "qaCell", "warehouse"],
      validations: { required: true },
      storageKey: "fqtZVfEOe1Au",
    },
    rmaNumber: {
      type: "string",
      validations: { required: true },
      storageKey: "vn9yQd_i0UU1",
    },
    status: {
      type: "enum",
      acceptMultipleSelections: false,
      acceptUnlistedOptions: false,
      options: ["pending", "inProgress", "completed"],
      validations: { required: true },
      storageKey: "4EWKIY8GZRzT",
    },
    vendorReturn: {
      type: "belongsTo",
      validations: { required: true },
      parent: { model: "vendorReturn" },
      storageKey: "7msMOQWRMzU4",
    },
  },
};
