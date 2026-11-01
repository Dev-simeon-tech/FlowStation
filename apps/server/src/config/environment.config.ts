import path from "node:path";
import dotenv from "dotenv";
import { z } from "zod";

dotenv.config({ path: path.resolve(process.cwd(), ".env") });

const EnvSchema = z.object({
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),
  PORT: z.coerce.number().int().positive().default(3000),
  DATABASE_URL: z.string().min(1, "Database url is required"),
  JWT_SECRET: z.string().min(1, "JWT_SECRET is required"),
  JWT_EXPIRES_IN: z.string().default("15m"),
  CUSTOMER_PORTAL_URL: z.string().min(1, "CUSTOMER_PORTAL_URL is required"),
});

const env = EnvSchema.parse(process.env);

export const envConfig = Object.freeze({
  app: {
    nodeEnv: env.NODE_ENV,
    port: env.PORT,
    isDev: env.NODE_ENV === "development",
    isProd: env.NODE_ENV === "production",
    isTest: env.NODE_ENV === "test",
  },
  db: {
    databaseUrl: env.DATABASE_URL,
  },
  jwt: {
    secret: env.JWT_SECRET,
    expiresIn: env.JWT_EXPIRES_IN,
  },
  clientUrls: {
    customerPortal: env.CUSTOMER_PORTAL_URL,
  },
});
