import type { GadgetModel } from "gadget-server";

// This file describes the schema for the "printerDevice" model, go to https://omspoint.gadget.app/edit to view/edit your model in Gadget
// For more information on how to update this file http://docs.gadget.dev

export const schema: GadgetModel = {
  type: "gadget/model-schema/v1",
  storageKey: "printerDevice",
  comment: "Physical printing device managed within the network.",
  fields: {
    calibrationRuns: {
      type: "hasMany",
      children: {
        model: "calibrationRun",
        belongsToField: "printerDevice",
      },
      storageKey: "printerDeviceCalibrationRuns",
    },
    jigTemplates: {
      type: "hasMany",
      children: {
        model: "jigTemplate",
        belongsToField: "printerDevice",
      },
      storageKey: "printerDeviceJigTemplates",
    },
    lastCalibrationAt: {
      type: "dateTime",
      includeTime: true,
      storageKey: "printerDeviceLastCalibrationAt",
    },
    location: { type: "string", storageKey: "printerDeviceLocation" },
    model: { type: "string", storageKey: "printerDeviceModel" },
    name: {
      type: "string",
      validations: { required: true },
      storageKey: "printerDeviceName",
    },
    printProfiles: {
      type: "hasMany",
      children: {
        model: "printProfile",
        belongsToField: "printerDevice",
      },
      storageKey: "printerDevicePrintProfiles",
    },
    serial: { type: "string", storageKey: "printerDeviceSerial" },
    status: {
      type: "enum",
      default: "active",
      acceptMultipleSelections: false,
      acceptUnlistedOptions: false,
      options: ["active", "maintenance", "retired"],
      validations: { required: true },
      storageKey: "printerDeviceStatus",
    },
    supportedMaterials: {
      type: "json",
      storageKey: "printerDeviceSupportedMaterials",
    },
    vendor: {
      type: "belongsTo",
      parent: { model: "vendor" },
      storageKey: "printerDeviceVendor",
    },
  },
};
