import type { GadgetModel } from "gadget-server";

// This file describes the schema for the "slaTarget" model, go to https://omspoint.gadget.app/edit to view/edit your model in Gadget
// For more information on how to update this file http://docs.gadget.dev

export const schema: GadgetModel = {
  type: "gadget/model-schema/v1",
  storageKey: "slaTarget",
  comment: "Service level target associated with a routing policy.",
  fields: {
    metric: {
      type: "string",
      validations: { required: true },
      storageKey: "slaTargetMetric",
    },
    routingPolicy: {
      type: "belongsTo",
      validations: { required: true },
      parent: { model: "routingPolicy" },
      storageKey: "slaTargetPolicy",
    },
    targetValue: { type: "number", storageKey: "slaTargetValue" },
    threshold: { type: "number", storageKey: "slaTargetThreshold" },
    unit: { type: "string", storageKey: "slaTargetUnit" },
    warningThreshold: {
      type: "number",
      storageKey: "slaTargetWarningThreshold",
    },
  },
};
