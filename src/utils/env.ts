import dotenv from "dotenv";
import {
  getEnvString,
  getEnvNumber,
  getEnvBoolean,
} from "../helpers/getEnv.helper";

dotenv.config();

export const PORT = getEnvNumber("PORT");
export const MONGO_URI = getEnvString("MONGO_URI");
export const JWT_SECRET = getEnvString("JWT_SECRET");
export const JWT_REFRESH_SECRET = getEnvString("JWT_REFRESH_SECRET");
export const JWT_ACCESS_EXPIRES_IN = getEnvString("JWT_ACCESS_EXPIRES_IN");
export const JWT_REFRESH_EXPIRES_IN = getEnvString("JWT_REFRESH_EXPIRES_IN");
export const EMAIL_SMTP_SECURE = getEnvBoolean("EMAIL_SMTP_SECURE");
export const EMAIL_SMTP_PASS = getEnvString("EMAIL_SMTP_PASS");
export const EMAIL_SMTP_USER = getEnvString("EMAIL_SMTP_USER");
export const EMAIL_SMTP_PORT = getEnvNumber("EMAIL_SMTP_PORT");
export const EMAIL_SMTP_HOST = getEnvString("EMAIL_SMTP_HOST");
export const EMAIL_SMTP_SERVICE_NAME = getEnvString("EMAIL_SMTP_SERVICE_NAME");
export const CLIENT_HOST = getEnvString("CLIENT_HOST");
export const VERIFICATION_HOST = getEnvString("VERIFICATION_HOST");
export const CLOUDINARY_CLOUD_NAME = getEnvString("CLOUDINARY_CLOUD_NAME");
export const CLOUDINARY_API_KEY = getEnvString("CLOUDINARY_API_KEY");
export const CLOUDINARY_API_SECRET = getEnvString("CLOUDINARY_API_SECRET");
export const NODE_ENV = getEnvString("NODE_ENV");
