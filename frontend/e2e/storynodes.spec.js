import { test, expect } from '@playwright/test';
import { setupAuthenticatedUser, createStorynode, createStorynodeTree, waitForApiResponse } from './helpers.js';

/**
 * Storynode CRUD E2E Tests
 *
 * Tests cover complete storynode lifecycle including:
 * - Creating root, branch, and leaf storynodes
 * - Updating storynode text and properties
 * - Word count tracking and validation
 * - Completing/uncompleting storynodes
 * - Navigating storynode tree structures
 * - Deleting storynodes and cascade deletion
 * - Archive functionality
 */

test.describe('Storynode CRUD Operations', () => {
  test.beforeEach(async ({ page }) => {
    // TODO: Setup authenticated user for each test
    await setupAuthenticatedUser(page);

    // TODO: Navigate to stories page
    // await page.goto('/stories');
  });

  test('should create a root storynode', async ({ page }) => {
    // TODO: Verify stories page is loaded
    // await expect(page.locator('[data-testid="stories-page"]')).toBeVisible();

    // TODO: Click add storynode button
    // await page.click('[data-testid="add-storynode-button"]');

    // TODO: Verify storynode creation modal/form appears
    // await expect(page.locator('[data-testid="storynode-form"]')).toBeVisible();

    // TODO: Select root type
    // await page.selectOption('[name="type"]', 'root');

    // TODO: Fill storynode name
    const storynodeName = 'My First Novel';
    // await page.fill('[name="name"]', storynodeName);

    // TODO: Fill word weight
    // await page.fill('[name="wordWeight"]', '100');

    // TODO: Submit form
    // await page.click('button[type="submit"]');

    // TODO: Wait for API response
    // const response = await waitForApiResponse(page, '/storynode');
    // expect(response.name).toBe(storynodeName);
    // expect(response.type).toBe('root');
    // expect(response.isComplete).toBe(false);

    // TODO: Verify storynode appears in stories list
    // await expect(page.locator(`[data-storynode-name="${storynodeName}"]`)).toBeVisible();

    // TODO: Verify initial word count is 0
    // await expect(page.locator(`[data-storynode-id="${response.id}"] [data-testid="word-count"]`))
    //   .toContainText('0');
  });

  test('should create a branch storynode as child of root', async ({ page }) => {
    // TODO: First create a root storynode
    const rootName = 'My Novel';
    // const root = await createStorynode(page, rootName, 'root');

    // TODO: Click add child button on root storynode
    // await page.click(`[data-storynode-id="${root.id}"] [data-testid="add-child-button"]`);

    // TODO: Select branch type
    // await page.selectOption('[name="type"]', 'branch');

    // TODO: Fill storynode name
    const branchName = 'Chapter 1';
    // await page.fill('[name="name"]', branchName);

    // TODO: Fill word weight
    // await page.fill('[name="wordWeight"]', '10');

    // TODO: Submit form
    // await page.click('button[type="submit"]');

    // TODO: Wait for API response
    // const response = await waitForApiResponse(page, '/storynode');
    // expect(response.parent).toBe(root.id);

    // TODO: Verify branch storynode appears as child of root
    // await expect(page.locator(`[data-parent-id="${root.id}"] [data-storynode-name="${branchName}"]`))
    //   .toBeVisible();
  });

  test('should create a leaf storynode as child of branch', async ({ page }) => {
    // TODO: Create storynode tree (root → branch)
    // const root = await createStorynode(page, 'My Novel', 'root');
    // const branch = await createStorynode(page, 'Chapter 1', 'branch', root.id);

    // TODO: Click add child button on branch storynode
    // await page.click(`[data-storynode-id="${branch.id}"] [data-testid="add-child-button"]`);

    // TODO: Select leaf type
    // await page.selectOption('[name="type"]', 'leaf');

    // TODO: Fill storynode name
    const leafName = 'Opening Scene';
    // await page.fill('[name="name"]', leafName);

    // TODO: Fill word weight
    // await page.fill('[name="wordWeight"]', '1');

    // TODO: Submit form
    // await page.click('button[type="submit"]');

    // TODO: Verify leaf storynode appears as child of branch
    // await expect(page.locator(`[data-parent-id="${branch.id}"] [data-storynode-name="${leafName}"]`))
    //   .toBeVisible();
  });

  test('should update storynode text and track word count', async ({ page }) => {
    // TODO: Create a leaf storynode
    const storynodeName = 'Test Scene';
    // const storynode = await createStorynode(page, storynodeName, 'leaf');

    // TODO: Click on storynode to navigate to detail view
    // await page.click(`[data-storynode-id="${storynode.id}"]`);

    // TODO: Wait for navigation to storynode detail page
    // await page.waitForURL(`/storynode/${storynode.id}`);

    // TODO: Verify markdown editor is present
    // await expect(page.locator('[data-testid="markdown-editor"]')).toBeVisible();

    // TODO: Type text into markdown editor
    const testText = 'This is a test sentence with exactly ten words here.';
    const expectedWordCount = 10;
    // await page.fill('[data-testid="markdown-editor"]', testText);

    // TODO: Wait for auto-save or manually save
    // await page.waitForTimeout(1000); // Wait for debounce
    // OR
    // await page.click('[data-testid="save-button"]');

    // TODO: Wait for API response with updated word count
    // const response = await waitForApiResponse(page, '/storynode');
    // expect(response.wordCount).toBe(expectedWordCount);

    // TODO: Verify word count is displayed in UI
    // await expect(page.locator('[data-testid="word-count"]'))
    //   .toContainText(expectedWordCount.toString());

    // TODO: Add more text and verify word count updates
    const additionalText = ' Five more words added.';
    // await page.fill('[data-testid="markdown-editor"]', testText + additionalText);
    // await page.waitForTimeout(1000); // Wait for debounce

    // TODO: Verify updated word count
    // await expect(page.locator('[data-testid="word-count"]'))
    //   .toContainText('13'); // 10 + 3 new words
  });

  test('should propagate word count changes to parent storynodes', async ({ page }) => {
    // TODO: Create storynode tree (root → branch → leaf)
    const storynodes = await createStorynodeTree(page, {
      rootName: 'Novel',
      branchName: 'Chapter 1',
      leafName: 'Scene 1',
    });

    // TODO: Navigate to leaf storynode detail page
    // await page.goto(`/storynode/${storynodes.leaf.id}`);

    // TODO: Add text with known word count
    const testText = 'This text has exactly five words.'; // 6 words
    // await page.fill('[data-testid="markdown-editor"]', testText);
    // await page.waitForTimeout(1000);

    // TODO: Navigate back to stories page
    // await page.goto('/stories');

    // TODO: Verify leaf word count is updated
    // await expect(page.locator(`[data-storynode-id="${storynodes.leaf.id}"] [data-testid="word-count"]`))
    //   .toContainText('6');

    // TODO: Verify branch word count includes leaf count
    // await expect(page.locator(`[data-storynode-id="${storynodes.branch.id}"] [data-testid="word-count"]`))
    //   .toContainText('6');

    // TODO: Verify root word count includes all descendants
    // await expect(page.locator(`[data-storynode-id="${storynodes.root.id}"] [data-testid="word-count"]`))
    //   .toContainText('6');
  });

  test('should mark storynode as complete', async ({ page }) => {
    // TODO: Create a storynode
    const storynodeName = 'Test Storynode';
    // const storynode = await createStorynode(page, storynodeName, 'leaf');

    // TODO: Verify storynode is initially not complete
    // await expect(page.locator(`[data-storynode-id="${storynode.id}"]`))
    //   .not.toHaveClass(/complete/);

    // TODO: Click complete button/checkbox
    // await page.click(`[data-storynode-id="${storynode.id}"] [data-testid="complete-button"]`);

    // TODO: Wait for API response
    // const response = await waitForApiResponse(page, '/storynode');
    // expect(response.isComplete).toBe(true);

    // TODO: Verify visual indication of completion (checkmark, different color, etc.)
    // await expect(page.locator(`[data-storynode-id="${storynode.id}"]`))
    //   .toHaveClass(/complete/);

    // TODO: Verify completion indicator is visible
    // await expect(page.locator(`[data-storynode-id="${storynode.id}"] [data-testid="complete-indicator"]`))
    //   .toBeVisible();
  });

  test('should uncomplete a completed storynode', async ({ page }) => {
    // TODO: Create a storynode and mark it complete
    const storynodeName = 'Completed Storynode';
    // const storynode = await createStorynode(page, storynodeName, 'leaf');
    // await page.click(`[data-storynode-id="${storynode.id}"] [data-testid="complete-button"]`);
    // await waitForApiResponse(page, '/storynode');

    // TODO: Verify storynode is marked complete
    // await expect(page.locator(`[data-storynode-id="${storynode.id}"]`))
    //   .toHaveClass(/complete/);

    // TODO: Click complete button again to uncomplete
    // await page.click(`[data-storynode-id="${storynode.id}"] [data-testid="complete-button"]`);

    // TODO: Wait for API response
    // const response = await waitForApiResponse(page, '/storynode');
    // expect(response.isComplete).toBe(false);

    // TODO: Verify completion indicator is removed
    // await expect(page.locator(`[data-storynode-id="${storynode.id}"]`))
    //   .not.toHaveClass(/complete/);
  });

  test('should delete a leaf storynode without affecting parent', async ({ page }) => {
    // TODO: Create storynode tree (root → branch → leaf)
    const storynodes = await createStorynodeTree(page, {
      rootName: 'Novel',
      branchName: 'Chapter 1',
      leafName: 'Scene 1',
    });

    // TODO: Click delete button on leaf storynode
    // await page.click(`[data-storynode-id="${storynodes.leaf.id}"] [data-testid="delete-button"]`);

    // TODO: Verify delete confirmation modal appears
    // await expect(page.locator('[data-testid="delete-confirmation"]')).toBeVisible();

    // TODO: Confirm deletion
    // await page.click('[data-testid="confirm-delete-button"]');

    // TODO: Wait for API response
    // await waitForApiResponse(page, `/storynode/${storynodes.leaf.id}`);

    // TODO: Verify leaf storynode is removed from list
    // await expect(page.locator(`[data-storynode-name="${storynodes.leaf.name}"]`))
    //   .not.toBeVisible();

    // TODO: Verify parent branch storynode still exists
    // await expect(page.locator(`[data-storynode-name="${storynodes.branch.name}"]`))
    //   .toBeVisible();

    // TODO: Verify root storynode still exists
    // await expect(page.locator(`[data-storynode-name="${storynodes.root.name}"]`))
    //   .toBeVisible();
  });

  test('should cascade delete all children when deleting parent storynode', async ({ page }) => {
    // TODO: Create storynode tree (root → branch → leaf)
    const storynodes = await createStorynodeTree(page, {
      rootName: 'Novel',
      branchName: 'Chapter 1',
      leafName: 'Scene 1',
    });

    // TODO: Click delete button on root storynode
    // await page.click(`[data-storynode-id="${storynodes.root.id}"] [data-testid="delete-button"]`);

    // TODO: Verify delete confirmation modal shows warning about cascade deletion
    // await expect(page.locator('[data-testid="delete-confirmation"]'))
    //   .toContainText('This will delete all children');

    // TODO: Confirm deletion
    // await page.click('[data-testid="confirm-delete-button"]');

    // TODO: Wait for API response
    // await waitForApiResponse(page, `/storynode/${storynodes.root.id}`);

    // TODO: Verify all storynodes (root, branch, leaf) are removed from list
    // await expect(page.locator(`[data-storynode-name="${storynodes.root.name}"]`))
    //   .not.toBeVisible();
    // await expect(page.locator(`[data-storynode-name="${storynodes.branch.name}"]`))
    //   .not.toBeVisible();
    // await expect(page.locator(`[data-storynode-name="${storynodes.leaf.name}"]`))
    //   .not.toBeVisible();
  });

  test('should navigate to storynode detail view and edit text', async ({ page }) => {
    // TODO: Create a storynode
    const storynodeName = 'My Scene';
    // const storynode = await createStorynode(page, storynodeName, 'leaf');

    // TODO: Click on storynode to navigate to detail view
    // await page.click(`[data-storynode-id="${storynode.id}"]`);

    // TODO: Wait for navigation to storynode detail page
    // await page.waitForURL(`/storynode/${storynode.id}`);

    // TODO: Verify storynode detail page is displayed
    // await expect(page.locator('[data-testid="storynode-detail-page"]')).toBeVisible();

    // TODO: Verify storynode name is displayed
    // await expect(page.locator('h1')).toContainText(storynodeName);

    // TODO: Verify markdown editor is present
    // await expect(page.locator('[data-testid="markdown-editor"]')).toBeVisible();

    // TODO: Type text into editor
    const testText = 'Once upon a time, in a land far away...';
    // await page.fill('[data-testid="markdown-editor"]', testText);

    // TODO: Wait for auto-save
    // await page.waitForTimeout(1000);

    // TODO: Reload page to verify text was saved
    // await page.reload();
    // await expect(page.locator('[data-testid="markdown-editor"]'))
    //   .toHaveValue(testText);
  });

  test('should display word limit and progress indicator', async ({ page }) => {
    // TODO: Create a storynode with word limit
    const storynodeName = 'Limited Scene';
    // const storynode = await createStorynode(page, storynodeName, 'leaf');

    // TODO: Set word limit via API or UI
    // This might require navigating to detail page and setting limit
    const wordLimit = 100;
    // await page.goto(`/storynode/${storynode.id}`);
    // await page.fill('[name="wordLimit"]', wordLimit.toString());
    // await page.click('[data-testid="save-settings"]');

    // TODO: Add text that's under the limit
    const textUnderLimit = 'This is a short sentence.'; // 5 words
    // await page.fill('[data-testid="markdown-editor"]', textUnderLimit);
    // await page.waitForTimeout(1000);

    // TODO: Verify word count is displayed
    // await expect(page.locator('[data-testid="word-count"]'))
    //   .toContainText('5 / 100');

    // TODO: Verify progress bar shows correct percentage
    // await expect(page.locator('[data-testid="word-progress"]'))
    //   .toHaveAttribute('aria-valuenow', '5');

    // TODO: Add text that exceeds the limit
    // Create text with >100 words
    const longText = 'word '.repeat(101).trim();
    // await page.fill('[data-testid="markdown-editor"]', longText);
    // await page.waitForTimeout(1000);

    // TODO: Verify warning/error indicator for exceeding limit
    // await expect(page.locator('[data-testid="word-limit-warning"]'))
    //   .toBeVisible();
    // await expect(page.locator('[data-testid="word-limit-warning"]'))
    //   .toContainText('exceeds limit');
  });

  test('should filter storynodes by completion status', async ({ page }) => {
    // TODO: Create multiple storynodes with different completion states
    // const incomplete = await createStorynode(page, 'Incomplete Story', 'root');
    // const complete = await createStorynode(page, 'Complete Story', 'root');
    // await page.click(`[data-storynode-id="${complete.id}"] [data-testid="complete-button"]`);
    // await waitForApiResponse(page, '/storynode');

    // TODO: Apply filter for completed storynodes only
    // await page.click('[data-testid="filter-button"]');
    // await page.check('[data-filter="completed"]');
    // await page.click('[data-testid="apply-filter"]');

    // TODO: Verify only completed storynodes are displayed
    // await expect(page.locator(`[data-storynode-name="${complete.name}"]`))
    //   .toBeVisible();
    // await expect(page.locator(`[data-storynode-name="${incomplete.name}"]`))
    //   .not.toBeVisible();

    // TODO: Clear filter and verify all storynodes appear
    // await page.click('[data-testid="clear-filter"]');
    // await expect(page.locator(`[data-storynode-name="${complete.name}"]`))
    //   .toBeVisible();
    // await expect(page.locator(`[data-storynode-name="${incomplete.name}"]`))
    //   .toBeVisible();
  });

  test('should search storynodes by name', async ({ page }) => {
    // TODO: Create multiple storynodes
    // await createStorynode(page, 'The Great Adventure', 'root');
    // await createStorynode(page, 'Mystery at Midnight', 'root');
    // await createStorynode(page, 'Romance Novel', 'root');

    // TODO: Enter search query
    // await page.fill('[data-testid="search-input"]', 'Adventure');

    // TODO: Verify only matching storynodes are displayed
    // await expect(page.locator('[data-storynode-name="The Great Adventure"]'))
    //   .toBeVisible();
    // await expect(page.locator('[data-storynode-name="Mystery at Midnight"]'))
    //   .not.toBeVisible();
    // await expect(page.locator('[data-storynode-name="Romance Novel"]'))
    //   .not.toBeVisible();

    // TODO: Clear search and verify all storynodes appear
    // await page.fill('[data-testid="search-input"]', '');
    // await expect(page.locator('[data-storynode-name="The Great Adventure"]'))
    //   .toBeVisible();
    // await expect(page.locator('[data-storynode-name="Mystery at Midnight"]'))
    //   .toBeVisible();
  });

  test('should display empty state when no storynodes exist', async ({ page }) => {
    // TODO: Verify stories page is loaded with no storynodes
    // await expect(page.locator('[data-testid="stories-page"]')).toBeVisible();

    // TODO: Verify empty state message is displayed
    // await expect(page.locator('[data-testid="no-storynodes-message"]'))
    //   .toBeVisible();
    // await expect(page.locator('[data-testid="no-storynodes-message"]'))
    //   .toContainText('No stories yet');

    // TODO: Verify call-to-action to create first storynode
    // await expect(page.locator('[data-testid="create-first-storynode"]'))
    //   .toBeVisible();
  });

  test('should show validation errors for invalid storynode data', async ({ page }) => {
    // TODO: Click add storynode button
    // await page.click('[data-testid="add-storynode-button"]');

    // Test Case 1: Empty name
    // TODO: Submit form with empty name
    // await page.selectOption('[name="type"]', 'root');
    // await page.click('button[type="submit"]');
    // TODO: Verify error message for required name
    // await expect(page.locator('[data-testid="name-error"]'))
    //   .toContainText('Name is required');

    // Test Case 2: Invalid word weight
    // TODO: Fill form with invalid word weight
    // await page.fill('[name="name"]', 'Test Storynode');
    // await page.fill('[name="wordWeight"]', '0');
    // await page.click('button[type="submit"]');
    // TODO: Verify error message
    // await expect(page.locator('[data-testid="wordWeight-error"]'))
    //   .toContainText('must be positive');
  });
});
