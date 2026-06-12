export const getEnvString = (key: string): string => {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Missing environment variable: ${key}`);
  }

  return value;
};

export const getEnvNumber = (key: string): number => {
  const value = process.env[key];

  if (!value) {
    throw new Error(`Missing environment variable: ${key}`);
  }

  const parsed = Number(value);
  if (Number.isNaN(parsed)) {
    throw new Error(`Environment variable ${key} must be a number`);
  }

  return parsed;
};

export const getEnvBoolean = (key: string): boolean => {
  const value = process.env[key];

  if (!value) {
    throw new Error(`Missing environment variable: ${key}`);
  }

  const normalized = value.toLowerCase();

  if (normalized !== "true" && normalized !== "false") {
    throw new Error(`Environment variable ${key} must be true or false`);
  }

  return value === "true";
};
