import { Request, Response } from "express";
import * as taskService from "../services/task.service";

export const handleCreateTask = async (req: Request, res: Response) => {
  try {
    const user_id = (req as any).user?.id;

    const { title, description, due_date, priority } = req.body;

    if (!user_id || !title || !description || !due_date) {
      return res.status(404).json({
        message: "user_id, title, description,dan due_date is required.",
      });
    }

    const allowed: string[] = ["low", "medium", "high"];
    const prio: string = priority ?? "medium";

    if (!allowed.includes(prio)) {
      return res
        .status(400)
        .json({ message: `priority must be one of ${allowed.join(",")}` });
    }

    const newTask = await taskService.createTask(
      user_id,
      title,
      description,
      due_date,
      prio
    );

    return res.status(201).json({
      data: newTask,
      message: "Create task success",
    });
  } catch (error) {
    res.status(500).json({
      message: error?.message ?? "Internal server error",
    });
  }
};
