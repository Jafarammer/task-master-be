import User from "../src/models/user.model";
import Task from "../src/models/task.model";
import { Types } from "mongoose";
import bcrypt from "bcrypt";
import crypto from "crypto";
import { createAccessToken } from "../src/utils/tokens";
import { calculateTaskSize } from "../src/helpers/storage.helper";

export const createUserActive = async () => {
  return await User.create({
    full_name: "John Doe",
    email: "john@example.com",
    password: await bcrypt.hash("@Jhone123", 10),
    is_active: true,
  });
};

export const createUserInactive = async () => {
  return await User.create({
    full_name: "John Doe",
    email: "john@example.com",
    password: await bcrypt.hash("@Jhone123", 10),
    is_active: false,
  });
};

export const loginUser = async () => {
  const user = await createUserActive();
  const token = createAccessToken({
    id: user._id.toString(),
    email: user.email,
  });

  return {
    user,
    token,
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
    reset_password_expired: new Date(Date.now() + 300000),
  });

  return {
    user,
    token,
  };
};

export const userResetTokenExpired = async () => {
  const hashedPassword = await bcrypt.hash("OldPassword123!", 10);
  return await User.create({
    full_name: "John",
    email: "john@example.com",
    password: hashedPassword,
    is_active: true,
    reset_password_token: "token123",
    reset_password_expired: new Date(Date.now() - 1000),
  });
};

export const deleteUser = async (userId: string | Types.ObjectId) => {
  return await User.findByIdAndDelete(userId);
};

export const createTask = async (userId: string | Types.ObjectId) => {
  const taskSize = calculateTaskSize({
    title: "Test title",
    description: "Test description",
  });

  return Task.create({
    user_id: userId,
    title: "Test title",
    description: "Test description",
    start_date: "2026-06-23",
    end_date: "2026-06-23",
    priority: "low",
    size: taskSize,
  });
};
