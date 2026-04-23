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
  products(
    search: String
    vendorId: ID
    categoryId: ID
    minPrice: Float
    maxPrice: Float
    sortBy: String
    sortOrder: String
    page: Int = 1
    limit: Int = 10
  ): ProductPagination!

  product(id: ID!): Product
}

type ProductPagination {
  items: [Product!]!
  total: Int!
  page: Int!
  totalPages: Int!
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
