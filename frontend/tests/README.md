# Frontend Testing Guide

Testing infrastructure for the Leaves frontend: built with React, Vite, and Vitest.

## Table of Contents

1. [Overview](#overview)
2. [Testing Stack](#testing-stack)
3. [Running Tests](#running-tests)
4. [Test Structure](#test-structure)
5. [Testing Patterns](#testing-patterns)
6. [MSW (Mock Service Worker)](#msw-mock-service-worker)
7. [Testing Utilities](#testing-utilities)
8. [Writing New Tests](#writing-new-tests)
9. [Testing Scenarios](#testing-scenarios)
10. [Best Practices](#best-practices)
11. [Contributing](#contributing)

---

## Overview

- **Unit tests** for custom hooks
- **Integration tests** for context providers
- **API mocking** with Mock Service Worker (MSW)
- **Component testing** with React Testing Library

---

## Testing Stack

### Testing Libraries

- **Vitest** - Unit test framework
- **@testing-library/react** - Component testing utils
- **@testing-library/user-event** - User interaction simulation
- **@testing-library/jest-dom** - Custom DOM matchers
- **MSW (Mock Service Worker)** - API mocking
- **jsdom** - DOM implementation for Node.js

### Development Tools

- **@vitest/ui** - Test UI
- **@vitest/coverage-v8** - Code coverage

---

## Running Tests

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
import { renderHook } from "@testing-library/react";
import useAuthContext from "../../src/hooks/useAuthContext";
import { AuthContextProvider } from "../../src/context/AuthContext";

it("should return auth context value", () => {
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
import { render, screen, waitFor } from "@testing-library/react";
import { AuthContextProvider } from "../../src/context/AuthContext";

const TestComponent = () => {
  const { user, dispatch } = useAuthContext();
  return <div>{user ? user.email : "Not logged in"}</div>;
};

it("should update state on LOGIN action", async () => {
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
import { renderWithProviders } from "../../utils/testUtils";
import Login from "../../../src/components/overlay/Login";

it("should render login form", () => {
  renderWithProviders(<Login hideModal={mockFn} />);

  expect(screen.getByPlaceholderText("Username")).toBeInTheDocument();
  expect(screen.getByPlaceholderText("Password")).toBeInTheDocument();
});
```

---

## MSW (Mock Service Worker)

MSW intercepts network requests; provides API mocking.

All API handlers defined in `tests/mocks/handlers.js`:

Can override handlers for specific tests:

```javascript
import { server } from "../../mocks/server";
import { http, HttpResponse } from "msw";

it("should handle server errors", async () => {
  server.use(
    http.get("http://localhost:8080/user", () => {
      return HttpResponse.json({ message: "Server error" }, { status: 500 });
    })
  );

  // Test error handling...
});
```

---

## Testing Utilities

**`renderWithProviders`** - Wraps components with all necessary context providers:

Options:

- `providerProps.authState` - Initial auth state
- `providerProps.elementState` - Initial element state
- `providerProps.treelistState` - Initial treelist state
- `providerProps.addableState` - Initial addable state
- `providerProps.pageState` - Initial page state
- `withRouter` - Wrap with BrowserRouter (default: true)
- `withDnd` - Wrap with DndContext (default: false)

**`Mock Data Generators`** - Utility functions for generating mock data.

Located in `tests/utils/mockData.js`:

---

## Writing New Tests

### Step 1: Create Test File

```
src/components/part/MyComponent.jsx
tests/components/part/MyComponent.test.jsx
```

### Step 2: Import Dependencies

```javascript
import { describe, it, expect } from "vitest";
import { screen } from "@testing-library/react";
import { renderWithProviders } from "../../utils/testUtils";
import MyComponent from "../../../src/components/part/MyComponent";
```

### Step 3: Write Test Structure

```javascript
describe("MyComponent", () => {
  describe("Rendering", () => {
    it("should render component with props", () => {
      renderWithProviders(<MyComponent prop1="value" />);
      expect(screen.getByText("value")).toBeInTheDocument();
    });
  });
});
```

### Step 4: Test Coverage

Test the following areas:

- **Rendering** - Component renders correctly
- **Props** - Component handles different props
- **User interaction** - Click, type, submit events
- **State changes** - Component state updates correctly
- **API calls** - Network requests and responses
- **Error handling** - Component handles errors gracefully
- **Edge cases** - Empty states, loading states, etc.

---

## Testing Scenarios

### Form Submission

```javascript
it("should submit form with user input", async () => {
  const user = userEvent.setup();
  const mockSubmit = vi.fn();

  renderWithProviders(<LoginForm onSubmit={mockSubmit} />);

  await user.type(screen.getByPlaceholderText("Email"), "test@example.com");
  await user.type(screen.getByPlaceholderText("Password"), "password123");
  await user.click(screen.getByText("Submit"));

  expect(mockSubmit).toHaveBeenCalledWith({
    email: "test@example.com",
    password: "password123",
  });
});
```

### sync Operations

```javascript
it("should show loading state then data", async () => {
  renderWithProviders(<DataComponent />);

  // Initially shows loading
  expect(screen.getByText("Loading...")).toBeInTheDocument();

  // Wait for data to load
  await waitFor(() => {
    expect(screen.getByText("Data loaded")).toBeInTheDocument();
  });

  // Loading should be gone
  expect(screen.queryByText("Loading...")).not.toBeInTheDocument();
});
```

### Context Updates

```javascript
it("should update context when action is dispatched", async () => {
  const { result } = renderHook(() => useAuthContext(), {
    wrapper: ({ children }) => (
      <AuthContextProvider>{children}</AuthContextProvider>
    ),
  });

  const user = mockUser();
  result.current.dispatch({ type: "LOGIN", payload: user });

  expect(result.current.user).toBeDefined();
  expect(result.current.user.email).toBe(user.email);
});
```

### Navigation

```javascript
const mockNavigate = vi.fn();

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

it("should navigate on button click", async () => {
  const user = userEvent.setup();

  renderWithProviders(<NavigationComponent />);

  await user.click(screen.getByText("Go to Home"));

  expect(mockNavigate).toHaveBeenCalledWith("/");
});
```

### Error States

```javascript
it("should display error message on API failure", async () => {
  server.use(
    http.get("http://localhost:8080/data", () => {
      return HttpResponse.json({ message: "Server error" }, { status: 500 });
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

**`1. Use Testing Library Queries Wisely`**

**`2. Test User Behavior, Not Implementation`**

**`3. Avoid Testing Library Implementation Details`**

Don't test:

- Internal component state
- Private methods
- Implementation details that users don't interact with

Do test:

- What users see
- What users can do
- What happens when users interact

**`4. Use waitFor for Async Updates`**

**`5. Clean Up Between Tests`**

Vitest automatically cleans up between tests with the setup in `tests/setup.js`:

**`6. Mock External Dependencies`**

**`7. Use Descriptive Test Names`**

**`8. Group Related Tests`**

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
