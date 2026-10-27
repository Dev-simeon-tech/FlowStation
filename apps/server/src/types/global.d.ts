import type { AccessTokenPayload } from "@/lib/jwt";

declare global {
  namespace Express {
    interface Request {
      organisation: AccessTokenPayload;
    }
  }
}
