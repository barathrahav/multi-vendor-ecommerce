import { authResolvers } from "./auth.resolver";
import { cartResolvers } from "./cart.resolver";
import { categoryResolvers } from "./category.resolver";
import { orderResolvers } from "./order.resolver";
import { productResolvers } from "./product.resolver";
import { paymentResolvers } from "./payment.resolver";
import { userResolvers } from "./user.resolver";

export const resolvers = {
  Query: {
    hello: () => "Server Running",

    me: (_: any, __: any, context: any) => {
      return context.user;
    },

    ...categoryResolvers.Query,
    ...productResolvers.Query,
    ...cartResolvers.Query,
    ...orderResolvers.Query,
    ...userResolvers.Query,

  },

  Mutation: {
    ...authResolvers.Mutation,
    ...categoryResolvers.Mutation,
    ...productResolvers.Mutation,
    ...cartResolvers.Mutation,
    ...orderResolvers.Mutation,
    ...paymentResolvers.Mutation,
    ...userResolvers.Mutation,
  },
};
