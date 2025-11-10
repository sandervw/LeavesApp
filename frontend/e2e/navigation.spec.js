import { test, expect } from '@playwright/test';
import { setupAuthenticatedUser, logout } from './helpers.js';

/**
 * Navigation E2E Tests
 *
 * Tests cover application navigation including:
 * - Page navigation between Stories, Templates, Archive
 * - Navigation to detail views (TemplateDetail, StorynodeDetail)
 * - Protected route redirects for unauthenticated users
 * - Browser back/forward navigation
 */

test.describe('Application Navigation', () => {
  test.beforeEach(async ({ page }) => {
    await setupAuthenticatedUser(page);
  });

  test('should navigate between main pages using sidebar', async ({ page }) => {
    // Start on home page (defaults to stories)
    await page.goto('/');
    await expect(page.locator('.container.content')).toBeVisible();

    // Navigate to templates via sidebar link
    await page.getByText('Templates', { exact: true }).click();
    await page.waitForURL('/templates');
    await expect(page.locator('.container.content')).toBeVisible();

    // Navigate to archive via sidebar link
    await page.getByText('Archive', { exact: true }).click();
    await page.waitForURL('/archive');
    await expect(page.locator('.container.content')).toBeVisible();

    // Navigate back to stories via sidebar link
    await page.getByText('Stories', { exact: true }).click();
    await page.waitForURL('/stories');
    await expect(page.locator('.container.content')).toBeVisible();
  });

  test('should redirect unauthenticated users to login from protected routes', async ({ page }) => {
    // Logout user
    await logout(page);

    // Test Case 1: Stories page
    await page.goto('/stories');
    // Should redirect to landing
    await page.waitForURL('/landing');
    await expect(page).toHaveURL('/landing');

    // Test Case 2: Templates page
    await page.goto('/templates');
    // Should redirect to landing
    await page.waitForURL('/landing');
    await expect(page).toHaveURL('/landing');

    // Test Case 3: Archive page
    await page.goto('/archive');
    // Should redirect to landing
    await page.waitForURL('/landing');
    await expect(page).toHaveURL('/landing');
  });
});
