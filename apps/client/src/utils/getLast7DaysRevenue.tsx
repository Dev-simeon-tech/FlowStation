import type { DailySummary, DailyRevenueBar } from "@flowstation/types";

export const getLast7DaysRevenue = (
  summaries: DailySummary[],
): DailyRevenueBar[] => {
  // 1. group all records by their date (YYYY-MM-DD)
  const groupedByDate = summaries.reduce<Record<string, DailySummary[]>>(
    (acc, summary) => {
      const dateKey = summary.summaryDate.split("T")[0]; // "2026-07-09"
      if (!acc[dateKey]) acc[dateKey] = [];
      acc[dateKey].push(summary);
      return acc;
    },
    {},
  );

  // 2. for each date, sum revenue across all fuel types
  const dailyTotals: DailyRevenueBar[] = Object.entries(groupedByDate).map(
    ([dateKey, records]) => {
      const totalRevenue = records.reduce((sum, r) => sum + r.totalRevenue, 0);

      const breakdown = records.map((r) => ({
        fuelType: r?.fuelProduct.type,
        fuelName: r.fuelProduct.name,
        revenue: r.totalRevenue,
      }));

      // format date for chart x-axis label e.g. "Jun 15"
      const formatted = new Date(dateKey).toLocaleDateString("en-NG", {
        month: "short",
        day: "numeric",
        timeZone: "UTC", // prevent date shifting due to timezone
      });

      return {
        date: formatted,
        fullDate: dateKey,
        totalRevenue: Math.round(totalRevenue * 100) / 100, // fix float precision
        breakdown,
      };
    },
  );

  // 3. sort by date ascending (oldest → newest) — correct order for a bar chart
  dailyTotals.sort(
    (a, b) => new Date(a.fullDate).getTime() - new Date(b.fullDate).getTime(),
  );

  // 4. return only the last 7 days
  return dailyTotals.slice(-7);
};
