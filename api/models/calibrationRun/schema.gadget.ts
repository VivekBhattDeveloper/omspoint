import type { GadgetModel } from "gadget-server";

// This file describes the schema for the "calibrationRun" model, go to https://omspoint.gadget.app/edit to view/edit your model in Gadget
// For more information on how to update this file http://docs.gadget.dev

export const schema: GadgetModel = {
  type: "gadget/model-schema/v1",
  storageKey: "calibrationRun",
  comment: "Calibration activity performed against a printer device.",
  fields: {
    measurements: {
      type: "json",
      storageKey: "calibrationRunMeasurements",
    },
    notes: { type: "richText", storageKey: "calibrationRunNotes" },
    performedAt: {
      type: "dateTime",
      includeTime: true,
      validations: { required: true },
      storageKey: "calibrationRunPerformedAt",
    },
    performedBy: {
      type: "string",
      storageKey: "calibrationRunPerformedBy",
    },
    printerDevice: {
      type: "belongsTo",
      validations: { required: true },
      parent: { model: "printerDevice" },
      storageKey: "calibrationRunPrinterDevice",
    },
    status: {
      type: "enum",
      acceptMultipleSelections: false,
      acceptUnlistedOptions: false,
      options: [
        "scheduled",
        "in_progress",
        "waiting_for_qa",
        "complete",
      ],
      validations: { required: true },
      storageKey: "calibrationRunStatus",
    },
  },
};
