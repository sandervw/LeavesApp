# Playwright E2E Testing Guide

## Purpose

This document provides a comprehensive reference for implementing Playwright E2E tests for the Leaves application. It catalogs all components, their selectors, navigation flows, drag-and-drop interactions, and wait conditions to help avoid common testing pitfalls.

**Common issues this guide addresses:**
- Using wrong selectors (no data-testid attributes exist in codebase)
- Misunderstanding component interaction patterns
- Forgetting to wait for component renders and API calls
- Incorrect drag-and-drop test implementation

---

## Components

### Layout Components

#### Navbar (`components/layout/Navbar.jsx`)

**Primary interactive elements:**
- **Logo link**: `h1` containing "Leaves" text → navigates to `/`
- **Searchbar**: Embedded component (see Searchbar section)
- **Theme toggle**: Button with sun/moon icon
- **Authenticated state**:
  - Username display: `.username` span
  - "Log Out" button: `.text-button.clickable` with "Log Out" text
- **Unauthenticated state**:
  - "Log In" button: `.text-button.clickable` with "Log In" text → navigates to `/login`
  - "Sign Up" button: `.text-button.clickable` with "Sign Up" text → navigates to `/signup`

**Conditional rendering:**
- Shows different layouts based on `user` from AuthContext
- Authenticated: username + logout button + theme toggle
- Not authenticated: login + signup buttons + theme toggle

**CSS selectors:**
```css
.navbar.container
.username
.text-button.clickable
.center-header /* searchbar container */
```

---

#### LinkSidebar (`components/layout/LinkSidebar.jsx`)

**Primary interactive elements:**
- **Stories section**: ExpandList component with "Stories" title
- **Templates section**: ExpandList component with "Templates" title
- **Archive section**: ExpandList component with "Archive" title
- **RubbishPile**: Drag-and-drop trash target at bottom

**Conditional rendering:**
- Only renders when user is authenticated

**CSS selectors:**
```css
.sidebar.container
.site-links
.links /* ul element */
.rubbish-pile
```

---

#### AddSidebar (`components/layout/AddSidebar.jsx`)

**Primary interactive elements:**
- **TemplateCreate** (on template pages): Draggable creation box
- **StorynodeCreate** (on story pages): Draggable creation box
- **ElementList**: List of addable templates

**Conditional rendering:**
- Only renders when user is authenticated
- Shows TemplateCreate on templates/templateDetail pages
- Shows StorynodeCreate on stories/archive/storynodeDetail pages

**CSS selectors:**
```css
.sidebar.container
```

---

### Part Components

#### Template (`components/part/Template.jsx`)

**Primary interactive elements:**
- **Name header**: `h3.clickable` → navigates to `/templatedetail/` with element ID
- **Text content**: MarkdownText component (read-only in list view)
- **Drag handle**: Appears on hover via DragHandlerContext

**CSS selectors:**
```css
.draggable
.clickable
.inline-trait
```

**Props:**
- `templateData`: object with _id, name, text, kind, type, parent, wordWeight
- `source`: 'static', 'children', 'roots' (determines drag behavior)

---

#### Storynode (`components/part/Storynode.jsx`)

**Primary interactive elements:**
- **Name header**: `h3.clickable` → navigates to `/storydetail/` with element ID
- **Text content**: MarkdownText component with word count display
- **Drag handle**: Appears on hover

**CSS selectors:**
```css
.draggable
.clickable
```

**Props:**
- `storynodeData`: object with _id, name, text, kind, type, parent, wordCount, wordLimit, isComplete, archived
- `source`: 'children', 'roots' (determines drag behavior)
- `locked`: boolean (prevents editing)

---

#### ElementList (`components/part/ElementList.jsx`)

**Primary interactive elements:**
- **Droppable zone**: Area where elements can be dropped
- **Child elements**: Renders Template or Storynode components based on `kind`

**CSS selectors:**
```css
.droppable.list
```

**Props:**
- `elements`: array of template/storynode objects
- `kind`: 'storynode' or 'template'
- `listType`: 'children', 'roots', or 'static'

---

#### ElementFeature (`components/part/ElementFeature.jsx`)

**Primary interactive elements:**
- **Name (h2)**: `#name` contentEditable → triggers `onUpdate` on blur
- **Type display**: `#type` read-only paragraph
- **Word Weight** (templates only): `#wordWeight` contentEditable → triggers `onUpdate` on blur
- **Word Limit** (storynodes, root only): `#wordLimit` contentEditable → triggers `onUpdate` on blur
- **Word Count** (storynodes only): `#wordCount` read-only paragraph
- **Text editor**: Large MarkdownText component

**CSS selectors:**
```css
.box.traits
.box
.inline-trait
.subtrait
#name
#type
#wordWeight
#wordLimit
#wordCount
```

**Conditional rendering:**
- wordWeight: Only shown for templates
- wordLimit: Only shown for storynodes, only editable for root type
- wordCount: Only shown for storynodes

---

#### TemplateCreate (`components/part/TemplateCreate.jsx`)

**Primary interactive elements:**
- **Name input**: InputHeader with placeholder "Enter name..."
- **Text editor**: MarkdownText component
- **Entire component**: Draggable (can be dragged to roots/children droppables)

**CSS selectors:**
```css
.draggable
#templateCreate
```

**Behavior:**
- Type is 'root' if no parent element, 'branch' if parent exists
- Updates based on ElementContext (parent changes)

---

#### StorynodeCreate (`components/part/StorynodeCreate.jsx`)

**Primary interactive elements:**
- **Name input**: InputHeader with placeholder "Enter name..."
- **Text editor**: MarkdownText component
- **Entire component**: Draggable

**CSS selectors:**
```css
.draggable
#storynodeCreate
```

**Behavior:**
- Type is 'root' if no parent, 'leaf' if parent exists

---

#### RubbishPile (`components/part/RubbishPile.jsx`)

**Primary interactive elements:**
- **Droppable zone**: Trash icon (droppable id: 'trash')
- **Delete confirmation modal**: Appears for detail/root elements

**CSS selectors:**
```css
.rubbish-pile
.rubbish-pile.active /* when dragging valid elements */
.icon
```

**Conditional rendering:**
- Active state when dragging detail, roots, or children elements
- Confirmation modal for detail/root deletions (not for children)

**Droppable ID:** `trash`

---

#### Searchbar (`components/part/Searchbar.jsx`)

**Primary interactive elements:**
- **Search input**: `input[placeholder='Search Stories and Templates']`
- **Dropdown results**: `.dropdown` containing list of matches
- **Result items**: `li` elements → navigate to detail pages on click

