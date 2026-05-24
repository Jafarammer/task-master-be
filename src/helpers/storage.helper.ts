import Task from "../models/task.model";

export const MAX_USER_STORAGE = 5 * 1024 * 1024;

export const calculateTaskSize = (data: {
  title: string;
  description: string;
}): number => {
  const json = JSON.stringify(data);

  return Buffer.byteLength(json, "utf8");
};

export const validateUserStorage = async (
  userId: string,
  incomingSize: number,
  oldSize = 0,
) => {
  const result = await Task.aggregate([
    {
      $match: {
        user_id: userId,
      },
    },
    {
      $group: {
        _id: null,

        totalSize: {
          $sum: "$size",
        },
      },
    },
  ]);

  const currentSize = result[0]?.totalSize || 0;
  const finalSize = currentSize - oldSize + incomingSize;

  return {
    valid: finalSize <= MAX_USER_STORAGE,
    currentSize,
    finalSize,
  };
};

export const formatBytes = (bytes: number): string => {
  if (bytes < 1024) {
    return `${bytes} B`;
  }

  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(2)} KB`;
  }

  return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
};
