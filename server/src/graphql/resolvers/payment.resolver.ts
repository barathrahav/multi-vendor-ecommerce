import { authorizeRoles } from "../../utils/authorize";
import {
  createPaymentOrderService,
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
        context.user.id
      );
    },

    verifyPayment: async (
      _: any,
      args: any
    ) => {
      return verifyPaymentService(
        args.orderId,
        args.razorpayOrderId,
        args.razorpayPaymentId,
        args.razorpaySignature
      );
    },
  },
};