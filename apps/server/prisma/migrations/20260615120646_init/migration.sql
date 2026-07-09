-- CreateEnum
CREATE TYPE "FuelType" AS ENUM ('PETROL', 'DIESEL', 'KEROSENE');

-- CreateEnum
CREATE TYPE "CustomerType" AS ENUM ('WALK_IN', 'REGISTERED');

-- CreateEnum
CREATE TYPE "PaymentMethod" AS ENUM ('CASH', 'CARD', 'TRANSFER');

-- CreateTable
CREATE TABLE "Organisation" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Organisation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FuelProduct" (
    "id" SERIAL NOT NULL,
    "organisationId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "type" "FuelType" NOT NULL,
    "pricePerLitre" DOUBLE PRECISION NOT NULL,
    "unit" TEXT NOT NULL DEFAULT 'litre',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FuelProduct_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Supplier" (
    "id" SERIAL NOT NULL,
    "organisationId" INTEGER NOT NULL,
    "companyName" TEXT NOT NULL,
    "contactPerson" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "email" TEXT,
    "address" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Supplier_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SupplierFuelType" (
    "id" SERIAL NOT NULL,
    "supplierId" INTEGER NOT NULL,
    "fuelProductId" INTEGER NOT NULL,

    CONSTRAINT "SupplierFuelType_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FuelStock" (
    "id" SERIAL NOT NULL,
    "organisationId" INTEGER NOT NULL,
    "fuelProductId" INTEGER NOT NULL,
    "supplierId" INTEGER NOT NULL,
    "quantityLitres" DOUBLE PRECISION NOT NULL,
    "costPerLitre" DOUBLE PRECISION NOT NULL,
    "deliveryDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "invoiceNumber" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FuelStock_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Attendant" (
    "id" SERIAL NOT NULL,
    "organisationId" INTEGER NOT NULL,
    "fullName" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "pumpAssigned" TEXT,
    "phone" TEXT NOT NULL,
    "hireDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "Attendant_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Customer" (
    "id" SERIAL NOT NULL,
    "organisationId" INTEGER NOT NULL,
    "fullName" TEXT NOT NULL,
    "phone" TEXT,
    "plateNumber" TEXT,
    "customerType" "CustomerType" NOT NULL DEFAULT 'WALK_IN',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Customer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FuelSale" (
    "id" SERIAL NOT NULL,
    "organisationId" INTEGER NOT NULL,
    "fuelProductId" INTEGER NOT NULL,
    "attendantId" INTEGER NOT NULL,
    "customerId" INTEGER,
    "litresSold" DOUBLE PRECISION NOT NULL,
    "unitPrice" DOUBLE PRECISION NOT NULL,
    "totalAmount" DOUBLE PRECISION NOT NULL,
    "saleDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "paymentMethod" "PaymentMethod" NOT NULL,

    CONSTRAINT "FuelSale_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Payment" (
    "id" SERIAL NOT NULL,
    "organisationId" INTEGER NOT NULL,
    "fuelSaleId" INTEGER NOT NULL,
    "amountPaid" DOUBLE PRECISION NOT NULL,
    "method" "PaymentMethod" NOT NULL,
    "paidAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "reference" TEXT,

    CONSTRAINT "Payment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DailySummary" (
    "id" SERIAL NOT NULL,
    "organisationId" INTEGER NOT NULL,
    "fuelProductId" INTEGER NOT NULL,
    "summaryDate" DATE NOT NULL,
    "totalLitresSold" DOUBLE PRECISION NOT NULL,
    "totalRevenue" DOUBLE PRECISION NOT NULL,
    "openingStock" DOUBLE PRECISION NOT NULL,
    "closingStock" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "DailySummary_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Organisation_email_key" ON "Organisation"("email");

-- CreateIndex
CREATE UNIQUE INDEX "SupplierFuelType_supplierId_fuelProductId_key" ON "SupplierFuelType"("supplierId", "fuelProductId");

-- CreateIndex
CREATE UNIQUE INDEX "Attendant_organisationId_employeeId_key" ON "Attendant"("organisationId", "employeeId");

-- CreateIndex
CREATE UNIQUE INDEX "Payment_fuelSaleId_key" ON "Payment"("fuelSaleId");

-- CreateIndex
CREATE UNIQUE INDEX "DailySummary_organisationId_summaryDate_fuelProductId_key" ON "DailySummary"("organisationId", "summaryDate", "fuelProductId");

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
