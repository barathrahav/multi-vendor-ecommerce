import { gql } from "@apollo/client";

export const CREATE_PRODUCT = gql`
  mutation CreateProduct(
    $name: String!
    $price: Float!
    $categoryId: ID!
    $stock: Int!
    $imageUrl: String
  ) {
    createProduct(
      name: $name
      price: $price
      categoryId: $categoryId
      stock: $stock
      imageUrl: $imageUrl
    ) {
      id
      name
    }
  }
`;