import { gql } from "@apollo/client";

export const GET_USERS = gql`
  query GetUsers {
    users {
      id
      name
      email
      role
    }
  }
`;

export const ADMIN_CREATE_USER = gql`
  mutation AdminCreateUser(
    $name: String!
    $email: String!
    $password: String!
    $role: Role!
  ) {
    adminCreateUser(
      name: $name
      email: $email
      password: $password
      role: $role
    ) {
      id
      name
      email
      role
    }
  }
`;

export const ADMIN_UPDATE_USER = gql`
  mutation AdminUpdateUser(
    $id: ID!
    $name: String
    $email: String
    $role: Role
  ) {
    adminUpdateUser(id: $id, name: $name, email: $email, role: $role) {
      id
      name
      email
      role
    }
  }
`;

export const ADMIN_UPDATE_USER_PASSWORD = gql`
  mutation AdminUpdateUserPassword($id: ID!, $password: String!) {
    adminUpdateUserPassword(id: $id, password: $password) {
      id
    }
  }
`;

export const ADMIN_DELETE_USER = gql`
  mutation AdminDeleteUser($id: ID!) {
    adminDeleteUser(id: $id)
  }
`;
