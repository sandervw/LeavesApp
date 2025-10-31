import { beforeAll, afterAll, vi } from 'vitest';

// Setup that runs once before all tests
beforeAll(() => {
  // Mock environment variables for testing
  process.env.NODE_ENV = 'test';
  process.env.JWT_SECRET = 'test-jwt-secret';
  process.env.JWT_REFRESH_SECRET = 'test-refresh-secret';
});

// Cleanup after all tests
afterAll(() => {
  vi.clearAllMocks();
});
