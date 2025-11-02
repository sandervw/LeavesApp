import { afterAll, vi } from 'vitest';

// Mock environment variables BEFORE any imports in test files execute
// This must be at the top level, not in beforeAll, because imports execute first
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-jwt-secret';
process.env.JWT_REFRESH_SECRET = 'test-refresh-secret';
process.env.MONGO_URI = 'mongodb://localhost:27017/test-db';
process.env.APP_ORIGIN = 'http://localhost:5173';
process.env.EMAIL_SENDER = 'test@example.com';
process.env.RESEND_API_KEY = 'test-api-key';

// Cleanup after all tests
afterAll(() => {
  vi.clearAllMocks();
});
