import { gql } from "@apollo/client";

export const GET_MY_WISHLIST = gql`
  query MyWishlist {
    myWishlist {
      id
      createdAt
      product {
        id
        name
        price
        stock
        imageUrl
        vendor {
          id
          name
        }
        category {
          name
        }
      }
    }
  }
`;
