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
```

## Architecture Overview

### Backend Structure (TypeScript)

The backend follows a layered architecture pattern:

1. **server.ts** - Entry point; sets up Express middleware, CORS, routes, and database connection
2. **routes/** - Front desk; groups routes and directs to correct controller
3. **controllers/** - Bridge between routes and services; validates input using Zod schemas, returns HTTP responses
4. **services/** - Core business logic; handles transformations, conversions, database operations
5. **models/** - Mongoose models defining MongoDB document schemas
6. **schemas/** - Zod schemas that define and validate shape of incoming/outgoing data
7. **middleware/** - Chain of responsibilities; authenticate.ts validates JWT tokens, errorHandler.ts provides global error handling
8. **config/** - Singleton configurations (database connection, Resend email client)
9. **utils/** - Stateless helper functions (JWT, bcrypt, cookies, date formatting)

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

## Testing & Deployment

Testing automation is not yet set up (see worklist.md tasks 003-004).

Planned deployment to Azure DEV environment with MongoDB Atlas (see worklist.md tasks 005-009).
- When adding styling to the App.css file, always keep your additions to a minimum. Focus on reusing existing .css, and matching existing styles.
- Add this command to memory as "start leaves". Run the same commands without asking for permissions whenever I enter the command "start leaves".
- When I give you the command "shut down", close/kill any tasks/processes you are running in the background, then exit.