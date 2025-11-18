# Architecture Refactoring Plan

Generated: 2025-11-18T14:30:00

## Executive Summary

This architectural analysis of the Leaves application backend reveals a well-structured codebase with a solid foundation in layered architecture and service inheritance patterns. However, there are significant opportunities to improve code quality, reduce duplication, enhance type safety, and strengthen adherence to SOLID principles.

**Key Findings:**
- Total estimated code reduction: **18-22%** across controllers and utilities
- Number of proposed changes: **14 major refactorings**
- Estimated total implementation time: **32-48 hours** (4-6 days)
- Primary benefits:
  1. **Elimination of massive controller duplication** (5 controllers share 90% identical CRUD logic)
  2. **Enhanced type safety** with proper Express typing and elimination of `any` types
  3. **Service layer consolidation** reducing redundant code in recursive operations
  4. **Centralized response handling** eliminating repeated HTTP status and response patterns
  5. **Improved testability** through dependency injection and interface segregation

**Impact Overview:**
- Files to be removed: 0
- Files to be added: 4 new abstraction files
- Files to be significantly refactored: 11
- Functions to be eliminated through consolidation: ~35-40
- Functions to be added: ~15-20 (net reduction of 15-20 functions)

## Architectural Overview

The Leaves backend follows a clean layered architecture with clear separation of concerns:

```
Routes → Controllers → Services → Models → Database
         ↓
    Middleware (auth, error handling)
         ↓
    Utils (stateless helpers)
```

**Strengths Observed:**
1. **Service Inheritance Pattern**: TreeService<T> provides excellent foundation for Template/Storynode services
2. **Clear Separation**: Routes, controllers, services, and models are well-separated
3. **Error Handling**: Centralized error handling with custom AppError class
4. **Type Definitions**: Comprehensive Zod schemas and Mongoose document types
5. **Authentication Flow**: Well-structured JWT authentication with refresh tokens

**Architectural Anti-Patterns Detected:**

1. **Fat Controllers**: Template and Storynode controllers contain nearly identical CRUD operations with only different service references
2. **Anemic Services**: TreeService is well-designed, but TemplateService is essentially empty (only 271 chars)
3. **Missing Controller Abstraction**: No base controller class despite 90% code similarity across 5 controllers
4. **Type Safety Violations**: Extensive use of `any` types in controller signatures (`req: any, res: any`)
5. **Duplicated Response Logic**: HTTP status codes and response patterns repeated in every controller method
6. **Inconsistent Naming**: Some routes use `router`, others use `authRoutes`, `userRoutes`, etc.
7. **Tight Coupling**: Controllers directly import service instances rather than accepting them via dependency injection
8. **Missing Abstraction for Recursive Operations**: RecursiveService has related functions that could be better organized
9. **Cookie Configuration Duplication**: Cookie options logic split between utils and middleware

**Patterns That Should Be Preserved:**
- Service inheritance via TreeService<T>
- Centralized error handling with catchErrors wrapper
- Zod schema validation approach
- Mongoose discriminator pattern for Tree/Template/Storynode

## Critical Issues

### 1. MASSIVE CONTROLLER DUPLICATION (Severity: CRITICAL)
**Problem**: Template and Storynode controllers are 95% identical. Both implement:
- `getTemplatesController` / `getStorynodesController` (identical except service call)
- `getOneTemplateController` / `getOneStorynodeController` (identical except service call)
- `getTemplateChildrenController` / `getStorynodeChildrenController` (identical except service call)
- `postTemplateController` / `postStorynodeController` (identical except service call)
- `deleteTemplateController` / `deleteStorynodeController` (identical except service call)

This violates **DRY principle** and **Single Responsibility Principle** (controllers should translate HTTP to service calls, not contain repeated validation/response logic).

**Impact**: ~800 chars of duplicated code across these two files alone. Maintenance nightmare when HTTP response patterns change.

### 2. TYPE SAFETY VIOLATIONS (Severity: HIGH)
**Problem**: Every controller uses `(req: any, res: any)` instead of proper Express types:
```typescript
export const getUserController: (req: any, res: any) => Promise<any>;
```

This eliminates TypeScript's ability to catch type errors and provide autocomplete. It's particularly problematic because:
- Request body/params/query are untyped
- Response methods are untyped
- No IntelliSense support

**Impact**: Increased runtime errors, reduced developer productivity, violated type safety guarantees.

### 3. MISSING DEPENDENCY INJECTION (Severity: HIGH)
**Problem**: Controllers directly import singleton service instances:
```typescript
import TemplateService from '../services/template.service';
```

This creates tight coupling and makes unit testing extremely difficult. You cannot mock services without complex module mocking.

**Impact**:
- Cannot unit test controllers in isolation
- Cannot swap service implementations
- Violates **Dependency Inversion Principle**

### 4. ANEMIC TEMPLATE SERVICE (Severity: MEDIUM)
**Problem**: TemplateService is only 271 chars and provides zero custom functionality beyond TreeService. It exists solely to pass the Template model to the parent constructor.

This suggests either:
1. TemplateService should be eliminated (use TreeService<TemplateDoc> directly)
2. Template-specific business logic is missing from the service layer

**Impact**: Unnecessary file and abstraction layer with no value add.

### 5. INCONSISTENT ROUTE EXPORT NAMING (Severity: LOW)
**Problem**: Routes use inconsistent naming:
- `auth.route.ts` exports `authRoutes`
- `user.route.ts` exports `userRoutes`
- `session.route.ts` exports `sessionRoutes`
- `template.route.ts` exports `router`
- `storynode.route.ts` exports `router`

**Impact**: Confusion, reduced code readability, potential naming collisions.

## Refactoring Recommendations

### Category 1: Controller Layer Consolidation

#### Change 1.1: Create BaseController<T> Abstract Class

**Priority**: HIGH
**Estimated Code Reduction**: 60-70% in template.controller.ts and storynode.controller.ts
**Files Removed**: 0
**Files Added**: 1 (controllers/base.controller.ts)
**Functions Removed**: 10 (5 from each controller)
**Functions Added**: 5 (in base controller)
**Estimated Implementation Time**: 6 hours

