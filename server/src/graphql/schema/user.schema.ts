import { gql } from "graphql-tag";

export const userTypeDefs = gql`
  extend type Query {
    users: [User!]!
  }

  extend type Mutation {
    adminCreateUser(
      name: String!
      email: String!
      password: String!
      role: Role!
    ): User!

    adminUpdateUser(
      id: ID!
      name: String
      email: String
      role: Role
    ): User!

    adminUpdateUserPassword(
      id: ID!
      password: String!
    ): User!

    adminDeleteUser(id: ID!): String!
  }
`;
