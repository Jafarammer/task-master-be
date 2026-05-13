import { Request, Response } from "express";
import * as profileService from "../services/profile.service";
import { AuthRequest } from "../middleware/authMiddleware";

export const handleGetProfile = async (req: AuthRequest, res: Response) => {
  const id = req.user?.id;
  const profile = await profileService.getProfile(id);
  if (profile.error) {
    return res.status(profile.code).json({ message: profile.message });
  }

  return res.status(200).json(profile);
};

export const handleUpdateProfile = async (req: AuthRequest, res: Response) => {
  const id = req.user?.id;
  const { fullName, email } = req.body;
  const result = await profileService.updateProfile(id, { fullName, email });
  if (result.error) {
    return res.status(result.code).json({ message: result.message });
  }

  return res.status(201).json({ message: result.message });
};
