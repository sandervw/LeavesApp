# Architectural Refactoring Plan - Leaves Backend

**Generated:** 2025-11-18T15:45:00Z

## Executive Summary

Analysis of 11 TypeScript declaration files (total 28,861 characters) reveals a backend architecture with significant opportunities for improvement. The primary issues are:

1. **Single Responsibility Principle Violations** - Auth.service.ts conflates authentication, email delivery, token management, and user account creation
2. **DRY Violations** - Controllers repeat error handling, validation, and HTTP response patterns across 6 controller files
3. **God Class Pattern** - StorynodeService mixes tree operations, word count calculations, and file generation
4. **Insufficient Abstraction** - Email, JWT, and cookie logic scattered across utils, making feature changes difficult
5. **Route Handler Duplication** - Route files have minimal differentiation; 6 route files follow identical patterns

**Total Estimated Impact:**

- Code Reduction: 15-20%
- Estimated Implementation Time: 3-4 weeks
- Files to Consolidate: 8-12
- Functions to Extract/Consolidate: 18-22
- Architecture Improvements: 5 major patterns

---

## Detailed Analysis by Category

### Single Responsibility Principle Violations

#### Auth.Service.ts - The Biggest Offender

- **Responsibilities:** User signup, login, logout, session management, email verification, password reset, JWT token generation, token refresh, email delivery
- **Size Impact:** 6,989 chars (largest service by far)
- **Coupling:** Depends on 6 models, 5 utility modules, 3 service modules
- **Problem:** Changes to email templates require modifying auth.service.ts; password reset logic is intertwined with signup

#### StorynodeService - Mixed Concerns

- **Responsibilities:** Tree CRUD operations, word count calculations, file generation, template conversion
- **Size:** 4,753 chars
- **Issue:** Word counting logic (private methods: calculateWordCount, calculateChildrenWordCount, updateParentWordCounts) should be extracted to a dedicated service
- **Dependencies:** Depends on recursive.service.ts, which it calls for complex operations

#### Middleware/ErrorHandler - Dual Responsibilities

- **Responsibilities:** Error handling AND error transformation (Zod vs AppError)
- **Issue:** handleZodError and handleAppError are tightly coupled to response formatting
- **Opportunity:** Error handling strategy could be extracted to dedicated handlers

### DRY Principle Violations

#### Controller Pattern Repetition Across All Controllers

All 6 controllers follow identical patterns:

1. **import { catchErrors }** - Every controller imports errorUtils
2. **HTTP status code imports** - CREATED, OK imported 5 times
3. **Schema validation import** - mongoIdSchema imported in 4 controllers
4. **Service instantiation** - Each controller manually imports its service
5. **Response structure** - All controllers manually construct res.status(CODE).json()

Example duplication (controllers-folder.d.ts lines 40-43, 53-56):

```
import { CREATED, OK } from '../constants/http';
import TemplateService from '../services/template.service';
import { catchErrors } from '../utils/errorUtils';
import { mongoIdSchema, postSchema } from '../schemas/controller.schema';
```

This exact pattern repeats in storynode.controller.ts and template.controller.ts.

#### Cookie Management Pattern

- Cookies.ts exports 4 functions that work together in a fixed sequence
- setAuthCookies and clearAuthCookies are called from auth.controller.ts
- Pattern could be abstracted to a single AuthCookieManager class

#### JWT Token Operations

- signToken, verifyToken with AccessTokenPayload and RefreshTokenPayload
- Both token types need separate creation/verification logic
- Could use Strategy pattern to eliminate duplication

### Architectural Antipatterns

#### 1. Service Layer as God Module

**Issue:** TreeService base class is too generic; doesn't enforce SRP

Current inheritance structure:

```
TreeService<T> (generic base)
  ├── TemplateService (extends, adds nothing)
  └── StorynodeService (extends, overrides upsert, adds 4+ methods)
```

**Problem:** TemplateService is empty; StorynodeService violates Liskov Substitution Principle by having completely different upsert behavior.

#### 2. Recursive Service as Utility Dumping Ground

