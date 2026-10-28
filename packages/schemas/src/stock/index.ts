import { z } from "zod";
import { ValidationMessages } from "../validation-messages";

export const CreateStockEntrySchema = z.object({
  fuelProductId: z.string().uuid(),
  supplierId: z.string().uuid(),
  quantityLitres: z
    .number()
    .positive(ValidationMessages.STOCK_QUANTITY_INVALID),
  costPerLitre: z.number().positive(ValidationMessages.STOCK_COST_INVALID),
  invoiceNumber: z.string().trim().nullable().optional(),
  deliveryDate: z.string().datetime().optional(),
});

export const StockEntryIdSchema = z.object({
  id: z.string().uuid(),
});

export type CreateStockEntryInput = z.infer<typeof CreateStockEntrySchema>;