**CSS selectors:**
```css
input[placeholder='Search Stories and Templates']
.dropdown
.dropdown ul li
```

**Behavior:**
- Fetches all root storynodes and templates on mount
- Filters client-side (instant)
- Shows dropdown only when results exist

---

#### ExpandList (`components/part/ExpandList.jsx`)

**Primary interactive elements:**
- **Chevron icon**: `.icon` or `.icon.expanded` → toggles expand/collapse
- **Title link**: `.clickable` → navigates to list page
- **Child item links**: Individual links → navigate to detail pages

**CSS selectors:**
```css
.icon
.icon.expanded
.clickable
.links /* child list container */
```

**Props:**
- `type`: 'Story' or 'Template'
- `title`: Display name
- `items`: Array of tree items

---

#### ThemeToggle (`components/part/ThemeToggle.jsx`)

**Primary interactive elements:**
- **Moon button**: `button[title='moon icon']` → switches to dark theme
- **Sun button**: `button[title='sun icon']` → switches to light theme

---

### Part Components - Common

#### Buttons (`components/part/common/Buttons.jsx`)

**All buttons accept `onClick` callback**

**CSS selectors:**
```css
button[title='return icon']
button[title='download icon']
button[title='archive icon']
button[title='unarchive icon']
button[title='delete icon']
button[title='drag icon']
button[title='sun icon']
button[title='moon icon']
.icon
```

---

#### MarkdownText (`components/part/common/MarkdownText.jsx`)

**Interactive element:**
- **TipTap editor**: `.ProseMirror` contentEditable div

**CSS selectors:**
```css
.ProseMirror
.ProseMirror ul
.ProseMirror ol
.ProseMirror li
.ProseMirror p.is-editor-empty:first-child::before /* placeholder */
```

**Behavior:**
- Word count updates on every keystroke (real-time)
- Enforces word limit by preventing additions when limit reached
- Triggers `update` callback on blur
- Uses TipTap/ProseMirror (not plain contentEditable)

---

### Overlay Components

#### Login (`components/overlay/Login.jsx`)

**Primary interactive elements:**
- **Email input**: `input[type='email']` with placeholder='Username'
- **Password input**: `input[type='password']`
- **Log In button**: `.text-button.clickable` with "Log In" text
- **Cancel button**: `.text-button.clickable` with "Cancel" text
- **Forgot Password link**: `.text-button.clickable` with "Forgot Password?" text → navigates to `/password/forgot`

**CSS selectors:**
```css
.modal-overlay
.modal-content
input[type='email']
input[type='password']
.text-button.clickable
.error /* error message display */
.loading /* loading message display */
```

**Form behavior:**
- Calls `authLogin` API on submit
- On success: stores user in localStorage, dispatches LOGIN action, navigates to `/`
- On error: displays error message
- Loading state: shows "Loading..." text

---

#### Signup (`components/overlay/Signup.jsx`)

**Primary interactive elements:**
- **Email input**: `input[type='email']`
- **Username input**: `input[type='text']`
- **Password input**: `input[type='password']`
- **Sign Up button**: `.text-button.clickable` with "Sign Up" text
- **Cancel button**: `.text-button.clickable` with "Cancel" text

**CSS selectors:**
```css
.modal-overlay
.modal-content
input[type='email']
input[type='text']
input[type='password']
.text-button
.error
.loading
```

**Form behavior:**
- Calls `authSignup` API
- Same success/error flow as Login

---

#### ForgotPassword (`components/overlay/ForgotPassword.jsx`)

**Primary interactive elements:**
- **Email input**: `input[type='email']`
- **Submit button**: "Send Password Reset Email" text

**CSS selectors:**
```css
.modal-overlay
.modal-content
input[type='email']
```

**Form behavior:**
- Calls `forgotPassword` API
- On success: shows success message instead of form
- No navigation (stays on page)

---

#### ResetPassword (`components/overlay/ResetPassword.jsx`)

**Primary interactive elements:**
- **Password input**: `input[type='password']`
- **Reset button**: "Reset Password" text

**CSS selectors:**
```css
.modal-overlay
.modal-content
input[type='password']
```

**Form behavior:**
- Validates verification code from URL params (`?code=X&exp=Y`)
- Shows invalid link message if expired
- On success: shows success message, redirects to `/login` after 3 seconds

---

#### VerifyEmail (`components/overlay/VerifyEmail.jsx`)

**Primary interactive elements:**
- Auto-verifies on mount (no user interaction)
- Shows success or error message

**CSS selectors:**
```css
.modal-overlay
.modal-content
.text-button.clickable /* on error, to reset password */
```

**Form behavior:**
- Automatically calls `verifyEmail` API on mount
- Code extracted from URL params (`:code` param)
- Loading state: shows "Loading..."
- Success: "Email Verified" message
- Error: Error message with reset password button

---

#### DeleteConfirmation (`components/overlay/DeleteConfirmation.jsx`)

**Primary interactive elements:**
- **Delete button**: `.delete-button.text-button`
- **Cancel button**: `.cancel-button.text-button`

**CSS selectors:**
```css
.modal-overlay
.modal-content
.delete-button
.cancel-button
```

---

### Wrapper Components

#### AuthContainer (`components/wrapper/AuthContainer.jsx`)

**No direct interactive elements** - pure routing logic

**Behavior:**
- Checks if user is authenticated via AuthContext
- Renders `<Outlet />` if authenticated
- Redirects to `/landing` if not authenticated
- Saves intended redirect URL in location state

---

#### Draggable (`components/wrapper/Draggable.jsx`)

**Props:**
- `id`: string (unique identifier)
- `source`: 'static', 'children', 'roots', 'storynodeCreate', 'templateCreate', 'detail'
- `data`: object (element data)
- `className`: string
- `children`: ReactNode

**Behavior:**
- Uses `@dnd-kit/core`'s `useDraggable` hook
- Provides DragHandlerContext to children
- Applies transform style during drag
- Adds `.dragging` class when being dragged

---

#### Droppable (`components/wrapper/Droppable.jsx`)

**Props:**
- `id`: string
- `className`: string
- `function`: callback to execute on drop
- `children`: ReactNode

**Behavior:**
- Uses `@dnd-kit/core`'s `useDroppable` hook
- Stores function in data that gets called on drop

---

## Contexts

### AuthContext (`context/AuthContext.jsx`)

**State managed:**
- `user`: object or null (current authenticated user)

