import type { GadgetModel } from "gadget-server";

// This file describes the schema for the "vendorReturn" model, go to https://omspoint.gadget.app/edit to view/edit your model in Gadget
// For more information on how to update this file http://docs.gadget.dev

export const schema: GadgetModel = {
  type: "gadget/model-schema/v1",
  storageKey: "VpKHjQRiedSk",
  comment:
    "This model represents a vendor return, which is used to track and manage returns from vendors, including the status, reason, and disposition of the return.",
  fields: {
    channel: {
      type: "string",
      validations: { required: true },
      storageKey: "NexjAi9H1GZb",
    },
    courier: {
      type: "string",
      validations: { required: true },
      storageKey: "Kawol-StYDD8",
    },
    customerName: {
      type: "string",
      validations: { required: true },
      storageKey: "lwlKjwe2ReId",
    },
    customerRegion: {
      type: "string",
      validations: { required: true },
      storageKey: "olPUVMnyv2km",
    },
    disposition: {
      type: "enum",
      acceptMultipleSelections: false,
      acceptUnlistedOptions: false,
      options: ["restock", "reprint", "investigate", "refund"],
      validations: { required: true },
      storageKey: "ErEL2YTk-LY5",
    },
    issueSummary: {
      type: "richText",
      validations: { required: true },
      storageKey: "HtAuZFbMG8jV",
    },
    itemSku: {
      type: "string",
      validations: { required: true },
      storageKey: "oyclyPyX9r4U",
    },
    lastUpdate: {
      type: "dateTime",
      includeTime: true,
      validations: { required: true },
      storageKey: "KRXnFPKk5gy7",
    },
    ndrType: {
      type: "string",
      validations: { required: true },
      storageKey: "noJhkW3h65nz",
    },
    order: {
      type: "belongsTo",
      validations: { required: true },
      parent: { model: "order" },
      storageKey: "3lnYgM8wpqyS",
    },
    quantity: {
      type: "number",
      validations: { required: true },
      storageKey: "PQtL_gD4nCsI",
    },
    reasonCode: {
      type: "enum",
      acceptMultipleSelections: false,
      acceptUnlistedOptions: false,
      options: [
        "addressIssue",
        "damaged",
        "misprint",
        "lostInTransit",
        "customerRefused",
      ],
      validations: { required: true },
      storageKey: "Oqr2QstO7oqw",
    },
    rmaNumber: {
      type: "string",
      validations: { required: true, unique: true },
      storageKey: "OgOCH0uEoEUi",
    },
    slaDue: {
      type: "dateTime",
      includeTime: true,
      validations: { required: true },
      storageKey: "1x_qmpzmQiyU",
    },
    status: {
      type: "enum",
      acceptMultipleSelections: false,
      acceptUnlistedOptions: false,
      options: [
        "awaitingVendor",
        "inspectionPending",
        "restockPending",
        "reprintPending",
        "completed",
      ],
      validations: { required: true },
      storageKey: "Y_eTVKClmdG1",
    },
    trackingNumber: {
      type: "string",
      validations: { required: true },
      storageKey: "zitcKUUDfd8m",
    },
    value: {
      type: "number",
      validations: { required: true },
      storageKey: "66tWnEkjF0YF",
    },
  },
};
