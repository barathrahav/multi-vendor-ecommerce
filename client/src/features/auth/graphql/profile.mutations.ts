import { gql } from "@apollo/client";

export const UPDATE_PROFILE = gql`
  mutation UpdateProfile($name: String!, $email: String!, $phone: String) {
    updateProfile(name: $name, email: $email, phone: $phone) {
      id
      name
      email
      phone
      role
    }
  }
`;
