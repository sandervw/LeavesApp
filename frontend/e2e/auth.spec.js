import { test, expect } from '@playwright/test';
import { setupAuthenticatedUser, login, logout, isAuthenticated } from './helpers.js';

/**
 * Authentication E2E Tests
 *
 * Tests cover the complete authentication flow including:
 * - User signup
 * - User login
 * - User logout
 * - Token refresh handling
 * - Protected route access
 */

test.describe('Authentication Flow', () => {
  test.beforeEach(async ({ page }) => {
    // TODO: Clear database or ensure clean state for each test
    // await clearDatabase(page);
  });

  test('should successfully sign up a new user', async ({ page }) => {
    // TODO: Navigate to signup page
    // await page.goto('/signup');

    // TODO: Verify signup form is visible
    // await expect(page.locator('form[data-testid="signup-form"]')).toBeVisible();

    // TODO: Fill signup form with valid data
    const timestamp = Date.now();
    const email = `test-signup-${timestamp}@example.com`;
    const password = 'TestPassword123!';

    // await page.fill('[name="email"]', email);
    // await page.fill('[name="password"]', password);
    // await page.fill('[name="confirmPassword"]', password);

    // TODO: Submit signup form
    // await page.click('button[type="submit"]');

    // TODO: Wait for successful signup and redirect to stories page
    // await page.waitForURL('/stories');

    // TODO: Verify user is authenticated (check for refresh token cookie)
    // const cookies = await page.context().cookies();
    // const refreshToken = cookies.find(c => c.name === 'refreshToken');
    // expect(refreshToken).toBeTruthy();
    // expect(refreshToken.httpOnly).toBe(true);
    // expect(refreshToken.secure).toBe(true); // In production

    // TODO: Verify user is redirected to stories page
    // expect(page.url()).toContain('/stories');

    // TODO: Verify navbar shows user email or logout button
    // await expect(page.locator('[data-testid="logout-button"]')).toBeVisible();
  });

  test('should show validation errors for invalid signup data', async ({ page }) => {
    // TODO: Navigate to signup page
    // await page.goto('/signup');

    // Test Case 1: Email already exists
    // TODO: Submit form with existing email
    // TODO: Verify error message appears

    // Test Case 2: Password too short
    // TODO: Fill form with short password
    // TODO: Submit and verify error message

    // Test Case 3: Passwords don't match
    // TODO: Fill password and confirmPassword with different values
    // TODO: Submit and verify error message

    // Test Case 4: Invalid email format
    // TODO: Fill form with invalid email (e.g., 'notanemail')
    // TODO: Submit and verify error message
  });

  test('should successfully login with valid credentials', async ({ page }) => {
    // TODO: First create a user account
    const user = await setupAuthenticatedUser(page);

    // TODO: Logout to test login flow
    // await logout(page);

    // TODO: Navigate to login page
    // await page.goto('/login');

    // TODO: Verify login form is visible
    // await expect(page.locator('form[data-testid="login-form"]')).toBeVisible();

    // TODO: Fill login form with created user credentials
    // await page.fill('[name="email"]', user.email);
    // await page.fill('[name="password"]', user.password);

    // TODO: Submit login form
    // await page.click('button[type="submit"]');

    // TODO: Wait for successful login and redirect
    // await page.waitForURL('/stories');

    // TODO: Verify authentication cookies are set
    // const cookies = await page.context().cookies();
    // const refreshToken = cookies.find(c => c.name === 'refreshToken');
    // expect(refreshToken).toBeTruthy();

    // TODO: Verify user is on stories page
    // expect(page.url()).toContain('/stories');
  });

  test('should show error for invalid login credentials', async ({ page }) => {
    // TODO: Navigate to login page
    // await page.goto('/login');

    // Test Case 1: Wrong password
    // TODO: Fill form with valid email but wrong password
    // await page.fill('[name="email"]', 'test@example.com');
    // await page.fill('[name="password"]', 'WrongPassword123!');
    // await page.click('button[type="submit"]');

    // TODO: Verify error message appears
    // await expect(page.locator('[data-testid="error-message"]')).toContainText('Invalid credentials');

    // Test Case 2: Non-existent user
    // TODO: Fill form with non-existent email
    // await page.fill('[name="email"]', 'nonexistent@example.com');
    // await page.fill('[name="password"]', 'SomePassword123!');
    // await page.click('button[type="submit"]');

    // TODO: Verify error message appears
    // await expect(page.locator('[data-testid="error-message"]')).toContainText('Invalid credentials');

    // TODO: Verify user remains on login page
    // expect(page.url()).toContain('/login');
  });

  test('should successfully logout user', async ({ page }) => {
    // TODO: Setup authenticated user
    const user = await setupAuthenticatedUser(page);

    // TODO: Verify user is authenticated and on stories page
    // expect(page.url()).toContain('/stories');
    // const isAuth = await isAuthenticated(page);
    // expect(isAuth).toBe(true);

    // TODO: Click logout button
    // await page.click('[data-testid="logout-button"]');

    // TODO: Wait for redirect to landing page
    // await page.waitForURL('/');

    // TODO: Verify authentication cookies are cleared
    // const cookies = await page.context().cookies();
    // const refreshToken = cookies.find(c => c.name === 'refreshToken');
    // expect(refreshToken).toBeFalsy();

    // TODO: Verify user is on landing page
    // expect(page.url()).toBe('http://localhost:5173/');

    // TODO: Verify navbar shows login/signup buttons instead of logout
    // await expect(page.locator('[data-testid="login-button"]')).toBeVisible();
    // await expect(page.locator('[data-testid="signup-button"]')).toBeVisible();
  });

  test('should redirect unauthenticated users from protected routes', async ({ page }) => {
    // TODO: Ensure user is not authenticated
    // await logout(page);

    // Test Case 1: Stories page
    // TODO: Navigate to /stories
    // await page.goto('/stories');
    // TODO: Verify redirect to login or landing page
    // await page.waitForURL('/login');

    // Test Case 2: Templates page
    // TODO: Navigate to /templates
    // await page.goto('/templates');
    // TODO: Verify redirect to login or landing page
    // await page.waitForURL('/login');

    // Test Case 3: Archive page
    // TODO: Navigate to /archive
    // await page.goto('/archive');
    // TODO: Verify redirect to login or landing page
    // await page.waitForURL('/login');
  });

  test('should handle token refresh on API request', async ({ page }) => {
    // TODO: Setup authenticated user
    const user = await setupAuthenticatedUser(page);

    // TODO: Wait for access token to expire (or manually expire it)
    // NOTE: This test may require backend support to artificially expire tokens
    // or setting a very short access token expiry time in test environment

    // TODO: Make an API request that requires authentication
    // This should trigger automatic token refresh via the refresh endpoint
    // await page.goto('/templates');

    // TODO: Monitor network for refresh token call
    // const refreshRequest = page.waitForRequest(req =>
    //   req.url().includes('/auth/refresh')
    // );

    // TODO: Trigger an action that requires authentication
    // await page.click('[data-testid="add-template-button"]');

    // TODO: Verify refresh endpoint was called
    // const request = await refreshRequest;
    // expect(request.method()).toBe('GET');

    // TODO: Verify request succeeded and user remains authenticated
    // const isAuth = await isAuthenticated(page);
    // expect(isAuth).toBe(true);
  });

  test('should handle expired refresh token by redirecting to login', async ({ page }) => {
    // TODO: Setup authenticated user
    const user = await setupAuthenticatedUser(page);

    // TODO: Manually expire or remove refresh token
    // await page.context().clearCookies();

    // TODO: Make an API request that requires authentication
    // await page.goto('/templates');

    // TODO: Verify redirect to login page
    // await page.waitForURL('/login');

    // TODO: Verify error message about session expiration
    // await expect(page.locator('[data-testid="session-expired-message"]'))
    //   .toContainText('Session expired');
  });

  test('should persist authentication across page refreshes', async ({ page }) => {
    // TODO: Setup authenticated user
    const user = await setupAuthenticatedUser(page);

    // TODO: Verify user is on stories page
    // expect(page.url()).toContain('/stories');

    // TODO: Reload the page
    // await page.reload();

    // TODO: Verify user remains authenticated and on stories page
    // await page.waitForURL('/stories');
    // const isAuth = await isAuthenticated(page);
    // expect(isAuth).toBe(true);

    // TODO: Verify user data is still available
    // await expect(page.locator('[data-testid="logout-button"]')).toBeVisible();
  });

  test('should allow switching between login and signup pages', async ({ page }) => {
    // TODO: Navigate to login page
    // await page.goto('/login');

    // TODO: Click link to signup page
    // await page.click('[data-testid="signup-link"]');

    // TODO: Verify redirect to signup page
    // await page.waitForURL('/signup');
    // await expect(page.locator('form[data-testid="signup-form"]')).toBeVisible();

    // TODO: Click link back to login page
    // await page.click('[data-testid="login-link"]');

    // TODO: Verify redirect to login page
    // await page.waitForURL('/login');
    // await expect(page.locator('form[data-testid="login-form"]')).toBeVisible();
  });

  test('should show loading state during authentication', async ({ page }) => {
    // TODO: Navigate to login page
    // await page.goto('/login');

    // TODO: Fill login form
    // await page.fill('[name="email"]', 'test@example.com');
    // await page.fill('[name="password"]', 'TestPassword123!');

    // TODO: Click submit and immediately check for loading state
    // await page.click('button[type="submit"]');
    // await expect(page.locator('[data-testid="loading-spinner"]')).toBeVisible();

    // TODO: Wait for authentication to complete
    // await page.waitForURL('/stories', { timeout: 5000 }).catch(() => {});

    // TODO: Verify loading state is removed
    // await expect(page.locator('[data-testid="loading-spinner"]')).not.toBeVisible();
  });
});

