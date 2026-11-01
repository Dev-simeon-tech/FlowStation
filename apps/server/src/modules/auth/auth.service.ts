import prisma from "@/lib/prisma";
import { RegisterFormInput, LoginFormInput } from "@flowstation/schemas";
import { Organisation, AuthResult } from "@flowstation/types";
import { AuthMessages } from "./auth.messages";
import { BadRequestException } from "@/execptions";
import { generateToken, validateToken, deleteToken } from "@/lib/token";
import { comparePassword, hashPassword } from "@/lib/password";
import { TokenType } from "@/lib/token";
import { signAccessToken } from "@/lib/jwt";

export class AuthService {
  async register(input: RegisterFormInput) {
    const { name, address, email, password } = input;

    // check if email already taken
    const existing = await prisma.organisation.findUnique({
      where: { email },
    });
    if (existing) {
      throw new BadRequestException(AuthMessages.EMAIL_ALREADY_REGISTERED);
    }

    // hash the password
    const hashedPassword = await hashPassword(password);

    // create the organisation
    const organisation = await prisma.organisation.create({
      data: {
        name,
        address,
        email,
        password: hashedPassword,
      },
      select: {
        id: true,
        name: true,
        email: true,
        address: true,
        createdAt: true,
      },
    });

    // generate tokens and return results
    return this.issueAuthResult(organisation);
  }

  async login(input: LoginFormInput) {
    const { email, password } = input;

    const existingOrganisation = await prisma.organisation.findUnique({
      where: { email },
    });
    if (!existingOrganisation) {
      throw new BadRequestException(AuthMessages.INVALID_CREDENTIALS);
    }

    const isPasswordValid = await comparePassword(
      password,
      existingOrganisation.password,
    );
    if (!isPasswordValid) {
      throw new BadRequestException(AuthMessages.INVALID_CREDENTIALS);
    }

    // generate tokens and issue result
    return this.issueAuthResult({
      id: existingOrganisation.id,
      email: existingOrganisation.email,
      name: existingOrganisation.name,
      createdAt: existingOrganisation.createdAt,
      address: existingOrganisation.address,
    });
  }

  async refreshAccessToken(rawRefreshToken: string | undefined) {
    if (!rawRefreshToken) {
      throw new BadRequestException(AuthMessages.REFRESH_TOKEN_REQUIRED);
    }
    // validate refresh token
    const tokenEntity = await validateToken(rawRefreshToken, TokenType.REFRESH);
    if (!tokenEntity.organisation) {
      throw new BadRequestException(AuthMessages.INVALID_REFRESH_TOKEN);
    }

    //generate access token
    const accessToken = signAccessToken({
      organisationId: tokenEntity.organisationId,
      email: tokenEntity.organisation.email,
    });

    return { accessToken, organisation: tokenEntity.organisation };
  }

  async logout(rawRefreshToken: string | undefined) {
    if (!rawRefreshToken) {
      throw new BadRequestException(AuthMessages.REFRESH_TOKEN_REQUIRED);
    }
    const [key] = rawRefreshToken.split(".");
    if (!key) {
      throw new BadRequestException(AuthMessages.INVALID_REFRESH_TOKEN);
    }
    const token = await prisma.token.findUnique({
      where: { key, type: TokenType.REFRESH },
    });
    if (token) {
      deleteToken(token);
    }
  }

  private async issueAuthResult(
    organisation: Organisation,
  ): Promise<AuthResult> {
    const accessToken = signAccessToken({
      organisationId: organisation.id,
      email: organisation.email,
    });

    const { token: refreshToken, expiresAt: refreshTokenExpiresAt } =
      await generateToken(TokenType.REFRESH, organisation.id);

    return { organisation, accessToken, refreshToken, refreshTokenExpiresAt };
  }
}
