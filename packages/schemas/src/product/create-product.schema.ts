import { z } from "zod";
import { ValidationMessages } from "../validation-messages";

const FuelProductTypeSchema = z.enum(["PETROL", "DIESEL", "KEROSENE"]);
export const CreateFuelProductSchema = z.object({
  name: z.string().trim().min(2, ValidationMessages.PRODUCT_NAME_TOO_SHORT),
  type: FuelProductTypeSchema,
  pricePerLitre: z
    .number()
    .positive(ValidationMessages.PRICE_PER_LITRE_INVALID),
});

export type CreateFuelProductInput = z.infer<typeof CreateFuelProductSchema>;
