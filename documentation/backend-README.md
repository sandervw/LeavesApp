# Leaves Backend

TypeScript-Express REST API for Leaves content creation application. Provides tree-based content management with authentication, templates, and story composition.

## Table of Contents

- [Technology Stack](#technology-stack)
- [Prerequisites](#prerequisites)
- [Installation & Setup](#installation--setup)
- [Architecture Overview](#architecture-overview)
- [API Reference](#api-reference)
- [Authentication Flow](#authentication-flow)
- [Development Workflow](#development-workflow)
- [Additional Resources](#additional-resources)

## Technology Stack

### Core Technologies

- **Runtime**: Node.js 18+
- **Language**: TypeScript 5.9.3
- **Framework**: Express.js 5.1.0
- **Database**: MongoDB with Mongoose 8.19.1 ODM
- **Authentication**: JWT with bcrypt 6.0.0
- **Validation**: Zod 4.1.12 schemas
- **Testing**: Vitest 4.0.6 with MongoDB Memory Server 10.3.0
- **Logging**: Winston 3.18.3
- **Security**: Helmet 8.1.0, express-rate-limit 8.2.1

### Key Dependencies

- **express** (5.1.0) - Web framework
- **mongoose** (8.19.1) - MongoDB ODM
- **bcrypt** (6.0.0) - Password hashing
- **jsonwebtoken** (9.0.2) - JWT token management
- **cookie-parser** (1.4.7) - Cookie parsing
- **cors** (2.8.5) - Cross-origin resource sharing
- **helmet** (8.1.0) - Security headers
- **express-rate-limit** (8.2.1) - Rate limiting
- **zod** (4.1.12) - Schema validation
- **validator** (13.15.15) - String validation
- **resend** (6.2.0) - Email service
- **winston** (3.18.3) - Logging
- **@azure/identity** (4.13.0) - Azure authentication
- **@azure/keyvault-secrets** (4.10.0) - Azure Key Vault integration
- **dotenv** (17.2.3) - Environment variables

### Development Dependencies

- **typescript** (5.9.3) - TypeScript compiler
- **ts-node-dev** (2.0.0) - TypeScript hot reload
- **vitest** (4.0.6) - Test framework
- **@vitest/ui** (4.0.6) - Vitest UI
- **@vitest/coverage-v8** (4.0.6) - Code coverage
- **supertest** (7.1.4) - HTTP assertion testing
- **mongodb-memory-server** (10.3.0) - In-memory MongoDB for tests
- **eslint** (9.38.0) - Code linting
- **typescript-eslint** (8.46.1) - TypeScript linting
- **vite** (7.1.12) - Build tool
- **@types/\*** - TypeScript type definitions for all major dependencies

## Prerequisites

Required installations:

- **Node.js**: Version 18.x or higher
- **npm**: Version 9.x or higher
- **MongoDB**: Local installation (6.x+) or MongoDB Atlas account
- **Git**: Version control

Optional:

- **MongoDB Compass**: Database GUI
- **Postman** or **Insomnia**: API testing

## Installation & Setup

### 1. Clone Repository

```bash
git clone <repository-url>
cd LeavesApp/backend
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment Variables

Create `.env` file in `backend` directory:

```env
NODE_ENV=development
PORT=8080
MAX_TREE_DEPTH=25
MONGO_URI=mongodb://localhost:27017/leaves
# For Atlas: mongodb+srv://<username>:<password>@cluster.mongodb.net/leaves
JWT_SECRET=your-secret-key-min-32-chars
JWT_REFRESH_SECRET=your-refresh-secret-key-min-32-chars
APP_ORIGIN=http://localhost:5173
EMAIL_SENDER=noreply@yourdomain.com
RESEND_API_KEY=your-resend-api-key

# Production only (Azure):
KEY_VAULT_URL=https://your-keyvault.vault.azure.net/
APPLICATIONINSIGHTS_CONNECTION_STRING=your-connection-string
```

**Security**: Never commit `.env`. Use strong random secrets (minimum 32 characters) for JWT keys.

**Note**: In production, secrets (MONGO_URI, JWT_SECRET, JWT_REFRESH_SECRET, EMAIL_SENDER, RESEND_API_KEY) are loaded from Azure Key Vault automatically. KEY_VAULT_URL must be set to enable this feature.

### 4. Start MongoDB

```bash
# macOS/Linux
sudo systemctl start mongod
# Windows
net start MongoDB
```

**Atlas**: Whitelist IP address and verify connection string credentials.

### 5. Run Development Server

```bash
npm run dev
```

Server starts at `http://localhost:8080` with hot reload.

### 6. Verify Installation

```bash
curl http://localhost:8080/
```

Server responds with health status and MongoDB connection verification.

## Architecture Overview

Layered architecture with separation of concerns:

```
┌──────────────────────────────────────────────────────┐
│  server.ts → app.ts → routes/ → middleware/          │
│  → controllers/ → services/ → models/ → MongoDB      │
└──────────────────────────────────────────────────────┘
```

### Layer Responsibilities

1. **server.ts** - Entry point; loads Azure Key Vault secrets in production, then starts HTTP server
2. **app.ts** - Express configuration, middleware, CORS, routes, error handling
3. **routes/** - Route grouping (auth, user, template, storynode, session)
4. **middleware/** - authenticate.ts (JWT), errorHandler.ts (global errors)
5. **controllers/** - Zod validation, service calls, HTTP responses
   - base.controller.ts (factory pattern for CRUD operations)
   - auth.controller.ts, user.controller.ts, session.controller.ts, template.controller.ts, storynode.controller.ts
6. **services/** - Business logic, data transformations, database operations
   - tree.service.ts (base CRUD with tree traversal utilities)
   - template.service.ts (extends TreeService)
   - storynode.service.ts (extends TreeService with word count and story file logic)
   - auth.service.ts (authentication and session management)
7. **models/** - Mongoose schemas (tree, template, storynode, user, session, verificationCode)
8. **schemas/** - Zod schemas (controller.schema.ts, mongo.schema.ts)
9. **utils/** - Stateless helpers (jwt, bcrypt, cookies, errorUtils, logger)
10. **config/** - Singletons (db connection, resend email client, Azure Key Vault, security settings)
11. **constants/** - Error codes, HTTP status codes, verification types, environment variables

## API Reference

Base URL: `http://localhost:8080`

All endpoints except `/auth/*` require JWT authentication via cookies.

---

### Authentication Endpoints

#### POST `/auth/signup`

Register new user. Returns user object. Sets `accessToken` and `refreshToken` cookies.

**Request**: `{ "email": "user@example.com", "password": "pass123", "username": "john" }`

**Validation**: Email 1-255 chars valid format, password 6-255 chars, username 1-255 chars

#### POST `/auth/login`

Authenticate user. Returns user object. Sets access and refresh token cookies.

**Request**: `{ "email": "user@example.com", "password": "pass123" }`

**Errors**: 401 invalid credentials, 404 user not found

#### GET `/auth/logout`

Logout user. Clears access and refresh token cookies.

#### GET `/auth/refresh`

Refresh access token using refresh token cookie. Returns new tokens (rotated).

**Errors**: 401 invalid or expired refresh token

#### GET `/auth/verify/:code`

Verify email using verification code from email.

**Errors**: 400 invalid code, 404 code not found or expired

#### POST `/auth/password/forgot`

Request password reset email. Always returns 200 for security.

**Request**: `{ "email": "user@example.com" }`

#### POST `/auth/password/reset`

Reset password using verification code. Clears auth cookies.

**Request**: `{ "verificationCode": "ObjectId", "password": "newPass123" }`

---

### User Endpoints

#### GET `/user`

Get current authenticated user information.

**Errors**: 401 not authenticated

---

### Template Endpoints

#### GET `/template`

Get all user templates. Returns array of template objects.

**Query Parameters**: `type` (root/branch/leaf), `parent` (ID), any Mongoose filters

#### GET `/template/:id`

Get single template by ID.

**Errors**: 400 invalid ID, 404 not found, 403 wrong user

#### GET `/template/getchildren/:id`

Get all children of template ID.

#### POST `/template`

Create new template or update existing (upsert). Include `_id` for update.

**Request**: `{ "name": "Template", "type": "root|branch|leaf", "text": "...", "parent": "ID|null", "wordWeight": 100 }`

**Validation**: name 1-255 chars required, type required, text max 100k chars, parent valid ObjectId or null

#### DELETE `/template/:id`

Delete template and all descendants recursively. Returns `deletedCount`.

---

### Storynode Endpoints

#### GET `/storynode`

Get all user storynodes. Returns array of storynode objects.

**Query Parameters**: `type` (root/branch/leaf), `parent` (ID), `archived` (true/false), any Mongoose filters

#### GET `/storynode/:id`

Get single storynode by ID.

#### GET `/storynode/getchildren/:id`

Get all children of storynode ID.

#### GET `/storynode/getstoryfile/:id`

Get complete story text from all leaf nodes in narrative order. Returns plain text string with leaf content concatenated.

**Response**: Complete story text as string

#### POST `/storynode`

Create new storynode or update existing (upsert). Include `_id` for update. `wordCount` automatically calculated from `text` field.

**Request**: `{ "name": "Story", "type": "root|branch|leaf", "text": "...", "parent": "ID|null", "wordWeight": 100, "wordLimit": 10000, "isComplete": false, "archived": false }`

#### POST `/storynode/postfromtemplate`

Create storynode tree from template. Recursively creates entire tree preserving names, text, types, word weights.

**Request**: `{ "templateId": "ObjectId", "parentId": "ObjectId|null" }`

#### DELETE `/storynode/:id`

Delete storynode and all descendants recursively. Returns `deletedCount`.

---

### Session Endpoints

#### GET `/session`

Get all active sessions for authenticated user. Returns array of session objects.

#### DELETE `/session/:id`

Delete specific session (logout from device).

---

### Test Endpoints

**Note**: Only available when `NODE_ENV=test`

#### POST `/test/clear-database`

Clears all collections in the database. **Dangerous** - only enabled in test environment for test cleanup.

**Security**: Returns 403 Forbidden if not in test environment.

---

## Authentication Flow

JWT-based authentication with access and refresh tokens:

### Token Storage

- **Access Token**: 15 minutes, httpOnly secure cookie
- **Refresh Token**: 30 days, httpOnly secure cookie

### Token Flow

1. User signs up or logs in → Server generates tokens → httpOnly cookies set
2. Authenticated request → Middleware validates access token → Request proceeds with `req.userId`
3. Access token expires → Frontend calls `/auth/refresh` → New tokens issued (rotated)
4. Refresh token expires → User must log in again

### Security

**Middleware**: `authenticate.ts` validates JWT and attaches `userId` to `req.userId`. Protects all routes except `/auth/*`.

**Cookie Configuration**: httpOnly (no JavaScript access), secure (HTTPS only in production), sameSite varies (lax in production, none in development for cross-origin), domain-scoped to `.wordleaves.com` in production

**Passwords**: Bcrypt hashed with 10 rounds. Plain-text never stored or logged. Minimum 6 characters.

**Email Verification**: MongoDB ObjectId codes in `verificationCode` collection. Expire after 24 hours. Sent via Resend service with HTML email templates. Optional for app use.

## Development Workflow

### Starting Development

1. Start MongoDB (local or Atlas)
2. Configure `.env` file
3. Run `npm run dev` for hot reload
4. Test endpoints with Postman or frontend

### Making Changes

1. **Routes**: Add in `routes/` following existing patterns
2. **Controllers**: Add in `controllers/` with Zod validation
3. **Services**: Add in `services/` using inheritance where applicable
4. **Models**: Modify in `models/` only when necessary (requires migrations)
5. **Utilities**: Add reusable functions in `utils/`

### Code Quality

```bash
npm run lint              # Run linter
npm test                  # Run tests
npm run test:coverage     # Coverage report
```

### Environment Configuration

- `.env` - Local development
- `.env.test` - Testing (auto-loaded by Vitest)

## Additional Resources

- **Vitest**: https://vitest.dev
- **Mongoose**: https://mongoosejs.com
- **Express.js**: https://expressjs.com
- **Zod**: https://zod.dev
- **JWT Best Practices**: https://tools.ietf.org/html/rfc8725
- **MongoDB Memory Server**: https://github.com/nodkz/mongodb-memory-server

See `tests/README.md` for detailed testing guidelines.

---

## License

ISC

## Author

Sander VanWilligen
