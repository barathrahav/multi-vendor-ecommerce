import { Prisma } from "@prisma/client";
import { prisma } from "../../config/prisma";
import { razorpay } from "../../config/razorpay";
import { notificationEvents } from "../notifications/notification.service";

const orderInclude = {
  user: true,
  items: {
    include: {
      product: {
        include: {
          vendor: true,
          category: true,
        },
      },
    },
  },
  payment: true,
  vendorSubOrders: {
    include: {
      vendor: true,
      items: true,
    },
  },
  statusHistory: {
    orderBy: {
      createdAt: "asc" as const,
    },
  },
};

const validStatuses = [
  "PENDING_PAYMENT",
  "PAID",
  "SHIPPED",
  "DELIVERED",
  "CANCELLED",
];

const formatOrder = (order: any) => ({
  ...order,
  createdAt: order.createdAt.toISOString(),
  updatedAt: order.updatedAt?.toISOString(),
  statusHistory:
    order.statusHistory?.map((history: any) => ({
      ...history,
      createdAt: history.createdAt.toISOString(),
    })) ?? [],
});

const assertValidStatus = (status: string) => {
  if (!validStatuses.includes(status)) {
    throw new Error("Invalid order status");
  }
};

const refundPayment = async (order: any) => {
  if (order.status !== "PAID") {
    return { status: order.payment ? "CANCELLED" : undefined };
  }

  if (!order.payment?.providerPaymentId) {
    return { status: "REFUND_PENDING" };
  }

  try {
    const refund = await (razorpay.payments as any).refund(
      order.payment.providerPaymentId,
      {
        amount: Math.round(order.totalAmount * 100),
        notes: {
          orderId: order.id,
        },
      }
    );

    return {
      status: "REFUNDED",
      providerRefundId: refund.id as string | undefined,
    };
  } catch (error) {
    console.error("[refund:error]", error);
    return { status: "REFUND_PENDING" };
  }
};

export const placeOrderService = async (userId: string) => {
  const cart = await prisma.cart.findUnique({
    where: { userId },
    include: {
      items: {
        include: {
          product: true,
        },
      },
    },
  });

  if (!cart || cart.items.length === 0) {
    throw new Error("Cart is empty");
  }

  for (const item of cart.items) {
    if (item.product.stock < item.quantity) {
      throw new Error(`${item.product.name} has insufficient stock`);
    }
  }

  const totalAmount = cart.items.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );

  const order = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
    const createdOrder = await tx.order.create({
      data: {
        userId,
        totalAmount,
        status: "PENDING_PAYMENT",
        statusHistory: {
          create: [{ status: "PENDING_PAYMENT" }],
        },
        items: {
          create: cart.items.map((item) => ({
            productId: item.productId,
            name: item.product.name,
            price: item.product.price,
            quantity: item.quantity,
          })),
        },
      },
      include: orderInclude,
    });

    const itemsByVendor = new Map<string, typeof createdOrder.items>();

    for (const item of createdOrder.items) {
      const vendorId = item.product.vendorId;
      itemsByVendor.set(vendorId, [...(itemsByVendor.get(vendorId) ?? []), item]);
    }

    for (const [vendorId, vendorItems] of itemsByVendor.entries()) {
      const subOrder = await tx.vendorSubOrder.create({
        data: {
          orderId: createdOrder.id,
          vendorId,
          status: "PENDING_PAYMENT",
          totalAmount: vendorItems.reduce(
            (sum, item) => sum + item.price * item.quantity,
            0
          ),
        },
      });

      await tx.orderItem.updateMany({
        where: {
          id: {
            in: vendorItems.map((item) => item.id),
          },
        },
        data: {
          vendorSubOrderId: subOrder.id,
        },
      });
    }

    for (const item of cart.items) {
      await tx.product.update({
        where: { id: item.productId },
        data: {
          stock: {
            decrement: item.quantity,
          },
        },
      });
    }

    await tx.cartItem.deleteMany({
      where: { cartId: cart.id },
    });

    return tx.order.findUniqueOrThrow({
      where: { id: createdOrder.id },
      include: orderInclude,
    });
  });

  await notificationEvents.orderPlaced(order);

  return formatOrder(order);
};

