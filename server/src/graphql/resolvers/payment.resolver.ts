import { authorizeRoles } from "../../utils/authorize";
import {
  createPaymentOrderService,
  markPaymentFailedService,
  verifyPaymentService,
} from "../../modules/payments/payment.service";

export const paymentResolvers = {
  Mutation: {
    createPaymentOrder: async (
      _: any,
      args: any,
      context: any
    ) => {
      authorizeRoles(context.user?.role, ["CUSTOMER"]);

      return createPaymentOrderService(
        args.orderId,
        context.user.id,
        context.idempotencyKey
      );
    },

    verifyPayment: async (
      _: any,
      args: any,
      context: any
    ) => {
      return verifyPaymentService(
        args.orderId,
        args.razorpayOrderId,
        args.razorpayPaymentId,
        args.razorpaySignature,
        context.idempotencyKey
      );
    },

    markPaymentFailed: async (
      _: any,
      args: any,
      context: any
    ) => {
      authorizeRoles(context.user?.role, ["CUSTOMER"]);

      return markPaymentFailedService(
        args.orderId,
        context.user.id,
        args.reason
      );
    },
  },
};
