export interface ITaskPayload {
  title: string;
  description: string;
  dueDate: Date | string;
  priority: "low" | "medium" | "high";
}

export interface IUpdateStatusTaskPayload {
  isCompleted: boolean;
}

export interface IResultDataTask {
  id: string;
  title: string;
  description: string;
  dueDate: string;
  priority: "low" | "medium" | "high";
  isCompleted: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IResultMetaDataTask {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface IResultDataTrashStatistics {
  totalItems: number;
  trashItems: number;
  activeItems: number;
  usedStorage: string;
  maxStorage: string;
  percentage: number;
}
