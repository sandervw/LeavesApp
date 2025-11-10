import { expect } from '@playwright/test';

/**
 * E2E Test Helper Functions for Leaves Application
 *
 * These utilities provide common operations for testing authentication,
 * data creation, and API interactions across E2E tests.
 */

/**
 * Creates a new test user and logs them in, returning authentication state
 *
 * @param {import('@playwright/test').Page} page - Playwright page object
 * @param {Object} options - User creation options
 * @param {string} options.email - User email (defaults to random)
 * @param {string} options.password - User password (defaults to 'TestPassword123!')
 * @returns {Promise<{email: string, password: string, userId: string}>} User credentials and ID
 *
 * @example
 * await setupAuthenticatedUser(page);
 * // User is now logged in and ready for testing
 */
export async function setupAuthenticatedUser(page, options = {}) {
  const timestamp = Date.now();
  const email = options.email || `test-user-${timestamp}@example.com`;
  const password = options.password || 'TestPassword123!';
  const username = options.username || `testuser-${timestamp}`;

  // Navigate to signup page
  await page.goto('/signup');

  // Fill signup form using placeholder selectors
  await page.getByPlaceholder('Email').fill(email);
  await page.getByPlaceholder('Username').fill(username);
  await page.getByPlaceholder('Password').fill(password);

  // Submit signup form
  await page.locator('form').getByRole('button', { name: 'Sign Up' }).click();

  // Wait for successful signup and redirect to Stories page
  await page.waitForURL('/');

  // Verify authentication cookies are set
  const cookies = await page.context().cookies();
  const refreshToken = cookies.find((c) => c.name === 'refreshToken');
  expect(refreshToken).toBeTruthy();

  // Extract userId from localStorage
  const userJson = await page.evaluate(() => localStorage.getItem('user'));
  const user = userJson ? JSON.parse(userJson) : null;
  const userId = user?._id || null;

  return {
    email,
    password,
    userId,
  };
}

/**
 * Creates a template tree structure (root → branch → leaf)
 *
 * @param {import('@playwright/test').Page} page - Playwright page object
 * @param {Object} options - Template creation options
 * @param {string} options.rootName - Root template name
 * @param {string} options.branchName - Branch template name
 * @param {string} options.leafName - Leaf template name
 * @returns {Promise<{root: Object, branch: Object, leaf: Object}>} Created template objects
 *
 * @example
 * const templates = await createTemplateTree(page, {
 *   rootName: 'Novel',
 *   branchName: 'Chapter',
 *   leafName: 'Scene'
 * });
 */
export async function createTemplateTree(page, options = {}) {
  const rootName = options.rootName || 'Test Root Template';
  const branchName = options.branchName || 'Test Branch Template';
  const leafName = options.leafName || 'Test Leaf Template';

  // Navigate to templates page
  await page.goto('/templates');

  // Create root template via drag-and-drop
  const rootInput = page.locator('aside.sidebar input[placeholder*="New"]');
  await rootInput.waitFor({ state: 'visible' });
  await rootInput.fill(rootName);

  // Drag TemplateCreate to roots drop zone
  const dragHandle = page.locator('aside.sidebar button[drag-handle="true"]').first();
  const rootsDropZone = page.locator('.content .droppable.list');
  await rootsDropZone.waitFor({ state: 'visible' });
  await dragHandle.dragTo(rootsDropZone);

  // Wait for API response and extract root ID
  const rootResponse = await page.waitForResponse((resp) =>
    resp.url().includes('/template') && resp.request().method() === 'POST'
  );
  const rootData = await rootResponse.json();
  const rootId = rootData._id;

  // Navigate to root template detail page to add branch
  await page.click(`.draggable[id="${rootId}"]`);
  await page.waitForURL(`/templatedetail/${rootId}`);

  // Create branch template as child
  const branchInput = page.locator('aside.sidebar input[placeholder*="New"]');
  await branchInput.waitFor({ state: 'visible' });
  await branchInput.fill(branchName);

  const childrenDropZone = page.locator('.content .droppable.list');
  await childrenDropZone.waitFor({ state: 'visible' });
  const dragHandleBranch = page.locator('aside.sidebar button[drag-handle="true"]').first();
  await dragHandleBranch.dragTo(childrenDropZone);

  // Wait for branch creation
  const branchResponse = await page.waitForResponse((resp) =>
    resp.url().includes('/template') && resp.request().method() === 'POST'
  );
  const branchData = await branchResponse.json();
  const branchId = branchData._id;

  // Navigate to branch detail page to add leaf
  await page.click(`.draggable[id="${branchId}"]`);
  await page.waitForURL(`/templatedetail/${branchId}`);

  // Create leaf template as child of branch
  const leafInput = page.locator('aside.sidebar input[placeholder*="New"]');
  await leafInput.waitFor({ state: 'visible' });
  await leafInput.fill(leafName);

  const dragHandleLeaf = page.locator('aside.sidebar button[drag-handle="true"]').first();
  await dragHandleLeaf.dragTo(childrenDropZone);

  // Wait for leaf creation
  const leafResponse = await page.waitForResponse((resp) =>
    resp.url().includes('/template') && resp.request().method() === 'POST'
  );
  const leafData = await leafResponse.json();
  const leafId = leafData._id;

  return {
    root: { id: rootId, name: rootName },
    branch: { id: branchId, name: branchName },
    leaf: { id: leafId, name: leafName },
  };
}

