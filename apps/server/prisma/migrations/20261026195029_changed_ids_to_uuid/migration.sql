/*
  Warnings:

  - The primary key for the `Attendant` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `Customer` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `DailySummary` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `FuelProduct` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `FuelSale` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `FuelStock` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `Organisation` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `Payment` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `Supplier` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `SupplierFuelType` table will be changed. If it partially fails, the table could be left without primary key constraint.

*/
-- DropForeignKey
ALTER TABLE "Attendant" DROP CONSTRAINT "Attendant_organisationId_fkey";

-- DropForeignKey
ALTER TABLE "Customer" DROP CONSTRAINT "Customer_organisationId_fkey";

-- DropForeignKey
ALTER TABLE "DailySummary" DROP CONSTRAINT "DailySummary_fuelProductId_fkey";

-- DropForeignKey
ALTER TABLE "DailySummary" DROP CONSTRAINT "DailySummary_organisationId_fkey";

-- DropForeignKey
ALTER TABLE "FuelProduct" DROP CONSTRAINT "FuelProduct_organisationId_fkey";

-- DropForeignKey
ALTER TABLE "FuelSale" DROP CONSTRAINT "FuelSale_attendantId_fkey";

-- DropForeignKey
ALTER TABLE "FuelSale" DROP CONSTRAINT "FuelSale_customerId_fkey";

-- DropForeignKey
ALTER TABLE "FuelSale" DROP CONSTRAINT "FuelSale_fuelProductId_fkey";

-- DropForeignKey
ALTER TABLE "FuelSale" DROP CONSTRAINT "FuelSale_organisationId_fkey";

-- DropForeignKey
ALTER TABLE "FuelStock" DROP CONSTRAINT "FuelStock_fuelProductId_fkey";

-- DropForeignKey
ALTER TABLE "FuelStock" DROP CONSTRAINT "FuelStock_organisationId_fkey";

-- DropForeignKey
ALTER TABLE "FuelStock" DROP CONSTRAINT "FuelStock_supplierId_fkey";

-- DropForeignKey
ALTER TABLE "Payment" DROP CONSTRAINT "Payment_fuelSaleId_fkey";

-- DropForeignKey
ALTER TABLE "Payment" DROP CONSTRAINT "Payment_organisationId_fkey";

-- DropForeignKey
ALTER TABLE "Supplier" DROP CONSTRAINT "Supplier_organisationId_fkey";

-- DropForeignKey
ALTER TABLE "SupplierFuelType" DROP CONSTRAINT "SupplierFuelType_fuelProductId_fkey";

-- DropForeignKey
ALTER TABLE "SupplierFuelType" DROP CONSTRAINT "SupplierFuelType_supplierId_fkey";

-- AlterTable
ALTER TABLE "Attendant" DROP CONSTRAINT "Attendant_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "organisationId" SET DATA TYPE TEXT,
ADD CONSTRAINT "Attendant_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "Attendant_id_seq";

-- AlterTable
ALTER TABLE "Customer" DROP CONSTRAINT "Customer_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "organisationId" SET DATA TYPE TEXT,
ADD CONSTRAINT "Customer_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "Customer_id_seq";

-- AlterTable
ALTER TABLE "DailySummary" DROP CONSTRAINT "DailySummary_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "organisationId" SET DATA TYPE TEXT,
ALTER COLUMN "fuelProductId" SET DATA TYPE TEXT,
ADD CONSTRAINT "DailySummary_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "DailySummary_id_seq";

-- AlterTable
ALTER TABLE "FuelProduct" DROP CONSTRAINT "FuelProduct_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "organisationId" SET DATA TYPE TEXT,
ADD CONSTRAINT "FuelProduct_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "FuelProduct_id_seq";

-- AlterTable
ALTER TABLE "FuelSale" DROP CONSTRAINT "FuelSale_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "organisationId" SET DATA TYPE TEXT,
ALTER COLUMN "fuelProductId" SET DATA TYPE TEXT,
ALTER COLUMN "attendantId" SET DATA TYPE TEXT,
ALTER COLUMN "customerId" SET DATA TYPE TEXT,
ADD CONSTRAINT "FuelSale_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "FuelSale_id_seq";

