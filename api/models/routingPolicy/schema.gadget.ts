import type { GadgetModel } from "gadget-server";

// This file describes the schema for the "routingPolicy" model, go to https://omspoint.gadget.app/edit to view/edit your model in Gadget
// For more information on how to update this file http://docs.gadget.dev

export const schema: GadgetModel = {
  type: "gadget/model-schema/v1",
  storageKey: "routingPolicy",
  comment:
    "Defines routing policy configurations for order fulfillment orchestration.",
  fields: {
    allowPartialFulfillment: {
      type: "boolean",
      validations: { required: true },
      storageKey: "routingPolicyAllowPartial",
    },
    auditEntries: {
      type: "hasMany",
      children: {
        model: "routingPolicyAudit",
        belongsToField: "routingPolicy",
      },
      storageKey: "routingPolicyAuditEntries",
    },
    channel: {
      type: "string",
      validations: { required: true },
      storageKey: "routingPolicyChannel",
    },
    createdBy: {
      type: "belongsTo",
      parent: { model: "user" },
      storageKey: "routingPolicyCreatedBy",
    },
    description: {
      type: "richText",
      storageKey: "routingPolicyDescription",
    },
    effectiveAt: {
      type: "dateTime",
      includeTime: true,
      storageKey: "routingPolicyEffectiveAt",
    },
    failoverStrategy: {
      type: "enum",
      acceptMultipleSelections: false,
      acceptUnlistedOptions: false,
      options: ["cascading", "parallel", "round_robin"],
      validations: { required: true },
      storageKey: "routingPolicyFailoverStrategy",
    },
    maxLagMinutes: {
      type: "number",
      validations: { required: true },
      storageKey: "routingPolicyMaxLagMinutes",
    },
    name: {
      type: "string",
      validations: { required: true },
      storageKey: "routingPolicyName",
    },
    orchestrationLastSync: {
      type: "dateTime",
      includeTime: true,
      storageKey: "routingPolicyOrchestrationLastSync",
    },
    orchestrationStatus: {
      type: "enum",
      acceptMultipleSelections: false,
      acceptUnlistedOptions: false,
      options: ["synced", "pending", "error"],
      validations: { required: true },
      storageKey: "routingPolicyOrchestrationStatus",
    },
    region: {
      type: "string",
      validations: { required: true },
      storageKey: "routingPolicyRegion",
    },
    routingRules: {
      type: "hasMany",
      children: {
        model: "routingRule",
        belongsToField: "routingPolicy",
      },
      storageKey: "routingPolicyRoutingRules",
    },
    simulations: {
      type: "hasMany",
      children: {
        model: "routingSimulation",
        belongsToField: "routingPolicy",
      },
      storageKey: "routingPolicySimulations",
    },
    slaMinutes: {
      type: "number",
      validations: { required: true },
      storageKey: "routingPolicySlaMinutes",
    },
    slaTargets: {
      type: "hasMany",
      children: {
        model: "slaTarget",
        belongsToField: "routingPolicy",
      },
      storageKey: "routingPolicySlaTargets",
    },
    status: {
      type: "enum",
      acceptMultipleSelections: false,
      acceptUnlistedOptions: false,
      options: ["draft", "active", "retired"],
      validations: { required: true },
      storageKey: "routingPolicyStatus",
    },
    updatedBy: {
      type: "belongsTo",
      parent: { model: "user" },
      storageKey: "routingPolicyUpdatedBy",
    },
    vendorProfiles: {
      type: "hasMany",
      children: {
        model: "routingPolicyVendor",
        belongsToField: "routingPolicy",
      },
      storageKey: "routingPolicyVendorProfiles",
    },
  },
};
