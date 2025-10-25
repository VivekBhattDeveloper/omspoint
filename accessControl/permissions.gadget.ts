import type { GadgetPermissions } from "gadget-server";

/**
 * This metadata describes the access control configuration available in your application.
 * Grants that are not defined here are set to false by default.
 *
 * View and edit your roles and permissions in the Gadget editor at https://omspoint.gadget.app/edit/settings/permissions
 */
export const permissions: GadgetPermissions = {
  type: "gadget/permissions/v1",
  roles: {
    "signed-in": {
      storageKey: "signed-in",
      default: {
        read: true,
        action: true,
      },
      models: {
        catalogValidation: {
          read: true,
          actions: {
            create: true,
            delete: true,
            update: true,
          },
        },
        courierFeedback: {
          read: true,
          actions: {
            create: true,
            delete: true,
            update: true,
          },
        },
        financeReconciliation: {
          read: true,
          actions: {
            create: true,
            delete: true,
            update: true,
          },
        },
        fulfillmentAction: {
          read: true,
          actions: {
            create: true,
            delete: true,
            update: true,
          },
        },
        integrationState: {
          read: true,
          actions: {
            create: true,
            delete: true,
            update: true,
          },
        },
        invite: {
          read: true,
          actions: {
            create: true,
            delete: true,
            resend: true,
          },
        },
        order: {
          read: true,
          actions: {
            create: true,
            delete: true,
            update: true,
          },
        },
        payment: {
          read: true,
          actions: {
            create: true,
            delete: true,
            update: true,
          },
        },
        printJob: {
          read: true,
          actions: {
            create: true,
            delete: true,
            update: true,
          },
        },
        product: {
          read: true,
          actions: {
            create: true,
            delete: true,
            update: true,
          },
        },
        seller: {
          read: true,
          actions: {
            create: true,
            delete: true,
            update: true,
          },
        },
        sellerProduct: {
          read: true,
          actions: {
            create: true,
            delete: true,
            update: true,
          },
        },
        sellerProductMedia: {
          read: true,
          actions: {
            create: true,
            delete: true,
            update: true,
          },
        },
        sellerProductOption: {
          read: true,
          actions: {
            create: true,
            delete: true,
            update: true,
          },
        },
        sellerProductVariant: {
          read: true,
          actions: {
            create: true,
            delete: true,
            update: true,
          },
        },
        sellerProductVariantMedia: {
          read: true,
          actions: {
            create: true,
            delete: true,
            update: true,
          },
        },
        shipment: {
          read: true,
          actions: {
            create: true,
            delete: true,
            update: true,
          },
        },
        shopifyApp: {
          read: true,
        },
        shopifyAppCredit: {
          read: true,
        },
        shopifyAppInstallation: {
          read: true,
        },
        shopifyAppPurchaseOneTime: {
          read: true,
        },
        shopifyAppSubscription: {
          read: true,
        },
        shopifyAppUsageRecord: {
          read: true,
        },
        shopifyArticle: {
          read: true,
        },
        shopifyBillingAddress: {
          read: true,
        },
        shopifyBlog: {
          read: true,
        },
        shopifyBulkOperation: {
          read: true,
        },
        shopifyCarrierService: {
          read: true,
        },
        shopifyCatalog: {
          read: true,
        },
        shopifyCheckout: {
          read: true,
        },
        shopifyCheckoutAppliedGiftCard: {
          read: true,
        },
        shopifyCheckoutLineItem: {
          read: true,
        },
        shopifyCheckoutShippingRate: {
          read: true,
        },
        shopifyCollect: {
          read: true,
        },
        shopifyCollection: {
          read: true,
        },
        shopifyComment: {
          read: true,
        },
        shopifyCustomer: {
          read: true,
        },
        shopifyCustomerAddress: {
          read: true,
        },
        shopifyDeliveryMethod: {
          read: true,
        },
        shopifyExchangeLineItem: {
          read: true,
        },
        shopifyFile: {
          read: true,
        },
        shopifyFulfillment: {
          read: true,
        },
        shopifyFulfillmentEvent: {
          read: true,
        },
        shopifyFulfillmentHold: {
          read: true,
        },
        shopifyFulfillmentLineItem: {
          read: true,
        },
        shopifyFulfillmentOrder: {
          read: true,
        },
        shopifyFulfillmentOrderDestination: {
          read: true,
        },
        shopifyFulfillmentOrderLineItem: {
          read: true,
        },
        shopifyFulfillmentOrderMerchantRequest: {
          read: true,
        },
        shopifyFulfillmentService: {
          read: true,
        },
        shopifyGdprRequest: {
          read: true,
        },
        shopifyInventoryItem: {
          read: true,
        },
        shopifyInventoryLevel: {
          read: true,
        },
        shopifyInventoryQuantity: {
          read: true,
        },
        shopifyLocation: {
          read: true,
        },
        shopifyOrder: {
          read: true,
        },
        shopifyOrderAdjustment: {
          read: true,
        },
        shopifyOrderLineItem: {
          read: true,
        },
        shopifyOrderTransaction: {
          read: true,
        },
        shopifyPage: {
          read: true,
        },
        shopifyPriceList: {
          read: true,
        },
        shopifyPriceListPrice: {
          read: true,
        },
        shopifyProduct: {
          read: true,
        },
        shopifyProductMedia: {
          read: true,
        },
        shopifyProductOption: {
          read: true,
        },
        shopifyProductVariant: {
          read: true,
        },
        shopifyProductVariantMedia: {
          read: true,
        },
        shopifyQuantityPriceBreak: {
          read: true,
        },
        shopifyRedirect: {
          read: true,
        },
        shopifyRefund: {
          read: true,
        },
        shopifyRefundDuty: {
          read: true,
        },
        shopifyRefundLineItem: {
          read: true,
        },
        shopifyReturn: {
          read: true,
        },
        shopifyReturnLineItem: {
          read: true,
        },
        shopifyReturnShippingFee: {
          read: true,
        },
        shopifyReverseDelivery: {
          read: true,
        },
        shopifyReverseDeliveryLineItem: {
          read: true,
        },
        shopifyReverseFulfillmentOrder: {
          read: true,
        },
        shopifyReverseFulfillmentOrderDisposition: {
          read: true,
        },
        shopifyReverseFulfillmentOrderLineItem: {
          read: true,
        },
        shopifyScriptTag: {
          read: true,
        },
        shopifyShippingAddress: {
          read: true,
        },
        shopifyShippingLine: {
          read: true,
        },
        shopifyShop: {
          read: true,
        },
        shopifySync: {
          read: true,
        },
        shopifyTenderTransaction: {
          read: true,
        },
        user: {
          read: true,
          actions: {
            changePassword: {
              filter: "accessControl/filters/user/tenant.gelly",
            },
            signIn: true,
            signOut: {
              filter: "accessControl/filters/user/tenant.gelly",
            },
            signUp: true,
            update: {
              filter: "accessControl/filters/user/tenant.gelly",
            },
          },
        },
        vendor: {
          read: true,
          actions: {
            create: true,
            delete: true,
            update: true,
          },
        },
        vendorProduct: {
          read: true,
          actions: {
            create: true,
            delete: true,
            update: true,
          },
        },
        vendorProductMedia: {
          read: true,
          actions: {
            create: true,
            delete: true,
            update: true,
          },
        },
        vendorProductOption: {
          read: true,
          actions: {
            create: true,
            delete: true,
            update: true,
          },
        },
        vendorProductVariant: {
          read: true,
          actions: {
            create: true,
            delete: true,
            update: true,
          },
        },
        vendorProductVariantMedia: {
          read: true,
          actions: {
            create: true,
            delete: true,
            update: true,
          },
        },
        vendorReturn: {
          read: true,
          actions: {
            create: true,
            delete: true,
            update: true,
          },
        },
      },
      actions: {
        scheduledShopifySync: true,
      },
    },
    "shopify-app-users": {
      storageKey: "Role-Shopify-App",
      models: {
        shopifyAppCredit: {
          read: {
            filter:
              "accessControl/filters/shopify/shopifyAppCredit.gelly",
          },
          actions: {
            create: true,
            delete: true,
            update: true,
          },
        },
        shopifyAppInstallation: {
          read: {
            filter:
              "accessControl/filters/shopify/shopifyAppInstallation.gelly",
          },
          actions: {
            create: true,
            delete: true,
            update: true,
          },
        },
        shopifyAppPurchaseOneTime: {
          read: {
            filter:
              "accessControl/filters/shopify/shopifyAppPurchaseOneTime.gelly",
          },
          actions: {
            create: true,
            delete: true,
            update: true,
          },
        },
        shopifyAppSubscription: {
          read: {
            filter:
              "accessControl/filters/shopify/shopifyAppSubscription.gelly",
          },
          actions: {
            create: true,
            delete: true,
            update: true,
          },
        },
        shopifyArticle: {
          read: {
            filter:
              "accessControl/filters/shopify/shopifyArticle.gelly",
          },
          actions: {
            create: true,
            delete: true,
            update: true,
          },
        },
        shopifyBillingAddress: {
          read: {
            filter:
              "accessControl/filters/shopify/shopifyBillingAddress.gelly",
          },
          actions: {
            create: true,
            delete: true,
            update: true,
          },
        },
        shopifyBlog: {
          read: {
            filter: "accessControl/filters/shopify/shopifyBlog.gelly",
          },
          actions: {
            create: true,
            delete: true,
            update: true,
          },
        },
        shopifyBulkOperation: {
          read: {
            filter:
              "accessControl/filters/shopify/shopifyBulkOperation.gelly",
          },
          actions: {
            cancel: true,
            complete: true,
            create: true,
            expire: true,
            fail: true,
            update: true,
          },
        },
        shopifyCarrierService: {
          read: {
            filter:
              "accessControl/filters/shopify/shopifyCarrierService.gelly",
          },
          actions: {
            create: true,
            delete: true,
            update: true,
          },
        },
        shopifyCatalog: {
          read: {
            filter:
              "accessControl/filters/shopify/shopifyCatalog.gelly",
          },
          actions: {
            create: true,
            delete: true,
            update: true,
          },
        },
        shopifyCheckout: {
          read: {
            filter:
              "accessControl/filters/shopify/shopifyCheckout.gelly",
          },
          actions: {
            create: true,
            delete: true,
            update: true,
          },
        },
        shopifyCheckoutAppliedGiftCard: {
          read: {
            filter:
              "accessControl/filters/shopify/shopifyCheckoutAppliedGiftCard.gelly",
          },
          actions: {
            create: true,
            delete: true,
            update: true,
          },
        },
        shopifyCheckoutLineItem: {
          read: {
            filter:
              "accessControl/filters/shopify/shopifyCheckoutLineItem.gelly",
          },
          actions: {
            create: true,
            delete: true,
            update: true,
          },
        },
        shopifyCheckoutShippingRate: {
          read: {
            filter:
              "accessControl/filters/shopify/shopifyCheckoutShippingRate.gelly",
          },
          actions: {
            create: true,
            delete: true,
            update: true,
          },
        },
        shopifyCollect: {
          read: {
            filter:
              "accessControl/filters/shopify/shopifyCollect.gelly",
          },
          actions: {
            create: true,
            delete: true,
            update: true,
          },
        },
        shopifyCollection: {
          read: {
            filter:
              "accessControl/filters/shopify/shopifyCollection.gelly",
          },
          actions: {
            create: true,
            delete: true,
            update: true,
          },
        },
        shopifyComment: {
          read: {
            filter:
              "accessControl/filters/shopify/shopifyComment.gelly",
          },
          actions: {
            create: true,
            delete: true,
            update: true,
          },
        },
        shopifyCustomer: {
          read: {
            filter:
              "accessControl/filters/shopify/shopifyCustomer.gelly",
          },
          actions: {
            create: true,
            delete: true,
            update: true,
          },
        },
        shopifyCustomerAddress: {
          read: {
            filter:
              "accessControl/filters/shopify/shopifyCustomerAddress.gelly",
          },
          actions: {
            create: true,
            delete: true,
            update: true,
          },
        },
        shopifyDeliveryMethod: {
          read: {
            filter:
              "accessControl/filters/shopify/shopifyDeliveryMethod.gelly",
          },
          actions: {
            create: true,
            delete: true,
            update: true,
          },
        },
        shopifyExchangeLineItem: {
          read: {
            filter:
              "accessControl/filters/shopify/shopifyExchangeLineItem.gelly",
          },
          actions: {
            create: true,
            delete: true,
            update: true,
          },
        },
        shopifyFile: {
          read: {
            filter: "accessControl/filters/shopify/shopifyFile.gelly",
          },
          actions: {
            create: true,
            delete: true,
            update: true,
          },
        },
        shopifyFulfillment: {
          read: {
            filter:
              "accessControl/filters/shopify/shopifyFulfillment.gelly",
          },
          actions: {
            create: true,
            delete: true,
            update: true,
          },
        },
        shopifyFulfillmentEvent: {
          read: {
            filter:
              "accessControl/filters/shopify/shopifyFulfillmentEvent.gelly",
          },
          actions: {
            create: true,
            delete: true,
            update: true,
          },
        },
        shopifyFulfillmentHold: {
          read: {
            filter:
              "accessControl/filters/shopify/shopifyFulfillmentHold.gelly",
          },
          actions: {
            create: true,
            delete: true,
            update: true,
          },
        },
        shopifyFulfillmentLineItem: {
          read: {
            filter:
              "accessControl/filters/shopify/shopifyFulfillmentLineItem.gelly",
          },
          actions: {
            create: true,
            delete: true,
            update: true,
          },
        },
        shopifyFulfillmentOrder: {
          read: {
            filter:
              "accessControl/filters/shopify/shopifyFulfillmentOrder.gelly",
          },
          actions: {
            create: true,
            delete: true,
            update: true,
          },
        },
        shopifyFulfillmentOrderDestination: {
          read: {
            filter:
              "accessControl/filters/shopify/shopifyFulfillmentOrderDestination.gelly",
          },
          actions: {
            create: true,
            delete: true,
            update: true,
          },
        },
        shopifyFulfillmentOrderLineItem: {
          read: {
            filter:
              "accessControl/filters/shopify/shopifyFulfillmentOrderLineItem.gelly",
          },
          actions: {
            create: true,
            delete: true,
            update: true,
          },
        },
        shopifyFulfillmentOrderMerchantRequest: {
          read: {
            filter:
              "accessControl/filters/shopify/shopifyFulfillmentOrderMerchantRequest.gelly",
          },
          actions: {
            create: true,
            delete: true,
            update: true,
          },
        },
        shopifyFulfillmentService: {
          read: {
            filter:
              "accessControl/filters/shopify/shopifyFulfillmentService.gelly",
          },
          actions: {
            create: true,
            delete: true,
            update: true,
          },
        },
        shopifyGdprRequest: {
          read: {
            filter:
              "accessControl/filters/shopify/shopifyGdprRequest.gelly",
          },
          actions: {
            create: true,
            update: true,
          },
        },
        shopifyInventoryItem: {
          read: {
            filter:
              "accessControl/filters/shopify/shopifyInventoryItem.gelly",
          },
          actions: {
            create: true,
            delete: true,
            update: true,
          },
        },
        shopifyInventoryLevel: {
          read: {
            filter:
              "accessControl/filters/shopify/shopifyInventoryLevel.gelly",
          },
          actions: {
            create: true,
            delete: true,
            update: true,
          },
        },
        shopifyInventoryQuantity: {
          read: {
            filter:
              "accessControl/filters/shopify/shopifyInventoryQuantity.gelly",
          },
          actions: {
            create: true,
            delete: true,
            update: true,
          },
        },
        shopifyLocation: {
          read: {
            filter:
              "accessControl/filters/shopify/shopifyLocation.gelly",
          },
          actions: {
            create: true,
            delete: true,
            update: true,
          },
        },
        shopifyOrder: {
          read: {
            filter:
              "accessControl/filters/shopify/shopifyOrder.gelly",
          },
          actions: {
            create: true,
            delete: true,
            update: true,
          },
        },
        shopifyOrderAdjustment: {
          read: {
            filter:
              "accessControl/filters/shopify/shopifyOrderAdjustment.gelly",
          },
          actions: {
            create: true,
            delete: true,
            update: true,
          },
        },
        shopifyOrderLineItem: {
          read: {
            filter:
              "accessControl/filters/shopify/shopifyOrderLineItem.gelly",
          },
          actions: {
            create: true,
            delete: true,
            update: true,
          },
        },
        shopifyOrderTransaction: {
          read: {
            filter:
              "accessControl/filters/shopify/shopifyOrderTransaction.gelly",
          },
          actions: {
            create: true,
            delete: true,
            update: true,
          },
        },
        shopifyPage: {
          read: {
            filter: "accessControl/filters/shopify/shopifyPage.gelly",
          },
          actions: {
            create: true,
            delete: true,
            update: true,
          },
        },
        shopifyPriceList: {
          read: {
            filter:
              "accessControl/filters/shopify/shopifyPriceList.gelly",
          },
          actions: {
            create: true,
            delete: true,
            update: true,
          },
        },
        shopifyPriceListPrice: {
          read: {
            filter:
              "accessControl/filters/shopify/shopifyPriceListPrice.gelly",
          },
          actions: {
            create: true,
            delete: true,
            update: true,
          },
        },
        shopifyProduct: {
          read: {
            filter:
              "accessControl/filters/shopify/shopifyProduct.gelly",
          },
          actions: {
            create: true,
            delete: true,
            update: true,
          },
        },
        shopifyProductMedia: {
          read: {
            filter:
              "accessControl/filters/shopify/shopifyProductMedia.gelly",
          },
          actions: {
            create: true,
            delete: true,
            update: true,
          },
        },
        shopifyProductOption: {
          read: {
            filter:
              "accessControl/filters/shopify/shopifyProductOption.gelly",
          },
          actions: {
            create: true,
            delete: true,
            update: true,
          },
        },
        shopifyProductVariant: {
          read: {
            filter:
              "accessControl/filters/shopify/shopifyProductVariant.gelly",
          },
          actions: {
            create: true,
            delete: true,
            update: true,
          },
        },
        shopifyProductVariantMedia: {
          read: {
            filter:
              "accessControl/filters/shopify/shopifyProductVariantMedia.gelly",
          },
          actions: {
            create: true,
            delete: true,
            update: true,
          },
        },
        shopifyQuantityPriceBreak: {
          read: {
            filter:
              "accessControl/filters/shopify/shopifyQuantityPriceBreak.gelly",
          },
          actions: {
            create: true,
            delete: true,
            update: true,
          },
        },
        shopifyRedirect: {
          read: {
            filter:
              "accessControl/filters/shopify/shopifyRedirect.gelly",
          },
          actions: {
            create: true,
            delete: true,
            update: true,
          },
        },
        shopifyRefund: {
          read: {
            filter:
              "accessControl/filters/shopify/shopifyRefund.gelly",
          },
          actions: {
            create: true,
            delete: true,
            update: true,
          },
        },
        shopifyRefundDuty: {
          read: {
            filter:
              "accessControl/filters/shopify/shopifyRefundDuty.gelly",
          },
          actions: {
            create: true,
            delete: true,
            update: true,
          },
        },
        shopifyRefundLineItem: {
          read: {
            filter:
              "accessControl/filters/shopify/shopifyRefundLineItem.gelly",
          },
          actions: {
            create: true,
            delete: true,
            update: true,
          },
        },
        shopifyReturn: {
          read: {
            filter:
              "accessControl/filters/shopify/shopifyReturn.gelly",
          },
          actions: {
            create: true,
            delete: true,
            update: true,
          },
        },
        shopifyReturnLineItem: {
          read: {
            filter:
              "accessControl/filters/shopify/shopifyReturnLineItem.gelly",
          },
          actions: {
            create: true,
            delete: true,
            update: true,
          },
        },
        shopifyReturnShippingFee: {
          read: {
            filter:
              "accessControl/filters/shopify/shopifyReturnShippingFee.gelly",
          },
          actions: {
            create: true,
            delete: true,
            update: true,
          },
        },
        shopifyReverseDelivery: {
          read: {
            filter:
              "accessControl/filters/shopify/shopifyReverseDelivery.gelly",
          },
          actions: {
            create: true,
            delete: true,
            update: true,
          },
        },
        shopifyReverseDeliveryLineItem: {
          read: {
            filter:
              "accessControl/filters/shopify/shopifyReverseDeliveryLineItem.gelly",
          },
          actions: {
            create: true,
            delete: true,
            update: true,
          },
        },
        shopifyReverseFulfillmentOrder: {
          read: {
            filter:
              "accessControl/filters/shopify/shopifyReverseFulfillmentOrder.gelly",
          },
          actions: {
            create: true,
            delete: true,
            update: true,
          },
        },
        shopifyReverseFulfillmentOrderDisposition: {
          read: {
            filter:
              "accessControl/filters/shopify/shopifyReverseFulfillmentOrderDisposition.gelly",
          },
          actions: {
            create: true,
            delete: true,
            update: true,
          },
        },
        shopifyReverseFulfillmentOrderLineItem: {
          read: {
            filter:
              "accessControl/filters/shopify/shopifyReverseFulfillmentOrderLineItem.gelly",
          },
          actions: {
            create: true,
            delete: true,
            update: true,
          },
        },
        shopifyScriptTag: {
          read: {
            filter:
              "accessControl/filters/shopify/shopifyScriptTag.gelly",
          },
          actions: {
            create: true,
            delete: true,
            update: true,
          },
        },
        shopifyShippingAddress: {
          read: {
            filter:
              "accessControl/filters/shopify/shopifyShippingAddress.gelly",
          },
          actions: {
            create: true,
            delete: true,
            update: true,
          },
        },
        shopifyShippingLine: {
          read: {
            filter:
              "accessControl/filters/shopify/shopifyShippingLine.gelly",
          },
          actions: {
            create: true,
            delete: true,
            update: true,
          },
        },
        shopifyShop: {
          read: {
            filter: "accessControl/filters/shopify/shopifyShop.gelly",
          },
          actions: {
            install: true,
            reinstall: true,
            uninstall: true,
            update: true,
          },
        },
        shopifySync: {
          read: {
            filter: "accessControl/filters/shopify/shopifySync.gelly",
          },
          actions: {
            abort: true,
            complete: true,
            error: true,
            run: true,
          },
        },
        shopifyTenderTransaction: {
          read: {
            filter:
              "accessControl/filters/shopify/shopifyTenderTransaction.gelly",
          },
          actions: {
            create: true,
            delete: true,
            update: true,
          },
        },
      },
      actions: {
        scheduledShopifySync: true,
      },
    },
    "shopify-storefront-customers": {
      storageKey: "Role-Shopify-Customer",
    },
    unauthenticated: {
      storageKey: "unauthenticated",
      models: {
        seller: {
          read: true,
        },
        user: {
          actions: {
            resetPassword: true,
            sendResetPassword: true,
            sendVerifyEmail: true,
            signIn: true,
            signUp: true,
            verifyEmail: true,
          },
        },
        vendor: {
          read: true,
        },
      },
    },
    Vendor: {
      storageKey: "3tijEwgZxlUR",
      default: {
        read: true,
        action: true,
      },
      models: {
        alert: {
          read: true,
        },
        approvalRequest: {
          read: true,
        },
        attributeOption: {
          read: true,
        },
        auditEvent: {
          read: true,
        },
        calibrationRun: {
          read: true,
        },
        catalogAttribute: {
          read: true,
        },
        catalogValidation: {
          read: true,
          actions: {
            create: true,
            delete: true,
            update: true,
          },
        },
        complianceExport: {
          read: true,
        },
        controlCheckpoint: {
          read: true,
        },
        courierFeedback: {
          read: true,
          actions: {
            create: true,
            delete: true,
            update: true,
          },
        },
        design: {
          read: true,
          actions: {
            create: true,
            delete: true,
            update: true,
          },
        },
        featureFlag: {
          read: true,
        },
        feeRule: {
          read: true,
        },
        financeConfig: {
          read: true,
        },
        financeReconciliation: {
          read: true,
          actions: {
            create: true,
            delete: true,
            update: true,
          },
        },
        fulfillmentAction: {
          read: true,
          actions: {
            create: true,
            delete: true,
            update: true,
          },
        },
        incident: {
          read: true,
        },
        integration: {
          read: true,
        },
        integrationCredential: {
          read: true,
        },
        integrationState: {
          read: true,
          actions: {
            create: true,
            delete: true,
            update: true,
          },
        },
        invite: {
          read: true,
          actions: {
            create: true,
            delete: true,
            resend: true,
          },
        },
        jigTemplate: {
          read: true,
        },
        logForwarder: {
          read: true,
        },
        membership: {
          read: true,
        },
        order: {
          read: true,
          actions: {
            create: true,
            delete: true,
            update: true,
          },
        },
        organization: {
          read: true,
        },
        payment: {
          read: true,
          actions: {
            create: true,
            delete: true,
            update: true,
          },
        },
        payoutSchedule: {
          read: true,
        },
        printerDevice: {
          read: true,
        },
        printJob: {
          read: true,
          actions: {
            create: true,
            delete: true,
            update: true,
          },
        },
        printProfile: {
          read: true,
        },
        product: {
          read: true,
          actions: {
            create: true,
            delete: true,
            update: true,
          },
        },
        reportDefinition: {
          read: true,
        },
        reportRun: {
          read: true,
        },
        routingPolicy: {
          read: true,
        },
        routingPolicyAudit: {
          read: true,
        },
        routingPolicyVendor: {
          read: true,
        },
        routingRule: {
          read: true,
        },
        routingSimulation: {
          read: true,
        },
        scheduledReport: {
          read: true,
        },
        schemaChange: {
          read: true,
        },
        secret: {
          read: true,
        },
        secretVersion: {
          read: true,
        },
        seller: {
          read: true,
          actions: {
            create: true,
            delete: true,
            update: true,
          },
        },
        sellerProduct: {
          read: true,
          actions: {
            create: true,
            delete: true,
            update: true,
          },
        },
        sellerProductMedia: {
          read: true,
          actions: {
            create: true,
            delete: true,
            update: true,
          },
        },
        sellerProductOption: {
          read: true,
          actions: {
            create: true,
            delete: true,
            update: true,
          },
        },
        sellerProductVariant: {
          read: true,
          actions: {
            create: true,
            delete: true,
            update: true,
          },
        },
        sellerProductVariantMedia: {
          read: true,
          actions: {
            create: true,
            delete: true,
            update: true,
          },
        },
        serviceMetric: {
          read: true,
        },
        session: {
          read: true,
        },
        shipment: {
          read: true,
          actions: {
            create: true,
            delete: true,
            update: true,
          },
        },
        shopifyApp: {
          read: true,
          actions: {
            create: true,
            delete: true,
            update: true,
          },
        },
        shopifyAppCredit: {
          read: true,
          actions: {
            create: true,
            delete: true,
            update: true,
          },
        },
        shopifyAppInstallation: {
          read: true,
          actions: {
            create: true,
            delete: true,
            update: true,
          },
        },
        shopifyAppPurchaseOneTime: {
          read: true,
          actions: {
            create: true,
            delete: true,
            update: true,
          },
        },
        shopifyAppSubscription: {
          read: true,
          actions: {
            create: true,
            delete: true,
            update: true,
          },
        },
        shopifyAppUsageRecord: {
          read: true,
          actions: {
            create: true,
            delete: true,
            update: true,
          },
        },
        shopifyArticle: {
          read: true,
          actions: {
            create: true,
            delete: true,
            update: true,
          },
        },
        shopifyBillingAddress: {
          read: true,
          actions: {
            create: true,
            delete: true,
            update: true,
          },
        },
        shopifyBlog: {
          read: true,
          actions: {
            create: true,
            delete: true,
            update: true,
          },
        },
        shopifyBulkOperation: {
          read: true,
          actions: {
            cancel: true,
            complete: true,
            create: true,
            expire: true,
            fail: true,
            update: true,
          },
        },
        shopifyCarrierService: {
          read: true,
          actions: {
            create: true,
            delete: true,
            update: true,
          },
        },
        shopifyCatalog: {
          read: true,
          actions: {
            create: true,
            delete: true,
            update: true,
          },
        },
        shopifyCheckout: {
          read: true,
          actions: {
            create: true,
            delete: true,
            update: true,
          },
        },
        shopifyCheckoutAppliedGiftCard: {
          read: true,
          actions: {
            create: true,
            delete: true,
            update: true,
          },
        },
        shopifyCheckoutLineItem: {
          read: true,
          actions: {
            create: true,
            delete: true,
            update: true,
          },
        },
        shopifyCheckoutShippingRate: {
          read: true,
          actions: {
            create: true,
            delete: true,
            update: true,
          },
        },
        shopifyCollect: {
          read: true,
          actions: {
            create: true,
            delete: true,
            update: true,
          },
        },
        shopifyCollection: {
          read: true,
          actions: {
            create: true,
            delete: true,
            update: true,
          },
        },
        shopifyComment: {
          read: true,
          actions: {
            create: true,
            delete: true,
            update: true,
          },
        },
        shopifyCustomer: {
          read: true,
          actions: {
            create: true,
            delete: true,
            update: true,
          },
        },
        shopifyCustomerAddress: {
          read: true,
          actions: {
            create: true,
            delete: true,
            update: true,
          },
        },
        shopifyDeliveryMethod: {
          read: true,
          actions: {
            create: true,
            delete: true,
            update: true,
          },
        },
        shopifyExchangeLineItem: {
          read: true,
          actions: {
            create: true,
            delete: true,
            update: true,
          },
        },
        shopifyFile: {
          read: true,
          actions: {
            create: true,
            delete: true,
            update: true,
          },
        },
        shopifyFulfillment: {
          read: true,
          actions: {
            create: true,
            delete: true,
            update: true,
          },
        },
        shopifyFulfillmentEvent: {
          read: true,
          actions: {
            create: true,
            delete: true,
            update: true,
          },
        },
        shopifyFulfillmentHold: {
          read: true,
          actions: {
            create: true,
            delete: true,
            update: true,
          },
        },
        shopifyFulfillmentLineItem: {
          read: true,
          actions: {
            create: true,
            delete: true,
            update: true,
          },
        },
        shopifyFulfillmentOrder: {
          read: true,
          actions: {
            create: true,
            delete: true,
            update: true,
          },
        },
        shopifyFulfillmentOrderDestination: {
          read: true,
          actions: {
            create: true,
            delete: true,
            update: true,
          },
        },
        shopifyFulfillmentOrderLineItem: {
          read: true,
          actions: {
            create: true,
            delete: true,
            update: true,
          },
        },
        shopifyFulfillmentOrderMerchantRequest: {
          read: true,
          actions: {
            create: true,
            delete: true,
            update: true,
          },
        },
        shopifyFulfillmentService: {
          read: true,
          actions: {
            create: true,
            delete: true,
            update: true,
          },
        },
        shopifyGdprRequest: {
          read: true,
          actions: {
            create: true,
            update: true,
          },
        },
        shopifyInventoryItem: {
          read: true,
          actions: {
            create: true,
            delete: true,
            update: true,
          },
        },
        shopifyInventoryLevel: {
          read: true,
          actions: {
            create: true,
            delete: true,
            update: true,
          },
        },
        shopifyInventoryQuantity: {
          read: true,
          actions: {
            create: true,
            delete: true,
            update: true,
          },
        },
        shopifyLocation: {
          read: true,
          actions: {
            create: true,
            delete: true,
            update: true,
          },
        },
        shopifyOrder: {
          read: true,
          actions: {
            create: true,
            delete: true,
            update: true,
          },
        },
        shopifyOrderAdjustment: {
          read: true,
          actions: {
            create: true,
            delete: true,
            update: true,
          },
        },
        shopifyOrderLineItem: {
          read: true,
          actions: {
            create: true,
            delete: true,
            update: true,
          },
        },
        shopifyOrderTransaction: {
          read: true,
          actions: {
            create: true,
            delete: true,
            update: true,
          },
        },
        shopifyPage: {
          read: true,
          actions: {
            create: true,
            delete: true,
            update: true,
          },
        },
        shopifyPriceList: {
          read: true,
          actions: {
            create: true,
            delete: true,
            update: true,
          },
        },
        shopifyPriceListPrice: {
          read: true,
          actions: {
            create: true,
            delete: true,
            update: true,
          },
        },
        shopifyProduct: {
          read: true,
          actions: {
            create: true,
            delete: true,
            update: true,
          },
        },
        shopifyProductMedia: {
          read: true,
          actions: {
            create: true,
            delete: true,
            update: true,
          },
        },
        shopifyProductOption: {
          read: true,
          actions: {
            create: true,
            delete: true,
            update: true,
          },
        },
        shopifyProductVariant: {
          read: true,
          actions: {
            create: true,
            delete: true,
            update: true,
          },
        },
        shopifyProductVariantMedia: {
          read: true,
          actions: {
            create: true,
            delete: true,
            update: true,
          },
        },
        shopifyQuantityPriceBreak: {
          read: true,
          actions: {
            create: true,
            delete: true,
            update: true,
          },
        },
        shopifyRedirect: {
          read: true,
          actions: {
            create: true,
            delete: true,
            update: true,
          },
        },
        shopifyRefund: {
          read: true,
          actions: {
            create: true,
            delete: true,
            update: true,
          },
        },
        shopifyRefundDuty: {
          read: true,
          actions: {
            create: true,
            delete: true,
            update: true,
          },
        },
        shopifyRefundLineItem: {
          read: true,
          actions: {
            create: true,
            delete: true,
            update: true,
          },
        },
        shopifyReturn: {
          read: true,
          actions: {
            create: true,
            delete: true,
            update: true,
          },
        },
        shopifyReturnLineItem: {
          read: true,
          actions: {
            create: true,
            delete: true,
            update: true,
          },
        },
        shopifyReturnShippingFee: {
          read: true,
          actions: {
            create: true,
            delete: true,
            update: true,
          },
        },
        shopifyReverseDelivery: {
          read: true,
          actions: {
            create: true,
            delete: true,
            update: true,
          },
        },
        shopifyReverseDeliveryLineItem: {
          read: true,
          actions: {
            create: true,
            delete: true,
            update: true,
          },
        },
        shopifyReverseFulfillmentOrder: {
          read: true,
          actions: {
            create: true,
            delete: true,
            update: true,
          },
        },
        shopifyReverseFulfillmentOrderDisposition: {
          read: true,
          actions: {
            create: true,
            delete: true,
            update: true,
          },
        },
        shopifyReverseFulfillmentOrderLineItem: {
          read: true,
          actions: {
            create: true,
            delete: true,
            update: true,
          },
        },
        shopifyScriptTag: {
          read: true,
          actions: {
            create: true,
            delete: true,
            update: true,
          },
        },
        shopifyShippingAddress: {
          read: true,
          actions: {
            create: true,
            delete: true,
            update: true,
          },
        },
        shopifyShippingLine: {
          read: true,
          actions: {
            create: true,
            delete: true,
            update: true,
          },
        },
        shopifyShop: {
          read: true,
          actions: {
            install: true,
            reinstall: true,
            uninstall: true,
            update: true,
          },
        },
        shopifySync: {
          read: true,
          actions: {
            abort: true,
            complete: true,
            error: true,
            run: true,
          },
        },
        shopifyTenderTransaction: {
          read: true,
          actions: {
            create: true,
            delete: true,
            update: true,
          },
        },
        slaTarget: {
          read: true,
        },
        taxRule: {
          read: true,
        },
        tenantRole: {
          read: true,
        },
        user: {
          read: true,
          actions: {
            changePassword: true,
            delete: true,
            resetPassword: true,
            sendResetPassword: true,
            sendVerifyEmail: true,
            signIn: true,
            signOut: true,
            signUp: true,
            update: true,
            verifyEmail: true,
          },
        },
        vendor: {
          read: true,
          actions: {
            create: true,
            delete: true,
            update: true,
          },
        },
        vendorProduct: {
          read: true,
          actions: {
            create: true,
            delete: true,
            update: true,
          },
        },
        vendorProductMedia: {
          read: true,
          actions: {
            create: true,
            delete: true,
            update: true,
          },
        },
        vendorProductOption: {
          read: true,
          actions: {
            create: true,
            delete: true,
            update: true,
          },
        },
        vendorProductVariant: {
          read: true,
          actions: {
            create: true,
            delete: true,
            update: true,
          },
        },
        vendorProductVariantMedia: {
          read: true,
          actions: {
            create: true,
            delete: true,
            update: true,
          },
        },
        vendorReturn: {
          read: true,
          actions: {
            create: true,
            delete: true,
            update: true,
          },
        },
        webhookEndpoint: {
          read: true,
        },
        workspace: {
          read: true,
        },
      },
      actions: {
        scheduledShopifySync: true,
      },
    },
    Seller: {
      storageKey: "_eSe2T5A-5od",
      default: {
        read: true,
        action: true,
      },
      models: {
        alert: {
          read: true,
        },
        approvalRequest: {
          read: true,
        },
        attributeOption: {
          read: true,
        },
        auditEvent: {
          read: true,
        },
        calibrationRun: {
          read: true,
        },
        catalogAttribute: {
          read: true,
        },
        catalogValidation: {
          read: true,
          actions: {
            create: true,
            delete: true,
            update: true,
          },
        },
        complianceExport: {
          read: true,
        },
        controlCheckpoint: {
          read: true,
        },
        courierFeedback: {
          read: true,
          actions: {
            create: true,
            delete: true,
            update: true,
          },
        },
        design: {
          read: true,
          actions: {
            create: true,
            delete: true,
            update: true,
          },
        },
        featureFlag: {
          read: true,
        },
        feeRule: {
          read: true,
        },
        financeConfig: {
          read: true,
        },
        financeReconciliation: {
          read: true,
          actions: {
            create: true,
            delete: true,
            update: true,
          },
        },
        fulfillmentAction: {
          read: true,
          actions: {
            create: true,
            delete: true,
            update: true,
          },
        },
        incident: {
          read: true,
        },
        integration: {
          read: true,
        },
        integrationCredential: {
          read: true,
        },
        integrationState: {
          read: true,
          actions: {
            create: true,
            delete: true,
            update: true,
          },
        },
        invite: {
          read: true,
          actions: {
            create: true,
            delete: true,
            resend: true,
          },
        },
        jigTemplate: {
          read: true,
        },
        logForwarder: {
          read: true,
        },
        membership: {
          read: true,
        },
        order: {
          read: true,
          actions: {
            create: true,
            delete: true,
            update: true,
          },
        },
        organization: {
          read: true,
        },
        payment: {
          read: true,
          actions: {
            create: true,
            delete: true,
            update: true,
          },
        },
        payoutSchedule: {
          read: true,
        },
        printerDevice: {
          read: true,
        },
        printJob: {
          read: true,
          actions: {
            create: true,
            delete: true,
            update: true,
          },
        },
        printProfile: {
          read: true,
        },
        product: {
          read: true,
          actions: {
            create: true,
            delete: true,
            update: true,
          },
        },
        reportDefinition: {
          read: true,
        },
        reportRun: {
          read: true,
        },
        routingPolicy: {
          read: true,
        },
        routingPolicyAudit: {
          read: true,
        },
        routingPolicyVendor: {
          read: true,
        },
        routingRule: {
          read: true,
        },
        routingSimulation: {
          read: true,
        },
        scheduledReport: {
          read: true,
        },
        schemaChange: {
          read: true,
        },
        secret: {
          read: true,
        },
        secretVersion: {
          read: true,
        },
        seller: {
          read: true,
          actions: {
            create: true,
            delete: true,
            update: true,
          },
        },
        sellerProduct: {
          read: true,
          actions: {
            create: true,
            delete: true,
            update: true,
          },
        },
        sellerProductMedia: {
          read: true,
          actions: {
            create: true,
            delete: true,
            update: true,
          },
        },
        sellerProductOption: {
          read: true,
          actions: {
            create: true,
            delete: true,
            update: true,
          },
        },
        sellerProductVariant: {
          read: true,
          actions: {
            create: true,
            delete: true,
            update: true,
          },
        },
        sellerProductVariantMedia: {
          read: true,
          actions: {
            create: true,
            delete: true,
            update: true,
          },
        },
        serviceMetric: {
          read: true,
        },
        session: {
          read: true,
        },
        shipment: {
          read: true,
          actions: {
            create: true,
            delete: true,
            update: true,
          },
        },
        shopifyApp: {
          read: true,
          actions: {
            create: true,
            delete: true,
            update: true,
          },
        },
        shopifyAppCredit: {
          read: true,
          actions: {
            create: true,
            delete: true,
            update: true,
          },
        },
        shopifyAppInstallation: {
          read: true,
          actions: {
            create: true,
            delete: true,
            update: true,
          },
        },
        shopifyAppPurchaseOneTime: {
          read: true,
          actions: {
            create: true,
            delete: true,
            update: true,
          },
        },
        shopifyAppSubscription: {
          read: true,
          actions: {
            create: true,
            delete: true,
            update: true,
          },
        },
        shopifyAppUsageRecord: {
          read: true,
          actions: {
            create: true,
            delete: true,
            update: true,
          },
        },
        shopifyArticle: {
          read: true,
          actions: {
            create: true,
            delete: true,
            update: true,
          },
        },
        shopifyBillingAddress: {
          read: true,
          actions: {
            create: true,
            delete: true,
            update: true,
          },
        },
        shopifyBlog: {
          read: true,
          actions: {
            create: true,
            delete: true,
            update: true,
          },
        },
        shopifyBulkOperation: {
          read: true,
          actions: {
            cancel: true,
            complete: true,
            create: true,
            expire: true,
            fail: true,
            update: true,
          },
        },
        shopifyCarrierService: {
          read: true,
          actions: {
            create: true,
            delete: true,
            update: true,
          },
        },
        shopifyCatalog: {
          read: true,
          actions: {
            create: true,
            delete: true,
            update: true,
          },
        },
        shopifyCheckout: {
          read: true,
          actions: {
            create: true,
            delete: true,
            update: true,
          },
        },
        shopifyCheckoutAppliedGiftCard: {
          read: true,
          actions: {
            create: true,
            delete: true,
            update: true,
          },
        },
        shopifyCheckoutLineItem: {
          read: true,
          actions: {
            create: true,
            delete: true,
            update: true,
          },
        },
        shopifyCheckoutShippingRate: {
          read: true,
          actions: {
            create: true,
            delete: true,
            update: true,
          },
        },
        shopifyCollect: {
          read: true,
          actions: {
            create: true,
            delete: true,
            update: true,
          },
        },
        shopifyCollection: {
          read: true,
          actions: {
            create: true,
            delete: true,
            update: true,
          },
        },
        shopifyComment: {
          read: true,
          actions: {
            create: true,
            delete: true,
            update: true,
          },
        },
        shopifyCustomer: {
          read: true,
          actions: {
            create: true,
            delete: true,
            update: true,
          },
        },
        shopifyCustomerAddress: {
          read: true,
          actions: {
            create: true,
            delete: true,
            update: true,
          },
        },
        shopifyDeliveryMethod: {
          read: true,
          actions: {
            create: true,
            delete: true,
            update: true,
          },
        },
        shopifyExchangeLineItem: {
          read: true,
          actions: {
            create: true,
            delete: true,
            update: true,
          },
        },
        shopifyFile: {
          read: true,
          actions: {
            create: true,
            delete: true,
            update: true,
          },
        },
        shopifyFulfillment: {
          read: true,
          actions: {
            create: true,
            delete: true,
            update: true,
          },
        },
        shopifyFulfillmentEvent: {
          read: true,
          actions: {
            create: true,
            delete: true,
            update: true,
          },
        },
        shopifyFulfillmentHold: {
          read: true,
          actions: {
            create: true,
            delete: true,
            update: true,
          },
        },
        shopifyFulfillmentLineItem: {
          read: true,
          actions: {
            create: true,
            delete: true,
            update: true,
          },
        },
        shopifyFulfillmentOrder: {
          read: true,
          actions: {
            create: true,
            delete: true,
            update: true,
          },
        },
        shopifyFulfillmentOrderDestination: {
          read: true,
          actions: {
            create: true,
            delete: true,
            update: true,
          },
        },
        shopifyFulfillmentOrderLineItem: {
          read: true,
          actions: {
            create: true,
            delete: true,
            update: true,
          },
        },
        shopifyFulfillmentOrderMerchantRequest: {
          read: true,
          actions: {
            create: true,
            delete: true,
            update: true,
          },
        },
        shopifyFulfillmentService: {
          read: true,
          actions: {
            create: true,
            delete: true,
            update: true,
          },
        },
        shopifyGdprRequest: {
          read: true,
          actions: {
            create: true,
            update: true,
          },
        },
        shopifyInventoryItem: {
          read: true,
          actions: {
            create: true,
            delete: true,
            update: true,
          },
        },
        shopifyInventoryLevel: {
          read: true,
          actions: {
            create: true,
            delete: true,
            update: true,
          },
        },
        shopifyInventoryQuantity: {
          read: true,
          actions: {
            create: true,
            delete: true,
            update: true,
          },
        },
        shopifyLocation: {
          read: true,
          actions: {
            create: true,
            delete: true,
            update: true,
          },
        },
        shopifyOrder: {
          read: true,
          actions: {
            create: true,
            delete: true,
            update: true,
          },
        },
        shopifyOrderAdjustment: {
          read: true,
          actions: {
            create: true,
            delete: true,
            update: true,
          },
        },
        shopifyOrderLineItem: {
          read: true,
          actions: {
            create: true,
            delete: true,
            update: true,
          },
        },
        shopifyOrderTransaction: {
          read: true,
          actions: {
            create: true,
            delete: true,
            update: true,
          },
        },
        shopifyPage: {
          read: true,
          actions: {
            create: true,
            delete: true,
            update: true,
          },
        },
        shopifyPriceList: {
          read: true,
          actions: {
            create: true,
            delete: true,
            update: true,
          },
        },
        shopifyPriceListPrice: {
          read: true,
          actions: {
            create: true,
            delete: true,
            update: true,
          },
        },
        shopifyProduct: {
          read: true,
          actions: {
            create: true,
            delete: true,
            update: true,
          },
        },
        shopifyProductMedia: {
          read: true,
          actions: {
            create: true,
            delete: true,
            update: true,
          },
        },
        shopifyProductOption: {
          read: true,
          actions: {
            create: true,
            delete: true,
            update: true,
          },
        },
        shopifyProductVariant: {
          read: true,
          actions: {
            create: true,
            delete: true,
            update: true,
          },
        },
        shopifyProductVariantMedia: {
          read: true,
          actions: {
            create: true,
            delete: true,
            update: true,
          },
        },
        shopifyQuantityPriceBreak: {
          read: true,
          actions: {
            create: true,
            delete: true,
            update: true,
          },
        },
        shopifyRedirect: {
          read: true,
          actions: {
            create: true,
            delete: true,
            update: true,
          },
        },
        shopifyRefund: {
          read: true,
          actions: {
            create: true,
            delete: true,
            update: true,
          },
        },
        shopifyRefundDuty: {
          read: true,
          actions: {
            create: true,
            delete: true,
            update: true,
          },
        },
        shopifyRefundLineItem: {
          read: true,
          actions: {
            create: true,
            delete: true,
            update: true,
          },
        },
        shopifyReturn: {
          read: true,
          actions: {
            create: true,
            delete: true,
            update: true,
          },
        },
        shopifyReturnLineItem: {
          read: true,
          actions: {
            create: true,
            delete: true,
            update: true,
          },
        },
        shopifyReturnShippingFee: {
          read: true,
          actions: {
            create: true,
            delete: true,
            update: true,
          },
        },
        shopifyReverseDelivery: {
          read: true,
          actions: {
            create: true,
            delete: true,
            update: true,
          },
        },
        shopifyReverseDeliveryLineItem: {
          read: true,
          actions: {
            create: true,
            delete: true,
            update: true,
          },
        },
        shopifyReverseFulfillmentOrder: {
          read: true,
          actions: {
            create: true,
            delete: true,
            update: true,
          },
        },
        shopifyReverseFulfillmentOrderDisposition: {
          read: true,
          actions: {
            create: true,
            delete: true,
            update: true,
          },
        },
        shopifyReverseFulfillmentOrderLineItem: {
          read: true,
          actions: {
            create: true,
            delete: true,
            update: true,
          },
        },
        shopifyScriptTag: {
          read: true,
          actions: {
            create: true,
            delete: true,
            update: true,
          },
        },
        shopifyShippingAddress: {
          read: true,
          actions: {
            create: true,
            delete: true,
            update: true,
          },
        },
        shopifyShippingLine: {
          read: true,
          actions: {
            create: true,
            delete: true,
            update: true,
          },
        },
        shopifyShop: {
          read: true,
          actions: {
            install: true,
            reinstall: true,
            uninstall: true,
            update: true,
          },
        },
        shopifySync: {
          read: true,
          actions: {
            abort: true,
            complete: true,
            error: true,
            run: true,
          },
        },
        shopifyTenderTransaction: {
          read: true,
          actions: {
            create: true,
            delete: true,
            update: true,
          },
        },
        slaTarget: {
          read: true,
        },
        taxRule: {
          read: true,
        },
        tenantRole: {
          read: true,
        },
        user: {
          read: true,
          actions: {
            changePassword: true,
            delete: true,
            resetPassword: true,
            sendResetPassword: true,
            sendVerifyEmail: true,
            signIn: true,
            signOut: true,
            signUp: true,
            update: true,
            verifyEmail: true,
          },
        },
        vendor: {
          read: true,
          actions: {
            create: true,
            delete: true,
            update: true,
          },
        },
        vendorProduct: {
          read: true,
          actions: {
            create: true,
            delete: true,
            update: true,
          },
        },
        vendorProductMedia: {
          read: true,
          actions: {
            create: true,
            delete: true,
            update: true,
          },
        },
        vendorProductOption: {
          read: true,
          actions: {
            create: true,
            delete: true,
            update: true,
          },
        },
        vendorProductVariant: {
          read: true,
          actions: {
            create: true,
            delete: true,
            update: true,
          },
        },
        vendorProductVariantMedia: {
          read: true,
          actions: {
            create: true,
            delete: true,
            update: true,
          },
        },
        vendorReturn: {
          read: true,
          actions: {
            create: true,
            delete: true,
            update: true,
          },
        },
        webhookEndpoint: {
          read: true,
        },
        workspace: {
          read: true,
        },
      },
      actions: {
        scheduledShopifySync: true,
      },
    },
    "Super Admin": {
      storageKey: "g5EWJBCs1B64",
      default: {
        read: true,
        action: true,
      },
      models: {
        alert: {
          read: true,
        },
        approvalRequest: {
          read: true,
        },
        attributeOption: {
          read: true,
        },
        auditEvent: {
          read: true,
        },
        calibrationRun: {
          read: true,
        },
        catalogAttribute: {
          read: true,
        },
        catalogValidation: {
          read: true,
          actions: {
            create: true,
            delete: true,
            update: true,
          },
        },
        complianceExport: {
          read: true,
        },
        controlCheckpoint: {
          read: true,
        },
        courierFeedback: {
          read: true,
          actions: {
            create: true,
            delete: true,
            update: true,
          },
        },
        design: {
          read: true,
          actions: {
            create: true,
            delete: true,
            update: true,
          },
        },
        featureFlag: {
          read: true,
        },
        feeRule: {
          read: true,
        },
        financeConfig: {
          read: true,
        },
        financeReconciliation: {
          read: true,
          actions: {
            create: true,
            delete: true,
            update: true,
          },
        },
        fulfillmentAction: {
          read: true,
          actions: {
            create: true,
            delete: true,
            update: true,
          },
        },
        incident: {
          read: true,
        },
        integration: {
          read: true,
        },
        integrationCredential: {
          read: true,
        },
        integrationState: {
          read: true,
          actions: {
            create: true,
            delete: true,
            update: true,
          },
        },
        invite: {
          read: true,
          actions: {
            create: true,
            delete: true,
            resend: true,
          },
        },
        jigTemplate: {
          read: true,
        },
        logForwarder: {
          read: true,
        },
        membership: {
          read: true,
        },
        order: {
          read: true,
          actions: {
            create: true,
            delete: true,
            update: true,
          },
        },
        organization: {
          read: true,
        },
        payment: {
          read: true,
          actions: {
            create: true,
            delete: true,
            update: true,
          },
        },
        payoutSchedule: {
          read: true,
        },
        printerDevice: {
          read: true,
        },
        printJob: {
          read: true,
          actions: {
            create: true,
            delete: true,
            update: true,
          },
        },
        printProfile: {
          read: true,
        },
        product: {
          read: true,
          actions: {
            create: true,
            delete: true,
            update: true,
          },
        },
        reportDefinition: {
          read: true,
        },
        reportRun: {
          read: true,
        },
        routingPolicy: {
          read: true,
        },
        routingPolicyAudit: {
          read: true,
        },
        routingPolicyVendor: {
          read: true,
        },
        routingRule: {
          read: true,
        },
        routingSimulation: {
          read: true,
        },
        scheduledReport: {
          read: true,
        },
        schemaChange: {
          read: true,
        },
        secret: {
          read: true,
        },
        secretVersion: {
          read: true,
        },
        seller: {
          read: true,
          actions: {
            create: true,
            delete: true,
            update: true,
          },
        },
        sellerProduct: {
          read: true,
          actions: {
            create: true,
            delete: true,
            update: true,
          },
        },
        sellerProductMedia: {
          read: true,
          actions: {
            create: true,
            delete: true,
            update: true,
          },
        },
        sellerProductOption: {
          read: true,
          actions: {
            create: true,
            delete: true,
            update: true,
          },
        },
        sellerProductVariant: {
          read: true,
          actions: {
            create: true,
            delete: true,
            update: true,
          },
        },
        sellerProductVariantMedia: {
          read: true,
          actions: {
            create: true,
            delete: true,
            update: true,
          },
        },
        serviceMetric: {
          read: true,
        },
        session: {
          read: true,
        },
        shipment: {
          read: true,
          actions: {
            create: true,
            delete: true,
            update: true,
          },
        },
        shopifyApp: {
          read: true,
          actions: {
            create: true,
            delete: true,
            update: true,
          },
        },
        shopifyAppCredit: {
          read: true,
          actions: {
            create: true,
            delete: true,
            update: true,
          },
        },
        shopifyAppInstallation: {
          read: true,
          actions: {
            create: true,
            delete: true,
            update: true,
          },
        },
        shopifyAppPurchaseOneTime: {
          read: true,
          actions: {
            create: true,
            delete: true,
            update: true,
          },
        },
        shopifyAppSubscription: {
          read: true,
          actions: {
            create: true,
            delete: true,
            update: true,
          },
        },
        shopifyAppUsageRecord: {
          read: true,
          actions: {
            create: true,
            delete: true,
            update: true,
          },
        },
        shopifyArticle: {
          read: true,
          actions: {
            create: true,
            delete: true,
            update: true,
          },
        },
        shopifyBillingAddress: {
          read: true,
          actions: {
            create: true,
            delete: true,
            update: true,
          },
        },
        shopifyBlog: {
          read: true,
          actions: {
            create: true,
            delete: true,
            update: true,
          },
        },
        shopifyBulkOperation: {
          read: true,
          actions: {
            cancel: true,
            complete: true,
            create: true,
            expire: true,
            fail: true,
            update: true,
          },
        },
        shopifyCarrierService: {
          read: true,
          actions: {
            create: true,
            delete: true,
            update: true,
          },
        },
        shopifyCatalog: {
          read: true,
          actions: {
            create: true,
            delete: true,
            update: true,
          },
        },
        shopifyCheckout: {
          read: true,
          actions: {
            create: true,
            delete: true,
            update: true,
          },
        },
        shopifyCheckoutAppliedGiftCard: {
          read: true,
          actions: {
            create: true,
            delete: true,
            update: true,
          },
        },
        shopifyCheckoutLineItem: {
          read: true,
          actions: {
            create: true,
            delete: true,
            update: true,
          },
        },
        shopifyCheckoutShippingRate: {
          read: true,
          actions: {
            create: true,
            delete: true,
            update: true,
          },
        },
        shopifyCollect: {
          read: true,
          actions: {
            create: true,
            delete: true,
            update: true,
          },
        },
        shopifyCollection: {
          read: true,
          actions: {
            create: true,
            delete: true,
            update: true,
          },
        },
        shopifyComment: {
          read: true,
          actions: {
            create: true,
            delete: true,
            update: true,
          },
        },
        shopifyCustomer: {
          read: true,
          actions: {
            create: true,
            delete: true,
            update: true,
          },
        },
        shopifyCustomerAddress: {
          read: true,
          actions: {
            create: true,
            delete: true,
            update: true,
          },
        },
        shopifyDeliveryMethod: {
          read: true,
          actions: {
            create: true,
            delete: true,
            update: true,
          },
        },
        shopifyExchangeLineItem: {
          read: true,
          actions: {
            create: true,
            delete: true,
            update: true,
          },
        },
        shopifyFile: {
          read: true,
          actions: {
            create: true,
            delete: true,
            update: true,
          },
        },
        shopifyFulfillment: {
          read: true,
          actions: {
            create: true,
            delete: true,
            update: true,
          },
        },
        shopifyFulfillmentEvent: {
          read: true,
          actions: {
            create: true,
            delete: true,
            update: true,
          },
        },
        shopifyFulfillmentHold: {
          read: true,
          actions: {
            create: true,
            delete: true,
            update: true,
          },
        },
        shopifyFulfillmentLineItem: {
          read: true,
          actions: {
            create: true,
            delete: true,
            update: true,
          },
        },
        shopifyFulfillmentOrder: {
          read: true,
          actions: {
            create: true,
            delete: true,
            update: true,
          },
        },
        shopifyFulfillmentOrderDestination: {
          read: true,
          actions: {
            create: true,
            delete: true,
            update: true,
          },
        },
        shopifyFulfillmentOrderLineItem: {
          read: true,
          actions: {
            create: true,
            delete: true,
            update: true,
          },
        },
        shopifyFulfillmentOrderMerchantRequest: {
          read: true,
          actions: {
            create: true,
            delete: true,
            update: true,
          },
        },
        shopifyFulfillmentService: {
          read: true,
          actions: {
            create: true,
            delete: true,
            update: true,
          },
        },
        shopifyGdprRequest: {
          read: true,
          actions: {
            create: true,
            update: true,
          },
        },
        shopifyInventoryItem: {
          read: true,
          actions: {
            create: true,
            delete: true,
            update: true,
          },
        },
        shopifyInventoryLevel: {
          read: true,
          actions: {
            create: true,
            delete: true,
            update: true,
          },
        },
        shopifyInventoryQuantity: {
          read: true,
          actions: {
            create: true,
            delete: true,
            update: true,
          },
        },
        shopifyLocation: {
          read: true,
          actions: {
            create: true,
            delete: true,
            update: true,
          },
        },
        shopifyOrder: {
          read: true,
          actions: {
            create: true,
            delete: true,
            update: true,
          },
        },
        shopifyOrderAdjustment: {
          read: true,
          actions: {
            create: true,
            delete: true,
            update: true,
          },
        },
        shopifyOrderLineItem: {
          read: true,
          actions: {
            create: true,
            delete: true,
            update: true,
          },
        },
        shopifyOrderTransaction: {
          read: true,
          actions: {
            create: true,
            delete: true,
            update: true,
          },
        },
        shopifyPage: {
          read: true,
          actions: {
            create: true,
            delete: true,
            update: true,
          },
        },
        shopifyPriceList: {
          read: true,
          actions: {
            create: true,
            delete: true,
            update: true,
          },
        },
        shopifyPriceListPrice: {
          read: true,
          actions: {
            create: true,
            delete: true,
            update: true,
          },
        },
        shopifyProduct: {
          read: true,
          actions: {
            create: true,
            delete: true,
            update: true,
          },
        },
        shopifyProductMedia: {
          read: true,
          actions: {
            create: true,
            delete: true,
            update: true,
          },
        },
        shopifyProductOption: {
          read: true,
          actions: {
            create: true,
            delete: true,
            update: true,
          },
        },
        shopifyProductVariant: {
          read: true,
          actions: {
            create: true,
            delete: true,
            update: true,
          },
        },
        shopifyProductVariantMedia: {
          read: true,
          actions: {
            create: true,
            delete: true,
            update: true,
          },
        },
        shopifyQuantityPriceBreak: {
          read: true,
          actions: {
            create: true,
            delete: true,
            update: true,
          },
        },
        shopifyRedirect: {
          read: true,
          actions: {
            create: true,
            delete: true,
            update: true,
          },
        },
        shopifyRefund: {
          read: true,
          actions: {
            create: true,
            delete: true,
            update: true,
          },
        },
        shopifyRefundDuty: {
          read: true,
          actions: {
            create: true,
            delete: true,
            update: true,
          },
        },
        shopifyRefundLineItem: {
          read: true,
          actions: {
            create: true,
            delete: true,
            update: true,
          },
        },
        shopifyReturn: {
          read: true,
          actions: {
            create: true,
            delete: true,
            update: true,
          },
        },
        shopifyReturnLineItem: {
          read: true,
          actions: {
            create: true,
            delete: true,
            update: true,
          },
        },
        shopifyReturnShippingFee: {
          read: true,
          actions: {
            create: true,
            delete: true,
            update: true,
          },
        },
        shopifyReverseDelivery: {
          read: true,
          actions: {
            create: true,
            delete: true,
            update: true,
          },
        },
        shopifyReverseDeliveryLineItem: {
          read: true,
          actions: {
            create: true,
            delete: true,
            update: true,
          },
        },
        shopifyReverseFulfillmentOrder: {
          read: true,
          actions: {
            create: true,
            delete: true,
            update: true,
          },
        },
        shopifyReverseFulfillmentOrderDisposition: {
          read: true,
          actions: {
            create: true,
            delete: true,
            update: true,
          },
        },
        shopifyReverseFulfillmentOrderLineItem: {
          read: true,
          actions: {
            create: true,
            delete: true,
            update: true,
          },
        },
        shopifyScriptTag: {
          read: true,
          actions: {
            create: true,
            delete: true,
            update: true,
          },
        },
        shopifyShippingAddress: {
          read: true,
          actions: {
            create: true,
            delete: true,
            update: true,
          },
        },
        shopifyShippingLine: {
          read: true,
          actions: {
            create: true,
            delete: true,
            update: true,
          },
        },
        shopifyShop: {
          read: true,
          actions: {
            install: true,
            reinstall: true,
            uninstall: true,
            update: true,
          },
        },
        shopifySync: {
          read: true,
          actions: {
            abort: true,
            complete: true,
            error: true,
            run: true,
          },
        },
        shopifyTenderTransaction: {
          read: true,
          actions: {
            create: true,
            delete: true,
            update: true,
          },
        },
        slaTarget: {
          read: true,
        },
        taxRule: {
          read: true,
        },
        tenantRole: {
          read: true,
        },
        user: {
          read: true,
          actions: {
            changePassword: true,
            delete: true,
            resetPassword: true,
            sendResetPassword: true,
            sendVerifyEmail: true,
            signIn: true,
            signOut: true,
            signUp: true,
            update: true,
            verifyEmail: true,
          },
        },
        vendor: {
          read: true,
          actions: {
            create: true,
            delete: true,
            update: true,
          },
        },
        vendorProduct: {
          read: true,
          actions: {
            create: true,
            delete: true,
            update: true,
          },
        },
        vendorProductMedia: {
          read: true,
          actions: {
            create: true,
            delete: true,
            update: true,
          },
        },
        vendorProductOption: {
          read: true,
          actions: {
            create: true,
            delete: true,
            update: true,
          },
        },
        vendorProductVariant: {
          read: true,
          actions: {
            create: true,
            delete: true,
            update: true,
          },
        },
        vendorProductVariantMedia: {
          read: true,
          actions: {
            create: true,
            delete: true,
            update: true,
          },
        },
        vendorReturn: {
          read: true,
          actions: {
            create: true,
            delete: true,
            update: true,
          },
        },
        webhookEndpoint: {
          read: true,
        },
        workspace: {
          read: true,
        },
      },
      actions: {
        scheduledShopifySync: true,
      },
    },
  },
};
