import Task, { ITask } from "../models/task.model";
import mongoose, { Types } from "mongoose";
import { IServiceResult, IServiceParams } from "../interfaces/common.interface";
import { ITaskPayload, ISoftDeleteTask } from "../interfaces/task.interface";
import { ITaskServiceResult } from "../types/task";
import { taskAdapter } from "../adapters/task.adapter";
import validationId from "../helpers/validationId.helper";
import {
  comparePassword,
  hashPassword,
  normalizeEmail,
} from "../helpers/auth.helper";
import { successResponse, errorResponse } from "../helpers/response.helper";
import getPagination from "../helpers/pagination.helper";

interface IGetTaskParams {
  user_id: Types.ObjectId | string | undefined;
  task_id?: Types.ObjectId | string | undefined;
  page?: number;
  limit?: number;
  sort_by?: string;
  order?: "asc" | "desc";
  query?: string;
}

interface ISearchTaskParams {
  user_id: Types.ObjectId | string | undefined;
  query: string;
  page?: number;
  limit?: number;
  sort_by?: string;
  order?: "asc" | "desc";
}

export const createTask = async (
  id: string,
  payload: ITaskPayload,
): Promise<
  IServiceResult<{
    title: string;
    description: string;
    dueDate: Date | string;
    priority: "low" | "medium" | "high";
  }>
> => {
  try {
    const validatedId = validationId(id);
    if (!validatedId.valid) {
      return errorResponse(validatedId.message, 400);
    }

    const newTask = await Task.create({
      user_id: validatedId.value,
      title: payload.title,
      description: payload.description,
      due_date: payload.dueDate,
      priority: payload.priority,
    });

    await newTask.save();

    return successResponse("Create task successfully", 201, {
      title: payload.title,
      description: payload.description,
      dueDate: payload.dueDate,
      priority: payload.priority,
    });
  } catch (error: any) {
    return errorResponse("Internal server error", 500);
  }
};

export const updateTask = async (
  id: string,
  user_id: string,
  payload: ITaskPayload,
): Promise<
  IServiceResult<{
    title: string;
    description: string;
    dueDate: Date | string;
    priority: "low" | "medium" | "high";
  }>
> => {
  try {
    const validatedTaskId = validationId(id);

    if (!validatedTaskId.valid) {
      return errorResponse(validatedTaskId.message, 400);
    }

    const validatedUserId = validationId(user_id);

    if (!validatedUserId.valid) {
      return errorResponse(validatedUserId.message, 400);
    }

    const task = await Task.findOne({
      _id: validatedTaskId.value,
      user_id: validatedUserId.value,
      deleted_at: null,
    });

    if (!task) {
      return errorResponse("Task not found", 404);
    }

    if (payload.title !== undefined) {
      task.title = payload.title;
    }

    if (payload.description !== undefined) {
      task.description = payload.description;
    }

    if (payload.dueDate !== undefined) {
      task.due_date = new Date(payload.dueDate);
    }

    if (payload.priority !== undefined) {
      task.priority = payload.priority;
    }

    await task.save();

    return successResponse("Update task successfully", 201, {
      title: task.title,
      description: task.description,
      dueDate: task.due_date.toISOString().split("T")[0],
      priority: task.priority as "low" | "medium" | "high",
    });
  } catch (error: any) {
    console.error("UPDATE TASK ERROR:", error);
    return errorResponse("Internal server error", 500);
  }
};