export const getMyOrdersService = async (userId: string) => {
  const orders = await prisma.order.findMany({
    where: { userId },
    include: orderInclude,
    orderBy: { createdAt: "desc" },
  });

  return orders.map(formatOrder);
};

export const getAllOrdersService = async () => {
  const orders = await prisma.order.findMany({
    include: orderInclude,
    orderBy: { createdAt: "desc" },
  });

  return orders.map(formatOrder);
};

export const getVendorOrdersService = async (vendorId: string) => {
  const orders = await prisma.order.findMany({
    where: {
      vendorSubOrders: {
        some: { vendorId },
      },
    },
    include: orderInclude,
    orderBy: { createdAt: "desc" },
  });

  return orders.map(formatOrder);
};

export const getOrderByIdService = async (id: string, userId: string) => {
  const order = await prisma.order.findFirst({
    where: { id, userId },
    include: orderInclude,
  });

  if (!order) return null;

  return formatOrder(order);
};

export const cancelOrderService = async (orderId: string, userId?: string) => {
  const order = await prisma.order.findFirst({
    where: {
      id: orderId,
      ...(userId ? { userId } : {}),
    },
    include: orderInclude,
  });

  if (!order) {
    throw new Error("Order not found");
  }

  if (order.status === "CANCELLED") {
    throw new Error("Order is already cancelled");
  }

  if (!["PENDING_PAYMENT", "PAID"].includes(order.status)) {
    throw new Error("Only pending or paid orders can be cancelled");
  }

  const refund = await refundPayment(order);

  const updated = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
    for (const item of order.items) {
      await tx.product.update({
        where: { id: item.productId },
        data: {
          stock: {
            increment: item.quantity,
          },
        },
      });
    }

    if (order.payment) {
      await tx.payment.update({
        where: { orderId },
        data: {
          status: refund.status ?? "CANCELLED",
          providerRefundId: refund.providerRefundId,
          refundedAt: refund.status === "REFUNDED" ? new Date() : undefined,
        },
      });
    }

    await tx.orderStatusHistory.create({
      data: {
        orderId,
        status: "CANCELLED",
      },
    });

    return tx.order.update({
      where: { id: orderId },
      data: {
        status: "CANCELLED",
      },
      include: orderInclude,
    });
  });

  await notificationEvents.orderStatusChanged(updated);

  if (refund.status === "REFUNDED" || refund.status === "REFUND_PENDING") {
    await notificationEvents.refund(updated, refund.status);
  }

  return formatOrder(updated);
};

export const updateOrderStatusService = async (
  orderId: string,
  status: string
) => {
  assertValidStatus(status);

  if (status === "CANCELLED") {
    return cancelOrderService(orderId);
  }

  const existingOrder = await prisma.order.findUnique({
    where: { id: orderId },
  });

  if (!existingOrder) {
    throw new Error("Order not found");
  }

  if (existingOrder.status === "CANCELLED") {
    throw new Error("Cancelled orders cannot be updated");
  }

  const updated = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
    await tx.orderStatusHistory.create({
      data: {
        orderId,
        status: status as any,
      },
    });

    return tx.order.update({
      where: { id: orderId },
      data: {
        status: status as any,
      },
      include: orderInclude,
    });
  });

  await notificationEvents.orderStatusChanged(updated);

  return formatOrder(updated);
};

export const updateVendorOrderStatusService = async (
  orderId: string,
  vendorId: string,
  status: string
) => {
  assertValidStatus(status);

  const existingOrder = await prisma.order.findFirst({
    where: {
      id: orderId,
      vendorSubOrders: {
        some: { vendorId },
      },
    },
  });

  if (!existingOrder) {
    throw new Error("Order not found for this vendor");
  }

  if (status === "CANCELLED") {
    return cancelOrderService(orderId);
  }

  if (existingOrder.status === "CANCELLED") {
    throw new Error("Cancelled orders cannot be updated");
  }

  const updated = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
    await tx.vendorSubOrder.updateMany({
      where: {
        orderId,
        vendorId,
      },
      data: {
        status: status as any,
      },
    });

    await tx.orderStatusHistory.create({
      data: {
        orderId,
        status: status as any,
      },
    });

    return tx.order.update({
      where: { id: orderId },
      data: { status: status as any },
      include: orderInclude,
    });
  });

  await notificationEvents.orderStatusChanged(updated);

  return formatOrder(updated);
};
