import bcrypt from "bcrypt";

export const normalizeEmail = (email: string): string => {
  return email.trim().toLowerCase();
};

export const hashPassword = (password: string): Promise<string> => {
  return bcrypt.hash(password, 10);
};

export const comparePassword = (
  plainPassword: string,
  hashedPassword: string,
): Promise<boolean> => {
  return bcrypt.compare(plainPassword, hashedPassword);
};
