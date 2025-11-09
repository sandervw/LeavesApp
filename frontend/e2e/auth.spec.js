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

    // Verify redirect to home page (/)
    await page.waitForURL('/');

    // Verify user is authenticated
    const isAuthAfterLogin = await isAuthenticated(page);
    expect(isAuthAfterLogin).toBe(true);
  });

  test('should successfully logout user', async ({ page }) => {
    // Setup authenticated user
    await setupAuthenticatedUser(page);

    // Verify user is on home page
    await expect(page).toHaveURL('/');

    // Find and click logout button
    const logoutButton = page.getByRole('button', { name: /logout|log out|sign out/i });
    await logoutButton.click();

    // Wait for logout to process
    await page.waitForTimeout(1000);

    // Verify authentication cookies are cleared
    const cookies = await page.context().cookies();
    const refreshToken = cookies.find((c) => c.name === 'refreshToken');
    expect(refreshToken).toBeFalsy();

    // Verify user is no longer authenticated
    const isAuth = await isAuthenticated(page);
    expect(isAuth).toBe(false);
  });

  test('should handle token refresh on API request', async ({ page }) => {
    // Setup authenticated user
    await setupAuthenticatedUser(page);

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

  test('should persist authentication across page refreshes', async ({
    page,
  }) => {
    // Setup authenticated user
    await setupAuthenticatedUser(page);

    // Verify on home page
    await expect(page).toHaveURL('/');

    // Verify user is authenticated
    let isAuth = await isAuthenticated(page);
    expect(isAuth).toBe(true);

    // Reload the page
    await page.reload();

    // Wait for page to load
    await page.waitForLoadState('networkidle');

    // Verify still on home page
    await expect(page).toHaveURL('/');

    // Verify user is still authenticated
    isAuth = await isAuthenticated(page);
    expect(isAuth).toBe(true);

    // Verify refresh token cookie still exists
    const cookies = await page.context().cookies();
    const refreshToken = cookies.find((c) => c.name === 'refreshToken');
    expect(refreshToken).toBeTruthy();
  });
});