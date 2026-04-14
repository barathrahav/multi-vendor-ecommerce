import { ApolloServer } from "apollo-server-express";
import app from "./app";
import { typeDefs } from "./graphql/schema";
import { resolvers } from "./graphql/resolvers";

const startServer = async () => {
  const server = new ApolloServer({
    typeDefs,
    resolvers,
    introspection: true,
  });

  await server.start();

  server.applyMiddleware({ app });

  const PORT = 5000;

  app.listen(PORT, () => {
    console.log(
      `🚀 Server running at http://localhost:${PORT}${server.graphqlPath}`
    );
  });
};

startServer();