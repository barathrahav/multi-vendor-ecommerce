import { gql } from "graphql-tag";

export const analyticsTypeDefs = gql`
  type TopProductInsight {
    productId: ID!
    name: String!
    quantity: Int!
    revenue: Float!
  }

  type VendorRevenueInsight {
    vendorId: ID!
    revenue: Float!
  }

  type BusinessAnalytics {
    totalSales: Float!
    totalOrders: Int!
    productCount: Int!
    conversionRate: Float!
    topProducts: [TopProductInsight!]!
    vendorRevenue: [VendorRevenueInsight!]!
  }

  extend type Query {
    businessAnalytics: BusinessAnalytics!
    vendorAnalytics: BusinessAnalytics!
  }
`;
