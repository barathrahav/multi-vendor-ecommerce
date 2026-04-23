import { gql } from "@apollo/client";

export const GET_CART = gql`
  query GetCart {
    cart {
      id
      items {
        id
        quantity
        product {
          id
          name
          price
          imageUrl
        }
      }
    }
  }
`;