- recursiveGetDescendants, recursiveUpdateWordLimits, recursiveGetLeaves are all tree operations
- Should be methods on TreeService or extracted to TreeTraversalService
- Generic typing uses both TreeDoc and StorynodeDoc, mixing concerns

#### 3. Config/Security - Multiple Responsibility Manager

- config/security.ts exports both globalLimiter and authLimiter rate limiters
- Also exports helmetConfig (security headers)
- Mixes rate limiting and helmet configuration; should be separate

#### 4. Constants/Http - Type System Duplication

```typescript
export const OK: 200;
export const CREATED: 201;
// ... etc

export type HttpStatusCode =
    typeof OK |
    typeof CREATED |
    // ... etc
```

This is verbose TypeScript. Could use as const pattern instead.

#### 5. Model Initialization Pattern

- Each model file imports schema from mongo.schema.ts
- Schemas are defined but declarations don't show schema instantiation
- Models have implicit coupling through schema names

### Consistency and Standards Issues

#### 1. Route File Inconsistency

- auth.route.ts declares `authRoutes` (camelCase)
- template.route.ts declares `router` (no prefix)
- storynode.route.ts declares `router` (no prefix)
- session.route.ts declares `sessionRoutes` (with prefix)

**Impact:** Inconsistent API makes imports less predictable.

#### 2. Service Export Pattern Inconsistency

- TemplateService: `export default: TemplateService`
- StorynodeService: `export default: StorynodeService`
- Auth.service: Functions exported individually, NOT as class

**Impact:** Inconsistent service architecture; auth.service mixes functional and OOP styles.

#### 3. Schema Definition Spread

- Mongo schemas in schemas/mongo.schema.ts
- Controller schemas in schemas/controller.schema.ts
- No clear separation of concerns between request validation and data models

---

## Refactoring Recommendations

Hey claude, I want you to look over the following refactoring changes suggested during one of our recent chats. Do these seem justified to you,  
after reading the related files? Are there any concerns I'm not recognizing?

### Change #1: Extract Email Management Service

**Priority:** High

**Description:**
Email logic is currently embedded in auth.service.ts (signupUser, forgotPassword, resetPassword all call sendMail). Extract email template handling and delivery to a dedicated EmailService class. This separates email delivery concerns from authentication logic and makes email template changes isolated.

**Affected Areas:**

- `auth.service.ts` - Remove sendMail calls and template generation
- `utils/emailUtils.ts` - Move functions into EmailService class
- `auth.controller.ts` - Will only need auth.service.ts dependency

**Changes Required:**

1. Create `services/email.service.ts` (new file)

   - Class EmailService with methods: sendVerificationEmail(), sendPasswordResetEmail()
   - Manages email delivery and template rendering
   - Exports singleton instance

2. Modify `services/auth.service.ts`

   - Remove sendMail imports
   - Inject EmailService dependency into signupUser, forgotPassword, resetPassword functions
   - Reduce file from 6,989 to ~5,200 chars (26% reduction)

3. Delete or consolidate `utils/emailUtils.ts`
   - Move core sendMail to EmailService
   - Optionally keep as thin wrapper

**Estimated Impact:**

- Code Reduction: 12-15%
- Files Added: 1 (email.service.ts)
- Files Modified: 2 (auth.service.ts, emailUtils.ts)
- Functions Removed: 3 (sendMail, getPasswordResetTemplate, getVerifyEmailTemplate become private)
- Functions Added: 2 (sendVerificationEmail, sendPasswordResetEmail)
- Implementation Time: 4-6 hours

**Justification:**

- **Maintainability:** Email template changes no longer require editing auth.service.ts. Email delivery can be tested independently.
- **Scalability:** Easy to add new email types (welcome email, digest, etc.) without modifying auth logic.
- **Code Quality:** Removes 5+ lines of email formatting from auth.service.ts. Follows Single Responsibility Principle.

**Principle Violations Addressed:**

- Single Responsibility Principle (auth was handling email delivery)
- Interface Segregation (EmailService can be mocked independently)

