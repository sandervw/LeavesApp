# Backend Testing Guide

This guide will help you understand and run tests for the Leaves backend API.

## What We've Set Up

### Folder Structure
```
backend/
├── tests/
│   ├── unit/                    # Unit tests (isolated functions)
│   │   ├── utils/               # Tests for utility functions
│   │   │   ├── date.test.ts     # Date helper tests
│   │   │   ├── appAssert.test.ts # Error assertion tests
│   │   │   └── bcrypt.test.ts   # Password hashing tests
│   │   └── services/            # Tests for business logic (to be added)
│   ├── integration/             # Integration tests (to be added)
│   │   └── controllers/         # Tests for API endpoints
│   └── setup.ts                 # Test configuration
├── vitest.config.ts             # Vitest configuration
└── src/                         # Your source code
```

## Running Tests

### Basic Commands

```bash
# Run all tests once
npm test

# Run tests in watch mode (auto-rerun on file changes)
npm run test:watch

# Run tests with UI (interactive browser interface)
npm run test:ui

# Run tests with coverage report
npm run test:coverage
```

## Test Files Explained

### 1. date.test.ts (21 tests)
**Difficulty: Beginner** ⭐

Tests pure date utility functions with no dependencies. Great starting point!

**What it teaches:**
- Basic test structure (describe, it, expect)
- Testing pure functions
- Using beforeEach/afterEach hooks
- Mocking Date.now() for consistent tests

**Key concepts:**
```typescript
describe('feature name', () => {
  it('should do something specific', () => {
    const result = functionToTest();
    expect(result).toBe(expectedValue);
  });
});
```

### 2. appAssert.test.ts (20 tests)
**Difficulty: Beginner** ⭐⭐

Tests error handling and exception throwing.

**What it teaches:**
- Testing functions that throw errors
- Using try-catch in tests
- Type narrowing with assertions
- Real-world validation examples

**Key concepts:**
```typescript
expect(() => {
  functionThatThrows();
}).toThrow(ErrorType);
```

### 3. bcrypt.test.ts (15 tests)
**Difficulty: Intermediate** ⭐⭐⭐

Tests password hashing using the REAL bcrypt library (not mocked).

**What it teaches:**
- Testing async functions
- Working with real external libraries
- Testing security-critical code
- Pattern matching with regex

**Key concepts:**
```typescript
it('should hash a password', async () => {
  const hash = await hashValue('password');
  expect(hash).toMatch(/pattern/);
});
```

**Note:** These tests are slower (~1.5s) because bcrypt is intentionally slow for security. This is normal!

## Understanding Test Anatomy

### Basic Test Structure
```typescript
import { describe, it, expect } from 'vitest';
import { functionToTest } from '../../../src/path/to/file';

describe('Feature or Module Name', () => {
  it('should describe what the test does', () => {
    // Arrange: Set up test data
    const input = 'test data';

    // Act: Call the function
    const result = functionToTest(input);

    // Assert: Check the result
    expect(result).toBe('expected output');
  });
});
```

### Common Vitest Matchers
```typescript
expect(value).toBe(exactValue)              // Strict equality (===)
expect(value).toEqual(objectOrArray)        // Deep equality
expect(value).toBeTruthy()                  // Truthy check
expect(value).toBeFalsy()                   // Falsy check
expect(value).toBeNull()                    // null check
expect(value).toBeUndefined()               // undefined check
expect(value).toMatch(/regex/)              // Regex match
expect(value).toContain(item)               // Array/string contains
expect(array).toHaveLength(3)               // Length check
expect(func).toThrow()                      // Function throws error
expect(func).toThrow(ErrorType)             // Throws specific error
expect(func).toThrow('message')             // Throws with message
```

### Async Tests
```typescript
it('should handle async operations', async () => {
  const result = await asyncFunction();
  expect(result).toBe('value');
});

// Testing async errors
await expect(asyncFunction()).rejects.toThrow();
```

## Next Steps for Testing

### Recommended Learning Path

1. **Start with Utils** ✅ (You are here!)
   - date.ts ✅
   - appAssert.ts ✅
   - bcrypt.ts ✅
   - Next: cookies.ts, jwt.ts, emailUtils.ts

2. **Move to Services** (Intermediate)
   - file.service.ts - Test file conversion logic
   - recursive.service.ts - Test tree traversal
   - These will require mocking Mongoose models

3. **Then Controllers** (Advanced)
   - auth.controller.ts - Test authentication endpoints
   - template.controller.ts - Test template CRUD
   - These require mocking requests/responses

### Writing Your First Test

Try writing tests for `cookies.ts` or `jwt.ts`! They're similar to the existing tests.

**Example workflow:**
```bash
# 1. Create the test file
# tests/unit/utils/cookies.test.ts

# 2. Write your tests

# 3. Run in watch mode while developing
npm run test:watch

# 4. Run all tests before committing
npm test
```

### Tips for Writing Good Tests

1. **Test behavior, not implementation**
   - Focus on WHAT the function does, not HOW

2. **Use descriptive test names**
   - Good: "should return true when password matches hash"
   - Bad: "test compareValue"

3. **Follow AAA pattern**
   - Arrange: Set up test data
   - Act: Execute the function
   - Assert: Verify the result

4. **One assertion per test** (when possible)
   - Makes it clear what failed

5. **Test edge cases**
   - Empty strings, null, undefined
   - Large inputs
   - Error conditions

## Testing Strategies

### Unit Tests
- Test individual functions in isolation
- Fast to run
- Easy to write
- Mock external dependencies

### Integration Tests
- Test how components work together
- Slower but more realistic
- Test database operations, API endpoints
- Use test database

## Common Issues

### Tests Run Slowly
- Bcrypt tests are slow by design (security)
- Use lower salt rounds in tests if needed
- Run specific test files: `npm test date.test`

### Import Errors
- Check file paths in imports
- Verify tsconfig paths are correct

### Mocking Issues
- Vitest mocking can be tricky with TypeScript
- Start with real implementations (like we did with bcrypt)
- Add mocks as you get more comfortable

## Resources

- [Vitest Documentation](https://vitest.dev/)
- [Vitest API Reference](https://vitest.dev/api/)
- [Testing Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)

## Need Help?

- Check existing test files for examples
- Read the inline comments in test files
- Run `npm run test:ui` for interactive debugging
- Use `console.log()` in tests to debug

Happy Testing! 🧪
