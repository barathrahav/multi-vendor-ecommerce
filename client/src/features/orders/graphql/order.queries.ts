import { gql } from "@apollo/client";

export const GET_MY_ORDERS = gql`
  query {
    myOrders {
      id
      totalAmount
      status
      createdAt
      items {
        id
        name
        price
        quantity
      }
    }
  }
`;

export const GET_VENDOR_ORDERS = gql`
  query VendorOrders {
    vendorOrders {
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
          }
        }
      }
    }
  }
`;
