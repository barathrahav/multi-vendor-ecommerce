import { authResolvers } from "./auth.resolver";
import { categoryResolvers } from "./category.resolver";
import { productResolvers } from "./product.resolver";

export const resolvers = {
  Query: {
    hello: () => "Server Running",

    me: (_: any, __: any, context: any) => {
      return context.user;
    },

    ...categoryResolvers.Query,
    ...productResolvers.Query,
  },

  Mutation: {
    ...authResolvers.Mutation,
    ...categoryResolvers.Mutation,
    ...productResolvers.Mutation,
  },
};