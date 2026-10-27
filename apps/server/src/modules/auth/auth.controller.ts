import { AuthService } from "./auth.service";
import type { Request, Response } from "express";
import {
  setRefreshTokenCookie,
  getRefreshTokenFromRequest,
  clearRefreshTokenCookie,
} from "@/utils/auth-cookie";

export class AuthController {
  private readonly service = new AuthService();

  register = async (req: Request, res: Response) => {
    const result = await this.service.register(req.body);
    setRefreshTokenCookie(
      res,
      result.refreshToken,
      result.refreshTokenExpiresAt,
    );
    res.status(201).json({
      organisation: result.organisation,
      accessToken: result.accessToken,
      refreshToken: result.refreshToken,
    });
  };

  login = async (req: Request, res: Response) => {
    const result = await this.service.login(req.body);
    setRefreshTokenCookie(
      res,
      result.refreshToken,
      result.refreshTokenExpiresAt,
    );
    res.status(200).json({
      organisation: result.organisation,
      accessToken: result.accessToken,
      refreshToken: result.refreshToken,
    });
  };

  refresh = async (req: Request, res: Response) => {
    const token = getRefreshTokenFromRequest(req);
    const result = await this.service.refreshAccessToken(token);
    res.json(result);
  };

  logout = async (req: Request, res: Response) => {
    const token = getRefreshTokenFromRequest(req);
    await this.service.logout(token);
    clearRefreshTokenCookie(res);
    res.status(204).send();
  };
}
