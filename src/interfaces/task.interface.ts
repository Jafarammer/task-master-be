export interface ITaskPayload {
  title: string;
  description: string;
  dueDate: Date | string;
  priority: "low" | "medium" | "high";
}
