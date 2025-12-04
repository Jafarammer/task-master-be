import jwt, { JwtPayload } from "jsonwebtoken";
import { JWT_SECRET } from "../utils/env";

export interface AccessPayload extends JwtPayload {
  id: string;
  email: string;
}

export const createAccessToken = (payload: AccessPayload): string => {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: "1d",
  });
};
