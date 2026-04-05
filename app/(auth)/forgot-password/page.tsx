"use client";

import { ApiResponse } from "@/app/types/ApiResponse";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import axios, { AxiosError } from "axios";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

type RecoveryStep = "request" | "verify" | "reset";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [step, setStep] = useState<RecoveryStep>("request");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleApiError = (error: unknown, fallback: string) => {
    const axiosError = error as AxiosError<ApiResponse>;
    const message = axiosError.response?.data.message || fallback;
    toast.error(message);
  };

  const requestCode = async () => {
    if (!email.trim()) {
      toast.error("Email is required");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await axios.post<ApiResponse>(
        "/api/password-recovery/request-code",
        { email: email.trim() },
      );

      toast.success(response.data.message || "Recovery code sent");
      setStep("verify");
    } catch (error) {
      handleApiError(error, "Failed to request recovery code");
    } finally {
      setIsSubmitting(false);
    }
  };

  const verifyCode = async () => {
    if (!otp.trim()) {
      toast.error("OTP is required");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await axios.post<ApiResponse>(
        "/api/password-recovery/verify-code",
        {
          email: email.trim(),
          otp: otp.trim(),
        },
      );

      toast.success(response.data.message || "OTP verified");
      setStep("reset");
    } catch (error) {
      handleApiError(error, "Failed to verify OTP");
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetPassword = async () => {
    if (newPassword.length < 8) {
      toast.error("Password must be at least 8 characters long");
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await axios.post<ApiResponse>(
        "/api/password-recovery/reset-password",
        {
          email: email.trim(),
          otp: otp.trim(),
          newPassword,
          confirmPassword,
        },
      );

      toast.success(response.data.message || "Password reset successful");
      setNewPassword("");
      setConfirmPassword("");
      setOtp("");
      setStep("request");
      router.push("/sign-in");
    } catch (error) {
      handleApiError(error, "Failed to reset password");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 px-4 py-10">
      <div className="w-full max-w-md space-y-6 rounded-lg bg-white p-8 shadow-md">
        <div className="text-center">
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">
            Recover Password
          </h1>
          <p className="mt-2 text-sm text-slate-600">
            Request a code, verify it, and set a new password.
          </p>
        </div>

        <div className="rounded-md border border-slate-200 bg-slate-50 p-3 text-xs text-slate-600">
          Step {step === "request" ? "1" : step === "verify" ? "2" : "3"} of 3
        </div>

        <div className="space-y-4">
          {step === "request" ? (
            <>
              <label className="block text-sm font-medium text-slate-700">
                Email
              </label>
              <Input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <Button
                className="w-full"
                onClick={requestCode}
                disabled={isSubmitting}
              >
                {isSubmitting ? "Sending..." : "Send OTP"}
              </Button>
            </>
          ) : null}

          {step === "verify" ? (
            <>
              <p className="text-sm text-slate-600">Code sent to {email}</p>
              <label className="block text-sm font-medium text-slate-700">
                6-digit OTP
              </label>
              <Input
                inputMode="numeric"
                maxLength={6}
                placeholder="123456"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
              />
              <div className="grid grid-cols-2 gap-3">
                <Button
                  variant="outline"
                  onClick={() => setStep("request")}
                  disabled={isSubmitting}
                >
                  Back
                </Button>
                <Button onClick={verifyCode} disabled={isSubmitting}>
                  {isSubmitting ? "Verifying..." : "Verify OTP"}
                </Button>
              </div>
            </>
          ) : null}

          {step === "reset" ? (
            <>
              <p className="text-sm text-slate-600">Verified for {email}</p>
              <label className="block text-sm font-medium text-slate-700">
                New Password
              </label>
              <Input
                type="password"
                placeholder="Enter new password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
              <label className="block text-sm font-medium text-slate-700">
                Confirm New Password
              </label>
              <Input
                type="password"
                placeholder="Confirm new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
              <Button
                className="w-full"
                onClick={resetPassword}
                disabled={isSubmitting}
              >
                {isSubmitting ? "Updating..." : "Update Password"}
              </Button>
            </>
          ) : null}
        </div>

        <div className="text-center text-sm text-slate-600">
          Remembered your password?{" "}
          <Link href="/sign-in" className="text-blue-600 hover:text-blue-800">
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
}
