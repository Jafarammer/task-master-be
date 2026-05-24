import Task from "../models/task.model";
import {
  IServiceParams,
  IServiceResponse,
} from "../interfaces/common.interface";
import {
  ITaskPayload,
  IUpdateStatusTaskPayload,
  IResultDataTask,
  IResultMetaDataTask,
} from "../interfaces/task.interface";
import validationId from "../helpers/validationId.helper";
import { successResponse, errorResponse } from "../helpers/response.helper";
import getPagination from "../helpers/pagination.helper";

export const createTask = async (
  id: string,
  payload: ITaskPayload,
): Promise<IServiceResponse<IResultDataTask>> => {
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
      id: newTask.id,
      title: newTask.title,
      description: newTask.description,
      dueDate: newTask.due_date.toISOString().split("T")[0],
      priority: newTask.priority,
      isCompleted: newTask.is_completed,
    });
  } catch (error: any) {
    console.error("CREATE TASK ERROR", error);
    return errorResponse("Internal server error", 500);
  }
};

export const updateTask = async (
  id: string,
  user_id: string,
  payload: ITaskPayload,
): Promise<IServiceResponse<IResultDataTask>> => {
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
      id: id,
      title: task.title,
      description: task.description,
      dueDate: task.due_date.toISOString().split("T")[0],
      priority: task.priority as "low" | "medium" | "high",
      isCompleted: task.is_completed,
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
  IServiceResponse<{
    tasks: IResultDataTask[];
    pagination: IResultMetaDataTask;
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
        isCompleted: task.is_completed,
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
  userId: string,
  taskId: string,
): Promise<IServiceResponse> => {
  try {
    const validationUserId = validationId(userId);
    if (!validationUserId.valid) {
      return errorResponse(validationUserId.message, 400);
    }

    const validationTaskId = validationId(taskId);
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
      return errorResponse("Task not found or already deleted", 400);
    }

    // soft deleted
    task.deleted_at = new Date();
    await task.save();

    return successResponse("Task moved to trash successfully", 201);
  } catch (error: any) {
    console.error("SOFT DELETE TASK ERROR", error);
    return errorResponse("Internal server error", 500);
  }
};

export const hardDeleteTask = async (
  userId: string,
  taskId: string,
): Promise<IServiceResponse> => {
  try {
    const validatedUserId = validationId(userId);
    if (!validatedUserId.valid) {
      return errorResponse(validatedUserId.message, 400);
    }

    const validatedTaskId = validationId(taskId);
    if (!validatedTaskId.valid) {
      return errorResponse(validatedTaskId.message, 400);
    }

    const query = {
      _id: validatedTaskId.value,
      user_id: validatedUserId.value,
    };

    const deleted = await Task.findOneAndDelete(query).exec();

    if (!deleted) {
      return errorResponse("Task not found or already deleted", 404);
    }

    return successResponse("Task deleted successfully", 201);
  } catch (error: any) {
    console.error("HARD DELETE TASK ERROR", error);
    return errorResponse("Internal server error", 500);
  }
};

export const restoreTask = async (
  userId: string,
  taskId: string,
): Promise<IServiceResponse> => {
  try {
    const validatedUserId = validationId(userId);
    if (!validatedUserId.valid) {
      return errorResponse(validatedUserId.message, 400);
    }

    const validatedTaskId = validationId(taskId);
    if (!validatedTaskId.valid) {
      return errorResponse(validatedTaskId.message, 400);
    }

    const query = {
      _id: validatedTaskId.value,
      user_id: validatedUserId.value,
      deleted_at: { $ne: null },
    };

    const task = await Task.findOne(query).exec();

    if (!task) {
      return errorResponse("Task not found or not deleted", 404);
    }

    task.deleted_at = null;
    await task.save();

    return successResponse("Task restored successfully", 201);
  } catch (error: any) {
    console.error("RESTOR TASK ERROR", error);
    return errorResponse("Internal server error", 500);
  }
};

export const updateTaskStatus = async (
  userId: string,
  taskId: string,
  payload: IUpdateStatusTaskPayload,
): Promise<IServiceResponse> => {
  try {
    const validatedUserId = validationId(userId);
    if (!validatedUserId.valid) {
      return errorResponse(validatedUserId.message, 400);
    }

    const validatedTaskId = validationId(taskId);
    if (!validatedTaskId.valid) {
      return errorResponse(validatedTaskId.message, 400);
    }

    const query = {
      _id: validatedTaskId.value,
      user_id: validatedUserId.value,
      deleted_at: null,
    };

    const updated = await Task.findOneAndUpdate(
      query,
      {
        is_completed: payload.isCompleted,
      },
      { new: true },
    );

    if (!updated) {
      return errorResponse("Task not found", 404);
    }

    return successResponse("Task status updated successfully", 201);
  } catch (error: any) {
    console.error("UPDATE STATUS TASK ERROR", error);
    return errorResponse("Internal server error", 500);
  }
};

