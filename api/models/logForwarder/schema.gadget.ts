import type { GadgetModel } from "gadget-server";

// This file describes the schema for the "logForwarder" model, go to https://omspoint.gadget.app/edit to view/edit your model in Gadget
// For more information on how to update this file http://docs.gadget.dev

export const schema: GadgetModel = {
  type: "gadget/model-schema/v1",
  storageKey: "logForwarder",
  comment: "Log forwarding destination health.",
  fields: {
    destination: {
      type: "string",
      validations: { required: true },
      storageKey: "logForwarderDestination",
    },
    lastHeartbeatAt: {
      type: "dateTime",
      includeTime: true,
      storageKey: "logForwarderLastHeartbeatAt",
    },
    notes: { type: "richText", storageKey: "logForwarderNotes" },
    provider: { type: "string", storageKey: "logForwarderProvider" },
    status: {
      type: "enum",
      acceptMultipleSelections: false,
      acceptUnlistedOptions: false,
      options: ["healthy", "degraded", "failed"],
      validations: { required: true },
      storageKey: "logForwarderStatus",
    },
  },
};
