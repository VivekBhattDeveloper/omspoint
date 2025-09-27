import type { GadgetModel } from "gadget-server";

// This file describes the schema for the "vendor" model, go to https://omspoint.gadget.app/edit to view/edit your model in Gadget
// For more information on how to update this file http://docs.gadget.dev

export const schema: GadgetModel = {
  type: "gadget/model-schema/v1",
  storageKey: "Wh2zPyfnFA2F",
  fields: {
    address: {
      type: "string",
      validations: { required: true },
      storageKey: "SQWiDNhxnwIX::7wIRiEPDOP9L",
    },
    city: {
      type: "string",
      validations: { required: true },
      storageKey: "NmjbyQlFDRLD::1GfomYOu676m",
    },
    country: {
      type: "string",
      validations: { required: true },
      storageKey: "Hkw9WqscMPOR::4bCX0X8xQY6z",
    },
    email: {
      type: "email",
      validations: { required: true, unique: true },
      storageKey: "5qMDDe3OVgxZ::eFOXrv2tufoi",
    },
    name: {
      type: "string",
      validations: { required: true, unique: true },
      storageKey: "Q8j3B1UMFKzV::7MW-XMYK7yP6",
    },
    phoneNumber: {
      type: "string",
      validations: { required: true },
      storageKey: "kbH0bvaixgtU::WuoMBphNlgUw",
    },
    sellers: {
      type: "hasMany",
      children: { model: "seller", belongsToField: "vendor" },
      storageKey: "yUYuSX80XK75::nEWC6OVU7k0h",
    },
    state: {
      type: "string",
      validations: { required: true },
      storageKey: "yMf2aoFThUsR::E7iCPOI6kiGh",
    },
    zip: {
      type: "string",
      validations: { required: true },
      storageKey: "j1ceGbke5yO_::ifHPGmbP4iPR",
    },
  },
};
