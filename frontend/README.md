# Leaves Frontend

React single-page application for tree-structured content creation with drag-and-drop, markdown editing, and real-time word tracking.

## Table of Contents

- [Technology Stack](#technology-stack)
- [Installation & Setup](#installation--setup)
- [Architecture Overview](#architecture-overview)
- [Component Structure](#component-structure)
- [State Management](#state-management)
- [API Communication](#api-communication)
- [Drag-and-Drop System](#drag-and-drop-system)
- [Theming System](#theming-system)
- [Development Workflow](#development-workflow)
- [Troubleshooting](#troubleshooting)

## Technology Stack

### Core Technologies

- React 19 with JavaScript ES6+
- Vite build tool with HMR
- React Router DOM v7 for routing
- Axios for HTTP with interceptors
- @dnd-kit/core for drag-and-drop
- TipTap for markdown editing
- Vitest with React Testing Library

### Key Dependencies

- **@dnd-kit/core** - Modern drag-and-drop toolkit
- **@tiptap/react** - Headless rich-text editor
- **tiptap-markdown** - Markdown serializer for TipTap
- **axios** - Promise-based HTTP client
- **react-router-dom** - Client-side routing
- **msw** - Mock Service Worker for testing
- **eslint** - Code linting

## Installation & Setup

### Prerequisites

- Node.js 18.x or higher
- npm 9.x or higher
- Backend server running (see `backend/README.md`)

### Steps

1. Clone repository and navigate to frontend directory.

```bash
cd LeavesApp/frontend
npm install
```

2. Create `.env` file with backend URL.

```env
VITE_BASEAPIURL=http://localhost:8080/
```

All Vite variables require `VITE_` prefix. Access via `import.meta.env.VITE_VARIABLENAME`.

3. Start backend server.

```bash
cd ../backend
npm run dev
```

4. Start frontend development server.

```bash
npm run dev
```

Frontend runs at `http://localhost:5173` with hot module replacement.

## Architecture Overview

Single-page application with client-side routing and Context API state management.

```
main.jsx → App.jsx → Router → DndContext → Routes
→ Context Providers → Pages → Components → API Service
```

### Directory Structure

```
src/
├── main.jsx                    # Entry point
├── App.jsx                     # Root component with routing
├── App.css                     # Global styles and CSS variables
├── components/
│   ├── layout/                 # Page structure
│   │   ├── Navbar.jsx          # Top navigation bar
│   │   ├── AddSidebar.jsx      # Right sidebar for creating elements
│   │   └── LinkSidebar.jsx     # Left sidebar navigation
│   ├── part/                   # Reusable UI components
│   │   ├── Template.jsx        # Template card
│   │   ├── Storynode.jsx       # Storynode card
│   │   ├── TemplateCreate.jsx  # Template creation form
│   │   ├── StorynodeCreate.jsx # Storynode creation form
│   │   ├── ElementList.jsx     # Element grid list
│   │   ├── ExpandList.jsx      # Expandable tree list
│   │   ├── ElementFeature.jsx  # Detail view with editor
│   │   ├── Searchbar.jsx       # Search and filter
│   │   ├── RubbishPile.jsx     # Drag-to-delete zone
│   │   ├── ThemeToggle.jsx     # Light/dark theme switcher
│   │   └── common/             # Shared UI elements
│   ├── overlay/                # Modal components
│   │   ├── Login.jsx           # Login form
│   │   ├── Signup.jsx          # Signup form
│   │   ├── ForgotPassword.jsx  # Password reset request
│   │   ├── ResetPassword.jsx   # Password reset form
│   │   ├── VerifyEmail.jsx     # Email verification
│   │   └── DeleteConfirmation.jsx # Deletion confirmation
│   └── wrapper/                # Higher-order components
│       ├── AuthContainer.jsx   # Protected route wrapper
│       ├── Draggable.jsx       # Drag source wrapper
│       └── Droppable.jsx       # Drop target wrapper
├── pages/
│   ├── publicPages/            # Unauthenticated routes
│   │   ├── Landing.jsx         # Landing page
│   │   └── FormPage.jsx        # Generic form page
│   └── protectedPages/         # Authenticated routes
│       ├── Stories.jsx         # Main storynodes list
│       ├── Templates.jsx       # Templates library
│       ├── Archive.jsx         # Archived storynodes
│       ├── TemplateDetail.jsx  # Template detail/edit
│       └── StorynodeDetail.jsx # Storynode detail/edit
├── context/                    # React Context providers
│   ├── AuthContext.jsx         # Authentication state
│   ├── ElementContext.jsx      # Current element state
│   ├── PageContext.jsx         # Page navigation state
│   ├── TreelistContext.jsx     # Element list state
│   ├── AddableContext.jsx      # Addable elements state
│   └── DragHandlerContext.js   # Drag-and-drop state
├── hooks/                      # Custom React hooks
│   ├── useAuthContext.js       # Auth context hook
│   ├── useElementContext.js    # Element context hook
│   ├── usePageContext.js       # Page context hook
│   ├── useTreelistContext.js   # Treelist context hook
│   ├── useAddableContext.js    # Addable context hook
│   ├── useAPI.js               # API request wrapper
│   ├── usePage.js              # Page navigation helper
│   └── useDropHandler.js       # Drag-and-drop handler
├── services/
│   └── apiService.js           # API method definitions
├── config/
│   ├── apiClient.js            # Axios instance with interceptors
│   └── dndConfig.js            # Drag-and-drop configuration
└── tests/                      # Test files (see tests/README.md)
```

## Component Structure

### Layout Components

**Navbar** - Top navigation with logo, theme toggle, user menu, and logout.

**AddSidebar** - Right sidebar containing TemplateCreate and StorynodeCreate forms.

**LinkSidebar** - Left sidebar with navigation links to Stories, Templates, Archive.

### Part Components

**Template** - Card displaying template with name, type, text preview. Draggable and clickable.

**Storynode** - Card displaying storynode with name, type, completion status, word count. Draggable and archivable.

**ElementList** - Renders filtered grid of templates or storynodes.

**ExpandList** - Tree-structured list with expand/collapse for parent-child relationships.

**ElementFeature** - Detail view with TipTap markdown editor, metadata, save/cancel/delete actions.

**Searchbar** - Search and filter interface with type filtering.

**RubbishPile** - Drag-and-drop delete zone with visual feedback.

**ThemeToggle** - Light/dark mode switcher with localStorage persistence.

### Overlay Components

**Login** - Login form with email/password and error handling.

**Signup** - Signup form with email/password/username and validation.

**DeleteConfirmation** - Confirmation modal showing element details and descendant warning.

**ForgotPassword** - Password reset request form.

**ResetPassword** - Password reset form with verification code.

**VerifyEmail** - Email verification status display.

### Wrapper Components

**AuthContainer** - Higher-order component protecting routes. Redirects unauthenticated users to login.

**Draggable** - HOC making components draggable with @dnd-kit. Provides visual feedback.

**Droppable** - HOC defining drop zones with validation and visual feedback.

### Page Components

**Protected Pages** (require authentication):
- **Stories** - Main dashboard with active storynodes
- **Templates** - Template library with search/filter
- **Archive** - Archived storynodes
- **TemplateDetail** - Edit/view template with tree navigation
- **StorynodeDetail** - Edit/view storynode with word tracking

**Public Pages**:
- **Landing** - Marketing page for unauthenticated users
- **FormPage** - Generic form page for login/signup/password reset/verification

## State Management

State managed via React Context API with specialized contexts.

### AuthContext

**State**: `user` (current user object or null), `isLoading` (auth check in progress)

**Actions**: `LOGIN`, `LOGOUT`, `SET_LOADING`

**Hook**: `useAuthContext()`

```javascript
import { useAuthContext } from '../hooks/useAuthContext';

const { user, isLoading, dispatch } = useAuthContext();
```

### ElementContext

**State**: `element` (current element), `children` (child nodes), `isLoading`

**Actions**: `SET_ELEMENT`, `SET_CHILDREN`, `UPDATE_ELEMENT`, `SET_LOADING`

**Hook**: `useElementContext()`

```javascript
import { useElementContext } from '../hooks/useElementContext';

const { element, children, isLoading, dispatch } = useElementContext();
```

### PageContext

**State**: `page` (current page identifier)

**Actions**: `SET_PAGE`

**Hook**: `usePageContext()`

### TreelistContext

**State**: `treelist` (all elements), `filteredList` (filtered elements), `isLoading`, `filters`

**Actions**: `SET_TREELIST`, `ADD_ELEMENT`, `UPDATE_ELEMENT`, `DELETE_ELEMENT`, `SET_FILTERS`, `SET_LOADING`

**Hook**: `useTreelistContext()`

### AddableContext

**State**: `addableList` (addable templates), `isLoading`

**Actions**: `SET_ADDABLE_LIST`, `SET_LOADING`

**Hook**: `useAddableContext()`

### Context Pattern

Always use custom hooks to access context values. Never use `useContext` directly. This provides type safety, error handling, and consistent API.

```javascript
// Correct
const { user } = useAuthContext();

// Incorrect
const { user } = useContext(AuthContext);
```

## API Communication

All backend API calls use `useAPI` hook with methods defined in `apiService.js`.

### useAPI Hook

**Returns**: `apiCall(method, ...params)`, `error` (error message), `isPending` (loading state)

```javascript
import { useAPI } from '../hooks/useAPI';

const { apiCall, error, isPending } = useAPI();

const handleLogin = async () => {
  const user = await apiCall('login', email, password);
  if (user) {
    dispatch({ type: 'LOGIN', payload: user });
  }
};
```

### API Service Methods

**Authentication**:
- `signup(email, password, username)` - Register user
- `login(email, password)` - Authenticate user
- `logout()` - End session
- `getUser()` - Get current user
- `forgotPassword(email)` - Request password reset
- `resetPassword(verificationCode, password)` - Reset password
- `verifyEmail(code)` - Verify email

**Templates**:
- `getTemplates(query)` - Fetch templates with optional filters
- `getTemplateById(id)` - Fetch single template
- `getTemplateChildren(id)` - Fetch template children
- `upsertTemplate(data)` - Create or update template
- `deleteTemplate(id)` - Delete template and descendants

**Storynodes**:
- `getStorynodes(query)` - Fetch storynodes with optional filters
- `getStorynodeById(id)` - Fetch single storynode
- `getStorynodeChildren(id)` - Fetch storynode children
- `upsertStorynode(data)` - Create or update storynode
- `deleteStorynode(id)` - Delete storynode and descendants
- `createStorynodeFromTemplate(templateId, parentId)` - Create storynode tree from template

### API Client Configuration

**Base Configuration** (`config/apiClient.js`):
- Base URL from `VITE_BASEAPIURL` environment variable
- `withCredentials: true` - Sends cookies with requests
- Automatic response unwrapping (returns `response.data`)
- Token refresh interceptor on 401 errors

**Token Refresh Flow**:
1. API request fails with 401 InvalidAccessToken error
2. Interceptor calls `/auth/refresh` automatically
3. If refresh succeeds, retry original request
4. If refresh fails, dispatch logout event

## Drag-and-Drop System

Powered by @dnd-kit/core for accessible drag-and-drop.

### Configuration

**DndContext** wraps app in `App.jsx` with custom collision detection and pointer sensor with 10px activation distance.

**Collision Detection** (`config/dndConfig.js`) - Custom algorithm prioritizing closest droppable zones.

**Drag Handler** (`config/dndConfig.js`) - `handleDragEnd(event)` determines drag type (template-to-story, organization, delete), calls API, updates context.

### Drag Sources

**Draggable Wrapper** makes components draggable, passes element data, provides visual feedback.

**Draggable Components**: Template cards (create storynodes), Storynode cards (organize/archive/delete).

### Drop Targets

**Droppable Wrapper** defines drop zones with validation and visual feedback.

**Droppable Components**: Storynode cards (set parent), RubbishPile (delete), Archive zone (archive).

### Common Operations

**Create Storynode from Template**:
1. Drag template from AddSidebar
2. Drop on storynode (becomes parent) or Stories page (becomes root)
3. Calls `createStorynodeFromTemplate(templateId, parentId)`
4. Creates entire tree recursively

**Delete Element**:
1. Drag template/storynode
2. Drop on RubbishPile
3. Shows DeleteConfirmation modal
4. Calls `deleteTemplate(id)` or `deleteStorynode(id)`

**Archive Storynode**:
1. Drag storynode
2. Drop on archive zone
3. Updates `archived: true`
4. Moves to Archive page

## Theming System

Light/dark theme toggle with CSS variables.

### CSS Variables

**Light Theme** (`:root` in `App.css`):
```css
:root {
  --c-txtPrimary: #333;
  --c-bgPrimary: #fff;
  --c-accent: #4a9eff;
}
```

**Dark Theme** (`[data-theme='dark']` in `App.css`):
```css
[data-theme='dark'] {
  --c-txtPrimary: #f0f0f0;
  --c-bgPrimary: #1a1a1a;
  --c-accent: #6bb6ff;
}
```

### Theme Toggle

**ThemeToggle Component** reads theme from localStorage, toggles `data-theme` attribute on `<html>` element, persists preference.

### Styling Conventions

**CSS Class Naming** (BEM-like):
- Component: `.component-name`
- Container: `.component-name.container`
- Element: `.component-name__element`
- Modifier: `.component-name--modifier`

**Color Usage**:
- Use CSS variables for all colors: `color: var(--c-txtPrimary)`
- Never hardcode color values
- Follow naming: `--c-*` (color), `--s-*` (size), `--f-*` (font)

## Development Workflow

### Starting Development

1. Ensure backend server running (`cd backend && npm run dev`)
2. Configure `.env` with `VITE_BASEAPIURL`
3. Run `npm run dev` in frontend directory
4. Open `http://localhost:5173`

### Making Changes

**Components**:
- Place in appropriate directory (`layout/`, `part/`, `overlay/`, `wrapper/`)
- Use context hooks at component top
- Handle loading/error states
- Follow CSS class naming conventions

**Context/State**:
- Add actions to existing contexts or create new context
- Provide custom hook for accessing context
- Update context providers in parent components

**API Methods**:
- Add method to `apiService.js`
- Use via `useAPI` hook
- Handle errors and loading states in components

**Styling**:
- Add component styles to `App.css`
- Use CSS variables for colors, sizes, fonts
- Match existing patterns (BEM-like naming)
- Keep additions minimal, reuse existing styles

### Commands

```bash
npm run dev              # Start development server
npm run build            # Build production bundle
npm run preview          # Preview production build
npm run lint             # Run linter
npm test                 # Run all tests
npm run test:watch       # Tests in watch mode
npm run test:ui          # Tests with Vitest UI
npm run test:coverage    # Generate coverage report
```

Production build outputs to `dist/` directory.

## Troubleshooting

### Backend Connection Issues

**Symptoms**: `Network Error` or `ERR_CONNECTION_REFUSED`

**Solutions**:
- Verify backend running at `http://localhost:8080`
- Check `VITE_BASEAPIURL` in `.env` matches backend URL with trailing slash
- Verify CORS configuration in backend `app.ts` allows frontend origin
- Check browser console for CORS errors
- Ensure `withCredentials: true` in `apiClient.js`

### Authentication Issues

**Symptoms**: "Not authenticated" errors or constant login redirects

**Solutions**:
- Clear browser cookies (DevTools → Application → Cookies)
- Verify backend JWT secrets configured correctly
- Check `withCredentials: true` set in axios config
- Ensure cookies sent with requests (DevTools → Network → Headers)
- Verify token refresh interceptor working (check `/auth/refresh` calls in Network tab)

### Drag-and-Drop Not Working

**Symptoms**: Elements not draggable or drops not registering

**Solutions**:
- Verify `DndContext` wraps all draggable/droppable components in `App.jsx`
- Check `Draggable` and `Droppable` wrappers correctly applied
- Ensure drag activation distance threshold met (10px minimum)
- Verify `handleDragEnd` defined in `dndConfig.js`
- Check console for drag errors

### Environment Variables Not Loading

**Symptoms**: `import.meta.env.VITE_BASEAPIURL` is undefined

**Solutions**:
- Ensure `.env` file exists in `frontend/` directory
- Verify variable name starts with `VITE_` prefix
- Restart Vite dev server after changing `.env`
- Check `.env` file format is correct

### Hot Module Replacement Not Working

**Symptoms**: Changes not reflected without full reload

**Solutions**:
- Check Vite dev server running without errors
- Verify file extensions correct (`.jsx` for React components)
- Restart dev server (Ctrl+C then `npm run dev`)
- Clear browser cache
- Check for syntax errors

### Styling Issues

**Symptoms**: Styles not applying or theme not switching

**Solutions**:
- Verify CSS class names match between component and `App.css`
- Check CSS variables defined in `:root` and `[data-theme='dark']`
- Ensure `data-theme` attribute set on `<html>` element
- Inspect element in DevTools to verify styles applied
- Check for CSS specificity conflicts

### Context Errors

**Symptoms**: `useContext must be used within a Provider` error

**Solutions**:
- Verify context provider wraps component tree in parent component
- Check custom hook used (not raw `useContext`)
- Ensure all required providers in place (check `App.jsx` and `main.jsx`)

### TipTap Editor Issues

**Symptoms**: Markdown editor not loading or saving incorrectly

**Solutions**:
- Verify `@tiptap/react` and extensions installed correctly
- Check `tiptap-markdown` converting between markdown and editor state
- Verify editor content serialized before API calls
- Check console for TipTap errors

### Performance Issues

**Symptoms**: Slow rendering or laggy interactions

**Solutions**:
- Check for excessive re-renders (React DevTools Profiler)
- Optimize context usage (split into smaller contexts if needed)
- Implement React.memo for expensive components
- Verify large lists use virtualization
- Check Network tab for slow API calls
- Consider pagination for large datasets

---

## Additional Resources

- **React Documentation**: https://react.dev
- **Vite Documentation**: https://vitejs.dev
- **React Router**: https://reactrouter.com
- **@dnd-kit**: https://docs.dndkit.com
- **TipTap**: https://tiptap.dev
- **Axios**: https://axios-http.com
- **Vitest**: https://vitest.dev
- **React Testing Library**: https://testing-library.com/react

See `tests/README.md` for testing guidelines.

See `backend/README.md` for backend setup and API reference.

---

## License

ISC

## Author

Sander VanWilligen