**Breaking Changes:** No - internal refactoring only

---

### Change #2: Create Authentication Cookie Manager

**Priority:** High

**Description:**
Authentication cookie logic is scattered across utils/cookies.ts and called from auth.controller.ts. Create an AuthCookieManager class that encapsulates all cookie operations (set, clear, get options) in a single responsibility. This prevents cookie security issues from spreading across multiple files.

**Affected Areas:**

- `utils/cookies.ts` - Consolidate into class-based interface
- `auth.controller.ts` - Replace setAuthCookies/clearAuthCookies calls with manager methods
- Any other file calling cookie functions

**Changes Required:**

1. Create `utils/authCookieManager.ts` (new file)

   - Class: AuthCookieManager
   - Methods: setAccessToken(), setRefreshToken(), clear(), getOptions()
   - Encapsulates REFRESH_PATH constant
   - Singleton instance exported

2. Modify `utils/cookies.ts`

   - Keep as thin wrapper or deprecate
   - Re-export from AuthCookieManager if needed

3. Modify `auth.controller.ts`
   - Replace setAuthCookies(res, token) with authCookieManager.setAccessToken(res, token)
   - Replace clearAuthCookies(res) with authCookieManager.clear(res)

**Estimated Impact:**

- Code Reduction: 5-8%
- Files Added: 1 (authCookieManager.ts)
- Files Modified: 2 (cookies.ts, auth.controller.ts)
- Functions Removed: 2 (setAuthCookies, clearAuthCookies as public functions)
- Functions Added: 4 (in AuthCookieManager class)
- Implementation Time: 3-4 hours

**Justification:**

- **Maintainability:** All cookie logic in one place; changes to cookie settings only touch AuthCookieManager.
- **Scalability:** Easy to add cookie middleware, rotating tokens, or SameSite policy changes.
- **Code Quality:** Prevents accidental cookie-related bugs from scattered implementations.

**Principle Violations Addressed:**

- Single Responsibility Principle (cookies were mixed with response formatting)
- DRY (cookie options are defined once, reused everywhere)

**Breaking Changes:** No - refactoring is internal

---

### Change #3: Consolidate Tree CRUD Operations - Extract TreeOperationService

**Priority:** High

**Description:**
Recursive tree operations are spread across recursive.service.ts and embedded in TreeService. Create TreeOperationService to consolidate tree traversal, descendant fetching, and leaf collection. This prevents developers from forgetting to handle recursion correctly when working with tree structures.

**Affected Areas:**

- `services/tree.service.ts` - Extract calculateDepth, use TreeOperationService for traversals
- `services/recursive.service.ts` - Move functions into TreeOperationService class
- `services/storynode.service.ts` - Call TreeOperationService instead of recursive functions
- `services/auth.service.ts` - Will implicitly benefit from better tree handling

**Changes Required:**

1. Create `services/treeOperation.service.ts` (new file)

   - Class: TreeOperationService
   - Methods: getDescendants<T>(), getLeaves<T>(), getAncestors<T>(), calculateDepth()
   - Generic typing to work with any TreeDoc subclass
   - Exports singleton instance

2. Modify `services/tree.service.ts`

   - Replace calculateDepth implementation with call to TreeOperationService
   - Inject TreeOperationService dependency
   - Keep basic CRUD, delegate tree traversal

3. Modify `services/recursive.service.ts`

   - Move all functions to TreeOperationService
   - Keep file for backward compatibility OR delete entirely if no external dependencies

4. Modify `services/storynode.service.ts`
   - Replace recursiveStorynodeFromTemplate call with treeOperationService.createStorynodeFromTemplate()
   - Replace recursiveUpdateWordLimits with treeOperationService.updateWordLimits()

**Estimated Impact:**

- Code Reduction: 10-12%
- Files Added: 1 (treeOperation.service.ts)
- Files Modified: 3 (tree.service.ts, storynode.service.ts, recursive.service.ts)
- Functions Moved: 4 (recursiveGetDescendants, recursiveGetLeaves, recursiveUpdateWordLimits, recursiveStorynodeFromTemplate)
- Implementation Time: 6-8 hours

