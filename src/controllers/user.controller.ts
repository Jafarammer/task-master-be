import { Request, Response } from "express";
import * as userService from "../services/user.service";

export const handleGetAllUser = async (req: Request, res: Response) => {
  try {
    const users = await userService.getAllUser();
    res.json(users);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const handleGetUserById = async (req: Request, res: Response) => {
  try {
    const user = await userService.getUserById(req.params.id);
    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    res.json(user);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
