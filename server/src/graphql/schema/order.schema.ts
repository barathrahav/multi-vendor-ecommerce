import { gql } from "graphql-tag";

export const orderTypeDefs = gql`
  type OrderItem {
    id: ID!
    name: String!
    price: Float!
    quantity: Int!
    product: Product!
  }

  type Order {
    id: ID!
    totalAmount: Float!
    status: String!
    items: [OrderItem!]!
    createdAt: String!
    user: User!
    statusHistory: [OrderStatusHistory!]!
  }

  type OrderStatusHistory {
    id: ID!
    status: String!
    createdAt: String!
  }

  extend type Query {
    myOrders: [Order!]!
    order(id: ID!): Order
    vendorOrders: [Order!]!
    allOrders: [Order!]!
  }

  extend type Mutation {
    placeOrder: Order!
    cancelOrder(orderId: ID!): Order!
    vendorUpdateOrderStatus(
      orderId: ID!
      status: String!
    ): Order!
  }

  extend type Mutation {
  updateOrderStatus(
    orderId: ID!
    status: String!
  ): Order!
  }
`;
