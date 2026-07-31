import { Request, Response, NextFunction } from "express";

import { IAccessPayload } from "../interfaces/auth.interface";
import { verifyAccessToken } from "../utils/token";

export interface AuthRequest extends Request {
  user?: IAccessPayload;
}

export const authToken = (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  const authorization = req.headers.authorization;

  if (!authorization) {
    return res.status(401).json({
      message: "Access token is required",
    });
  }

  const [type, token] = authorization.split(" ");

  if (type !== "Bearer" || !token) {
    return res.status(401).json({
      message: "Invalid authorization format",
    });
  }

  try {
    const payload = verifyAccessToken(token);

    req.user = payload;

    return next();
  } catch {
    return res.status(401).json({
      message: "Invalid or expired token",
    });
  }
};