test.describe('Password Reset Flow', () => {
  test('should send password reset email', async ({ page }) => {
    // TODO: Navigate to password reset page
    // await page.goto('/forgot-password');

    // TODO: Fill email field
    // await page.fill('[name="email"]', 'test@example.com');

    // TODO: Submit form
    // await page.click('button[type="submit"]');

    // TODO: Verify success message
    // await expect(page.locator('[data-testid="success-message"]'))
    //   .toContainText('Reset link sent');

    // NOTE: Actually testing email delivery requires email service mocking
    // or integration with email testing tools like Mailtrap
  });

  test('should reset password with valid token', async ({ page }) => {
    // TODO: Navigate to password reset page with token
    // const token = 'valid-reset-token'; // This would come from email link
    // await page.goto(`/reset-password?token=${token}`);

    // TODO: Fill new password fields
    // await page.fill('[name="password"]', 'NewPassword123!');
    // await page.fill('[name="confirmPassword"]', 'NewPassword123!');

    // TODO: Submit form
    // await page.click('button[type="submit"]');

    // TODO: Verify success message
    // await expect(page.locator('[data-testid="success-message"]'))
    //   .toContainText('Password reset successful');

    // TODO: Verify redirect to login page
    // await page.waitForURL('/login');

    // TODO: Test login with new password
    // await page.fill('[name="email"]', 'test@example.com');
    // await page.fill('[name="password"]', 'NewPassword123!');
    // await page.click('button[type="submit"]');
    // await page.waitForURL('/stories');
  });

  test('should reject invalid or expired reset token', async ({ page }) => {
    // TODO: Navigate to password reset page with invalid token
    // await page.goto('/reset-password?token=invalid-token');

    // TODO: Fill password fields
    // await page.fill('[name="password"]', 'NewPassword123!');
    // await page.fill('[name="confirmPassword"]', 'NewPassword123!');

    // TODO: Submit form
    // await page.click('button[type="submit"]');

    // TODO: Verify error message
    // await expect(page.locator('[data-testid="error-message"]'))
    //   .toContainText('Invalid or expired token');
  });
});
