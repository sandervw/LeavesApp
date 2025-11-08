# Leaves Backend

TypeScript-Express REST API for Leaves content creation application. Provides tree-based content management with authentication, templates, and story composition.

## Table of Contents

- [Technology Stack](#technology-stack)
- [Prerequisites](#prerequisites)
- [Installation & Setup](#installation--setup)
- [Architecture Overview](#architecture-overview)
- [Service Inheritance Pattern](#service-inheritance-pattern)
- [Data Models](#data-models)
- [API Reference](#api-reference)
- [Authentication Flow](#authentication-flow)
- [Development Workflow](#development-workflow)
- [Troubleshooting](#troubleshooting)

## Technology Stack

### Core Technologies

- **Runtime**: Node.js
- **Language**: TypeScript
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT
- **Validation**: Zod schemas
- **Testing**: Vitest with MongoDB Memory Server

### Key Dependencies

- **bcrypt** - Password hashing
- **jsonwebtoken** - JWT token management
- **cookie-parser** - Cookie parsing
- **cors** - Cross-origin resource sharing
- **resend** - Email service
- **validator** - String validation
- **zod** - Schema validation

### Development Dependencies

- **ts-node-dev** - TypeScript hot reload
- **vitest** - Test framework
- **supertest** - HTTP assertion testing
- **mongodb-memory-server** - In-memory MongoDB for tests
- **eslint** - Code linting
- **typescript-eslint** - TypeScript linting

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
MONGO_URI=mongodb://localhost:27017/leaves
# For Atlas: mongodb+srv://<username>:<password>@cluster.mongodb.net/leaves
JWT_SECRET=your-secret-key-min-32-chars
JWT_REFRESH_SECRET=your-refresh-secret-key-min-32-chars
APP_ORIGIN=http://localhost:5173
EMAIL_SENDER=noreply@yourdomain.com
RESEND_API_KEY=your-resend-api-key
```

**Security**: Never commit `.env`. Use strong random secrets (minimum 32 characters) for JWT keys.

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
curl http://localhost:8080/health
```

## Architecture Overview

Layered architecture with separation of concerns:

```
┌──────────────────────────────────────────────────────┐
│  server.ts → app.ts → routes/ → middleware/          │
│  → controllers/ → services/ → models/ → MongoDB      │
└──────────────────────────────────────────────────────┘
```

### Layer Responsibilities

1. **server.ts** - Entry point, starts HTTP server
2. **app.ts** - Express configuration, middleware, CORS, routes, error handling
3. **routes/** - Route grouping (auth, user, template, storynode, session)
4. **middleware/** - authenticate.ts (JWT), errorHandler.ts (global errors)
5. **controllers/** - Zod validation, service calls, HTTP responses
6. **services/** - Business logic, data transformations, database operations
   - tree.service.ts (base CRUD)
   - template.service.ts (extends TreeService)
   - storynode.service.ts (extends TreeService with word count logic)
   - auth.service.ts (authentication)
   - recursive.service.ts (tree traversal)
7. **models/** - Mongoose schemas (tree, template, storynode, user, session, verificationCode)
8. **schemas/** - Zod schemas (controller.schema.ts, mongo.schema.ts)
9. **utils/** - Stateless helpers (jwt, bcrypt, cookies, errorUtils)
10. **config/** - Singletons (db connection, resend email client)
11. **constants/** - Error codes, HTTP status codes, environment variables

## Service Inheritance Pattern

Object-oriented inheritance for service code reuse:

### TreeService<T> (Base Class)

Generic base class providing common CRUD operations:

```typescript
class TreeService<T extends TreeDoc> {
  async find(userId: Types.ObjectId, query?: any): Promise<T[]>;
  async findById(userId: Types.ObjectId, id: Types.ObjectId): Promise<T>;
  async findChildren(userId: Types.ObjectId, id: Types.ObjectId): Promise<T[]>;
  async upsert(userId: Types.ObjectId, data: any): Promise<T>;
  async deleteById(userId: Types.ObjectId, id: Types.ObjectId): Promise<any>;
}
```

### TemplateService

```typescript
class TemplateService extends TreeService<TemplateDoc> {
  // Inherits all CRUD methods without modification
}
export default new TemplateService();
```

### StorynodeService

```typescript
class StorynodeService extends TreeService<StorynodeDoc> {
  async upsert(userId, data): Promise<StorynodeDoc>; // Overridden for word count
  async addFromTemplate(userId, templateId, parentId?): Promise<StorynodeDoc>;
}
export default new StorynodeService();
```

Overrides `upsert()` for word count calculations. Adds `addFromTemplate()` for template-based tree creation.

### RecursiveService

Utility functions for complex tree operations:

```typescript
class RecursiveService {
  async recursiveUpdateWordLimits(node: StorynodeDoc): Promise<void>;
  async recursiveGetDescendants(tree: TreeDoc, model: Model<TreeDoc>): Promise<TreeDoc[]>;
  async recursiveStorynodeFromTemplate(userId, templateId, parentId?): Promise<StorynodeDoc>;
}
export default new RecursiveService();
```

### Service Singleton Pattern

Services exported as singletons:

```typescript
// Correct
import templateService from "../services/template.service";
const templates = await templateService.find(userId);

// Incorrect: Do not instantiate
const service = new TemplateService();
```

## Data Models

Mongoose discriminators implement tree-structured content inheritance:

### Base Model: Tree

```typescript
interface TreeDoc {
  _id: Types.ObjectId;
  kind: "template" | "storynode"; // Discriminator
  userId: Types.ObjectId;
  name: string;
  type: "root" | "branch" | "leaf";
  text: string;
  children: string[]; // Child IDs
  parent: string | null;
  depth: number;
  createdAt: Date;
  updatedAt: Date;
}
```

### Template Model

Reusable content structures:

```typescript
interface TemplateDoc extends TreeDoc {
  kind: "template";
  wordWeight: number; // Proportional weight for word limit distribution (default 100)
}
```

### Storynode Model

Story content with tracking:

```typescript
interface StorynodeDoc extends TreeDoc {
  kind: "storynode";
  isComplete: boolean;
  wordWeight?: number; // From template
  wordLimit?: number; // Calculated from parent limit and sibling weights
  wordCount: number; // Calculated from text field
  archived: boolean;
}
```

### Tree Structure

Tree maintained through:
- **children**: Array of child IDs (preserves order)
- **parent**: Parent ID (null for root)
- **depth**: Tree depth (0 for root)

Templates and storynodes stored in single MongoDB collection (`trees`) distinguished by `kind` discriminator.

### User Model

```typescript
interface UserDoc {
  _id: Types.ObjectId;
  email: string; // Unique, indexed
  username: string;
  password: string; // Bcrypt hashed
  verified: boolean;
  createdAt: Date;
  updatedAt: Date;
}
```

### Session Model

```typescript
interface SessionDoc {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  userAgent?: string;
  createdAt: Date;
  expiresAt: Date;
}
```

### VerificationCode Model

```typescript
interface VerificationCodeDoc {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  type: "email_verification" | "password_reset";
  createdAt: Date;
  expiresAt: Date;
}
```

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

**Cookie Configuration**: httpOnly (no JavaScript access), secure (HTTPS only in production), sameSite strict (CSRF protection)

**Passwords**: Bcrypt hashed with 10 rounds. Plain-text never stored or logged. Minimum 6 characters.

**Email Verification**: MongoDB ObjectId codes in `verificationCode` collection. Expire after 24 hours. Sent via Resend service. Optional for app use.

## Development Workflow

### Starting Development

1. Start MongoDB (local or Atlas)
2. Configure `.env` file
3. Run `npm run dev` for hot reload
4. Test endpoints with Postman, Insomnia, or frontend

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

### Building for Production

```bash
npm run build    # Compile TypeScript to dist/
npm start        # Start production server
```

### Database Migrations

No formal migration system. Schema changes:
1. Update Mongoose models
2. Test in development
3. Document in commit messages
4. Apply manually in production

Write one-time migration scripts in `scripts/` for breaking changes.

### Environment Configuration

- `.env.development` - Local development
- `.env.test` - Testing (auto-loaded by Vitest)
- `.env.production` - Production (never commit)

## Troubleshooting

### MongoDB Connection Issues

**Problem**: `MongooseServerSelectionError: connect ECONNREFUSED`

**Solutions**: Verify MongoDB running (`sudo systemctl status mongod` or Windows Services), check `MONGO_URI` in `.env`, verify Atlas IP whitelist and credentials, test connection with `mongosh`

### JWT Token Errors

**Problem**: `JsonWebTokenError: invalid signature`

**Solutions**: Ensure `JWT_SECRET` and `JWT_REFRESH_SECRET` match between restarts, clear browser cookies, verify cookies sent (DevTools → Application → Cookies)

### Email Not Sending

**Problem**: Verification or reset emails not arriving

**Solutions**: Verify `RESEND_API_KEY` valid and active, check `EMAIL_SENDER` domain verified in Resend dashboard, review console error logs, test Resend API directly

### CORS Errors

**Problem**: `Access-Control-Allow-Origin` errors

**Solutions**: Verify `APP_ORIGIN` matches frontend URL exactly (include port), check CORS config in `app.ts` (origin and credentials true), ensure frontend sends credentials (`axios.defaults.withCredentials = true`)

### Hot Reload Not Working

**Problem**: Changes not reflected without restart

**Solutions**: Verify `ts-node-dev` watching correct directories, check syntax errors, restart dev server (Ctrl+C then `npm run dev`), clear cache (`node_modules/.cache/`)

### TypeScript Compilation Errors

**Problem**: Type errors during build

**Solutions**: Install type definitions (`npm install @types/<package> --save-dev`), verify `tsconfig.json` paths, match Mongoose types with TypeScript interfaces in `schemas/mongo.schema.ts`, delete `tsconfig.tsbuildinfo`

### Performance Issues

**Problem**: Slow API responses

**Solutions**: Add database indexes (userId, parent), check N+1 query problems, enable MongoDB query logging, implement pagination, profile with `node --prof`

---

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
