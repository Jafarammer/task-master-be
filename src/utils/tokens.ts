import jwt, { JwtPayload } from "jsonwebtoken";

export interface AccessPayload extends JwtPayload {
  id: string;
  email: string;
}

export const createAccessToken = (payload: AccessPayload): string => {
  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: "60m",
  });
};
