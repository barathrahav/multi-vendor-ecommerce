import { prisma } from "../../config/prisma";

export const getBusinessAnalyticsService = async (vendorId?: string) => {
  const orderWhere: any = {
    status: {
      in: ["PAID", "SHIPPED", "DELIVERED"],
    },
  };

  if (vendorId) {
    orderWhere.vendorSubOrders = {
      some: { vendorId },
    };
  }

  const [orders, productsCount, paidOrdersCount, allOrdersCount] =
    await Promise.all([
      prisma.order.findMany({
        where: orderWhere,
        include: {
          items: {
            include: {
              product: true,
            },
          },
          vendorSubOrders: true,
        },
      }),
      prisma.product.count(vendorId ? { where: { vendorId } } : undefined),
      prisma.order.count({ where: orderWhere }),
      prisma.order.count(
        vendorId
          ? {
              where: {
                vendorSubOrders: {
                  some: { vendorId },
                },
              },
            }
          : undefined
      ),
    ]);

  const totalSales = orders.reduce((sum, order) => {
    if (!vendorId) return sum + order.totalAmount;

    return (
      sum +
      order.vendorSubOrders
        .filter((subOrder) => subOrder.vendorId === vendorId)
        .reduce((subSum, subOrder) => subSum + subOrder.totalAmount, 0)
    );
  }, 0);
  const productSales = new Map<string, { name: string; quantity: number; revenue: number }>();
  const vendorRevenue = new Map<string, number>();

  orders.forEach((order) => {
    order.items.forEach((item) => {
      if (vendorId && item.product.vendorId !== vendorId) return;

      const existing = productSales.get(item.productId) ?? {
        name: item.name,
        quantity: 0,
        revenue: 0,
      };

      existing.quantity += item.quantity;
      existing.revenue += item.price * item.quantity;
      productSales.set(item.productId, existing);
      vendorRevenue.set(
        item.product.vendorId,
        (vendorRevenue.get(item.product.vendorId) ?? 0) + item.price * item.quantity
      );
    });
  });

  return {
    totalSales,
    totalOrders: paidOrdersCount,
    productCount: productsCount,
    conversionRate: allOrdersCount === 0 ? 0 : paidOrdersCount / allOrdersCount,
    topProducts: [...productSales.entries()]
      .map(([productId, value]) => ({ productId, ...value }))
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 10),
    vendorRevenue: [...vendorRevenue.entries()].map(([vendorId, revenue]) => ({
      vendorId,
      revenue,
    })),
  };
};

export const getRevenueChartService = async (
  period: string,
  startDate?: string,
  endDate?: string,
  vendorId?: string
) => {
  const dateFilter: any = {};

  if (startDate && endDate) {
    dateFilter.createdAt = {
      gte: new Date(startDate),
      lte: new Date(endDate),
    };
  }

  const orderWhere: any = {
    status: {
      in: ["PAID", "SHIPPED", "DELIVERED"],
    },
    ...dateFilter,
  };

  if (vendorId) {
    orderWhere.vendorSubOrders = {
      some: { vendorId },
    };
  }

  const orders = await prisma.order.findMany({
    where: orderWhere,
    include: {
      vendorSubOrders: vendorId ? { where: { vendorId } } : true,
    },
  });

  const revenueByDate = new Map<string, { revenue: number; orderCount: number }>();

  orders.forEach((order) => {
    const date = new Date(order.createdAt);
    let dateKey: string;

    switch (period) {
      case "daily":
        dateKey = date.toISOString().split("T")[0];
        break;
      case "monthly":
        dateKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
        break;
      case "yearly":
        dateKey = String(date.getFullYear());
        break;
      default:
        dateKey = date.toISOString().split("T")[0];
    }

    const existing = revenueByDate.get(dateKey) ?? { revenue: 0, orderCount: 0 };

    if (vendorId) {
      const vendorSubOrder = order.vendorSubOrders.find(sub => sub.vendorId === vendorId);
      if (vendorSubOrder) {
        existing.revenue += vendorSubOrder.totalAmount;
        existing.orderCount += 1;
      }
    } else {
      existing.revenue += order.totalAmount;
      existing.orderCount += 1;
    }

    revenueByDate.set(dateKey, existing);
  });

  return [...revenueByDate.entries()]
    .map(([date, data]) => ({
      date,
      revenue: data.revenue,
      orderCount: data.orderCount,
    }))
    .sort((a, b) => a.date.localeCompare(b.date));
};

