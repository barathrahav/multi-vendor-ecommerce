import { gql } from "graphql-tag";

export const userTypeDefs = gql`
  extend type Query {
    users: [User!]!
  }

  extend type Mutation {
    updateProfile(
      name: String!
      email: String!
      phone: String
    ): User!

    adminCreateUser(
      name: String!
      email: String!
      password: String!
      phone: String
      role: Role!
    ): User!

    adminUpdateUser(
      id: ID!
      name: String
      email: String
      phone: String
      role: Role
    ): User!

    adminUpdateUserPassword(
      id: ID!
      password: String!
    ): User!

    adminDeleteUser(id: ID!): String!
  }
`;
