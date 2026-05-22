import { IServiceParams } from "../interfaces/common.interface";

const getPagination = ({
  page = 1,
  limit = 5,
  sortBy = "createdAt",
  order = "desc",
}: IServiceParams) => {
  const currentPage = Number(page);

  const currentLimit = Number(limit);

  const skip = (currentPage - 1) * currentLimit;

  const sort: Record<string, 1 | -1> = {
    [sortBy]: order === "asc" ? 1 : -1,
  };

  return {
    page: currentPage,
    limit: currentLimit,
    skip,
    sort,
  };
};

export default getPagination;