export const getTask = async (
  user_id: string,
  params: IServiceParams,
): Promise<
  IServiceResult<{
    tasks: {
      id: string;
      title: string;
      description: string;
      dueDate: string;
      priority: "low" | "medium" | "high";
      createdAt: Date;
      updatedAt: Date;
    }[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  }>
> => {
  try {
    const validatedUserId = validationId(user_id);

    if (!validatedUserId.valid) {
      return errorResponse(validatedUserId.message, 400);
    }

    const pagination = getPagination(params);

    const filters: Record<string, unknown> = {
      user_id: validatedUserId.value,
      deleted_at: null,
    };

    if (params.query) {
      filters.$or = [
        {
          title: {
            $regex: params.query,
            $options: "i",
          },
        },
        {
          description: {
            $regex: params.query,
            $options: "i",
          },
        },
      ];
    }

    const [tasks, total] = await Promise.all([
      Task.find(filters)
        .sort(pagination.sort)
        .skip(pagination.skip)
        .limit(pagination.limit),

      Task.countDocuments(filters),
    ]);

    return successResponse("Get task successfully", 200, {
      tasks: tasks.map((task) => ({
        id: task.id,
        title: task.title,
        description: task.description,
        dueDate: task.due_date.toISOString().split("T")[0],
        priority: task.priority as "low" | "medium" | "high",
        createdAt: task.createdAt,
        updatedAt: task.updatedAt,
      })),
      pagination: {
        page: pagination.page,
        limit: pagination.limit,
        total,
        totalPages: Math.ceil(total / pagination.limit),
      },
    });
  } catch (error: any) {
    console.error("GET TASK ERROR:", error);

    return errorResponse("Internal server error", 500);
  }
};

export const softDeleteTask = async (
  payload: ISoftDeleteTask,
): Promise<ITaskServiceResult> => {
  try {
    console.log("TESSSS", payload);
    const validationUserId = validationId(payload.userId);
    if (!validationUserId.valid) {
      return errorResponse(validationUserId.message, 400);
    }

    const validationTaskId = validationId(payload.taskId);
    if (!validationTaskId.valid) {
      return errorResponse(validationTaskId.message, 400);
    }

    const task = await Task.findOne({
      _id: validationTaskId.value,
      user_id: validationUserId.value,
      deleted_at: null,
    } satisfies {
      _id: string;
      user_id: string;
      deleted_at: null;
    });

    if (!task) {
      return errorResponse("Task not found or already deleted.", 400);
    }

    // soft deleted
    task.deleted_at = new Date();
    await task.save();

    return successResponse("Task moved to trash successfully", 201);
  } catch (error: any) {
    return errorResponse("Internal server error", 500);
  }
};

export const restoreTask = async (
  user_id: string,
  task_id: string,
): Promise<ITaskServiceResult> => {
  try {
    if (!user_id || !task_id) {
      return {
        error: true,
        code: 400,
        message: "user_id and task_id are required.",
      };
    }

    if (
      !mongoose.isValidObjectId(user_id) ||
      !mongoose.isValidObjectId(task_id)
    ) {
      return { error: true, code: 400, message: "Invalid id format" };
    }

    const query = {
      _id: new Types.ObjectId(task_id),
      user_id: new Types.ObjectId(user_id),
      deleted_at: { $ne: null },
    };

    const task = await Task.findOne(query).exec();

    if (!task) {
      return {
        error: true,
        code: 404,
        message: "Task not found or not deleted.",
      };
    }

    task.deleted_at = null;
    await task.save();

    return { data: task, message: "Task restored successfully." };
  } catch (error) {
    return { error: true, code: 500, message: "Internal server error" };
  }
};

export const hardDeleteTask = async (
  user_id: string,
  task_id: string,
): Promise<ITaskServiceResult> => {
  try {
    if (!user_id || !task_id) {
      return {
        error: true,
        code: 400,
        message: "user_id and task_id are required.",
      };
    }

    if (
      !mongoose.isValidObjectId(user_id) ||
      !mongoose.isValidObjectId(task_id)
    ) {
      return { error: true, code: 400, message: "Invalid id format" };
    }

    const query = {
      _id: new Types.ObjectId(task_id),
      user_id: new Types.ObjectId(user_id),
    };

    const deleted = await Task.findOneAndDelete(query).exec();

    if (!deleted) {
      return {
        error: true,
        code: 404,
        message: "Task not found or already deleted.",
      };
    }

    return { message: "Task permanently deleted successfully." };
  } catch (error) {
    return { error: true, code: 500, message: "Internal server error" };
  }
};

export const updateTaskStatus = async (
  user_id: string,
  task_id: string,
  is_completed: boolean,
): Promise<ITaskServiceResult> => {
  try {
    if (!user_id || !task_id) {
      return {
        error: true,
        code: 400,
        message: "user_id and task_id are required.",
      };
    }

    if (
      !mongoose.isValidObjectId(user_id) ||
      !mongoose.isValidObjectId(task_id)
    ) {
      return { error: true, code: 400, message: "Invalid id format." };
    }

    if (typeof is_completed !== "boolean") {
      return {
        error: true,
        code: 400,
        message: "is_completed must be a boolean (true/false).",
      };
    }

    const query = {
      _id: new Types.ObjectId(task_id),
      user_id: new Types.ObjectId(user_id),
      deleted_at: null,
    };

    const updated = await Task.findOneAndUpdate(
      query,
      {
        is_completed,
      },
      { new: true },
    );

    if (!updated) {
      return { error: true, code: 404, message: "Task not found." };
    }

    return { data: updated, message: "Task status updated successfully." };
  } catch (error) {
    return { error: true, code: 500, message: "Internal server error" };
  }
};

export const getTaskCompleted = async ({
  user_id,
  page = 1,
  limit = 5,
  sort_by = "createdAt",
  order = "desc",
  query,
}: IGetTaskParams): Promise<ITaskServiceResult> => {
  try {
    if (!user_id) {
      return { error: true, code: 400, message: '"user_id is required."' };
    }

    if (!mongoose.isValidObjectId(user_id)) {
      return { error: true, code: 400, message: "Invalid format id" };
    }

    const skip: number = (page - 1) * limit;
    const sortOption: any = {};
    sortOption[sort_by] = order === "asc" ? 1 : -1;

    const searchFilter: Record<string, unknown> = {
      user_id,
      deleted_at: null,
      is_completed: true,
      $or: [
        { title: { $regex: query, $options: "i" } },
        { description: { $regex: query, $options: "i" } },
      ],
    };

    const [tasks, total] = await Promise.all([
      Task.find(searchFilter).sort(sortOption).skip(skip).limit(limit),
      Task.countDocuments(searchFilter),
    ]);

    return {
      data: taskAdapter(tasks),
      pagination: {
        page,
        limit,
        total,
        total_pages: Math.ceil(total / limit),
      },
    } as unknown as ITaskServiceResult;
  } catch (error) {
    return { error: true, code: 500, message: "Internal server error" };
  }
};

export const getTaskPending = async ({
  user_id,
  page = 1,
  limit = 5,
  sort_by = "createdAt",
  order = "desc",
  query = "",
}: IGetTaskParams): Promise<ITaskServiceResult> => {
  try {
    if (!user_id) {
      return { error: true, code: 400, message: '"user_id is required."' };
    }

    if (!mongoose.isValidObjectId(user_id)) {
      return { error: true, code: 400, message: "Invalid format id" };
    }

    const skip: number = (page - 1) * limit;
    const sortOption: any = {};
    sortOption[sort_by] = order === "asc" ? 1 : -1;

    const searchFilter: Record<string, unknown> = {
      user_id,
      deleted_at: null,
      is_completed: false,
      $or: [
        { title: { $regex: query, $options: "i" } },
        { description: { $regex: query, $options: "i" } },
      ],
    };

    const [tasks, total] = await Promise.all([
      Task.find(searchFilter).sort(sortOption).skip(skip).limit(limit),
      Task.countDocuments(searchFilter),
    ]);

    return {
      data: taskAdapter(tasks),
      pagination: {
        page,
        limit,
        total,
        total_pages: Math.ceil(total / limit),
      },
    } as unknown as ITaskServiceResult;
  } catch (error) {
    return { error: true, code: 500, message: "Internal server error" };
  }
};

export const taskDetail = async ({
  user_id,
  task_id,
}: IGetTaskParams): Promise<ITaskServiceResult> => {
  try {
    if (!user_id) {
      return { error: true, code: 400, message: "User id is required!" };
    }
    if (!task_id) {
      return { error: true, code: 400, message: "Task id is required!" };
    }

    if (!mongoose.isValidObjectId(user_id))
      return { error: true, code: 400, message: "Invalid user id format" };

    if (!mongoose.isValidObjectId(task_id))
      return { error: true, code: 400, message: "Invalid task id format" };

    const taskFindId = await Task.findOne({
      _id: task_id,
      user_id: user_id,
      deleted_at: null,
    })
      .select("-user_id -deleted_at -createdAt -updatedAt")
      .exec();

    if (!taskFindId) {
      return { error: true, code: 404, message: "Task not found!" };
    }

    return { data: taskFindId };
  } catch (error) {
    console.error("TASK DETAIL ERROR:", error);
    return { error: true, code: 500, message: "Internal server error" };
  }
};
