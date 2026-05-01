import { authorizeRoles } from "../../utils/authorize";
import {
    getAllOrdersService,
    getMyOrdersService,
    getVendorOrdersService,
    getOrderByIdService,
    placeOrderService,
    cancelOrderService,
    updateOrderStatusService,
    updateVendorOrderStatusService,
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

        vendorOrders: async (
            _: any,
            __: any,
            context: any
        ) => {
            authorizeRoles(context.user?.role, ["VENDOR"]);

            return getVendorOrdersService(context.user.id);
        },

        allOrders: async (
            _: any,
            __: any,
            context: any
        ) => {
            authorizeRoles(context.user?.role, ["ADMIN"]);

            return getAllOrdersService();
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
        cancelOrder: async (
            _: any,
            args: any,
            context: any
        ) => {
            authorizeRoles(context.user?.role, ["CUSTOMER"]);

            return cancelOrderService(
                args.orderId,
                context.user.id
            );
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

        vendorUpdateOrderStatus: async (
            _: any,
            args: any,
            context: any
        ) => {
            authorizeRoles(context.user?.role, ["VENDOR"]);

            return updateVendorOrderStatusService(
                args.orderId,
                context.user.id,
                args.status
            );
        },

    },
};
