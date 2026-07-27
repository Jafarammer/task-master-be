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

export interface ITaskRepositoryResult {
  _id: string;
  title: string;
  description: string;
  start_date: Date | null;
  end_date: Date | null;
  priority: "low" | "medium" | "high";
  is_completed: boolean;
}

export interface IGetTaskRepositoryResult {
  tasks: ITaskRepositoryResult[];
  total: number;
}

export interface IGetTaskRepositoryParams {
  userId: string;
  query?: string;
  skip: number;
  limit: number;
  sort: Record<string, 1 | -1>;
}
