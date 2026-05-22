export interface ITaskPayload {
  title: string;
  description: string;
  dueDate: Date | string;
  priority: "low" | "medium" | "high";
}

export interface ISoftDeleteTask {
  userId: string;
  taskId: string;
}
