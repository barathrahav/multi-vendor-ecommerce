import { gql } from "graphql-tag";

export const paymentTypeDefs = gql`
  type PaymentOrder {
    razorpayOrderId: String!
    amount: Float!
    currency: String!
  }

  extend type Mutation {
    createPaymentOrder(
      orderId: ID!
    ): PaymentOrder!

    verifyPayment(
      orderId: ID!
      razorpayOrderId: String!
      razorpayPaymentId: String!
      razorpaySignature: String!
    ): String!
  }
`;