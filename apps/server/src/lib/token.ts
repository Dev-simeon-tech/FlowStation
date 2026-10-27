import prisma from "@/lib/prisma.js";
import { randomUUID, randomBytes } from "node:crypto";
import { Token } from "@flowstation/types";
import { BadRequestException } from "@/execptions/http-execption.js";
import { hashPassword, comparePassword } from "./password.js";

export enum TokenType {
  REFRESH = "REFRESH",
  PASSWORD_RESET = "PASSWORD_RESET",
}
export type GeneratedToken = {
  token: string;
  expiresAt: Date;
  tokenEntity: Token;
};
const TOKEN_EXPIRY_MS: Record<TokenType, number> = {
  [TokenType.REFRESH]: 30 * 24 * 60 * 60 * 1000,
  [TokenType.PASSWORD_RESET]: 60 * 60 * 1000,
};
export async function generateToken(
  type: TokenType,
  organisationId: string,
): Promise<GeneratedToken> {
  const key = randomUUID();
  const secret = randomBytes(32).toString("hex");
  const hashedSecret = await hashPassword(secret);
  const expiresAt = new Date(Date.now() + TOKEN_EXPIRY_MS[type]);

  // delete any existing refresh tokens for this organisation
  await prisma.token.deleteMany({
    where: {
      organisationId,
      type: TokenType.REFRESH,
    },
  });

  // create the new token in the database
  const tokenEntity = await prisma.token.create({
    data: {
      key,
      token: hashedSecret,
      expiresAt,
      organisationId,
      type,
    },
  });

  return { token: `${key}.${secret}`, expiresAt, tokenEntity };
}

export async function validateToken(
  rawToken: string,
  type: TokenType,
): Promise<Token> {
  const [key, secret] = rawToken.split(".");
  if (!key || !secret) {
    throw new BadRequestException("Invalid token");
  }

  const entity = await prisma.token.findUnique({
    where: { key, type },
    include: {
      organisation: {
        select: {
          id: true,
          email: true,
          name: true,
          address: true,
          createdAt: true,
        },
      },
    },
  });
  if (!entity) {
    throw new BadRequestException("Invalid token");
  }

  const isValid = await comparePassword(secret, entity.token);
  if (!isValid || entity.expiresAt < new Date()) {
    throw new BadRequestException("Invalid or expired token");
  }

  // if (type !== TokenType.REFRESH && entity.usedAt) {
  //   throw new BadRequestException("Token already used");
  // }

  return entity;
}

export async function deleteToken(token: Token) {
  await prisma.token.delete({ where: { id: token.id } });
}
