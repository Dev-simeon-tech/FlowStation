import { z } from "zod";
import { ValidationMessages } from "../validation-messages";

export const CreateStockEntrySchema = z.object({
  fuelProductId: z.string().uuid(),
  supplierId: z.string().uuid(),
  quantityLitres: z.preprocess(
    (value) => (value === "" || value == null ? Number.NaN : Number(value)),
    z
      .number({
        invalid_type_error: ValidationMessages.STOCK_QUANTITY_INVALID,
      })
      .positive(ValidationMessages.STOCK_QUANTITY_INVALID),
  ),
  costPerLitre: z.preprocess(
    (value) => (value === "" || value == null ? Number.NaN : Number(value)),
    z
      .number({ invalid_type_error: ValidationMessages.STOCK_COST_INVALID })
      .positive(ValidationMessages.STOCK_COST_INVALID),
  ),
  invoiceNumber: z
    .string()
    .trim()
    .transform((value) => value || null)
    .nullable()
    .optional(),
  deliveryDate: z
    .preprocess(
      (value) => (value === "" ? undefined : value),
      z
        .string()
        .regex(/^\d{4}-\d{2}-\d{2}$/, "Expected date in YYYY-MM-DD format")
        .optional(),
    ),
});

export const StockEntryIdSchema = z.object({
  id: z.string().uuid(),
});

export type CreateStockEntryInput = z.infer<typeof CreateStockEntrySchema>;
