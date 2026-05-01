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
