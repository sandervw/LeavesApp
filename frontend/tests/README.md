# Frontend Testing Guide

This comprehensive guide covers the testing infrastructure for the Leaves frontend application, built with React, Vite, and Vitest.

## Table of Contents

1. [Overview](#overview)
2. [Testing Stack](#testing-stack)
3. [Running Tests](#running-tests)
4. [Test Structure](#test-structure)
5. [Testing Patterns](#testing-patterns)
6. [MSW (Mock Service Worker)](#msw-mock-service-worker)
7. [Testing Utilities](#testing-utilities)
8. [Writing New Tests](#writing-new-tests)
9. [Common Testing Scenarios](#common-testing-scenarios)
10. [Best Practices](#best-practices)
11. [Troubleshooting](#troubleshooting)

---

## Overview

The Leaves frontend uses a comprehensive testing strategy that includes:

- **Unit tests** for custom hooks
- **Integration tests** for context providers and components
- **API mocking** with Mock Service Worker (MSW)
- **Component testing** with React Testing Library

**Test Statistics:**
- 15 test files covering hooks, contexts, and components
- Unit tests: 5 hook test files
- Integration tests: 4 context test files + 6 component test files
- Mock data generators and test utilities

---

## Testing Stack

### Core Testing Libraries

- **Vitest** - Fast unit test framework compatible with Vite
- **@testing-library/react** - React component testing utilities
- **@testing-library/user-event** - User interaction simulation
- **@testing-library/jest-dom** - Custom DOM matchers
- **MSW (Mock Service Worker)** - API mocking at network level
- **jsdom** - DOM implementation for Node.js

### Development Tools

- **@vitest/ui** - Interactive test UI
- **@vitest/coverage-v8** - Code coverage reporting

---

## Running Tests

### Basic Commands

```bash
# Run all tests
npm test

# Run tests in watch mode (re-runs on file changes)
npm run test:watch

# Run tests with interactive UI
npm run test:ui

# Generate coverage report
npm run test:coverage
```

### Running Specific Tests

```bash
# Run tests in a specific file
npm test -- useAPI.test.js

# Run tests matching a pattern
npm test -- --grep "Login"

# Run tests for a specific component
npm test -- Template.test.jsx
```

### Coverage Reports

Coverage reports are generated in the `coverage/` directory:
- `coverage/index.html` - Interactive HTML coverage report
- `coverage/coverage-final.json` - JSON coverage data

---

## Test Structure

```
frontend/tests/
├── setup.js                      # Global test setup
├── README.md                     # This file
├── mocks/
│   ├── handlers.js              # MSW request handlers
│   └── server.js                # MSW server setup
├── utils/
│   ├── testUtils.jsx            # Custom render functions
│   └── mockData.js              # Mock data generators
├── hooks/
│   ├── useAPI.test.js           # useAPI hook tests
│   ├── useAuthContext.test.js   # useAuthContext hook tests
│   ├── useElementContext.test.js
│   ├── useTreelistContext.test.js
│   └── useAddableContext.test.js
├── context/
│   ├── AuthContext.test.jsx     # AuthContext integration tests
│   ├── ElementContext.test.jsx
│   ├── TreelistContext.test.jsx
│   └── AddableContext.test.jsx
└── components/
    ├── overlay/
    │   ├── Login.test.jsx       # Login component tests
    │   └── Signup.test.jsx      # Signup component tests
    ├── part/
    │   ├── Template.test.jsx    # Template component tests
    │   └── Storynode.test.jsx   # Storynode component tests
    └── wrapper/
        ├── Draggable.test.jsx   # Draggable wrapper tests
        └── Droppable.test.jsx   # Droppable wrapper tests
```

---

## Testing Patterns

### Unit Tests (Hooks)

Hook tests use `renderHook` from React Testing Library:

```javascript
import { renderHook } from '@testing-library/react';
import useAuthContext from '../../src/hooks/useAuthContext';
import { AuthContextProvider } from '../../src/context/AuthContext';

it('should return auth context value', () => {
  const wrapper = ({ children }) => (
    <AuthContextProvider>{children}</AuthContextProvider>
  );

  const { result } = renderHook(() => useAuthContext(), { wrapper });

  expect(result.current).toBeDefined();
  expect(result.current.dispatch).toBeDefined();
});
```

### Integration Tests (Contexts)

Context tests verify state management and propagation:

```javascript
import { render, screen, waitFor } from '@testing-library/react';
import { AuthContextProvider } from '../../src/context/AuthContext';

const TestComponent = () => {
  const { user, dispatch } = useAuthContext();
  return <div>{user ? user.email : 'Not logged in'}</div>;
};

it('should update state on LOGIN action', async () => {
  render(
    <AuthContextProvider>
      <TestComponent />
    </AuthContextProvider>
  );

  // Test login logic...
});
```

### Component Tests

Component tests use custom `renderWithProviders` utility:

```javascript
import { renderWithProviders } from '../../utils/testUtils';
import Login from '../../../src/components/overlay/Login';

it('should render login form', () => {
  renderWithProviders(<Login hideModal={mockFn} />);

  expect(screen.getByPlaceholderText('Username')).toBeInTheDocument();
  expect(screen.getByPlaceholderText('Password')).toBeInTheDocument();
});
```

---

## MSW (Mock Service Worker)

### Overview

MSW intercepts network requests at the network level, providing more realistic API mocking than mocking fetch/axios directly.

### Request Handlers

All API handlers are defined in `tests/mocks/handlers.js`:

```javascript
import { http, HttpResponse } from 'msw';

const BASE_URL = 'http://localhost:8080';

export const handlers = [
  http.post(`${BASE_URL}/auth/login`, async ({ request }) => {
    const { email, password } = await request.json();

    if (email === 'test@example.com' && password === 'password123') {
      return HttpResponse.json(mockUser, { status: 200 });
    }

    return HttpResponse.json(
      { message: 'Invalid credentials' },
      { status: 401 }
    );
  }),
];
```

### Overriding Handlers in Tests

You can override handlers for specific tests:

```javascript
import { server } from '../../mocks/server';
import { http, HttpResponse } from 'msw';

it('should handle server errors', async () => {
  server.use(
    http.get('http://localhost:8080/user', () => {
      return HttpResponse.json(
        { message: 'Server error' },
        { status: 500 }
      );
    })
  );

  // Test error handling...
});
```

### Available Mock Endpoints

- `POST /auth/signup` - User registration
- `POST /auth/login` - User login
- `GET /auth/logout` - User logout
- `GET /auth/refresh` - Refresh access token
- `GET /user` - Get current user
- `GET /template` - Fetch templates
- `POST /template` - Create/update template
- `DELETE /template/:id` - Delete template
- `GET /storynode` - Fetch storynodes
- `POST /storynode` - Create/update storynode
- `POST /storynode/postfromtemplate` - Create storynode from template
- `DELETE /storynode/:id` - Delete storynode

---

## Testing Utilities

### Custom Render Functions

**`renderWithProviders`** - Wraps components with all necessary context providers:

```javascript
import { renderWithProviders } from '../../utils/testUtils';

renderWithProviders(<MyComponent />, {
  providerProps: {
    authState: { user: mockUser() },
    elementState: { element: mockTemplate() },
  },
  withRouter: true,
  withDnd: true,
});
```

**Options:**
- `providerProps.authState` - Initial auth state
- `providerProps.elementState` - Initial element state
- `providerProps.treelistState` - Initial treelist state
- `providerProps.addableState` - Initial addable state
- `providerProps.pageState` - Initial page state
- `withRouter` - Wrap with BrowserRouter (default: true)
- `withDnd` - Wrap with DndContext (default: false)

### Mock Data Generators

Located in `tests/utils/mockData.js`:

```javascript
import { mockUser, mockTemplate, mockStorynode } from '../../utils/mockData';

// Generate mock user
const user = mockUser({ email: 'custom@example.com' });

// Generate mock template
const template = mockTemplate({ name: 'Custom Template' });

// Generate mock storynode
const storynode = mockStorynode({ wordCount: 500 });

// Generate template tree (root -> branch -> leaf)
const { root, branch, leaf } = mockTemplateTree();

// Generate lists
const templates = mockTemplateList(5); // Array of 5 templates
const storynodes = mockStorynodeList(3); // Array of 3 storynodes
```

---

## Writing New Tests

### Step 1: Create Test File

Create a test file next to the component or in the appropriate test directory:

```
src/components/part/MyComponent.jsx
tests/components/part/MyComponent.test.jsx
```

### Step 2: Import Dependencies

```javascript
import { describe, it, expect, vi } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders } from '../../utils/testUtils';
import MyComponent from '../../../src/components/part/MyComponent';
```

### Step 3: Write Test Structure

```javascript
describe('MyComponent', () => {
  describe('Rendering', () => {
    it('should render component with props', () => {
      renderWithProviders(<MyComponent prop1="value" />);
      expect(screen.getByText('value')).toBeInTheDocument();
    });
  });

  describe('User interaction', () => {
    it('should handle click events', async () => {
      const user = userEvent.setup();
      const mockFn = vi.fn();

      renderWithProviders(<MyComponent onClick={mockFn} />);

      await user.click(screen.getByRole('button'));

      expect(mockFn).toHaveBeenCalled();
    });
  });

  describe('API integration', () => {
    it('should fetch data on mount', async () => {
      renderWithProviders(<MyComponent />);

      await waitFor(() => {
        expect(screen.getByText('Loaded Data')).toBeInTheDocument();
      });
    });
  });
});
```

### Step 4: Test Coverage Areas

Ensure you test:
- **Rendering** - Component renders correctly
- **Props** - Component handles different props
- **User interaction** - Click, type, submit events
- **State changes** - Component state updates correctly
- **API calls** - Network requests and responses
- **Error handling** - Component handles errors gracefully
- **Edge cases** - Empty states, loading states, etc.

---

## Common Testing Scenarios

### Testing Form Submission

```javascript
it('should submit form with user input', async () => {
  const user = userEvent.setup();
  const mockSubmit = vi.fn();

  renderWithProviders(<LoginForm onSubmit={mockSubmit} />);

  await user.type(screen.getByPlaceholderText('Email'), 'test@example.com');
  await user.type(screen.getByPlaceholderText('Password'), 'password123');
  await user.click(screen.getByText('Submit'));

  expect(mockSubmit).toHaveBeenCalledWith({
    email: 'test@example.com',
    password: 'password123',
  });
});
```

### Testing Async Operations

```javascript
it('should show loading state then data', async () => {
  renderWithProviders(<DataComponent />);

  // Initially shows loading
  expect(screen.getByText('Loading...')).toBeInTheDocument();

  // Wait for data to load
  await waitFor(() => {
    expect(screen.getByText('Data loaded')).toBeInTheDocument();
  });

  // Loading should be gone
  expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
});
```

### Testing Context Updates

```javascript
it('should update context when action is dispatched', async () => {
  const { result } = renderHook(() => useAuthContext(), {
    wrapper: ({ children }) => (
      <AuthContextProvider>{children}</AuthContextProvider>
    ),
  });

  const user = mockUser();
  result.current.dispatch({ type: 'LOGIN', payload: user });

  expect(result.current.user).toBeDefined();
  expect(result.current.user.email).toBe(user.email);
});
```

### Testing Navigation

```javascript
const mockNavigate = vi.fn();

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

it('should navigate on button click', async () => {
  const user = userEvent.setup();

  renderWithProviders(<NavigationComponent />);

  await user.click(screen.getByText('Go to Home'));

  expect(mockNavigate).toHaveBeenCalledWith('/');
});
```

### Testing Error States

```javascript
it('should display error message on API failure', async () => {
  server.use(
    http.get('http://localhost:8080/data', () => {
      return HttpResponse.json(
        { message: 'Server error' },
        { status: 500 }
      );
    })
  );

  renderWithProviders(<DataComponent />);

  await waitFor(() => {
    expect(screen.getByText(/Error:/i)).toBeInTheDocument();
  });
});
```

---

## Best Practices

### 1. Use Testing Library Queries Wisely

**Priority order:**
1. `getByRole` - Most accessible
2. `getByLabelText` - For form fields
3. `getByPlaceholderText` - When no label exists
4. `getByText` - For non-interactive elements
5. `getByTestId` - Last resort

```javascript
// Good
screen.getByRole('button', { name: 'Submit' });
screen.getByLabelText('Email');

// Avoid when possible
screen.getByTestId('submit-button');
```

### 2. Test User Behavior, Not Implementation

```javascript
// Good - Tests what user sees and does
it('should login user', async () => {
  const user = userEvent.setup();
  renderWithProviders(<Login />);

  await user.type(screen.getByPlaceholderText('Email'), 'test@example.com');
  await user.click(screen.getByText('Login'));

  await waitFor(() => {
    expect(screen.getByText('Welcome')).toBeInTheDocument();
  });
});

// Bad - Tests implementation details
it('should call setState', () => {
  const { result } = renderHook(() => useLogin());
  result.current.setEmail('test@example.com');
  expect(result.current.email).toBe('test@example.com');
});
```

### 3. Avoid Testing Library Implementation Details

Don't test:
- Internal component state
- Private methods
- Implementation details that users don't interact with

Do test:
- What users see
- What users can do
- What happens when users interact

### 4. Use waitFor for Async Updates

```javascript
// Good
await waitFor(() => {
  expect(screen.getByText('Data loaded')).toBeInTheDocument();
});

// Bad - Can cause flaky tests
await new Promise(resolve => setTimeout(resolve, 1000));
expect(screen.getByText('Data loaded')).toBeInTheDocument();
```

### 5. Clean Up Between Tests

Vitest automatically cleans up between tests with the setup in `tests/setup.js`:

```javascript
afterEach(() => {
  cleanup(); // Unmounts React components
  server.resetHandlers(); // Resets MSW handlers
  vi.clearAllMocks(); // Clears mock function calls
  localStorageMock.clear(); // Clears localStorage
});
```

### 6. Mock External Dependencies

```javascript
// Mock react-router-dom navigation
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

// Mock complex child components
vi.mock('../../../src/components/ComplexChild', () => ({
  default: ({ prop1 }) => <div>Mocked: {prop1}</div>,
}));
```

### 7. Use Descriptive Test Names

```javascript
// Good
it('should show error message when login fails with invalid credentials', () => {});

// Bad
it('test login', () => {});
```

### 8. Group Related Tests

```javascript
describe('Login component', () => {
  describe('Rendering', () => {
    it('should render form fields', () => {});
    it('should render submit button', () => {});
  });

  describe('Validation', () => {
    it('should require email', () => {});
    it('should require password', () => {});
  });

  describe('Submission', () => {
    it('should submit with valid data', () => {});
    it('should show error with invalid data', () => {});
  });
});
```

---

## Troubleshooting

### Common Issues

#### 1. "Cannot find module" errors

**Solution:** Ensure path aliases in `vitest.config.js` match `vite.config.js`:

```javascript
resolve: {
  alias: {
    '@': path.resolve(__dirname, './src'),
    '@components': path.resolve(__dirname, './src/components'),
  },
}
```

#### 2. Tests timing out

**Solution:** Increase timeout or check for missing `await`:

```javascript
it('should load data', async () => {
  renderWithProviders(<Component />);

  // Make sure to await async operations
  await waitFor(() => {
    expect(screen.getByText('Data')).toBeInTheDocument();
  });
}, 10000); // Increase timeout to 10s
```

#### 3. Act warnings

**Solution:** Wrap state updates in `waitFor`:

```javascript
// Instead of
user.click(button);
expect(something).toBe(true);

// Do
await user.click(button);
await waitFor(() => {
  expect(something).toBe(true);
});
```

#### 4. MSW handlers not working

**Solution:** Check handler URL matches exactly:

```javascript
// Make sure base URL matches
const BASE_URL = 'http://localhost:8080';
http.post(`${BASE_URL}/auth/login`, handler);
```

#### 5. Context errors in tests

**Solution:** Ensure component is wrapped with provider:

```javascript
// Use renderWithProviders for components needing context
renderWithProviders(<MyComponent />, {
  providerProps: {
    authState: { user: mockUser() },
  },
});
```

### Debug Tools

**1. Screen debug:**
```javascript
import { screen } from '@testing-library/react';

// Print entire DOM
screen.debug();

// Print specific element
screen.debug(screen.getByText('Hello'));
```

**2. Test UI:**
```bash
npm run test:ui
```

Opens interactive browser UI showing test results, file coverage, and console logs.

**3. Verbose logging:**
```bash
npm test -- --reporter=verbose
```

---

## Additional Resources

- [Vitest Documentation](https://vitest.dev/)
- [React Testing Library](https://testing-library.com/react)
- [MSW Documentation](https://mswjs.io/)
- [Testing Library Queries](https://testing-library.com/docs/queries/about)
- [Common Mistakes](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)

---

## Contributing

When adding new tests:

1. Follow existing patterns in similar test files
2. Use descriptive test names
3. Group related tests with `describe` blocks
4. Test both happy paths and error cases
5. Mock external dependencies appropriately
6. Update this README if adding new testing patterns

---

**Last Updated:** 2025-01-06
