import type { FUEL_TYPES, PAYMENT_METHODS, CUSTOMER_TYPES } from "./constants";

export type FuelType = (typeof FUEL_TYPES)[number];
export type PaymentMethod = (typeof PAYMENT_METHODS)[number];
export type CustomerType = (typeof CUSTOMER_TYPES)[number];

export interface FuelProduct {
  id: number;
  name: string;
  type: FuelType;
  pricePerLitre: number;
  unit: string;
  createdAt: string;
}

export interface Supplier {
  id: number;
  companyName: string;
  contactPerson: string;
  phone: string;
  email: string;
  address: string;
  createdAt: string;
}

export interface FuelStock {
  id: number;
  fuelProductId: number;
  supplierId: number;
  quantityLitres: number;
  costPerLitre: number;
  deliveryDate: string;
  invoiceNumber: string;
  fuelProduct?: FuelProduct;
  supplier?: Supplier;
}

export interface Attendant {
  id: number;
  fullName: string;
  employeeId: string;
  pumpAssigned: string;
  phone: string;
  hireDate: string;
  isActive: boolean;
}

export interface Customer {
  id: number;
  fullName: string;
  phone: string;
  plateNumber: string;
  customerType: CustomerType;
  createdAt: string;
}

export interface FuelSale {
  id: number;
  fuelProductId: number;
  attendantId: number;
  customerId: number | null;
  litresSold: number;
  unitPrice: number;
  totalAmount: number;
  saleDate: string;
  paymentMethod: PaymentMethod;
  fuelProduct?: FuelProduct;
  attendant?: Attendant;
  customer?: Customer;
}

export interface Payment {
  id: number;
  fuelSaleId: number;
  amountPaid: number;
  method: PaymentMethod;
  paidAt: string;
  reference: string;
  sale?: FuelSale;
}

export interface DailySummary {
  id: number;
  organisationId: number;
  fuelProductId: number;
  summaryDate: string;
  totalLitresSold: number;
  totalRevenue: number;
  openingStock: number;
  closingStock: number;
  fuelProduct?: FuelProduct;
}
