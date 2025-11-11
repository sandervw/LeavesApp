## Testing

The backend has a comprehensive test suite using **Vitest** with **MongoDB Memory Server** for integration tests.

### Test Statistics

- **17 test files** covering ~6,177 lines of test code
- **Unit tests**: 12 files (utils, services, schemas)
- **Integration tests**: 5 files (all controllers fully tested)

### Test Structure

```
tests/
├── setup.ts                          # Global setup with MongoDB Memory Server
├── README.md                         # 256-line comprehensive testing guide
├── unit/
│   ├── utils/                        # 7 test files
│   │   ├── appAssert.test.ts
│   │   ├── bcrypt.test.ts
│   │   ├── cookies.test.ts
│   │   ├── date.test.ts
│   │   ├── emailUtils.test.ts
│   │   ├── errorUtils.test.ts
│   │   └── jwt.test.ts
│   ├── services/                     # 4 test files
│   │   ├── auth.service.test.ts
│   │   ├── recursive.service.test.ts
│   │   ├── storynode.service.test.ts
│   │   └── tree.service.test.ts
│   └── schemas/
│       └── controller.schema.test.ts
└── integration/
    ├── helpers.ts                    # Test helper functions
    └── controllers/                  # 5 test files
        ├── auth.controller.test.ts
        ├── session.controller.test.ts
        ├── template.controller.test.ts
        ├── storynode.controller.test.ts
        └── user.controller.test.ts
```

### Running Tests

```bash
# Run all tests once
npm test

# Run tests in watch mode (re-runs on file changes)
npm run test:watch

# Run tests with interactive UI
npm run test:ui

# Generate coverage report
npm run test:coverage
```

### Test Configuration

- **vitest.config.ts**: Vitest configuration with path aliases matching tsconfig
- **tsconfig.test.json**: TypeScript configuration for test files
- **tests/setup.ts**: Global setup that mocks environment variables and manages MongoDB Memory Server lifecycle

### Test Helper Functions

The `tests/integration/helpers.ts` file provides utilities for integration tests:

```typescript
// Create authenticated user and return cookies
async function createAuthenticatedUser(): Promise<{
  user: UserDoc;
  cookies: string[];
}>;

// Create root → branch → leaf template structure
async function createTemplateTree(): Promise<{
  root: TemplateDoc;
  branch: TemplateDoc;
  leaf: TemplateDoc;
}>;

// Create root → branch → leaf storynode structure
async function createStorynodeTree(): Promise<{
  root: StorynodeDoc;
  branch: StorynodeDoc;
  leaf: StorynodeDoc;
}>;
```

### Testing Patterns

**Unit Tests**:

- Use Vitest's mocking (`vi.mock()`) to isolate dependencies
- Test individual functions and methods in isolation
- Focus on edge cases and error handling

**Integration Tests**:

- Use MongoDB Memory Server for real database operations
- Use **supertest** for HTTP assertions
- Test complete request/response cycles
- Verify authentication flows and token handling
- Test cascade operations (e.g., deleting trees)

### Coverage Goals

**Current Coverage Targets**:

- **Overall**: 80%+ code coverage
- **Critical paths**: 90%+ coverage for authentication, authorization, and data mutation operations
- **Services**: 85%+ coverage for business logic
- **Controllers**: 90%+ coverage for request/response handling
- **Utils**: 95%+ coverage for utility functions

**Coverage by Category**:

- Authentication flows (signup, login, refresh, logout): 95%+
- Tree operations (create, read, update, delete, cascade): 90%+
- Validation (Zod schemas, middleware): 90%+
- Error handling (appAssert, errorHandler): 85%+
- Utility functions (jwt, bcrypt, cookies, date): 95%+

Run `npm run test:coverage` to generate detailed coverage reports in the `coverage/` directory.

### Test Failures

**Problem**: Tests failing unexpectedly

**Solutions**:

1. Ensure MongoDB Memory Server can download binary (check firewall/proxy)
2. Clear test database: Stop all test processes and delete `.cache/` directory
3. Check for port conflicts: Ensure test ports are available
4. Run tests individually to isolate failures: `npm test -- auth.controller.test.ts`

### Memory Leaks in Tests

**Problem**: Tests consuming excessive memory

**Solutions**:

1. Ensure MongoDB Memory Server is properly cleaned up in `afterAll` hooks
2. Close Mongoose connections after tests: `await mongoose.connection.close()`
3. Run tests with `--no-coverage` to reduce memory usage
4. Run smaller test suites individually

---
