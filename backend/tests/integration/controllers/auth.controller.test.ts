import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import mongoose from 'mongoose';
import { app } from '../../../src/app';

// Aim for 2-3 tests per controller method
describe('Auth Controller Integration Tests', () => {

  beforeEach(async () => {
    // Clear all collections before each test
    await mongoose.connection.dropDatabase();
  });

  describe('Signup Controller', () => {
    it('should signup a new user with valid email, username, and password', async () => {
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

    it('Should return BAD_REQUEST error for a missing email field', async () => { });

    it('Should return CONFLICT error for an email already in-use', async () => { });
  });

  describe('Login Controller', () => {
    it('TODO', () => { });

    it('TODO', () => { });

    it('TODO', () => { });
  });

  describe('Logout Controller', () => {

    it('TODO', () => { });

    it('TODO', () => { });

    it('TODO', () => { });
  });

  describe('Refresh Controller', () => {
    it('TODO', () => { });

    it('TODO', () => { });

    it('TODO', () => { });
  });

  describe('Verify Email Controller', () => {
    it('TODO', () => { });

    it('TODO', () => { });

    it('TODO', () => { });
  });

  describe('Forgot Password Controller', () => {
    it('TODO', () => { });

    it('TODO', () => { });

    it('TODO', () => { });
  });

  describe('Reset Password Controller', () => {
    it('TODO', () => { });

    it('TODO', () => { });

    it('TODO', () => { });
  });

});