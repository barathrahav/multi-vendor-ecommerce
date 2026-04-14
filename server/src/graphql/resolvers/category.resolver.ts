import { authorizeRoles } from "../../utils/authorize";
import {
  createCategoryService,
  deleteCategoryService,
  getCategoriesService,
  updateCategoryService,
} from "../../modules/categories/category.service";

export const categoryResolvers = {
  Query: {
    categories: async () => {
      return getCategoriesService();
    },
  },

  Mutation: {
    createCategory: async (_: any, args: any, context: any) => {
      authorizeRoles(context.user?.role, ["ADMIN"]);

      return createCategoryService(args.name);
    },

    updateCategory: async (_: any, args: any, context: any) => {
      authorizeRoles(context.user?.role, ["ADMIN"]);

      return updateCategoryService(args.id, args.name);
    },

    deleteCategory: async (_: any, args: any, context: any) => {
      authorizeRoles(context.user?.role, ["ADMIN"]);

      return deleteCategoryService(args.id);
    },
  },
};