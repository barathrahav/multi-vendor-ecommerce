import { gql } from "apollo-server-express";

export const authTypeDefs = gql`
  type AuthResponse {
    token: String!
    user: User!
  }

  extend type Mutation {
    register(
      name: String!
      email: String!
      password: String!
      role: Role
    ): AuthResponse!

    login(
      email: String!
      password: String!
    ): AuthResponse!
  }
`;