/**
 * Creates a storynode tree structure (root → branch → leaf)
 *
 * @param {import('@playwright/test').Page} page - Playwright page object
 * @param {Object} options - Storynode creation options
 * @param {string} options.rootName - Root storynode name
 * @param {string} options.branchName - Branch storynode name
 * @param {string} options.leafName - Leaf storynode name
 * @returns {Promise<{root: Object, branch: Object, leaf: Object}>} Created storynode objects
 *
 * @example
 * const storynodes = await createStorynodeTree(page, {
 *   rootName: 'My Story',
 *   branchName: 'Chapter 1',
 *   leafName: 'Opening Scene'
 * });
 */
export async function createStorynodeTree(page, options = {}) {
  const rootName = options.rootName || 'Test Root Storynode';
  const branchName = options.branchName || 'Test Branch Storynode';
  const leafName = options.leafName || 'Test Leaf Storynode';

  // Navigate to stories page
  await page.goto('/stories');

  // Create root storynode via drag-and-drop
  const rootInput = page.locator('aside.sidebar input[placeholder*="New"]');
  await rootInput.waitFor({ state: 'visible' });
  await rootInput.fill(rootName);

  // Drag StorynodeCreate to roots drop zone
  const dragHandle = page.locator('aside.sidebar button[drag-handle="true"]').first();
  const rootsDropZone = page.locator('.content .droppable.list');
  await rootsDropZone.waitFor({ state: 'visible' });
  await dragHandle.dragTo(rootsDropZone);

  // Wait for API response and extract root ID
  const rootResponse = await page.waitForResponse((resp) =>
    resp.url().includes('/storynode') && resp.request().method() === 'POST'
  );
  const rootData = await rootResponse.json();
  const rootId = rootData._id;

  // Navigate to root storynode detail page to add branch
  await page.click(`.draggable[id="${rootId}"]`);
  await page.waitForURL(`/storydetail/${rootId}`);

  // Create branch storynode as child
  const branchInput = page.locator('aside.sidebar input[placeholder*="New"]');
  await branchInput.waitFor({ state: 'visible' });
  await branchInput.fill(branchName);

  const childrenDropZone = page.locator('.content .droppable.list');
  await childrenDropZone.waitFor({ state: 'visible' });
  const dragHandleBranch = page.locator('aside.sidebar button[drag-handle="true"]').first();
  await dragHandleBranch.dragTo(childrenDropZone);

  // Wait for branch creation
  const branchResponse = await page.waitForResponse((resp) =>
    resp.url().includes('/storynode') && resp.request().method() === 'POST'
  );
  const branchData = await branchResponse.json();
  const branchId = branchData._id;

  // Navigate to branch detail page to add leaf
  await page.click(`.draggable[id="${branchId}"]`);
  await page.waitForURL(`/storydetail/${branchId}`);

  // Create leaf storynode as child of branch
  const leafInput = page.locator('aside.sidebar input[placeholder*="New"]');
  await leafInput.waitFor({ state: 'visible' });
  await leafInput.fill(leafName);

  const dragHandleLeaf = page.locator('aside.sidebar button[drag-handle="true"]').first();
  await dragHandleLeaf.dragTo(childrenDropZone);

  // Wait for leaf creation
  const leafResponse = await page.waitForResponse((resp) =>
    resp.url().includes('/storynode') && resp.request().method() === 'POST'
  );
  const leafData = await leafResponse.json();
  const leafId = leafData._id;

  return {
    root: { id: rootId, name: rootName },
    branch: { id: branchId, name: branchName },
    leaf: { id: leafId, name: leafName },
  };
}

