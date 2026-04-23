import { gql } from "@apollo/client";

export const GET_VENDOR_PRODUCTS = gql`
  query {
    vendorProducts {
      id
      name
      price
      stock
    }
  }
`;