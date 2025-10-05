import type { GadgetModel } from "gadget-server";

// This file describes the schema for the "serviceMetric" model, go to https://omspoint.gadget.app/edit to view/edit your model in Gadget
// For more information on how to update this file http://docs.gadget.dev

export const schema: GadgetModel = {
  type: "gadget/model-schema/v1",
  storageKey: "serviceMetric",
  comment:
    "Operational metric snapshot for observability dashboards.",
  fields: {
    capturedAt: {
      type: "dateTime",
      includeTime: true,
      storageKey: "serviceMetricCapturedAt",
    },
    currentValue: {
      type: "number",
      storageKey: "serviceMetricCurrentValue",
    },
    direction: {
      type: "enum",
      acceptMultipleSelections: false,
      acceptUnlistedOptions: false,
      options: ["up", "down"],
      storageKey: "serviceMetricDirection",
    },
    metric: {
      type: "string",
      validations: { required: true },
      storageKey: "serviceMetricMetric",
    },
    serviceName: {
      type: "string",
      validations: { required: true },
      storageKey: "serviceMetricServiceName",
    },
    target: { type: "number", storageKey: "serviceMetricTarget" },
    trend: { type: "string", storageKey: "serviceMetricTrend" },
    unit: { type: "string", storageKey: "serviceMetricUnit" },
    window: { type: "string", storageKey: "serviceMetricWindow" },
  },
};
