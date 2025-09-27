import type { GadgetModel } from "gadget-server";

// This file describes the schema for the "printJob" model, go to https://omspoint.gadget.app/edit to view/edit your model in Gadget
// For more information on how to update this file http://docs.gadget.dev

export const schema: GadgetModel = {
  type: "gadget/model-schema/v1",
  storageKey: "LSKroMCo5zuf",
  fields: {
    order: {
      type: "belongsTo",
      parent: { model: "order" },
      storageKey: "vJGT4OssVhsJ::_89t38V7yeAd",
    },
    printDate: {
      type: "dateTime",
      includeTime: true,
      validations: { required: true },
      storageKey: "2KuBcFFFZ7AQ::3oYZYJhAM38e",
    },
    printJobId: {
      type: "string",
      validations: { required: true, unique: true },
      storageKey: "9RxrH5QlANW3::tUB5k60LRPbZ",
    },
    status: {
      type: "enum",
      acceptMultipleSelections: false,
      acceptUnlistedOptions: false,
      options: ["pending", "printing", "complete", "failed"],
      validations: { required: true },
      storageKey: "f2yeHOQSfh9O::Yon27QtYissI",
    },
  },
};
