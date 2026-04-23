import { gql } from "@apollo/client";

export const CREATE_PAYMENT_ORDER = gql`
  mutation CreatePaymentOrder($orderId: ID!) {
    createPaymentOrder(orderId: $orderId) {
      razorpayOrderId
      amount
      currency
    }
  }
`;

export const VERIFY_PAYMENT = gql`
  mutation VerifyPayment(
    $orderId: ID!
    $razorpayOrderId: String!
    $razorpayPaymentId: String!
    $razorpaySignature: String!
  ) {
    verifyPayment(
      orderId: $orderId
      razorpayOrderId: $razorpayOrderId
      razorpayPaymentId: $razorpayPaymentId
      razorpaySignature: $razorpaySignature
    )
  }
`;