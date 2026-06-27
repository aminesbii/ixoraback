import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.gmail.com",
  port: parseInt(process.env.SMTP_PORT || "587"),
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export const sendEmail = async ({ to, subject, text, html }) => {
  try {
    await transporter.sendMail({
      from: `"IXORA" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      text,
      html,
    });
    return true;
  } catch (err) {
    console.error("[Email] Failed to send:", err.message);
    return false;
  }
};

export const sendPasswordResetEmail = async (email, resetLink) => {
  return sendEmail({
    to: email,
    subject: "IXORA — Password Reset Request",
    text: `We received a request to reset your password. Click the link to reset it: ${resetLink}\n\nThis link expires in 15 minutes.\n\nIf you didn't request this, please ignore this email.`,
    html: `<div style="max-width:480px;margin:0 auto;font-family:Arial,sans-serif;padding:24px">
      <div style="text-align:center;margin-bottom:24px">
        <h1 style="font-size:24px;color:#1a1a1a;margin:0">IXORA</h1>
        <p style="font-size:12px;color:#888;text-transform:uppercase;letter-spacing:2px">Premium Dermocosmetics</p>
      </div>
      <h2 style="font-size:18px;color:#1a1a1a">Password Reset Request</h2>
      <p style="color:#555;line-height:1.6">We received a request to reset your password. Click the button below to set a new password. This link expires in <strong>15 minutes</strong>.</p>
      <div style="text-align:center;margin:32px 0">
        <a href="${resetLink}" style="display:inline-block;padding:12px 32px;background-color:#1a1a1a;color:#fff;text-decoration:none;font-size:12px;text-transform:uppercase;letter-spacing:2px">Reset Password</a>
      </div>
      <p style="color:#888;font-size:12px">If you didn't request this, please ignore this email. Your password will remain unchanged.</p>
    </div>`,
  });
};
