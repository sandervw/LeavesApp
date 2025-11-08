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
 * - URL parameter handling
 * - Breadcrumb navigation
 */

test.describe('Application Navigation', () => {
  test.beforeEach(async ({ page }) => {
    // TODO: Setup authenticated user for each test
    await setupAuthenticatedUser(page);
  });

  test('should navigate between main pages using navbar', async ({ page }) => {
    // TODO: Start on stories page
    // await page.goto('/stories');
    // await expect(page.locator('[data-testid="stories-page"]')).toBeVisible();

    // TODO: Click Templates link in navbar
    // await page.click('[data-testid="templates-nav-link"]');

    // TODO: Verify navigation to templates page
    // await page.waitForURL('/templates');
    // await expect(page.locator('[data-testid="templates-page"]')).toBeVisible();

    // TODO: Click Archive link in navbar
    // await page.click('[data-testid="archive-nav-link"]');

    // TODO: Verify navigation to archive page
    // await page.waitForURL('/archive');
    // await expect(page.locator('[data-testid="archive-page"]')).toBeVisible();

    // TODO: Click Stories link in navbar
    // await page.click('[data-testid="stories-nav-link"]');

    // TODO: Verify navigation back to stories page
    // await page.waitForURL('/stories');
    // await expect(page.locator('[data-testid="stories-page"]')).toBeVisible();
  });

  test('should navigate to template detail page by clicking template', async ({ page }) => {
    // TODO: Create a template
    // await page.goto('/templates');
    const templateName = 'Test Template';
    // const template = await createTemplate(page, templateName, 'root');

    // TODO: Click on template to navigate to detail view
    // await page.click(`[data-template-id="${template.id}"]`);

    // TODO: Verify navigation to template detail page
    // await page.waitForURL(`/template/${template.id}`);

    // TODO: Verify template detail page is displayed
    // await expect(page.locator('[data-testid="template-detail-page"]'))
    //   .toBeVisible();

    // TODO: Verify URL contains template ID
    // expect(page.url()).toContain(template.id);

    // TODO: Verify template name is displayed
    // await expect(page.locator('h1')).toContainText(templateName);
  });

  test('should navigate to storynode detail page by clicking storynode', async ({ page }) => {
    // TODO: Create a storynode
    // await page.goto('/stories');
    const storynodeName = 'Test Story';
    // const storynode = await createStorynode(page, storynodeName, 'root');

    // TODO: Click on storynode to navigate to detail view
    // await page.click(`[data-storynode-id="${storynode.id}"]`);

    // TODO: Verify navigation to storynode detail page
    // await page.waitForURL(`/storynode/${storynode.id}`);

    // TODO: Verify storynode detail page is displayed
    // await expect(page.locator('[data-testid="storynode-detail-page"]'))
    //   .toBeVisible();

    // TODO: Verify URL contains storynode ID
    // expect(page.url()).toContain(storynode.id);

    // TODO: Verify storynode name is displayed
    // await expect(page.locator('h1')).toContainText(storynodeName);
  });

  test('should navigate back from detail page using back button', async ({ page }) => {
    // TODO: Create a template and navigate to detail page
    // await page.goto('/templates');
    // const template = await createTemplate(page, 'Back Test Template', 'root');
    // await page.click(`[data-template-id="${template.id}"]`);
    // await page.waitForURL(`/template/${template.id}`);

    // TODO: Click browser back button or navigate back
    // await page.goBack();

    // TODO: Verify navigation back to templates list page
    // await page.waitForURL('/templates');
    // await expect(page.locator('[data-testid="templates-page"]'))
    //   .toBeVisible();

    // TODO: Click browser forward button
    // await page.goForward();

    // TODO: Verify navigation forward to template detail page
    // await page.waitForURL(`/template/${template.id}`);
    // await expect(page.locator('[data-testid="template-detail-page"]'))
    //   .toBeVisible();
  });

  test('should navigate using breadcrumbs in detail view', async ({ page }) => {
    // TODO: Create a template and navigate to detail page
    // await page.goto('/templates');
    // const template = await createTemplate(page, 'Breadcrumb Test', 'root');
    // await page.click(`[data-template-id="${template.id}"]`);
    // await page.waitForURL(`/template/${template.id}`);

    // TODO: Verify breadcrumbs are displayed
    // await expect(page.locator('[data-testid="breadcrumbs"]')).toBeVisible();

    // TODO: Verify breadcrumb shows current location
    // await expect(page.locator('[data-testid="breadcrumbs"]'))
    //   .toContainText('Templates');

    // TODO: Click on Templates breadcrumb link
    // await page.click('[data-testid="breadcrumb-templates"]');

    // TODO: Verify navigation to templates page
    // await page.waitForURL('/templates');
    // await expect(page.locator('[data-testid="templates-page"]'))
    //   .toBeVisible();
  });

  test('should redirect unauthenticated users to login from protected routes', async ({ page }) => {
    // TODO: Logout user
    await logout(page);

    // Test Case 1: Stories page
    // TODO: Navigate to /stories
    // await page.goto('/stories');

    // TODO: Verify redirect to login or landing page
    // await page.waitForURL('/login');
    // OR
    // await page.waitForURL('/');

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

    // Test Case 4: Detail page with ID
    // TODO: Navigate to /storynode/some-id
    // await page.goto('/storynode/123456789');

    // TODO: Verify redirect to login or landing page
    // await page.waitForURL('/login');
  });

  test('should allow authenticated users to access protected routes', async ({ page }) => {
    // TODO: User is already authenticated from beforeEach

    // Test Case 1: Stories page
    // await page.goto('/stories');
    // await expect(page.locator('[data-testid="stories-page"]')).toBeVisible();

    // Test Case 2: Templates page
    // await page.goto('/templates');
    // await expect(page.locator('[data-testid="templates-page"]')).toBeVisible();

    // Test Case 3: Archive page
    // await page.goto('/archive');
    // await expect(page.locator('[data-testid="archive-page"]')).toBeVisible();
  });

  test('should redirect to stories page after successful login', async ({ page }) => {
    // TODO: Logout to test login flow
    await logout(page);

    // TODO: Navigate to login page
    // await page.goto('/login');

    // TODO: Fill and submit login form
    // await page.fill('[name="email"]', 'test@example.com');
    // await page.fill('[name="password"]', 'TestPassword123!');
    // await page.click('button[type="submit"]');

    // TODO: Verify redirect to stories page
    // await page.waitForURL('/stories');
    // await expect(page.locator('[data-testid="stories-page"]')).toBeVisible();
  });

  test('should handle deep linking to detail pages', async ({ page }) => {
    // TODO: Create a storynode
    // await page.goto('/stories');
    const storynodeName = 'Deep Link Test';
    // const storynode = await createStorynode(page, storynodeName, 'root');

    // TODO: Get the storynode detail URL
    const detailUrl = `/storynode/${storynode.id}`;

    // TODO: Navigate to a different page
    // await page.goto('/templates');

    // TODO: Directly navigate to storynode detail URL
    // await page.goto(detailUrl);

    // TODO: Verify direct navigation works
    // await expect(page.locator('[data-testid="storynode-detail-page"]'))
    //   .toBeVisible();
    // await expect(page.locator('h1')).toContainText(storynodeName);
  });

  test('should handle 404 for non-existent routes', async ({ page }) => {
    // TODO: Navigate to non-existent route
    // await page.goto('/this-page-does-not-exist');

    // TODO: Verify 404 page or redirect to home
    // Option 1: Show 404 page
    // await expect(page.locator('[data-testid="404-page"]')).toBeVisible();
    // await expect(page.locator('h1')).toContainText('404');

    // Option 2: Redirect to home/stories
    // await page.waitForURL('/stories');
    // await expect(page.locator('[data-testid="stories-page"]')).toBeVisible();
  });

  test('should handle navigation to detail page with invalid ID', async ({ page }) => {
    // TODO: Navigate to storynode detail page with invalid ID
    // await page.goto('/storynode/invalid-id-12345');

    // TODO: Verify error handling
    // Option 1: Show error message on detail page
    // await expect(page.locator('[data-testid="error-message"]'))
    //   .toContainText('Story not found');

    // Option 2: Redirect to stories page with error
    // await page.waitForURL('/stories');
    // await expect(page.locator('[data-testid="error-notification"]'))
    //   .toContainText('Story not found');

    // Option 3: Show 404 page
    // await expect(page.locator('[data-testid="404-page"]')).toBeVisible();
  });

  test('should preserve scroll position when navigating back', async ({ page }) => {
    // TODO: Create multiple templates to enable scrolling
    // await page.goto('/templates');
    // for (let i = 0; i < 20; i++) {
    //   await createTemplate(page, `Template ${i}`, 'root');
    // }

    // TODO: Scroll down the page
    // await page.evaluate(() => window.scrollTo(0, 500));
    const scrollPosition = 500;

    // TODO: Navigate to a template detail page
    // await page.click('[data-template-id="some-id"]');
    // await page.waitForURL(/\/template\/.+/);

    // TODO: Navigate back
    // await page.goBack();
    // await page.waitForURL('/templates');

    // TODO: Verify scroll position is preserved (approximately)
    // const newScrollPosition = await page.evaluate(() => window.scrollY);
    // expect(newScrollPosition).toBeGreaterThan(400); // Allow some tolerance

    // NOTE: This behavior depends on browser and framework implementation
    // Adjust expectations based on actual scroll restoration behavior
  });

  test('should update active nav link based on current page', async ({ page }) => {
    // TODO: Navigate to stories page
    // await page.goto('/stories');

    // TODO: Verify Stories nav link is active
    // await expect(page.locator('[data-testid="stories-nav-link"]'))
    //   .toHaveClass(/active/);

    // TODO: Navigate to templates page
    // await page.goto('/templates');

    // TODO: Verify Templates nav link is active and Stories is not
    // await expect(page.locator('[data-testid="templates-nav-link"]'))
    //   .toHaveClass(/active/);
    // await expect(page.locator('[data-testid="stories-nav-link"]'))
    //   .not.toHaveClass(/active/);

    // TODO: Navigate to archive page
    // await page.goto('/archive');

    // TODO: Verify Archive nav link is active
    // await expect(page.locator('[data-testid="archive-nav-link"]'))
    //   .toHaveClass(/active/);
  });

  test('should navigate to landing page when clicking logo', async ({ page }) => {
    // TODO: Start on stories page
    // await page.goto('/stories');

    // TODO: Click application logo in navbar
    // await page.click('[data-testid="app-logo"]');

    // TODO: Verify navigation to landing page or home
    // await page.waitForURL('/');
    // await expect(page.locator('[data-testid="landing-page"]')).toBeVisible();

    // NOTE: Behavior may vary based on authentication state
    // Authenticated users might stay on stories, or go to landing
  });

  test('should preserve form data when navigating away and back', async ({ page }) => {
    // TODO: Navigate to templates page
    // await page.goto('/templates');

    // TODO: Click add template button
    // await page.click('[data-testid="add-template-button"]');

    // TODO: Fill part of the form
    const templateName = 'Partially Filled Template';
    // await page.fill('[name="name"]', templateName);
    // await page.selectOption('[name="type"]', 'root');

    // TODO: Navigate away without submitting
    // await page.goto('/stories');

    // TODO: Navigate back to templates
    // await page.goBack();

    // TODO: Verify form modal is closed (data not preserved)
    // await expect(page.locator('[data-testid="template-form"]'))
    //   .not.toBeVisible();

    // NOTE: Form data preservation depends on implementation
    // Some apps preserve, some don't - adjust test based on actual behavior
    // If your app uses draft auto-save, test that functionality instead
  });

  test('should handle rapid navigation between pages', async ({ page }) => {
    // TODO: Rapidly navigate between pages
    // await page.goto('/stories');
    // await page.goto('/templates');
    // await page.goto('/archive');
    // await page.goto('/stories');

    // TODO: Verify final page loads correctly
    // await expect(page.locator('[data-testid="stories-page"]')).toBeVisible();

    // TODO: Verify no console errors or race conditions
    // const errors = [];
    // page.on('console', (msg) => {
    //   if (msg.type() === 'error') errors.push(msg.text());
    // });
    // expect(errors).toHaveLength(0);
  });

  test('should support keyboard navigation between pages', async ({ page }) => {
    // TODO: Start on stories page
    // await page.goto('/stories');

    // TODO: Use Tab key to navigate to templates link
    // await page.keyboard.press('Tab');
    // // Continue tabbing until templates link is focused
    // // This depends on tab order in your navbar

    // TODO: Press Enter to navigate
    // await page.keyboard.press('Enter');

    // TODO: Verify navigation to templates page
    // await page.waitForURL('/templates');
    // await expect(page.locator('[data-testid="templates-page"]')).toBeVisible();

    // NOTE: This test depends on keyboard accessibility implementation
    // Adjust based on actual tab order and accessibility features
  });

  test('should show loading state during page transitions', async ({ page }) => {
    // TODO: Navigate to a page that requires data loading
    // await page.goto('/stories');

    // TODO: Monitor for loading indicator
    // This may require network throttling to see the loading state
    // await page.route('**/*', (route) => {
    //   return route.continue({ delay: 1000 }); // Simulate slow network
    // });

    // TODO: Navigate to templates page
    // const navigationPromise = page.goto('/templates');

    // TODO: Verify loading indicator appears
    // await expect(page.locator('[data-testid="page-loading"]')).toBeVisible();

    // TODO: Wait for navigation to complete
    // await navigationPromise;

    // TODO: Verify loading indicator disappears
    // await expect(page.locator('[data-testid="page-loading"]'))
    //   .not.toBeVisible();

    // TODO: Verify page content is loaded
    // await expect(page.locator('[data-testid="templates-page"]'))
    //   .toBeVisible();
  });
});

