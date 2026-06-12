import { sendMail, renderMailHtml } from "./mail";
import { EMAIL_SMTP_USER } from "../utils/env";

const sendForgotPasswordEmail = async ({
  email,
  fullName,
  resetLink,
}: {
  email: string;
  fullName: string;
  resetLink: string;
}): Promise<void> => {
  const html = await renderMailHtml("forgot-password.ejs", {
    full_name: fullName,
    email,
    resetLink,
  });
  await sendMail({
    from: EMAIL_SMTP_USER,
    to: email,
    subject: "Reset Your Password",
    html,
  });
};
export default sendForgotPasswordEmail;
