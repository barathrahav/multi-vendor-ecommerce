import { gql } from "@apollo/client";

export const GET_CATEGORIES = gql`
  query Categories {
    categories {
      id
      name
    }
  }
`;

export const GET_PRODUCTS = gql`
  query Products(
    $search: String
    $vendorId: ID
    $categoryId: ID
    $minPrice: Float
    $maxPrice: Float
    $sortBy: String
    $sortOrder: String
    $page: Int
    $limit: Int
  ) {
    products(
      search: $search
      vendorId: $vendorId
      categoryId: $categoryId
      minPrice: $minPrice
      maxPrice: $maxPrice
      sortBy: $sortBy
      sortOrder: $sortOrder
      page: $page
      limit: $limit
    ) {
      items {
        id
        name
        price
        stock
        imageUrl
        vendor {
          id
          name
        }
        category {
          name
        }
      }
      total
      page
      totalPages
    }
  }
`;

export const GET_PRODUCT = gql`
  query GetProduct($id: ID!) {
    product(id: $id) {
      id
      name
      description
      price
      stock
      imageUrl
      vendor {
        id
        name
      }
      category {
        id
        name
      }
    }
  }
`;