**Actions:**
- `LOGIN`: Sets user and saves to localStorage
- `LOGOUT`: Clears user and removes from localStorage

**Key values/methods:**
- `user`: Current user object
- `dispatch`: Function to dispatch actions

**Used by:** Navbar, sidebars, all protected pages, auth forms

---

### ElementContext (`context/ElementContext.jsx`)

**State managed:**
- `element`: object or null (current element being viewed/edited on detail pages)
- `children`: array or null (children of current element)

**Actions:**
- `SET_CHILDREN`: Updates children array
- `SET_ELEMENT`: Updates current element
- `CREATE_CHILD`: Adds child to children array and updates parent
- `UPDATE_CHILD`: Updates a specific child and recalculates parent word count
- `DELETE_CHILD`: Removes child and updates parent

**Key values/methods:**
- `element`: Current element object
- `children`: Array of child elements
- `dispatch`: Function to dispatch actions

**Used by:** Detail pages, ElementList, ElementFeature, Create components

---

### PageContext (`context/PageContext.jsx`)

**State managed:**
- `currentPage`: string or null ('stories', 'templates', 'archive', 'storynodeDetail', 'templateDetail', 'landing', 'formPage')

**Actions:**
- `SET_PAGE`: Updates current page

**Purpose:**
- Used by sidebars to determine which components to show

**Used by:** AddSidebar, usePage hook

---

### TreelistContext (`context/TreelistContext.jsx`)

**State managed:**
- `trees`: array or null (list of all root-level trees - templates and storynodes)

**Actions:**
- `SET_TREES`: Replaces entire tree list
- `DELETE_TREE`: Removes tree by ID
- `CREATE_TREE`: Adds new tree

**Key values/methods:**
- `trees`: Array of objects with {_id, name, kind, archived}
- `dispatch`: Function to dispatch actions

**Used by:** LinkSidebar, Searchbar, useDropHandler

---

### AddableContext (`context/AddableContext.jsx`)

**State managed:**
- `addables`: array or null (templates that can be added to current view)

**Actions:**
- `SET_ADDABLES`: Replaces addables array
- `UPDATE_ADDABLE`: Updates a specific addable

**Used by:** AddSidebar, ElementList (listType='static'), usePage

---

### DragHandlerContext (`context/DragHandlerContext.js`)

**State managed:**
- Drag listeners and attributes from @dnd-kit

**Purpose:**
- Allows nested elements (like drag handles) to control parent draggable
- Set by Draggable wrapper

**Used by:** ElementTraits components, DraggableButton

---

## Hooks

### useAPI (`hooks/useAPI.js`)

**Purpose:** Wrapper for all API calls with error and loading state management

**Returns:**
- `apiCall`: function (takes method name and args, calls corresponding API service method)
- `error`: any (error from last API call)
- `isPending`: boolean (loading state)

**Usage pattern:**
```javascript
const { apiCall, error, isPending } = useAPI();
const result = await apiCall('fetchElements', 'storynode', 'type=root');
```

---

### useAuthContext (`hooks/useAuthContext.js`)

**Purpose:** Access AuthContext with error checking

**Returns:**
- `user`: object or null
- `dispatch`: function

**Throws error** if used outside AuthContextProvider

---

### useElementContext (`hooks/useElementContext.js`)

**Purpose:** Access ElementContext with error checking

**Returns:**
- `element`: object or null
- `children`: array or null
- `dispatch`: function

**Throws error** if used outside ElementContextProvider

---

### usePageContext (`hooks/usePageContext.js`)

**Purpose:** Access PageContext with error checking

**Returns:**
- `currentPage`: string or null
- `dispatch`: function

**Throws error** if used outside PageContextProvider

---

### useTreelistContext (`hooks/useTreelistContext.js`)

**Purpose:** Access TreelistContext with error checking

**Returns:**
- `trees`: array or null
- `dispatch`: function

**Throws error** if used outside TreelistContextProvider

---

### useAddableContext (`hooks/useAddableContext.js`)

**Purpose:** Access AddableContext with error checking

**Returns:**
- `addables`: array or null
- `dispatch`: function

**Throws error** if used outside AddableContextProvider

---

### usePage (`hooks/usePage.js`)

**Purpose:** Fetches and sets page-specific data (element, children, addables, currentPage)

**Props:**
- `page`: string ('stories', 'templates', 'archive', 'storynodeDetail', 'templateDetail')
- `elementID`: string (optional, for detail pages)

**Returns:**
- `error`: any
- `isPending`: boolean
- `element`: object or string
- `children`: array
- `addables`: array
- `currentPage`: string

**Behavior by page:**
- **stories**: Fetches root storynodes (not archived) + root templates as addables
- **templates**: Fetches root templates, no addables
- **archive**: Fetches archived root storynodes, no addables
- **storynodeDetail**: Fetches specific storynode + its children + branch templates as addables
- **templateDetail**: Fetches specific template + its children, no addables

---

### useDropHandler (`hooks/useDropHandler.js`)

**Purpose:** Handles drag-and-drop logic for adding/deleting elements

**Props:**
- `droppableType`: 'Roots', 'children', 'static', or 'trash'

**Returns:**
- `handleDelete`: function (deletes element and updates contexts)
- `handleAdd`: function (creates/adds element and updates contexts)

**Add logic:**
- **Roots**: Creates root element or template instance
- **Children**: Creates child element or template instance under current element

**Delete logic:**
- Calls deleteElement API
- Updates ElementContext and TreelistContext
- Navigates to parent if deleting current detail element

---

## Routes

### Protected Routes (require authentication via AuthContainer)

| Path | Component | Main Content | Context Dependencies |
|------|-----------|--------------|---------------------|
| `/` | Stories | ElementList with root storynodes | ElementContext (children), AddableContext (addables) |
| `/stories` | Stories | Same as `/` | Same as `/` |
| `/templates` | Templates | ElementList with root templates | ElementContext (children) |
| `/archive` | Archive | ElementList with archived storynodes | ElementContext (children) |
| `/storydetail/` | StorynodeDetail | ElementFeature + ElementList (children) + action buttons | ElementContext (element, children), AddableContext (branch templates) |
| `/templatedetail/` | TemplateDetail | ElementFeature + ElementList (children) | ElementContext (element, children) |

**Navigation:** Detail pages use `location.state` for element ID

---

### Public Routes (no authentication required)