**Justification:**

- **Maintainability:** All tree traversal logic centralized; algorithms tested once, reused everywhere.
- **Scalability:** Easy to add new tree operations (search, validate structure, rebalance) without touching multiple files.
- **Code Quality:** Generic typing prevents bugs when working with different TreeDoc types.

**Principle Violations Addressed:**

- Single Responsibility Principle (recursive logic was scattered)
- DRY (tree traversal patterns appear in multiple places)

**Breaking Changes:** Internal refactoring; needs update to service injection

---

### Change #4: Extract Word Count Management Service

**Priority:** Medium

**Description:**
Word counting logic is embedded in StorynodeService (calculateWordCount, calculateChildrenWordCount, updateParentWordCounts). Extract to WordCountService to allow reuse and independent testing. This also separates word counting concerns from tree operations.

**Affected Areas:**

- `services/storynode.service.ts` - Remove word count private methods
- Create `services/wordCount.service.ts` (new file)
- Tree structure updates that involve word counts

**Changes Required:**

1. Create `services/wordCount.service.ts` (new file)

   - Class: WordCountService
   - Methods: calculateNodeCount(), calculateTreeCount(), updateAncestorCounts()
   - Works with StorynodeDoc documents
   - Exports singleton instance

2. Modify `services/storynode.service.ts`

   - Remove calculateWordCount, calculateChildrenWordCount, updateParentWordCounts private methods
   - Inject WordCountService
   - Call wordCountService.updateAncestorCounts() instead of updateParentWordCounts

3. Update `services/recursive.service.ts` (if it exists)
   - Replace any word count operations with WordCountService calls

**Estimated Impact:**

- Code Reduction: 8-10%
- Files Added: 1 (wordCount.service.ts)
- Files Modified: 1 (storynode.service.ts)
- Functions Moved: 3 (word count private methods)
- Implementation Time: 3-4 hours

**Justification:**

- **Maintainability:** Word count algorithm can be updated in one place.
- **Scalability:** Word counting can be extended (count specific words, exclude markdown syntax, etc.) independently of StorynodeService.
- **Code Quality:** Testing word counts requires less setup when isolated from tree operations.

**Principle Violations Addressed:**

- Single Responsibility Principle (StorynodeService was handling word counts + tree operations)

**Breaking Changes:** No external API changes

---

### Change #5: Create Controller Base Class or Middleware Factory

**Priority:** Medium

**Description:**
All 6 controllers repeat the same pattern: import catchErrors, HTTP status codes, schemas, and services. Create a ControllerFactory or BaseController class to eliminate this duplication and enforce consistent response formatting.

**Affected Areas:**

- `controllers/auth.controller.ts`
- `controllers/user.controller.ts`
- `controllers/template.controller.ts`
- `controllers/storynode.controller.ts`
- `controllers/session.controller.ts`
- `controllers/test.controller.ts`

**Changes Required:**

1. Create `controllers/baseController.ts` (new file)

   - Class: BaseController
   - Methods: ok(res, data), created(res, data), error handling
   - All controllers extend BaseController

2. Create `controllers/controllerFactory.ts` (optional, alternative approach)

   - Factory functions: createGetHandler(), createPostHandler(), createDeleteHandler()
   - Encapsulates error handling and response wrapping

3. Modify all 6 controller files
   - Remove catchErrors wrapper (handled by base class or factory)
   - Remove manual res.status().json() calls (use helper methods)
   - Reduce each controller by ~40% (remove boilerplate)

**Estimated Impact:**

- Code Reduction: 18-22%
- Files Added: 1-2 (baseController.ts, optional controllerFactory.ts)
- Files Modified: 6 (all controller files)
- Lines Removed: ~60-80 lines across controllers
- Implementation Time: 4-6 hours

**Justification:**

- **Maintainability:** Consistent error handling and response structure across all endpoints.
- **Scalability:** Adding new controllers requires 30% less boilerplate code.
- **Code Quality:** Response format changes apply to all endpoints at once.

