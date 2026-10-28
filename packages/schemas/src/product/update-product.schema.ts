import { z } from "zod";
import { CreateFuelProductSchema } from "./create-product.schema";
import { ValidationMessages } from "../validation-messages";

export const UpdateFuelProductSchema = CreateFuelProductSchema.partial().refine(
  (input) => Object.keys(input).length > 0,
  ValidationMessages.PRODUCT_REQUIRED,
);

export type UpdateFuelProductInput = z.infer<typeof UpdateFuelProductSchema>;
