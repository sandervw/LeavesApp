import { z } from 'zod';

export const emailSchema = z.string().email().min(1).max(255);
export const verificationCodeSchema = z.string().min(1).max(24); // Based on mongodb ObjectId length
const usernameSchema = z.string().min(1).max(255);
const passwordSchema = z.string().min(6).max(255);

export const loginSchema = z.object({
    email: emailSchema,
    password: passwordSchema,
    userAgent: z.string().optional(),
});

export const signupSchema = loginSchema.extend({
    username: usernameSchema,
});

export const resetPasswordSchema = z.object({
    verificationCode: verificationCodeSchema,
    password: passwordSchema,
});
