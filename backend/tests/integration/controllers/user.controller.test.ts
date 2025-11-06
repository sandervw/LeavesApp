import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import mongoose from 'mongoose';
import { app } from '../../../src/app';
import { createAuthenticatedUser } from '../helpers';
import UserModel from '../../../src/models/user.model';


describe('User Controller Tests', () => {

  beforeEach(async () => {
    // Clear all collections before each test
    await mongoose.connection.dropDatabase();
  });

  describe('Get User', () => {
    it('Should return user data without password for authenticated user', async () => {
      const { cookies, user } = await createAuthenticatedUser();

      const response = await request(app)
        .get('/user')
        .set('Cookie', cookies)
        .expect(200);

      expect(response.body.email).toBe(user.email);
      expect(response.body.username).toBe(user.username);
      expect(response.body.password).toBeUndefined();
    });

    it('Should return NOT_FOUND if user does not exist', async () => {
      const { cookies, userId } = await createAuthenticatedUser();

      // Delete the user after authentication
      await UserModel.findByIdAndDelete(userId);

      await request(app)
        .get('/user')
        .set('Cookie', cookies)
        .expect(404);
    });
  });

});