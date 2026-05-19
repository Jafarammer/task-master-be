import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../utils/env";
import { IAccessPayload } from "../interfaces/auth.interface";

export const createAccessToken = (payload: IAccessPayload): string => {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: "1d",
  });
};
