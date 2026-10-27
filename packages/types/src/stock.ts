import { FuelProduct } from "./fuelProduct";
import { Supplier } from "./supplier";

export type FuelStock = {
  id: string;
  organisationId: string;
  fuelProductId: string;
  supplierId: string;
  quantityLitres: number;
  costPerLitre: number;
  deliveryDate: string;
  invoiceNumber?: string;
  fuelProduct?: FuelProduct;
  supplier?: Supplier;
};

export type StockBalance = {
  fuelProductId: string;
  fuelProductName: string;
  fuelType: string;
  totalDelivered: number;
  totalSold: number;
  currentBalance: number;
};