| Path | Component | Main Content | Notes |
|------|-----------|--------------|-------|
| `/landing` | Landing | Static MarkdownText content | Redirects to `/` if authenticated |
| `/signup` | FormPage | Signup overlay (modal) | |
| `/login` | FormPage | Login overlay (modal) | |
| `/password/forgot` | FormPage | ForgotPassword overlay | |
| `/password/reset` | FormPage | ResetPassword overlay | URL params: `?code=X&exp=Y` |
| `/email/verify/:code` | FormPage | VerifyEmail overlay | URL param: `:code` |

---

## Component Relationships

### Parent-Child Hierarchy

```
App
├── Navbar (always visible)
│   ├── Logo Link → /
│   ├── Searchbar
│   │   └── Dropdown (when results exist)
│   │       └── Result items → navigate to detail pages
│   ├── Auth buttons (conditional)
│   │   ├── Authenticated: Username + "Log Out"
│   │   └── Not authenticated: "Log In" + "Sign Up"
│   └── ThemeToggle (MoonButton or SunButton)
│
├── LinkSidebar (if authenticated)
│   ├── ExpandList (Stories) → /stories
│   │   └── Story links → /storydetail/ (when expanded)
│   ├── ExpandList (Templates) → /templates
│   │   └── Template links → /templatedetail/ (when expanded)
│   ├── ExpandList (Archive) → /archive
│   │   └── Archive links → /storydetail/ (when expanded)
│   └── RubbishPile
│       └── DeleteConfirmation modal (conditional)
│
├── Routes
│   ├── Protected Routes (AuthContainer wrapper)
│   │   ├── Stories (/stories)
│   │   │   └── ElementList (roots droppable)
│   │   │       └── Storynode components (draggable)
│   │   │           ├── h3.clickable → /storydetail/
│   │   │           └── MarkdownText
│   │   │
│   │   ├── Templates (/templates)
│   │   │   └── ElementList (roots droppable)
│   │   │       └── Template components (draggable)
│   │   │           ├── h3.clickable → /templatedetail/
│   │   │           └── MarkdownText
│   │   │
│   │   ├── Archive (/archive)
│   │   │   └── ElementList (roots droppable)
│   │   │       └── Storynode components (draggable)
│   │   │
│   │   ├── StorynodeDetail (/storydetail/)
│   │   │   ├── Draggable (detail element)
│   │   │   │   ├── Action buttons
│   │   │   │   │   ├── ReturnButton → navigate to parent or /
│   │   │   │   │   ├── DownloadButton
│   │   │   │   │   ├── ArchiveButton OR UnarchiveButton
│   │   │   │   └── ElementFeature
│   │   │   │       ├── h2#name (editable)
│   │   │   │       ├── #type (read-only)
│   │   │   │       ├── #wordLimit (editable if root)
│   │   │   │       ├── #wordCount (read-only)
│   │   │   │       └── MarkdownText (large editor)
│   │   │   └── ElementList (children droppable)
│   │   │       └── Storynode components
│   │   │
│   │   └── TemplateDetail (/templatedetail/)
│   │       ├── Draggable (detail element)
│   │       │   └── ElementFeature
│   │       │       ├── h2#name (editable)
│   │       │       ├── #type (read-only)
│   │       │       ├── #wordWeight (editable)
│   │       │       └── MarkdownText (large editor)
│   │       └── ElementList (children droppable)
│   │           └── Template components
│   │
│   └── Public Routes
│       ├── Landing (/landing) → MarkdownText
│       ├── FormPage → Login (/login)
│       ├── FormPage → Signup (/signup)
│       ├── FormPage → ForgotPassword (/password/forgot)
│       ├── FormPage → ResetPassword (/password/reset)
│       └── FormPage → VerifyEmail (/email/verify/:code)
│
└── AddSidebar (if authenticated)
    ├── TemplateCreate (on template pages, draggable)
    │   ├── InputHeader
    │   └── MarkdownText
    │   OR
    ├── StorynodeCreate (on story pages, draggable)
    │   ├── InputHeader
    │   └── MarkdownText
    │
    └── ElementList (static addables)
        └── Template components (draggable)
```

---

### Navigation Flows

#### Authentication Flow
1. **Signup:**
   - User on `/landing` → clicks "Sign Up" → Navigate to `/signup`
   - User fills form → Submit → API call (`authSignup`)
   - **Wait for:** API response, user stored in localStorage, LOGIN action dispatched
   - → Navigate to `/` (Stories page)

2. **Login:**
   - User on `/landing` → clicks "Log In" → Navigate to `/login`
   - User fills form → Submit → API call (`authLogin`)
   - **Wait for:** API response, user stored in localStorage, LOGIN action dispatched
   - → Navigate to `/` (Stories page)

3. **Logout:**
   - User clicks "Log Out" in Navbar
   - **Immediate actions:** LOGOUT action dispatched, localStorage cleared, contexts cleared
   - API call (`authLogout`) fires without await
   - → AuthContainer redirects to `/landing`

4. **Forgot Password:**
   - User on `/login` → clicks "Forgot Password?" → Navigate to `/password/forgot`
   - User enters email → Submit → API call (`forgotPassword`)
   - **Wait for:** API response
   - → Success message shown (no navigation)
   - User receives email → clicks link → Navigate to `/password/reset?code=X&exp=Y`
   - User enters new password → Submit → API call (`resetPassword`)
   - **Wait for:** API response, 3-second timer
   - → Navigate to `/login`

5. **Email Verification:**
   - User signs up → API sends verification email
   - User clicks link → Navigate to `/email/verify/:code`
   - Component auto-calls `verifyEmail` API on mount
   - **Wait for:** API response
   - → Success or error message displayed (no navigation)

---

#### Template to Story Creation Flow
1. User on Stories page (`/stories`)
2. AddSidebar shows root templates as "addables"
3. User drags template → drops on roots droppable
4. **API call:** `createFromTemplate(templateId, null)`
5. **Wait for:** API response with new storynode tree
6. **Context updates:**
   - ElementContext: CREATE_CHILD action
   - TreelistContext: CREATE_TREE action
7. → New storynode appears in list

---

#### Element Navigation Flow
1. User on list page (Stories/Templates/Archive)
2. User clicks element name (h3.clickable)
3. → Navigate to `/storydetail/` or `/templatedetail/` with element ID in `location.state`
4. **API calls:**
   - `fetchElement(kind, id)`
   - `fetchChildren(kind, id)`
   - `fetchElements` for addables (storynodes only)
