import Task, { ITask } from "../models/task.model";
import { Types } from "mongoose";

interface IServiceResult {
  error?: boolean;
  code?: number;
  message?: string;
  data?: ITask | null;
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
