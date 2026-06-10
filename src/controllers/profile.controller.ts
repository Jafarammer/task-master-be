import { Response } from "express";
import * as profileService from "../services/profile.service";
import { AuthRequest } from "../middleware/authMiddleware";
import { updateProfileValidation } from "../validations/profile.validate";

export const handleGetProfile = async (req: AuthRequest, res: Response) => {
  const id = req.user?.id;
  const result = await profileService.getProfile(id);
  if (result.error) {
    return res.status(result.code).json({ message: result.message });
  }

  return res.status(result.code).json({
    message: result.message,
    data: result.data,
  });
};

export const handleUpdateProfile = async (req: AuthRequest, res: Response) => {
  const id = req.user?.id;
  const validated = updateProfileValidation.safeParse(req.body);
  if (!validated.success) {
    return res.status(400).json({
      message: validated.error.issues[0].message,
      // errors: validated.error.flatten(),
    });
  }
  const result = await profileService.updateProfile(id, validated.data);
  if (result.error) {
    return res.status(result.code).json({ message: result.message });
  }

  return res.status(result.code).json({
    message: result.message,
    data: result.data,
  });
};

export const handleUpdateProfilePicture = async (
  req: AuthRequest,
  res: Response,
) => {
  const id = req.user.id;
  const result = await profileService.updateProfilePicture(id, req.file);
  if (result.error) {
    return res.status(result.code).json({ message: result.message });
  }
  return res.status(result.code).json({ message: result.message });
};
