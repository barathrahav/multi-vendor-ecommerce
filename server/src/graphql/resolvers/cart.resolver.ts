import { authorizeRoles } from "../../utils/authorize";
import {
  addToCartService,
  getOrCreateCart,
  updateCartItemService,
  removeFromCartService,
  clearCartService,
} from "../../modules/cart/cart.service";

export const cartResolvers = {
  Query: {
    cart: async (_: any, __: any, context: any) => {
      authorizeRoles(context.user?.role, ["CUSTOMER"]);

      return getOrCreateCart(context.user.id);
    },
  },

  Mutation: {
    addToCart: async (_: any, args: any, context: any) => {
      authorizeRoles(context.user?.role, ["CUSTOMER"]);

      return addToCartService(context.user.id, args.productId, args.quantity);
    },
    updateCartItem: async (_: any, args: any, context: any) => {
      authorizeRoles(context.user?.role, ["CUSTOMER"]);

      return updateCartItemService(
        context.user.id,
        args.productId,
        args.quantity,
      );
    },

    removeFromCart: async (_: any, args: any, context: any) => {
      authorizeRoles(context.user?.role, ["CUSTOMER"]);

      return removeFromCartService(context.user.id, args.productId);
    },

    clearCart: async (_: any, __: any, context: any) => {
      authorizeRoles(context.user?.role, ["CUSTOMER"]);

      return clearCartService(context.user.id);
    },
  },
};
