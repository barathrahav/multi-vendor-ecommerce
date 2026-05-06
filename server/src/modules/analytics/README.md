# Advanced Analytics API

This document describes the advanced analytics features available in the multi-vendor e-commerce platform.

## Revenue Charts

Get revenue data aggregated by time periods (daily, monthly, yearly).

### Query

```graphql
query GetRevenueChart($period: String!, $startDate: String, $endDate: String) {
  advancedAnalytics(period: $period, startDate: $startDate, endDate: $endDate) {
    revenueChart {
      date
      revenue
      orderCount
    }
  }
}
```

### Variables

- `period`: `"daily"`, `"monthly"`, or `"yearly"`
- `startDate`: Optional ISO date string (e.g., "2024-01-01")
- `endDate`: Optional ISO date string (e.g., "2024-12-31")

### Example Response

```json
{
  "data": {
    "advancedAnalytics": {
      "revenueChart": [
        {
          "date": "2024-01-01",
          "revenue": 12500.50,
          "orderCount": 45
        },
        {
          "date": "2024-01-02",
          "revenue": 8900.25,
          "orderCount": 32
        }
      ]
    }
  }
}
```

## Funnel Analysis

Analyze the conversion funnel from cart additions to successful purchases.

### Query

```graphql
query GetFunnelAnalysis($startDate: String, $endDate: String) {
  advancedAnalytics(period: "daily", startDate: $startDate, endDate: $endDate) {
    funnelAnalysis {
      steps {
        step
        count
        conversionRate
      }
      totalConversionRate
    }
  }
}
```

### Example Response

```json
{
  "data": {
    "advancedAnalytics": {
      "funnelAnalysis": {
        "steps": [
          {
            "step": "Cart",
            "count": 1000,
            "conversionRate": 100.0
          },
          {
            "step": "Checkout",
            "count": 750,
            "conversionRate": 75.0
          },
          {
            "step": "Purchase",
            "count": 600,
            "conversionRate": 80.0
          }
        ],
        "totalConversionRate": 60.0
      }
    }
  }
}
```

## Vendor Performance Ranking

Get a ranked list of vendor performance metrics.

### Query

```graphql
query GetVendorPerformance($startDate: String, $endDate: String) {
  advancedAnalytics(period: "monthly", startDate: $startDate, endDate: $endDate) {
    vendorPerformance {
      vendorId
      vendorName
      totalRevenue
      totalOrders
      averageOrderValue
      topProduct
      rank
    }
  }
}
```

### Example Response

```json
{
  "data": {
    "advancedAnalytics": {
      "vendorPerformance": [
        {
          "vendorId": "vendor-1",
          "vendorName": "TechStore Pro",
          "totalRevenue": 45000.00,
          "totalOrders": 180,
          "averageOrderValue": 250.00,
          "topProduct": "Wireless Headphones",
          "rank": 1
        },
        {
          "vendorId": "vendor-2",
          "vendorName": "Fashion Hub",
          "totalRevenue": 32000.00,
          "totalOrders": 95,
          "averageOrderValue": 336.84,
          "topProduct": "Designer Jacket",
          "rank": 2
        }
      ]
    }
  }
}
```

## Authorization

- **Admin**: Can access all analytics (business-wide and vendor-specific)
- **Vendor**: Can only access their own analytics data

## Notes

- Revenue charts only include completed orders (PAID, SHIPPED, DELIVERED status)
- Funnel analysis tracks: Cart Additions → Checkout Attempts → Successful Purchases
- Vendor performance is ranked by total revenue (highest to lowest)
- All queries support optional date filtering
- For vendors, analytics are automatically scoped to their products/orders