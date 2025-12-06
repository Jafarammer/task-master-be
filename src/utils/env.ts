import dotenv from "dotenv";

dotenv.config();

export const PORT = process.env.PORT;
export const MONGO_URI = process.env.MONGO_URI;
export const JWT_SECRET = process.env.JWT_SECRET;
export const EMAIL_SMTP_SECURE: boolean =
  Boolean(process.env.EMAIL_SMTP_SECURE) || false;
export const EMAIL_SMTP_PASS: string = process.env.EMAIL_SMTP_PASS || "";
export const EMAIL_SMTP_USER: string = process.env.EMAIL_SMTP_USER || "";
export const EMAIL_SMTP_PORT: number =
  Number(process.env.EMAIL_SMTP_PORT) || 465;
export const EMAIL_SMTP_HOST: string = process.env.EMAIL_SMTP_HOST || "";
export const EMAIL_SMTP_SERVICE_NAME: string =
  process.env.EMAIL_SMTP_SERVICE_NAME || "";
export const CLIENT_HOST: string =
  process.env.CLIENT_HOST || "http://localhost:5173";
export const VERIFICATION_HOST =
  process.env.VERIFICATION_HOST || "http://localhost:8000";
