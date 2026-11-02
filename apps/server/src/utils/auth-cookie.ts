import type { Request, Response } from "express";
import { envConfig } from "@/config";

export const REFRESH_TOKEN_COOKIE_NAME = "refreshToken";

const refreshTokenCookieOptions = {
  httpOnly: true,
  sameSite: envConfig.app.isProd ? ("none" as const) : ("lax" as const),
  secure: envConfig.app.isProd,
  path: "/",
};

export function setRefreshTokenCookie(
  res: Response,
  token: string,
  expiresAt: Date,
) {
  res.cookie(REFRESH_TOKEN_COOKIE_NAME, token, {
    ...refreshTokenCookieOptions,
    expires: expiresAt,
  });
}

export function clearRefreshTokenCookie(res: Response) {
  res.clearCookie(REFRESH_TOKEN_COOKIE_NAME, refreshTokenCookieOptions);
}

export function getRefreshTokenFromRequest(req: Request): string | undefined {
  return req.body?.refreshToken ?? req.cookies?.[REFRESH_TOKEN_COOKIE_NAME];
}
