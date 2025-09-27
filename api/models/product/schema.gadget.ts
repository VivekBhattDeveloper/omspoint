import type { GadgetModel } from "gadget-server";

// This file describes the schema for the "product" model, go to https://omspoint.gadget.app/edit to view/edit your model in Gadget
// For more information on how to update this file http://docs.gadget.dev

export const schema: GadgetModel = {
  type: "gadget/model-schema/v1",
  storageKey: "0SzgrJUNFekm",
  fields: {
    order: {
      type: "belongsTo",
      parent: { model: "order" },
      storageKey: "wwZAYf4sXFFg::FnWCx6NKx-x8",
    },
    price: {
      type: "number",
      validations: { required: true },
      storageKey: "0srp2IfrbiDc::eALg0an8ug4p",
    },
    productDescription: {
      type: "richText",
      validations: { required: true },
      storageKey: "zeYOdqOhXIJi::0Agh7djSC-QJ",
    },
    productName: {
      type: "string",
      validations: { required: true },
      storageKey: "rOOYkkRoJTE2::RPg-oR2GS3AY",
    },
  },
};
