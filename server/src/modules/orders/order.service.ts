import { prisma } from "../../config/prisma";
import { Prisma } from "@prisma/client";

export const placeOrderService = async (
  userId: string
) => {
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

  // Validate stock
  for (const item of cart.items) {
    if (item.product.stock < item.quantity) {
      throw new Error(
        `${item.product.name} has insufficient stock`
      );
    }
  }

  const totalAmount = cart.items.reduce(
  (
    sum: number,
    item: typeof cart.items[number]
  ) =>
    sum + item.product.price * item.quantity,
  0
);

  return prisma.$transaction(
  async (tx: Prisma.TransactionClient) => {
    const order = await tx.order.create({
      data: {
        userId,
        totalAmount,
        status: "PENDING_PAYMENT",
        items: {
          create: cart.items.map(
  (item: typeof cart.items[number]) => ({
            productId: item.productId,
            name: item.product.name,
            price: item.product.price,
            quantity: item.quantity,
          })),
        },
      },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    });

    // Reduce stock
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

    // Clear cart
    await tx.cartItem.deleteMany({
      where: {
        cartId: cart.id,
      },
    });

    return order;
  });
};

export const getMyOrdersService = async (
  userId: string
) => {
  return prisma.order.findMany({
    where: { userId },
    include: {
      items: {
        include: {
          product: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });
};

export const getAllOrdersService = async () => {
  return prisma.order.findMany({
    include: {
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
    },
    orderBy: {
      createdAt: "desc",
    },
  });
};

export const getVendorOrdersService = async (
  vendorId: string
) => {
  return prisma.order.findMany({
    where: {
      items: {
        some: {
          product: {
            vendorId,
          },
        },
      },
    },
    include: {
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
    },
    orderBy: {
      createdAt: "desc",
    },
  });
};

export const getOrderByIdService = async (
  id: string,
  userId: string
) => {
  return prisma.order.findFirst({
    where: {
      id,
      userId,
    },
    include: {
      items: {
        include: {
          product: true,
        },
      },
    },
  });
};

export const updateOrderStatusService = async (
  orderId: string,
  status: string
) => {
  const existingOrder = await prisma.order.findUnique({
    where: { id: orderId },
  });

  if (!existingOrder) {
    throw new Error("Order not found");
  }

  return prisma.order.update({
    where: { id: orderId },
    data: {
      status: status as any,
    },
    include: {
      items: {
        include: {
          product: true,
        },
      },
    },
  });
};

export const updateVendorOrderStatusService = async (
  orderId: string,
  vendorId: string,
  status: string
) => {
  const existingOrder = await prisma.order.findFirst({
    where: {
      id: orderId,
      items: {
        some: {
          product: {
            vendorId,
          },
        },
      },
    },
  });

  if (!existingOrder) {
    throw new Error("Order not found for this vendor");
  }

  return prisma.order.update({
    where: { id: orderId },
    data: {
      status: status as any,
    },
    include: {
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
    },
  });
};