/**
 * Creates a single template with specified properties
 *
 * @param {import('@playwright/test').Page} page - Playwright page object
 * @param {string} name - Template name
 * @param {string} type - Template type ('root', 'branch', or 'leaf')
 * @param {string|null} parentId - Parent template ID (null for root templates)
 * @returns {Promise<{id: string, name: string, type: string}>} Created template object
 */
export async function createTemplate(page, name, type, parentId = null) {
  // If parentId is provided, navigate to parent detail page
  if (parentId) {
    await page.goto(`/templatedetail/${parentId}`);
  } else {
    // Navigate to templates page for root templates
    await page.goto('/templates');
  }

  // Fill template name in TemplateCreate component
  const nameInput = page.locator('aside.sidebar input[placeholder*="New"]');
  await nameInput.waitFor({ state: 'visible' });
  await nameInput.fill(name);

  // Drag TemplateCreate to appropriate drop zone
  const dragHandle = page.locator('aside.sidebar button[drag-handle="true"]').first();
  const dropZone = page.locator('.content .droppable.list');
  await dropZone.waitFor({ state: 'visible' });
  await dragHandle.dragTo(dropZone);

  // Wait for API response and extract template ID
  const response = await page.waitForResponse((resp) =>
    resp.url().includes('/template') && resp.request().method() === 'POST'
  );
  const data = await response.json();

  return {
    id: data._id,
    name: data.name,
    type: data.type,
  };
}

/**
 * Creates a single storynode with specified properties
 *
 * @param {import('@playwright/test').Page} page - Playwright page object
 * @param {string} name - Storynode name
 * @param {string} type - Storynode type ('root', 'branch', or 'leaf')
 * @param {string|null} parentId - Parent storynode ID (null for root storynodes)
 * @returns {Promise<{id: string, name: string, type: string}>} Created storynode object
 */
export async function createStorynode(page, name, type, parentId = null) {
  // If parentId is provided, navigate to parent detail page
  if (parentId) {
    await page.goto(`/storydetail/${parentId}`);
  } else {
    // Navigate to stories page for root storynodes
    await page.goto('/stories');
  }

  // Fill storynode name in StorynodeCreate component
  const nameInput = page.locator('aside.sidebar input[placeholder*="New"]');
  await nameInput.waitFor({ state: 'visible' });
  await nameInput.fill(name);

  // Drag StorynodeCreate to appropriate drop zone
  const dragHandle = page.locator('aside.sidebar button[drag-handle="true"]').first();
  const dropZone = page.locator('.content .droppable.list');
  await dropZone.waitFor({ state: 'visible' });
  await dragHandle.dragTo(dropZone);

  // Wait for API response and extract storynode ID
  const response = await page.waitForResponse((resp) =>
    resp.url().includes('/storynode') && resp.request().method() === 'POST'
  );
  const data = await response.json();

  return {
    id: data._id,
    name: data.name,
    type: data.type,
  };
}

/**
 * Clears all user data from the database (use with caution!)
 * This helper should be used in beforeEach/afterEach to ensure test isolation
 *
 * @param {import('@playwright/test').Page} page - Playwright page object
 * @returns {Promise<void>}
 *
 * @example
 * test.beforeEach(async ({ page }) => {
 *   await clearDatabase(page);
 * });
 */
export async function clearDatabase(page) {
  // Call test-only backend endpoint to clear database
  // This endpoint is only available when NODE_ENV=test
  const response = await page.request.delete(
    'http://localhost:8080/test/clear-database'
  );

  // Verify the database was cleared successfully
  if (!response.ok()) {
    throw new Error(
      `Failed to clear database: ${response.status()} ${response.statusText()}`
    );
  }

  // Also clear browser storage to ensure clean state
  await page.evaluate(() => {
    localStorage.clear();
    sessionStorage.clear();
  });
}

