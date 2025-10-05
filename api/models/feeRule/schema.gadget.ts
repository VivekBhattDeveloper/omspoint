import type { GadgetModel } from "gadget-server";

// This file describes the schema for the "feeRule" model, go to https://omspoint.gadget.app/edit to view/edit your model in Gadget
// For more information on how to update this file http://docs.gadget.dev

export const schema: GadgetModel = {
  type: "gadget/model-schema/v1",
  storageKey: "feeRule",
  comment: "Fee rule applied within a finance configuration.",
  fields: {
    basis: {
      type: "enum",
      acceptMultipleSelections: false,
      acceptUnlistedOptions: false,
      options: ["percentage", "flat"],
      validations: { required: true },
      storageKey: "feeRuleBasis",
    },
    currency: { type: "string", storageKey: "feeRuleCurrency" },
    financeConfig: {
      type: "belongsTo",
      validations: { required: true },
      parent: { model: "financeConfig" },
      storageKey: "feeRuleFinanceConfig",
    },
    fixedAmount: { type: "number", storageKey: "feeRuleFixedAmount" },
    max: { type: "number", storageKey: "feeRuleMaximum" },
    min: { type: "number", storageKey: "feeRuleMinimum" },
    rate: { type: "number", storageKey: "feeRuleRate" },
    type: {
      type: "enum",
      acceptMultipleSelections: false,
      acceptUnlistedOptions: false,
      options: ["commission", "processing", "service"],
      validations: { required: true },
      storageKey: "feeRuleType",
    },
  },
};