test.describe('Sidebar Navigation', () => {
  test.beforeEach(async ({ page }) => {
    await setupAuthenticatedUser(page);
  });

  test('should toggle sidebar visibility', async ({ page }) => {
    // TODO: Navigate to stories page
    // await page.goto('/stories');

    // TODO: Verify sidebar is visible by default
    // await expect(page.locator('[data-testid="add-sidebar"]')).toBeVisible();

    // TODO: Click toggle button to hide sidebar
    // await page.click('[data-testid="toggle-sidebar-button"]');

    // TODO: Verify sidebar is hidden
    // await expect(page.locator('[data-testid="add-sidebar"]'))
    //   .not.toBeVisible();

    // TODO: Click toggle button to show sidebar again
    // await page.click('[data-testid="toggle-sidebar-button"]');

    // TODO: Verify sidebar is visible again
    // await expect(page.locator('[data-testid="add-sidebar"]')).toBeVisible();
  });

  test('should show different sidebar content based on current page', async ({ page }) => {
    // TODO: Navigate to stories page
    // await page.goto('/stories');

    // TODO: Verify AddSidebar with templates is shown
    // await expect(page.locator('[data-testid="add-sidebar"]')).toBeVisible();
    // await expect(page.locator('[data-testid="templates-sidebar-list"]'))
    //   .toBeVisible();

    // TODO: Navigate to templates page
    // await page.goto('/templates');

    // TODO: Verify different sidebar or no sidebar is shown
    // This depends on your application's sidebar behavior
    // await expect(page.locator('[data-testid="add-sidebar"]'))
    //   .not.toBeVisible();
    // OR
    // await expect(page.locator('[data-testid="link-sidebar"]')).toBeVisible();
  });
});
