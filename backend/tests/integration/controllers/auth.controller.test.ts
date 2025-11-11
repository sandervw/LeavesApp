import { describe, it, expect, beforeEach, vi } from 'vitest';
import request from 'supertest';
import mongoose from 'mongoose';
import { app } from '../../../src/app';
import UserModel from '../../../src/models/user.model';
import SessionModel from '../../../src/models/session.model';
import VerificationCodeModel from '../../../src/models/verificationCode.model';
import VerificationCodeType from '../../../src/constants/verificationCodeType';
import { oneYearFromNow, oneHourFromNow } from '../../../src/utils/date';

// Mock the email utility
vi.mock('../../../src/utils/emailUtils', () => ({
  sendMail: vi.fn().mockResolvedValue({ data: { id: 'test-email-id' }, error: null }),
  getVerifyEmailTemplate: vi.fn((url: string) => ({
    subject: 'Verify Email',
    text: `Verify: ${url}`,
    html: `<a href="${url}">Verify</a>`
  })),
  getPasswordResetTemplate: vi.fn((url: string) => ({
    subject: 'Reset Password',
    text: `Reset: ${url}`,
    html: `<a href="${url}">Reset</a>`
  }))
}));

describe('Auth Controller Tests', () => {

  beforeEach(async () => {
    // Clear all collections before each test
    await mongoose.connection.dropDatabase();
    vi.clearAllMocks();
  });

  describe('Signup', () => {
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
      expect(response.headers['set-cookie']).toBeDefined();
    });

    it('Should return BAD_REQUEST for a missing email field', async () => {
      await request(app)
        .post('/auth/signup')
        .send({
          password: 'Password123!',
          username: 'testuser'
        })
        .expect(400);
    });

    it('Should return CONFLICT for an email already in-use', async () => {
      await UserModel.create({
        email: 'existing@example.com',
        username: 'existinguser',
        password: 'Password123!'
      });

      await request(app)
        .post('/auth/signup')
        .send({
          email: 'existing@example.com',
          password: 'Password123!',
          username: 'newuser'
        })
        .expect(409);
    });
  });

  describe('Login', () => {
    it('Should login an existing user with valid email and password', async () => {
      await UserModel.create({
        email: 'login@example.com',
        username: 'loginuser',
        password: 'Password123!'
      });

      const response = await request(app)
        .post('/auth/login')
        .send({
          email: 'login@example.com',
          password: 'Password123!'
        })
        .expect(200);

      expect(response.body).toHaveProperty('_id');
      expect(response.headers['set-cookie']).toBeDefined();
    });

    it('Should return UNAUTHORIZED for a missing email field', async () => {
      await request(app)
        .post('/auth/login')
        .send({
          password: 'Password123!'
        })
        .expect(400);
    });

    it('Should return UNAUTHORIZED for an invalid password', async () => {
      await UserModel.create({
        email: 'login@example.com',
        username: 'loginuser',
        password: 'Password123!'
      });

      await request(app)
        .post('/auth/login')
        .send({
          email: 'login@example.com',
          password: 'WrongPassword123!'
        })
        .expect(401);
    });
  });

  describe('Logout', () => {
    it('Should logout a user with a valid access token', async () => {
      const signupResponse = await request(app)
        .post('/auth/signup')
        .send({
          email: 'logout@example.com',
          password: 'Password123!',
          username: 'logoutuser'
        });

      const cookies = signupResponse.headers['set-cookie'];

      await request(app)
        .get('/auth/logout')
        .set('Cookie', cookies)
        .expect(200);
    });
  });

  describe('Refresh', () => {
    it('Should refresh access token with valid refresh token', async () => {
      const signupResponse = await request(app)
        .post('/auth/signup')
        .send({
          email: 'refresh@example.com',
          password: 'Password123!',
          username: 'refreshuser'
        });

      const cookies = signupResponse.headers['set-cookie'];

      const response = await request(app)
        .get('/auth/refresh')
        .set('Cookie', cookies)
        .expect(200);

      expect(response.body).toHaveProperty('message');
      expect(response.headers['set-cookie']).toBeDefined();
    });

    it('Should return UNAUTHORIZED for an invalid refresh token', async () => {
      await request(app)
        .get('/auth/refresh')
        .set('Cookie', ['refreshToken=invalid-token'])
        .expect(401);
    });

    it('Should return UNAUTHORIZED if the session is expired', async () => {
      const user = await UserModel.create({
        email: 'expired@example.com',
        username: 'expireduser',
        password: 'Password123!'
      });

      const expiredSession = await SessionModel.create({
        userId: user._id,
        userAgent: 'test-agent',
        expiresAt: new Date(Date.now() - 1000) // Expired 1 second ago
      });

      const { signToken } = await import('../../../src/utils/jwt');
      const { refreshTokenSignOptions } = await import('../../../src/utils/jwt');
      const refreshToken = signToken({ sessionId: expiredSession._id }, refreshTokenSignOptions);

      await request(app)
        .get('/auth/refresh')
        .set('Cookie', [`refreshToken=${refreshToken}`])
        .expect(401);
    });
  });

  describe('Verify Email', () => {
    it('Should verify email with valid code', async () => {
      const user = await UserModel.create({
        email: 'verify@example.com',
        username: 'verifyuser',
        password: 'Password123!',
        verified: false
      });

      const code = await VerificationCodeModel.create({
        userId: user._id,
        codeType: VerificationCodeType.EMAILVERIFICATION,
        expiresAt: oneYearFromNow()
      });

      await request(app)
        .get(`/auth/email/verify/${code._id}`)
        .expect(200);
    });

    it('Should return NOT_FOUND for an invalid code', async () => {
      const fakeId = new mongoose.Types.ObjectId();

      await request(app)
        .get(`/auth/email/verify/${fakeId}`)
        .expect(404);
    });

    it('Should return NOT_FOUND for a user that is not found', async () => {
      const fakeUserId = new mongoose.Types.ObjectId();
      const code = await VerificationCodeModel.create({
        userId: fakeUserId,
        codeType: VerificationCodeType.EMAILVERIFICATION,
        expiresAt: oneYearFromNow()
      });

      await request(app)
        .get(`/auth/email/verify/${code._id}`)
        .expect(404);
    });
  });

  describe('Forgot Password', () => {
    it('Should send a password reset email for a valid user', async () => {
      await UserModel.create({
        email: 'forgot@example.com',
        username: 'forgotuser',
        password: 'Password123!'
      });

      await request(app)
        .post('/auth/password/forgot')
        .send({ email: 'forgot@example.com' })
        .expect(200);
    });

    it('Should return an empty response for all errors (preventing data leaks)', async () => {
      await request(app)
        .post('/auth/password/forgot')
        .send({ email: 'nonexistent@example.com' })
        .expect(200);
    });
  });

  describe('Reset Password', () => {
    it('Should reset password for a valid user', async () => {
      const user = await UserModel.create({
        email: 'reset@example.com',
        username: 'resetuser',
        password: 'OldPassword123!'
      });

      const code = await VerificationCodeModel.create({
        userId: user._id,
        codeType: VerificationCodeType.PASSWORDRESET,
        expiresAt: oneHourFromNow()
      });

      await request(app)
        .post('/auth/password/reset')
        .send({
          verificationCode: code._id.toString(),
          password: 'NewPassword123!'
        })
        .expect(200);
    });

    it('Should return NOT_FOUND for an invalid reset token', async () => {
      const fakeId = new mongoose.Types.ObjectId();

      await request(app)
        .post('/auth/password/reset')
        .send({
          verificationCode: fakeId.toString(),
          password: 'NewPassword123!'
        })
        .expect(404);
    });

    it('Should return NOT_FOUND for a user that is not found', async () => {
      const fakeUserId = new mongoose.Types.ObjectId();
      const code = await VerificationCodeModel.create({
        userId: fakeUserId,
        codeType: VerificationCodeType.PASSWORDRESET,
        expiresAt: oneHourFromNow()
      });

      await request(app)
        .post('/auth/password/reset')
        .send({
          verificationCode: code._id.toString(),
          password: 'NewPassword123!'
        })
        .expect(404);
    });
  });

});