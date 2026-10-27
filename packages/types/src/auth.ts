export type Organisation = {
  id: string;
  name: string;
  email: string;
  address: string | null;
  createdAt: Date;
};

export type AuthResponse = {
  organisation: Organisation;
  accesstoken: string;
  refreshToken: string;
};
export type AuthResult = {
  organisation: Organisation;
  accessToken: string;
  refreshToken: string;
  refreshTokenExpiresAt: Date;
};

export type TokenType = "REFRESH" | "PASSWORD_RESET";

export type Token = {
  id: string; // uuid
  token: string;
  key: string;
  type: TokenType;
  expiresAt: Date; // ISO datetime string
  createdAt: Date;
  organisationId: string; // uuid — matches Organisation.id
  organisation?: Organisation;
};

// shape returned when logging in
export type AuthTokens = {
  accessToken: string;
  organisation: Pick<Organisation, "id" | "name" | "email">;
};

// shape returned when refreshing
export type RefreshResponse = {
  accessToken: string;
};