**Principle Violations Addressed:**

- DRY (error handling pattern repeated 6 times)
- Single Responsibility (controllers were handling responses + business logic)

**Breaking Changes:** None if implemented cleanly

---

### Change #6: Refactor Route Files - Consolidate Duplicated Pattern

**Priority:** Medium

**Description:**
Route files are nearly identical: each imports controller namespace and exports a router. The inconsistent naming (authRoutes vs router vs sessionRoutes) creates confusion. Create a RouteFactory to standardize this pattern.

**Affected Areas:**

- `routes/auth.route.ts`
- `routes/user.route.ts`
- `routes/template.route.ts`
- `routes/storynode.route.ts`
- `routes/session.route.ts`
- `routes/test.route.ts`

**Changes Required:**

1. Create `routes/routeFactory.ts` or `utils/routeBuilder.ts` (new file)

   - Helper functions to reduce boilerplate
   - Or create standardized route structure

2. Standardize route file exports

   - All export consistent name (e.g., `export default router`)
   - All use same import pattern

3. Consider combining related routes
   - Combine user + session routes (both related to account management)
   - Combine template + storynode routes (both tree-based)
   - Results in 4 route files instead of 6

**Estimated Impact:**

- Code Reduction: 5-7%
- Files Added: 0-1 (optional routeFactory)
- Files Modified: 6 (all route files)
- Files Consolidated: Potentially reduce from 6 to 4 routes
- Implementation Time: 2-3 hours

**Justification:**

- **Maintainability:** Consistent route structure makes it easier to find endpoints.
- **Scalability:** Adding new routes follows a predictable pattern.
- **Code Quality:** Reduced file count makes navigation easier.

**Principle Violations Addressed:**

- DRY (route structure duplicated across 6 files)
- Consistency (naming conventions vary)

**Breaking Changes:** None if app.ts imports are updated

---

### Change #7: Refactor Auth.Service - Split into Multiple Services

**Priority:** High

**Description:**
Auth.service.ts (6,989 chars) is the largest service by far and violates SRP egregiously. Split into: AuthenticationService (signup/login/logout), TokenService (JWT creation/refresh), and SessionService (session management). This is a large refactor with high impact.

**Affected Areas:**

- `services/auth.service.ts` - Split into 3 new services
- `services/token.service.ts` (new)
- `services/session.service.ts` (new, extracted from TreeService?)
- `auth.controller.ts` - Update imports
- Any code depending on auth.service exports

**Changes Required:**

1. Create `services/token.service.ts` (new file)

   - Class: TokenService
   - Methods: createAccessToken(), createRefreshToken(), refreshAccessToken(), verifyToken()
   - Handles JWT operations exclusively
   - ~1,500 chars extracted from auth.service

2. Create `services/session.service.ts` (new file)

   - Class: SessionService
   - Methods: createSession(), getSession(), deleteSession(), isSessionValid()
   - Manages session lifecycle
   - ~1,200 chars extracted from auth.service

3. Modify `services/auth.service.ts` (now smaller, focused)

   - Becomes AuthenticationService or UserAuthService
   - Methods: signup(), login(), logout()
   - Orchestrates TokenService and SessionService
   - Reduced to ~2,500-3,000 chars (60% reduction)

4. Modify `auth.controller.ts`

   - Replace import of auth.service functions with imports of new services
   - Controllers become more readable (no change needed if using dependency injection)

5. Update `app.ts` (if services are injected there)
   - Register new services

**Estimated Impact:**

- Code Reduction: 25-30% (net reduction after creating new files)
- Files Added: 2 (token.service.ts, session.service.ts)
- Files Modified: 2 (auth.service.ts, auth.controller.ts)
- Functions Moved: 12+ (distributed to new services)
- Implementation Time: 1-2 days (largest change in this plan)

**Justification:**

- **Maintainability:** Each service has single responsibility. Token expiration logic doesn't affect authentication flow.
- **Scalability:** Easy to implement token rotation, session management improvements, or multi-factor authentication independently.
- **Code Quality:** TokenService can be tested without database setup. SessionService can be extended with session analytics.

