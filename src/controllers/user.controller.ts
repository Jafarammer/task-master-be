import { Request, Response } from "express";
import * as userService from "../services/user.service";
import { AuthRequest } from "../middleware/authMiddleware";

export const handleGetAllUser = async (req: Request, res: Response) => {
  const user = await userService.getAllUser();
  if (user.error) {
    return res.status(user.code).json({ message: user.message });
  }
  return res.status(201).json(user);
};

export const handleGetUserById = async (req: AuthRequest, res: Response) => {
  const userId = req.user?.id;
  const user = await userService.getUserById(userId);
  if (user.error) {
    return res.status(user.code).json({ message: user.message });
  }
  return res.status(201).json(user);
};
