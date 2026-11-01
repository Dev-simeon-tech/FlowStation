import type { Request, Response } from "express";
import { NotFoundException } from "@/execptions";
import { errorFormatter } from "@/utils/error-formatter";
import { envConfig } from "@/config";

export function notFoundMiddleware(req: Request, res: Response) {
  const response = errorFormatter(
    new NotFoundException(`Route not found: ${req.method} ${req.originalUrl}`),
    envConfig.app.isProd,
  );
  res.status(response.error.statusCode).json(response);
}
