import { gql } from "graphql-tag";

export const wishlistTypeDefs = gql`
  type WishlistItem {
    id: ID!
    product: Product!
    createdAt: String!
  }

  extend type Query {
    myWishlist: [WishlistItem!]!
  }

  extend type Mutation {
    addToWishlist(productId: ID!): WishlistItem!
    removeFromWishlist(productId: ID!): String!
  }
`;
