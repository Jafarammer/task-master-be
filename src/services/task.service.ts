import Task, { ITask } from "../models/task.model";
import { Types } from "mongoose";

export const createTask = (
  user_id: Types.ObjectId | string,
  title: string,
  description: string,
  due_date: Date | string,
  priority: string
): Promise<ITask> => {
  const userObjectId =
    typeof user_id === "string" ? new Types.ObjectId(user_id) : user_id;

  const dueDateObj =
    typeof due_date === "string" ? new Date(due_date) : due_date;

  return Task.create({
    user_id: userObjectId,
    title,
    description,
    due_date: dueDateObj,
    priority,
  });
};
