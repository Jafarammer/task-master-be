import { Response } from "express";
import * as taskService from "../services/task.service";
import { AuthRequest } from "../middleware/authMiddleware";
import {
  createTaskValidation,
  updateTaskValidation,
  updateStatusTaskValidation,
} from "../validations/task.validate";
import parseQueryParams from "../helpers/query.helper";

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
  const params = parseQueryParams(req.query);

  const result = await taskService.getTask(user_id, params);

  if (result.error) {
    return res.status(result.code).json({ message: result.message });
  }

  return res
    .status(result.code)
    .json({
      data: result.data.tasks,
      metaData: result.data.pagination,
      message: result.message,
    });
};

export const handleSoftDeleteTask = async (req: AuthRequest, res: Response) => {
  const userId = req.user?.id;
  const { taskId } = req.params;

  const result = await taskService.softDeleteTask(userId, taskId);

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

  const result = await taskService.hardDeleteTask(userId, taskId);

  if (result.error) {
    return res.status(result.code).json({ message: result.message });
  }

  return res.status(result.code).json({ message: result.message });
};

export const handleRestoreTask = async (req: AuthRequest, res: Response) => {
  const userId = req.user?.id;
  const { taskId } = req.params;

  const result = await taskService.restoreTask(userId, taskId);

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
  const params = parseQueryParams(req.query);

  const result = await taskService.getTaskCompleted(userId, params);

  if (result.error) {
    return res.status(result.code).json({ message: result.message });
  }

  return res.status(result.code).json({
    data: result.data.tasks,
    metaData: result.data.pagination,
    message: result.message,
  });
};

export const handleGetTaskPending = async (req: AuthRequest, res: Response) => {
  const userId = req.user.id;
  const params = parseQueryParams(req.query);

  const result = await taskService.getTaskPending(userId, params);

  if (result.error) {
    return res.status(result.code).json({ message: result.message });
  }

  return res.status(result.code).json({
    data: result.data.tasks,
    metaData: result.data.pagination,
    message: result.message,
  });
};

export const handleGetDetailTask = async (req: AuthRequest, res: Response) => {
  const userId = req.user?.id;
  const taskId = req.params.id;
  const result = await taskService.taskDetail(userId, taskId);
  if (result.error) {
    return res.status(result.code).json({ message: result.message });
  }

  return res
    .status(result.code)
    .json({ data: result.data, message: result.message });
};

export const handleGetTaskTrash = async (req: AuthRequest, res: Response) => {
  const userId = req.user.id;
  const params = parseQueryParams(req.query);

  const result = await taskService.getTaskTrash(userId, params);

  if (result.error) {
    return res.status(result.code).json({ message: result.message });
  }

  return res.status(result.code).json({
    data: result.data.tasks,
    metaData: result.data.pagination,
    message: result.message,
  });
};
