import type { GadgetModel } from "gadget-server";

// This file describes the schema for the "webhookEndpoint" model, go to https://omspoint.gadget.app/edit to view/edit your model in Gadget
// For more information on how to update this file http://docs.gadget.dev

export const schema: GadgetModel = {
  type: "gadget/model-schema/v1",
  storageKey: "webhookEndpoint",
  comment: "Webhook endpoints configured for an integration.",
  fields: {
    integration: {
      type: "belongsTo",
      validations: { required: true },
      parent: { model: "integration" },
      storageKey: "webhookEndpointIntegration",
    },
    lastEventAt: {
      type: "dateTime",
      includeTime: true,
      storageKey: "webhookEndpointLastEventAt",
    },
    secretMasked: {
      type: "string",
      storageKey: "webhookEndpointSecretMasked",
    },
    status: {
      type: "enum",
      acceptMultipleSelections: false,
      acceptUnlistedOptions: false,
      options: ["healthy", "failing", "paused"],
      validations: { required: true },
      storageKey: "webhookEndpointStatus",
    },
    url: {
      type: "string",
      validations: { required: true },
      storageKey: "webhookEndpointUrl",
    },
  },
};