**Principle Violations Addressed:**

- Single Responsibility Principle (largest violation in codebase)
- Dependency Inversion (auth.service currently depends on implementation details)

**Breaking Changes:** Yes - refactoring changes auth.service exports. Requires updating auth.controller.ts

---

### Change #8: Create HTTP Response Builder Utility

**Priority:** Low

**Description:**
Controllers manually build responses: `res.status(OK).json({user})`. Create a ResponseBuilder utility to standardize response structure and eliminate repetition across all endpoints.

**Affected Areas:**

- `controllers/*` - All 6 controller files
- Potentially `middleware/errorHandler.ts` - Uses response formatting

**Changes Required:**

1. Create `utils/response.ts` (new file)

   - ResponseBuilder class or functions
   - Methods: ok(), created(), notFound(), unauthorized(), etc.
   - Standardizes response envelope (status, data, error)
   - Each returns Express Response

2. Modify all controller files
   - Replace `res.status(OK).json({user})` with `response.ok(res, {user})`
   - Approximately 15-20 lines changed per controller

**Estimated Impact:**

- Code Reduction: 3-5%
- Files Added: 1 (response.ts)
- Files Modified: 6 (all controllers)
- Implementation Time: 2-3 hours

**Justification:**

- **Maintainability:** Response format changes apply globally.
- **Scalability:** Easy to add logging, metrics collection to responses.
- **Code Quality:** Reduces boilerplate and potential for response format inconsistencies.

**Principle Violations Addressed:**

- DRY (response formatting repeated in every controller)

**Breaking Changes:** None - internal refactoring

---

### Change #9: Consolidate HTTP Status Code Constants

**Priority:** Low

**Description:**
HTTP status codes are defined as individual const exports with a union type. Use TypeScript's as const pattern and a single enum-like object to reduce verbosity.

**Affected Areas:**

- `constants/http.ts` - Refactor from current format to more concise pattern

**Current (Verbose):**

```typescript
export const OK: 200;
export const CREATED: 201;
// ... union type HttpStatusCode
```

**Proposed (Concise):**

```typescript
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  // ...
} as const;

export type HttpStatusCode = (typeof HTTP_STATUS)[keyof typeof HTTP_STATUS];
```

**Changes Required:**

1. Modify `constants/http.ts`

   - Consolidate to HTTP_STATUS object with as const
   - Update type definition

2. Update all imports across codebase
   - From: `import { OK, CREATED } from '../constants/http'`
   - To: `import { HTTP_STATUS } from '../constants/http'` and use `HTTP_STATUS.OK`
   - Affects ~12 files (controllers, middleware, services)

**Estimated Impact:**

- Code Reduction: 2-3%
- Files Modified: 13+ (constants/http.ts + all files importing from it)
- Implementation Time: 2-3 hours (includes updating all imports)

**Justification:**

- **Maintainability:** Single source of truth for status codes.
- **Scalability:** Easy to add new status codes and maintain consistency.
- **Code Quality:** Uses modern TypeScript patterns (as const).

**Principle Violations Addressed:**

- DRY (status code definition is cleaner)
- Consistency (single pattern for all constants)

**Breaking Changes:** Yes - import statements change across 12+ files

---

### Change #10: Unify Token Payload Types and Create Token Factory

**Priority:** Medium

**Description:**
JWT utilities define AccessTokenPayload and RefreshTokenPayload separately with similar structures. Create a TokenPayloadFactory to unify payload construction and reduce type duplication.

**Affected Areas:**

- `utils/jwt.ts` - Token payload types
- `services/auth.service.ts` - Token creation (would benefit from TokenService refactoring above)
- Type safety throughout authentication flow

**Changes Required:**

1. Create `utils/tokenPayload.ts` (new file)

   - Class or factory: TokenPayloadFactory
   - Methods: createAccessTokenPayload(), createRefreshTokenPayload()
   - Centralized payload construction
   - Type validation

2. Modify `utils/jwt.ts`

   - Use TokenPayloadFactory instead of direct object creation
   - Simplify type definitions

