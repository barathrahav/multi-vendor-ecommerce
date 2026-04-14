import { gql } from "graphql-tag";

export const cartTypeDefs = gql`
  type CartItem {
    id: ID!
    quantity: Int!
    product: Product!
  }

  type Cart {
    id: ID!
    items: [CartItem!]!
    createdAt: String!
    updatedAt: String!
  }

  extend type Query {
    cart: Cart
  }

  extend type Mutation {
    addToCart(
      productId: ID!
      quantity: Int!
    ): Cart!

    updateCartItem(
      productId: ID!
      quantity: Int!
    ): Cart!

    removeFromCart(
      productId: ID!
    ): Cart!

    clearCart: String!
  }
`;