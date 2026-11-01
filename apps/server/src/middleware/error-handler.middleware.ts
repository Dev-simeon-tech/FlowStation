import type { NextFunction, Request, Response } from "express";
import { errorFormatter } from "@/utils/error-formatter";
import { envConfig } from "@/config";

export function errorHandlerMiddleware(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
) {
  const response = errorFormatter(err, envConfig.app.isProd);

  if (response.error.statusCode >= 500) {
    console.error(response.error.message, err, { errorId: response.error.id });
  }

  res.status(response.error.statusCode).json(response);
}
