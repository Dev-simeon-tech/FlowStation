import type { DailySummary } from "../types";

export interface GroupedFuelSummary {
  fuelProductId: number;
  fuelProductName: string;
  fuelType: string;
  pricePerLitre: number;
  totalLitresSold: number;
  totalRevenue: number;
  latestClosingStock: number;
  numberOfDays: number;
  history: DailySummary[]; // individual daily records kept for charts
}

export const groupSummariesByFuelType = (
  summaries: DailySummary[],
): GroupedFuelSummary[] => {
  // 1. group into a map keyed by fuelProductId
  const grouped = summaries.reduce<Record<number, DailySummary[]>>(
    (acc, summary) => {
      const key = summary.fuelProductId;
      if (!acc[key]) acc[key] = [];
      acc[key].push(summary);
      return acc;
    },
    {},
  );

  // 2. for each group, sum up the values
  return Object.values(grouped)
    .filter((group) => group[0]?.fuelProduct != null)
    .map((group) => {
      // sort by date ascending so latest closing stock is last
      const sorted = group.sort(
        (a, b) =>
          new Date(a.summaryDate).getTime() - new Date(b.summaryDate).getTime(),
      );

      const totalLitresSold = group.reduce(
        (sum, s) => sum + s.totalLitresSold,
        0,
      );
      const totalRevenue = group.reduce((sum, s) => sum + s.totalRevenue, 0);
      if (group[0].fuelProduct == null) {
        throw new Error("Fuel product is missing in summary data");
      }
      return {
        fuelProductId: group[0].fuelProduct.id,
        fuelProductName: group[0].fuelProduct.name,
        fuelType: group[0].fuelProduct.type,
        pricePerLitre: group[0].fuelProduct.pricePerLitre,
        totalLitresSold,
        totalRevenue,
        latestClosingStock: sorted[sorted.length - 1].closingStock, // most recent
        numberOfDays: group.length,
        history: sorted,
      };
    });
};
