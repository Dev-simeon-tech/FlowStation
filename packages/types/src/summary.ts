import { FuelProduct } from "./fuelProduct";

export type DailySummary = {
  id: number;
  organisationId: number;
  fuelProductId: number;
  summaryDate: string;
  totalLitresSold: number;
  totalRevenue: number;
  openingStock: number;
  closingStock: number;
  fuelProduct?: FuelProduct;
};
