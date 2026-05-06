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

  type RevenueDataPoint {
    date: String!
    revenue: Float!
    orderCount: Int!
  }

  type FunnelStep {
    step: String!
    count: Int!
    conversionRate: Float!
  }

  type FunnelAnalysis {
    steps: [FunnelStep!]!
    totalConversionRate: Float!
  }

  type VendorPerformance {
    vendorId: ID!
    vendorName: String!
    totalRevenue: Float!
    totalOrders: Int!
    averageOrderValue: Float!
    topProduct: String!
    rank: Int!
  }

  type BusinessAnalytics {
    totalSales: Float!
    totalOrders: Int!
    productCount: Int!
    conversionRate: Float!
    topProducts: [TopProductInsight!]!
    vendorRevenue: [VendorRevenueInsight!]!
  }

  type AdvancedAnalytics {
    revenueChart: [RevenueDataPoint!]!
    funnelAnalysis: FunnelAnalysis!
    vendorPerformance: [VendorPerformance!]!
  }

  extend type Query {
    businessAnalytics: BusinessAnalytics!
    vendorAnalytics: BusinessAnalytics!
    advancedAnalytics(
      period: String!
      startDate: String
      endDate: String
    ): AdvancedAnalytics!
  }
`;
