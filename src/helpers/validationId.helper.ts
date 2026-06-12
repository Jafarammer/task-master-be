import mongoose from "mongoose";

type ValidationIdResult =
  | {
      valid: true;
      value: string;
    }
  | {
      valid: false;
      message: string;
    };

const validationId = (id: string): ValidationIdResult => {
  const normalizedId = String(id ?? "").trim();

  if (!normalizedId) {
    return {
      valid: false,
      message: "Id not found",
    };
  }

  if (!mongoose.isValidObjectId(normalizedId)) {
    return {
      valid: false,
      message: "Invalid id format",
    };
  }

  return {
    valid: true,
    value: normalizedId,
  };
};

export default validationId;
