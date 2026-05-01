import { gql } from "@apollo/client";

export const PLACE_ORDER = gql`
  mutation {
    placeOrder {
      id
      totalAmount
      status
    }
  }
`;

export const CANCEL_ORDER = gql`
  mutation CancelOrder($orderId: ID!) {
    cancelOrder(orderId: $orderId) {
      id
      status
      statusHistory {
        id
        status
        createdAt
      }
    }
  }
`;

export const VENDOR_UPDATE_ORDER_STATUS = gql`
  mutation VendorUpdateOrderStatus($orderId: ID!, $status: String!) {
    vendorUpdateOrderStatus(orderId: $orderId, status: $status) {
      id
      status
      statusHistory {
        id
        status
        createdAt
      }
    }
  }
`;
