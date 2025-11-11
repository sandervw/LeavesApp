import { test, expect } from '@playwright/test';
import { setupAuthenticatedUser, createStorynode, createStorynodeTree, waitForApiResponse } from './helpers.js';

/**
 * Archive E2E Tests
 *
 * Tests cover archive functionality including:
 * - Archiving storynodes
 * - Unarchiving storynodes
 * - Filtering archived vs active storynodes
 */

test.describe('Archive Operations', () => {
  test.beforeEach(async ({ page }) => {
    await setupAuthenticatedUser(page);
  });

  test('should archive a storynode from detail page', async ({ page }) => {
    // Create a root storynode
    const storynode = await createStorynode(page, 'Test Story to Archive', 'root');

    // Navigate to storynode detail page by clicking on it
    await page.click(`.draggable[id="${storynode.id}"] h3.clickable`);
    await page.waitForURL(/\/storydetail/);

    // Verify archive button is visible
    const archiveButton = page.getByRole('button', { name: 'archive icon' });
    await expect(archiveButton).toBeVisible();

    // Click archive button
    await archiveButton.click();

    // Wait for navigation back to home
    await page.waitForURL('/');

    // Navigate to archive page
    await page.goto('/archive');
    await page.waitForURL('/archive');

    // Verify storynode appears in archive
    const archivedStorynode = page.locator(`.draggable[id="${storynode.id}"]`);
    await expect(archivedStorynode).toBeVisible();

    // Verify it shows the correct name
    await expect(archivedStorynode).toContainText('Test Story to Archive');
  });

  test('should unarchive a storynode and return it to stories', async ({ page }) => {
    // Create and archive a root storynode
    const storynode = await createStorynode(page, 'Test Story to Unarchive', 'root');

    // Navigate to detail page and archive it by clicking on it
    await page.click(`.draggable[id="${storynode.id}"] h3.clickable`);
    await page.waitForURL(/\/storydetail/);
    const archiveButton = page.getByRole('button', { name: 'archive icon' });
    await archiveButton.click();
    await page.waitForURL('/');

    // Navigate to archive page
    await page.goto('/archive');
    await page.waitForURL('/archive');

    // Verify storynode is in archive
    const archivedStorynode = page.locator(`.draggable[id="${storynode.id}"]`);
    await expect(archivedStorynode).toBeVisible();

    // Click on the archived storynode to view it
    await archivedStorynode.locator('h3.clickable').click();
    await page.waitForURL(/\/storydetail/);

    // Verify unarchive button is visible
    const unarchiveButton = page.getByRole('button', { name: 'unarchive icon' });
    await expect(unarchiveButton).toBeVisible();

    // Click unarchive button
    await unarchiveButton.click();

    // Wait for navigation back to home
    await page.waitForURL('/');

    // Verify storynode is back in stories page
    await page.goto('/stories');
    const unarchivedStorynode = page.locator(`.draggable[id="${storynode.id}"]`);
    await expect(unarchivedStorynode).toBeVisible();

    // Verify it no longer appears in archive
    await page.goto('/archive');
    const shouldNotExist = page.locator(`.draggable[id="${storynode.id}"]`);
    await expect(shouldNotExist).not.toBeVisible();
  });

  test('should preserve storynode content when archiving/unarchiving', async ({ page }) => {
    // Create a root storynode
    const storynode = await createStorynode(page, 'Story with Content', 'root');

    // Navigate to detail page by clicking on it
    await page.click(`.draggable[id="${storynode.id}"] h3.clickable`);
    await page.waitForURL(/\/storydetail/);

    // Add text content to the storynode
    const editor = page.locator('.ProseMirror');
    await editor.click();
    await editor.fill('This is my story content that should be preserved.');

    // Wait for blur to trigger save
    await page.locator('h2[trait="name"]').click();
    await page.waitForTimeout(500);

    // Archive the storynode
    const archiveButton = page.getByRole('button', { name: 'archive icon' });
    await archiveButton.click();
    await page.waitForURL('/');

    // Navigate to archive and open the archived storynode
    await page.goto('/archive');
    const archivedStorynode = page.locator(`.draggable[id="${storynode.id}"]`);
    await archivedStorynode.locator('h3.clickable').click();
    await page.waitForURL(/\/storydetail/);

    // Verify content is preserved
    await expect(editor).toContainText('This is my story content that should be preserved.');

    // Unarchive the storynode
    const unarchiveButton = page.getByRole('button', { name: 'unarchive icon' });
    await unarchiveButton.click();
    await page.waitForURL('/');

    // Navigate back to the storynode by clicking on it
    await page.goto('/stories');
    await page.click(`.draggable[id="${storynode.id}"] h3.clickable`);
    await page.waitForURL(/\/storydetail/);

    // Verify content is still preserved after unarchiving
    await expect(editor).toContainText('This is my story content that should be preserved.');
  });

  test('should navigate between stories and archive pages', async ({ page }) => {
    // Create two storynodes - one active, one archived
    const activeStory = await createStorynode(page, 'Active Story', 'root');
    const archivedStory = await createStorynode(page, 'Archived Story', 'root');

    // Archive the second storynode by clicking on it
    await page.click(`.draggable[id="${archivedStory.id}"] h3.clickable`);
    await page.waitForURL(/\/storydetail/);
    const archiveButton = page.getByRole('button', { name: 'archive icon' });
    await archiveButton.click();
    await page.waitForURL('/');

    // Navigate to stories page
    await page.goto('/stories');
    await page.waitForURL('/stories');

    // Verify active story is visible and archived story is not
    const activeStoryElement = page.locator(`.draggable[id="${activeStory.id}"]`);
    await expect(activeStoryElement).toBeVisible();
    await expect(activeStoryElement).toContainText('Active Story');

    const archivedStoryElement = page.locator(`.draggable[id="${archivedStory.id}"]`);
    await expect(archivedStoryElement).not.toBeVisible();

    // Navigate to archive page
    await page.goto('/archive');
    await page.waitForURL('/archive');

    // Verify archived story is visible and active story is not
    await expect(archivedStoryElement).toBeVisible();
    await expect(archivedStoryElement).toContainText('Archived Story');
    await expect(activeStoryElement).not.toBeVisible();

    // Navigate back to stories page
    await page.goto('/stories');
    await page.waitForURL('/stories');

    // Verify we're back on stories page with correct content
    await expect(activeStoryElement).toBeVisible();
    await expect(archivedStoryElement).not.toBeVisible();
  });

});
