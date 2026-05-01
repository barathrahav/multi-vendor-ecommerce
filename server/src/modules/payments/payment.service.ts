import { prisma } from "../../config/prisma";
import { razorpay } from "../../config/razorpay";
import { Prisma } from "@prisma/client";
import { notificationEvents } from "../notifications/notification.service";

export const createPaymentOrderService = async (
  orderId: string,
  userId: string,
  idempotencyKey?: string
) => {
  if (idempotencyKey) {
    const existing = await prisma.idempotencyRecord.findUnique({
      where: { key: idempotencyKey },
    });

    if (existing?.response) {
      return existing.response as any;
    }
  }

  const order = await prisma.order.findFirst({
    where: {
      id: orderId,
      userId,
    },
    include: {
      user: true,
    },
  });

  if (!order) {
    throw new Error("Order not found");
  }

  if (order.status !== "PENDING_PAYMENT") {
    throw new Error("Order already paid or invalid");
  }

  const razorpayOrder = await razorpay.orders.create({
    amount: Math.round(order.totalAmount * 100),
    currency: "INR",
    receipt: order.id,
  });

  await prisma.payment.upsert({
    where: {
      orderId: order.id,
    },
    update: {
      providerOrderId: razorpayOrder.id,
      amount: order.totalAmount,
      status: "CREATED",
      providerPaymentId: null,
      providerRefundId: null,
      refundedAt: null,
    },
    create: {
      orderId: order.id,
      provider: "RAZORPAY",
      providerOrderId: razorpayOrder.id,
      amount: order.totalAmount,
      status: "CREATED",
    },
  });

  await notificationEvents.payment(order, "CREATED");

  const responsePayload = {
    razorpayOrderId: razorpayOrder.id,
    amount: order.totalAmount,
    currency: "INR",
  };

  if (idempotencyKey) {
    await prisma.idempotencyRecord.upsert({
      where: { key: idempotencyKey },
      update: {
        status: "COMPLETED",
        response: responsePayload,
      },
      create: {
        key: idempotencyKey,
        scope: "CREATE_PAYMENT_ORDER",
        userId,
        status: "COMPLETED",
        response: responsePayload,
      },
    });
  }

  return responsePayload;
};

import crypto from "crypto";

export const verifyPaymentService = async (
  orderId: string,
  razorpayOrderId: string,
  razorpayPaymentId: string,
  razorpaySignature: string,
  idempotencyKey?: string
) => {
  if (idempotencyKey) {
    const existing = await prisma.idempotencyRecord.findUnique({
      where: { key: idempotencyKey },
    });

    if (existing?.response) {
      return "Payment verified successfully";
    }
  }

  const generatedSignature = crypto
    .createHmac(
      "sha256",
      process.env.RAZORPAY_KEY_SECRET!
    )
    .update(
      `${razorpayOrderId}|${razorpayPaymentId}`
    )
    .digest("hex");

  if (generatedSignature !== razorpaySignature) {
    throw new Error("Invalid payment signature");
  }

  const order = await prisma.$transaction(
  async (tx: Prisma.TransactionClient) => {
    await tx.payment.update({
      where: { orderId },
      data: {
        providerPaymentId: razorpayPaymentId,
        status: "SUCCESS",
      },
    });

    await tx.orderStatusHistory.create({
      data: {
        orderId,
        status: "PAID",
      },
    });

    return tx.order.update({
      where: { id: orderId },
      data: {
        status: "PAID",
      },
      include: {
        user: true,
      },
    });
  });

  await notificationEvents.payment(order, "SUCCESS");
  await notificationEvents.orderStatusChanged(order);

  if (idempotencyKey) {
    await prisma.idempotencyRecord.upsert({
      where: { key: idempotencyKey },
      update: {
        status: "COMPLETED",
        response: { ok: true },
      },
      create: {
        key: idempotencyKey,
        scope: "VERIFY_PAYMENT",
        userId: order.userId,
        status: "COMPLETED",
        response: { ok: true },
      },
    });
  }

  return "Payment verified successfully";
};

export const markPaymentFailedService = async (
  orderId: string,
  userId: string,
  reason?: string
) => {
  const order = await prisma.order.findFirst({
    where: {
      id: orderId,
      userId,
    },
    include: {
      user: true,
    },
  });

  if (!order) {
    throw new Error("Order not found");
  }

  await prisma.payment.updateMany({
    where: { orderId },
    data: {
      status: "FAILED",
    },
  });

  await notificationEvents.payment(order, reason ? `FAILED: ${reason}` : "FAILED");

  return "Payment marked as failed";
};
