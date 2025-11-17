import { Request, Response } from "express";
import * as taskService from "../services/task.service";

export const handleCreateTask = async (req: Request, res: Response) => {
  const user_id = (req as any).user?.id;
  const { title, description, due_date, priority } = req.body;

  const task = await taskService.createTask(
    user_id,
    title,
    description,
    due_date,
    priority
  );

  if (task.error) {
    return res.status(task.code).json({ message: task.message });
  }
  return res.status(201).json({ data: task, message: "Create task success" });
};
