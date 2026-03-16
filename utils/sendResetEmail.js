// utils/sendResetEmail.js
import { sendEmail } from "./sendEmail.js";

const sendResetEmail = async (to, token) => {
  const resetLink = `http://localhost:5173/reset-password/${token}`;

  await sendEmail({
    to,
    subject: "Password Reset Request",
    htmlContent: `
      <h2>Password Reset</h2>
      <p>You requested to reset your password.</p>
      <p>Click <a href="${resetLink}">here</a> to reset your password.</p>
      <p>This link will expire in 1 hour.</p>
    `,
  });
};

export default sendResetEmail;