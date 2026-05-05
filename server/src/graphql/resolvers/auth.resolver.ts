import {
  loginUser,
  refreshTokenService,
  registerUser,
  requestOtpService,
  verifyOtpLoginService,
  requestOtpRegisterService,
  verifyOtpRegisterService,
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

    requestOtpRegister: async (_: any, args: any) => {
      return requestOtpRegisterService(args.phone);
    },

    verifyOtpRegister: async (_: any, args: any) => {
      return verifyOtpRegisterService(
        args.name,
        args.email,
        args.password,
        args.phone,
        args.code,
        args.role
      );
    },

    refreshToken: async (_: any, args: any) => {
      return refreshTokenService(args.refreshToken);
    },
  },
};
