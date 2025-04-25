import { z } from 'zod';

const emailSchema = z.string().email().min(1).max(255);
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