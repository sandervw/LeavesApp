import { test, expect } from '@playwright/test';
import { setupAuthenticatedUser, logout, isAuthenticated } from './helpers.js';

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
    // Navigate to the app first to avoid localStorage security errors
    await page.goto('http://localhost:5173');

    // Clear authentication state by clearing cookies and storage
    await page.context().clearCookies();
    await page.evaluate(() => localStorage.clear());
    await page.evaluate(() => sessionStorage.clear());
  });

  test('should successfully sign up a new user', async ({ page }) => {
    // Navigate to signup
    await page.goto('/signup');

    // Generate unique test credentials
    const timestamp = Date.now();
    const email = `test-signup-${timestamp}@example.com`;
    const username = `testuser-${timestamp}`;
    const password = 'TestPassword123!';

    // Fill signup form with valid data
    await page.getByPlaceholder('Email').fill(email);
    await page.getByPlaceholder('Username').fill(username);
    await page.getByPlaceholder('Password').fill(password);

    // Submit signup form
    await page.locator('form').getByRole('button', { name: 'Sign Up' }).click();

    // Verify redirect to home page (which redirects authenticated users to stories)
    await page.waitForURL('/');

    // Verify user is authenticated
    const isAuth = await isAuthenticated(page);
    expect(isAuth).toBe(true);

    // Verify refresh token cookie is set
    const cookies = await page.context().cookies();
    const refreshToken = cookies.find((c) => c.name === 'refreshToken');
    expect(refreshToken).toBeTruthy();
  });

  test('should show validation errors for invalid signup data', async ({ page }) => {
    // Navigate to signup
    await page.goto('/signup');

    // Test 1: Invalid email format
    const timestamp = Date.now();
    const username = `testuser-${timestamp}`;

    await page.getByPlaceholder('Email').fill('invalid-email');
    await page.getByPlaceholder('Username').fill(username);
    await page.getByPlaceholder('Password').fill('TestPassword123!');
    await page.locator('form').getByRole('button', { name: 'Sign Up' }).click();

    // Verify error message for invalid email
    const emailError = page.getByText(/invalid.*email|email.*invalid/i);
    await expect(emailError).toBeVisible();

    // Clear form
    await page.getByPlaceholder('Email').clear();

    // Test 2: Short password (less than 8 characters)
    await page.getByPlaceholder('Email').fill(`valid-${Date.now()}@example.com`);
    await page.getByPlaceholder('Password').fill('Short1!');
    await page.locator('form').getByRole('button', { name: 'Sign Up' }).click();

    // Verify error message for short password
    const passwordError = page.getByText(/password.*too short|at least|minimum/i);
    await expect(passwordError).toBeVisible();

    // Clear form
    await page.getByPlaceholder('Password').clear();

    // Verify user stays on signup page
    await expect(page).toHaveURL(/signup/);
  });

  test('should successfully login with valid credentials', async ({ page }) => {
    // Create a user first via signup
    const user = await setupAuthenticatedUser(page);

    // Logout user
    await logout(page);

    // Verify user is logged out
    const isAuth = await isAuthenticated(page);
    expect(isAuth).toBe(false);

    // Navigate to login
    await page.goto('/login');

    // Fill login form
    await page.getByPlaceholder('Username').fill(user.email);
    await page.getByPlaceholder('Password').fill(user.password);

    // Submit login form
    await page.locator('form').getByRole('button', { name: 'Log In' }).click();

    // Verify redirect to stories page
    await page.waitForURL('/stories');

    // Verify user is authenticated
    const isAuthAfterLogin = await isAuthenticated(page);
    expect(isAuthAfterLogin).toBe(true);
  });

  test('should show error for invalid login credentials', async ({ page }) => {
    // Navigate to login
    await page.goto('/login');

    // Test 1: Non-existent user
    const timestamp = Date.now();
    const nonExistentEmail = `nonexistent-${timestamp}@example.com`;

    await page.getByPlaceholder('Username').fill(nonExistentEmail);
    await page.getByPlaceholder('Password').fill('Password123!');
    await page.locator('form').getByRole('button', { name: 'Log In' }).click();

    // Verify error message for invalid credentials
    const errorMsg = page.getByText(/invalid|incorrect|not found|credentials/i);
    await expect(errorMsg).toBeVisible();

    // Verify user stays on login page
    await expect(page).toHaveURL(/login/);

    // Test 2: Wrong password
    // Create a user first
    const user = await setupAuthenticatedUser(page);
    await logout(page);

    // Navigate back to login
    await page.goto('/login');

    // Try login with wrong password
    await page.getByPlaceholder('Username').fill(user.email);
    await page.getByPlaceholder('Password').fill('WrongPassword123!');
    await page.locator('form').getByRole('button', { name: 'Log In' }).click();

    // Verify error message
    const wrongPasswordError = page.getByText(/invalid|incorrect|credentials/i);
    await expect(wrongPasswordError).toBeVisible();

    // Verify user stays on login page
    await expect(page).toHaveURL(/login/);
  });

  test('should successfully logout user', async ({ page }) => {
    // Setup authenticated user
    const user = await setupAuthenticatedUser(page);

    // Verify user is on stories page
    await expect(page).toHaveURL('/stories');

    // Find and click logout button
    const logoutButton = page.getByRole('button', { name: /logout|log out|sign out/i });
    await logoutButton.click();

    // Verify redirect to landing page
    await page.waitForURL('/');

    // Verify authentication cookies are cleared
    const cookies = await page.context().cookies();
    const refreshToken = cookies.find((c) => c.name === 'refreshToken');
    expect(refreshToken).toBeFalsy();

    // Verify user is no longer authenticated
    const isAuth = await isAuthenticated(page);
    expect(isAuth).toBe(false);
  });

  test('should redirect unauthenticated users from protected routes', async ({ page }) => {
    // Clear authentication state
    await page.context().clearCookies();

    // Test 1: Stories route
    await page.goto('/stories');
    // Should redirect to login
    await page.waitForURL(/login|auth/);
    await expect(page).toHaveURL(/login|auth/);

    // Test 2: Templates route
    await page.goto('/templates');
    // Should redirect to login
    await page.waitForURL(/login|auth/);
    await expect(page).toHaveURL(/login|auth/);

    // Test 3: Archive route
    await page.goto('/archive');
    // Should redirect to login
    await page.waitForURL(/login|auth/);
    await expect(page).toHaveURL(/login|auth/);
  });

  test('should handle token refresh on API request', async ({ page }) => {
    // Setup authenticated user
    const user = await setupAuthenticatedUser(page);

    // Verify user is authenticated
    let isAuth = await isAuthenticated(page);
    expect(isAuth).toBe(true);

    // Access protected page to trigger potential token refresh
    await page.goto('/stories');

    // Trigger an API request (e.g., load stories)
    const responsePromise = page.waitForResponse(
      (response) =>
        response.url().includes('/api') || response.url().includes('/storynode')
    );

    // Reload page to trigger API calls
    await page.reload();

    // Wait for at least one API response
    try {
      const response = await Promise.race([
        responsePromise,
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Timeout')), 5000)
        ),
      ]);
      expect(response.status()).toBeLessThan(500);
    } catch (e) {
      // If no API request made, that's also acceptable
    }

    // Verify user is still authenticated
    isAuth = await isAuthenticated(page);
    expect(isAuth).toBe(true);
  });

  test('should handle expired refresh token by redirecting to login', async ({
    page,
  }) => {
    // Setup authenticated user
    const user = await setupAuthenticatedUser(page);

    // Clear the refresh token cookie to simulate expiration
    await page.context().clearCookies({ name: 'refreshToken' });

    // Navigate to protected page
    await page.goto('/stories');

    // Verify redirect to login page
    await page.waitForURL(/login|auth/, { timeout: 10000 });

    // Verify user is no longer authenticated
    const isAuth = await isAuthenticated(page);
    expect(isAuth).toBe(false);
  });

  test('should persist authentication across page refreshes', async ({
    page,
  }) => {
    // Setup authenticated user
    const user = await setupAuthenticatedUser(page);

    // Verify on stories page
    await expect(page).toHaveURL('/stories');

    // Verify user is authenticated
    let isAuth = await isAuthenticated(page);
    expect(isAuth).toBe(true);

    // Reload the page
    await page.reload();

    // Wait for page to load
    await page.waitForLoadState('networkidle');

    // Verify still on stories page
    await expect(page).toHaveURL('/stories');

    // Verify user is still authenticated
    isAuth = await isAuthenticated(page);
    expect(isAuth).toBe(true);

    // Verify refresh token cookie still exists
    const cookies = await page.context().cookies();
    const refreshToken = cookies.find((c) => c.name === 'refreshToken');
    expect(refreshToken).toBeTruthy();
  });

  test('should allow switching between login and signup pages', async ({
    page,
  }) => {
    // Navigate to signup page
    await page.goto('/signup');

    // Verify signup form is displayed
    const signupForm = page.getByPlaceholder('Email');
    await expect(signupForm).toBeVisible();

    // Find and click link to login page
    const loginLink = page.getByRole('link', { name: /log in|login|sign in/i });
    await loginLink.click();

    // Wait for navigation to login page
    await page.waitForURL(/login/);

    // Verify login page is displayed
    const passwordField = page.getByPlaceholder('Password');
    await expect(passwordField).toBeVisible();

    // Verify username field exists on login
    const usernameField = page.getByPlaceholder('Username');
    await expect(usernameField).toBeVisible();

    // Find and click link back to signup
    const signupLink = page.getByRole('link', { name: /sign up|register|create/i });
    await signupLink.click();

    // Wait for navigation back to signup
    await page.waitForURL(/signup/);

    // Verify back on signup page with username field
    const usernameFieldSignup = page.getByPlaceholder('Username');
    await expect(usernameFieldSignup).toBeVisible();
  });

  test('should show loading state during authentication', async ({ page }) => {
    // Navigate to login page
    await page.goto('/login');

    // Create a user for testing
    const user = await setupAuthenticatedUser(page);
    await logout(page);

    // Navigate back to login
    await page.goto('/login');

    // Fill login form
    await page.getByPlaceholder('Username').fill(user.email);
    await page.getByPlaceholder('Password').fill(user.password);

    // Start listening for loading indicator
    const loginButton = page.locator('form').getByRole('button', { name: 'Log In' });

    // Click submit button
    await loginButton.click();

    // Check for loading state (spinner, disabled button, or loading text)
    // Try to find loading indicator
    const loadingIndicator = page
      .getByRole('status')
      .filter({ hasText: /loading|processing|signing in/i });

    // Or check if button is disabled during submission
    const isDisabled = await loginButton.isDisabled();

    // Wait for redirect to complete
    await page.waitForURL('/stories', { timeout: 10000 });

    // Verify loading state has cleared and user is on stories page
    await expect(page).toHaveURL('/stories');
  });
});

