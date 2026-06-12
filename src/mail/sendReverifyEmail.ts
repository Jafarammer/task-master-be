import { sendMail, renderMailHtml } from "./mail";
import { EMAIL_SMTP_USER } from "../utils/env";

const sendReverifyEmail = async ({
  fullName,
  currentEmail,
  newEmail,
  verificationLink,
}: {
  fullName: string;
  currentEmail: string;
  newEmail: string;
  verificationLink: string;
}): Promise<void> => {
  const html = await renderMailHtml("reverify.ejs", {
    full_name: fullName,
    currentEmail,
    newEmail,
    verificationLink,
    createdAt: new Date(),
  });
  await sendMail({
    from: EMAIL_SMTP_USER,
    to: newEmail,
    subject: "Verify Your TASK MASTER Account",
    html,
  });
};
export default sendReverifyEmail;
