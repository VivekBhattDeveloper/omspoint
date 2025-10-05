import type { GadgetModel } from "gadget-server";

// This file describes the schema for the "financeConfig" model, go to https://omspoint.gadget.app/edit to view/edit your model in Gadget
// For more information on how to update this file http://docs.gadget.dev

export const schema: GadgetModel = {
  type: "gadget/model-schema/v1",
  storageKey: "financeConfig",
  comment:
    "Finance configuration packages governing fees, taxes, and payouts.",
  fields: {
    appliesTo: { type: "json", storageKey: "financeConfigAppliesTo" },
    description: {
      type: "richText",
      storageKey: "financeConfigDescription",
    },
    effectiveAt: {
      type: "dateTime",
      includeTime: true,
      storageKey: "financeConfigEffectiveAt",
    },
    feeRules: {
      type: "hasMany",
      children: { model: "feeRule", belongsToField: "financeConfig" },
      storageKey: "financeConfigFeeRules",
    },
    name: {
      type: "string",
      validations: { required: true },
      storageKey: "financeConfigName",
    },
    payoutSchedules: {
      type: "hasMany",
      children: {
        model: "payoutSchedule",
        belongsToField: "financeConfig",
      },
      storageKey: "financeConfigPayoutSchedules",
    },
    publishedAt: {
      type: "dateTime",
      includeTime: true,
      storageKey: "financeConfigPublishedAt",
    },
    publishedBy: {
      type: "belongsTo",
      parent: { model: "user" },
      storageKey: "financeConfigPublishedBy",
    },
    status: {
      type: "enum",
      acceptMultipleSelections: false,
      acceptUnlistedOptions: false,
      options: ["draft", "active", "retired"],
      validations: { required: true },
      storageKey: "financeConfigStatus",
    },
    taxRules: {
      type: "hasMany",
      children: { model: "taxRule", belongsToField: "financeConfig" },
      storageKey: "financeConfigTaxRules",
    },
  },
};
