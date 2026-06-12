export interface ITaskPayload {
  title: string;
  description: string;
  startDate: Date | string;
  endDate: Date | string;
  priority: "low" | "medium" | "high";
}

export interface IUpdateStatusTaskPayload {
  isCompleted: boolean;
}

export interface IResultDataTask {
  id: string;
  title: string;
  description: string;
  startDate: string | null;
  endDate: string | null;
  priority: "low" | "medium" | "high";
  isCompleted: boolean;
  isExpired?: boolean | null;
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