5. **Wait for:** All API responses, isPending becomes false
6. **Context updates:**
   - ElementContext: SET_ELEMENT, SET_CHILDREN actions
   - AddableContext: SET_ADDABLES action (storynodes only)
   - PageContext: SET_PAGE action
7. → Detail page renders

**From detail page:**
- Click child name → Navigate to child's detail page (repeat flow)
- Click Return button → Navigate to parent's detail page or `/` if no parent

---

#### Search Navigation Flow
1. User types in searchbar
2. **Wait for:** Client-side filter (instant, no API call)
3. Dropdown appears with results
4. User clicks result
5. → Navigate to appropriate detail page with ID in `location.state`
6. Searchbar cleared

---

### Conditional Rendering

#### Based on Authentication (AuthContext)
- **Navbar:** Shows username/logout vs login/signup buttons
- **LinkSidebar:** Only renders if authenticated
- **AddSidebar:** Only renders if authenticated
- **Protected routes:** Redirect to `/landing` if not authenticated
- **Landing page:** Redirects to `/` if authenticated

---

#### Based on Page (PageContext)
- **AddSidebar:**
  - Shows **TemplateCreate** on template/templateDetail pages
  - Shows **StorynodeCreate** on stories/archive/storynodeDetail pages

---

#### Based on Element State (ElementContext)
- **StorynodeDetail:**
  - Shows **ArchiveButton** if `element.archived === false`
  - Shows **UnarchiveButton** if `element.archived === true`
- **ElementFeature:**
  - Shows `#wordWeight` for templates only
  - Shows `#wordLimit` and `#wordCount` for storynodes only
  - `#wordLimit` only editable if `element.type === 'root'`
- **TemplateCreate/StorynodeCreate:**
  - Type is 'root' if no element in ElementContext
  - Type is 'branch'/'leaf' if parent element exists

---

#### Based on Drag State (DndContext)
- **RubbishPile:** Shows `.active` class when dragging valid elements (detail, roots, or children sources)
- **Draggable:** Adds `.dragging` class during drag
- **Drag handles:** Appear on hover via CSS

---

#### Based on Local State
- **Searchbar:** Shows dropdown only when `filteredResults.length > 0`
- **ExpandList:** Shows child links only when `expanded === true`
- **RubbishPile:** Shows DeleteConfirmation modal for certain drag sources (detail, roots)
- **Auth forms:** Show error/loading states based on `useAPI` returns

---

### State Dependencies

**AuthContext affects:**
- Navbar rendering (authenticated vs not)
- Sidebar visibility (both sidebars)
- Route access (AuthContainer checks user)
- All API calls (authentication required except auth endpoints)

**ElementContext affects:**
- Detail page content (element and children data)
- Create components in AddSidebar (parent ID and type determination)
- Word count recalculation on updates
- TreelistContext updates (when root-level elements created/deleted)

**PageContext affects:**
- AddSidebar content (which create component to show)

**TreelistContext affects:**
- LinkSidebar ExpandList links
- Searchbar available results

**AddableContext affects:**
- AddSidebar ElementList content (draggable templates)

**DndContext affects:**
- RubbishPile active state
- Draggable transform and className

---

## DnD Interactions

### Drag-and-Drop Configuration

**DndContext Setup (`App.jsx`):**
- Collision detection: Custom algorithm **prioritizes trash droppable** first
- Sensor: PointerSensor with **10px activation distance** (prevents accidental drags)
- onDragEnd: Custom handler calls drop target's stored function

**Collision Detection Priority:**
1. Check if trash is intersecting → return trash immediately
2. Otherwise, check other droppables normally

---

### Draggable Elements

| Element | Source ID | Location | Can Drop On | Data Included |
|---------|-----------|----------|-------------|---------------|
| **Template (from addables)** | `'static'` | AddSidebar → ElementList | Roots, Children | Full template object |
| **TemplateCreate** | `'templateCreate'` | AddSidebar (template pages) | Roots, Children | {name, text, kind, type, parent} |
| **StorynodeCreate** | `'storynodeCreate'` | AddSidebar (story pages) | Roots, Children | {name, text, kind, type, parent} |
| **Template (from lists)** | `'roots'` or `'children'` | Templates page, TemplateDetail | Trash only | Full template object |
| **Storynode (from lists)** | `'roots'` or `'children'` | Stories/Archive, StorynodeDetail | Trash only | Full storynode object |
| **Detail element** | `'detail'` | TemplateDetail, StorynodeDetail | Trash only | Current element object |

**Note:** Name defaults if empty:
- TemplateCreate: 'New root' or 'New branch'
- StorynodeCreate: 'New root' or 'New leaf'

---

### Droppable Zones

#### 1. Roots Droppable

**Droppable ID:** `'roots'`

**Location:** Stories, Templates, Archive pages (ElementList with `listType='roots'`)

**Accepts:**
- Templates (source='static') → Creates storynode tree from template
- TemplateCreate (source='templateCreate') → Creates new root template
- StorynodeCreate (source='storynodeCreate') → Creates new root storynode

**Drop Behavior:**
1. Calls `handleAdd` from `useDropHandler('roots')`
2. **API calls:**
   - If source='static': `createFromTemplate(templateId, null)`
   - If source='templateCreate' or 'storynodeCreate': `upsertElement(kind, data)`
3. **Context updates:**
   - ElementContext: CREATE_CHILD action
   - TreelistContext: CREATE_TREE action
4. New element appears in list

---

#### 2. Children Droppable

**Droppable ID:** `'children'`

**Location:** TemplateDetail, StorynodeDetail (ElementList with `listType='children'`)

**Accepts:**
- Templates (source='static') → Creates child from template
- TemplateCreate/StorynodeCreate → Creates new child

**Restrictions:**
- Cannot drop detail element on its own children (validation check)

**Drop Behavior:**
1. Calls `handleAdd` from `useDropHandler('children')`
2. **API calls:**
   - Updates parent element type from 'leaf' to 'branch' if needed
   - If source='static': `createFromTemplate(templateId, parentId)`
   - If source='templateCreate' or 'storynodeCreate': `upsertElement(kind, data)`
3. **Context updates:**
   - ElementContext: CREATE_CHILD action (updates parent and adds child)
4. New child appears in children list

---

#### 3. Static Droppable

**Droppable ID:** `'static'`

**Location:** AddSidebar (ElementList with `listType='static'`)

**Accepts:** Nothing (read-only list)

**Error:** Throws error if drop attempted

---

#### 4. Trash Droppable

**Droppable ID:** `'trash'`

**Location:** LinkSidebar → RubbishPile (fixed bottom-left)

