import type { GadgetModel } from "gadget-server";

// This file describes the schema for the "printProfile" model, go to https://omspoint.gadget.app/edit to view/edit your model in Gadget
// For more information on how to update this file http://docs.gadget.dev

export const schema: GadgetModel = {
  type: "gadget/model-schema/v1",
  storageKey: "printProfile",
  comment: "Printer device configuration profile.",
  fields: {
    colorProfile: {
      type: "string",
      storageKey: "printProfileColorProfile",
    },
    lastValidatedAt: {
      type: "dateTime",
      includeTime: true,
      storageKey: "printProfileLastValidatedAt",
    },
    name: {
      type: "string",
      validations: { required: true },
      storageKey: "printProfileName",
    },
    owner: { type: "string", storageKey: "printProfileOwner" },
    printerDevice: {
      type: "belongsTo",
      validations: { required: true },
      parent: { model: "printerDevice" },
      storageKey: "printProfilePrinterDevice",
    },
    resolution: {
      type: "string",
      storageKey: "printProfileResolution",
    },
    status: {
      type: "enum",
      default: "active",
      acceptMultipleSelections: false,
      acceptUnlistedOptions: false,
      options: ["draft", "active", "needs_review"],
      storageKey: "printProfileStatus",
    },
    substrate: {
      type: "string",
      storageKey: "printProfileSubstrate",
    },
    version: { type: "string", storageKey: "printProfileVersion" },
  },
};
