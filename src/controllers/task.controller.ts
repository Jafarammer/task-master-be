import { Request, Response } from "express";
import * as taskService from "../services/task.service";
import { AuthRequest } from "../middleware/authMiddleware";
import {
  createTaskValidation,
  updateTaskValidation,
  updateStatusTaskValidation,
} from "../validations/task.validate";
import { IServiceParams } from "../interfaces/common.interface";

export const handleCreateTask = async (req: AuthRequest, res: Response) => {
  const userId = req.user?.id;
  const validated = createTaskValidation.safeParse(req.body);
  if (!validated.success) {
    return res.status(400).json({
      error: true,
      message: validated.error.issues[0].message,
      errors: validated.error.flatten(),
    });
  }

  const result = await taskService.createTask(userId, validated.data);

  if (result.error) {
    return res.status(result.code).json({ message: result.message });
  }

  return res.status(201).json({
    message: result.message,
    data: result.data,
  });
};

export const handleUpdateTask = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const user_id = req.user?.id;
  const validated = updateTaskValidation.safeParse(req.body);
  if (!validated.success) {
    return res.status(400).json({
      error: true,
      message: validated.error.issues[0].message,
      errors: validated.error.flatten(),
    });
  }

  const result = await taskService.updateTask(id, user_id, validated.data);

  if (result.error) {
    return res.status(result.code).json({ message: result.message });
  }

  return res
    .status(result.code)
    .json({ data: result.data, message: result.message });
};

export const handleGetTask = async (req: AuthRequest, res: Response) => {
  const user_id: string = req.user?.id;
  const params: IServiceParams = {
    page: Number(req.query.page) || 1,
    limit: Number(req.query.limit) || 5,
    sortBy: (req.query.sortBy as string) || "createdAt",
    order: (req.query.order as "asc" | "desc") || "desc",
    query: (req.query.query as string) || "",
  };

  const result = await taskService.getTask(user_id, params);

  if (result.error) {
    return res.status(result.code).json({ message: result.message });
  }

  return res
    .status(result.code)
    .json({ data: result.data.tasks, meta_data: result.data.pagination });
};

export const handleSoftDeleteTask = async (req: AuthRequest, res: Response) => {
  const userId = req.user?.id;
  const { taskId } = req.params;

  const result = await taskService.softDeleteTask({ userId, taskId });

  if (result.error) {
    return res.status(result.code).json({ message: result.message });
  }

  return res.status(result.code).json({
    message: result.message,
  });
};

export const handleHardDeleteTask = async (req: AuthRequest, res: Response) => {
  const userId = req.user?.id;
  const { taskId } = req.params;

  const result = await taskService.hardDeleteTask({ userId, taskId });

  if (result.error) {
    return res.status(result.code).json({ message: result.message });
  }

  return res.status(result.code).json({ message: result.message });
};

export const handleRestoreTask = async (req: AuthRequest, res: Response) => {
  const userId = req.user?.id;
  const { taskId } = req.params;

  const result = await taskService.restoreTask({ userId, taskId });

  if (result.error) {
    return res.status(result.code).json({ message: result.message });
  }

  return res.status(result.code).json({ message: result.message });
};

export const handleTaskUpdateStatus = async (
  req: AuthRequest,
  res: Response,
) => {
  const userId = req.user.id;
  const { taskId } = req.params;
  const validated = updateStatusTaskValidation.safeParse(req.body);
  if (!validated.success) {
    return res.status(400).json({
      error: true,
      message: validated.error.issues[0].message,
      errors: validated.error.flatten(),
    });
  }

  const result = await taskService.updateTaskStatus(
    userId,
    taskId,
    validated.data,
  );

  if (result.error) {
    return res.status(result.code).json({ message: result.message });
  }

  return res.status(result.code).json({ message: result.message });
};

export const handleGetTaskCompleted = async (
  req: AuthRequest,
  res: Response,
) => {
  const userId = req.user.id;
  const params: IServiceParams = {
    page: Number(req.query.page) || 1,
    limit: Number(req.query.limit) || 5,
    sortBy: (req.query.sortBy as string) || "createdAt",
    order: (req.query.order as "asc" | "desc") || "desc",
    query: (req.query.query as string) || "",
  };

  const result = await taskService.getTaskCompleted(userId, params);

  if (result.error) {
    return res.status(result.code).json({ message: result.message });
  }

  return res
    .status(result.code)
    .json({ data: result.data.tasks, meta_data: result.data.pagination });
};

export const handleGetTaskPending = async (req: AuthRequest, res: Response) => {
  const user_id: string = req.user?.id;
  const page: number = Number(req.query.page) || 1;
  const limit: number = Number(req.query.limit) || 5;
  const sort_by: string = String(req.query.sort_by) || "createdAt";
  const order: "asc" | "desc" = req.query.order === "asc" ? "asc" : "desc";
  const query: string = String(req.query.search) || "";

  const result = await taskService.getTaskPending({
    user_id,
    page,
    limit,
    sort_by,
    order,
    query,
  });

  if (result.error) {
    return res.status(result.code).json({ message: result.message });
  }

  return res
    .status(201)
    .json({ data: result.data, meta_data: result.pagination });
};

export const handleGetDetail = async (req: AuthRequest, res: Response) => {
  const userId = req.user?.id;
  const taskId = req.params.id;
  const result = await taskService.taskDetail({
    user_id: userId,
    task_id: taskId,
  });
  if (result.error) {
    return res.status(result.code).json({ message: result.message });
  }

  return res.status(200).json({ data: result.data });
};
