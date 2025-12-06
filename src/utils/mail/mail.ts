import nodemailer from "nodemailer";
import ejs from "ejs";
import path from "path";
import fs from "fs";
import {
  EMAIL_SMTP_HOST,
  EMAIL_SMTP_PORT,
  EMAIL_SMTP_USER,
  EMAIL_SMTP_PASS,
} from "../env";

// =============================
// ✅ CREATE SMTP TRANSPORTER
// =============================
const transporter = nodemailer.createTransport({
  host: EMAIL_SMTP_HOST,
  port: Number(EMAIL_SMTP_PORT),
  secure: Number(EMAIL_SMTP_PORT) === 465,
  auth: {
    user: EMAIL_SMTP_USER,
    pass: EMAIL_SMTP_PASS,
  },
});

// =================================
// ✅ VERIFY SMTP (NO CRASH STARTUP)
// =================================
transporter
  .verify()
  .then(() => console.log("✅ SMTP READY"))
  .catch((err) => console.error("❌ SMTP FAIL:", err.message));

// =================
// ✅ SEND MAIL
// =================
export interface ISendMail {
  from: string;
  to: string;
  subject: string;
  html: string;
}

export const sendMail = async ({ ...mailParams }: ISendMail) => {
  return await transporter.sendMail(mailParams);
};

// ========================
// ✅ RENDER EJS TEMPLATE
// ========================
export const renderMailHtml = async (
  template: string,
  data: any
): Promise<string> => {
  // ✅ SESUAI STRUKTUR BUILD KAMU
  const basePath =
    process.env.NODE_ENV === "production"
      ? path.resolve(process.cwd(), "dist/src/utils/mail/templates")
      : path.resolve(process.cwd(), "src/utils/mail/templates");

  const templatePath = path.join(basePath, template);

  console.log("📨 EJS TEMPLATE PATH:", templatePath);

  if (!fs.existsSync(templatePath)) {
    throw new Error(`❌ EJS TEMPLATE NOT FOUND: ${templatePath}`);
  }

  return await ejs.renderFile(templatePath, data);
};
