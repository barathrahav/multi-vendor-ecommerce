import { gql } from "graphql-tag";

export const authTypeDefs = gql`
  type AuthResponse {
    token: String!
    refreshToken: String!
    user: User!
  }

  extend type Mutation {
    register(
      name: String!
      email: String!
      password: String!
      phone: String
      role: Role
    ): AuthResponse!

    login(
      email: String!
      password: String!
    ): AuthResponse!

    requestOtp(phone: String!): String!
    verifyOtpLogin(phone: String!, code: String!): AuthResponse!
    refreshToken(refreshToken: String!): AuthResponse!
  }
`;
