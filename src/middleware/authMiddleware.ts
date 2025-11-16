import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { AccessPayload } from "../utils/tokens";

export interface AuthRequest extends Request {
  user?: AccessPayload;
}

export const authToken = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  const token = authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "Invalid token format" });
  }

  try {
    const decode = jwt.verify(
      token,
      process.env.JWT_SECRET as string
    ) as AccessPayload;

    req.user = decode;

    next();
  } catch (error) {
    res.status(403).json({ message: "Invalid or expired token" });
  }
};
