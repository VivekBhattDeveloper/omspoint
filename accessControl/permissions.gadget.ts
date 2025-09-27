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
        financeReconciliation: {
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
        shipment: {
          read: true,
          actions: {
            create: true,
            delete: true,
            update: true,
          },
        },
        user: {
          read: true,
          actions: {
            changePassword: {
              filter: "accessControl/filters/user/tenant.gelly",
            },
            signOut: {
              filter: "accessControl/filters/user/tenant.gelly",
            },
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
      },
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
  },
};
