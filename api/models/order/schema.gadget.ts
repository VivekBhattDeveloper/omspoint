import type { GadgetModel } from "gadget-server";

// This file describes the schema for the "order" model, go to https://omspoint.gadget.app/edit to view/edit your model in Gadget
// For more information on how to update this file http://docs.gadget.dev

export const schema: GadgetModel = {
  type: "gadget/model-schema/v1",
  storageKey: "rQFjv7w4ep2Y",
  fields: {
    financeReconciliation: {
      type: "hasOne",
      child: {
        model: "financeReconciliation",
        belongsToField: "order",
      },
      storageKey: "0rwZFubeimMc::Y5H9fWDKek9k",
    },
    orderDate: {
      type: "dateTime",
      includeTime: true,
      validations: { required: true },
      storageKey: "s0qAkyzBChWs::IvB8IxasZ4bO",
    },
    orderId: {
      type: "string",
      validations: { required: true, unique: true },
      storageKey: "3szvjn1AhgJV::65U4AK5-TmNC",
    },
    payment: {
      type: "hasOne",
      child: { model: "payment", belongsToField: "order" },
      storageKey: "0F8azczEbyo_::54MbKblC2IDV",
    },
    printJob: {
      type: "hasOne",
      child: { model: "printJob", belongsToField: "order" },
      storageKey: "akvQEY4QwYa4::v7ICzB5k8gxl",
    },
    products: {
      type: "hasMany",
      children: { model: "product", belongsToField: "order" },
      storageKey: "-zwnDPko1QiD::AiQcjLQDKrRX",
    },
    seller: {
      type: "belongsTo",
      parent: { model: "seller" },
      storageKey: "BdVvpGktBcMl::K1F6c16SKjlk",
    },
    shipment: {
      type: "hasOne",
      child: { model: "shipment", belongsToField: "order" },
      storageKey: "f1YhwBGt3hd4::MyCEEtAJoO3D",
    },
    status: {
      type: "enum",
      acceptMultipleSelections: false,
      acceptUnlistedOptions: false,
      options: ["pending", "shipped", "delivered", "cancelled"],
      validations: { required: true },
      storageKey: "LpYMqeV1y5U3::TfXeW6i5qBcz",
    },
    total: {
      type: "number",
      validations: { required: true },
      storageKey: "kXpB-MdKEsol::HkH5gHrVn1ve",
    },
  },
};
