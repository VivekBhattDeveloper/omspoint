import type { GadgetModel } from "gadget-server";

// This file describes the schema for the "payoutSchedule" model, go to https://omspoint.gadget.app/edit to view/edit your model in Gadget
// For more information on how to update this file http://docs.gadget.dev

export const schema: GadgetModel = {
  type: "gadget/model-schema/v1",
  storageKey: "payoutSchedule",
  comment: "Defines settlement cadence for a finance configuration.",
  fields: {
    cutoffTime: {
      type: "string",
      storageKey: "payoutScheduleCutoffTime",
    },
    financeConfig: {
      type: "belongsTo",
      validations: { required: true },
      parent: { model: "financeConfig" },
      storageKey: "payoutScheduleFinanceConfig",
    },
    frequency: {
      type: "enum",
      acceptMultipleSelections: false,
      acceptUnlistedOptions: false,
      options: ["weekly", "biweekly", "monthly", "custom"],
      validations: { required: true },
      storageKey: "payoutScheduleFrequency",
    },
    method: { type: "string", storageKey: "payoutScheduleMethod" },
    offsetDays: {
      type: "number",
      storageKey: "payoutScheduleOffsetDays",
    },
    status: {
      type: "enum",
      acceptMultipleSelections: false,
      acceptUnlistedOptions: false,
      options: ["active", "pilot", "paused"],
      storageKey: "payoutScheduleStatus",
    },
    timeZone: {
      type: "string",
      storageKey: "payoutScheduleTimeZone",
    },
  },
};
