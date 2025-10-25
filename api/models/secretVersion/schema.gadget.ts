import type { GadgetModel } from "gadget-server";

// This file describes the schema for the "secretVersion" model, go to https://omspoint.gadget.app/edit to view/edit your model in Gadget
// For more information on how to update this file http://docs.gadget.dev

export const schema: GadgetModel = {
  type: "gadget/model-schema/v1",
  storageKey: "secretVersion",
  comment: "Immutable version entry for a managed secret.",
  fields: {
    checksum: { type: "string", storageKey: "secretVersionChecksum" },
    createdBy: {
      type: "belongsTo",
      parent: { model: "user" },
      storageKey: "secretVersionCreatedBy",
    },
    material: {
      type: "encryptedString",
      storageKey: "secretVersionMaterial",
    },
    notes: { type: "richText", storageKey: "secretVersionNotes" },
    secret: {
      type: "belongsTo",
      validations: { required: true },
      parent: { model: "secret" },
      storageKey: "secretVersionSecret",
    },
    versionNumber: {
      type: "number",
      validations: { required: true },
      storageKey: "secretVersionNumber",
    },
  },
};
