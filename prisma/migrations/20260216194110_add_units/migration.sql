/*
  Warnings:

  - A unique constraint covering the columns `[unitId]` on the table `Tenant` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum
CREATE TYPE "UnitStatus" AS ENUM ('AVAILABLE', 'OCCUPIED');

-- AlterTable
ALTER TABLE "Tenant" ADD COLUMN     "leaseStartDate" TIMESTAMP(3),
ADD COLUMN     "unitId" TEXT;

-- CreateTable
CREATE TABLE "Unit" (
    "id" TEXT NOT NULL,
    "unitNumber" TEXT NOT NULL,
    "building" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "rentAmount" DOUBLE PRECISION NOT NULL,
    "status" "UnitStatus" NOT NULL DEFAULT 'AVAILABLE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Unit_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Tenant_unitId_key" ON "Tenant"("unitId");

-- AddForeignKey
ALTER TABLE "Tenant" ADD CONSTRAINT "Tenant_unitId_fkey" FOREIGN KEY ("unitId") REFERENCES "Unit"("id") ON DELETE SET NULL ON UPDATE CASCADE;
