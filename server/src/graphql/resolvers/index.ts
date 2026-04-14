import { authResolvers } from "./auth.resolver";

export const resolvers = {
  Query: {
    hello: () => "Server Running",
    me: (_: any, __: any, context: any) => {
    return context.user;
  },
},

  Mutation: {
    ...authResolvers.Mutation,
  },
};