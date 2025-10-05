import type { GadgetModel } from "gadget-server";

// This file describes the schema for the "controlCheckpoint" model, go to https://omspoint.gadget.app/edit to view/edit your model in Gadget
// For more information on how to update this file http://docs.gadget.dev

export const schema: GadgetModel = {
  type: "gadget/model-schema/v1",
  storageKey: "ControlCheckpointModel",
  comment:
    "Tracks control health checkpoints for compliance reporting.",
  fields: {
    control: {
      type: "string",
      storageKey: "controlCheckpointControl",
    },
    coverage: {
      type: "string",
      storageKey: "controlCheckpointCoverage",
    },
    lastValidated: {
      type: "dateTime",
      includeTime: true,
      storageKey: "controlCheckpointLastValidated",
    },
    name: {
      type: "string",
      validations: { required: true },
      storageKey: "controlCheckpointName",
    },
    notes: { type: "string", storageKey: "controlCheckpointNotes" },
    owner: { type: "string", storageKey: "controlCheckpointOwner" },
    status: {
      type: "enum",
      acceptMultipleSelections: false,
      acceptUnlistedOptions: false,
      options: ["met", "monitoring", "gaps"],
      validations: { required: true },
      storageKey: "controlCheckpointStatus",
    },
  },
};
