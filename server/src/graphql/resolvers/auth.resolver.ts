import {
  loginUser,
  registerUser,
} from "../../modules/auth/auth.service";

export const authResolvers = {
  Mutation: {
    register: async (_: any, args: any) => {
      return registerUser(
        args.name,
        args.email,
        args.password,
        args.role
      );
    },

    login: async (_: any, args: any) => {
      return loginUser(
        args.email,
        args.password
      );
    },
  },
};