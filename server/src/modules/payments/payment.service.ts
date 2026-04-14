import { prisma } from "../../config/prisma";
import { razorpay } from "../../config/razorpay";
import { Prisma } from "@prisma/client";

export const createPaymentOrderService = async (
  orderId: string,
  userId: string
) => {
  const order = await prisma.order.findFirst({
    where: {
      id: orderId,
      userId,
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

  await prisma.payment.create({
    data: {
      orderId: order.id,
      provider: "RAZORPAY",
      providerOrderId: razorpayOrder.id,
      amount: order.totalAmount,
      status: "CREATED",
    },
  });

  return {
    razorpayOrderId: razorpayOrder.id,
    amount: order.totalAmount,
    currency: "INR",
  };
};

import crypto from "crypto";

export const verifyPaymentService = async (
  orderId: string,
  razorpayOrderId: string,
  razorpayPaymentId: string,
  razorpaySignature: string
) => {
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

  await prisma.$transaction(
  async (tx: Prisma.TransactionClient) => {
    await tx.payment.update({
      where: { orderId },
      data: {
        providerPaymentId: razorpayPaymentId,
        status: "SUCCESS",
      },
    });

    await tx.order.update({
      where: { id: orderId },
      data: {
        status: "PAID",
      },
    });
  });

  return "Payment verified successfully";
};