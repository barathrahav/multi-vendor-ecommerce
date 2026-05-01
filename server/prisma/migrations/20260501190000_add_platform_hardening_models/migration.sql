ALTER TABLE "OrderItem" ADD COLUMN "vendorSubOrderId" TEXT;

CREATE TABLE "RefreshToken" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "revokedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "RefreshToken_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "OtpCode" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "phone" TEXT NOT NULL,
    "codeHash" TEXT NOT NULL,
    "purpose" TEXT NOT NULL,
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "consumedAt" TIMESTAMP(3),
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "OtpCode_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "IdempotencyRecord" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "scope" TEXT NOT NULL,
    "userId" TEXT,
    "status" TEXT NOT NULL,
    "response" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "IdempotencyRecord_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "VendorSubOrder" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "vendorId" TEXT NOT NULL,
    "totalAmount" DOUBLE PRECISION NOT NULL,
    "status" "OrderStatus" NOT NULL DEFAULT 'PENDING_PAYMENT',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "VendorSubOrder_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "RefreshToken_tokenHash_key" ON "RefreshToken"("tokenHash");
CREATE INDEX "RefreshToken_userId_idx" ON "RefreshToken"("userId");
CREATE INDEX "OtpCode_phone_purpose_createdAt_idx" ON "OtpCode"("phone", "purpose", "createdAt");
CREATE UNIQUE INDEX "IdempotencyRecord_key_key" ON "IdempotencyRecord"("key");
CREATE INDEX "IdempotencyRecord_scope_userId_idx" ON "IdempotencyRecord"("scope", "userId");
CREATE UNIQUE INDEX "VendorSubOrder_orderId_vendorId_key" ON "VendorSubOrder"("orderId", "vendorId");
CREATE INDEX "VendorSubOrder_vendorId_status_idx" ON "VendorSubOrder"("vendorId", "status");

ALTER TABLE "RefreshToken" ADD CONSTRAINT "RefreshToken_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "OtpCode" ADD CONSTRAINT "OtpCode_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "VendorSubOrder" ADD CONSTRAINT "VendorSubOrder_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "VendorSubOrder" ADD CONSTRAINT "VendorSubOrder_vendorId_fkey" FOREIGN KEY ("vendorId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "OrderItem" ADD CONSTRAINT "OrderItem_vendorSubOrderId_fkey" FOREIGN KEY ("vendorSubOrderId") REFERENCES "VendorSubOrder"("id") ON DELETE SET NULL ON UPDATE CASCADE;
