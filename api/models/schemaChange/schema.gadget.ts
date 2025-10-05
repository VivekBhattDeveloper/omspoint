import type { GadgetModel } from "gadget-server";

// This file describes the schema for the "schemaChange" model, go to https://omspoint.gadget.app/edit to view/edit your model in Gadget
// For more information on how to update this file http://docs.gadget.dev

export const schema: GadgetModel = {
  type: "gadget/model-schema/v1",
  storageKey: "schemaChange",
  comment:
    "Proposed change to a catalog attribute requiring approval.",
  fields: {
    approvedAt: {
      type: "dateTime",
      includeTime: true,
      storageKey: "schemaChangeApprovedAt",
    },
    approvedBy: {
      type: "belongsTo",
      parent: { model: "user" },
      storageKey: "schemaChangeApprovedBy",
    },
    catalogAttribute: {
      type: "belongsTo",
      validations: { required: true },
      parent: { model: "catalogAttribute" },
      storageKey: "schemaChangeCatalogAttribute",
    },
    changeType: {
      type: "string",
      validations: { required: true },
      storageKey: "schemaChangeType",
    },
    diff: { type: "json", storageKey: "schemaChangeDiff" },
    notes: { type: "richText", storageKey: "schemaChangeNotes" },
    proposedAt: {
      type: "dateTime",
      includeTime: true,
      storageKey: "schemaChangeProposedAt",
    },
    proposedBy: {
      type: "belongsTo",
      parent: { model: "user" },
      storageKey: "schemaChangeProposedBy",
    },
    status: {
      type: "enum",
      acceptMultipleSelections: false,
      acceptUnlistedOptions: false,
      options: ["pending", "approved", "rejected"],
      validations: { required: true },
      storageKey: "schemaChangeStatus",
    },
  },
};
