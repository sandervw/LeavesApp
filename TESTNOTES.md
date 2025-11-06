# Test Notes

Recommended Approach: Vitest + SuperTest + mongodb-memory-server

Key packages to add:

- supertest - HTTP assertion library for testing Express endpoints
- mongodb-memory-server - In-memory MongoDB for isolated testing
- Your existing vitest setup

Advantages:

- Consistent testing framework across your codebase
- Fast test execution with in-memory database
- No external database dependencies for CI/CD
- Excellent TypeScript support (which you're already using)
- Can test full request/response cycle including middleware
- Isolated tests that don't affect your development database

Test structure for controllers:
import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import request from 'supertest';
import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import app from '../../../src/server'; // You'd need to export app separately

describe('Auth Controller Integration Tests', () => {
let mongoServer: MongoMemoryServer;

    beforeAll(async () => {
      mongoServer = await MongoMemoryServer.create();
      await mongoose.connect(mongoServer.getUri());
    });

    afterAll(async () => {
      await mongoose.disconnect();
      await mongoServer.stop();
    });

    beforeEach(async () => {
      // Clear all collections before each test
      await mongoose.connection.dropDatabase();
    });

    it('should signup a new user', async () => {
      const response = await request(app)
        .post('/auth/signup')
        .send({
          email: 'test@example.com',
          password: 'Password123!',
          username: 'testuser'
        })
        .expect(201);

      expect(response.body).toHaveProperty('_id');
      expect(response.body.email).toBe('test@example.com');
      expect(response.headers['set-cookie']).toBeDefined(); // Check cookies set
    });

});

For middleware testing:
describe('Authenticate Middleware', () => {
it('should reject request without access token', async () => {
await request(app)
.get('/user')
.expect(401);
});

    it('should allow request with valid token', async () => {
      // First create a user and get token
      const signupRes = await request(app)
        .post('/auth/signup')
        .send({ email: 'test@example.com', password: 'Pass123!', username: 'test' });

      const cookies = signupRes.headers['set-cookie'];

      await request(app)
        .get('/user')
        .set('Cookie', cookies)
        .expect(200);
    });

});

## Modifications:

need to make one small modification first:

Refactor server.ts to export app separately:

Current structure has app.listen() at the bottom. For testing, you want to export the app without starting the server:

// src/app.ts (new file)
export const app = express();
// ... all your middleware and routes setup

// src/server.ts
import { app } from './app';
app.listen(PORT, async () => {
console.log(`Listening on Port ${PORT} in ${NODE_ENV}`);
await connectToDatabase();
});

Packages to install:
npm install -D supertest mongodb-memory-server @types/supertest

Additional test setup file (tests/integration/setup.ts):
import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import { beforeAll, afterAll } from 'vitest';

let mongoServer: MongoMemoryServer;

beforeAll(async () => {
mongoServer = await MongoMemoryServer.create();
const uri = mongoServer.getUri();
await mongoose.connect(uri);
});

afterAll(async () => {
await mongoose.connection.dropDatabase();
await mongoose.disconnect();
await mongoServer.stop();
});
