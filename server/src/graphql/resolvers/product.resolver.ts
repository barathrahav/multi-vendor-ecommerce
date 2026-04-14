import { authorizeRoles } from "../../utils/authorize";
import {
  createProductService,
  getProductByIdService,
  getProductsService,
} from "../../modules/products/product.service";
import { verifyProductOwnership } from "../../utils/checkOwnership";
import {
  updateProductService,
  deleteProductService,
} from "../../modules/products/product.service";

export const productResolvers = {
  Query: {
    products: async () => getProductsService(),

    product: async (_: any, args: any) => getProductByIdService(args.id),
  },

  Mutation: {
    createProduct: async (_: any, args: any, context: any) => {
      authorizeRoles(context.user?.role, ["VENDOR", "ADMIN"]);

      return createProductService(args, context.user.id);
    },

    updateProduct: async (_: any, args: any, context: any) => {
      authorizeRoles(context.user?.role, ["VENDOR", "ADMIN"]);

      await verifyProductOwnership(args.id, context.user.id, context.user.role);

      const { id, ...updateData } = args;

      return updateProductService(id, updateData);
    },

    deleteProduct: async (_: any, args: any, context: any) => {
      authorizeRoles(context.user?.role, ["VENDOR", "ADMIN"]);

      await verifyProductOwnership(args.id, context.user.id, context.user.role);

      return deleteProductService(args.id);
    },
  },
};