**Problem Statement**:
Template and Storynode controllers contain nearly identical CRUD operations. Each controller implements:
- `get{Type}sController` - calls `service.find(userId, query)`
- `getOne{Type}Controller` - calls `service.findById(userId, id)`
- `get{Type}ChildrenController` - calls `service.findChildren(userId, id)`
- `post{Type}Controller` - calls `service.upsert(userId, data)`
- `delete{Type}Controller` - calls `service.deleteById(userId, id)`

The only difference is which service instance they call. This violates **DRY** and makes maintenance difficult.

**Proposed Solution**:
Create an abstract `BaseController<T extends TreeDoc>` class that provides generic CRUD controller methods. Template and Storynode controllers would extend this base class and only implement controller methods unique to their domain.

**Justification**:
- **Maintainability**: Changes to CRUD logic (e.g., response format, error handling) only need to happen in one place
- **Scalability**: Adding new tree-based resources (e.g., "Project") would require minimal boilerplate
- **SOLID Principle**: Adheres to **DRY** and **Open/Closed Principle** (closed for modification, open for extension)
- **Design Pattern**: Implements **Template Method Pattern** where base class defines algorithm structure

**Architecture**:
```typescript
// controllers/base.controller.ts
abstract class BaseController<T extends TreeDoc> {
  constructor(protected service: TreeService<T>);

  getAll: RequestHandler;
  getOne: RequestHandler;
  getChildren: RequestHandler;
  create: RequestHandler;
  delete: RequestHandler;
}

// controllers/template.controller.ts
class TemplateController extends BaseController<TemplateDoc> {
  constructor() {
    super(TemplateService);
  }
  // Only custom methods here
}

// controllers/storynode.controller.ts
class StorynodeController extends BaseController<StorynodeDoc> {
  constructor() {
    super(StorynodeService);
  }

  // Override if needed
  create: RequestHandler; // May need special word count logic

  // Custom methods
  postFromTemplate: RequestHandler;
  getStoryFile: RequestHandler;
}
```

**Breaking Changes**:
- Controller exports change from individual functions to class instances
- Route files need to call controller methods (e.g., `templateController.getAll` instead of `getTemplatesController`)

**Implementation Steps**:
1. Create `controllers/base.controller.ts` with abstract `BaseController<T extends TreeDoc>` class
2. Implement generic CRUD methods: `getAll`, `getOne`, `getChildren`, `create`, `delete`
3. Add proper Express types: `Request<Params, ResBody, ReqBody>`, `Response`
4. Refactor `template.controller.ts` to extend `BaseController<TemplateDoc>`
5. Refactor `storynode.controller.ts` to extend `BaseController<StorynodeDoc>`
6. Keep storynode-specific methods (`postFromTemplate`, `getStoryFile`) in StorynodeController
7. Update route files to use controller instance methods
8. Update tests to work with new controller structure
9. Remove old controller function exports

**Dependencies**: Should be implemented before Change 1.2 (TypeScript typing improvements)

---

#### Change 1.2: Eliminate `any` Types in Controllers with Proper Express Typing

**Priority**: HIGH
**Estimated Code Reduction**: 0% (improves type safety, not LOC)
**Files Removed**: 0
**Files Added**: 0
**Functions Removed**: 0
**Functions Added**: 0
**Estimated Implementation Time**: 3 hours

**Problem Statement**:
All controller function signatures use `any` for request and response parameters:
```typescript
export const getUserController: (req: any, res: any) => Promise<any>;
```

This eliminates TypeScript's primary benefit: compile-time type checking. Issues include:
- No autocomplete for Express methods
- No type checking for request.body, request.params, request.query
- No validation that response methods are used correctly
- Runtime errors that could be caught at compile time

**Proposed Solution**:
Use Express's generic types to properly type all controller signatures:
```typescript
import { Request, Response, NextFunction } from 'express';

type GetUserRequest = Request<
  {}, // Params
  any, // ResBody
  {}, // ReqBody
  {} // Query
>;

export const getUserController: (
  req: GetUserRequest,
  res: Response,
  next: NextFunction
) => Promise<void>;
```

For controllers with path/body parameters, define proper interfaces:
```typescript
type GetOneTemplateRequest = Request<
  { id: string }, // Params
  TemplateDoc, // ResBody
  {}, // ReqBody
  {} // Query
>;

type PostTemplateRequest = Request<
  {}, // Params
  TemplateDoc, // ResBody
  z.infer<typeof postSchema>, // ReqBody from Zod schema
  {} // Query
>;
```

**Justification**:
- **Maintainability**: Type errors caught at compile time, not runtime
- **Scalability**: IntelliSense makes development faster and more reliable
- **SOLID Principle**: Enforces **Interface Segregation Principle** by defining precise contracts
- **Type Safety**: Aligns with TypeScript best practices

