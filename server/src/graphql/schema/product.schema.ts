import { gql } from "graphql-tag";

export const productTypeDefs = gql`
  type Product {
    id: ID!
    name: String!
    description: String!
    price: Float!
    stock: Int!
    imageUrl: String
    vendor: User!
    category: Category!
    createdAt: String!
    updatedAt: String!
  }

  extend type Query {
    products: [Product!]!
    product(id: ID!): Product
  }

  extend type Mutation {
    createProduct(
      name: String!
      description: String!
      price: Float!
      stock: Int!
      categoryId: ID!
      imageUrl: String
    ): Product!

    updateProduct(
      id: ID!
      name: String
      description: String
      price: Float
      stock: Int
      categoryId: ID
      imageUrl: String
    ): Product!

    deleteProduct(id: ID!): String!
  }
`;