import { authorizeRoles } from "../../utils/authorize";
import {
  createUserService,
  deleteUserService,
  getUsersService,
  updateUserPasswordService,
  updateUserService,
} from "../../modules/users/user.service";

export const userResolvers = {
  Query: {
    users: async (_: any, __: any, context: any) => {
      authorizeRoles(context.user?.role, ["ADMIN"]);

      return getUsersService();
    },
  },

  Mutation: {
    adminCreateUser: async (_: any, args: any, context: any) => {
      authorizeRoles(context.user?.role, ["ADMIN"]);

      return createUserService(
        args.name,
        args.email,
        args.password,
        args.role
      );
    },

    adminUpdateUser: async (_: any, args: any, context: any) => {
      authorizeRoles(context.user?.role, ["ADMIN"]);

      const { id, ...updateData } = args;

      return updateUserService(id, updateData);
    },

    adminUpdateUserPassword: async (_: any, args: any, context: any) => {
      authorizeRoles(context.user?.role, ["ADMIN"]);

      return updateUserPasswordService(args.id, args.password);
    },

    adminDeleteUser: async (_: any, args: any, context: any) => {
      authorizeRoles(context.user?.role, ["ADMIN"]);

      return deleteUserService(args.id);
    },
  },
};
