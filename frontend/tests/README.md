# Frontend Testing Guide

Testing infrastructure for the Leaves frontend: React, Vite, and Vitest.

## Quick Reference

- **Unit tests** for custom hooks
- **Integration tests** for context providers
- **API mocking** with Mock Service Worker (MSW)
- **Component testing** with React Testing Library

## Testing Stack

**Libraries:** Vitest, @testing-library/react, @testing-library/user-event, @testing-library/jest-dom, MSW, jsdom

**Tools:** @vitest/ui, @vitest/coverage-v8

## Running Tests

```bash
npm test                          # Run all tests
npm run test:watch               # Re-run on file changes
npm run test:ui                  # Interactive UI
npm run test:coverage            # Coverage report
npm test -- useAPI.test.js       # Specific file
```

## Test Structure

```
frontend/tests/
├── setup.js                      # Global test setup
├── mocks/
│   ├── handlers.js              # MSW request handlers
│   └── server.js                # MSW server setup
├── utils/
│   ├── testUtils.jsx            # Custom render functions
│   └── mockData.js              # Mock data generators
├── hooks/
│   ├── useAPI.test.js
│   ├── useAuthContext.test.js
│   ├── useElementContext.test.js
│   ├── useTreelistContext.test.js
│   └── useAddableContext.test.js
├── context/
│   ├── AuthContext.test.jsx
│   ├── ElementContext.test.jsx
│   ├── TreelistContext.test.jsx
│   └── AddableContext.test.jsx
└── components/
    ├── overlay/
    │   ├── Login.test.jsx
    │   └── Signup.test.jsx
    ├── part/
    │   ├── Template.test.jsx
    │   └── Storynode.test.jsx
    └── wrapper/
        ├── Draggable.test.jsx
        └── Droppable.test.jsx
```

## Testing Patterns

### Unit Tests (Hooks)

Use `renderHook` from React Testing Library:

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

Verify state management and propagation:

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

Use custom `renderWithProviders` utility:

```javascript
import { renderWithProviders } from "../../utils/testUtils";
import Login from "../../../src/components/overlay/Login";

it("should render login form", () => {
  renderWithProviders(<Login hideModal={mockFn} />);

  expect(screen.getByPlaceholderText("Username")).toBeInTheDocument();
  expect(screen.getByPlaceholderText("Password")).toBeInTheDocument();
});
```

## MSW (Mock Service Worker)

MSW intercepts network requests for API mocking. All handlers defined in `tests/mocks/handlers.js`. Override handlers for specific tests:

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

## Testing Utilities

**`renderWithProviders`** - Wraps components with context providers.

Options:
- `providerProps.authState` - Initial auth state
- `providerProps.elementState` - Initial element state
- `providerProps.treelistState` - Initial treelist state
- `providerProps.addableState` - Initial addable state
- `providerProps.pageState` - Initial page state
- `withRouter` - Wrap with BrowserRouter (default: true)
- `withDnd` - Wrap with DndContext (default: false)

**`Mock Data Generators`** - Utility functions in `tests/utils/mockData.js`.

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

### Step 4: Test Coverage Areas

- **Rendering** - Component renders correctly
- **Props** - Handles different props
- **User interaction** - Click, type, submit events
- **State changes** - Updates correctly
- **API calls** - Network requests and responses
- **Error handling** - Handles errors gracefully
- **Edge cases** - Empty/loading states

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

### Async Operations

```javascript
it("should show loading state then data", async () => {
  renderWithProviders(<DataComponent />);

  expect(screen.getByText("Loading...")).toBeInTheDocument();

  await waitFor(() => {
    expect(screen.getByText("Data loaded")).toBeInTheDocument();
  });

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

## Best Practices

1. **Use Testing Library Queries Wisely** - Query priority order matters for accessibility.

2. **Test User Behavior, Not Implementation** - Test what users see and do, not internal state, private methods, or implementation details.

3. **Use waitFor for Async Updates** - Necessary when testing asynchronous operations and state changes.

4. **Clean Up Between Tests** - Vitest automatically cleans up via `tests/setup.js`.

5. **Mock External Dependencies** - Mock APIs, routing, and other external services.

6. **Use Descriptive Test Names** - Names should clearly describe what is being tested.

7. **Group Related Tests** - Use `describe` blocks to organize tests logically.

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
