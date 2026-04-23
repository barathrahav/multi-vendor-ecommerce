import { gql } from "@apollo/client";

export const GET_ALL_ORDERS = gql`
  query GetAllOrders {
    allOrders {
      id
      totalAmount
      status
      createdAt
      user {
        id
        name
        email
      }
      items {
        id
        name
        price
        quantity
        product {
          id
          vendor {
            id
            name
          }
        }
      }
    }
  }
`;
