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
 * const user = await setupAuthenticatedUser(page);
 * // User is now logged in and ready for testing
 */
export async function setupAuthenticatedUser(page, options = {}) {
  const timestamp = Date.now();
  const email = options.email || `test-user-${timestamp}@example.com`;
  const password = options.password || 'TestPassword123!';

  // TODO: Navigate to signup page
  // await page.goto('/signup');

  // TODO: Fill signup form
  // await page.fill('[name="email"]', email);
  // await page.fill('[name="password"]', password);
  // await page.fill('[name="confirmPassword"]', password);

  // TODO: Submit signup form
  // await page.click('button[type="submit"]');

  // TODO: Wait for successful signup and redirect
  // await page.waitForURL('/stories');

  // TODO: Verify authentication cookies are set
  // const cookies = await page.context().cookies();
  // const refreshToken = cookies.find(c => c.name === 'refreshToken');
  // expect(refreshToken).toBeTruthy();

  // TODO: Extract userId from API response or local storage
  const userId = null; // Placeholder

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

  // TODO: Navigate to templates page
  // await page.goto('/templates');

  // TODO: Create root template
  // await page.click('[data-testid="add-template-button"]');
  // await page.selectOption('[name="type"]', 'root');
  // await page.fill('[name="name"]', rootName);
  // await page.fill('[name="wordWeight"]', '100');
  // await page.click('button[type="submit"]');

  // TODO: Wait for root template to appear in list
  // const rootElement = await page.waitForSelector(`[data-template-name="${rootName}"]`);
  // const rootId = await rootElement.getAttribute('data-template-id');

  // TODO: Create branch template as child of root
  // await page.click(`[data-template-id="${rootId}"] [data-testid="add-child-button"]`);
  // await page.selectOption('[name="type"]', 'branch');
  // await page.fill('[name="name"]', branchName);
  // await page.fill('[name="wordWeight"]', '10');
  // await page.click('button[type="submit"]');

  // TODO: Wait for branch template to appear
  // const branchElement = await page.waitForSelector(`[data-template-name="${branchName}"]`);
  // const branchId = await branchElement.getAttribute('data-template-id');

  // TODO: Create leaf template as child of branch
  // await page.click(`[data-template-id="${branchId}"] [data-testid="add-child-button"]`);
  // await page.selectOption('[name="type"]', 'leaf');
  // await page.fill('[name="name"]', leafName);
  // await page.fill('[name="wordWeight"]', '1');
  // await page.click('button[type="submit"]');

  // TODO: Wait for leaf template to appear
  // const leafElement = await page.waitForSelector(`[data-template-name="${leafName}"]`);
  // const leafId = await leafElement.getAttribute('data-template-id');

  return {
    root: { id: null, name: rootName },
    branch: { id: null, name: branchName },
    leaf: { id: null, name: leafName },
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

  // TODO: Navigate to stories page
  // await page.goto('/stories');

  // TODO: Create root storynode
  // await page.click('[data-testid="add-storynode-button"]');
  // await page.selectOption('[name="type"]', 'root');
  // await page.fill('[name="name"]', rootName);
  // await page.fill('[name="wordWeight"]', '100');
  // await page.click('button[type="submit"]');

  // TODO: Wait for root storynode to appear in list
  // const rootElement = await page.waitForSelector(`[data-storynode-name="${rootName}"]`);
  // const rootId = await rootElement.getAttribute('data-storynode-id');

  // TODO: Create branch storynode as child of root
  // await page.click(`[data-storynode-id="${rootId}"] [data-testid="add-child-button"]`);
  // await page.selectOption('[name="type"]', 'branch');
  // await page.fill('[name="name"]', branchName);
  // await page.fill('[name="wordWeight"]', '10');
  // await page.click('button[type="submit"]');

  // TODO: Wait for branch storynode to appear
  // const branchElement = await page.waitForSelector(`[data-storynode-name="${branchName}"]`);
  // const branchId = await branchElement.getAttribute('data-storynode-id');

  // TODO: Create leaf storynode as child of branch
  // await page.click(`[data-storynode-id="${branchId}"] [data-testid="add-child-button"]`);
  // await page.selectOption('[name="type"]', 'leaf');
  // await page.fill('[name="name"]', leafName);
  // await page.fill('[name="wordWeight"]', '1');
  // await page.click('button[type="submit"]');

  // TODO: Wait for leaf storynode to appear
  // const leafElement = await page.waitForSelector(`[data-storynode-name="${leafName}"]`);
  // const leafId = await leafElement.getAttribute('data-storynode-id');

  return {
    root: { id: null, name: rootName },
    branch: { id: null, name: branchName },
    leaf: { id: null, name: leafName },
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
  // TODO: Implement template creation
  // Navigate to templates page or template detail page
  // Click add template button (or add child button if parentId provided)
  // Fill form with name, type, wordWeight
  // Submit and wait for creation
  // Extract and return template ID

  return {
    id: null,
    name,
    type,
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
  // TODO: Implement storynode creation
  // Navigate to stories page or storynode detail page
  // Click add storynode button (or add child button if parentId provided)
  // Fill form with name, type, wordWeight
  // Submit and wait for creation
  // Extract and return storynode ID

  return {
    id: null,
    name,
    type,
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
  // TODO: Implement database clearing
  // Option 1: Call a test-only backend endpoint (e.g., DELETE /test/clear-database)
  // Option 2: Use MongoDB connection directly (requires additional setup)
  // Option 3: Delete user account which cascades to all related data

  // NOTE: This should only be enabled in test environments
  // Verify NODE_ENV=test before allowing database clearing
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

  // TODO: Implement API response waiting
  // Use page.waitForResponse() to wait for matching URL
  // Extract and return JSON data
  // Handle timeout and errors appropriately

  // const response = await page.waitForResponse(
  //   (response) => {
  //     const url = response.url();
  //     return typeof urlPattern === 'string'
  //       ? url.includes(urlPattern)
  //       : urlPattern.test(url);
  //   },
  //   { timeout }
  // );
  // return await response.json();

  return {};
}

/**
 * Logs out the current user
 *
 * @param {import('@playwright/test').Page} page - Playwright page object
 * @returns {Promise<void>}
 */
export async function logout(page) {
  // TODO: Implement logout
  // Click logout button in navbar
  // Wait for redirect to landing page
  // Verify authentication cookies are cleared

  // await page.click('[data-testid="logout-button"]');
  // await page.waitForURL('/');
}

/**
 * Verifies that a user is authenticated (has valid session)
 *
 * @param {import('@playwright/test').Page} page - Playwright page object
 * @returns {Promise<boolean>} True if authenticated, false otherwise
 */
export async function isAuthenticated(page) {
  // TODO: Implement authentication check
  // Check for presence of refresh token cookie
  // Optionally verify by calling /auth/user endpoint

  // const cookies = await page.context().cookies();
  // const refreshToken = cookies.find(c => c.name === 'refreshToken');
  // return !!refreshToken;

  return false;
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
  // TODO: Navigate to login page
  // await page.goto('/login');

  // TODO: Fill login form
  // await page.fill('[name="email"]', email);
  // await page.fill('[name="password"]', password);

  // TODO: Submit form
  // await page.click('button[type="submit"]');

  // TODO: Wait for redirect to stories page
  // await page.waitForURL('/stories');
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
  // TODO: Implement drag and drop
  // Use Playwright's dragTo() method or manual mouse events
  // Verify drop operation completed successfully

  // await page.locator(sourceSelector).dragTo(page.locator(targetSelector));
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
  // TODO: Implement element waiting
  // return await page.waitForSelector(selector, { state: 'visible', timeout });
  return page.locator(selector);
}
