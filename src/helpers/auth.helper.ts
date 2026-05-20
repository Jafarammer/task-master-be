// import { RegisterField } from "../types/auth";
export type RegisterField = {
  field: string;
  message: string;
};

export type RegisterPayload = {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
};
interface IValidation {
  valid: boolean;
  message?: string;
}

export const validateRegister = ({
  fullName,
  email,
  password,
}): IValidation => {
  const requiredFields: RegisterField[] = [
    { field: fullName, message: "Full name is required!" },
    { field: email, message: "Email is required!" },
    { field: password, message: "Password is required!" },
  ];

  for (const item of requiredFields) {
    if (!item.field || item.field.trim() === "") {
      return { valid: false, message: item.message };
    }
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return { valid: false, message: "Invalid email format!" };
  }
  const strongPasswordRegex =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;

  if (!strongPasswordRegex.test(password)) {
    return {
      valid: false,
      message:
        "Password must be at least 8 characters long, contain uppercase, lowercase, number and symbol!",
    };
  }

  return { valid: true };
};
