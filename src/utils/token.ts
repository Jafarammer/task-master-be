import crypto from "crypto";
import jwt, { SignOptions } from "jsonwebtoken";
import {
  AccessTokenPayload,
  RefreshTokenPayload,
} from "../interfaces/auth.interface";
import {
  JWT_SECRET,
  JWT_REFRESH_SECRET,
  JWT_ACCESS_EXPIRES_IN,
  JWT_REFRESH_EXPIRES_IN,
} from "./env";

const ACCESS_SECRET = JWT_SECRET;
const REFRESH_SECRET = JWT_REFRESH_SECRET;

if (!ACCESS_SECRET) {
  throw new Error("JWT_ACCESS_SECRET is not defined");
}

if (!REFRESH_SECRET) {
  throw new Error("JWT_REFRESH_SECRET is not defined");
}

const ACCESS_EXPIRES_IN =
  (JWT_ACCESS_EXPIRES_IN as SignOptions["expiresIn"]) ?? "15m";

const REFRESH_EXPIRES_IN =
  (JWT_REFRESH_EXPIRES_IN as SignOptions["expiresIn"]) ?? "7d";

export const generateTokenId = (): string => {
  return crypto.randomUUID();
};

export const hashToken = (token: string): string => {
  return crypto.createHash("sha256").update(token).digest("hex");
};

export const generateAccessToken = (userId: string, email: string): string => {
  const payload: AccessTokenPayload = {
    id: userId,
    email: email,
    type: "access",
  };

  return jwt.sign(payload, ACCESS_SECRET, {
    expiresIn: ACCESS_EXPIRES_IN,
  });
};

export const generateRefreshToken = (
  userId: string,
  tokenId: string,
): string => {
  const payload: RefreshTokenPayload = {
    id: userId,
    tokenId,
    type: "refresh",
  };

  return jwt.sign(payload, REFRESH_SECRET, {
    expiresIn: REFRESH_EXPIRES_IN,
  });
};

export const verifyRefreshToken = (
  token: string,
): RefreshTokenPayload | null => {
  try {
    return jwt.verify(token, JWT_REFRESH_SECRET) as RefreshTokenPayload;
  } catch {
    return null;
  }
};

export const verifyAccessToken = (token: string): AccessTokenPayload => {
  const payload = jwt.verify(token, ACCESS_SECRET) as AccessTokenPayload;

  if (payload.type !== "access") {
    throw new Error("Invalid access token type");
  }

  return payload;
};