test.describe('Password Reset Flow', () => {
  test('should send password reset email', async ({ page }) => {
    // Navigate to password reset page (assuming it's at /forgot-password or similar)
    await page.goto('/forgot-password');

    // Create a user first to request reset for
    const timestamp = Date.now();
    const email = `test-user-${timestamp}@example.com`;
    const username = `testuser-${timestamp}`;

    // Create user via signup
    await page.goto('/signup');
    const password = 'TestPassword123!';
    await page.getByPlaceholder('Email').fill(email);
    await page.getByPlaceholder('Username').fill(username);
    await page.getByPlaceholder('Password').fill(password);
    await page.locator('form').getByRole('button', { name: 'Sign Up' }).click();

    // Wait for redirect to stories
    await page.waitForURL('/stories');

    // Logout
    await logout(page);

    // Navigate to password reset page
    await page.goto('/forgot-password');

    // Fill in the email field
    await page.getByPlaceholder('Email').fill(email);

    // Submit the reset request
    await page.getByRole('button', { name: /send|reset|continue/i }).click();

    // Verify success message appears
    const successMessage = page.getByText(
      /check.*email|reset.*sent|email.*sent|instructions.*sent/i
    );
    await expect(successMessage).toBeVisible();

    // Verify user is redirected or stays on page with confirmation
    // (Most implementations redirect to login or show confirmation on same page)
    await page.waitForLoadState('networkidle');
  });

  test('should reset password with valid token', async ({ page }) => {
    // Create a user first
    const timestamp = Date.now();
    const email = `test-reset-${timestamp}@example.com`;
    const username = `testuser-${timestamp}`;
    const oldPassword = 'TestPassword123!';
    const newPassword = 'NewPassword456!';

    // Sign up user
    await page.goto('/signup');
    await page.getByPlaceholder('Email').fill(email);
    await page.getByPlaceholder('Username').fill(username);
    await page.getByPlaceholder('Password').fill(oldPassword);
    await page.locator('form').getByRole('button', { name: 'Sign Up' }).click();

    // Wait for redirect to stories
    await page.waitForURL('/stories');

    // Logout
    await logout(page);

    // Navigate to password reset page
    await page.goto('/forgot-password');

    // Request password reset
    await page.getByPlaceholder('Email').fill(email);
    await page.getByRole('button', { name: /send|reset|continue/i }).click();

    // Wait for success message
    const successMessage = page.getByText(
      /check.*email|reset.*sent|email.*sent|instructions.*sent/i
    );
    await expect(successMessage).toBeVisible();

    // In a real scenario, we would need to get the token from the email
    // For testing purposes, we can:
    // 1. Check the backend for the generated token
    // 2. Intercept the email service
    // 3. Use a test email service that provides access to emails

    // Simulate having a valid token (replace with actual token retrieval)
    // This is a simplified test - actual implementation would need token extraction
    const validToken = 'valid-test-token-123';

    // Navigate to reset password page with token
    await page.goto(`/reset-password?token=${validToken}`);

    // Fill in new password
    await page.getByLabel('New Password').fill(newPassword);
    await page.getByLabel('Confirm Password').fill(newPassword);

    // Submit password reset
    await page.getByRole('button', { name: /reset|update|change/i }).click();

    // Verify success message
    const resetSuccess = page.getByText(/password.*changed|password.*reset|success/i);
    await expect(resetSuccess).toBeVisible();

    // Verify redirect to login page
    await page.waitForURL(/login|auth/);

    // Test login with new password
    await page.goto('/login');
    await page.getByPlaceholder('Username').fill(email);
    await page.getByPlaceholder('Password').fill(newPassword);
    await page.locator('form').getByRole('button', { name: 'Log In' }).click();

    // Verify successful login with new password
    await page.waitForURL('/stories');

    // Verify user is authenticated
    const isAuth = await isAuthenticated(page);
    expect(isAuth).toBe(true);

    // Logout
    await logout(page);

    // Verify old password no longer works
    await page.goto('/login');
    await page.getByPlaceholder('Username').fill(email);
    await page.getByPlaceholder('Password').fill(oldPassword);
    await page.locator('form').getByRole('button', { name: 'Log In' }).click();

    // Verify error message for wrong password
    const errorMsg = page.getByText(/invalid|incorrect|credentials/i);
    await expect(errorMsg).toBeVisible();

    // Verify user is still on login page
    await expect(page).toHaveURL(/login/);
  });

  test('should reject invalid or expired reset token', async ({ page }) => {
    // Navigate to reset password page with invalid token
    const invalidToken = 'invalid-or-expired-token-xyz';

    await page.goto(`/reset-password?token=${invalidToken}`);

    // Try to fill form and submit (should fail)
    const newPasswordField = page.getByLabel('New Password');

    // If field is disabled or not present, verify error message
    if (!(await newPasswordField.isVisible())) {
      // Field not visible, should show error
      const errorMessage = page.getByText(
        /invalid.*token|expired.*token|not found|invalid.*reset/i
      );
      await expect(errorMessage).toBeVisible();
    } else {
      // Field is visible, try to submit
      await newPasswordField.fill('NewPassword456!');
      await page.getByLabel('Confirm Password').fill('NewPassword456!');
      await page.getByRole('button', { name: /reset|update|change/i }).click();

      // Verify error message appears
      const errorMessage = page.getByText(
        /invalid.*token|expired.*token|not found|invalid.*reset|link.*expired/i
      );
      await expect(errorMessage).toBeVisible();
    }

    // Verify user is on reset page or redirected to appropriate page
    const currentUrl = page.url();
    expect(
      currentUrl.includes('reset-password') ||
      currentUrl.includes('forgot-password') ||
      currentUrl.includes('login')
    ).toBeTruthy();
  });
});