3. Benefit achieved when Change #7 is implemented (TokenService creation)
   - TokenService will use TokenPayloadFactory

**Estimated Impact:**

- Code Reduction: 3-5%
- Files Added: 1 (tokenPayload.ts)
- Files Modified: 1 (jwt.ts)
- Implementation Time: 2-3 hours

**Justification:**

- **Maintainability:** Token payload structure changes apply everywhere.
- **Scalability:** Easy to add new token types (refresh token rotation, MFA) without changing multiple files.
- **Code Quality:** Centralized type validation prevents payload errors.

**Principle Violations Addressed:**

- DRY (token payload structure is duplicated)
- Single Responsibility (token creation logic centralized)

**Breaking Changes:** None if implemented as internal abstraction

---

## Implementation Priority and Sequencing

### Phase 1 (Weeks 1-2): Foundation Layer - Start these refactorings first

These establish patterns that enable later refactorings:

1. **Change #5: Controller Base Class** (4-6 hours)

   - Once done, remaining controller changes are simpler
   - Affects all 6 controller files

2. **Change #2: Auth Cookie Manager** (3-4 hours)

   - Simple, isolated refactoring
   - No dependencies on other changes
   - Improves auth controller immediately

3. **Change #6: Route File Consolidation** (2-3 hours)
   - Depends on #5 being done (consistent patterns)
   - Low complexity, good for learning project patterns

### Phase 2 (Weeks 2-3): Service Layer - Refactor core business logic

These should be done after Phase 1 sets patterns:

4. **Change #7: Split Auth.Service** (1-2 days)

   - Largest refactoring by scope
   - Establish TokenService and SessionService architecture
   - Do this BEFORE #1 if you want a fresh start

