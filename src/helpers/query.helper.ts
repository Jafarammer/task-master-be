import { IServiceParams } from "../interfaces/common.interface";

const parseQueryParams = (query: any): IServiceParams => {
  return {
    page: Number(query.page) || 1,
    limit: Number(query.limit) || 5,
    sortBy: (query.sortBy as string) || "createdAt",
    order: (query.order as "asc" | "desc") || "desc",
    query: (query.query as string) || "",
  };
};

export default parseQueryParams;
