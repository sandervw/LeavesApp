import { z } from 'zod';

/**
 * Schemas for validating basic data types in controllers.
 */
export const emailSchema = z.string().email().min(1).max(255);
export const mongoIdSchema = z.string().min(1).max(24);
export const optionalMongoIdSchema = z.string().min(1).max(24).nullish();
export const usernameSchema = z.string().min(1).max(255);
export const passwordSchema = z.string().min(6).max(255);
export const userAgentSchema = z.string().optional();

export const postSchema = z.object({
    _id: optionalMongoIdSchema,
    kind: z.enum(['storynode', 'template']).optional(),
    userId: optionalMongoIdSchema,
    name: z.string().min(1).max(255),
    type: z.enum(['root', 'branch', 'leaf']),
    text: z.string().max(100000),
    children: z.array(optionalMongoIdSchema).optional(),
    parent: optionalMongoIdSchema,
    wordWeight: z.number().nullish(),
    wordLimit: z.number().nullish(),
    wordCount: z.number().nullish(),
    isComplete: z.boolean().nullish(),
    archived: z.boolean().nullish(),
})