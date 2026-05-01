ALTER TABLE "User" ADD COLUMN "phone" TEXT;

ALTER TABLE "Payment" ADD COLUMN "providerRefundId" TEXT;
ALTER TABLE "Payment" ADD COLUMN "refundedAt" TIMESTAMP(3);
