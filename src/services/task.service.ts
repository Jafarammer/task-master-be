import {
  IServiceParams,
  IServiceResponse,
} from "../interfaces/common.interface";
import {
  ITaskPayload,
  IUpdateStatusTaskPayload,
  IResultDataTask,
  IResultMetaDataTask,
  IResultDataTrashStatistics,
} from "../interfaces/task.interface";
import {
  insertTask,
  findActiveTaskByIdAndUserId,
  updateTaskByIdAndUserId,
  findTasksByUserId,
  softDeleteTaskByIdandUserId,
  restoreTaskByIdandUserId,
  findInactiveTaskByIdAndUserId,
  updateStatusTaskByIdAndUserId,
  findTasksByUserIdStatus,
  findTrashTaskByUserId,
  getTaskStatisticsByUserId,
  hardDeleteTaskByIdAndUserId,
  deleteAllTrashTasksByUserId,
} from "../repositories/task.repository";
import validationId from "../helpers/validationId.helper";
import { successResponse, errorResponse } from "../helpers/response.helper";
import getPagination from "../helpers/pagination.helper";
import {
  calculateTaskSize,
  validateUserStorage,
  MAX_USER_STORAGE,
  formatBytes,
} from "../helpers/storage.helper";
import expiredTask from "../helpers/expiredTask.helper";

