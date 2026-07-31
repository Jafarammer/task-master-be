import mongoose from "mongoose";
import Task, { ITask } from "../models/task.model";
import {
  ITaskPayload,
  IGetTaskRepositoryResult,
  IGetTaskRepositoryParams,
  ITaskRepositoryResult,
} from "../interfaces/task.interface";

export const insertTask = async (
  userId: string,
  payload: ITaskPayload,
  size: number,
): Promise<ITask> => {
  return Task.create({
    user_id: userId,
    title: payload.title,
    description: payload.description,
    start_date: payload.startDate,
    end_date: payload.endDate,
    priority: payload.priority,
    size: size,
  });
};

export const findActiveTaskByIdAndUserId = async (
  taskId: string,
  userId: string,
): Promise<ITask | null> => {
  return Task.findOne({
    _id: taskId,
    user_id: userId,
    deleted_at: null,
  }).lean<ITask>();
};

export const findInactiveTaskByIdAndUserId = async (
  taskId: string,
  userId: string,
): Promise<ITask | null> => {
  return Task.findOne({
    _id: taskId,
    user_id: userId,
    deleted_at: {
      $ne: null,
    },
  }).lean<ITask>();
};

export const updateTaskByIdAndUserId = async (
  taskId: string,
  userId: string,
  paylaod: ITaskPayload,
  size: number,
): Promise<ITask | null> => {
  return Task.findOneAndUpdate(
    {
      _id: taskId,
      user_id: userId,
      deleted_at: null,
    },
    {
      $set: {
        title: paylaod.title,
        description: paylaod.description,
        start_date: paylaod.startDate,
        end_date: paylaod.endDate,
        priority: paylaod.priority,
        size: size,
      },
    },
    {
      new: true,
      runValidators: true,
    },
  )
    .select(
      "_id title description start_date end_date priority is_completed size",
    )
    .lean<ITask>()
    .exec();
};

export const findTasksByUserId = async (
  params: IGetTaskRepositoryParams,
): Promise<IGetTaskRepositoryResult> => {
  const filters: Record<string, unknown> = {
    user_id: params.userId,
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
      .select("_id title description start_date end_date priority is_completed")
      .sort(params.sort)
      .skip(params.skip)
      .limit(params.limit)
      .lean<ITaskRepositoryResult[]>()
      .exec(),
    Task.countDocuments(filters),
  ]);

  return {
    tasks,
    total,
  };
};

export const softDeleteTaskByIdandUserId = async (
  taskId: string,
  userId: string,
): Promise<boolean> => {
  const result = await Task.updateOne(
    {
      _id: taskId,
      user_id: userId,
      deleted_at: null,
    },
    {
      $set: {
        deleted_at: new Date(),
      },
    },
  );

  return result.modifiedCount > 0;
};

export const restoreTaskByIdandUserId = async (
  taskId: string,
  userId: string,
): Promise<boolean> => {
  const result = await Task.updateOne(
    {
      _id: taskId,
      user_id: userId,
      deleted_at: {
        $ne: null,
      },
    },
    {
      $set: {
        deleted_at: null,
      },
    },
  );

  return result.modifiedCount > 0;
};

export const updateStatusTaskByIdAndUserId = async (
  taskId: string,
  userId: string,
  isCompleted: boolean,
): Promise<boolean> => {
  const result = await Task.updateOne(
    {
      _id: taskId,
      user_id: userId,
      deleted_at: null,
    },
    {
      $set: {
        is_completed: isCompleted,
      },
    },
  );

  return result.matchedCount > 0;
};

export const findTasksByUserIdStatus = async (
  params: IGetTaskRepositoryParams,
  type: string,
): Promise<IGetTaskRepositoryResult> => {
  const filters: Record<string, unknown> = {
    user_id: params.userId,
    deleted_at: null,
    is_completed: type === "complete" ? true : false,
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
      .select("_id title description start_date end_date priority is_completed")
      .sort(params.sort)
      .skip(params.skip)
      .limit(params.limit)
      .lean<ITaskRepositoryResult[]>()
      .exec(),
    Task.countDocuments(filters),
  ]);

  return {
    tasks,
    total,
  };
};

export const findTrashTaskByUserId = async (
  params: IGetTaskRepositoryParams,
): Promise<IGetTaskRepositoryResult> => {
  const filters: Record<string, unknown> = {
    user_id: params.userId,
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
      .select("_id title description start_date end_date priority is_completed")
      .sort(params.sort)
      .skip(params.skip)
      .limit(params.limit)
      .lean<ITaskRepositoryResult[]>()
      .exec(),
    Task.countDocuments(filters),
  ]);

  return {
    tasks,
    total,
  };
};

export const getTaskStatisticsByUserId = async (
  userId: string,
): Promise<{
  totalItems: number;
  trashItems: number;
  activeItems: number;
  usedBytes: number;
}> => {
  const objectUserId = new mongoose.Types.ObjectId(userId);
  const [totalItems, trashItems, activeItems, storageResult] =
    await Promise.all([
      // total items
      Task.countDocuments({
        user_id: objectUserId,
      }),
      // trash items
      Task.countDocuments({
        user_id: objectUserId,
        deleted_at: {
          $ne: null,
        },
      }),
      // active items
      Task.countDocuments({
        user_id: objectUserId,
        deleted_at: null,
      }),
      // use Bytes
      Task.aggregate<{ totalSize: number }>([
        {
          $match: {
            user_id: objectUserId,
          },
        },
        {
          $group: {
            _id: null,
            totalSize: {
              $sum: "$size",
            },
          },
        },
      ]),
    ]);

  return {
    totalItems,
    trashItems,
    activeItems,
    usedBytes: storageResult[0]?.totalSize ?? 0,
  };
};

export const hardDeleteTaskByIdAndUserId = async (
  taskId: string,
  userId: string,
): Promise<boolean> => {
  const result = await Task.deleteOne({
    _id: taskId,
    user_id: userId,
    deleted_at: {
      $ne: null,
    },
  });

  return result.deletedCount > 0;
};

export const deleteAllTrashTasksByUserId = async (
  userId: string,
): Promise<number> => {
  const result = await Task.deleteMany({
    user_id: userId,
    deleted_at: {
      $ne: null,
    },
  });

  return result.deletedCount;
};
