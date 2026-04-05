import nodemailer from "nodemailer";
import { ApiResponse } from "../types/ApiResponse";

export async function sendPasswordRecoveryEmail(
  email: string,
  username: string,
  otp: string,
): Promise<ApiResponse> {
  try {
    const gmailUser = process.env.GMAIL_USER;
    const gmailAppPassword = process.env.GMAIL_APP_PASSWORD;

    if (!gmailUser || !gmailAppPassword) {
      throw new Error(
        "Missing GMAIL_USER or GMAIL_APP_PASSWORD in environment",
      );
    }

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: gmailUser,
        pass: gmailAppPassword,
      },
    });

    await transporter.sendMail({
      from: `TrueFeedback <${gmailUser}>`,
      to: email,
      subject: "Your TrueFeedback password reset code",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 560px; margin: 0 auto; padding: 16px; color: #0f172a;">
          <h2 style="margin-bottom: 8px;">Password reset request</h2>
          <p style="margin: 0 0 12px;">Hi ${username},</p>
          <p style="margin: 0 0 16px;">Use the 6-digit code below to reset your password:</p>
          <div style="font-size: 28px; letter-spacing: 6px; font-weight: 700; margin: 0 0 16px; color: #1d4ed8;">
            ${otp}
          </div>
          <p style="margin: 0 0 8px;">This code expires in 10 minutes.</p>
          <p style="margin: 0; color: #475569; font-size: 14px;">
            If you did not request this, you can safely ignore this email.
          </p>
        </div>
      `,
    });

    return {
      success: true,
      message: "Password recovery email sent successfully",
    };
  } catch (error) {
    console.error("Error sending password recovery email:", error);
    return {
      success: false,
      message: "Failed to send password recovery email",
    };
  }
}