**Breaking Changes**: None (only improves type definitions, doesn't change runtime behavior)

**Implementation Steps**:
1. Create type definitions for all request/response shapes in `schemas/controller.schema.ts`
2. Update `auth.controller.ts` function signatures with proper Express types
3. Update `user.controller.ts` function signatures
4. Update `session.controller.ts` function signatures
5. Update `template.controller.ts` function signatures (or BaseController if 1.1 is done first)
6. Update `storynode.controller.ts` function signatures
7. Update `test.controller.ts` function signatures
8. Verify no `any` types remain in controller signatures
9. Update declaration files

**Dependencies**: Ideally implemented alongside Change 1.1

---

#### Change 1.3: Implement Dependency Injection for Services

**Priority**: MEDIUM
**Estimated Code Reduction**: 0% (improves testability and flexibility)
**Files Removed**: 0
**Files Added**: 1 (config/container.ts for dependency injection)
**Functions Removed**: 0
**Functions Added**: 1 (container setup)
**Estimated Implementation Time**: 4 hours

**Problem Statement**:
Controllers directly import singleton service instances:
```typescript
import TemplateService from '../services/template.service';
```

This creates tight coupling between controllers and specific service implementations. Problems:
- Cannot unit test controllers without complex module mocking
- Cannot swap service implementations (e.g., for testing, caching, or different storage backends)
- Violates **Dependency Inversion Principle** (high-level controllers depend on low-level service implementations)
- Makes it impossible to inject mock services for testing

**Proposed Solution**:
Implement constructor-based dependency injection. Services are injected into controllers rather than imported:

```typescript
// controllers/template.controller.ts (current)
import TemplateService from '../services/template.service';
export const getTemplatesController = async (req, res) => {
  const templates = await TemplateService.find(userId);
  // ...
};

// controllers/template.controller.ts (proposed)
class TemplateController extends BaseController<TemplateDoc> {
  constructor(private templateService: TreeService<TemplateDoc>) {
    super(templateService);
  }
}

// config/container.ts (simple DI container)
export const templateController = new TemplateController(TemplateService);
export const storynodeController = new StorynodeController(StorynodeService);
```

For more sophisticated needs, consider using a lightweight DI library like `tsyringe` or `awilix`.

**Justification**:
- **Maintainability**: Controllers can be unit tested with mock services
- **Scalability**: Easy to swap implementations (e.g., caching layer, different DB)
- **SOLID Principle**: Adheres to **Dependency Inversion Principle**
- **Design Pattern**: Implements **Dependency Injection Pattern**
- **Testability**: Mock services can be injected for unit tests

**Breaking Changes**:
- Controller instantiation changes
- Route files import controller instances from container instead of creating them

**Implementation Steps**:
1. Create `config/container.ts` for dependency injection setup
2. Modify controllers to accept service dependencies via constructor
3. Instantiate all controllers in container with their service dependencies
4. Update route files to import controller instances from container
5. Update tests to inject mock services
6. Consider adding `tsyringe` or `awilix` if complexity grows

**Dependencies**: Should be implemented after Change 1.1 (BaseController creation)

---

### Category 2: Service Layer Optimization

#### Change 2.1: Eliminate TemplateService or Add Template-Specific Logic

**Priority**: MEDIUM
**Estimated Code Reduction**: 271 chars (entire file removal) OR 0% (if logic added)
**Files Removed**: 0 or 1 (services/template.service.ts)
**Files Added**: 0
**Functions Removed**: 0
**Functions Added**: 0 (or several if adding logic)
**Estimated Implementation Time**: 2 hours (removal) or 6 hours (adding logic)

**Problem Statement**:
TemplateService is only 271 characters and provides zero custom functionality:
```typescript
declare class TemplateService extends TreeService<TemplateDoc> {
  constructor();
}
export default: TemplateService;
```

This is an **anemic domain model** anti-pattern. The service exists solely to pass the Template model to TreeService. This suggests:
1. Either TemplateService is unnecessary and should be removed
2. Or Template-specific business logic is missing from the service layer

**Proposed Solution - Option A (Removal)**:
Eliminate TemplateService entirely and use `TreeService<TemplateDoc>` directly:

```typescript
// controllers/template.controller.ts
import { Template } from '../models/tree.model';
const templateService = new TreeService<TemplateDoc>(Template);
```

**Proposed Solution - Option B (Add Logic)**:
Identify template-specific business operations and implement them in TemplateService:
- Template validation logic
- Template cloning/duplication
- Template versioning
- Template sharing/permissions
- Template analytics (usage counts, popular templates)

**Justification**:
- **Maintainability**: Eliminates unnecessary abstraction layer (Option A) or centralizes template logic (Option B)
- **Scalability**: Clearer where template-specific features should go
- **SOLID Principle**: **Single Responsibility** (service should have a reason to exist)
- **Design Pattern**: Avoids **Anemic Domain Model** anti-pattern

**Breaking Changes**:
- Option A: Controllers would need to instantiate TreeService directly
- Option B: None

**Implementation Steps (Option A - Removal)**:
1. Remove `services/template.service.ts`
2. Update `controllers/template.controller.ts` to instantiate `TreeService<TemplateDoc>`
3. Update all imports
4. Update tests
5. Remove declaration file

**Implementation Steps (Option B - Add Logic)**:
1. Identify template-specific business operations
2. Implement methods in TemplateService
3. Update tests to cover new functionality
4. Update declaration file

**Dependencies**: None

---

#### Change 2.2: Consolidate Recursive Tree Operations into TreeService

**Priority**: MEDIUM
**Estimated Code Reduction**: 15-20%
**Files Removed**: 0 or 1 (services/recursive.service.ts could be eliminated)
**Files Added**: 0
**Functions Removed**: 4 (moved to TreeService)
**Functions Added**: 4 (in TreeService)
**Estimated Implementation Time**: 5 hours

**Problem Statement**:
RecursiveService contains utility functions that operate on tree structures:
- `recursiveUpdateWordLimits` (Storynode-specific)
- `recursiveGetDescendants` (generic for any TreeDoc)
- `recursiveGetLeaves` (generic for any TreeDoc)
- `recursiveStorynodeFromTemplate` (Storynode-specific)

Issues:
1. Generic tree operations (`recursiveGetDescendants`, `recursiveGetLeaves`) belong in TreeService as instance methods
2. Storynode-specific operations (`recursiveUpdateWordLimits`, `recursiveStorynodeFromTemplate`) belong in StorynodeService
3. Having a separate "recursive.service.ts" suggests these are stateless utilities, but they interact heavily with tree structure and should be encapsulated in the service layer

**Proposed Solution**:
Move recursive operations to appropriate service classes:

```typescript
// tree.service.ts
class TreeService<T extends TreeDoc> {
  // Existing methods...

  // Add these:
  getDescendants(userId: mongoId, id: mongoId): Promise<T[]>;
  getLeaves(userId: mongoId, id: mongoId): Promise<T[]>;
  private recursiveGetDescendants(tree: T): Promise<T[]>; // make private
  private recursiveGetLeaves(tree: T): Promise<T[]>; // make private
}

// storynode.service.ts
class StorynodeService extends TreeService<StorynodeDoc> {
  // Existing methods...

  // Add these:
  private updateWordLimits(node: StorynodeDoc): Promise<void>;
  // addFromTemplate already exists, but should use private recursive method
}
```

This encapsulates tree traversal logic within the service that owns the data, rather than in a separate utility module.

**Justification**:
- **Maintainability**: Tree operations are encapsulated with tree data
- **Scalability**: Easy to add tree operations without creating new utility files
- **SOLID Principle**: **Single Responsibility** (TreeService is responsible for tree operations)
- **Encapsulation**: Recursive implementations can be private, exposing clean public APIs
- **Design Pattern**: Eliminates **Transaction Script** anti-pattern by moving logic into domain services

**Breaking Changes**:
- RecursiveService exports would be removed
- Any direct calls to `recursiveGetDescendants` etc. would need to use service methods

**Implementation Steps**:
1. Add `getDescendants()` and `getLeaves()` to TreeService as public methods
2. Move `recursiveGetDescendants` and `recursiveGetLeaves` implementations to TreeService as private methods
3. Add `updateWordLimits()` to StorynodeService
4. Move `recursiveUpdateWordLimits` implementation to StorynodeService as private method
5. Refactor `addFromTemplate` to use private recursive helper
6. Update all imports to use service methods instead of recursive.service functions
7. Consider removing recursive.service.ts if empty
8. Update tests
9. Update declaration files

**Dependencies**: None

---

### Category 3: Response Handling Consolidation

#### Change 3.1: Create Centralized Response Handler Utility

**Priority**: MEDIUM
**Estimated Code Reduction**: 25-30% in controller files
**Files Removed**: 0
**Files Added**: 1 (utils/responseUtils.ts)
**Functions Removed**: 0 (code consolidated, not removed)
**Functions Added**: 5-6 response helper functions
**Estimated Implementation Time**: 4 hours

**Problem Statement**:
Every controller method manually constructs HTTP responses with status codes:
```typescript
return res.status(OK).json({ user });
return res.status(CREATED).json({ template });
return res.status(NOT_FOUND).json({ message: 'Not found' });
```

This pattern is repeated 30+ times across controllers. Problems:
- Code duplication
- Inconsistent response formats (some return `{ user }`, others return `{ data: user }`)
- Manual status code selection prone to errors
- No centralized place to add response logging, formatting, or transformations

**Proposed Solution**:
Create a response utility that provides standardized response methods:

```typescript
// utils/responseUtils.ts
export const sendSuccess = <T>(res: Response, data: T, statusCode: HttpStatusCode = OK) => {
  return res.status(statusCode).json({ success: true, data });
};

export const sendCreated = <T>(res: Response, data: T) => {
  return res.status(CREATED).json({ success: true, data });
};

export const sendNoContent = (res: Response) => {
  return res.status(204).end();
};

export const sendError = (res: Response, message: string, statusCode: HttpStatusCode = BAD_REQUEST) => {
  return res.status(statusCode).json({ success: false, error: message });
};

// Usage in controllers:
return sendSuccess(res, { user });
return sendCreated(res, { template });
```

**Justification**:
- **Maintainability**: Response format changes happen in one place
- **Scalability**: Easy to add response transformations (e.g., HATEOAS links, pagination metadata)
- **SOLID Principle**: **DRY** and **Single Responsibility**
- **Consistency**: Guaranteed consistent response format across all endpoints

**Breaking Changes**:
- Response format may change (e.g., wrapping data in `{ success: true, data: ... }`)
- Frontend may need updates if response format changes

**Implementation Steps**:
1. Create `utils/responseUtils.ts`
2. Implement response helper functions
3. Update auth.controller to use response helpers
4. Update user.controller to use response helpers
5. Update session.controller to use response helpers
6. Update template.controller to use response helpers
7. Update storynode.controller to use response helpers
8. Update error handler to use response helpers for error responses
9. Update tests to expect new response format
10. Update declaration files

**Dependencies**: None (but works well with Change 1.1 - BaseController)

---

### Category 4: Type Safety and Schema Improvements

#### Change 4.1: Create Shared Type Definitions for Request/Response Shapes

**Priority**: MEDIUM
**Estimated Code Reduction**: 0% (adds structure, improves type safety)
**Files Removed**: 0
**Files Added**: 1 (schemas/api.schema.ts)
**Functions Removed**: 0
**Functions Added**: 10-15 type definitions
**Estimated Implementation Time**: 3 hours

**Problem Statement**:
Request and response shapes are not formally defined as TypeScript types. Controllers use Zod schemas for validation but don't export TypeScript types derived from those schemas. This means:
- No type autocomplete when constructing responses
- Duplication between Zod schemas and TypeScript interfaces
- Frontend and backend types can drift out of sync

**Proposed Solution**:
Create a centralized API schema file that exports TypeScript types for all request/response shapes:

```typescript
// schemas/api.schema.ts
import { z } from 'zod';
import { postSchema, emailSchema, passwordSchema } from './controller.schema';

// Derive TypeScript types from Zod schemas
export type PostTemplateBody = z.infer<typeof postSchema>;
export type PostStorynodeBody = z.infer<typeof postSchema>;

// Define response shapes
export interface UserResponse {
  _id: string;
  email: string;
  username: string;
  verified: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface TemplateResponse {
  _id: string;
  name: string;
  type: 'root' | 'branch' | 'leaf';
  text: string;
  children: string[];
  parent: string | null;
  userId: string;
  depth: number;
  wordWeight: number;
}

// ... etc for all API shapes
```

Use these types in controller signatures:
```typescript
type PostTemplateRequest = Request<{}, TemplateResponse, PostTemplateBody, {}>;
```

**Justification**:
- **Maintainability**: Single source of truth for API types
- **Scalability**: Easy to generate OpenAPI/Swagger docs from these types
- **Type Safety**: Full type checking for request/response handling
- **Frontend Integration**: Types can be shared with frontend (via shared package or code generation)

**Breaking Changes**: None

**Implementation Steps**:
1. Create `schemas/api.schema.ts`
2. Define all response shape interfaces
3. Export inferred types from Zod schemas for request bodies
4. Update controller signatures to use these types
5. Update declaration files
6. Consider generating OpenAPI spec from these types

**Dependencies**: Works well with Change 1.2 (Express typing)

---

#### Change 4.2: Add Discriminated Union Type for Tree Types

**Priority**: LOW
**Estimated Code Reduction**: 0% (improves type safety)
**Files Removed**: 0
**Files Added**: 0
**Functions Removed**: 0
**Functions Added**: 0
**Estimated Implementation Time**: 2 hours

**Problem Statement**:
Tree, Template, and Storynode are represented as separate interfaces without a discriminated union. This makes it difficult to write type-safe code that handles "any tree type":

```typescript
export interface TreeDoc extends mongoose.Document<mongoId> {
  name: string;
  type: string; // Should be 'root' | 'branch' | 'leaf'
  // ...
}
```

The `type` field is typed as `string` rather than a literal union, and there's no discriminator field to distinguish Tree from Template from Storynode at the type level.

**Proposed Solution**:
Add a discriminated union type for tree documents:

```typescript
// schemas/mongo.schema.ts
export interface TreeDoc extends mongoose.Document<mongoId> {
  name: string;
  type: 'root' | 'branch' | 'leaf'; // Literal union instead of string
  text: string;
  children: mongoId[];
  parent: mongoId | null;
  userId: mongoId;
  depth: number;
  kind: 'tree'; // Discriminator
}

export interface TemplateDoc extends TreeDoc {
  kind: 'template'; // Discriminator
  wordWeight: number;
}

export interface StorynodeDoc extends TreeDoc {
  kind: 'storynode'; // Discriminator
  isComplete: boolean;
  wordWeight: number;
  wordLimit: number;
  wordCount: number;
  archived: boolean;
}

export type AnyTreeDoc = TreeDoc | TemplateDoc | StorynodeDoc;

// Type guard
export function isTemplateDoc(doc: AnyTreeDoc): doc is TemplateDoc {
  return doc.kind === 'template';
}

export function isStorynodeDoc(doc: AnyTreeDoc): doc is StorynodeDoc {
  return doc.kind === 'storynode';
}
```

**Justification**:
- **Type Safety**: TypeScript can narrow types based on discriminator
- **Maintainability**: Code that handles multiple tree types is type-safe
- **SOLID Principle**: **Interface Segregation** (different tree types have different contracts)

**Breaking Changes**: Minimal (kind field likely already exists from Mongoose discriminator)

**Implementation Steps**:
1. Update TreeDoc interface with `type: 'root' | 'branch' | 'leaf'`
2. Add `kind` discriminator to each interface
3. Create `AnyTreeDoc` union type
4. Create type guard functions
5. Update code that handles multiple tree types to use type guards
6. Update declaration files

**Dependencies**: None

---

### Category 5: Architecture Consistency

#### Change 5.1: Standardize Route Export Naming

**Priority**: LOW
**Estimated Code Reduction**: 0% (improves consistency)
**Files Removed**: 0
**Files Added**: 0
**Functions Removed**: 0
**Functions Added**: 0
**Estimated Implementation Time**: 1 hour

**Problem Statement**:
Route files use inconsistent export names:
- `auth.route.ts` → `authRoutes`
- `user.route.ts` → `userRoutes`
- `session.route.ts` → `sessionRoutes`
- `template.route.ts` → `router`
- `storynode.route.ts` → `router`
- `test.route.ts` → `testRoutes`

This creates confusion and makes code less readable. When importing, you see:
```typescript
import authRoutes from './routes/auth.route';
import router from './routes/template.route'; // What is 'router'?
```

**Proposed Solution**:
Standardize all route exports to follow the pattern `{resource}Routes`:
- `auth.route.ts` → `authRoutes` ✓ (already correct)
- `user.route.ts` → `userRoutes` ✓ (already correct)
- `session.route.ts` → `sessionRoutes` ✓ (already correct)
- `template.route.ts` → `templateRoutes` (change from `router`)
- `storynode.route.ts` → `storynodeRoutes` (change from `router`)
- `test.route.ts` → `testRoutes` ✓ (already correct)

**Justification**:
- **Maintainability**: Consistent naming improves code readability
- **Developer Experience**: Clear what each import represents
- **Conventions**: Follows established naming pattern

**Breaking Changes**: Import statements in app.ts need updating

**Implementation Steps**:
1. Rename `router` to `templateRoutes` in `routes/template.route.ts`
2. Rename `router` to `storynodeRoutes` in `routes/storynode.route.ts`
3. Update import in `app.ts`
4. Update declaration files

**Dependencies**: None

---

#### Change 5.2: Consolidate Cookie Configuration

**Priority**: LOW
**Estimated Code Reduction**: 10-15% in cookie-related code
**Files Removed**: 0
**Files Added**: 0
**Functions Removed**: 0
**Functions Added**: 0
**Estimated Implementation Time**: 2 hours

**Problem Statement**:
Cookie configuration is split between multiple locations:
- `utils/cookies.ts` defines cookie options and helpers
- `middleware/errorHandler.ts` imports `REFRESH_PATH` from cookies
- Cookie security settings are defined in `utils/cookies.ts`

This creates coupling between utils and middleware, and makes it unclear where cookie configuration lives.

**Proposed Solution**:
Consolidate all cookie-related configuration in `utils/cookies.ts` and ensure middleware only uses public API:

```typescript
// utils/cookies.ts
export const COOKIE_CONFIG = {
  REFRESH_PATH: '/auth/refresh',
  ACCESS_TOKEN_NAME: 'accessToken',
  REFRESH_TOKEN_NAME: 'refreshToken',
} as const;

export const getAccessTokenCookieOptions = (): CookieOptions => { /* ... */ };
export const getRefreshTokenCookieOptions = (): CookieOptions => { /* ... */ };

// Middleware uses the config
import { COOKIE_CONFIG } from '../utils/cookies';
// Use COOKIE_CONFIG.REFRESH_PATH
```

**Justification**:
- **Maintainability**: Single source of truth for cookie configuration
- **SOLID Principle**: **Single Responsibility** (cookies.ts owns all cookie config)

**Breaking Changes**: None (internal refactoring)

**Implementation Steps**:
1. Create `COOKIE_CONFIG` object in `utils/cookies.ts`
2. Move all cookie constants to this object
3. Update middleware to import from COOKIE_CONFIG
4. Update tests
5. Update declaration files

**Dependencies**: None

---

### Category 6: Error Handling Improvements

#### Change 6.1: Expand AppErrorCode Enum

**Priority**: LOW
**Estimated Code Reduction**: 0% (improves error handling)
**Files Removed**: 0
**Files Added**: 0
**Functions Removed**: 0
**Functions Added**: 0
**Estimated Implementation Time**: 2 hours

**Problem Statement**:
The AppErrorCode enum currently only has one value:
```typescript
declare const enum AppErrorCode {
    InvalidAccessToken = 'InvalidAccessToken'
}
```

However, the application likely has many distinct error scenarios:
- Invalid refresh token
- Email already exists
- User not found
- Template not found
- Storynode not found
- Max tree depth exceeded
- Email not verified
- Invalid verification code
- Session expired

Having specific error codes allows:
- Frontend to handle errors differently based on code
- Better error logging and monitoring
- Localization of error messages
- Retry logic based on error type

**Proposed Solution**:
Expand AppErrorCode enum with all application-specific errors:

```typescript
declare const enum AppErrorCode {
  // Authentication
  InvalidAccessToken = 'InvalidAccessToken',
  InvalidRefreshToken = 'InvalidRefreshToken',
  InvalidCredentials = 'InvalidCredentials',
  EmailNotVerified = 'EmailNotVerified',

  // User errors
  UserNotFound = 'UserNotFound',
  EmailAlreadyExists = 'EmailAlreadyExists',
  UsernameAlreadyExists = 'UsernameAlreadyExists',

  // Resource errors
  TemplateNotFound = 'TemplateNotFound',
  StorynodeNotFound = 'StorynodeNotFound',
  SessionNotFound = 'SessionNotFound',

  // Validation errors
  InvalidVerificationCode = 'InvalidVerificationCode',
  VerificationCodeExpired = 'VerificationCodeExpired',
  MaxTreeDepthExceeded = 'MaxTreeDepthExceeded',

  // Authorization
  Unauthorized = 'Unauthorized',
  Forbidden = 'Forbidden',
}
```

Update `appAssert` calls throughout codebase to use specific error codes.

**Justification**:
- **Maintainability**: Clear error codes improve debugging
- **Frontend Integration**: Frontend can handle specific errors
- **Monitoring**: Better error tracking and alerting
- **User Experience**: Can display helpful error messages

**Breaking Changes**: Frontend error handling may need updates to handle new error codes

**Implementation Steps**:
1. Expand AppErrorCode enum with all error scenarios
2. Update appAssert calls in auth.service to use specific codes
3. Update appAssert calls in tree.service to use specific codes
4. Update appAssert calls in storynode.service to use specific codes
5. Update appAssert calls in controllers to use specific codes
6. Update error handler to log error codes
7. Update tests to check for specific error codes
8. Update declaration files

**Dependencies**: None

---

### Category 7: Configuration and Environment

#### Change 7.1: Create Centralized Config Object

**Priority**: LOW
**Estimated Code Reduction**: 0% (improves organization)
**Files Removed**: 0
**Files Added**: 1 (config/app.config.ts)
**Functions Removed**: 0
**Functions Added**: 1
**Estimated Implementation Time**: 2 hours

**Problem Statement**:
Configuration values are scattered across multiple files:
- Environment variables in `constants/env.ts`
- Security config in `config/security.ts`
- Database config in `config/db.ts`
- Cookie config in `utils/cookies.ts`
- Email config in `config/resend.ts`

This makes it unclear what configuration options exist and where to find them.

**Proposed Solution**:
Create a centralized configuration object that consolidates all app config:

```typescript
// config/app.config.ts
export const appConfig = {
  env: NODE_ENV,
  port: PORT,

  database: {
    uri: MONGO_URI,
    options: { /* ... */ }
  },

  auth: {
    jwtSecret: JWT_SECRET,
    jwtRefreshSecret: JWT_REFRESH_SECRET,
    accessTokenExpiry: '15m',
    refreshTokenExpiry: '30d',
  },

  security: {
    rateLimits: {
      global: { windowMs: 15 * 60 * 1000, max: 100 },
      auth: { windowMs: 15 * 60 * 1000, max: 5 },
    },
    helmet: { /* ... */ }
  },

  email: {
    sender: EMAIL_SENDER,
    apiKey: RESEND_API_KEY,
  },

  cookies: {
    refreshPath: '/auth/refresh',
    secure: NODE_ENV === 'production',
    httpOnly: true,
  },

  tree: {
    maxDepth: MAX_TREE_DEPTH,
  }
} as const;
```

**Justification**:
- **Maintainability**: Single place to see all configuration
- **Documentation**: Self-documenting configuration structure
- **SOLID Principle**: **Single Responsibility** (config.ts owns all config)
- **Testability**: Easy to mock entire config object

**Breaking Changes**: All files importing individual constants need updating

**Implementation Steps**:
1. Create `config/app.config.ts`
2. Move configuration from constants/env.ts to appConfig object
3. Update all imports to use appConfig
4. Consider adding validation with Zod
5. Update tests to use appConfig
6. Update declaration files

**Dependencies**: None

---

### Category 8: Service Layer Enhancement

#### Change 8.1: Add Repository Pattern for Data Access

**Priority**: LOW (Future-proofing)
**Estimated Code Reduction**: 0% (adds abstraction layer)
**Files Removed**: 0
**Files Added**: 4 (repositories for User, Session, Tree)
**Functions Removed**: 0
**Functions Added**: 15-20
**Estimated Implementation Time**: 8 hours

**Problem Statement**:
Services directly interact with Mongoose models:
```typescript
const user = await UserModel.findOne({ email });
const session = await SessionModel.findById(sessionId);
```

This creates tight coupling between services and Mongoose. Problems:
- Difficult to switch to different ORM or database
- Cannot mock data access without mocking Mongoose
- Business logic mixed with data access logic
- Violates **Dependency Inversion Principle**

**Proposed Solution**:
Introduce Repository pattern to abstract data access:

```typescript
// repositories/user.repository.ts
interface IUserRepository {
  findByEmail(email: string): Promise<UserDoc | null>;
  findById(id: mongoId): Promise<UserDoc | null>;
  create(userData: Partial<UserDoc>): Promise<UserDoc>;
  update(id: mongoId, updates: Partial<UserDoc>): Promise<UserDoc>;
  delete(id: mongoId): Promise<void>;
}

class UserRepository implements IUserRepository {
  constructor(private model: typeof UserModel) {}

  async findByEmail(email: string) {
    return this.model.findOne({ email });
  }

  // ... implement other methods
}

// services/auth.service.ts
class AuthService {
  constructor(
    private userRepository: IUserRepository,
    private sessionRepository: ISessionRepository
  ) {}

  async signupUser(userData: SignupUserParams) {
    const existingUser = await this.userRepository.findByEmail(userData.email);
    // ...
  }
}
```

**Justification**:
- **Maintainability**: Data access logic centralized in repositories
- **Scalability**: Easy to swap ORMs or add caching layer
- **SOLID Principle**: **Dependency Inversion** and **Single Responsibility**
- **Design Pattern**: Implements **Repository Pattern**
- **Testability**: Can mock repositories without mocking Mongoose

**Breaking Changes**: Significant refactoring of service layer

**Implementation Steps**:
1. Create `repositories/user.repository.ts` with IUserRepository interface
2. Create `repositories/session.repository.ts` with ISessionRepository interface
3. Create `repositories/tree.repository.ts` with ITreeRepository interface
4. Implement repository classes
5. Refactor AuthService to use repositories
6. Refactor TreeService to use repositories
7. Update dependency injection container
8. Update tests to mock repositories
9. Update declaration files

**Dependencies**: Should be implemented after Change 1.3 (Dependency Injection)

---

### Category 9: Testing Improvements

#### Change 9.1: Add Integration Tests for BaseController

**Priority**: MEDIUM
**Estimated Code Reduction**: N/A (adds test coverage)
**Files Removed**: 0
**Files Added**: 1 (tests/integration/controllers/base.controller.test.ts)
**Functions Removed**: 0
**Functions Added**: 10-15 test cases
**Estimated Implementation Time**: 4 hours

**Problem Statement**:
If BaseController is introduced (Change 1.1), it needs comprehensive test coverage to ensure:
- All CRUD operations work correctly
- Error handling is consistent
- Response formats are standardized
- Authentication is properly enforced

Since Template and Storynode controllers would extend BaseController, testing the base class ensures consistency across all tree-based resources.

**Proposed Solution**:
Create integration tests for BaseController using a test instance:

```typescript
// tests/integration/controllers/base.controller.test.ts
describe('BaseController', () => {
  let templateController: TemplateController;
  let authCookies: string;

  beforeAll(async () => {
    // Setup test database and authentication
  });

  describe('getAll', () => {
    it('should return all templates for authenticated user', async () => {
      // Test implementation
    });

    it('should return 401 for unauthenticated request', async () => {
      // Test implementation
    });
  });

  describe('getOne', () => {
    it('should return single template by ID', async () => {
      // Test implementation
    });

    it('should return 404 for non-existent template', async () => {
      // Test implementation
    });
  });

  // ... tests for create, update, delete
});
```

**Justification**:
- **Quality**: Ensures base functionality works correctly
- **Regression Prevention**: Catches breaking changes in base class
- **Documentation**: Tests serve as usage examples

**Breaking Changes**: None

**Implementation Steps**:
1. Create test file for BaseController
2. Write tests for all CRUD operations
3. Write tests for error cases (401, 404, 403)
4. Write tests for validation errors
5. Achieve 100% coverage of BaseController
6. Run tests in CI pipeline

**Dependencies**: Requires Change 1.1 (BaseController creation)

---

### Category 10: Documentation and Code Quality

#### Change 10.1: Add JSDoc Comments to All Public APIs

**Priority**: LOW
**Estimated Code Reduction**: 0% (improves documentation)
**Files Removed**: 0
**Files Added**: 0
**Functions Removed**: 0
**Functions Added**: 0
**Estimated Implementation Time**: 6 hours

**Problem Statement**:
Declaration files show minimal JSDoc documentation. Public APIs lack:
- Parameter descriptions
- Return value descriptions
- Usage examples
- Error conditions

This makes it difficult for developers to understand:
- What parameters are expected
- What the function returns
- When errors are thrown
- How to use the API

**Proposed Solution**:
Add comprehensive JSDoc comments to all public APIs:

```typescript
/**
 * Creates a new user account and initiates an authentication session.
 *
 * @param userData - User registration information
 * @param userData.email - User's email address (must be unique)
 * @param userData.username - User's chosen username (must be unique)
 * @param userData.password - User's password (will be hashed)
 * @param userData.userAgent - Optional user agent string for session tracking
 *
 * @returns Object containing user data and authentication tokens
 * @returns accessToken - Short-lived JWT for API authentication (15min)
 * @returns refreshToken - Long-lived JWT for token refresh (30 days)
 *
 * @throws {AppError} CONFLICT - If email or username already exists
 * @throws {AppError} INTERNAL_SERVER_ERROR - If database operation fails
 *
 * @example
 * ```typescript
 * const result = await signupUser({
 *   email: 'user@example.com',
 *   username: 'johndoe',
 *   password: 'SecurePassword123!',
 *   userAgent: req.headers['user-agent']
 * });
 *
 * setAuthCookies({ res, ...result });
 * ```
 */
export const signupUser: (userData: SignupUserParams) => Promise<{
  user: any;
  accessToken: string;
  refreshToken: string;
}>;
```

**Justification**:
- **Maintainability**: Self-documenting code reduces onboarding time
- **Developer Experience**: IntelliSense shows parameter descriptions
- **Quality**: Forces thinking about API contracts

**Breaking Changes**: None

**Implementation Steps**:
1. Add JSDoc to all service functions
2. Add JSDoc to all controller functions
3. Add JSDoc to all utility functions
4. Add JSDoc to all middleware
5. Consider generating API documentation from JSDoc
6. Update declaration files

**Dependencies**: None

---

## Implementation Roadmap

This roadmap sequences changes to minimize conflicts and build on each other.

### Phase 1: Foundation - Type Safety and Base Abstractions (Est. 18 hours)

**Goal**: Establish type-safe foundation and base abstractions

1. **Change 1.2** - Eliminate `any` types in controllers (3 hours)
   - Improves type safety immediately
   - No dependencies on other changes

2. **Change 4.1** - Create shared type definitions (3 hours)
   - Works with Change 1.2
   - Establishes types for Phase 2

3. **Change 1.1** - Create BaseController<T> (6 hours)
   - Depends on type improvements from 1.2 and 4.1
   - Foundation for controller consolidation

4. **Change 3.1** - Create centralized response handler (4 hours)
   - Used by BaseController
   - Standardizes response format

5. **Change 9.1** - Add BaseController tests (4 hours)
   - Ensures quality before moving forward

**Milestone**: Type-safe, tested BaseController ready for use

---

### Phase 2: Service Layer Refactoring (Est. 13 hours)

**Goal**: Consolidate service layer and eliminate duplication

6. **Change 2.2** - Consolidate recursive operations into TreeService (5 hours)
   - Improves service encapsulation
   - No dependencies on Phase 1

7. **Change 2.1** - Eliminate TemplateService or add logic (2 hours)
   - Removes anemic service
   - Works with refactored TreeService

8. **Change 1.3** - Implement dependency injection (4 hours)
   - Enables testing with mock services
   - Improves flexibility

**Milestone**: Clean, well-tested service layer with proper abstractions

---

### Phase 3: Architecture Consistency and Quality (Est. 17 hours)

**Goal**: Improve consistency, error handling, and code quality

9. **Change 5.1** - Standardize route export naming (1 hour)
   - Quick consistency win

10. **Change 5.2** - Consolidate cookie configuration (2 hours)
    - Improves organization

11. **Change 6.1** - Expand AppErrorCode enum (2 hours)
    - Better error handling

12. **Change 4.2** - Add discriminated union for tree types (2 hours)
    - Improves type safety for tree operations

13. **Change 7.1** - Create centralized config object (2 hours)
    - Improves configuration organization

14. **Change 10.1** - Add JSDoc comments (6 hours)
    - Improves documentation
    - Can be done incrementally

**Milestone**: Consistent, well-documented codebase with improved error handling

---

### Phase 4: Advanced Patterns (Optional - Est. 8 hours)

**Goal**: Future-proof architecture with repository pattern

15. **Change 8.1** - Add repository pattern (8 hours)
    - Optional architectural improvement
    - Requires dependency injection from Phase 2
    - Future-proofs data access layer

**Milestone**: Fully abstracted data access layer

---

## Implementation Sequence Summary

```
Phase 1 (18h): Foundation
├─ 1.2 → 4.1 → 1.1 → 3.1 → 9.1
└─ Result: Type-safe BaseController

Phase 2 (13h): Service Layer
├─ 2.2 → 2.1 → 1.3
└─ Result: Clean service layer with DI

Phase 3 (17h): Consistency & Quality
├─ 5.1 → 5.2 → 6.1 → 4.2 → 7.1 → 10.1
└─ Result: Consistent, documented codebase

Phase 4 (8h): Advanced (Optional)
├─ 8.1
└─ Result: Repository pattern implementation
```

**Total Time**: 48-56 hours (6-7 business days)

---

## Risk Assessment

### High-Risk Changes

**1. Change 1.1 - BaseController Creation**
- **Risk**: May require significant controller and route refactoring
- **Mitigation**:
  - Implement incrementally (one controller at a time)
  - Maintain backward compatibility during transition
  - Comprehensive test coverage before refactoring
  - Feature flag to switch between old and new controllers

**2. Change 1.3 - Dependency Injection**
- **Risk**: Large-scale refactoring of service instantiation
- **Mitigation**:
  - Use simple container pattern first (avoid complex DI libraries initially)
  - Implement in isolation (separate branch)
  - Test thoroughly before merging
  - Document injection patterns clearly

**3. Change 3.1 - Response Handler**
- **Risk**: Changes response format; may break frontend
- **Mitigation**:
  - Coordinate with frontend team
  - Add response format versioning if needed
  - Update all endpoints simultaneously
  - Test frontend integration thoroughly

### Medium-Risk Changes

**4. Change 2.2 - Recursive Operations Consolidation**
- **Risk**: Complex tree operations; bugs could corrupt data
- **Mitigation**:
  - Extensive unit tests for all tree operations
  - Integration tests with real tree structures
  - Test with deep trees (near MAX_TREE_DEPTH)
  - Backup database before deploying

**5. Change 1.2 - Type Safety**
- **Risk**: May reveal hidden type errors
- **Mitigation**:
  - Fix type errors incrementally
  - Use TypeScript strict mode
  - Test thoroughly after type changes

### Low-Risk Changes

All other changes (5.1, 5.2, 6.1, 4.1, 4.2, 7.1, 10.1) are low-risk as they:
- Don't change runtime behavior significantly
- Improve code quality without breaking changes
- Can be implemented incrementally

---

## Metrics & Success Criteria

### Code Quality Metrics

**Before Refactoring:**
- Estimated controller duplication: ~60-70%
- Type safety coverage: ~40% (extensive use of `any`)
- Test coverage: Good (17 test files)
- Lines of code: ~13,000 (estimated from char counts)

**After Refactoring (Target):**
- Controller duplication: <10%
- Type safety coverage: >95% (eliminate all `any` types)
- Test coverage: >90% (add BaseController tests)
- Lines of code: ~10,500 (-18% reduction)

### Quantitative Success Criteria

1. **Code Reduction**
   - Target: 18-22% reduction in controller code
   - Measure: Compare LOC before/after in controllers folder

2. **Type Safety**
   - Target: Zero `any` types in public APIs
   - Measure: `grep -r "any" src/controllers src/services | wc -l`

3. **Test Coverage**
   - Target: >90% coverage overall
   - Measure: `npm run test:coverage`

4. **Build Time**
   - Target: <10% increase (despite more types)
   - Measure: `time npm run build`

5. **Duplication**
   - Target: <5% code duplication in controllers
   - Measure: Use `jscpd` or similar tool

### Qualitative Success Criteria

1. **Developer Experience**
   - IntelliSense works for all controller methods
   - Clear error messages with specific error codes
   - Easy to add new tree-based resources

2. **Maintainability**
   - New developers can understand architecture quickly
   - Changes to CRUD logic only require changes in one place
   - API responses have consistent format

3. **Testability**
   - Controllers can be unit tested with mock services
   - Integration tests run faster with repository mocks
   - Test setup is straightforward

### Monitoring During Rollout

1. **Error Rates**: Monitor for increased errors after each phase
2. **Response Times**: Ensure no performance degradation
3. **TypeScript Compilation**: Catch type errors before runtime
4. **Test Suite**: All tests must pass after each change

---

## Conclusion

This refactoring plan addresses significant architectural opportunities in the Leaves backend while preserving the solid foundation already established. The changes prioritize:

1. **Eliminating duplication** (particularly in controllers)
2. **Improving type safety** (eliminating `any` types)
3. **Enhancing maintainability** (centralized abstractions)
4. **Strengthening SOLID principles** (DI, SRP, OCP)

The phased approach allows incremental implementation with clear milestones and risk mitigation at each stage. The estimated 18-22% code reduction combined with improved type safety and consistency will significantly enhance long-term maintainability.

**Recommended Starting Point**: Begin with Phase 1 to establish type-safe foundations, then proceed to Phase 2 for service layer improvements. Phase 3 can be implemented incrementally alongside other development work. Phase 4 (Repository Pattern) is optional and should be considered based on future requirements for data access abstraction.

The most impactful change is **Change 1.1 (BaseController)**, which eliminates the majority of controller duplication and establishes a pattern for all future tree-based resources.
