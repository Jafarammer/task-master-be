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
