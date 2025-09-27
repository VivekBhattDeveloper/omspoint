import type { GadgetModel } from "gadget-server";

// This file describes the schema for the "seller" model, go to https://omspoint.gadget.app/edit to view/edit your model in Gadget
// For more information on how to update this file http://docs.gadget.dev

export const schema: GadgetModel = {
  type: "gadget/model-schema/v1",
  storageKey: "oxXtCAxHIEXv",
  fields: {
    address: {
      type: "string",
      validations: { required: true },
      storageKey: "Nh5FY3MgBxT_::FGhxotHVVQwz",
    },
    city: {
      type: "string",
      validations: { required: true },
      storageKey: "-S_bd1hTn1mA::tWUDaZzrdK5s",
    },
    country: {
      type: "string",
      validations: { required: true },
      storageKey: "VxM_PZYkFlsk::fTDJZr9zgcTd",
    },
    email: {
      type: "email",
      validations: { required: true, unique: true },
      storageKey: "E24uCaIzU-64::SRTjnp5Y5Yez",
    },
    name: {
      type: "string",
      validations: { required: true, unique: true },
      storageKey: "5EqeL4YYbia0::b1bxq9JWZ9nK",
    },
    orders: {
      type: "hasMany",
      children: { model: "order", belongsToField: "seller" },
      storageKey: "XJNtyslgVfiC::PSzrpmwYxiwz",
    },
    phoneNumber: {
      type: "string",
      validations: { required: true },
      storageKey: "Ovsq-5ddzOHv::BJzBhb3rL5k2",
    },
    state: {
      type: "string",
      validations: { required: true },
      storageKey: "wxIcpDNfEZ5O::CmeHZVHKxk_L",
    },
    vendor: {
      type: "belongsTo",
      parent: { model: "vendor" },
      storageKey: "K1sKQC647W7o::crI3LykXnQFG",
    },
    zip: {
      type: "string",
      validations: { required: true },
      storageKey: "ed_SDYskTZMh::xj9IBjm4y_pV",
    },
  },
};
