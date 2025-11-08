# E2E Testing with Playwright

End-to-end tests for the Leaves application using Playwright across Chromium, Firefox, and WebKit.

## Overview

This E2E test suite covers complete user journeys from signup to content creation and management.

**Test Statistics:**

- 7 spec files + 1 helpers file
- 106 placeholder tests
- 318 total scenarios (106 tests × 3 browsers)

## Test Structure

```
e2e/
├── helpers.js              # Shared utility functions
├── auth.spec.js           # Authentication (signup, login, logout, token refresh, protected routes, sessions)
├── templates.spec.js      # Template CRUD, tree navigation, search, filtering, validation
├── storynodes.spec.js     # Storynode CRUD, word count tracking, completion status, deletion
├── drag-drop.spec.js      # Template→Storynode conversion, tree reorganization, archive/delete, visual feedback
├── archive.spec.js        # Archive/unarchive, tree-level archiving, content preservation, deletion
├── navigation.spec.js     # Page navigation, detail views, browser back/forward, breadcrumbs, protected routes, deep linking
├── user-flow.spec.js      # Complete workflows: signup→template→story→edit→complete→archive, template reuse, multi-project, error recovery
└── README.md              # This file
```

## Helper Functions (e2e/helpers.js)

- `setupAuthenticatedUser()` - Creates and logs in test user
- `createTemplateTree()` - Creates template tree (root → branch → leaf)
- `createStorynodeTree()` - Creates storynode tree structure
- `createTemplate()` / `createStorynode()` - Create single nodes
- `clearDatabase()` - Clears test data
- `waitForApiResponse()` - Waits for API responses
- `login()` / `logout()` - Authentication helpers
- `dragAndDrop()` - Drag-and-drop operations

## Quick Start

### Installation

```bash
cd frontend
npm install
npx playwright install
```

### Run Tests

```bash
npm run test:e2e                    # All tests
npm run test:e2e:headed            # Visible browser
npm run test:e2e:ui                # Interactive UI
npm run test:e2e:debug             # Debug mode
npm run test:e2e:chromium          # Chromium only
npm run test:e2e:firefox           # Firefox only
npm run test:e2e:webkit            # WebKit only
npm run test:e2e:report            # View last report

npx playwright test e2e/auth.spec.js                              # Specific file
npx playwright test e2e/auth.spec.js -g "should successfully sign up"  # Specific test
```

## Prerequisites

### 1. Environment Variables

**Backend (.env):**

```
NODE_ENV=test
PORT=8080
MONGO_URI=<test-mongodb-uri>
JWT_SECRET=<jwt-secret>
JWT_REFRESH_SECRET=<refresh-secret>
APP_ORIGIN=http://localhost:5173
EMAIL_SENDER=<email>
RESEND_API_KEY=<resend-key>
```

**Frontend (.env):**

```
VITE_API_URL=http://localhost:8080
```

### 2. Database Setup

Use a dedicated test database to avoid affecting development data.

**Option 1:** Create test MongoDB instance and update `MONGO_URI` in backend `.env`.

**Option 2:** Use MongoDB Memory Server for isolated testing.

The Playwright config automatically starts frontend and backend servers.

## Configuration

### Playwright Config Highlights (playwright.config.js)

Edit to customize:

- **Base URL**: http://localhost:5173
- **Timeout**: 30s per test
- **Workers**: 1 (prevents database conflicts)
- **Retry**: 2 retries on CI
- **Screenshots**: Captured on failure
- **Videos**: Retained on failure
- **Trace**: Captured on first retry
- **Auto-start**: Automatically starts frontend and backend servers
- **Browser Coverage**: Chromium (Desktop Chrome), Firefox (Desktop Firefox), WebKit (Desktop Safari)

### Test Output Locations

- Test results: `test-results/`
- HTML report: `playwright-report/`
- Screenshots: `test-results/<test-name>/screenshots/`
- Videos: `test-results/<test-name>/videos/`
- Traces: `test-results/<test-name>/traces/`

## Key Testing Patterns

### 1. Test Isolation

Each test sets up its own authenticated user:

```javascript
test.beforeEach(async ({ page }) => {
  await setupAuthenticatedUser(page);
});
```

### 2. Timestamped Test Data

```javascript
const email = `test-user-${Date.now()}@example.com`;
```

### 3. Wait for API Responses

```javascript
const response = await waitForApiResponse(page, "/storynode");
expect(response.name).toBe("My Story");
```

### 4. Tree Structure Testing

```javascript
await expect(page.locator(`[data-storynode-id="${child.id}"]`)).toHaveAttribute(
  "data-parent-id",
  parent.id
);
```

### 5. Drag-and-Drop Testing

```javascript
await dragAndDrop(page, sourceSelector, targetSelector);
```

## Best Practices

**Use data attributes for selectors:**

```javascript
// Good
await page.click('[data-testid="add-template-button"]');

// Avoid
await page.click(".add-template-button");
```

