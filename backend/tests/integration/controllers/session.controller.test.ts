import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import mongoose from 'mongoose';
import { app } from '../../../src/app';
import { createAuthenticatedUser } from '../helpers';
import SessionModel from '../../../src/models/session.model';
import UserModel from '../../../src/models/user.model';


describe('Session Controller Tests', () => {

  beforeEach(async () => {
    // Clear all collections before each test
    await mongoose.connection.dropDatabase();
  });

  describe('Get Sessions', () => {
    it('Should return all active sessions for authenticated user', async () => {
      const { cookies } = await createAuthenticatedUser();

      const response = await request(app)
        .get('/session')
        .set('Cookie', cookies)
        .expect(200);

      expect(response.body).toBeInstanceOf(Array);
      expect(response.body.length).toBeGreaterThan(0);
    });

    it('Should mark current session with isCurrent property', async () => {
      const { cookies } = await createAuthenticatedUser();

      const response = await request(app)
        .get('/session')
        .set('Cookie', cookies)
        .expect(200);

      const currentSession = response.body.find((s: any) => s.isCurrent);
      expect(currentSession).toBeDefined();
    });

    it('Should not return expired sessions', async () => {
      const { cookies, userId } = await createAuthenticatedUser();

      // Create an expired session
      await SessionModel.create({
        userId: new mongoose.Types.ObjectId(userId),
        userAgent: 'expired-agent',
        expiresAt: new Date(Date.now() - 1000)
      });

      const response = await request(app)
        .get('/session')
        .set('Cookie', cookies)
        .expect(200);

      const expiredSession = response.body.find((s: any) => s.userAgent === 'expired-agent');
      expect(expiredSession).toBeUndefined();
    });
  });

  describe('Delete Session', () => {
    it('Should delete a session owned by the authenticated user', async () => {
      const { cookies, userId } = await createAuthenticatedUser();

      // Create an additional session
      const session = await SessionModel.create({
        userId: new mongoose.Types.ObjectId(userId),
        userAgent: 'test-agent',
        expiresAt: new Date(Date.now() + 1000000)
      });

      await request(app)
        .delete(`/session/${session._id}`)
        .set('Cookie', cookies)
        .expect(200);

      const deleted = await SessionModel.findById(session._id);
      expect(deleted).toBeNull();
    });

    it('Should return NOT_FOUND for a non-existent session', async () => {
      const { cookies } = await createAuthenticatedUser();
      const fakeId = new mongoose.Types.ObjectId();

      await request(app)
        .delete(`/session/${fakeId}`)
        .set('Cookie', cookies)
        .expect(404);
    });

    it('Should return NOT_FOUND when attempting to delete another user\'s session', async () => {
      const { cookies } = await createAuthenticatedUser('user1@example.com', 'Password123!', 'user1');
      const user2 = await UserModel.create({
        email: 'user2@example.com',
        username: 'user2',
        password: 'Password123!'
      });

      const otherUserSession = await SessionModel.create({
        userId: user2._id,
        userAgent: 'other-agent',
        expiresAt: new Date(Date.now() + 1000000)
      });

      await request(app)
        .delete(`/session/${otherUserSession._id}`)
        .set('Cookie', cookies)
        .expect(404);
    });
  });

});