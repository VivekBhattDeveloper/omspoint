import type { GadgetModel } from "gadget-server";

// This file describes the schema for the "routingPolicyVendor" model, go to https://omspoint.gadget.app/edit to view/edit your model in Gadget
// For more information on how to update this file http://docs.gadget.dev

export const schema: GadgetModel = {
  type: "gadget/model-schema/v1",
  storageKey: "RoutingPolicyVendorModel",
  comment:
    "Defines vendor specific configuration for a routing policy.",
  fields: {
    autoPauseThreshold: {
      type: "number",
      validations: { required: true },
      storageKey: "routingPolicyVendorAutoPause",
    },
    capacityPerHour: {
      type: "number",
      validations: { required: true },
      storageKey: "routingPolicyVendorCapacityPerHour",
    },
    currentLoadPercent: {
      type: "number",
      validations: { required: true },
      storageKey: "routingPolicyVendorCurrentLoad",
    },
    failoverPriority: {
      type: "number",
      validations: { required: true },
      storageKey: "routingPolicyVendorFailoverPriority",
    },
    health: {
      type: "enum",
      acceptMultipleSelections: false,
      acceptUnlistedOptions: false,
      options: ["healthy", "warning", "critical"],
      validations: { required: true },
      storageKey: "routingPolicyVendorHealth",
    },
    lastIncidentAt: {
      type: "dateTime",
      includeTime: true,
      storageKey: "routingPolicyVendorLastIncident",
    },
    region: {
      type: "string",
      validations: { required: true },
      storageKey: "routingPolicyVendorRegion",
    },
    routingPolicy: {
      type: "belongsTo",
      validations: { required: true },
      parent: { model: "routingPolicy" },
      storageKey: "routingPolicyVendorPolicy",
    },
    slaMinutes: {
      type: "number",
      validations: { required: true },
      storageKey: "routingPolicyVendorSlaMinutes",
    },
    specializations: {
      type: "json",
      default: "[]",
      storageKey: "routingPolicyVendorSpecializations",
    },
    vendor: {
      type: "belongsTo",
      validations: { required: true },
      parent: { model: "vendor" },
      storageKey: "routingPolicyVendorVendor",
    },
    weight: {
      type: "number",
      validations: { required: true },
      storageKey: "routingPolicyVendorWeight",
    },
  },
};