-- AlterTable
ALTER TABLE "FuelStock" DROP CONSTRAINT "FuelStock_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "organisationId" SET DATA TYPE TEXT,
ALTER COLUMN "fuelProductId" SET DATA TYPE TEXT,
ALTER COLUMN "supplierId" SET DATA TYPE TEXT,
ADD CONSTRAINT "FuelStock_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "FuelStock_id_seq";

-- AlterTable
ALTER TABLE "Organisation" DROP CONSTRAINT "Organisation_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ADD CONSTRAINT "Organisation_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "Organisation_id_seq";

-- AlterTable
ALTER TABLE "Payment" DROP CONSTRAINT "Payment_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "organisationId" SET DATA TYPE TEXT,
ALTER COLUMN "fuelSaleId" SET DATA TYPE TEXT,
ADD CONSTRAINT "Payment_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "Payment_id_seq";

-- AlterTable
ALTER TABLE "Supplier" DROP CONSTRAINT "Supplier_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "organisationId" SET DATA TYPE TEXT,
ADD CONSTRAINT "Supplier_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "Supplier_id_seq";

-- AlterTable
ALTER TABLE "SupplierFuelType" DROP CONSTRAINT "SupplierFuelType_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "supplierId" SET DATA TYPE TEXT,
ALTER COLUMN "fuelProductId" SET DATA TYPE TEXT,
ADD CONSTRAINT "SupplierFuelType_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "SupplierFuelType_id_seq";

-- AddForeignKey
ALTER TABLE "FuelProduct" ADD CONSTRAINT "FuelProduct_organisationId_fkey" FOREIGN KEY ("organisationId") REFERENCES "Organisation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Supplier" ADD CONSTRAINT "Supplier_organisationId_fkey" FOREIGN KEY ("organisationId") REFERENCES "Organisation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SupplierFuelType" ADD CONSTRAINT "SupplierFuelType_supplierId_fkey" FOREIGN KEY ("supplierId") REFERENCES "Supplier"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SupplierFuelType" ADD CONSTRAINT "SupplierFuelType_fuelProductId_fkey" FOREIGN KEY ("fuelProductId") REFERENCES "FuelProduct"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FuelStock" ADD CONSTRAINT "FuelStock_organisationId_fkey" FOREIGN KEY ("organisationId") REFERENCES "Organisation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FuelStock" ADD CONSTRAINT "FuelStock_fuelProductId_fkey" FOREIGN KEY ("fuelProductId") REFERENCES "FuelProduct"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FuelStock" ADD CONSTRAINT "FuelStock_supplierId_fkey" FOREIGN KEY ("supplierId") REFERENCES "Supplier"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Attendant" ADD CONSTRAINT "Attendant_organisationId_fkey" FOREIGN KEY ("organisationId") REFERENCES "Organisation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Customer" ADD CONSTRAINT "Customer_organisationId_fkey" FOREIGN KEY ("organisationId") REFERENCES "Organisation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FuelSale" ADD CONSTRAINT "FuelSale_organisationId_fkey" FOREIGN KEY ("organisationId") REFERENCES "Organisation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FuelSale" ADD CONSTRAINT "FuelSale_fuelProductId_fkey" FOREIGN KEY ("fuelProductId") REFERENCES "FuelProduct"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FuelSale" ADD CONSTRAINT "FuelSale_attendantId_fkey" FOREIGN KEY ("attendantId") REFERENCES "Attendant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FuelSale" ADD CONSTRAINT "FuelSale_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_organisationId_fkey" FOREIGN KEY ("organisationId") REFERENCES "Organisation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_fuelSaleId_fkey" FOREIGN KEY ("fuelSaleId") REFERENCES "FuelSale"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DailySummary" ADD CONSTRAINT "DailySummary_organisationId_fkey" FOREIGN KEY ("organisationId") REFERENCES "Organisation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DailySummary" ADD CONSTRAINT "DailySummary_fuelProductId_fkey" FOREIGN KEY ("fuelProductId") REFERENCES "FuelProduct"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
