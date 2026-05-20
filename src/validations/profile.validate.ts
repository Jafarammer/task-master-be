import { z } from "zod";

export const updateProfileValidation = z.object({
  fullName: z.string({ error: "Full name is required" }),
  email: z
    .string({ error: "Email is required" })
    .email("Email format not valid"),
});
