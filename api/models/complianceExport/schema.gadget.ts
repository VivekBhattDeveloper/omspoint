import type { GadgetModel } from "gadget-server";

// This file describes the schema for the "complianceExport" model, go to https://omspoint.gadget.app/edit to view/edit your model in Gadget
// For more information on how to update this file http://docs.gadget.dev

export const schema: GadgetModel = {
  type: "gadget/model-schema/v1",
  storageKey: "ComplianceExportModel",
  comment: "Tracks compliance evidence exports and their status.",
  fields: {
    coverage: {
      type: "string",
      storageKey: "complianceExportCoverage",
    },
    description: {
      type: "string",
      storageKey: "complianceExportDescription",
    },
    formats: {
      type: "json",
      default: "[]",
      storageKey: "complianceExportFormats",
    },
    lastGenerated: {
      type: "dateTime",
      includeTime: true,
      storageKey: "complianceExportLastGenerated",
    },
    name: {
      type: "string",
      validations: { required: true },
      storageKey: "complianceExportName",
    },
    owner: { type: "string", storageKey: "complianceExportOwner" },
    status: {
      type: "enum",
      acceptMultipleSelections: false,
      acceptUnlistedOptions: false,
      options: ["ready", "in_progress"],
      validations: { required: true },
      storageKey: "complianceExportStatus",
    },
  },
};
