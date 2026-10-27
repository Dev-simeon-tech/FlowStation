import type { NextFunction, Request, Response } from "express";
import { UnauthorizedException } from "@/execptions";
import { verifyAccessToken } from "@/lib/jwt";

export function authMiddleware(
  req: Request,
  _res: Response,
  next: NextFunction,
) {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) {
    next(new UnauthorizedException("Missing access token"));
    return;
  }

  const token = header.slice("Bearer ".length);

  try {
    req.organisation = verifyAccessToken(token);
    next();
  } catch {
    next(new UnauthorizedException("Invalid or expired access token"));
  }
}