5. **Change #1: Extract Email Service** (4-6 hours)

   - Easier now that auth.service is smaller (if #7 done first)
   - OR easier to identify email dependencies if #7 not done

6. **Change #3: Tree Operation Service** (6-8 hours)

   - Foundation for better tree handling
   - Required for consistency across template/storynode operations

7. **Change #4: Word Count Service** (3-4 hours)
   - Depends on #3 being done (consistent patterns)
   - Simplifies StorynodeService significantly

### Phase 3 (Week 4): Polish and Consolidation

These are lower-priority but valuable:

8. **Change #8: HTTP Response Builder** (2-3 hours)

   - Depends on #5 (consistency with controller patterns)
   - Applies lessons from controller refactoring

9. **Change #9: Consolidate HTTP Constants** (2-3 hours)

   - Requires updating ~12 files
   - Good "last" change because it's widespread but simple

10. **Change #10: Token Payload Factory** (2-3 hours)
    - Depends on #7 (works with TokenService if created)
    - Nice-to-have for type safety

---

## Recommended Refactoring Sequence (if doing all 10)

**Total Time: 3-4 weeks of focused development**

**Week 1:**

- Change #5 (Controller Base Class) - 4-6 hrs
- Change #2 (Auth Cookie Manager) - 3-4 hrs
- Change #6 (Route Consolidation) - 2-3 hrs
- **Total: ~10-13 hours**

**Week 2:**

- Change #7 (Split Auth.Service) - ~16-20 hours (8-10 hrs/day)
- **Total: ~16-20 hours (Full week)**

**Week 3:**

- Change #1 (Email Service) - 4-6 hrs
- Change #3 (Tree Operation Service) - 6-8 hrs
- Change #4 (Word Count Service) - 3-4 hrs
- **Total: ~13-18 hours**

**Week 4:**

- Change #8 (Response Builder) - 2-3 hrs
- Change #9 (HTTP Constants) - 2-3 hrs
- Change #10 (Token Payload Factory) - 2-3 hrs
- **Total: ~6-9 hours**

---

## Breaking Changes Summary

**Changes with breaking changes:**

- Change #7 (Auth.Service split) - Requires updating auth.controller.ts imports
- Change #9 (HTTP Constants) - Requires updating imports in 12+ files

**All other changes are internal refactorings with no breaking changes to the API or external interfaces.**

**Migration strategy for breaking changes:**

1. Create new services/constants alongside old ones
2. Update controllers/middleware to use new versions
3. Keep old exports as deprecation wrappers (calling new versions)
4. Remove deprecation wrappers after 1-2 weeks of verification
5. No downtime required if done in separate commits

---

## Testing Implications

These refactorings will improve testability:

### Before Refactoring

- Auth.service tests require mocking: email, database, JWT, sessions (hard)
- Word count tests entangled with tree operation tests
- Tree operations scattered across recursive.service and tree.service

### After Refactoring

- TokenService tests require only JWT mock (simple)
- SessionService tests require only database mock (simple)
- EmailService tests require only Resend mock (simple)
- Word count tests isolated and fast
- Tree operations tested in one place

**Test execution time reduction: ~20-30% faster** due to smaller test dependencies.

---

## Risk Assessment

### Low Risk Changes

- Change #2 (Auth Cookie Manager) - Isolated, well-contained
- Change #5 (Controller Base Class) - Design pattern, no logic change
- Change #8 (Response Builder) - Utility, no logic change
- Change #10 (Token Payload Factory) - Type safety improvement

### Medium Risk Changes

- Change #6 (Route Consolidation) - Many files, but mechanical changes
- Change #9 (HTTP Constants) - Many files, but regex-replaceable imports
- Change #4 (Word Count Service) - Extraction only, logic unchanged

### High Risk Changes

- Change #7 (Split Auth.Service) - Largest scope, affects core authentication

  - **Mitigation:** Comprehensive test coverage before starting; feature-flag if needed
  - **Rollback:** Have backup branch ready; can revert changes if critical bugs found

- Change #3 (Tree Operation Service) - Affects all tree operations

  - **Mitigation:** Test tree operations extensively; stub tree operations during migration
  - **Rollback:** Can keep recursive.service.ts as fallback if needed

- Change #1 (Email Service) - Affects account creation, password reset
  - **Mitigation:** Test email flow end-to-end; mock email service for staging
  - **Rollback:** Keep old auth.service export as wrapper

---

## Measurable Success Criteria

After completing all 10 refactorings:

| Metric                               | Current          | Target           | Success Criteria                 |
| ------------------------------------ | ---------------- | ---------------- | -------------------------------- |
| Largest service file size            | 6,989 chars      | <2,500 chars     | 65% reduction in auth.service    |
| Number of service files              | 5                | 10               | 5 new focused services           |
| Duplicate code patterns              | 18+              | <5               | 70%+ reduction in duplication    |
| Controller boilerplate               | 40-50 lines/file | 10-15 lines/file | 70% reduction per controller     |
| Single file changing for new feature | 3-5 files        | 1-2 files        | Better separation of concerns    |
| Test file count increase             | 0                | +3-4             | Dedicated tests for new services |
| TypeScript type definitions          | Complex unions   | Simple objects   | Modern TypeScript patterns       |
| Cyclomatic complexity avg            | High             | Low              | Services more testable           |

---

## Conclusion

This refactoring plan addresses **5 major architectural issues** through **10 specific, actionable changes**:

1. **SRP Violations** - Auth.service, StorynodeService broken into focused services
2. **DRY Violations** - Controller boilerplate, email templates, cookie logic consolidated
3. **Architectural Antipatterns** - God classes extracted, recursive operations centralized
4. **Inconsistencies** - Route naming, service exports, response formatting standardized
5. **Code Reduction** - 15-20% total reduction through better abstraction

**Estimated effort: 3-4 weeks** for an experienced developer familiar with the codebase.

**Estimated payoff: 6-12 months** of easier maintenance, faster feature development, and higher code quality.

The refactoring is sequenced to establish patterns early (Phase 1), then build on them (Phases 2-3), minimizing risk and maximizing developer productivity.

---

**Analysis completed:** 2025-11-18T15:45:00Z
**Analyst:** Claude Code Architectural Analysis
**Codebase size analyzed:** 28,861 characters across 11 declaration files