export const getTaskCompleted = async (
  userId: string,
  params: IServiceParams,
): Promise<
  IServiceResponse<{
    tasks: IResultDataTask[];
    pagination: IResultMetaDataTask;
  }>
> => {
  try {
    const validatedId = validationId(userId);
    if (!validatedId.valid) {
      return errorResponse(validatedId.message, 400);
    }

    const pagination = getPagination(params);

    const filters: Record<string, unknown> = {
      user_id: validatedId.value,
      deleted_at: null,
      is_completed: true,
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

    return successResponse("Get task completed successfully", 200, {
      tasks: tasks.map((task) => ({
        id: task.id,
        title: task.title,
        description: task.description,
        dueDate: task.due_date.toISOString().split("T")[0],
        priority: task.priority as "low" | "medium" | "high",
        isCompleted: task.is_completed,
      })),
      pagination: {
        page: pagination.page,
        limit: pagination.limit,
        total,
        totalPages: Math.ceil(total / pagination.limit),
      },
    });
  } catch (error: any) {
    console.error("GET TASK COMPLETED ERROR", error);
    return errorResponse("Internal server error", 500);
  }
};

export const getTaskPending = async (
  userId: string,
  params: IServiceParams,
): Promise<
  IServiceResponse<{
    tasks: IResultDataTask[];
    pagination: IResultMetaDataTask;
  }>
> => {
  try {
    const validatedId = validationId(userId);
    if (!validatedId.valid) {
      return errorResponse(validatedId.message, 400);
    }

    const pagination = getPagination(params);

    const filters: Record<string, unknown> = {
      user_id: validatedId.value,
      deleted_at: null,
      is_completed: false,
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

    return successResponse("Get task pending successfully", 200, {
      tasks: tasks.map((task) => ({
        id: task.id,
        title: task.title,
        description: task.description,
        dueDate: task.due_date.toISOString().split("T")[0],
        priority: task.priority as "low" | "medium" | "high",
        isCompleted: task.is_completed,
      })),
      pagination: {
        page: pagination.page,
        limit: pagination.limit,
        total,
        totalPages: Math.ceil(total / pagination.limit),
      },
    });
  } catch (error: any) {
    console.error("GET TASK PENDING ERROR", error);
    return errorResponse("Internal server error", 500);
  }
};

export const taskDetail = async (
  userId: string,
  taskId: string,
): Promise<IServiceResponse<IResultDataTask>> => {
  try {
    const validatedUserId = validationId(userId);
    if (!validatedUserId.valid) {
      return errorResponse(validatedUserId.message, 400);
    }

    const validatedTaskId = validationId(taskId);
    if (!validatedTaskId.valid) {
      return errorResponse(validatedTaskId.message, 400);
    }

    const taskFindId = await Task.findOne({
      _id: validatedTaskId.value,
      user_id: validatedUserId.value,
      deleted_at: null,
    })
      .select("-user_id -deleted_at -createdAt -updatedAt")
      .exec();

    if (!taskFindId) {
      return errorResponse("Task not found", 404);
    }

    return successResponse("Get task detail successfully", 200, {
      id: taskFindId.id,
      title: taskFindId.title,
      description: taskFindId.description,
      dueDate: taskFindId.due_date.toISOString().split("T")[0],
      priority: taskFindId.priority as "low" | "medium" | "high",
      isCompleted: taskFindId.is_completed,
    });
  } catch (error: any) {
    console.error("TASK DETAIL ERROR:", error);
    return errorResponse("Internal server error", 500);
  }
};

export const getTaskTrash = async (
  userId: string,
  params: IServiceParams,
): Promise<
  IServiceResponse<{
    tasks: IResultDataTask[];
    pagination: IResultMetaDataTask;
  }>
> => {
  try {
    const validatedId = validationId(userId);
    if (!validatedId.valid) {
      return errorResponse(validatedId.message, 400);
    }

    const pagination = getPagination(params);

    const filters: Record<string, unknown> = {
      user_id: validatedId.value,
      deleted_at: {
        $ne: null,
      },
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

    return successResponse("Get task trash successfully", 200, {
      tasks: tasks.map((task) => ({
        id: task.id,
        title: task.title,
        description: task.description,
        dueDate: task.due_date.toISOString().split("T")[0],
        priority: task.priority as "low" | "medium" | "high",
        isCompleted: task.is_completed,
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
    console.error("GET TASK TRASH ERROR", error);
    return errorResponse("Internal server error", 500);
  }
};
