import { authResolvers } from "./auth.resolver";
import { cartResolvers } from "./cart.resolver";
import { categoryResolvers } from "./category.resolver";
import { orderResolvers } from "./order.resolver";
import { productResolvers } from "./product.resolver";
import { paymentResolvers } from "./payment.resolver";

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

  },

  Mutation: {
    ...authResolvers.Mutation,
    ...categoryResolvers.Mutation,
    ...productResolvers.Mutation,
    ...cartResolvers.Mutation,
    ...orderResolvers.Mutation,
    ...paymentResolvers.Mutation, 
  },
};