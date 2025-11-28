import { Request, Response } from "express";
import * as taskService from "../services/task.service";
import { AuthRequest } from "../middleware/authMiddleware";

export const handleCreateTask = async (req: AuthRequest, res: Response) => {
  const userId = req.user?.id;

  const { title, description, due_date, priority } = req.body;

  const result = await taskService.createTask(
    userId,
    title,
    description,
    due_date,
    priority
  );

  if (result.error) {
    return res.status(result.code).json({ message: result.message });
  }

  return res.status(201).json({
    message: "Create task success",
    data: result.data,
  });
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

export const handleGetTask = async (req: AuthRequest, res: Response) => {
  const user_id: string = req.user?.id;
  const page: number = Number(req.query.page) || 1;
  const limit: number = Number(req.query.limit) || 5;
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

export const handleSearchTask = async (req: Request, res: Response) => {
  const user_id: string = (req as any).user?.id;
  const query: string = req.query.q ? String(req.query.q) : "";
  const page: number | undefined = req.query.page
    ? Number(req.query.page)
    : undefined;
  const limit: number | undefined = req.query.limit
    ? Number(req.query.limit)
    : undefined;
  const sort_by: string | undefined = req.query.sort_by
    ? String(req.query.sort_by)
    : undefined;
  const order: "asc" | "desc" | undefined =
    req.query.order === "asc" || req.query.order === "desc"
      ? (req.query.order as "asc" | "desc")
      : undefined;

  const result = await taskService.searchTask({
    user_id,
    query,
    page,
    limit,
    sort_by,
    order,
  });

  if (result.error) {
    res.status(result.code).json({ message: result.message });
  }

  return res
    .status(201)
    .json({ data: result.data, meta_data: result.pagination });
};

export const handleSoftDeleteTask = async (req: Request, res: Response) => {
  const user_id: string = (req as any).user?.id;
  const { task_id } = req.params;

  const result = await taskService.softDeleteTask(user_id, task_id);

  if (result.error) {
    return res.status(result.code).json({ message: result.message });
  }

  return res.status(201).json({
    data: result.data,
    message: result.message,
  });
};

export const handleRestoreTask = async (req: Request, res: Response) => {
  const user_id: string = (req as any).user?.id;
  const { task_id } = req.params;

  const result = await taskService.restoreTask(user_id, task_id);

  if (result.error) {
    return res.status(result.code).json({ message: result.message });
  }

  return res.status(200).json({ data: result.data, message: result.message });
};

export const handleHardDelete = async (req: Request, res: Response) => {
  const user_id: string = (req as any).user?.id;
  const { task_id } = req.params;

  const result = await taskService.hardDeleteTask(user_id, task_id);

  if (result.error) {
    return res.status(result.code).json({ message: result.message });
  }

  return res.status(200).json({ message: result.message });
};

export const handleTaskUpdateStatus = async (req: Request, res: Response) => {
  const user_id: string = (req as any).user?.id;
  const { task_id } = req.params;
  const { is_completed } = req.body;

  const result = await taskService.updateTaskStatus(
    user_id,
    task_id,
    is_completed
  );

  if (result.error) {
    return res.status(result.code).json({ message: result.message });
  }

  return res.status(201).json({ data: result.data, message: result.message });
};

export const handleGetTaskCompleted = async (req: Request, res: Response) => {
  const user_id: string = (req as any).user?.id;
  const page: number = Number(req.query.page) || 1;
  const limit: number = Number(req.query.limit) || 5;
  const sort_by: string = String(req.query.sort_by) || "createdAt";
  const order: "asc" | "desc" = req.query.order === "asc" ? "asc" : "desc";

  const result = await taskService.getTaskCompleted({
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

export const handleGetTaskPending = async (req: Request, res: Response) => {
  const user_id: string = (req as any).user?.id;
  const page: number = Number(req.query.page) || 1;
  const limit: number = Number(req.query.limit) || 5;
  const sort_by: string = String(req.query.sort_by) || "createdAt";
  const order: "asc" | "desc" = req.query.order === "asc" ? "asc" : "desc";

  const result = await taskService.getTaskPending({
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
