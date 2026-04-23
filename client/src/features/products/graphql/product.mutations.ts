import { gql } from "@apollo/client";

export const CREATE_PRODUCT = gql`
  mutation CreateProduct(
    $name: String!
    $description: String!
    $price: Float!
    $stock: Int!
    $categoryId: ID!
    $imageUrl: String
  ) {
    createProduct(
      name: $name
      description: $description
      price: $price
      stock: $stock
      categoryId: $categoryId
      imageUrl: $imageUrl
    ) {
      id
      name
      price
      stock
      imageUrl
      category {
        name
      }
      vendor {
        id
        name
      }
    }
  }
`;

export const UPDATE_PRODUCT = gql`
  mutation UpdateProduct(
    $id: ID!
    $name: String
    $description: String
    $price: Float
    $stock: Int
    $categoryId: ID
    $imageUrl: String
  ) {
    updateProduct(
      id: $id
      name: $name
      description: $description
      price: $price
      stock: $stock
      categoryId: $categoryId
      imageUrl: $imageUrl
    ) {
      id
      name
      description
      price
      stock
      imageUrl
      category {
        id
        name
      }
      vendor {
        id
        name
      }
    }
  }
`;

export const DELETE_PRODUCT = gql`
  mutation DeleteProduct($id: ID!) {
    deleteProduct(id: $id)
  }
`;
