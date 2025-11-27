import { ITask } from "../models/task.model";
import { formatDate } from "../utils/date";
import { toSentenceCase } from "../utils/string";

const configAdapter = (task: ITask) => ({
  ...task.toObject(),
  due_date: formatDate(task.due_date),
  title: toSentenceCase(task.title),
});

export const taskAdapter = (task: ITask[]) => {
  return task.map(configAdapter);
};