**Accepts:**
- Elements from 'detail', 'roots', or 'children' sources

**Drop Behavior:**
1. If source='detail' or 'roots': Shows DeleteConfirmation modal
   - User must confirm deletion
2. If source='children': Immediately deletes (no confirmation)
3. Calls `handleDelete` from `useDropHandler('trash')`
4. **API call:** `deleteElement(kind, id)` (also deletes all descendants)
5. **Context updates:**
   - ElementContext: DELETE_CHILD action
   - TreelistContext: DELETE_TREE action (if root-level)
6. **Navigation:** If deleting detail element, navigates to parent or `/`

**Visual States:**
- Always visible
- Adds `.active` class when dragging valid elements
- Icon changes color when active

---

### handleDragEnd Flow

**Location:** `config/dndConfig.js`

```javascript
1. Extract active (dragged item) and over (drop target)
2. If over exists and active has data:
   - Get source from active.data.current.source
   - Get element from active.data.current.element
   - Call over.data.current.function(source, element)
```

The drop target's stored function handles all validation and API calls.

---

## Wait Conditions

### Authentication Operations

#### Login (`authLogin`)

**Trigger:** Submit button in Login form

**API Call:** `POST /auth/login`

**Wait for:**
1. `isPending` becomes `true`
2. API response received
3. User stored in localStorage
4. AuthContext dispatches `LOGIN` action
5. Navigation to `/` completes

**UI Indicators:**
- `.loading` div shows "Loading..." text
- Form disabled during submission

**Error State:**
- `.error` div shows error message
- `isPending` becomes `false`

**Playwright wait strategy:**
```javascript
// Wait for navigation after successful login
await page.waitForURL('/');
// Or wait for authenticated UI element
await page.waitForSelector('.username');
```

---

#### Signup (`authSignup`)

**Trigger:** Submit button in Signup form

**API Call:** `POST /auth/signup`

**Wait for:** Same as Login

**Playwright wait strategy:** Same as Login

---

#### Logout (`authLogout`)

**Trigger:** "Log Out" button in Navbar

**API Call:** `GET /auth/logout` (fire-and-forget, no await)

**Wait for:**
1. AuthContext dispatches `LOGOUT` action (immediate)
2. localStorage cleared (immediate)
3. Contexts cleared (immediate)
4. AuthContainer redirect to `/landing`

**Playwright wait strategy:**
```javascript
// Wait for redirect to landing page
await page.waitForURL('/landing');
// Or wait for unauthenticated UI
await page.waitForSelector('.text-button.clickable:has-text("Log In")');
```

---

#### Forgot Password (`forgotPassword`)

**Trigger:** Submit button in ForgotPassword form

**API Call:** `POST /auth/password/forgot`

**Wait for:**
1. API response
2. `success` state set to `true`
3. Form replaced with success message

**Playwright wait strategy:**
```javascript
// Wait for success message
await page.waitForSelector('text=Password reset email sent successfully');
```

---

#### Reset Password (`resetPassword`)

**Trigger:** Submit button in ResetPassword form

**API Call:** `POST /auth/password/reset`

**Wait for:**
1. API response
2. Success message displayed
3. 3-second setTimeout
4. Navigation to `/login`

**Playwright wait strategy:**
```javascript
// Wait for success message
await page.waitForSelector('text=Password reset successful');
// Wait for navigation (after 3 seconds)
await page.waitForURL('/login', { timeout: 5000 });
```

---

#### Verify Email (`verifyEmail`)

**Trigger:** Component mount (automatic)

**API Call:** `GET /auth/email/verify/:code`

**Wait for:**
1. API response
2. Success or error message displayed

**Playwright wait strategy:**
```javascript
// Wait for success or error message
await page.waitForSelector('text=Email Verified, text=Invalid or expired verification link');
```

---

### Element CRUD Operations

#### Fetch Elements (`fetchElements`)

**Trigger:** Page load (Stories, Templates, Archive) via `usePage` hook

**API Call:** `GET /storynode?type=root` or `GET /template?type=root`

**Wait for:**
1. `isPending` becomes `true`
2. API response received
3. ElementContext dispatches `SET_CHILDREN`
4. AddableContext dispatches `SET_ADDABLES` (if applicable)
5. PageContext dispatches `SET_PAGE`
6. `isPending` becomes `false`
7. Elements render in ElementList

**UI Indicators:**
- Page shows "Loading..." text while `isPending === true`

**Playwright wait strategy:**
```javascript
// Wait for elements to appear
await page.waitForSelector('.draggable');
// Or wait for loading to disappear
await page.waitForSelector('text=Loading...', { state: 'hidden' });
```

---

#### Fetch Single Element & Children

**Trigger:** Navigate to detail page via `usePage` hook

**API Calls:**
1. `GET /storynode/:id` or `GET /template/:id`
2. `GET /storynode/getchildren/:id` or `GET /template/getchildren/:id`
3. `GET /template?type=branch` (for storynodes only, to get addables)

**Wait for:**
1. All API responses
2. ElementContext: `SET_ELEMENT`, `SET_CHILDREN`
3. AddableContext: `SET_ADDABLES` (storynodes only)
4. PageContext: `SET_PAGE`
5. `isPending` becomes `false`
6. ElementFeature and children render

**Playwright wait strategy:**
```javascript
// Wait for element feature to render
await page.waitForSelector('#name');
await page.waitForSelector('.droppable.list'); // children list
```

---

#### Create/Update Element (`upsertElement`)

**Triggers:**
- Editing name/text/wordWeight/wordLimit on detail page (onBlur)
- Editing element in list view (onBlur)

**API Call:** `POST /storynode` or `POST /template`

**Wait for:**
1. API response
2. ElementContext: `UPDATE_CHILD` or `SET_ELEMENT` action
3. AddableContext: `UPDATE_ADDABLE` (if static list)

**UI Indicators:**
- **No explicit loading state** (optimistic update)
- Change visible immediately, API call in background

**Playwright wait strategy:**
```javascript
// Fill input
await page.fill('#name', 'New Name');
// Blur input to trigger save
await page.evaluate(() => document.activeElement.blur());
// Wait a bit for API call (no explicit indicator)
await page.waitForTimeout(500);
// Or wait for network request
await page.waitForResponse(response =>
  response.url().includes('/storynode') || response.url().includes('/template')
);
```

---

#### Create from Template (`createFromTemplate`)

**Trigger:** Dropping template (source='static') on roots/children droppable

**API Call:** `POST /storynode/postfromtemplate`