export const getFunnelAnalysisService = async (
  startDate?: string,
  endDate?: string,
  vendorId?: string
) => {
  const dateFilter: any = {};

  if (startDate && endDate) {
    dateFilter.createdAt = {
      gte: new Date(startDate),
      lte: new Date(endDate),
    };
  }

  // Cart additions (step 1)
  const cartWhere: any = { ...dateFilter };
  if (vendorId) {
    cartWhere.product = { vendorId };
  }

  const cartAdditions = await prisma.cartItem.count({
    where: cartWhere,
  });

  // Checkout attempts (orders created, step 2)
  const checkoutWhere: any = { ...dateFilter };
  if (vendorId) {
    checkoutWhere.vendorSubOrders = { some: { vendorId } };
  }

  const checkoutAttempts = await prisma.order.count({
    where: checkoutWhere,
  });

  // Successful purchases (paid orders, step 3)
  const purchaseWhere: any = {
    status: { in: ["PAID", "SHIPPED", "DELIVERED"] },
    ...dateFilter,
  };
  if (vendorId) {
    purchaseWhere.vendorSubOrders = { some: { vendorId } };
  }

  const successfulPurchases = await prisma.order.count({
    where: purchaseWhere,
  });

  const steps = [
    {
      step: "Cart",
      count: cartAdditions,
      conversionRate: 100,
    },
    {
      step: "Checkout",
      count: checkoutAttempts,
      conversionRate: cartAdditions > 0 ? (checkoutAttempts / cartAdditions) * 100 : 0,
    },
    {
      step: "Purchase",
      count: successfulPurchases,
      conversionRate: checkoutAttempts > 0 ? (successfulPurchases / checkoutAttempts) * 100 : 0,
    },
  ];

  const totalConversionRate = cartAdditions > 0 ? (successfulPurchases / cartAdditions) * 100 : 0;

  return {
    steps,
    totalConversionRate,
  };
};

export const getVendorPerformanceService = async (
  startDate?: string,
  endDate?: string
) => {
  const dateFilter: any = {};

  if (startDate && endDate) {
    dateFilter.createdAt = {
      gte: new Date(startDate),
      lte: new Date(endDate),
    };
  }

  const vendorSubOrders = await prisma.vendorSubOrder.findMany({
    where: {
      status: { in: ["PAID", "SHIPPED", "DELIVERED"] },
      order: dateFilter,
    },
    include: {
      vendor: true,
      order: {
        include: {
          items: {
            include: {
              product: true,
            },
          },
        },
      },
    },
  });

  const vendorStats = new Map<string, {
    vendorId: string;
    vendorName: string;
    totalRevenue: number;
    totalOrders: number;
    products: Map<string, { name: string; revenue: number }>;
  }>();

  vendorSubOrders.forEach((subOrder) => {
    const existing = vendorStats.get(subOrder.vendorId) ?? {
      vendorId: subOrder.vendorId,
      vendorName: subOrder.vendor.name,
      totalRevenue: 0,
      totalOrders: 0,
      products: new Map(),
    };

    existing.totalRevenue += subOrder.totalAmount;
    existing.totalOrders += 1;

    // Track product performance for this vendor
    subOrder.order.items.forEach((item) => {
      if (item.product.vendorId === subOrder.vendorId) {
        const productKey = item.productId;
        const productData = existing.products.get(productKey) ?? {
          name: item.product.name,
          revenue: 0,
        };
        productData.revenue += item.price * item.quantity;
        existing.products.set(productKey, productData);
      }
    });

    vendorStats.set(subOrder.vendorId, existing);
  });

  return [...vendorStats.entries()]
    .map(([_, stats]) => {
      const products = [...stats.products.entries()];
      const topProduct = products.length > 0
        ? products.sort((a, b) => b[1].revenue - a[1].revenue)[0][1].name
        : "No products";

      return {
        vendorId: stats.vendorId,
        vendorName: stats.vendorName,
        totalRevenue: stats.totalRevenue,
        totalOrders: stats.totalOrders,
        averageOrderValue: stats.totalOrders > 0 ? stats.totalRevenue / stats.totalOrders : 0,
        topProduct,
        rank: 0, // Will be set after sorting
      };
    })
    .sort((a, b) => b.totalRevenue - a.totalRevenue)
    .map((vendor, index) => ({ ...vendor, rank: index + 1 }));
};

export const getAdvancedAnalyticsService = async (
  period: string,
  startDate?: string,
  endDate?: string,
  vendorId?: string
) => {
  const [revenueChart, funnelAnalysis, vendorPerformance] = await Promise.all([
    getRevenueChartService(period, startDate, endDate, vendorId),
    getFunnelAnalysisService(startDate, endDate, vendorId),
    vendorId ? [] : getVendorPerformanceService(startDate, endDate),
  ]);

  return {
    revenueChart,
    funnelAnalysis,
    vendorPerformance,
  };
};
