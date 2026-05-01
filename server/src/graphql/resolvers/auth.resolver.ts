import {
  loginUser,
  refreshTokenService,
  registerUser,
  requestOtpService,
  verifyOtpLoginService,
} from "../../modules/auth/auth.service";

export const authResolvers = {
  Mutation: {
    register: async (_: any, args: any) => {
      return registerUser(
        args.name,
        args.email,
        args.password,
        args.phone,
        args.role
      );
    },

    login: async (_: any, args: any) => {
      return loginUser(
        args.email,
        args.password
      );
    },

    requestOtp: async (_: any, args: any) => {
      return requestOtpService(args.phone);
    },

    verifyOtpLogin: async (_: any, args: any) => {
      return verifyOtpLoginService(args.phone, args.code);
    },

    refreshToken: async (_: any, args: any) => {
      return refreshTokenService(args.refreshToken);
    },
  },
};
