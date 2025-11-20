import { Resend } from "resend";

export async function sendVerificationEmail(opts: {
  to: string;
  name?: string | null;
  token: string;
}) {
  const { to, name, token } = opts;

  const verifyUrl = `${process.env.FRONTEND_URL}/verify-email?token=${encodeURIComponent(
    token,
  )}`;

  const msg = {
    to,
    from: process.env.RESEND_FROM_EMAIL || "no-reply@interviewmint.com",
    subject: "Verify your email",
    html: verifyEmailTemplate(name, verifyUrl),
  };

  const resend = new Resend(process.env.RESEND_API_KEY!);

  await resend.emails.send(msg);
  // console.log("Send verify email to", to, "link:", verifyUrl);
}

const verifyEmailTemplate = (
  name: string | null | undefined,
  verifyUrl: string,
) => `
  <p>Hi ${name || "there"},</p>
  <p>Please verify your email by clicking the link below:</p>
  <a href="${verifyUrl}">Verify Email</a>
`;
