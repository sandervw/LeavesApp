# Leaves AI Assistant Instructions

Leaves is a writing tool that helps you create reusable templates for your writing projects. You build your templates in a treelike structure consisting of a root, branches, and leaves. Once your template is ready, you can drag and drop it to start a new piece of writing. Users can create and login to their accounts to access features like word limits, markdown editing, and downloads.

## Architecture Overview

### Backend (TypeScript)
- Node.js + Express for API server
- MongoDB with Mongoose for data persistence
- JWT + Cookie-based authentication
- Zod for request validation

### Frontend (JavaScript + React)
- Vite as build tool and dev server
- Context-based state management
- CSS variables for theming
- DnD-kit for drag-and-drop functionality
- Tiptap for rich text markdown editing

## Project Structure

### Backend
- `src/models`: Mongoose models for MongoDB collections
- `src/routes`: Express route handlers for API endpoints
- `src/controllers`: Business logic for handling requests
- `src/middleware`: Custom middleware for authentication and error handling
- `src/utils`: Utility functions and helpers

### Frontend
- `src/components/`:
  - `layout/`: Page structure (Navbar, sidebars)
  - `part/`: Reusable UI components
  - `overlay/`: Modal components
  - `wrapper/`: Higher-order components
- `src/pages/`:
  - `protectedPages/`: Auth-required routes
  - `publicPages/`: Public routes
- `src/context/`: Global state management
- `src/hooks/`: Custom React hooks
- `src/services/`: API integration

## Key Patterns and Conventions

### State Management
```jsx
// Use appropriate context hooks
const { user, dispatch: authDispatch } = useAuthContext();
const { dispatch: elementDispatch } = useElementContext();

// API calls via useAPI hook
const { error, isPending, apiCall } = useAPI();
const result = await apiCall('methodName', params);
```

### Theming
```css
/* Use CSS variables for theming */
:root {
  --c-txtPrimary: var(--c-black);
  --c-bgPrimary: var(--c-white);
}
[data-theme='dark'] {
  --c-txtPrimary: var(--c-white);
  --c-bgPrimary: var(--c-black);
}
```

### Component Structure
```jsx
const Component = () => {
  // Context and API hooks
  const { state, dispatch } = useRelevantContext();
  const { error, isPending, apiCall } = useAPI();
  
  useEffect(() => {
    // Setup/cleanup
  }, []);

  return (
    <div className="component-name container">
      {/* Content */}
    </div>
  );
};
```

### Protected Routes
```jsx
<Route path='/' element={<AuthContainer />}>
  <Route index element={<Stories />} />
  <Route path='/templates' element={<Templates />} />
</Route>
```

## Development Guidelines

1. Always use the useAPI hook for backend calls
2. Follow existing BEM-like CSS class naming
3. Test components in both light/dark themes
4. Use appropriate context providers for state
5. Handle loading/error states consistently
6. Use protected routes for authenticated content
7. Follow existing responsive design patterns
