import dbConnect from "@/app/lib/dbConnect";
import UserModel from "@/app/model/user";
import { sendPasswordRecoveryEmail } from "@/app/helpers/sendPasswordRecoveryEmail";
import { z } from "zod";

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

const requestCodeSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
});

export async function POST(request: Request) {
  await dbConnect();

  try {
    const body = await request.json();
    const parsed = requestCodeSchema.safeParse(body);

    if (!parsed.success) {
      return Response.json(
        {
          success: false,
          message: parsed.error.issues[0]?.message || "Invalid request data",
        },
        { status: 400 },
      );
    }

    const { email } = parsed.data;
    const normalizedEmail = email.trim();
    const emailRegex = new RegExp(`^${escapeRegExp(normalizedEmail)}$`, "i");

    const user = await UserModel.findOne({ email: emailRegex });

    if (!user) {
      return Response.json(
        {
          success: false,
          message: "No account found with this email address.",
        },
        { status: 404 },
      );
    }

    const hasActiveOtp =
      Boolean(user.passwordResetOtp) &&
      Boolean(user.passwordResetOtpExpiry) &&
      /^\d{6}$/.test(String(user.passwordResetOtp).trim()) &&
      new Date(user.passwordResetOtpExpiry as Date) > new Date();

    const otp = hasActiveOtp
      ? String(user.passwordResetOtp)
      : Math.floor(100000 + Math.random() * 900000).toString();

    if (!hasActiveOtp) {
      const otpExpiry = new Date(Date.now() + 10 * 60 * 1000);
      user.passwordResetOtp = otp;
      user.passwordResetOtpExpiry = otpExpiry;
      user.passwordResetOtpVerified = false;
    } else {
      // Normalize legacy OTP values to string format for consistent comparisons.
      user.passwordResetOtp = otp;
    }

    await user.save();

    const emailResponse = await sendPasswordRecoveryEmail(
      String(user.email),
      String(user.username),
      otp,
    );

    if (!emailResponse.success) {
      return Response.json(
        {
          success: false,
          message: "Failed to send recovery code. Please try again.",
        },
        { status: 500 },
      );
    }

    return Response.json(
      {
        success: true,
        message: "Recovery code sent. Please check your email.",
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Error requesting password recovery code:", error);
    return Response.json(
      {
        success: false,
        message: "Error requesting password recovery code",
      },
      { status: 500 },
    );
  }
}
