import { gql } from "apollo-server-express";
import { authTypeDefs } from "./auth.schema";

const baseTypeDefs = gql`
  enum Role {
    ADMIN
    VENDOR
    CUSTOMER
  }

  type User {
    id: ID!
    name: String!
    email: String!
    role: Role!
  }

  type Query {
    hello: String!
  }

  type Mutation
`;

export const typeDefs = [
  baseTypeDefs,
  authTypeDefs,
];