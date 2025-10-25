# LeavesApp

## TECHNOLOGIES USED:
- **MongoDB**: NoSQL database program, uses JSON-like documents with schema
- **Express**: Web application framework for Node.js
- **Node.js**: Server runtime environment - allows JS on backend
- **React**: Frontend library for building user interfaces
- **TypeScript**: Typed superset of JavaScript
- **ZOD**: Schema validation library

## BACKEND

### Core Technologies
- **Runtime**: Node.js with TypeScript
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (JSON Web Tokens)
- **Email Service**: Resend API

### Key Dependencies
- `express`: Web framework
- `mongoose`: MongoDB object modeling
- `typescript`: Type support
- `cors`: Cross-Origin Resource Sharing
- `zod`: Schema validation
- `jsonwebtoken`: JWT implementation
- `cookie-parser`: Cookie handling
- `resend`: Email service client
- `dotenv`: Environment variable management

### Project Structure
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
BACKEND APP STRUCTURE
## server.ts: The main ENTRY-POINT of the application
## routes: The 'front desk' - groups routes, and DIRECTS them to correct controller
## controllers: A BRIDGE between routes and services - validation - returns https responses
## services: Perform the CORE LOGIC of the app - tranformations, conversions, saves, etc
## schemas: DEFINE SHAPE of incoming/outgoing data - validates frontend requests
## models: the database documents - the ACTUAL OBJECTS

### Features
- RESTful API architecture
- User authentication and session management
- Template CRUD operations
- Story node management
- Secure cookie-based token storage
- Email service integration
- Global error handling
- Type-safe development
- Environment-based configuration

### Security Features
- CORS origin restriction
- JWT-based authentication
- Refresh token rotation
- Cookie security
- Environment variable validation
- Request validation

### Deployment Requirements
Environment variables needed:
- `NODE_ENV`: Development/production environment
- `PORT`: Server port (default: 8080)
- `MONGO_URI`: MongoDB connection string
- `JWT_SECRET`: JWT signing secret
- `JWT_REFRESH_SECRET`: Refresh token secret
- `APP_ORIGIN`: Allowed CORS origin
- `EMAIL_SENDER`: Email sender address
- `RESEND_API_KEY`: Email service API key

### Getting Started
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