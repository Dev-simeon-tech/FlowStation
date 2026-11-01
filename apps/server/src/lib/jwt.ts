import jwt from "jsonwebtoken";
import { envConfig } from "@/config";

export type AccessTokenPayload = {
  organisationId: string;
  email: string;
};

export function signAccessToken(payload: AccessTokenPayload): string {
  return jwt.sign(payload, envConfig.jwt.secret, {
    expiresIn: envConfig.jwt.expiresIn as jwt.SignOptions["expiresIn"],
  });
}

export function verifyAccessToken(token: string): AccessTokenPayload {
  return jwt.verify(token, envConfig.jwt.secret) as AccessTokenPayload;
}
