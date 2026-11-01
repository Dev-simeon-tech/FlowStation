import { z } from "zod";
import { ValidationMessages } from "../validation-messages";

const PaymentMethodSchema = z.enum(["CASH", "CARD", "TRANSFER"]);

export const CreateSaleSchema = z.object({
  fuelProductId: z.string().uuid(),
  attendantId: z.string().uuid(),
  customerId: z.preprocess(
    (value) => (typeof value === "string" && !value.trim() ? null : value),
    z.string().uuid().nullable().optional(),
  ),
  litresSold: z.preprocess(
    (value) => (value === "" || value == null ? Number.NaN : Number(value)),
    z
      .number({
        invalid_type_error: ValidationMessages.SALE_QUANTITY_INVALID,
      })
      .positive(ValidationMessages.SALE_QUANTITY_INVALID),
  ),
  paymentMethod: PaymentMethodSchema,
  isPaid: z.boolean().default(true),
});

export const SaleIdSchema = z.object({
  id: z.string().uuid(),
});

export type CreateSaleInput = z.infer<typeof CreateSaleSchema>;
