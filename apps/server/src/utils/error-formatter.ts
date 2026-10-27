import { randomUUID } from "node:crypto";
import type { ErrorResponse } from "@/dtos";
import { HttpException } from "@/execptions";

export function errorFormatter(error: unknown, isProd: boolean): ErrorResponse {
  const id = randomUUID();

  if (error instanceof HttpException) {
    return {
      error: {
        id,
        statusCode: error.status,
        message: error.message,
        errors: error.status === 422 ? error.data : [],
      },
    };
  }

  return {
    error: {
      id,
      statusCode: 500,
      message: isProd
        ? "Something went wrong"
        : (error as Error)?.message || "Unknown error",
      errors: [],
    },
  };
}
