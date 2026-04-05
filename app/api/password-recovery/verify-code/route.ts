import dbConnect from "@/app/lib/dbConnect";
import UserModel from "@/app/model/user";
import { z } from "zod";

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

const verifyCodeSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  otp: z.string().regex(/^\d{6}$/, "OTP must be a 6-digit code"),
});

export async function POST(request: Request) {
  await dbConnect();

  try {
    const body = await request.json();
    const parsed = verifyCodeSchema.safeParse(body);

    if (!parsed.success) {
      return Response.json(
        {
          success: false,
          message: parsed.error.issues[0]?.message || "Invalid request data",
        },
        { status: 400 },
      );
    }

    const { email, otp } = parsed.data;
    const normalizedEmail = email.trim();
    const emailRegex = new RegExp(`^${escapeRegExp(normalizedEmail)}$`, "i");

    const userWithCode = await UserModel.findOne({ email: emailRegex });

    if (!userWithCode) {
      return Response.json(
        {
          success: false,
          message: "Invalid or expired OTP",
        },
        { status: 400 },
      );
    }

    if (
      !userWithCode.passwordResetOtp ||
      !userWithCode.passwordResetOtpExpiry
    ) {
      return Response.json(
        {
          success: false,
          message: "Invalid or expired OTP",
        },
        { status: 400 },
      );
    }

    const normalizedEnteredOtp = otp.trim();
    const normalizedStoredOtp = String(userWithCode.passwordResetOtp).trim();

    if (normalizedEnteredOtp !== normalizedStoredOtp) {
      return Response.json(
        {
          success: false,
          message: "Invalid or expired OTP",
        },
        { status: 400 },
      );
    }

    const isExpired =
      new Date(userWithCode.passwordResetOtpExpiry) <= new Date();

    if (isExpired) {
      userWithCode.passwordResetOtp = null;
      userWithCode.passwordResetOtpExpiry = null;
      userWithCode.passwordResetOtpVerified = false;
      await userWithCode.save();

      return Response.json(
        {
          success: false,
          message: "OTP has expired. Please request a new code.",
        },
        { status: 400 },
      );
    }

    userWithCode.passwordResetOtpVerified = true;
    await userWithCode.save();

    return Response.json(
      {
        success: true,
        message: "OTP verified successfully",
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Error verifying password recovery code:", error);
    return Response.json(
      {
        success: false,
        message: "Error verifying recovery code",
      },
      { status: 500 },
    );
  }
}
