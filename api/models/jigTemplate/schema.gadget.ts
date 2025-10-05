import type { GadgetModel } from "gadget-server";

// This file describes the schema for the "jigTemplate" model, go to https://omspoint.gadget.app/edit to view/edit your model in Gadget
// For more information on how to update this file http://docs.gadget.dev

export const schema: GadgetModel = {
  type: "gadget/model-schema/v1",
  storageKey: "jigTemplate",
  comment: "Physical jig template metadata for print production.",
  fields: {
    alignmentGuide: {
      type: "string",
      storageKey: "jigTemplateAlignmentGuide",
    },
    approvals: { type: "string", storageKey: "jigTemplateApprovals" },
    approvedSampleUrl: {
      type: "url",
      storageKey: "jigTemplateApprovedSampleUrl",
    },
    bedSize: { type: "string", storageKey: "jigTemplateBedSize" },
    fileUrl: { type: "url", storageKey: "jigTemplateFileUrl" },
    label: {
      type: "string",
      validations: { required: true },
      storageKey: "jigTemplateLabel",
    },
    printerDevice: {
      type: "belongsTo",
      validations: { required: true },
      parent: { model: "printerDevice" },
      storageKey: "jigTemplatePrinterDevice",
    },
    status: {
      type: "enum",
      acceptMultipleSelections: false,
      acceptUnlistedOptions: false,
      options: ["draft", "pending_qa", "approved"],
      validations: { required: true },
      storageKey: "jigTemplateStatus",
    },
    version: { type: "string", storageKey: "jigTemplateVersion" },
  },
};
