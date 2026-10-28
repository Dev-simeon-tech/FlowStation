import type { FuelType } from "./fuelProduct";
import type { FuelProduct } from "./fuelProduct";
import type { Supplier } from "./supplier";

export type FuelStock = {
  id: string;
  organisationId: string;
  fuelProductId: string;
  supplierId: string;
  quantityLitres: number;
  costPerLitre: number;
  deliveryDate: string;
  invoiceNumber?: string | null;
  fuelProduct?: FuelProduct;
  supplier?: Supplier;
};

export type StockBalance = {
  fuelProductId: string;
  fuelProductName: string;
  fuelType: FuelType;
  totalDelivered: number;
  totalSold: number;
  currentBalance: number;
};
