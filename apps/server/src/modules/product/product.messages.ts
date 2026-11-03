export const ProductMessages = {
  NOT_FOUND: "Fuel product not found",
  CREATED: "Fuel product created successfully",
  DELETED: "Fuel product deleted successfully",
  ARCHIVED: "Fuel product archived successfully",
  STOCK_REMAINING: (name: string, amount: number) =>
    `Cannot delete ${name}: ${amount.toLocaleString()}L of stock remains.`,
} as const;
