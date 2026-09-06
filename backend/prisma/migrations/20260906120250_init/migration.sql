/*
  Warnings:

  - You are about to drop the column `gatewayOrderId` on the `Payment` table. All the data in the column will be lost.
  - You are about to drop the column `gatewayPaymentId` on the `Payment` table. All the data in the column will be lost.
  - You are about to drop the column `gatewaySignature` on the `Payment` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "PaymentAttemptStatus" AS ENUM ('CREATED', 'SUCCESS', 'FAILED');

-- DropIndex
DROP INDEX "Payment_gatewayOrderId_key";

-- DropIndex
DROP INDEX "Payment_gatewayPaymentId_key";

-- AlterTable
ALTER TABLE "Payment" DROP COLUMN "gatewayOrderId",
DROP COLUMN "gatewayPaymentId",
DROP COLUMN "gatewaySignature";

-- CreateTable
CREATE TABLE "PaymentAttempt" (
    "id" TEXT NOT NULL,
    "paymentId" TEXT NOT NULL,
    "amountInPaise" INTEGER NOT NULL,
    "status" "PaymentAttemptStatus" NOT NULL DEFAULT 'CREATED',
    "gatewayOrderId" TEXT NOT NULL,
    "gatewayPaymentId" TEXT,
    "gatewaySignature" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PaymentAttempt_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PaymentAttempt_gatewayOrderId_key" ON "PaymentAttempt"("gatewayOrderId");

-- CreateIndex
CREATE UNIQUE INDEX "PaymentAttempt_gatewayPaymentId_key" ON "PaymentAttempt"("gatewayPaymentId");

-- CreateIndex
CREATE INDEX "PaymentAttempt_paymentId_idx" ON "PaymentAttempt"("paymentId");

-- CreateIndex
CREATE INDEX "PaymentAttempt_status_idx" ON "PaymentAttempt"("status");

-- AddForeignKey
ALTER TABLE "PaymentAttempt" ADD CONSTRAINT "PaymentAttempt_paymentId_fkey" FOREIGN KEY ("paymentId") REFERENCES "Payment"("id") ON DELETE CASCADE ON UPDATE CASCADE;
