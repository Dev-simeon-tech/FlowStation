import type { Request, Response } from "express";
import { envConfig } from "@/config";

export const REFRESH_TOKEN_COOKIE_NAME = "refreshToken";

export function setRefreshTokenCookie(
  res: Response,
  token: string,
  expiresAt: Date,
) {
  res.cookie(REFRESH_TOKEN_COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: envConfig.app.isProd,
    path: "/",
    expires: expiresAt,
  });
}

export function clearRefreshTokenCookie(res: Response) {
  res.clearCookie(REFRESH_TOKEN_COOKIE_NAME, { path: "/" });
}

export function getRefreshTokenFromRequest(req: Request): string | undefined {
  return req.body?.refreshToken ?? req.cookies?.[REFRESH_TOKEN_COOKIE_NAME];
}