**Wait for:**
1. API response with new storynode tree
2. ElementContext: `CREATE_CHILD` action
3. TreelistContext: `CREATE_TREE` action (if root)
4. New element renders in list

**UI Indicators:**
- **No explicit loading state**
- Element appears after API completes

**Playwright wait strategy:**
```javascript
// Perform drag and drop
await dragAndDrop(page, templateSelector, rootsDroppableSelector);
// Wait for new element to appear
await page.waitForSelector('.draggable', {
  state: 'attached',
  // Could use text content to identify specific element
});
// Or wait for API response
await page.waitForResponse(response =>
  response.url().includes('/postfromtemplate')
);
```

---

#### Delete Element (`deleteElement`)

**Trigger:** Dropping element on trash (after confirmation for roots/detail)

**API Call:** `DELETE /storynode/:id` or `DELETE /template/:id`

**Wait for:**
1. Confirmation modal (for detail/roots) → User clicks Delete button
2. API response
3. ElementContext: `DELETE_CHILD` action
4. TreelistContext: `DELETE_TREE` action (if root)
5. Element disappears from list
6. Navigation (if deleting detail element)

**Playwright wait strategy:**
```javascript
// Drag to trash
await dragAndDrop(page, elementSelector, '.rubbish-pile');
// Wait for confirmation modal (if applicable)
await page.waitForSelector('.delete-button');
await page.click('.delete-button');
// Wait for element to disappear
await page.waitForSelector(elementSelector, { state: 'detached' });
// If deleting detail element, wait for navigation
await page.waitForURL('/'); // or parent URL
```

---

### Navigation Wait Conditions

#### Link Navigation

**Trigger:** Click on any Link component

**Wait for:**
1. React Router navigation (instant client-side)
2. usePage hook runs
3. API calls complete (see "Fetch Elements" above)
4. Context updates
5. New page renders

**Playwright wait strategy:**
```javascript
// Click link
await page.click('text=Stories');
// Wait for URL change
await page.waitForURL('/stories');
// Wait for page content
await page.waitForSelector('.draggable');
```

---

#### Detail Page Navigation

**Trigger:** Click element name (h3.clickable)

**Wait for:**
1. Navigation to `/storydetail/` or `/templatedetail/`
2. Multiple API calls (element, children, addables)
3. ElementContext updates
4. Detail page renders

**Playwright wait strategy:**
```javascript
// Click element name
await page.click('h3.clickable:has-text("My Story")');
// Wait for detail page URL
await page.waitForURL(/\/storydetail\//);
// Wait for element feature to load
await page.waitForSelector('#name');
await page.waitForSelector('.droppable.list');
// Alternative: wait for loading to disappear
await page.waitForSelector('text=Loading...', { state: 'hidden' });
```

---

### State Update Wait Conditions

#### Word Count Updates

**Trigger:** Typing in MarkdownText (leaf storynodes only)

**Wait for:**
- **None** (real-time frontend update via callback)
- Word count display updates immediately

**Backend Sync:**
- Happens on blur when text is saved

**Playwright wait strategy:**
```javascript
// Type in editor
await page.fill('.ProseMirror', 'New text content');
// Word count updates immediately (no wait needed)
await expect(page.locator('text=/\\d+ words/')).toBeVisible();
```

---

#### Theme Toggle

**Trigger:** Moon/Sun button click

**Wait for:**
1. `setTheme` state update
2. useEffect runs
3. `document.documentElement.setAttribute('data-theme', theme)`
4. localStorage updated
5. CSS variables applied (instant visual change)

**Playwright wait strategy:**
```javascript
// Click theme toggle
await page.click('button[title="moon icon"]');
// Wait for theme attribute
await page.waitForFunction(() =>
  document.documentElement.getAttribute('data-theme') === 'dark'
);
// Or check CSS variable
await page.waitForFunction(() =>
  getComputedStyle(document.documentElement)
    .getPropertyValue('--c-bgPrimary') === '#1a1a1a'
);
```

---

#### Search Dropdown

**Trigger:** Typing in search input

**Wait for:**
1. `setSearchTerm` state update
2. Filter calculation (client-side, immediate)
3. Dropdown render

**Playwright wait strategy:**
```javascript
// Type in search
await page.fill('input[placeholder="Search Stories and Templates"]', 'My Story');
// Wait for dropdown to appear
await page.waitForSelector('.dropdown');
// Or wait for specific result
await page.waitForSelector('.dropdown li:has-text("My Story")');
```

---

#### Expand List

**Trigger:** Chevron icon click

**Wait for:**
1. `setExpand` state update (immediate)
2. Children render with CSS transition

**Playwright wait strategy:**
```javascript
// Click chevron
await page.click('.icon');
// Wait for expanded class
await page.waitForSelector('.icon.expanded');
// Wait for child links to appear
await page.waitForSelector('.links');
```

---

## Testing Considerations

### 1. No Existing Test IDs
- **Problem:** Codebase has NO `data-testid` attributes
- **Solution:** Use CSS selectors, text content, and ARIA attributes
- **Recommendation:** Consider adding `data-testid` for more reliable tests

### 2. CSS Selector Patterns
```css
/* BEM-like naming */
.modal-overlay
.modal-content
.sidebar.container

/* Utility classes */
.clickable
.dragging
.active

/* State-based */
.icon.expanded
.rubbish-pile.active

/* ID selectors */
#name
#wordLimit
#trash
```

### 3. Authentication State
- Persisted in localStorage under `'user'` key
- **Setup:** Clear localStorage between test runs
- **Teardown:** Always logout or clear localStorage

### 4. API Mocking
- All API calls go through axios instance in `apiClient.js`
- Base URL from `VITE_BASEAPIURL` env variable
- Auto token refresh on 401 errors

**Mock strategy:**
```javascript
// Intercept API calls
await page.route('**/storynode', route => {
  route.fulfill({
    status: 200,
    body: JSON.stringify([{ _id: '123', name: 'Test Story' }])
  });
});
```

### 5. Drag-and-Drop Testing
- Uses `@dnd-kit/core` (not HTML5 DnD API)
- Requires **10px drag distance** to activate
- Custom collision detection prioritizes trash

