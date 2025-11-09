import { test, expect } from '@playwright/test';
import { setupAuthenticatedUser, createTemplate, createStorynode, logout } from './helpers.js';

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

  test('should navigate to template detail page by clicking template', async ({ page }) => {
    // Create a template
    await page.goto('/templates');
    const templateName = 'Test Template';
    const template = await createTemplate(page, templateName, 'root');

    // Click on template name to navigate to detail view
    await page.locator(`.draggable[id="${template.id}"]`).locator('h3').click();

    // Verify navigation to template detail page
    await page.waitForURL('/templatedetail/');

    // Verify template detail page is displayed with correct content
    await expect(page.locator('.element.detail')).toBeVisible();
    await expect(page.locator('h3').first()).toContainText(templateName);
  });

  test('should navigate to storynode detail page by clicking storynode', async ({ page }) => {
    // Create a storynode
    await page.goto('/stories');
    const storynodeName = 'Test Story';
    const storynode = await createStorynode(page, storynodeName, 'root');

    // Click on storynode name to navigate to detail view
    await page.locator(`.draggable[id="${storynode.id}"]`).locator('h3').click();

    // Verify navigation to storynode detail page
    await page.waitForURL('/storydetail/');

    // Verify storynode detail page is displayed with correct content
    await expect(page.locator('.element.detail')).toBeVisible();
    await expect(page.locator('h3').first()).toContainText(storynodeName);
  });

  test('should navigate back from detail page using back button', async ({ page }) => {
    // Create a template and navigate to detail page
    await page.goto('/templates');
    const template = await createTemplate(page, 'Back Test Template', 'root');
    await page.locator(`.draggable[id="${template.id}"]`).locator('h3').click();
    await page.waitForURL('/templatedetail/');

    // Click browser back button or navigate back
    await page.goBack();

    // Verify navigation back to templates list page
    await page.waitForURL('/templates');
    await expect(page.locator('.container.content')).toBeVisible();

    // Click browser forward button
    await page.goForward();

    // Verify navigation forward to template detail page
    await page.waitForURL('/templatedetail/');
    await expect(page.locator('.element.detail')).toBeVisible();
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
