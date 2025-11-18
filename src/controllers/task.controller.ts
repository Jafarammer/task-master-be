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

export const handleUpdateTask = async (req: Request, res: Response) => {
  const { id } = req.params;
  const user_id = (req as any).user?.id;
  const { title, description, due_date, priority, is_completed } = req.body;

  const task = await taskService.updateTask(
    id,
    user_id,
    title,
    description,
    due_date,
    priority,
    is_completed
  );

  if (task.error) {
    return res.status(task.code).json({ message: task.message });
  }

  return res.status(201).json({ data: task, message: "Update task success" });
};

export const handleGetTask = async (req: Request, res: Response) => {
  const user_id: string = (req as any).user?.id;
  const page: number = Number(req.query.page) || 1;
  const limit: number = Number(req.query.limit) || 10;
  const sort_by: string = String(req.query.sort_by || "createdAt");
  const order = req.query.order === "asc" ? "asc" : "desc";

  const result = await taskService.getTask({
    user_id,
    page,
    limit,
    sort_by,
    order,
  });

  if (result.error) {
    return res.status(result.code).json({ message: result.message });
  }

  return res
    .status(201)
    .json({ data: result.data, meta_data: result.pagination });
};
