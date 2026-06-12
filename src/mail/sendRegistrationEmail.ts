import { sendMail, renderMailHtml } from "./mail";
import { EMAIL_SMTP_USER } from "../utils/env";

const sendRegistrationEmail = async ({
  email,
  fullName,
  activationLink,
}: {
  email: string;
  fullName: string;
  activationLink: string;
}): Promise<void> => {
  const html = await renderMailHtml("registration.ejs", {
    full_name: fullName,
    email,
    activationLink,
    createdAt: new Date(),
  });
  await sendMail({
    from: EMAIL_SMTP_USER,
    to: email,
    subject: "Activate Your Account",
    html,
  });
};
export default sendRegistrationEmail;
