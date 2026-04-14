import { authResolvers } from "./auth.resolver";

export const resolvers = {
  Query: {
    hello: () => "Server Running",
  },

  Mutation: {
    ...authResolvers.Mutation,
  },
};