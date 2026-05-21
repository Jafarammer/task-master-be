import { z } from "zod";

export const createTaskValidation = z.object({
  title: z.string({ error: "Title is required" }),
  description: z.string({ error: "Description is required" }),
  dueDate: z.coerce
    .date({ error: "Due date is required" })
    .min(new Date().setHours(0, 0, 0, 0), "Date cannot be earlier than today"),
  priority: z.enum(["low", "medium", "high"], {
    error: "priority must be one of, low, medium, high ",
  }),
});
