import nodemailer from "nodemailer";

// Shared mail transport (Gmail SMTP via the SMTP_USER / SMTP_PASS app password).
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

// Reusable email sender used by the reminder jobs (and available to any module).
export const sendEmail = async ({
  to,
  subject,
  html,
  text,
}: {
  to: string;
  subject: string;
  html?: string;
  text?: string;
}) => {
  return transporter.sendMail({
    from: process.env.EMAIL_FROM || '"TutorSpace" <noreply@tutorspace.com>',
    to,
    subject,
    html,
    text,
  });
};