/**
 * Waits for a specific API response and returns the response data
 *
 * @param {import('@playwright/test').Page} page - Playwright page object
 * @param {string|RegExp} urlPattern - URL pattern to match (string or regex)
 * @param {Object} options - Wait options
 * @param {number} options.timeout - Maximum wait time in milliseconds
 * @returns {Promise<Object>} Response data as JSON
 *
 * @example
 * const responsePromise = waitForApiResponse(page, '/api/template');
 * await page.click('[data-testid="create-template"]');
 * const response = await responsePromise;
 * expect(response.name).toBe('My Template');
 */
export async function waitForApiResponse(page, urlPattern, options = {}) {
  const timeout = options.timeout || 10000;

  // Wait for API response matching the URL pattern
  // Backend API runs on http://localhost:8080
  const response = await page.waitForResponse(
    (response) => {
      const url = response.url();
      return typeof urlPattern === 'string'
        ? url.includes(urlPattern)
        : urlPattern.test(url);
    },
    { timeout }
  );
  return await response.json();
}

/**
 * Logs out the current user
 *
 * @param {import('@playwright/test').Page} page - Playwright page object
 * @returns {Promise<void>}
 */
export async function logout(page) {
  // Click logout button in navbar using text selector
  const logoutButton = page.getByRole('button', { name: /log out/i });
  await logoutButton.click();

  // Wait a moment for logout to process
  await page.waitForTimeout(500);

  // Verify localStorage is cleared
  const userJson = await page.evaluate(() => localStorage.getItem('user'));
  expect(userJson).toBeFalsy();
}

/**
 * Verifies that a user is authenticated (has valid session)
 *
 * @param {import('@playwright/test').Page} page - Playwright page object
 * @returns {Promise<boolean>} True if authenticated, false otherwise
 */
export async function isAuthenticated(page) {
  // Check for presence of user in localStorage (which indicates authentication)
  const user = await page.evaluate(() => localStorage.getItem('user'));
  return !!user;
}

/**
 * Fills and submits the login form
 *
 * @param {import('@playwright/test').Page} page - Playwright page object
 * @param {string} email - User email
 * @param {string} password - User password
 * @returns {Promise<void>}
 */
export async function login(page, email, password) {
  // Navigate to login page
  await page.goto('/login');

  // Fill login form using placeholder selectors
  // Note: Login form uses 'Username' placeholder for email field
  await page.getByPlaceholder('Username').fill(email);
  await page.getByPlaceholder('Password').fill(password);

  // Submit form
  await page.locator('form').getByRole('button', { name: 'Log In' }).click();

  // Wait for redirect to stories page (/)
  await page.waitForURL('/');
}

/**
 * Performs a drag and drop operation
 *
 * @param {import('@playwright/test').Page} page - Playwright page object
 * @param {string} sourceSelector - CSS selector for draggable element
 * @param {string} targetSelector - CSS selector for drop target
 * @returns {Promise<void>}
 */
export async function dragAndDrop(page, sourceSelector, targetSelector) {
  // Perform drag-and-drop operation
  // The app uses @dnd-kit/core which works with native drag events
  const source = page.locator(sourceSelector);
  const target = page.locator(targetSelector);

  // Ensure both elements are visible
  await source.waitFor({ state: 'visible' });
  await target.waitFor({ state: 'visible' });

  // Perform drag operation
  await source.dragTo(target);

  // Wait for drag-and-drop animation and state updates
  await page.waitForTimeout(500);
}

/**
 * Waits for an element to be visible on the page
 *
 * @param {import('@playwright/test').Page} page - Playwright page object
 * @param {string} selector - CSS selector for element
 * @param {number} timeout - Maximum wait time in milliseconds
 * @returns {Promise<import('@playwright/test').Locator>} Element locator
 */
export async function waitForElement(page, selector, timeout = 10000) {
  // Wait for element to be visible with timeout
  return await page.waitForSelector(selector, { state: 'visible', timeout });
}
