import { RegisterField } from "../types/auth";

interface IValidation {
  valid: boolean;
  message?: string;
}

export const validateRegister = ({
  firstName,
  lastName,
  email,
  password,
}): IValidation => {
  const requiredFields: RegisterField[] = [
    { field: firstName, message: "First name is required!" },
    { field: lastName, message: "Last name is required!" },
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
