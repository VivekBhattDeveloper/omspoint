import type { GadgetModel } from "gadget-server";

// This file describes the schema for the "routingSimulation" model, go to https://omspoint.gadget.app/edit to view/edit your model in Gadget
// For more information on how to update this file http://docs.gadget.dev

export const schema: GadgetModel = {
  type: "gadget/model-schema/v1",
  storageKey: "routingSimulation",
  comment: "Simulation runs evaluating routing policy changes.",
  fields: {
    name: { type: "string", storageKey: "routingSimulationName" },
    results: { type: "json", storageKey: "routingSimulationResults" },
    routingPolicy: {
      type: "belongsTo",
      validations: { required: true },
      parent: { model: "routingPolicy" },
      storageKey: "routingSimulationPolicy",
    },
    scenario: {
      type: "json",
      storageKey: "routingSimulationScenario",
    },
  },
};
