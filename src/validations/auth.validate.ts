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
    confirmPassword: z.string().min(8, "Minimum confirm password 8 characters"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Password and confirm password not match",
    path: ["confirmPassword"],
  });
