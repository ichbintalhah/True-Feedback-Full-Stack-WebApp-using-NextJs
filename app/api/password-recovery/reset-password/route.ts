import dbConnect from "@/app/lib/dbConnect";
import UserModel from "@/app/model/user";
import bcrypt from "bcryptjs";
import { z } from "zod";

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

const resetPasswordSchema = z
  .object({
    email: z.string().email("Please enter a valid email address"),
    otp: z.string().regex(/^\d{6}$/, "OTP must be a 6-digit code"),
    newPassword: z
      .string()
      .min(8, "Password must be at least 8 characters long"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export async function POST(request: Request) {
  await dbConnect();

  try {
    const body = await request.json();
    const parsed = resetPasswordSchema.safeParse(body);

    if (!parsed.success) {
      return Response.json(
        {
          success: false,
          message: parsed.error.issues[0]?.message || "Invalid request data",
        },
        { status: 400 },
      );
    }

    const { email, otp, newPassword } = parsed.data;
    const normalizedEmail = email.trim();
    const emailRegex = new RegExp(`^${escapeRegExp(normalizedEmail)}$`, "i");

    const user = await UserModel.findOne({ email: emailRegex });

    if (
      !user ||
      !user.passwordResetOtp ||
      !user.passwordResetOtpExpiry ||
      !user.passwordResetOtpVerified
    ) {
      return Response.json(
        {
          success: false,
          message: "Please verify your OTP before resetting password",
        },
        { status: 400 },
      );
    }

    const normalizedEnteredOtp = otp.trim();
    const normalizedStoredOtp = String(user.passwordResetOtp).trim();

    if (normalizedEnteredOtp !== normalizedStoredOtp) {
      return Response.json(
        {
          success: false,
          message: "Invalid or expired OTP",
        },
        { status: 400 },
      );
    }

    const isExpired = new Date(user.passwordResetOtpExpiry) <= new Date();
    if (isExpired) {
      return Response.json(
        {
          success: false,
          message: "Invalid or expired OTP",
        },
        { status: 400 },
      );
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    user.password = hashedPassword;
    user.passwordResetOtp = null;
    user.passwordResetOtpExpiry = null;
    user.passwordResetOtpVerified = false;

    await user.save();

    return Response.json(
      {
        success: true,
        message: "Password updated successfully",
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Error resetting password:", error);
    return Response.json(
      {
        success: false,
        message: "Error resetting password",
      },
      { status: 500 },
    );
  }
}