**Wait for navigation completion:**

```javascript
await page.click('[data-testid="login-button"]');
await page.waitForURL("/stories");
```

**Test independent scenarios:** Each test runs in isolation with its own setup via `beforeEach` hooks.

**Use descriptive test names:** `test('should archive storynode and show it in archive page', ...)`

**Group related tests:**

```javascript
test.describe('Archive Operations', () => {
  test('should archive storynode', ...);
  test('should unarchive storynode', ...);
});
```

## Debugging Tests

| Method       | Command                                     |
| ------------ | ------------------------------------------- |
| Visual       | `npm run test:e2e:headed`                   |
| Step through | `npm run test:e2e:debug`                    |
| Inspector    | Add `await page.pause()` in test            |
| Screenshots  | Auto-captured in `test-results/` on failure |
| Videos       | Auto-captured in `test-results/` on failure |

## Test Coverage

| Module                 | Coverage                                                                                                                   |
| ---------------------- | -------------------------------------------------------------------------------------------------------------------------- |
| **auth.spec.js**       | Signup/login/logout, token refresh, protected routes, session persistence, password reset                                  |
| **templates.spec.js**  | CRUD for all template types, tree navigation, cascade deletion, search, filtering, validation                              |
| **storynodes.spec.js** | CRUD for all storynode types, word count tracking/propagation, completion status, tree management, word limits             |
| **drag-drop.spec.js**  | Template→Storynode conversion, tree reorganization, archive/delete via drag, visual feedback, invalid operation prevention |
| **archive.spec.js**    | Archive/unarchive, tree-level archiving, content preservation, search, filtering, permanent deletion                       |
| **navigation.spec.js** | Page navigation, detail views, browser back/forward, breadcrumbs, protected route redirects, deep linking, 404 handling    |
| **user-flow.spec.js**  | Full onboarding (signup→template→story→edit→complete→archive), multi-project workflows, template reuse, error recovery     |

## Integration with Existing Tests

**Frontend Unit Tests (Vitest):** Component rendering, hook behavior, utility functions, context providers.

**Backend Tests (Vitest):** API endpoints, service logic, database operations, authentication middleware.

**E2E Tests (Playwright):** Complete user workflows, cross-page interactions, real browser testing, visual validation.

## Implementation Status

All test files contain placeholder tests with TODO comments. Implementation requires:

### 1. Add Data Test IDs to Components

Add `data-testid` attributes to React components:

```jsx
<button data-testid="add-template-button">Add Template</button>
<div data-testid="stories-page">...</div>
<input data-testid="markdown-editor" />
<div data-template-id={template.id} data-testid="template-item">...</div>
```

### 2. Implement Helper Functions

Complete implementation in `e2e/helpers.js`:

- Update selectors to match actual DOM structure
- Implement database cleanup utilities
- Add error handling and retry logic

### 3. Uncomment and Update Tests

For each test file:

- Uncomment TODO sections
- Update selectors to match component structure
- Adjust assertions based on actual behavior
- Add missing test scenarios

### 4. Set Up Test Database

- Create test MongoDB instance or use MongoDB Memory Server
- Update backend `.env` with test database connection
- Implement database cleanup between tests

### 5. Optional Enhancements

- Test-only API endpoints for database cleanup
- Seed data endpoints for consistent test setup
- Mock email service for password reset testing

## Continuous Integration

### Running on CI

Tests run in headless mode by default:

```yaml
- name: Install dependencies
  run: npm ci

- name: Install Playwright browsers
  run: npx playwright install --with-deps

- name: Run E2E tests
  run: npm run test:e2e

- name: Upload test results
  if: failure()
  uses: actions/upload-artifact@v3
  with:
    name: playwright-report
    path: playwright-report/
```

## Implementation Roadmap

1. **Start with auth.spec.js** - Foundation for all other tests
2. **Add data-testid attributes incrementally** - As tests are implemented
3. **Run tests frequently during development** - Catch issues early
4. **Use Playwright UI mode** - Excellent for debugging and test development
5. **Keep tests independent** - Ensure each runs in isolation
6. **Document non-obvious test logic** - Add comments as needed

## Resources

- [Playwright Documentation](https://playwright.dev/)
- [Best Practices](https://playwright.dev/docs/best-practices)
- [API Reference](https://playwright.dev/docs/api/class-playwright)
- [Test Fixtures](https://playwright.dev/docs/test-fixtures)
- [Page Object Models](https://playwright.dev/docs/pom)

## Success Metrics

Once implemented, E2E tests provide:

- Deployment confidence
- Regression prevention
- User flow documentation
- Browser compatibility verification
- Production-like testing environment

## Support

For E2E test issues:

1. Check output in `test-results/` directory
2. Review screenshots and videos for failed tests
3. Run tests in headed/debug mode
4. Consult Playwright documentation

---

**Note:** All tests are currently placeholders with TODO comments. Implementation requires adding `data-testid` attributes to components and completing helper functions.
