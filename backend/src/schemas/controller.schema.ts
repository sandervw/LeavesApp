import { z } from 'zod';

/**
 * Schemas for validating basic data types in controllers.
 */
export const emailSchema = z.string().email().min(1).max(255);
export const mongoIdSchema = z.string().min(1).max(24); // Based on mongodb ObjectId length
export const usernameSchema = z.string().min(1).max(255);
export const passwordSchema = z.string().min(6).max(255);
export const userAgentSchema = z.string().optional();

export const postSchema = z.object({
    _id: z.string().min(1).max(24).optional(),
    kind: z.enum(['storynode', 'template']),
    userId: z.string().min(1).max(24).optional(),
    name: z.string().min(1).max(255),
    type: z.enum(['root', 'branch', 'leaf']),
    text: z.string().min(1).max(100000),
    children: z.array(z.string()).optional(),
    parent: z.string().min(1).max(24).optional(),
    wordWeight: z.number().optional(),
    wordLimit: z.number().optional(),
    wordCount: z.number().optional(),
    isComplete: z.boolean().optional(),
    archived: z.boolean().optional(),
})