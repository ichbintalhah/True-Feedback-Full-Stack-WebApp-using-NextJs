import { Resend } from "resend";
import VerificationEmail from "@/emails/VerificationEmail";
export const resend = new Resend(process.env.RESEND_API_KEY);
