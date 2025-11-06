# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Leaves is a content creation and storytelling tool that helps users build reusable templates in a tree-like structure (root, branches, leaves). Users can drag-and-drop templates to start new writing projects, with features like word limits, markdown editing, and file downloads.

## Development Commands

### Frontend (React + Vite)
```bash
cd frontend
npm install           # Install dependencies
npm run dev          # Start development server (http://localhost:5173)
npm run build        # Build for production
npm run lint         # Run ESLint
```

### Backend (TypeScript + Express)
```bash
cd backend
npm install          # Install dependencies
npm run dev          # Start development server with hot reload
npm run build        # Compile TypeScript and copy package.json to dist/
npm run lint         # Run ESLint on TypeScript files
npm test             # Run all tests with Vitest
npm run test:watch   # Run tests in watch mode
npm run test:ui      # Run tests with Vitest UI
npm run test:coverage # Run tests with coverage report
```

## Architecture Overview

### Backend Structure (TypeScript)

The backend follows a layered architecture pattern:

1. **server.ts** - Entry point; imports app from app.ts and starts the server
2. **app.ts** - Express application setup; configures middleware, CORS, routes, and error handling (separated for testing)
3. **routes/** - Front desk; groups routes and directs to correct controller
   - auth.route.ts, user.route.ts, session.route.ts, template.route.ts, storynode.route.ts
4. **controllers/** - Bridge between routes and services; validates input using Zod schemas, returns HTTP responses
   - auth.controller.ts, user.controller.ts, session.controller.ts, template.controller.ts, storynode.controller.ts
5. **services/** - Core business logic using inheritance pattern; handles transformations, conversions, database operations
   - tree.service.ts (base class with generic CRUD operations)
   - template.service.ts (extends TreeService)
   - storynode.service.ts (extends TreeService with additional word count logic)
   - auth.service.ts (standalone authentication service)
   - recursive.service.ts (utility functions for tree operations)
6. **models/** - Mongoose models defining MongoDB document schemas
   - tree.model.ts (base model), template.model.ts, storynode.model.ts, user.model.ts, session.model.ts, verificationCode.model.ts
7. **schemas/** - Zod schemas that define and validate shape of incoming/outgoing data
8. **middleware/** - Chain of responsibilities; authenticate.ts validates JWT tokens, errorHandler.ts provides global error handling
9. **config/** - Singleton configurations (database connection, Resend email client)
10. **constants/** - Application constants (error codes, HTTP status codes, verification types, environment variables)
11. **utils/** - Stateless helper functions (JWT, bcrypt, cookies, date formatting, assertions, error handling, email)

### Frontend Structure (JavaScript + React)

Component organization:
- **components/layout/** - Page structure (Navbar, AddSidebar, LinkSidebar)
- **components/part/** - Reusable UI components (Template, Storynode, ThemeToggle, etc.)
- **components/overlay/** - Modal components (Login, Signup, DeleteConfirmation, etc.)
- **components/wrapper/** - Higher-order components (AuthContainer, Draggable, Droppable)
- **pages/protectedPages/** - Auth-required routes (Stories, Templates, Archive, TemplateDetail, StorynodeDetail)
- **pages/publicPages/** - Public routes (Landing, FormPage)
- **context/** - Global state management with Context API (AuthContext, ElementContext, PageContext, TreelistContext, AddableContext)
- **hooks/** - Custom React hooks (useAPI, useAuthContext, useElementContext, etc.)
- **services/** - API integration via apiService.js
- **config/** - DnD-Kit drag-and-drop configuration

## Key Architectural Patterns

### Service Inheritance Pattern

Services use an object-oriented inheritance pattern to share common functionality:

- **TreeService\<T\>** - Base class with generic type parameter; provides common CRUD operations:
  - `find(userId, query?)` - Get all elements for user with optional query
  - `findById(userId, id)` - Get single element by ID
  - `findChildren(userId, id)` - Get children of an element
  - `upsert(userId, data)` - Create or update element
  - `deleteById(userId, id)` - Delete element and all descendants
- **TemplateService** - Extends TreeService\<TemplateDoc\>; inherits all base CRUD methods
- **StorynodeService** - Extends TreeService\<StorynodeDoc\>; overrides `upsert()` to handle word count calculations

All services are exported as singleton instances (e.g., `export default new TemplateService()`).

**RecursiveService** provides utility functions for complex tree operations:
- `recursiveUpdateWordLimits(node)` - Updates word limits throughout tree
- `recursiveGetDescendants(tree, model)` - Gets all descendants iteratively
- `recursiveStorynodeFromTemplate(userId, templateId, parentId?)` - Creates storynode tree from template

### Data Model: Tree Structure with Discriminators

The core data model uses Mongoose discriminators to implement inheritance:

- **Tree** (base model) - Represents any tree node with name, type, text, children array, parent reference, and userId
- **Template** (discriminator) - Extends Tree, adds wordWeight field; used for reusable content templates
- **Storynode** (discriminator) - Extends Tree, adds isComplete, wordWeight, wordLimit, wordCount, archived; used for actual story content

All stored in a single MongoDB collection ('trees') with a 'kind' discriminator field. Parent-child relationships are managed through the children array and parent reference.

### Authentication Flow

- JWT-based authentication with access and refresh tokens
- Access token stored in memory (short-lived)
- Refresh token stored in httpOnly secure cookie
- authenticate.ts middleware verifies JWT on protected routes
- Cookie security settings configured in utils/cookies.ts
- Token refresh handled by auth/refresh endpoint

### State Management (Frontend)

Use Context API with multiple specialized contexts:
- **AuthContext** - User authentication state and dispatch
- **ElementContext** - Current element (Template/Storynode) being viewed/edited
- **PageContext** - Current page state and navigation
- **TreelistContext** - List of tree elements with filtering/sorting
- **AddableContext** - Manages addable elements in sidebar

Always use the corresponding custom hooks (useAuthContext, useElementContext, etc.) to access context values.

### API Communication Pattern

All backend API calls go through the useAPI hook:

```javascript
const { error, isPending, apiCall } = useAPI();
const result = await apiCall('methodName', params);
```

API methods are defined in services/apiService.js and use the configured axios instance from config/apiClient.

### Theming System

CSS variables define light/dark themes:
- Variables defined in :root for light theme
- [data-theme='dark'] overrides for dark theme
- ThemeToggle component manages theme state
- Use CSS variable naming convention: --c-txtPrimary, --c-bgPrimary, etc.

### Drag-and-Drop System

Powered by @dnd-kit/core:
- DndContext wraps the entire app in App.jsx
- Draggable wrapper makes components draggable
- Droppable wrapper defines drop zones
- customCollisionDetectionAlgorithm and handleDragEnd configured in config/dndConfig.js
- Used for template-to-story creation and element organization

## Environment Variables (Backend)

Required in `.env`:
```
NODE_ENV=development
PORT=8080
MONGO_URI=<mongodb-connection-string>
JWT_SECRET=<jwt-signing-secret>
JWT_REFRESH_SECRET=<refresh-token-secret>
APP_ORIGIN=http://localhost:5173
EMAIL_SENDER=<email-sender-address>
RESEND_API_KEY=<resend-api-key>
```

## Important Development Notes

1. **Protected Routes**: All routes except /auth/* require authentication via authenticate middleware
2. **Error Handling**: Global error handler in errorHandler.ts catches all errors; use appAssert utility for controlled errors
3. **Schema Validation**: Always validate request bodies using Zod schemas defined in schemas/controller.schema.ts
4. **Tree Operations**: Complex tree operations (recursive traversal, parent-child updates) are handled by recursive.service.ts and tree.service.ts
5. **BEM-like CSS**: Follow existing CSS class naming conventions for consistency
6. **Component Pattern**: Components should use context hooks at the top, handle loading/error states, and render with className="component-name container"
7. **Word Limits**: Word limit functionality on storynodes needs fixing (see worklist.md)

## Common API Endpoints

- POST /auth/signup - Register new user
- POST /auth/login - Login user
- GET /auth/logout - Logout user
- GET /auth/refresh - Refresh access token
- GET /user - Get current user
- GET /template - Fetch user's templates
- POST /template - Create/update template
- GET /storynode - Fetch user's storynodes
- POST /storynode - Create/update storynode
- POST /storynode/postfromtemplate - Create storynode tree from template
- GET /storynode/getchildren/:id - Get children of a storynode
- DELETE /template/:id - Delete template
- DELETE /storynode/:id - Delete storynode

## Testing Architecture

### Testing Framework: Vitest

The backend has a comprehensive test suite using Vitest with MongoDB Memory Server for integration tests.

**Test Structure:**
```
tests/
├── setup.ts                              # Global setup with MongoDB Memory Server
├── README.md                             # 256-line comprehensive testing guide
├── unit/
│   ├── utils/                            # Unit tests for all utility functions (7 files)
│   ├── services/                         # Unit tests for services (4 files)
│   └── schemas/                          # Zod schema validation tests
└── integration/
    ├── helpers.ts                        # Test helper functions
    └── controllers/                      # Integration tests for all controllers (5 files)
```

**Test Statistics:**
- 17 test files covering ~6,177 lines of test code
- Unit tests: 12 files (utils, services, schemas)
- Integration tests: 5 files (all controllers fully tested)

**Testing Commands:**
```bash
npm test              # Run all tests
npm run test:watch    # Run tests in watch mode
npm run test:ui       # Run tests with Vitest UI
npm run test:coverage # Generate coverage report
```

**Key Testing Dependencies:**
- **vitest** - Fast unit test framework
- **@vitest/ui** - Interactive test UI
- **@vitest/coverage-v8** - Code coverage
- **mongodb-memory-server** - In-memory MongoDB for integration tests
- **supertest** - HTTP assertion library for API testing

**Test Configuration:**
- **vitest.config.ts** - Vitest configuration with path aliases matching tsconfig
- **tsconfig.test.json** - TypeScript config for test files
- **tests/setup.ts** - Mocks environment variables, manages MongoDB Memory Server lifecycle

**Test Helper Functions (tests/integration/helpers.ts):**
- `createAuthenticatedUser()` - Creates user and returns auth cookies for authenticated requests
- `createTemplateTree()` - Creates root→branch→leaf template structure
- `createStorynodeTree()` - Creates root→branch→leaf storynode structure

**Testing Patterns:**
- Unit tests use Vitest's mocking (`vi.mock()`) to isolate dependencies
- Integration tests use MongoDB Memory Server for real database operations
- All controller tests use supertest for HTTP assertions
- Authentication tests verify JWT token handling and refresh flow
- Tree operation tests verify recursive creation and deletion

For detailed testing guidelines, see `backend/tests/README.md`.

## Deployment

Planned deployment to Azure DEV environment with MongoDB Atlas (see worklist.md tasks 005-009).
- When adding styling to the App.css file, always keep your additions to a minimum. Focus on reusing existing .css, and matching existing styles.
- Add this command to memory as "start leaves". Run the same commands without asking for permissions whenever I enter the command "start leaves".
- When I give you the command "shut down", close/kill any tasks/processes you are running in the background, then exit.