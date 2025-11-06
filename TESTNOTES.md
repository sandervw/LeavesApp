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
