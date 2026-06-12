import nodemailer from "nodemailer";
import ejs from "ejs";
import path from "path";
import fs from "fs";
import {
  EMAIL_SMTP_HOST,
  EMAIL_SMTP_PORT,
  EMAIL_SMTP_USER,
  EMAIL_SMTP_PASS,
} from "../utils/env";
import { logger } from "../app/logging";
import { ISendMail } from "../interfaces/mail.interface";

const transporter = nodemailer.createTransport({
  host: EMAIL_SMTP_HOST,
  port: Number(EMAIL_SMTP_PORT),
  secure: Number(EMAIL_SMTP_PORT) === 465,
  auth: {
    user: EMAIL_SMTP_USER,
    pass: EMAIL_SMTP_PASS,
  },
});

export const verifySMTP = async (): Promise<void> => {
  try {
    await transporter.verify();
    logger.info("SMTP READY");
  } catch (error) {
    logger.error("SMTP ERROR", error);
  }
};

export const sendMail = async (mailParams: ISendMail): Promise<void> => {
  await transporter.sendMail(mailParams);
};

export const renderMailHtml = async (
  template: string,
  data: Record<string, any>,
): Promise<string> => {
  const basePath =
    process.env.NODE_ENV === "production"
      ? path.resolve(process.cwd(), "dist/src/mail/templates")
      : path.resolve(process.cwd(), "src/mail/templates");

  const templatePath = path.join(basePath, template);

  if (!fs.existsSync(templatePath)) {
    throw new Error(`EJS TEMPLATE NOT FOUND: ${templatePath}`);
  }

  return ejs.renderFile(templatePath, data);
};
