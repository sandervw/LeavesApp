# Leaves

A content creation and storytelling tool that helps users build reusable templates in a tree structure (root, branches, leaves), then drag-and-drop those templates to start new writing projects. Features include word limits, markdown editing, dark/light theming, and file downloads.

**Live at [wordleaves.com](https://wordleaves.com)**

## How It Works

Think of it like a set of nesting boxes for your writing:

1. **Templates** define the structure of a story (like a blueprint). A root template can have branch children, which can have leaf children, forming a tree.
2. **Storynodes** are the actual writing content. Drag a template onto your Stories page and the entire tree is created for you, ready to fill in.
3. **Word weights and limits** flow down the tree, helping you stay within target lengths at every level.
4. **Archive** completed stories to keep your workspace clean.

## Tech Stack

| Layer      | Technology                                                                        |
| ---------- | --------------------------------------------------------------------------------- |
| Frontend   | React 19, Vite, React Router v7, @dnd-kit, TipTap editor                          |
| Backend    | Node.js, TypeScript, Express 5, Mongoose, Zod                                     |
| Database   | MongoDB (Atlas in production)                                                     |
| Auth       | JWT (access + refresh tokens), bcrypt, httpOnly cookies                           |
| Testing    | Vitest, React Testing Library, MSW, MongoDB Memory Server                         |
| Deployment | Azure Static Web Apps (frontend), Azure Container Apps (backend), Azure Key Vault |

## Project Structure

```
LeavesApp/
├── frontend/          # React SPA
│   ├── src/
│   │   ├── components/    # layout, part, overlay, wrapper
│   │   ├── pages/         # publicPages, protectedPages
│   │   ├── context/       # React Context providers
│   │   ├── hooks/         # Custom hooks (useAPI, useAuthContext, etc.)
│   │   ├── services/      # API method definitions
│   │   └── config/        # Axios client, DnD config
│   └── ...
├── backend/           # Express REST API
│   ├── src/
│   │   ├── routes/        # Route definitions
│   │   ├── controllers/   # Request validation and responses
│   │   ├── services/      # Business logic (tree inheritance pattern)
│   │   ├── models/        # Mongoose schemas (discriminator pattern)
│   │   ├── schemas/       # Zod validation schemas
│   │   ├── middleware/     # Auth and error handling
│   │   ├── utils/         # JWT, bcrypt, cookies, logging
│   │   └── config/        # DB connection, Key Vault, security
│   └── tests/             # Unit and integration tests
├── documentation/     # Detailed docs (backend, frontend, deployment, standards)
└── CLAUDE.md          # AI assistant context
```

## Getting Started

### Prerequisites

- Node.js 18+
- npm 9+
- MongoDB 6+ (local) or a MongoDB Atlas account
- Git

### 1. Clone the repo

```bash
git clone https://github.com/your-username/LeavesApp.git
cd LeavesApp
```

### 2. Backend setup

```bash
cd backend
npm install
```

Create a `.env` file in the `backend/` directory:

```env
NODE_ENV=development
PORT=8080
MAX_TREE_DEPTH=25
MONGO_URI=mongodb://localhost:27017/leaves
JWT_SECRET=your-secret-key-min-32-chars
JWT_REFRESH_SECRET=your-refresh-secret-key-min-32-chars
APP_ORIGIN=http://localhost:5173
EMAIL_SENDER=noreply@yourdomain.com
RESEND_API_KEY=your-resend-api-key
```

Start the backend:

```bash
npm run dev
```

### 3. Frontend setup

```bash
cd frontend
npm install
```

Create a `.env` file in the `frontend/` directory:

```env
VITE_BASEAPIURL=http://localhost:8080/
```

Start the frontend:

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

## Development Commands

### Frontend

```bash
npm run dev              # Dev server with HMR
npm run build            # Production build
npm run lint             # ESLint
npm test                 # Run tests
npm run test:watch       # Tests in watch mode
npm run test:coverage    # Coverage report
```

### Backend

```bash
npm run dev              # Dev server with hot reload
npm run build            # Compile TypeScript
npm run lint             # ESLint
npm test                 # Run all tests
npm run test:watch       # Tests in watch mode
npm run test:coverage    # Coverage report
```

## Architecture Highlights

### Service Inheritance (Backend)

Services follow an OOP inheritance pattern. `TreeService<T>` provides generic CRUD for tree nodes, while `TemplateService` and `StorynodeService` extend it with specialized behavior (word count calculations, story file generation, etc.).

### Discriminator Models (Backend)

Templates and Storynodes share a single MongoDB collection (`trees`) using Mongoose discriminators. A `kind` field distinguishes document types while sharing common fields like name, type, text, children, and parent.

### Context-Based State (Frontend)

Five React Context providers manage different slices of state: Auth, Element, Page, Treelist, and Addable. Each has a dedicated custom hook for access (e.g., `useAuthContext()`).

### Drag-and-Drop Workflows (Frontend)

Powered by @dnd-kit. Users can:
- **Drag a template onto Stories** to create an entire storynode tree from it
- **Drag elements to the rubbish pile** to delete them (with confirmation)
- **Drag storynodes to archive** to move them out of the active workspace

## Deployment

The app deploys to Azure:

- **Frontend**: Azure Static Web Apps (main branch = production, feature branches = preview environments)
- **Backend**: Dockerized Express app on Azure Container Apps
- **Secrets**: Azure Key Vault (accessed via managed identity in production)
- **Database**: MongoDB Atlas
- **DNS**: Cloudflare (CNAME records pointing to Azure resources)

See `documentation/Deployment.md` for full deployment instructions and commands.

## Documentation

Detailed docs live in the `documentation/` folder:

- `backend-README.md` - Full backend architecture, API reference, and auth flow
- `frontend-README.md` - Component structure, state management, DnD system, and troubleshooting
- `Deployment.md` - Azure infrastructure and deployment commands
- `standards/` - Coding conventions, documentation style, and code reduction techniques

## License

ISC

## Author

Sander VanWilligen
