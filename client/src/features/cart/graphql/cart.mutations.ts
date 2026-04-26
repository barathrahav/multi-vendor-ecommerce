import { gql } from "@apollo/client";

export const ADD_TO_CART = gql`
  mutation AddToCart(
    $productId: ID!
    $quantity: Int!
  ) {
    addToCart(
      productId: $productId
      quantity: $quantity
    ) {
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

export const UPDATE_CART = gql`
  mutation UpdateCartItem(
    $productId: ID!
    $quantity: Int!
  ) {
    updateCartItem(
      productId: $productId
      quantity: $quantity
    ) {
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

export const REMOVE_CART = gql`
  mutation RemoveFromCart($productId: ID!) {
    removeFromCart(productId: $productId) {
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

export const CLEAR_CART = gql`
  mutation {
    clearCart
  }
`;
