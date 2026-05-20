import { z } from "zod";

export const loginValidation = z.object({
  email: z
    .string({ error: "Email is required" })
    .email("Email format not valid"),
  password: z.string({ error: "Password is required" }),
});

export const registerValidation = z
  .object({
    fullName: z.string({ error: "fullName is required" }),
    email: z
      .string({ error: "Email is required" })
      .email("Email format not valid"),
    password: z
      .string({ error: "Password is required" })
      .min(8, "Minimum password 8 characters")
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
        "Password must contain uppercase letters, lowercase letters, numbers, and special characters.",
      ),
    confirmPassword: z.string({ error: "Confirm password is required" }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Password and confirm password not match",
    path: ["confirmPassword"],
  });

export const changePasswordValidation = z
  .object({
    currentPassword: z.string({ error: "Current password is required" }),
    newPassword: z
      .string({ error: "New password is required" })
      .min(8, "Minimum password 8 characters")
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
        "Password must contain uppercase letters, lowercase letters, numbers, and special characters.",
      ),
    confirmPassword: z.string({ error: "Confirm password is required" }),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "New password and confirm password not match",
    path: ["confirmPassword"],
  });

export const forgotPasswordValidation = z.object({
  email: z
    .string({ error: "Email is required" })
    .email("Email format not valid"),
});

export const resetPasswordValidation = z
  .object({
    token: z.string({ error: "Token not valid" }),
    newPassword: z
      .string({ error: "New password is required" })
      .min(8, "Minimum password 8 characters")
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
        "Password must contain uppercase letters, lowercase letters, numbers, and special characters.",
      ),
    confirmPassword: z.string({ error: "Confirm password is required" }),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "New password and confirm password not match",
    path: ["confirmPassword"],
  });
