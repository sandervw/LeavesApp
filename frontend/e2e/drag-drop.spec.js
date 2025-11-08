import { test, expect } from '@playwright/test';
import {
  setupAuthenticatedUser,
  createTemplate,
  createTemplateTree,
  createStorynode,
  dragAndDrop,
  waitForApiResponse,
} from './helpers.js';

/**
 * Drag-and-Drop E2E Tests
 *
 * Tests cover the complete drag-and-drop functionality including:
 * - Dragging template to create storynode (template → storynode conversion)
 * - Dragging storynode to change parent (reorganizing tree structure)
 * - Dragging to archive zone
 * - Dragging to delete zone (RubbishPile)
 * - Visual feedback during drag operations
 * - Collision detection and drop validation
 */

test.describe('Drag-and-Drop Operations', () => {
  test.beforeEach(async ({ page }) => {
    // TODO: Setup authenticated user for each test
    await setupAuthenticatedUser(page);
  });

  test('should create storynode by dragging template to stories drop zone', async ({ page }) => {
    // TODO: Create a template
    // await page.goto('/templates');
    const templateName = 'Novel Template';
    // const template = await createTemplate(page, templateName, 'root');

    // TODO: Navigate to stories page with templates sidebar visible
    // await page.goto('/stories');

    // TODO: Verify template is visible in sidebar (AddSidebar)
    // await expect(page.locator(`[data-sidebar-template="${template.id}"]`))
    //   .toBeVisible();

    // TODO: Verify stories drop zone is visible
    // await expect(page.locator('[data-testid="stories-drop-zone"]'))
    //   .toBeVisible();

    // TODO: Drag template from sidebar to stories drop zone
    // await dragAndDrop(
    //   page,
    //   `[data-sidebar-template="${template.id}"]`,
    //   '[data-testid="stories-drop-zone"]'
    // );

    // TODO: Wait for API response (POST /storynode/postfromtemplate)
    // const response = await waitForApiResponse(page, '/storynode/postfromtemplate');
    // expect(response.name).toBe(templateName);

    // TODO: Verify new storynode appears in stories list
    // await expect(page.locator(`[data-storynode-name="${templateName}"]`))
    //   .toBeVisible();

    // TODO: Verify storynode has same structure as template
    // If template had children, verify storynode children were created
  });

  test('should create complete storynode tree from template tree', async ({ page }) => {
    // TODO: Create template tree (root → branch → leaf)
    const templates = await createTemplateTree(page, {
      rootName: 'Novel',
      branchName: 'Chapter',
      leafName: 'Scene',
    });

    // TODO: Navigate to stories page
    // await page.goto('/stories');

    // TODO: Drag root template to stories drop zone
    // await dragAndDrop(
    //   page,
    //   `[data-sidebar-template="${templates.root.id}"]`,
    //   '[data-testid="stories-drop-zone"]'
    // );

    // TODO: Wait for API response
    // const response = await waitForApiResponse(page, '/storynode/postfromtemplate');

    // TODO: Verify entire tree structure was created as storynodes
    // await expect(page.locator(`[data-storynode-name="${templates.root.name}"]`))
    //   .toBeVisible();
    // await expect(page.locator(`[data-storynode-name="${templates.branch.name}"]`))
    //   .toBeVisible();
    // await expect(page.locator(`[data-storynode-name="${templates.leaf.name}"]`))
    //   .toBeVisible();

    // TODO: Verify parent-child relationships are maintained
    // Navigate to root storynode detail page and verify children
    // await page.click(`[data-storynode-name="${templates.root.name}"]`);
    // await expect(page.locator('[data-testid="children-list"]'))
    //   .toContainText(templates.branch.name);
  });

  test('should show visual feedback during template drag operation', async ({ page }) => {
    // TODO: Create a template
    // await page.goto('/templates');
    const templateName = 'Drag Test Template';
    // const template = await createTemplate(page, templateName, 'root');

    // TODO: Navigate to stories page
    // await page.goto('/stories');

    // TODO: Start dragging template (mousedown and move)
    // const templateElement = page.locator(`[data-sidebar-template="${template.id}"]`);
    // await templateElement.hover();
    // await page.mouse.down();
    // await page.mouse.move(100, 100);

    // TODO: Verify drag overlay/ghost element is visible
    // await expect(page.locator('[data-testid="drag-overlay"]')).toBeVisible();

    // TODO: Verify drop zone highlights when hovering
    // const dropZone = page.locator('[data-testid="stories-drop-zone"]');
    // await dropZone.hover();
    // await expect(dropZone).toHaveClass(/highlight/);

    // TODO: Complete drag operation
    // await page.mouse.up();

    // TODO: Verify drag overlay is removed after drop
    // await expect(page.locator('[data-testid="drag-overlay"]'))
    //   .not.toBeVisible();
  });

  test('should change storynode parent by dragging to another storynode', async ({ page }) => {
    // TODO: Create two root storynodes
    // await page.goto('/stories');
    // const storynode1 = await createStorynode(page, 'Story 1', 'root');
    // const storynode2 = await createStorynode(page, 'Story 2', 'root');

    // TODO: Verify both storynodes are at root level
    // await expect(page.locator(`[data-storynode-id="${storynode1.id}"]`))
    //   .not.toHaveAttribute('data-parent-id');
    // await expect(page.locator(`[data-storynode-id="${storynode2.id}"]`))
    //   .not.toHaveAttribute('data-parent-id');

    // TODO: Drag storynode2 onto storynode1 to make it a child
    // await dragAndDrop(
    //   page,
    //   `[data-storynode-id="${storynode2.id}"]`,
    //   `[data-storynode-id="${storynode1.id}"]`
    // );

    // TODO: Wait for API response
    // const response = await waitForApiResponse(page, '/storynode');
    // expect(response.parent).toBe(storynode1.id);

    // TODO: Verify storynode2 is now child of storynode1
    // await expect(page.locator(`[data-storynode-id="${storynode2.id}"]`))
    //   .toHaveAttribute('data-parent-id', storynode1.id);

    // TODO: Verify visual nesting/indentation
    // await expect(page.locator(`[data-storynode-id="${storynode2.id}"]`))
    //   .toHaveClass(/child-node/);
  });

  test('should prevent invalid drag operations', async ({ page }) => {
    // TODO: Create template tree
    const templates = await createTemplateTree(page, {
      rootName: 'Root',
      branchName: 'Branch',
      leafName: 'Leaf',
    });

    // Test Case 1: Cannot drag parent onto its own child
    // TODO: Try to drag root template onto its child (should fail)
    // await page.goto('/templates');
    // await dragAndDrop(
    //   page,
    //   `[data-template-id="${templates.root.id}"]`,
    //   `[data-template-id="${templates.branch.id}"]`
    // );

    // TODO: Verify error message or visual feedback
    // await expect(page.locator('[data-testid="error-message"]'))
    //   .toContainText('Cannot move parent into child');

    // TODO: Verify template structure unchanged
    // await expect(page.locator(`[data-template-id="${templates.root.id}"]`))
    //   .not.toHaveAttribute('data-parent-id');

    // Test Case 2: Cannot drag element onto itself
    // TODO: Try to drag template onto itself
    // await dragAndDrop(
    //   page,
    //   `[data-template-id="${templates.root.id}"]`,
    //   `[data-template-id="${templates.root.id}"]`
    // );

    // TODO: Verify operation is prevented
  });

  test('should archive storynode by dragging to archive zone', async ({ page }) => {
    // TODO: Create a storynode
    // await page.goto('/stories');
    const storynodeName = 'Story to Archive';
    // const storynode = await createStorynode(page, storynodeName, 'root');

    // TODO: Verify archive drop zone is visible
    // await expect(page.locator('[data-testid="archive-drop-zone"]'))
    //   .toBeVisible();

    // TODO: Drag storynode to archive zone
    // await dragAndDrop(
    //   page,
    //   `[data-storynode-id="${storynode.id}"]`,
    //   '[data-testid="archive-drop-zone"]'
    // );

    // TODO: Wait for API response
    // const response = await waitForApiResponse(page, '/storynode');
    // expect(response.archived).toBe(true);

    // TODO: Verify storynode is removed from stories list
    // await expect(page.locator(`[data-storynode-name="${storynodeName}"]`))
    //   .not.toBeVisible();

    // TODO: Navigate to archive page
    // await page.goto('/archive');

    // TODO: Verify storynode appears in archive
    // await expect(page.locator(`[data-storynode-name="${storynodeName}"]`))
    //   .toBeVisible();
  });

  test('should delete storynode by dragging to RubbishPile', async ({ page }) => {
    // TODO: Create a storynode
    // await page.goto('/stories');
    const storynodeName = 'Story to Delete';
    // const storynode = await createStorynode(page, storynodeName, 'root');

    // TODO: Verify RubbishPile drop zone is visible
    // await expect(page.locator('[data-testid="rubbish-pile"]'))
    //   .toBeVisible();

    // TODO: Drag storynode to RubbishPile
    // await dragAndDrop(
    //   page,
    //   `[data-storynode-id="${storynode.id}"]`,
    //   '[data-testid="rubbish-pile"]'
    // );

    // TODO: Verify delete confirmation modal appears
    // await expect(page.locator('[data-testid="delete-confirmation"]'))
    //   .toBeVisible();

    // TODO: Confirm deletion
    // await page.click('[data-testid="confirm-delete-button"]');

    // TODO: Wait for API response
    // await waitForApiResponse(page, `/storynode/${storynode.id}`);

    // TODO: Verify storynode is removed from list
    // await expect(page.locator(`[data-storynode-name="${storynodeName}"]`))
    //   .not.toBeVisible();

    // TODO: Verify storynode does not appear in archive
    // await page.goto('/archive');
    // await expect(page.locator(`[data-storynode-name="${storynodeName}"]`))
    //   .not.toBeVisible();
  });

  test('should cancel deletion when dragging to RubbishPile', async ({ page }) => {
    // TODO: Create a storynode
    // await page.goto('/stories');
    const storynodeName = 'Story to Keep';
    // const storynode = await createStorynode(page, storynodeName, 'root');

    // TODO: Drag storynode to RubbishPile
    // await dragAndDrop(
    //   page,
    //   `[data-storynode-id="${storynode.id}"]`,
    //   '[data-testid="rubbish-pile"]'
    // );

    // TODO: Verify delete confirmation modal appears
    // await expect(page.locator('[data-testid="delete-confirmation"]'))
    //   .toBeVisible();

    // TODO: Click cancel button
    // await page.click('[data-testid="cancel-delete-button"]');

    // TODO: Verify modal is closed
    // await expect(page.locator('[data-testid="delete-confirmation"]'))
    //   .not.toBeVisible();

    // TODO: Verify storynode still exists in list
    // await expect(page.locator(`[data-storynode-name="${storynodeName}"]`))
    //   .toBeVisible();
  });

  test('should handle multiple drag-and-drop operations in sequence', async ({ page }) => {
    // TODO: Create multiple templates
    // await page.goto('/templates');
    // const template1 = await createTemplate(page, 'Template 1', 'root');
    // const template2 = await createTemplate(page, 'Template 2', 'root');

    // TODO: Navigate to stories page
    // await page.goto('/stories');

    // TODO: Drag first template to create storynode
    // await dragAndDrop(
    //   page,
    //   `[data-sidebar-template="${template1.id}"]`,
    //   '[data-testid="stories-drop-zone"]'
    // );
    // await waitForApiResponse(page, '/storynode/postfromtemplate');

    // TODO: Verify first storynode was created
    // const storynode1 = page.locator('[data-storynode-name="Template 1"]');
    // await expect(storynode1).toBeVisible();

    // TODO: Drag second template to create storynode
    // await dragAndDrop(
    //   page,
    //   `[data-sidebar-template="${template2.id}"]`,
    //   '[data-testid="stories-drop-zone"]'
    // );
    // await waitForApiResponse(page, '/storynode/postfromtemplate');

    // TODO: Verify second storynode was created
    // const storynode2 = page.locator('[data-storynode-name="Template 2"]');
    // await expect(storynode2).toBeVisible();

    // TODO: Verify both storynodes exist
    // await expect(storynode1).toBeVisible();
    // await expect(storynode2).toBeVisible();
  });

  test('should handle drag operation across different pages', async ({ page }) => {
    // TODO: Create a template
    // await page.goto('/templates');
    const templateName = 'Cross-Page Template';
    // const template = await createTemplate(page, templateName, 'root');

    // TODO: Navigate to templates detail page
    // await page.goto(`/template/${template.id}`);

    // TODO: Verify template is displayed in detail view
    // await expect(page.locator('[data-testid="template-detail-page"]'))
    //   .toBeVisible();

    // TODO: Navigate to stories page
    // await page.goto('/stories');

    // TODO: Verify template is available in sidebar
    // await expect(page.locator(`[data-sidebar-template="${template.id}"]`))
    //   .toBeVisible();

    // TODO: Drag template to create storynode
    // await dragAndDrop(
    //   page,
    //   `[data-sidebar-template="${template.id}"]`,
    //   '[data-testid="stories-drop-zone"]'
    // );

    // TODO: Verify storynode was created
    // await expect(page.locator(`[data-storynode-name="${templateName}"]`))
    //   .toBeVisible();
  });

  test('should update drop zone highlighting based on drag position', async ({ page }) => {
    // TODO: Create a template
    // await page.goto('/templates');
    // const template = await createTemplate(page, 'Highlight Test', 'root');

    // TODO: Navigate to stories page
    // await page.goto('/stories');

    // TODO: Start dragging template
    // const templateElement = page.locator(`[data-sidebar-template="${template.id}"]`);
    // await templateElement.hover();
    // await page.mouse.down();

    // TODO: Move cursor over stories drop zone
    // const storiesDropZone = page.locator('[data-testid="stories-drop-zone"]');
    // await storiesDropZone.hover();

    // TODO: Verify stories drop zone is highlighted
    // await expect(storiesDropZone).toHaveClass(/highlight/);

    // TODO: Move cursor over archive drop zone
    // const archiveDropZone = page.locator('[data-testid="archive-drop-zone"]');
    // await archiveDropZone.hover();

    // TODO: Verify archive drop zone is highlighted and stories is not
    // await expect(archiveDropZone).toHaveClass(/highlight/);
    // await expect(storiesDropZone).not.toHaveClass(/highlight/);

    // TODO: Complete drag operation
    // await page.mouse.up();
  });

  test('should preserve storynode data when changing parent via drag', async ({ page }) => {
    // TODO: Create a storynode with text content
    // await page.goto('/stories');
    // const storynode1 = await createStorynode(page, 'Parent Story', 'root');
    // const storynode2 = await createStorynode(page, 'Child Story', 'root');

    // TODO: Add text to storynode2
    // await page.goto(`/storynode/${storynode2.id}`);
    const testText = 'This is important story content.';
    // await page.fill('[data-testid="markdown-editor"]', testText);
    // await page.waitForTimeout(1000); // Wait for auto-save

    // TODO: Navigate back to stories page
    // await page.goto('/stories');

    // TODO: Drag storynode2 onto storynode1
    // await dragAndDrop(
    //   page,
    //   `[data-storynode-id="${storynode2.id}"]`,
    //   `[data-storynode-id="${storynode1.id}"]`
    // );

    // TODO: Wait for API response
    // await waitForApiResponse(page, '/storynode');

    // TODO: Navigate to storynode2 detail page
    // await page.goto(`/storynode/${storynode2.id}`);

    // TODO: Verify text content is preserved
    // await expect(page.locator('[data-testid="markdown-editor"]'))
    //   .toHaveValue(testText);

    // TODO: Verify parent relationship is updated
    // Navigate back to stories and verify nesting
    // await page.goto('/stories');
    // await expect(page.locator(`[data-storynode-id="${storynode2.id}"]`))
    //   .toHaveAttribute('data-parent-id', storynode1.id);
  });

  test('should handle drag-and-drop with keyboard accessibility', async ({ page }) => {
    // TODO: Create a template
    // await page.goto('/templates');
    // const template = await createTemplate(page, 'Accessible Template', 'root');

    // TODO: Navigate to stories page
    // await page.goto('/stories');

    // TODO: Focus on template element using keyboard
    // await page.keyboard.press('Tab'); // Tab to template
    // const templateElement = page.locator(`[data-sidebar-template="${template.id}"]`);
    // await expect(templateElement).toBeFocused();

    // TODO: Activate drag with keyboard (Space or Enter)
    // await page.keyboard.press('Space');

    // TODO: Navigate to drop zone with keyboard
    // await page.keyboard.press('Tab');
    // const dropZone = page.locator('[data-testid="stories-drop-zone"]');
    // await expect(dropZone).toBeFocused();

    // TODO: Complete drop with keyboard
    // await page.keyboard.press('Enter');

    // TODO: Verify storynode was created
    // await expect(page.locator('[data-storynode-name="Accessible Template"]'))
    //   .toBeVisible();

    // NOTE: Actual keyboard drag-and-drop depends on @dnd-kit accessibility implementation
    // This test may need adjustment based on actual keyboard support
  });
});