export const createTask = async (
  id: string,
  payload: ITaskPayload,
): Promise<IServiceResponse<IResultDataTask>> => {
  try {
    const validatedId = validationId(id);
    if (!validatedId.valid) {
      return errorResponse(validatedId.message, 400);
    }

    const taskSize = calculateTaskSize({
      title: payload.title,
      description: payload.description,
    });

    const storageValidation = await validateUserStorage(
      validatedId.value,
      taskSize,
    );
    if (!storageValidation.valid) {
      return errorResponse(
        "Storage limit exceeded. Maximum storage is 5 MB",
        400,
      );
    }

    const newTask = await insertTask(validatedId.value, payload, taskSize);

    await newTask.save();

    return successResponse("Create task successfully", 201, {
      id: newTask.id,
      title: newTask.title,
      description: newTask.description,
      startDate: newTask.start_date?.toISOString().split("T")[0] ?? null,
      endDate: newTask.end_date?.toISOString().split("T")[0] ?? null,
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

    const task = await findActiveTaskByIdAndUserId(
      validatedTaskId.value,
      validatedUserId.value,
    );

    if (!task) {
      return errorResponse("Task not found", 404);
    }

    const oldTaskSize = task.size;
    const newTaskSize = calculateTaskSize({
      title: payload.title,
      description: payload.description,
    });

    const storageValidation = await validateUserStorage(
      validatedUserId.value,
      newTaskSize,
      oldTaskSize,
    );

    if (!storageValidation.valid) {
      return errorResponse(
        "Storage limit exceeded. Maximum storage is 5 MB",
        400,
      );
    }

    const updatePayload = await updateTaskByIdAndUserId(
      validatedTaskId.value,
      validatedUserId.value,
      payload,
      newTaskSize,
    );

    if (!updatePayload) {
      return errorResponse("Task not found", 404);
    }

    return successResponse("Update task successfully", 201, {
      id: id,
      title: updatePayload.title,
      description: updatePayload.description,
      startDate: updatePayload.start_date?.toISOString().split("T")[0] ?? null,
      endDate: updatePayload.end_date?.toISOString().split("T")[0] ?? null,
      priority: updatePayload.priority as "low" | "medium" | "high",
      isCompleted: updatePayload.is_completed,
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

    const result = await findTasksByUserId({
      userId: validatedUserId.value,
      query: params.query,
      skip: pagination.skip,
      limit: pagination.limit,
      sort: pagination.sort,
    });

    return successResponse("Get task successfully", 200, {
      tasks: result.tasks.map((task) => ({
        id: task._id,
        title: task.title,
        description: task.description,
        startDate: task.start_date?.toISOString().split("T")[0] ?? null,
        endDate: task.end_date?.toISOString().split("T")[0] ?? null,
        priority: task.priority as "low" | "medium" | "high",
        isCompleted: task.is_completed,
        isExpired: task.end_date
          ? expiredTask(task.end_date, task.is_completed)
          : null,
      })),
      pagination: {
        page: pagination.page,
        limit: pagination.limit,
        total: result.total,
        totalPages: Math.ceil(result.total / pagination.limit),
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

    const isDeleted = await softDeleteTaskByIdandUserId(
      validationTaskId.value,
      validationUserId.value,
    );

    if (!isDeleted)
      return errorResponse("Task not found or already deleted", 404);

    return successResponse("Task moved to trash successfully", 200);
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

    const isDeleted = await hardDeleteTaskByIdAndUserId(
      validatedTaskId.value,
      validatedUserId.value,
    );

    if (!isDeleted) {
      return errorResponse("Task not found or not in trash", 404);
    }

    return successResponse("Task deleted successfully", 200);
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

    const task = await findInactiveTaskByIdAndUserId(
      validatedTaskId.value,
      validatedUserId.value,
    );

    if (!task) {
      return errorResponse("Task not found or not deleted", 404);
    }

    const storageValidation = await validateUserStorage(
      validatedUserId.value,
      task.size,
    );
    if (!storageValidation.valid) {
      return errorResponse(
        "Storage limit exceeded. Maximum storage is 5 MB",
        400,
      );
    }

    const isRestored = await restoreTaskByIdandUserId(
      validatedTaskId.value,
      validatedUserId.value,
    );

    if (!isRestored) return errorResponse("Task not found or not deleted", 404);

    return successResponse("Task restored successfully", 200);
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

    const updated = await updateStatusTaskByIdAndUserId(
      validatedTaskId.value,
      validatedUserId.value,
      payload.isCompleted,
    );

    if (!updated) {
      return errorResponse("Task not found", 404);
    }

    return successResponse("Task status updated successfully", 200);
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

    const result = await findTasksByUserIdStatus(
      {
        userId: validatedId.value,
        query: params.query,
        skip: pagination.skip,
        limit: pagination.limit,
        sort: pagination.sort,
      },
      "complete",
    );

    return successResponse("Get task completed successfully", 200, {
      tasks: result.tasks.map((task) => ({
        id: task._id,
        title: task.title,
        description: task.description,
        startDate: task.start_date?.toISOString().split("T")[0] ?? null,
        endDate: task.end_date?.toISOString().split("T")[0] ?? null,
        priority: task.priority as "low" | "medium" | "high",
        isCompleted: task.is_completed,
      })),
      pagination: {
        page: pagination.page,
        limit: pagination.limit,
        total: result.total,
        totalPages: Math.ceil(result.total / pagination.limit),
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

    const result = await findTasksByUserIdStatus(
      {
        userId: validatedId.value,
        query: params.query,
        skip: pagination.skip,
        limit: pagination.limit,
        sort: pagination.sort,
      },
      "pending",
    );

    return successResponse("Get task pending successfully", 200, {
      tasks: result.tasks.map((task) => ({
        id: task._id,
        title: task.title,
        description: task.description,
        startDate: task.start_date?.toISOString().split("T")[0] ?? null,
        endDate: task.end_date?.toISOString().split("T")[0] ?? null,
        priority: task.priority as "low" | "medium" | "high",
        isCompleted: task.is_completed,
        isExpired: task.end_date
          ? expiredTask(task.end_date, task.is_completed)
          : null,
      })),
      pagination: {
        page: pagination.page,
        limit: pagination.limit,
        total: result.total,
        totalPages: Math.ceil(result.total / pagination.limit),
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

    const taskFindId = await findActiveTaskByIdAndUserId(
      validatedTaskId.value,
      validatedUserId.value,
    );

    if (!taskFindId) {
      return errorResponse("Task not found", 404);
    }

    return successResponse("Get task detail successfully", 200, {
      id: taskFindId._id.toString(),
      title: taskFindId.title,
      description: taskFindId.description,
      startDate: taskFindId.start_date?.toISOString().split("T")[0] ?? null,
      endDate: taskFindId.end_date?.toISOString().split("T")[0] ?? null,
      priority: taskFindId.priority as "low" | "medium" | "high",
      isCompleted: taskFindId.is_completed,
      isExpired: taskFindId.end_date
        ? expiredTask(taskFindId.end_date, taskFindId.is_completed)
        : null,
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

    const result = await findTrashTaskByUserId({
      userId: validatedId.value,
      query: params.query,
      skip: pagination.skip,
      limit: pagination.limit,
      sort: pagination.sort,
    });

    return successResponse("Get task trash successfully", 200, {
      tasks: result.tasks.map((task) => ({
        id: task._id,
        title: task.title,
        description: task.description,
        startDate: task.start_date?.toISOString().split("T")[0] ?? null,
        endDate: task.end_date?.toISOString().split("T")[0] ?? null,
        priority: task.priority as "low" | "medium" | "high",
        isCompleted: task.is_completed,
      })),
      pagination: {
        page: pagination.page,
        limit: pagination.limit,
        total: result.total,
        totalPages: Math.ceil(result.total / pagination.limit),
      },
    });
  } catch (error: any) {
    console.error("GET TASK TRASH ERROR", error);
    return errorResponse("Internal server error", 500);
  }
};

export const getTrashStatistics = async (
  userid: string,
): Promise<IServiceResponse<IResultDataTrashStatistics>> => {
  try {
    const validatedId = validationId(userid);
    if (!validatedId.valid) {
      return errorResponse(validatedId.message, 400);
    }

    const statistics = await getTaskStatisticsByUserId(validatedId.value);

    const percentage = Math.min(
      Math.round((statistics.usedBytes / MAX_USER_STORAGE) * 100),
      100,
    );

    return successResponse("Get trash statistics successfully", 200, {
      totalItems: statistics.totalItems,
      trashItems: statistics.trashItems,
      activeItems: statistics.activeItems,
      usedStorage: formatBytes(statistics.usedBytes),
      maxStorage: formatBytes(MAX_USER_STORAGE),
      percentage,
    });
  } catch (error: any) {
    console.error("GET TRASH STATISTICS ERROR", error);
    return errorResponse("Internal server error", 500);
  }
};

export const deleteAllTaskTrash = async (
  userId: string,
): Promise<IServiceResponse> => {
  try {
    const validatedId = validationId(userId);
    if (!validatedId.valid) {
      return errorResponse(validatedId.message, 400);
    }

    const deletedCount = await deleteAllTrashTasksByUserId(validatedId.value);
    if (deletedCount === 0) {
      return errorResponse("Trash is empty", 404);
    }

    return successResponse("Trash emptied successfully", 200);
  } catch (error: any) {
    console.error("DELETE ALL TASK TRASH ERROR", error);
    return errorResponse("Internal server error", 500);
  }
};
