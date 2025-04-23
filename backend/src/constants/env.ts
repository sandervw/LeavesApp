import {config} from 'dotenv';
config();

// Validates that the env is actually a string
const getEnv = (key: string, defaultValue?: string): string => {
    const value = process.env[key] || defaultValue;
    if (value === undefined) {
        throw new Error(`Missing environment variable ${key}`);
    }
    return value;
}

export const PORT = getEnv('PORT', '3000');
export const MONGO_URI = getEnv('MONGO_URI');
export const JWT_SECRET = getEnv('JWT_SECRET');