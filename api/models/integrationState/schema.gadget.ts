import type { GadgetModel } from "gadget-server";

// This file describes the schema for the "integrationState" model, go to https://omspoint.gadget.app/edit to view/edit your model in Gadget
// For more information on how to update this file http://docs.gadget.dev

export const schema: GadgetModel = {
  type: "gadget/model-schema/v1",
  storageKey: "2j5j3nd6nF6q",
  comment:
    "Model for tracking third-party integration states across vendors",
  fields: {
    lastSync: {
      type: "dateTime",
      includeTime: true,
      validations: { required: true },
      storageKey: "10Msihfv0Ls_",
    },
    linkedQueues: {
      type: "json",
      default: "null",
      validations: { required: true },
      storageKey: "Ac5oNviZqagO",
    },
    provider: {
      type: "string",
      validations: { required: true },
      storageKey: "xn6LdBYxUODP",
    },
    status: {
      type: "enum",
      acceptMultipleSelections: false,
      acceptUnlistedOptions: false,
      options: ["connected", "error", "syncing"],
      validations: { required: true },
      storageKey: "Mwu5IZ7Rsx9F",
    },
    ticketCount: {
      type: "number",
      decimals: 0,
      validations: { required: true },
      storageKey: "XCQtmOWchqtj",
    },
  },
};
