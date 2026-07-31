import User from "../src/models/user.model";
import Task from "../src/models/task.model";
import { Types } from "mongoose";
import bcrypt from "bcrypt";
import crypto from "crypto";
import { generateAccessToken } from "../src/utils/token";
import { createTokenPairService } from "../src/services/auth.service";
import { calculateTaskSize } from "../src/helpers/storage.helper";

export const createUserActive = async () => {
  return User.create({
    full_name: "John Doe",
    email: "john@example.com",
    password: await bcrypt.hash("@Jhone123", 10),
    is_active: true,
  });
};

export const createUserInactive = async () => {
  return User.create({
    full_name: "John Doe",
    email: "john@example.com",
    password: await bcrypt.hash("@Jhone123", 10),
    is_active: false,
  });
};

export const loginUser = async () => {
  const user = await createUserActive();

  const accessToken = generateAccessToken(user._id.toString(), user.email);

  return {
    user,
    token: accessToken,
  };
};

export const authenticatedUser = async () => {
  const user = await createUserActive();

  const accessToken = generateAccessToken(user._id.toString(), user.email);

  return {
    user,
    accessToken,
  };
};

export const authenticatedUserWithTokenPair = async () => {
  const user = await createUserActive();

  const { accessToken, refreshToken } = await createTokenPairService(
    user._id.toString(),
    user.email,
  );

  return {
    user,
    accessToken,
    refreshToken,
  };
};

export const userResetToken = async () => {
  const token = crypto.randomBytes(32).toString("hex");

  const hashedPassword = await bcrypt.hash("OldPassword123!", 10);

  const user = await User.create({
    full_name: "John",
    email: "john@example.com",
    password: hashedPassword,
    is_active: true,
    reset_password_token: token,
    reset_password_expired: new Date(Date.now() + 300_000),
  });

  return {
    user,
    token,
  };
};

export const userResetTokenExpired = async () => {
  const hashedPassword = await bcrypt.hash("OldPassword123!", 10);

  return User.create({
    full_name: "John",
    email: "john@example.com",
    password: hashedPassword,
    is_active: true,
    reset_password_token: "token123",
    reset_password_expired: new Date(Date.now() - 1_000),
  });
};

export const deleteUser = async (userId: string | Types.ObjectId) => {
  return User.findByIdAndDelete(userId);
};

export const createTask = async (userId: string | Types.ObjectId) => {
  const taskSize = calculateTaskSize({
    title: "Test title",
    description: "Test description",
  });
  // note : untuk re test gunakan start date dan end date tanggal sekarang atau next tanggal
  return Task.create({
    user_id: userId,
    title: "Test title",
    description: "Test description",
    start_date: "2026-07-31",
    end_date: "2026-07-31",
    priority: "low",
    size: taskSize,
  });
};

export const softDeleteTask = async (taskId: string | Types.ObjectId) => {
  return Task.findByIdAndUpdate(taskId, {
    deleted_at: new Date(),
  });
};

export const updateStatusTask = async (taskId: string | Types.ObjectId) => {
  return Task.findByIdAndUpdate(taskId, {
    is_completed: true,
  });
};
