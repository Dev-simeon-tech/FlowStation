import { z } from "zod";

export const ErrorResponseSchema = z.object({
  error: z.object({
    id: z.string(),
    statusCode: z.number(),
    message: z.string(),
    errors: z.array(z.record(z.string(), z.string())).default([]),
  }),
});

export type ErrorResponse = z.infer<typeof ErrorResponseSchema>;
