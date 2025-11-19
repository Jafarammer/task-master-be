import Task, { ITask } from "../models/task.model";
import mongoose, { Types } from "mongoose";

interface IServiceResult {
  error?: boolean;
  code?: number;
  message?: string;
  data?: ITask | null;
  pagination?: object;
}

interface IGetTaskParams {
  user_id: Types.ObjectId | string | undefined;
  page?: number;
  limit?: number;
  sort_by?: string;
  order?: "asc" | "desc";
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
  user_id: Types.ObjectId | string,
  title: string,
  description: string,
  due_date: Date | string,
  priority: string
): Promise<IServiceResult> => {
  try {
    if (!user_id || !title || !description || !due_date) {
      return {
        error: true,
        code: 404,
        message: "user_id, title, description,dan due_date is required.",
      };
    }
    const allowed: string[] = ["low", "medium", "high"];
    const prio: string = priority ?? "medium";
    if (!allowed.includes(prio)) {
      return {
        error: true,
        code: 400,
        message: `priority must be one of ${allowed.join(",")}`,
      };
    }

    const userObjectId =
      typeof user_id === "string" ? new Types.ObjectId(user_id) : user_id;

    const dueDateObj =
      typeof due_date === "string" ? new Date(due_date) : due_date;

    const newTask = await Task.create({
      user_id: userObjectId,
      title,
      description,
      due_date: dueDateObj,
      priority: prio,
    });

    return { data: newTask };
  } catch (error: any) {
    return { error: true, code: 500, message: "Internal server error" };
  }
};

export const updateTask = async (
  id: string,
  user_id: Types.ObjectId | string | undefined,
  title?: string,
  description?: string,
  due_date?: Date | string,
  priority?: string,
  is_completed?: boolean
): Promise<IServiceResult> => {
  try {
    if (!id || !mongoose.isValidObjectId(String(id))) {
      return { error: true, code: 400, message: "Invalid or missing id" };
    }

    const updates: any = {};

    if (title !== undefined) updates.title = title;
    if (description !== undefined) updates.description = description;
    if (due_date !== undefined) {
      const dueDateObj =
        typeof due_date === "string" ? new Date(due_date) : due_date;
      if (!dueDateObj || isNaN(dueDateObj.getTime())) {
        return { error: true, code: 400, message: "Invalid due date format" };
      }
      updates.due_date = dueDateObj;
    }
    if (priority !== undefined) {
      const allowed: string[] = ["low", "medium", "high"];
      if (!allowed.includes(priority)) {
        return {
          error: true,
          code: 400,
          message: `priority must be one of ${allowed.join(", ")}`,
        };
      }
      updates.priority = priority;
    }
    if (is_completed !== undefined)
      updates.is_completed = Boolean(is_completed);

    const query: any = { _id: id, deleted_at: null };

    if (user_id) {
      if (typeof user_id === "string" && mongoose.isValidObjectId(user_id)) {
        query.user_id = new Types.ObjectId(user_id);
      } else if (user_id instanceof Types.ObjectId) {
        query.user_id = user_id;
      }
    }

    const updatedTask = await Task.findOneAndUpdate(
      query,
      { $set: updates },
      { new: true }
    ).exec();

    if (!updatedTask) {
      return { error: true, code: 404, message: "Task not found" };
    }

    return { data: updatedTask };
  } catch (error) {
    return { error: true, code: 500, message: "Internal server error" };
  }
};

export const getTask = async ({
  user_id,
  page = 1,
  limit = 10,
  sort_by = "createdAt",
  order = "desc",
}: IGetTaskParams): Promise<IServiceResult> => {
  try {
    const skip: number = (page - 1) * limit;
    const sortOption: any = {};
    sortOption[sort_by] = order === "asc" ? 1 : -1;

    const [tasks, total] = await Promise.all([
      Task.find({ user_id, deleted_at: null })
        .sort(sortOption)
        .skip(skip)
        .limit(limit),
      Task.countDocuments({ user_id, deleted_at: null }),
    ]);
    return {
      data: tasks,
      pagination: {
        page,
        limit,
        total,
        total_pages: Math.ceil(total / limit),
      },
    } as unknown as IServiceResult;
  } catch (error) {
    return { error: true, code: 500, message: "Internal server error" };
  }
};

export const searchTask = async ({
  user_id,
  query,
  page = 1,
  limit = 10,
  sort_by = "createdAt",
  order = "desc",
}: ISearchTaskParams): Promise<IServiceResult> => {
  try {
    if (!user_id) {
      return { error: true, code: 404, message: "Unauthorized user." };
    }

    const skip: number = (page - 1) * limit;
    const sortOption: any = {};
    sortOption[sort_by] = order === "asc" ? 1 : -1;

    const searchFilter: Record<string, unknown> = {
      user_id,
      deleted_at: null,
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
      data: tasks,
      pagination: {
        page,
        limit,
        total,
        total_pages: Math.ceil(total / limit),
      },
    } as unknown as IServiceResult;
  } catch (error) {
    return { error: true, code: 500, message: "Internal server error" };
  }
};
