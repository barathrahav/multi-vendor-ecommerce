import { authResolvers } from "./auth.resolver";
import { categoryResolvers } from "./category.resolver";

export const resolvers = {
  Query: {
    hello: () => "Server Running",
    me: (_: any, __: any, context: any) => {
    return context.user;
  },
},

  Mutation: {
    ...authResolvers.Mutation,
    ...categoryResolvers.Mutation,
  },
};