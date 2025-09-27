import type { GadgetModel } from "gadget-server";

// This file describes the schema for the "user" model, go to https://omspoint.gadget.app/edit to view/edit your model in Gadget
// For more information on how to update this file http://docs.gadget.dev

export const schema: GadgetModel = {
  type: "gadget/model-schema/v1",
  storageKey: "DataModel-AppAuth-User",
  fields: {
    email: {
      type: "email",
      validations: { required: true, unique: true },
      storageKey: "_XRrH9JcWzZv",
    },
    emailVerificationToken: {
      type: "string",
      storageKey: "qN473bNuH25K",
    },
    emailVerificationTokenExpiration: {
      type: "dateTime",
      includeTime: true,
      storageKey: "IW3wGJcISdMq",
    },
    emailVerified: {
      type: "boolean",
      default: false,
      storageKey: "uSZVT1DONikf",
    },
    firstName: { type: "string", storageKey: "Ltv8_RbXrS6F" },
    googleImageUrl: { type: "url", storageKey: "SBNvl6EqaL25" },
    googleProfileId: { type: "string", storageKey: "QoIpCXkWIypY" },
    lastName: { type: "string", storageKey: "_PWMZg7fyPJo" },
    lastSignedIn: {
      type: "dateTime",
      includeTime: true,
      storageKey: "PcHxKEfv9s5s",
    },
    password: {
      type: "password",
      validations: { strongPassword: true },
      storageKey: "C9fjg_70u5s2",
    },
    profilePicture: {
      type: "file",
      allowPublicAccess: true,
      storageKey: "_0j9BulGDDXf",
    },
    resetPasswordToken: {
      type: "string",
      storageKey: "7N_QkS-4rmwr",
    },
    resetPasswordTokenExpiration: {
      type: "dateTime",
      includeTime: true,
      storageKey: "qCpDJlVLN5eY",
    },
    roles: {
      type: "roleList",
      default: ["unauthenticated"],
      storageKey: "iNJXB3Cn0JA7",
    },
  },
};
