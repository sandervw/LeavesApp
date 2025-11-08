# Tasks, features, updates, and fixes

| ID  | Title               | Description                                                                 | Completed? |
| --- | ------------------- | --------------------------------------------------------------------------- | ---------- |
| 001 | Password Reset      | Reset your login password                                                   | ✅         |
| 002 | Landing Page        | Fix and update the landing page                                             | ✅         |
| 003 | Word Limits         | Fix word limits on storynodes for adding/editing                            | ✅         |
| 004 | Fix Routing         | Fix routing issues when logged in user clicks 'Leaves' in Navbar            | ✅         |
| 005 | Fix Overlay         | Fix overlay on Searchbar rendering below MarkdownText                       | ✅         |
| 006 | Backend Testing     | Set up testing automation for backend API                                   | ✅         |
| 007 | Frontend Testing    | Set up testing automation for frontend React app                            | ⬜         |
| 008 | MongoDB Dev Setup   | Set up MongoDB instance in Azure DEV tenant                                 | ⬜         |
| 009 | Backend Deployment  | Deploy Backend API to Azure DEV environment                                 | ⬜         |
| 010 | Frontend Deployment | Deploy Frontend React app to Azure DEV environment                          | ⬜         |
| 011 | Deployment Testing  | Verify Azure deployments functionality                                      | ⬜         |
| 012 | Production Setup    | Set up Production MongoDB and deploy API/app to PRD                         | ⬜         |
| 013 | User Testing        | Invite Mom/Gerrit for application testing                                   | ⬜         |
| 014 | CSS Improvements    | Organize/Improve CSS; fixed style subset; modular elements                  | ⬜         |
| 015 | New Model Funcs     | Move service layer logic to model statics/methods                           | ⬜         |
| 016 | Next App Stack      | Research options for new backend/front (fullstack? Hono? Express outdated?) | ⬜         |

Issues Fixed:

1. localStorage Security Error in beforeEach (auth.spec.js:16-24)


    - Problem: Trying to clear localStorage/sessionStorage before navigating to a page caused security errors
    - Fix: Added await page.goto('http://localhost:5173') before clearing storage

2. Incorrect Form Selectors (throughout auth.spec.js)


    - Problem: Tests used getByLabel() but the forms use placeholders, not labels
    - Fix: Changed all selectors to use getByPlaceholder() for Email, Username, and Password fields
    - Also: Removed references to non-existent "Confirm Password" field

3. Multiple "Sign Up" Buttons (auth.spec.js:42 and throughout)


    - Problem: Both navbar and form had "Sign Up" buttons, causing strict mode violations
    - Fix: Scoped button selectors to the form using page.locator('form').getByRole('button', { name: 'Sign Up' })

4. Incorrect Redirect Expectation (auth.spec.js:45)


    - Problem: Test expected redirect to /stories but app redirects to / after signup
    - Fix: Changed waitForURL('/stories') to waitForURL('/')

5. Unimplemented isAuthenticated() Helper (helpers.js:316-320)


    - Problem: Helper function was a stub returning false
    - Fix: Implemented it to check for user in localStorage: localStorage.getItem('user')
