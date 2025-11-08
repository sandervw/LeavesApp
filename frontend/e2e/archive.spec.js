import { test, expect } from '@playwright/test';
import { setupAuthenticatedUser, createStorynode, createStorynodeTree, waitForApiResponse } from './helpers.js';

/**
 * Archive E2E Tests
 *
 * Tests cover archive functionality including:
 * - Archiving storynodes
 * - Viewing archived storynodes
 * - Unarchiving storynodes
 * - Filtering archived vs active storynodes
 * - Archive persistence
 * - Cascade archiving with tree structures
 */

test.describe('Archive Operations', () => {
  test.beforeEach(async ({ page }) => {
    // TODO: Setup authenticated user for each test
    await setupAuthenticatedUser(page);

    // TODO: Navigate to stories page
    // await page.goto('/stories');
  });

  test('should archive a storynode from stories page', async ({ page }) => {
    // TODO: Create a storynode
    const storynodeName = 'Story to Archive';
    // const storynode = await createStorynode(page, storynodeName, 'root');

    // TODO: Verify storynode appears in stories list
    // await expect(page.locator(`[data-storynode-name="${storynodeName}"]`))
    //   .toBeVisible();

    // TODO: Click archive button on storynode
    // await page.click(`[data-storynode-id="${storynode.id}"] [data-testid="archive-button"]`);

    // TODO: Wait for API response
    // const response = await waitForApiResponse(page, '/storynode');
    // expect(response.archived).toBe(true);

    // TODO: Verify storynode is removed from stories list
    // await expect(page.locator(`[data-storynode-name="${storynodeName}"]`))
    //   .not.toBeVisible();

    // TODO: Navigate to archive page
    // await page.goto('/archive');

    // TODO: Verify storynode appears in archive list
    // await expect(page.locator(`[data-storynode-name="${storynodeName}"]`))
    //   .toBeVisible();
  });

  test('should archive storynode from detail page', async ({ page }) => {
    // TODO: Create a storynode
    const storynodeName = 'Detail Archive Test';
    // const storynode = await createStorynode(page, storynodeName, 'root');

    // TODO: Navigate to storynode detail page
    // await page.goto(`/storynode/${storynode.id}`);

    // TODO: Verify detail page is displayed
    // await expect(page.locator('[data-testid="storynode-detail-page"]'))
    //   .toBeVisible();

    // TODO: Click archive button
    // await page.click('[data-testid="archive-button"]');

    // TODO: Wait for API response
    // const response = await waitForApiResponse(page, '/storynode');
    // expect(response.archived).toBe(true);

    // TODO: Verify redirect to stories page (or archive page)
    // await page.waitForURL('/stories');
    // OR
    // await page.waitForURL('/archive');

    // TODO: Verify storynode is archived
    // await page.goto('/archive');
    // await expect(page.locator(`[data-storynode-name="${storynodeName}"]`))
    //   .toBeVisible();
  });

  test('should unarchive a storynode and return it to stories', async ({ page }) => {
    // TODO: Create and archive a storynode
    const storynodeName = 'Story to Unarchive';
    // const storynode = await createStorynode(page, storynodeName, 'root');
    // await page.click(`[data-storynode-id="${storynode.id}"] [data-testid="archive-button"]`);
    // await waitForApiResponse(page, '/storynode');

    // TODO: Navigate to archive page
    // await page.goto('/archive');

    // TODO: Verify storynode is in archive
    // await expect(page.locator(`[data-storynode-name="${storynodeName}"]`))
    //   .toBeVisible();

    // TODO: Click unarchive button
    // await page.click(`[data-storynode-id="${storynode.id}"] [data-testid="unarchive-button"]`);

    // TODO: Wait for API response
    // const response = await waitForApiResponse(page, '/storynode');
    // expect(response.archived).toBe(false);

    // TODO: Verify storynode is removed from archive list
    // await expect(page.locator(`[data-storynode-name="${storynodeName}"]`))
    //   .not.toBeVisible();

    // TODO: Navigate to stories page
    // await page.goto('/stories');

    // TODO: Verify storynode appears in stories list
    // await expect(page.locator(`[data-storynode-name="${storynodeName}"]`))
    //   .toBeVisible();
  });

  test('should archive entire storynode tree (parent and children)', async ({ page }) => {
    // TODO: Create storynode tree (root → branch → leaf)
    const storynodes = await createStorynodeTree(page, {
      rootName: 'Novel',
      branchName: 'Chapter 1',
      leafName: 'Scene 1',
    });

    // TODO: Archive root storynode
    // await page.click(`[data-storynode-id="${storynodes.root.id}"] [data-testid="archive-button"]`);

    // TODO: Wait for API response
    // const response = await waitForApiResponse(page, '/storynode');
    // expect(response.archived).toBe(true);

    // TODO: Verify all storynodes (root, branch, leaf) are removed from stories
    // await expect(page.locator(`[data-storynode-name="${storynodes.root.name}"]`))
    //   .not.toBeVisible();
    // await expect(page.locator(`[data-storynode-name="${storynodes.branch.name}"]`))
    //   .not.toBeVisible();
    // await expect(page.locator(`[data-storynode-name="${storynodes.leaf.name}"]`))
    //   .not.toBeVisible();

    // TODO: Navigate to archive page
    // await page.goto('/archive');

    // TODO: Verify entire tree appears in archive
    // await expect(page.locator(`[data-storynode-name="${storynodes.root.name}"]`))
    //   .toBeVisible();
    // await expect(page.locator(`[data-storynode-name="${storynodes.branch.name}"]`))
    //   .toBeVisible();
    // await expect(page.locator(`[data-storynode-name="${storynodes.leaf.name}"]`))
    //   .toBeVisible();

    // TODO: Verify tree structure is maintained in archive
    // const branch = page.locator(`[data-storynode-name="${storynodes.branch.name}"]`);
    // await expect(branch).toHaveAttribute('data-parent-id', storynodes.root.id);
  });

  test('should unarchive entire tree when unarchiving parent', async ({ page }) => {
    // TODO: Create and archive storynode tree
    const storynodes = await createStorynodeTree(page, {
      rootName: 'Novel',
      branchName: 'Chapter 1',
      leafName: 'Scene 1',
    });

    // TODO: Archive the entire tree
    // await page.click(`[data-storynode-id="${storynodes.root.id}"] [data-testid="archive-button"]`);
    // await waitForApiResponse(page, '/storynode');

    // TODO: Navigate to archive page
    // await page.goto('/archive');

    // TODO: Unarchive root storynode
    // await page.click(`[data-storynode-id="${storynodes.root.id}"] [data-testid="unarchive-button"]`);

    // TODO: Wait for API response
    // await waitForApiResponse(page, '/storynode');

    // TODO: Verify entire tree is removed from archive
    // await expect(page.locator(`[data-storynode-name="${storynodes.root.name}"]`))
    //   .not.toBeVisible();
    // await expect(page.locator(`[data-storynode-name="${storynodes.branch.name}"]`))
    //   .not.toBeVisible();
    // await expect(page.locator(`[data-storynode-name="${storynodes.leaf.name}"]`))
    //   .not.toBeVisible();

    // TODO: Navigate to stories page
    // await page.goto('/stories');

    // TODO: Verify entire tree appears in stories with structure intact
    // await expect(page.locator(`[data-storynode-name="${storynodes.root.name}"]`))
    //   .toBeVisible();
    // await expect(page.locator(`[data-storynode-name="${storynodes.branch.name}"]`))
    //   .toBeVisible();
    // await expect(page.locator(`[data-storynode-name="${storynodes.leaf.name}"]`))
    //   .toBeVisible();
  });

  test('should display empty state when archive is empty', async ({ page }) => {
    // TODO: Navigate to archive page with no archived storynodes
    // await page.goto('/archive');

    // TODO: Verify empty state message is displayed
    // await expect(page.locator('[data-testid="no-archived-storynodes"]'))
    //   .toBeVisible();
    // await expect(page.locator('[data-testid="no-archived-storynodes"]'))
    //   .toContainText('No archived stories');

    // TODO: Verify helpful message about archiving
    // await expect(page.locator('[data-testid="archive-help-text"]'))
    //   .toContainText('Archive stories to keep your workspace organized');
  });

  test('should preserve storynode content when archiving/unarchiving', async ({ page }) => {
    // TODO: Create a storynode with text content
    const storynodeName = 'Story with Content';
    // const storynode = await createStorynode(page, storynodeName, 'leaf');

    // TODO: Add text to storynode
    // await page.goto(`/storynode/${storynode.id}`);
    const testText = 'This is important story content that should be preserved.';
    // await page.fill('[data-testid="markdown-editor"]', testText);
    // await page.waitForTimeout(1000); // Wait for auto-save

    // TODO: Archive the storynode
    // await page.click('[data-testid="archive-button"]');
    // await waitForApiResponse(page, '/storynode');

    // TODO: Navigate to archive and open archived storynode
    // await page.goto('/archive');
    // await page.click(`[data-storynode-name="${storynodeName}"]`);

    // TODO: Verify content is preserved in archived state
    // await expect(page.locator('[data-testid="markdown-editor"]'))
    //   .toHaveValue(testText);

    // TODO: Unarchive the storynode
    // await page.click('[data-testid="unarchive-button"]');
    // await waitForApiResponse(page, '/storynode');

    // TODO: Navigate to stories and open storynode
    // await page.goto('/stories');
    // await page.click(`[data-storynode-name="${storynodeName}"]`);

    // TODO: Verify content is still preserved after unarchiving
    // await expect(page.locator('[data-testid="markdown-editor"]'))
    //   .toHaveValue(testText);
  });

  test('should show archived storynodes count in archive page header', async ({ page }) => {
    // TODO: Create multiple storynodes
    // const storynode1 = await createStorynode(page, 'Story 1', 'root');
    // const storynode2 = await createStorynode(page, 'Story 2', 'root');
    // const storynode3 = await createStorynode(page, 'Story 3', 'root');

    // TODO: Archive two storynodes
    // await page.click(`[data-storynode-id="${storynode1.id}"] [data-testid="archive-button"]`);
    // await waitForApiResponse(page, '/storynode');
    // await page.click(`[data-storynode-id="${storynode2.id}"] [data-testid="archive-button"]`);
    // await waitForApiResponse(page, '/storynode');

    // TODO: Navigate to archive page
    // await page.goto('/archive');

    // TODO: Verify count shows 2 archived storynodes
    // await expect(page.locator('[data-testid="archive-count"]'))
    //   .toContainText('2');

    // TODO: Unarchive one storynode
    // await page.click(`[data-storynode-id="${storynode1.id}"] [data-testid="unarchive-button"]`);
    // await waitForApiResponse(page, '/storynode');

    // TODO: Verify count updates to 1
    // await expect(page.locator('[data-testid="archive-count"]'))
    //   .toContainText('1');
  });

  test('should filter archived storynodes by name', async ({ page }) => {
    // TODO: Create and archive multiple storynodes
    // const storynode1 = await createStorynode(page, 'Novel Project', 'root');
    // const storynode2 = await createStorynode(page, 'Short Story', 'root');
    // const storynode3 = await createStorynode(page, 'Novel Draft', 'root');

    // TODO: Archive all storynodes
    // await page.click(`[data-storynode-id="${storynode1.id}"] [data-testid="archive-button"]`);
    // await waitForApiResponse(page, '/storynode');
    // await page.click(`[data-storynode-id="${storynode2.id}"] [data-testid="archive-button"]`);
    // await waitForApiResponse(page, '/storynode');
    // await page.click(`[data-storynode-id="${storynode3.id}"] [data-testid="archive-button"]`);
    // await waitForApiResponse(page, '/storynode');

    // TODO: Navigate to archive page
    // await page.goto('/archive');

    // TODO: Enter search query
    // await page.fill('[data-testid="search-input"]', 'Novel');

    // TODO: Verify only matching archived storynodes are displayed
    // await expect(page.locator('[data-storynode-name="Novel Project"]'))
    //   .toBeVisible();
    // await expect(page.locator('[data-storynode-name="Novel Draft"]'))
    //   .toBeVisible();
    // await expect(page.locator('[data-storynode-name="Short Story"]'))
    //   .not.toBeVisible();

    // TODO: Clear search
    // await page.fill('[data-testid="search-input"]', '');

    // TODO: Verify all archived storynodes are displayed
    // await expect(page.locator('[data-storynode-name="Novel Project"]'))
    //   .toBeVisible();
    // await expect(page.locator('[data-storynode-name="Short Story"]'))
    //   .toBeVisible();
    // await expect(page.locator('[data-storynode-name="Novel Draft"]'))
    //   .toBeVisible();
  });

  test('should delete archived storynode permanently', async ({ page }) => {
    // TODO: Create and archive a storynode
    const storynodeName = 'Story to Delete';
    // const storynode = await createStorynode(page, storynodeName, 'root');
    // await page.click(`[data-storynode-id="${storynode.id}"] [data-testid="archive-button"]`);
    // await waitForApiResponse(page, '/storynode');

    // TODO: Navigate to archive page
    // await page.goto('/archive');

    // TODO: Verify storynode is in archive
    // await expect(page.locator(`[data-storynode-name="${storynodeName}"]`))
    //   .toBeVisible();

    // TODO: Click delete button on archived storynode
    // await page.click(`[data-storynode-id="${storynode.id}"] [data-testid="delete-button"]`);

    // TODO: Verify delete confirmation modal appears
    // await expect(page.locator('[data-testid="delete-confirmation"]'))
    //   .toBeVisible();
    // await expect(page.locator('[data-testid="delete-confirmation"]'))
    //   .toContainText('permanently delete');

    // TODO: Confirm deletion
    // await page.click('[data-testid="confirm-delete-button"]');

    // TODO: Wait for API response
    // await waitForApiResponse(page, `/storynode/${storynode.id}`);

    // TODO: Verify storynode is removed from archive
    // await expect(page.locator(`[data-storynode-name="${storynodeName}"]`))
    //   .not.toBeVisible();

    // TODO: Verify storynode does not appear in stories
    // await page.goto('/stories');
    // await expect(page.locator(`[data-storynode-name="${storynodeName}"]`))
    //   .not.toBeVisible();
  });

  test('should navigate between stories and archive pages', async ({ page }) => {
    // TODO: Start on stories page
    // await page.goto('/stories');

    // TODO: Verify stories page is active
    // await expect(page.locator('[data-testid="stories-page"]')).toBeVisible();

    // TODO: Click archive navigation link
    // await page.click('[data-testid="archive-nav-link"]');

    // TODO: Verify navigation to archive page
    // await page.waitForURL('/archive');
    // await expect(page.locator('[data-testid="archive-page"]')).toBeVisible();

    // TODO: Click stories navigation link
    // await page.click('[data-testid="stories-nav-link"]');

    // TODO: Verify navigation back to stories page
    // await page.waitForURL('/stories');
    // await expect(page.locator('[data-testid="stories-page"]')).toBeVisible();
  });

  test('should preserve archive state across page reloads', async ({ page }) => {
    // TODO: Create and archive a storynode
    const storynodeName = 'Persistent Archive';
    // const storynode = await createStorynode(page, storynodeName, 'root');
    // await page.click(`[data-storynode-id="${storynode.id}"] [data-testid="archive-button"]`);
    // await waitForApiResponse(page, '/storynode');

    // TODO: Navigate to archive page
    // await page.goto('/archive');

    // TODO: Verify storynode is archived
    // await expect(page.locator(`[data-storynode-name="${storynodeName}"]`))
    //   .toBeVisible();

    // TODO: Reload the page
    // await page.reload();

    // TODO: Verify storynode is still in archive after reload
    // await expect(page.locator(`[data-storynode-name="${storynodeName}"]`))
    //   .toBeVisible();

    // TODO: Navigate to stories page
    // await page.goto('/stories');

    // TODO: Verify storynode is not in stories
    // await expect(page.locator(`[data-storynode-name="${storynodeName}"]`))
    //   .not.toBeVisible();
  });

  test('should show archived indicator on storynode detail page', async ({ page }) => {
    // TODO: Create and archive a storynode
    const storynodeName = 'Archived Detail Test';
    // const storynode = await createStorynode(page, storynodeName, 'root');
    // await page.click(`[data-storynode-id="${storynode.id}"] [data-testid="archive-button"]`);
    // await waitForApiResponse(page, '/storynode');

    // TODO: Navigate to archived storynode detail page
    // await page.goto(`/storynode/${storynode.id}`);

    // TODO: Verify archived indicator/badge is visible
    // await expect(page.locator('[data-testid="archived-badge"]'))
    //   .toBeVisible();
    // await expect(page.locator('[data-testid="archived-badge"]'))
    //   .toContainText('Archived');

    // TODO: Verify unarchive button is visible on detail page
    // await expect(page.locator('[data-testid="unarchive-button"]'))
    //   .toBeVisible();
  });

  test('should bulk archive multiple storynodes', async ({ page }) => {
    // TODO: Create multiple storynodes
    // const storynode1 = await createStorynode(page, 'Story 1', 'root');
    // const storynode2 = await createStorynode(page, 'Story 2', 'root');
    // const storynode3 = await createStorynode(page, 'Story 3', 'root');

    // TODO: Select multiple storynodes (if bulk selection is supported)
    // await page.click(`[data-storynode-id="${storynode1.id}"] [data-testid="select-checkbox"]`);
    // await page.click(`[data-storynode-id="${storynode2.id}"] [data-testid="select-checkbox"]`);

    // TODO: Click bulk archive button
    // await page.click('[data-testid="bulk-archive-button"]');

    // TODO: Wait for API responses
    // await waitForApiResponse(page, '/storynode');

    // TODO: Verify selected storynodes are archived
    // await page.goto('/archive');
    // await expect(page.locator('[data-storynode-name="Story 1"]')).toBeVisible();
    // await expect(page.locator('[data-storynode-name="Story 2"]')).toBeVisible();

    // TODO: Verify unselected storynode remains in stories
    // await page.goto('/stories');
    // await expect(page.locator('[data-storynode-name="Story 3"]')).toBeVisible();

    // NOTE: This test assumes bulk operations are implemented
    // Remove or mark as skip if not applicable
  });
});
