import nodemailer from "nodemailer";
import ejs from "ejs";
import path from "path";
import fs from "fs";
import {
  EMAIL_SMTP_SERVICE_NAME,
  EMAIL_SMTP_HOST,
  EMAIL_SMTP_PORT,
  EMAIL_SMTP_SECURE,
  EMAIL_SMTP_USER,
  EMAIL_SMTP_PASS,
} from "../env";

const transporter = nodemailer.createTransport({
  service: EMAIL_SMTP_SERVICE_NAME,
  host: EMAIL_SMTP_HOST,
  port: Number(EMAIL_SMTP_PORT),
  secure: EMAIL_SMTP_SECURE,
  auth: {
    user: EMAIL_SMTP_USER,
    pass: EMAIL_SMTP_PASS,
  },
  requireTLS: true,
});

transporter.verify((error) => {
  if (error) {
    console.error("❌ SMTP ERROR:", error);
  } else {
    console.log("✅ SMTP READY (Zoho connected)");
  }
});

export interface ISendMail {
  from: string;
  to: string;
  subject: string;
  html: string;
}

export const sendMail = async ({ ...mailParams }: ISendMail) => {
  const result = await transporter.sendMail({
    ...mailParams,
  });
  return result;
};

export const renderMailHtml = async (
  template: string,
  data: any
): Promise<string> => {
  const templatePath = path.join(__dirname, "templates", template);

  console.log("📨 EJS TEMPLATE PATH:", templatePath);

  if (!fs.existsSync(templatePath)) {
    throw new Error(`EJS template not found at: ${templatePath}`);
  }

  return await ejs.renderFile(templatePath, data);
};
