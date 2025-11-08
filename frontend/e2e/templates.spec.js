import { test, expect } from '@playwright/test';
import { setupAuthenticatedUser, createTemplate, createTemplateTree, waitForApiResponse } from './helpers.js';

/**
 * Template CRUD E2E Tests
 *
 * Tests cover complete template lifecycle including:
 * - Creating root, branch, and leaf templates
 * - Updating template properties
 * - Navigating template tree structures
 * - Deleting templates and cascade deletion
 * - Template validation and error handling
 */

test.describe('Template CRUD Operations', () => {
  test.beforeEach(async ({ page }) => {
    // TODO: Setup authenticated user for each test
    await setupAuthenticatedUser(page);

    // TODO: Navigate to templates page
    // await page.goto('/templates');
  });

  test('should create a root template', async ({ page }) => {
    // TODO: Verify templates page is loaded
    // await expect(page.locator('[data-testid="templates-page"]')).toBeVisible();

    // TODO: Click add template button
    // await page.click('[data-testid="add-template-button"]');

    // TODO: Verify template creation modal/form appears
    // await expect(page.locator('[data-testid="template-form"]')).toBeVisible();

    // TODO: Select root type
    // await page.selectOption('[name="type"]', 'root');

    // TODO: Fill template name
    const templateName = 'My Novel Structure';
    // await page.fill('[name="name"]', templateName);

    // TODO: Fill word weight
    // await page.fill('[name="wordWeight"]', '100');

    // TODO: Optionally fill text/description
    // await page.fill('[name="text"]', 'Root template for novel structure');

    // TODO: Submit form
    // await page.click('button[type="submit"]');

    // TODO: Wait for API response
    // const response = await waitForApiResponse(page, '/template');
    // expect(response.name).toBe(templateName);
    // expect(response.type).toBe('root');

    // TODO: Verify template appears in template list
    // await expect(page.locator(`[data-template-name="${templateName}"]`)).toBeVisible();

    // TODO: Verify template has correct type icon or indicator
    // await expect(page.locator(`[data-template-name="${templateName}"] [data-type="root"]`)).toBeVisible();
  });

  test('should create a branch template as child of root', async ({ page }) => {
    // TODO: First create a root template
    const rootName = 'Novel';
    // const root = await createTemplate(page, rootName, 'root');

    // TODO: Click add child button on root template
    // await page.click(`[data-template-id="${root.id}"] [data-testid="add-child-button"]`);

    // TODO: Verify template creation form appears
    // await expect(page.locator('[data-testid="template-form"]')).toBeVisible();

    // TODO: Select branch type
    // await page.selectOption('[name="type"]', 'branch');

    // TODO: Fill template name
    const branchName = 'Chapter';
    // await page.fill('[name="name"]', branchName);

    // TODO: Fill word weight
    // await page.fill('[name="wordWeight"]', '10');

    // TODO: Submit form
    // await page.click('button[type="submit"]');

    // TODO: Wait for API response
    // const response = await waitForApiResponse(page, '/template');
    // expect(response.parent).toBe(root.id);

    // TODO: Verify branch template appears as child of root
    // await expect(page.locator(`[data-parent-id="${root.id}"] [data-template-name="${branchName}"]`)).toBeVisible();

    // TODO: Verify tree structure is displayed correctly (indentation, nesting)
    // const branchElement = page.locator(`[data-template-name="${branchName}"]`);
    // await expect(branchElement).toHaveClass(/child-template/);
  });

  test('should create a leaf template as child of branch', async ({ page }) => {
    // TODO: Create template tree (root → branch)
    // const root = await createTemplate(page, 'Novel', 'root');
    // const branch = await createTemplate(page, 'Chapter', 'branch', root.id);

    // TODO: Click add child button on branch template
    // await page.click(`[data-template-id="${branch.id}"] [data-testid="add-child-button"]`);

    // TODO: Select leaf type
    // await page.selectOption('[name="type"]', 'leaf');

    // TODO: Fill template name
    const leafName = 'Scene';
    // await page.fill('[name="name"]', leafName);

    // TODO: Fill word weight
    // await page.fill('[name="wordWeight"]', '1');

    // TODO: Submit form
    // await page.click('button[type="submit"]');

    // TODO: Verify leaf template appears as child of branch
    // await expect(page.locator(`[data-parent-id="${branch.id}"] [data-template-name="${leafName}"]`)).toBeVisible();

    // TODO: Verify complete tree structure (root → branch → leaf)
    // Verify all three levels are visible and properly nested
  });

  test('should update template name and properties', async ({ page }) => {
    // TODO: Create a template
    const originalName = 'Original Template';
    // const template = await createTemplate(page, originalName, 'root');

    // TODO: Click on template to open detail view
    // await page.click(`[data-template-id="${template.id}"]`);

    // TODO: Wait for navigation to template detail page
    // await page.waitForURL(`/template/${template.id}`);

    // TODO: Click edit button or enable edit mode
    // await page.click('[data-testid="edit-template-button"]');

    // TODO: Update template name
    const newName = 'Updated Template Name';
    // await page.fill('[name="name"]', newName);

    // TODO: Update word weight
    // await page.fill('[name="wordWeight"]', '200');

    // TODO: Update text/description
    // await page.fill('[name="text"]', 'Updated description');

    // TODO: Submit changes
    // await page.click('button[type="submit"]');

    // TODO: Wait for API response
    // const response = await waitForApiResponse(page, '/template');
    // expect(response.name).toBe(newName);

    // TODO: Verify changes are reflected in UI
    // await expect(page.locator(`[data-template-name="${newName}"]`)).toBeVisible();

    // TODO: Navigate back to templates list
    // await page.goto('/templates');

    // TODO: Verify updated name appears in list
    // await expect(page.locator(`[data-template-name="${newName}"]`)).toBeVisible();
    // await expect(page.locator(`[data-template-name="${originalName}"]`)).not.toBeVisible();
  });

  test('should delete a leaf template without affecting parent', async ({ page }) => {
    // TODO: Create template tree (root → branch → leaf)
    const templates = await createTemplateTree(page, {
      rootName: 'Novel',
      branchName: 'Chapter',
      leafName: 'Scene',
    });

    // TODO: Click delete button on leaf template
    // await page.click(`[data-template-id="${templates.leaf.id}"] [data-testid="delete-button"]`);

    // TODO: Verify delete confirmation modal appears
    // await expect(page.locator('[data-testid="delete-confirmation"]')).toBeVisible();

    // TODO: Confirm deletion
    // await page.click('[data-testid="confirm-delete-button"]');

    // TODO: Wait for API response
    // await waitForApiResponse(page, `/template/${templates.leaf.id}`);

    // TODO: Verify leaf template is removed from list
    // await expect(page.locator(`[data-template-name="${templates.leaf.name}"]`)).not.toBeVisible();

    // TODO: Verify parent branch template still exists
    // await expect(page.locator(`[data-template-name="${templates.branch.name}"]`)).toBeVisible();

    // TODO: Verify root template still exists
    // await expect(page.locator(`[data-template-name="${templates.root.name}"]`)).toBeVisible();
  });

  test('should cascade delete all children when deleting parent template', async ({ page }) => {
    // TODO: Create template tree (root → branch → leaf)
    const templates = await createTemplateTree(page, {
      rootName: 'Novel',
      branchName: 'Chapter',
      leafName: 'Scene',
    });

    // TODO: Click delete button on root template
    // await page.click(`[data-template-id="${templates.root.id}"] [data-testid="delete-button"]`);

    // TODO: Verify delete confirmation modal shows warning about cascade deletion
    // await expect(page.locator('[data-testid="delete-confirmation"]'))
    //   .toContainText('This will delete all children');

    // TODO: Confirm deletion
    // await page.click('[data-testid="confirm-delete-button"]');

    // TODO: Wait for API response
    // await waitForApiResponse(page, `/template/${templates.root.id}`);

    // TODO: Verify all templates (root, branch, leaf) are removed from list
    // await expect(page.locator(`[data-template-name="${templates.root.name}"]`)).not.toBeVisible();
    // await expect(page.locator(`[data-template-name="${templates.branch.name}"]`)).not.toBeVisible();
    // await expect(page.locator(`[data-template-name="${templates.leaf.name}"]`)).not.toBeVisible();

    // TODO: Verify empty state message appears
    // await expect(page.locator('[data-testid="no-templates-message"]')).toBeVisible();
  });

  test('should cancel template deletion', async ({ page }) => {
    // TODO: Create a template
    const templateName = 'Template to Keep';
    // const template = await createTemplate(page, templateName, 'root');

    // TODO: Click delete button
    // await page.click(`[data-template-id="${template.id}"] [data-testid="delete-button"]`);

    // TODO: Verify delete confirmation modal appears
    // await expect(page.locator('[data-testid="delete-confirmation"]')).toBeVisible();

    // TODO: Click cancel button
    // await page.click('[data-testid="cancel-delete-button"]');

    // TODO: Verify modal is closed
    // await expect(page.locator('[data-testid="delete-confirmation"]')).not.toBeVisible();

    // TODO: Verify template still exists in list
    // await expect(page.locator(`[data-template-name="${templateName}"]`)).toBeVisible();
  });

  test('should navigate to template detail view', async ({ page }) => {
    // TODO: Create a template
    const templateName = 'Novel Structure';
    // const template = await createTemplate(page, templateName, 'root');

    // TODO: Click on template to navigate to detail view
    // await page.click(`[data-template-id="${template.id}"]`);

    // TODO: Wait for navigation to template detail page
    // await page.waitForURL(`/template/${template.id}`);

    // TODO: Verify template detail page is displayed
    // await expect(page.locator('[data-testid="template-detail-page"]')).toBeVisible();

    // TODO: Verify template name is displayed
    // await expect(page.locator('h1')).toContainText(templateName);

    // TODO: Verify template properties are displayed (type, wordWeight, etc.)
    // await expect(page.locator('[data-testid="template-type"]')).toContainText('root');

    // TODO: Verify markdown editor/viewer is present
    // await expect(page.locator('[data-testid="markdown-editor"]')).toBeVisible();

    // TODO: Verify children list is displayed (if template has children)
    // await expect(page.locator('[data-testid="children-list"]')).toBeVisible();
  });

  test('should navigate template tree structure', async ({ page }) => {
    // TODO: Create template tree (root → branch → leaf)
    const templates = await createTemplateTree(page, {
      rootName: 'Novel',
      branchName: 'Chapter',
      leafName: 'Scene',
    });

    // TODO: Verify all templates are visible in tree view
    // await expect(page.locator(`[data-template-name="${templates.root.name}"]`)).toBeVisible();
    // await expect(page.locator(`[data-template-name="${templates.branch.name}"]`)).toBeVisible();
    // await expect(page.locator(`[data-template-name="${templates.leaf.name}"]`)).toBeVisible();

    // TODO: Click to expand/collapse root template
    // await page.click(`[data-template-id="${templates.root.id}"] [data-testid="expand-button"]`);

    // TODO: Verify children are hidden
    // await expect(page.locator(`[data-template-name="${templates.branch.name}"]`)).not.toBeVisible();

    // TODO: Click to expand again
    // await page.click(`[data-template-id="${templates.root.id}"] [data-testid="expand-button"]`);

    // TODO: Verify children are visible again
    // await expect(page.locator(`[data-template-name="${templates.branch.name}"]`)).toBeVisible();
  });

  test('should show validation errors for invalid template data', async ({ page }) => {
    // TODO: Click add template button
    // await page.click('[data-testid="add-template-button"]');

    // Test Case 1: Empty name
    // TODO: Submit form with empty name
    // await page.selectOption('[name="type"]', 'root');
    // await page.click('button[type="submit"]');
    // TODO: Verify error message for required name
    // await expect(page.locator('[data-testid="name-error"]')).toContainText('Name is required');

    // Test Case 2: Invalid word weight (negative or zero)
    // TODO: Fill form with invalid word weight
    // await page.fill('[name="name"]', 'Test Template');
    // await page.fill('[name="wordWeight"]', '-5');
    // await page.click('button[type="submit"]');
    // TODO: Verify error message
    // await expect(page.locator('[data-testid="wordWeight-error"]')).toContainText('must be positive');

    // Test Case 3: Invalid type selection
    // TODO: Test that root templates cannot be created as children
    // This should be prevented by UI logic
  });

  test('should filter templates by type', async ({ page }) => {
    // TODO: Create templates of different types
    // await createTemplate(page, 'Root Template', 'root');
    // await createTemplate(page, 'Branch Template', 'branch');
    // await createTemplate(page, 'Leaf Template', 'leaf');

    // TODO: Apply filter for root templates only
    // await page.click('[data-testid="filter-button"]');
    // await page.check('[data-filter-type="root"]');
    // await page.click('[data-testid="apply-filter"]');

    // TODO: Verify only root templates are displayed
    // await expect(page.locator('[data-template-type="root"]')).toBeVisible();
    // await expect(page.locator('[data-template-type="branch"]')).not.toBeVisible();
    // await expect(page.locator('[data-template-type="leaf"]')).not.toBeVisible();

    // TODO: Clear filter
    // await page.click('[data-testid="clear-filter"]');

    // TODO: Verify all templates are displayed again
    // await expect(page.locator('[data-template-type="root"]')).toBeVisible();
    // await expect(page.locator('[data-template-type="branch"]')).toBeVisible();
    // await expect(page.locator('[data-template-type="leaf"]')).toBeVisible();
  });

  test('should search templates by name', async ({ page }) => {
    // TODO: Create multiple templates
    // await createTemplate(page, 'Novel Structure', 'root');
    // await createTemplate(page, 'Short Story Format', 'root');
    // await createTemplate(page, 'Chapter Template', 'branch');

    // TODO: Enter search query
    // await page.fill('[data-testid="search-input"]', 'Novel');

    // TODO: Verify only matching templates are displayed
    // await expect(page.locator('[data-template-name="Novel Structure"]')).toBeVisible();
    // await expect(page.locator('[data-template-name="Short Story Format"]')).not.toBeVisible();
    // await expect(page.locator('[data-template-name="Chapter Template"]')).not.toBeVisible();

    // TODO: Clear search
    // await page.fill('[data-testid="search-input"]', '');

    // TODO: Verify all templates are displayed again
    // await expect(page.locator('[data-template-name="Novel Structure"]')).toBeVisible();
    // await expect(page.locator('[data-template-name="Short Story Format"]')).toBeVisible();
    // await expect(page.locator('[data-template-name="Chapter Template"]')).toBeVisible();
  });

  test('should display empty state when no templates exist', async ({ page }) => {
    // TODO: Verify templates page is loaded with no templates
    // await expect(page.locator('[data-testid="templates-page"]')).toBeVisible();

    // TODO: Verify empty state message is displayed
    // await expect(page.locator('[data-testid="no-templates-message"]')).toBeVisible();
    // await expect(page.locator('[data-testid="no-templates-message"]'))
    //   .toContainText('No templates yet');

    // TODO: Verify call-to-action to create first template
    // await expect(page.locator('[data-testid="create-first-template"]')).toBeVisible();
  });

  test('should preserve template tree structure after page reload', async ({ page }) => {
    // TODO: Create template tree
    const templates = await createTemplateTree(page, {
      rootName: 'Novel',
      branchName: 'Chapter',
      leafName: 'Scene',
    });

    // TODO: Reload page
    // await page.reload();

    // TODO: Wait for templates to load
    // await page.waitForSelector('[data-testid="templates-page"]');

    // TODO: Verify tree structure is maintained
    // await expect(page.locator(`[data-template-name="${templates.root.name}"]`)).toBeVisible();
    // await expect(page.locator(`[data-template-name="${templates.branch.name}"]`)).toBeVisible();
    // await expect(page.locator(`[data-template-name="${templates.leaf.name}"]`)).toBeVisible();

    // TODO: Verify parent-child relationships are correct
    // const branch = page.locator(`[data-template-name="${templates.branch.name}"]`);
    // await expect(branch).toHaveAttribute('data-parent-id', templates.root.id);
  });
});