**Playwright DnD helper:**
```javascript
async function dragAndDrop(page, dragSelector, dropSelector) {
  const drag = await page.locator(dragSelector);
  const drop = await page.locator(dropSelector);

  const dragBox = await drag.boundingBox();
  const dropBox = await drop.boundingBox();

  await page.mouse.move(
    dragBox.x + dragBox.width / 2,
    dragBox.y + dragBox.height / 2
  );
  await page.mouse.down();
  // Move more than 10px to activate
  await page.mouse.move(
    dragBox.x + dragBox.width / 2 + 15,
    dragBox.y + dragBox.height / 2
  );
  await page.mouse.move(
    dropBox.x + dropBox.width / 2,
    dropBox.y + dropBox.height / 2
  );
  await page.mouse.up();
}
```

### 6. Markdown Editor (TipTap)
- Uses TipTap/ProseMirror (not plain contentEditable)
- Selector: `.ProseMirror`

**Interaction:**
```javascript
// Fill editor
await page.fill('.ProseMirror', 'New content');
// Or use type for character-by-character
await page.type('.ProseMirror', 'New content');
```

### 7. Dynamic Content
- Most lists render from API data
- Element IDs are MongoDB ObjectIds (24-char hex strings)
- Navigation uses `location.state` (React Router)

**Test data strategy:**
- Create fixtures with known IDs
- Use text content for matching instead of IDs where possible

### 8. Timing Considerations
- `usePage` hook may cause multiple renders due to useEffect dependencies
- Word count updates on blur, not on every keystroke
- Theme changes are immediate (CSS variable swap)
- Token refresh happens automatically and retries original request

**Debugging tips:**
- Use `{ timeout: 10000 }` for slow API calls
- Use `page.waitForLoadState('networkidle')` for complex page loads
- Use `page.pause()` for debugging

### 9. Error Handling
- Most errors logged to console, not displayed to user
- API errors show generic "Error: ..." messages
- Network failures might not have user-facing feedback

**Test strategy:**
- Check console logs for errors: `page.on('console', msg => console.log(msg.text()))`
- Mock error responses to test error states

### 10. Accessibility
- SVGs use `role='img'` and `aria-label`
- Forms have proper `input` types and `autoComplete`
- Buttons have `title` attributes (for tooltips)

**Test strategy:**
- Use ARIA selectors where available: `page.locator('role=button[name="Log Out"]')`

---

## Common Test Scenarios

### Scenario 1: User Signup and Login

```javascript
// 1. Navigate to signup
await page.goto('/signup');

// 2. Fill signup form
await page.fill('input[type="email"]', 'test@example.com');
await page.fill('input[type="text"]', 'testuser');
await page.fill('input[type="password"]', 'password123');

// 3. Submit
await page.click('.text-button:has-text("Sign Up")');

// 4. Wait for redirect to home
await page.waitForURL('/');

// 5. Verify authenticated UI
await expect(page.locator('.username')).toContainText('testuser');
```

### Scenario 2: Create Template from Scratch

```javascript
// 1. Navigate to templates page
await page.goto('/templates');
await page.waitForSelector('.draggable', { state: 'hidden' }); // Wait for loading

// 2. Fill TemplateCreate component
await page.fill('#templateCreate input', 'My New Template');
await page.fill('#templateCreate .ProseMirror', 'Template content');

// 3. Drag to roots droppable
await dragAndDrop(page, '#templateCreate', '.droppable.list');

// 4. Wait for new template to appear
await page.waitForSelector('text=My New Template');

// 5. Verify it appears in sidebar
await expect(page.locator('.links')).toContainText('My New Template');
```

### Scenario 3: Create Story from Template

```javascript
// 1. Navigate to stories page
await page.goto('/stories');

// 2. Find template in AddSidebar
const template = page.locator('.draggable:has-text("My Template")');

// 3. Drag template to roots droppable
await dragAndDrop(page, '.draggable:has-text("My Template")', '.droppable.list');

// 4. Wait for API response
await page.waitForResponse(response =>
  response.url().includes('/postfromtemplate')
);

// 5. Wait for new story to appear
await page.waitForSelector('.draggable:has-text("My Template")'); // Story inherits template name

// 6. Verify in sidebar
await page.click('.icon'); // Expand stories list
await expect(page.locator('.links')).toContainText('My Template');
```

### Scenario 4: Edit Story Details

```javascript
// 1. Navigate to story detail page
await page.click('h3.clickable:has-text("My Story")');
await page.waitForURL(/\/storydetail\//);
await page.waitForSelector('#name');

// 2. Edit name
await page.fill('#name', 'Updated Story Name');
await page.evaluate(() => document.activeElement.blur());

// 3. Wait for save
await page.waitForResponse(response =>
  response.url().includes('/storynode')
);

// 4. Edit word limit
await page.fill('#wordLimit', '1000');
await page.evaluate(() => document.activeElement.blur());

// 5. Edit text content
await page.fill('.ProseMirror', 'New story content with multiple words');
await page.evaluate(() => document.activeElement.blur());

// 6. Verify word count updates
await expect(page.locator('#wordCount')).toContainText('6 words');
```

### Scenario 5: Delete Element

```javascript
// 1. Navigate to stories page
await page.goto('/stories');

// 2. Drag story to trash
await dragAndDrop(page, '.draggable:has-text("My Story")', '.rubbish-pile');

// 3. Wait for confirmation modal
await page.waitForSelector('.delete-button');

// 4. Confirm deletion
await page.click('.delete-button');

// 5. Wait for element to disappear
await page.waitForSelector('.draggable:has-text("My Story")', { state: 'detached' });

// 6. Verify not in sidebar
await page.click('.icon'); // Expand stories list
await expect(page.locator('.links')).not.toContainText('My Story');
```

### Scenario 6: Search and Navigate

```javascript
// 1. Type in search
await page.fill('input[placeholder="Search Stories and Templates"]', 'My Story');

// 2. Wait for dropdown
await page.waitForSelector('.dropdown');

// 3. Click result
await page.click('.dropdown li:has-text("My Story")');

// 4. Wait for detail page
await page.waitForURL(/\/storydetail\//);
await page.waitForSelector('#name');

// 5. Verify correct element loaded
await expect(page.locator('#name')).toHaveValue('My Story');
```

---

## Summary

This guide provides:
- **Components:** All interactive elements with CSS selectors
- **Contexts:** State management understanding
- **Hooks:** Custom hook behaviors
- **Routes:** Navigation patterns and auth requirements
- **Relationships:** Parent-child hierarchy and navigation flows
- **DnD:** Complete drag-and-drop interaction mapping
- **Wait Conditions:** What to wait for after every major action
- **Testing Considerations:** Practical tips for Playwright implementation

Use this as a reference when implementing E2E tests to avoid common pitfalls with selectors, timing, and interaction patterns.
