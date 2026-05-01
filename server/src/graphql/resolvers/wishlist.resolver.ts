import {
  addToWishlistService,
  getMyWishlistService,
  removeFromWishlistService,
} from "../../modules/wishlist/wishlist.service";
import { authorizeRoles } from "../../utils/authorize";

export const wishlistResolvers = {
  Query: {
    myWishlist: async (_: any, __: any, context: any) => {
      authorizeRoles(context.user?.role, ["CUSTOMER"]);

      return getMyWishlistService(context.user.id);
    },
  },

  Mutation: {
    addToWishlist: async (_: any, args: any, context: any) => {
      authorizeRoles(context.user?.role, ["CUSTOMER"]);

      return addToWishlistService(context.user.id, args.productId);
    },

    removeFromWishlist: async (_: any, args: any, context: any) => {
      authorizeRoles(context.user?.role, ["CUSTOMER"]);

      return removeFromWishlistService(context.user.id, args.productId);
    },
  },
};
