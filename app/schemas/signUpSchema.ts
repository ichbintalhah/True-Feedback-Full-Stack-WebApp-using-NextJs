import { z } from "zod";

export const usernameValidation = z
    .string()
    .min(2, "Username must be at least 2 characters long")
    .max(20, "Username must be at most 20 characters long")
    .regex(/^[^\s@]+@[^\s@]+\.[^\s@]+$/, "Username must be a valid email address");

export const signUpSchema = z.object({
    username: usernameValidation,
    email: z.string().email({message: "Invalid Email Address"}),
    password: z.string().min(8, {message: "Password must be atleast 8 characters"})
})