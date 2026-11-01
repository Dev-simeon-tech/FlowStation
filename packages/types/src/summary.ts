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
  fuelProduct: FuelProduct;
};

export type DailyRevenueBar = {
  date: string; // formatted  e.g. "Jun 15"
  fullDate: string; // raw        e.g. "2026-06-15"
  totalRevenue: number;
  breakdown: {
    // per fuel type — useful for tooltip on the bar chart
    fuelType: string;
    fuelName: string;
    revenue: number;
  }[];
};
