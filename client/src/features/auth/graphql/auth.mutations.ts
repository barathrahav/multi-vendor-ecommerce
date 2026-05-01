import { gql } from "@apollo/client";

export const REGISTER_MUTATION = gql`
  mutation Register(
    $name: String!
    $email: String!
    $password: String!
    $phone: String
    $role: Role
  ) {
    register(
      name: $name
      email: $email
      password: $password
      phone: $phone
      role: $role
    ) {
      token
      refreshToken
      user {
        id
        name
        email
        phone
        role
      }
    }
  }
`;

export const LOGIN_MUTATION = gql`
  mutation Login(
    $email: String!
    $password: String!
  ) {
    login(
      email: $email
      password: $password
    ) {
      token
      refreshToken
      user {
        id
        name
        email
        phone
        role
      }
    }
  }
`;

export const REQUEST_OTP_MUTATION = gql`
  mutation RequestOtp($phone: String!) {
    requestOtp(phone: $phone)
  }
`;

export const VERIFY_OTP_LOGIN_MUTATION = gql`
  mutation VerifyOtpLogin($phone: String!, $code: String!) {
    verifyOtpLogin(phone: $phone, code: $code) {
      token
      refreshToken
      user {
        id
        name
        email
        phone
        role
      }
    }
  }
`;
