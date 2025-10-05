import type { GadgetModel } from "gadget-server";

// This file describes the schema for the "taxRule" model, go to https://omspoint.gadget.app/edit to view/edit your model in Gadget
// For more information on how to update this file http://docs.gadget.dev

export const schema: GadgetModel = {
  type: "gadget/model-schema/v1",
  storageKey: "taxRule",
  comment:
    "Jurisdiction-specific tax rule attached to a finance configuration.",
  fields: {
    financeConfig: {
      type: "belongsTo",
      validations: { required: true },
      parent: { model: "financeConfig" },
      storageKey: "taxRuleFinanceConfig",
    },
    jurisdiction: {
      type: "string",
      validations: { required: true },
      storageKey: "taxRuleJurisdiction",
    },
    notes: { type: "richText", storageKey: "taxRuleNotes" },
    owner: { type: "string", storageKey: "taxRuleOwner" },
    rate: { type: "number", storageKey: "taxRuleRate" },
    taxType: { type: "string", storageKey: "taxRuleType" },
    withholding: { type: "string", storageKey: "taxRuleWithholding" },
  },
};
