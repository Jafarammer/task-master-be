import { formatDate } from "../utils/date";
import { toSentenceCase } from "../utils/string";

const configAdapter = (task: any) => {
  const plain = typeof task.toObject === "function" ? task.toObject() : task;

  return {
    ...plain,
    due_date: plain.due_date ? formatDate(plain.due_date) : null,
    title: plain.title ? toSentenceCase(plain.title) : "",
  };
};

export const taskAdapter = (task: any | any[]) => {
  if (Array.isArray(task)) {
    return task.map(configAdapter);
  }
  return configAdapter(task);
};
