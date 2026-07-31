import RefreshToken from "../models/refresh-token.model";
import { CreateRefreshTokenParams } from "../interfaces/auth.interface";

export const createRefreshTokenRepository = async ({
  userId,
  tokenHash,
  expiresAt,
}: CreateRefreshTokenParams) => {
  return RefreshToken.create({
    userId,
    tokenHash,
    expiresAt,
  });
};

export const findRefreshTokenRepository = async (tokenHash: string) => {
  return RefreshToken.findOne({
    tokenHash,
    expiresAt: {
      $gt: new Date(),
    },
  });
};

export const deleteRefreshTokenRepository = async (tokenHash: string) => {
  return RefreshToken.deleteOne({ tokenHash });
};

export const deleteAllUserRefreshTokensRepository = async (userId: string) => {
  return RefreshToken.deleteMany({ userId });
};
