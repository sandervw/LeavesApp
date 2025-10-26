# FRONTEND

## Core Technologies
* **Languages:** JavaScript (ES6+), with JSX for React components, and CSS for styling.
* **Frameworks/Libraries:**
  *   **React:** The core UI library.
  *   **Vite:** The build tool and development server.
  *   **React Router (`react-router-dom`):** For handling client-side routing.
  *   **Dnd-Kit (`@dnd-kit/core`):** A modern, lightweight, and accessible library for building drag-and-drop interfaces.
* **APIs:** The frontend consumes a RESTful API from the backend server for data persistence and authentication.

## Project Structure and Patterns
The frontend follows a standard feature-based structure for a React application. The main directory is `src/`, which contains:
* `components/`: Reusable UI components used across different pages.
  *   `layout/`: Components that define the overall application structure (e.g., `Navbar`, `AddSidebar`).
  *   `wrapper/`: Wrapper components providing shared functionality (e.g., `AuthContainer`).
* `pages/`: Components representing entire pages, corresponding to different routes.
  *   `protectedPages/`: Pages that require user authentication.
  *   `publicPages/`: Pages accessible to anyone.
* `config/`: Configuration files, such as for the drag-and-drop functionality.
* `App.jsx`: The root component of the application, setting up routing and global contexts.
* `main.jsx`: The entry point where the `App` component is rendered.

## Functionality
A content creation and storytelling tool ; features:
* **Authentication:** User signup, login, password reset, and email verification.
* **Story Management:** Authenticated users can create and view their stories.
* **Template Management:** Users can create and manage reusable templates for their stories.
* **Archiving:** Users can archive content.
* **Drag-and-Drop Interface:** Users can organize elements by dragging and dropping them.

## Main 'Entities'
* **Story:** The primary content object, composed of multiple Storynodes.
* **Storynode:** A single element within a Story (e.g., a text block or image).
* **Template:** A reusable structure for creating new Stories.
* **User:** The individual who creates and manages content.

## Running the Project
The project is run using Node.js and npm. To run the frontend in a development environment, navigate to the `LeavesApp/frontend` directory and run:
```bash
npm install
npm run dev
```
This will start the Vite development server, typically available at `http://localhost:5173`.

# BACKEND

## Core Technologies
- **TypeScript**: Typed superset of JavaScript
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM; NoSQL database, JSON documents with schema
- **Authentication**: JWT (JSON Web Tokens)
- **Email Service**: Resend API
- **ZOD**: Schema validation library

## Key Dependencies
- `express`: Web framework
- `mongoose`: MongoDB object modeling
- `typescript`: Type support
- `cors`: Cross-Origin Resource Sharing
- `zod`: Schema validation
- `jsonwebtoken`: JWT implementation
- `cookie-parser`: Cookie handling
- `resend`: Email service client
- `dotenv`: Environment variable management

## Project Structure and Patterns
```
backend/
├── src/
│   ├── routes/         # FRONT DESK - groups routes, DIRECTS to correct controller
│   ├── controllers/    # Request handlers - a BRIDGE between routes/server - validation - returns https responses
│   ├── services/       # CORE BUSINESS LOGIC - transformations, conversions, saves, etc
│   ├── models/         # Database documents - the ACTUAL OBJECTS
│   ├── schemas/        # DEFINE SHAPE of incoming/outgoing data - validates frontend requests
│   ├── middleware/     # CHAIN OF RESPONSIBLITIES - each link handles or forwards the request
│   ├── config/         # SINGLETONS - configuration files - single DB connection, resend mail client
│   ├── constants/      # App constants
│   ├── utils/          # App HELPER functions - stateless, commonly used functionality
│   └── server.ts       # ENTRY POINT of the app
```
App Structure
### server.ts: The main ENTRY-POINT of the application
### routes: The 'front desk' - groups routes, and DIRECTS them to correct controller
### controllers: A BRIDGE between routes and services - validation - returns https responses
### services: Perform the CORE LOGIC of the app - tranformations, conversions, saves, etc
### schemas: DEFINE SHAPE of incoming/outgoing data - validates frontend requests
### models: the database documents - the ACTUAL OBJECTS

## Features
- RESTful API architecture
- User authentication and session management
- Template CRUD operations
- Story node management
- Secure cookie-based token storage
- Email service integration
- Global error handling
- Type-safe development
- Environment-based configuration

## Security Features
- CORS origin restriction
- JWT-based authentication
- Refresh token rotation
- Cookie security
- Environment variable validation
- Request validation

## Deployment Requirements
Environment variables needed:
- `NODE_ENV`: Development/production environment
- `PORT`: Server port (default: 8080)
- `MONGO_URI`: MongoDB connection string
- `JWT_SECRET`: JWT signing secret
- `JWT_REFRESH_SECRET`: Refresh token secret
- `APP_ORIGIN`: Allowed CORS origin
- `EMAIL_SENDER`: Email sender address
- `RESEND_API_KEY`: Email service API key

## Getting Started
1. Install dependencies:
   ```bash
   npm install
   ```
2. Set up environment variables in `.env`
3. Start development server:
   ```bash
   npm run dev
   ```
4. Build for production:
   ```bash
   npm run build
   ```