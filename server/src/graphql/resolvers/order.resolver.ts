import { authorizeRoles } from "../../utils/authorize";
import {
    getMyOrdersService,
    getOrderByIdService,
    placeOrderService,
    updateOrderStatusService,
} from "../../modules/orders/order.service";

export const orderResolvers = {
    Query: {
        myOrders: async (
            _: any,
            __: any,
            context: any
        ) => {
            authorizeRoles(context.user?.role, ["CUSTOMER"]);

            return getMyOrdersService(context.user.id);
        },

        order: async (
            _: any,
            args: any,
            context: any
        ) => {
            authorizeRoles(context.user?.role, ["CUSTOMER"]);

            return getOrderByIdService(
                args.id,
                context.user.id
            );
        },
    },

    Mutation: {
        placeOrder: async (
            _: any,
            __: any,
            context: any
        ) => {
            authorizeRoles(context.user?.role, ["CUSTOMER"]);

            return placeOrderService(context.user.id);
        },
        updateOrderStatus: async (
            _: any,
            args: any,
            context: any
        ) => {
            authorizeRoles(context.user?.role, ["ADMIN"]);

            return updateOrderStatusService(
                args.orderId,
                args.status
            );
        },

    },
};