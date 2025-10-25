import type { GadgetModel } from "gadget-server";

// This file describes the schema for the "routingRule" model, go to https://omspoint.gadget.app/edit to view/edit your model in Gadget
// For more information on how to update this file http://docs.gadget.dev

export const schema: GadgetModel = {
  type: "gadget/model-schema/v1",
  storageKey: "routingRule",
  comment: "Routing rule criteria evaluated within a policy.",
  fields: {
    criteria: { type: "json", storageKey: "routingRuleCriteria" },
    fallbackPolicy: {
      type: "string",
      storageKey: "routingRuleFallbackPolicy",
    },
    name: { type: "string", storageKey: "routingRuleName" },
    priority: {
      type: "number",
      validations: { required: true },
      storageKey: "routingRulePriority",
    },
    routingPolicy: {
      type: "belongsTo",
      validations: { required: true },
      parent: { model: "routingPolicy" },
      storageKey: "routingRulePolicy",
    },
    weights: { type: "json", storageKey: "routingRuleWeights" },
  },
};
