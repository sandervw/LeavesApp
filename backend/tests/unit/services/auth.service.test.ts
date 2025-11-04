import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  signupUser,
  loginUser,
  logoutUser,
  refreshAccessToken,
  verifyEmail,
  resetPassword
} from '../../../src/services/auth.service';
import UserModel from '../../../src/models/user.model';
import SessionModel from '../../../src/models/session.model';
import VerificationCodeModel from '../../../src/models/verificationCode.model';
import { sendMail } from '../../../src/utils/emailUtils';
import { signToken, verifyToken } from '../../../src/utils/jwt';
import mongoose from 'mongoose';

/* eslint-disable */ // Disabling eslint for this file as it's a test file.

// Mock the models
vi.mock('../../../src/models/user.model');
vi.mock('../../../src/models/session.model');
vi.mock('../../../src/models/verificationCode.model');

// Mock utilities
vi.mock('../../../src/utils/emailUtils');
vi.mock('../../../src/utils/jwt');

// Mock environment constants
vi.mock('../../../src/constants/env', () => ({
  APP_ORIGIN: 'http://localhost:5173',
  ONE_DAY_MS: 86400000,
  JWT_SECRET: 'test-jwt-secret',
  JWT_REFRESH_SECRET: 'test-jwt-refresh-secret',
  RESEND_API_KEY: 'test-resend-api-key'
}));

describe('Auth Service', () => {

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('signupUser', () => {
    it('should create a new user with valid credentials', async () => {
      // Setup
      const userData = {
        email: 'test@example.com',
        username: 'testuser',
        password: 'password123',
        userAgent: 'Mozilla/5.0'
      };
      const userId = 'user123';
      const sessionId = 'session123';
      const codeId = 'code123';

      vi.mocked(UserModel.exists).mockResolvedValue(null);
      vi.mocked(UserModel.create).mockResolvedValue({
        _id: userId,
        email: userData.email,
        username: userData.username,
        omitPassword: vi.fn().mockReturnValue({
          _id: userId,
          email: userData.email,
          username: userData.username
        })
      } as any);
      vi.mocked(VerificationCodeModel.create).mockResolvedValue({
        _id: codeId,
        userId: userId
      } as any);
      vi.mocked(sendMail).mockResolvedValue({ data: { id: 'email123' }, error: null } as any);
      vi.mocked(SessionModel.create).mockResolvedValue({
        _id: sessionId,
        userId: userId
      } as any);
      vi.mocked(signToken).mockReturnValue('mock-token');

      // Act
      const result = await signupUser(userData);

      // Validate
      expect(UserModel.create).toHaveBeenCalledWith({
        email: userData.email,
        username: userData.username,
        password: userData.password
      });
      expect(result.user).toBeDefined();
      expect(result.user.email).toBe(userData.email);
    });

    it('should create a session for the new user', async () => {
      // Setup
      const userData = {
        email: 'test@example.com',
        username: 'testuser',
        password: 'password123',
        userAgent: 'Mozilla/5.0'
      };
      const userId = 'user123';
      const sessionId = 'session123';

      vi.mocked(UserModel.exists).mockResolvedValue(null);
      vi.mocked(UserModel.create).mockResolvedValue({
        _id: userId,
        email: userData.email,
        username: userData.username,
        omitPassword: vi.fn().mockReturnValue({
          _id: userId,
          email: userData.email,
          username: userData.username
        })
      } as any);
      vi.mocked(VerificationCodeModel.create).mockResolvedValue({ _id: 'code123' } as any);
      vi.mocked(sendMail).mockResolvedValue({ data: { id: 'email123' }, error: null } as any);
      vi.mocked(SessionModel.create).mockResolvedValue({
        _id: sessionId,
        userId: userId
      } as any);
      vi.mocked(signToken).mockReturnValue('mock-token');

      // Act
      await signupUser(userData);

      // Validate
      expect(SessionModel.create).toHaveBeenCalledWith({
        userId: userId,
        userAgent: userData.userAgent
      });
    });

    it('should create a verification code for email verification', async () => {
      // Setup
      const userData = {
        email: 'test@example.com',
        username: 'testuser',
        password: 'password123',
        userAgent: 'Mozilla/5.0'
      };
      const userId = 'user123';

      vi.mocked(UserModel.exists).mockResolvedValue(null);
      vi.mocked(UserModel.create).mockResolvedValue({
        _id: userId,
        email: userData.email,
        username: userData.username,
        omitPassword: vi.fn().mockReturnValue({
          _id: userId,
          email: userData.email,
          username: userData.username
        })
      } as any);
      vi.mocked(VerificationCodeModel.create).mockResolvedValue({ _id: 'code123' } as any);
      vi.mocked(sendMail).mockResolvedValue({ data: { id: 'email123' }, error: null } as any);
      vi.mocked(SessionModel.create).mockResolvedValue({ _id: 'session123' } as any);
      vi.mocked(signToken).mockReturnValue('mock-token');

      // Act
      await signupUser(userData);

      // Validate
      expect(VerificationCodeModel.create).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: userId,
          codeType: expect.anything(),
          expiresAt: expect.anything()
        })
      );
    });

    it('should send a verification email', async () => {
      // Setup
      const userData = {
        email: 'test@example.com',
        username: 'testuser',
        password: 'password123',
        userAgent: 'Mozilla/5.0'
      };
      const userId = 'user123';
      const codeId = 'code123';

      vi.mocked(UserModel.exists).mockResolvedValue(null);
      vi.mocked(UserModel.create).mockResolvedValue({
        _id: userId,
        email: userData.email,
        username: userData.username,
        omitPassword: vi.fn().mockReturnValue({
          _id: userId,
          email: userData.email,
          username: userData.username
        })
      } as any);
      vi.mocked(VerificationCodeModel.create).mockResolvedValue({ _id: codeId } as any);
      vi.mocked(sendMail).mockResolvedValue({ data: { id: 'email123' }, error: null } as any);
      vi.mocked(SessionModel.create).mockResolvedValue({ _id: 'session123' } as any);
      vi.mocked(signToken).mockReturnValue('mock-token');

      // Act
      await signupUser(userData);

      // Validate
      expect(sendMail).toHaveBeenCalledWith(
        expect.objectContaining({
          to: userData.email
        })
      );
    });

    it('should return user (without password), accessToken, and refreshToken', async () => {
      // Setup
      const userData = {
        email: 'test@example.com',
        username: 'testuser',
        password: 'password123',
        userAgent: 'Mozilla/5.0'
      };
      const userId = 'user123';
      const sessionId = 'session123';
      const mockAccessToken = 'mock-access-token';
      const mockRefreshToken = 'mock-refresh-token';

      vi.mocked(UserModel.exists).mockResolvedValue(null);
      vi.mocked(UserModel.create).mockResolvedValue({
        _id: userId,
        email: userData.email,
        username: userData.username,
        omitPassword: vi.fn().mockReturnValue({
          _id: userId,
          email: userData.email,
          username: userData.username
        })
      } as any);
      vi.mocked(VerificationCodeModel.create).mockResolvedValue({ _id: 'code123' } as any);
      vi.mocked(sendMail).mockResolvedValue({ data: { id: 'email123' }, error: null } as any);
      vi.mocked(SessionModel.create).mockResolvedValue({ _id: sessionId } as any);
      vi.mocked(signToken)
        .mockReturnValueOnce(mockRefreshToken)
        .mockReturnValueOnce(mockAccessToken);

      // Act
      const result = await signupUser(userData);

      // Validate
      expect(result).toHaveProperty('user');
      expect(result).toHaveProperty('accessToken', mockAccessToken);
      expect(result).toHaveProperty('refreshToken', mockRefreshToken);
      expect(result.user).not.toHaveProperty('password');
      expect(signToken).toHaveBeenCalledWith(
        { sessionId: sessionId },
        expect.anything()
      );
      expect(signToken).toHaveBeenCalledWith(
        { sessionId: sessionId, userId: userId }
      );
    });

    it('should throw CONFLICT error if email already exists', async () => {
      // Setup
      const userData = {
        email: 'existing@example.com',
        username: 'newuser',
        password: 'password123'
      };

      vi.mocked(UserModel.exists).mockResolvedValue({ _id: 'existing-user' } as any);

      // Act & Validate
      await expect(signupUser(userData)).rejects.toThrow('Email/Username already in use');
    });

    it('should throw CONFLICT error if username already exists', async () => {
      // Setup
      const userData = {
        email: 'new@example.com',
        username: 'existinguser',
        password: 'password123'
      };

      vi.mocked(UserModel.exists).mockResolvedValue({ _id: 'existing-user' } as any);

      // Act & Validate
      await expect(signupUser(userData)).rejects.toThrow('Email/Username already in use');
    });

    it('should include userAgent in session when provided', async () => {
      // Setup
      const userData = {
        email: 'test@example.com',
        username: 'testuser',
        password: 'password123',
        userAgent: 'Custom User Agent'
      };
      const userId = 'user123';

      vi.mocked(UserModel.exists).mockResolvedValue(null);
      vi.mocked(UserModel.create).mockResolvedValue({
        _id: userId,
        email: userData.email,
        username: userData.username,
        omitPassword: vi.fn().mockReturnValue({
          _id: userId,
          email: userData.email,
          username: userData.username
        })
      } as any);
      vi.mocked(VerificationCodeModel.create).mockResolvedValue({ _id: 'code123' } as any);
      vi.mocked(sendMail).mockResolvedValue({ data: { id: 'email123' }, error: null } as any);
      vi.mocked(SessionModel.create).mockResolvedValue({ _id: 'session123' } as any);
      vi.mocked(signToken).mockReturnValue('mock-token');

      // Act
      await signupUser(userData);

      // Validate
      expect(SessionModel.create).toHaveBeenCalledWith({
        userId: userId,
        userAgent: 'Custom User Agent'
      });
    });

    it('should handle missing userAgent gracefully', async () => {
      // Setup
      const userData = {
        email: 'test@example.com',
        username: 'testuser',
        password: 'password123'
      };
      const userId = 'user123';

      vi.mocked(UserModel.exists).mockResolvedValue(null);
      vi.mocked(UserModel.create).mockResolvedValue({
        _id: userId,
        email: userData.email,
        username: userData.username,
        omitPassword: vi.fn().mockReturnValue({
          _id: userId,
          email: userData.email,
          username: userData.username
        })
      } as any);
      vi.mocked(VerificationCodeModel.create).mockResolvedValue({ _id: 'code123' } as any);
      vi.mocked(sendMail).mockResolvedValue({ data: { id: 'email123' }, error: null } as any);
      vi.mocked(SessionModel.create).mockResolvedValue({ _id: 'session123' } as any);
      vi.mocked(signToken).mockReturnValue('mock-token');

      // Act
      await signupUser(userData);

      // Validate
      expect(SessionModel.create).toHaveBeenCalledWith({
        userId: userId,
        userAgent: undefined
      });
    });
  });

  describe('loginUser', () => {
    it('should login user with valid email and password', async () => {
      // Setup
      const loginData = {
        email: 'test@example.com',
        password: 'password123',
        userAgent: 'Mozilla/5.0'
      };
      const userId = 'user123';
      const sessionId = 'session123';

      const mockUser = {
        _id: userId,
        email: loginData.email,
        username: 'testuser',
        comparePassword: vi.fn().mockResolvedValue(true),
        omitPassword: vi.fn().mockReturnValue({
          _id: userId,
          email: loginData.email,
          username: 'testuser'
        })
      };

      vi.mocked(UserModel.findOne).mockResolvedValue(mockUser as any);
      vi.mocked(SessionModel.create).mockResolvedValue({
        _id: sessionId,
        userId: userId
      } as any);
      vi.mocked(signToken).mockReturnValue('mock-token');

      // Act
      const result = await loginUser(loginData);

      // Validate
      expect(UserModel.findOne).toHaveBeenCalledWith({ email: loginData.email });
      expect(mockUser.comparePassword).toHaveBeenCalledWith(loginData.password);
      expect(result.user).toBeDefined();
      expect(result.user.email).toBe(loginData.email);
    });

    it('should create a new session on login', async () => {
      // Setup
      const loginData = {
        email: 'test@example.com',
        password: 'password123',
        userAgent: 'Mozilla/5.0'
      };
      const userId = 'user123';
      const sessionId = 'session123';

      const mockUser = {
        _id: userId,
        email: loginData.email,
        username: 'testuser',
        comparePassword: vi.fn().mockResolvedValue(true),
        omitPassword: vi.fn().mockReturnValue({
          _id: userId,
          email: loginData.email,
          username: 'testuser'
        })
      };

      vi.mocked(UserModel.findOne).mockResolvedValue(mockUser as any);
      vi.mocked(SessionModel.create).mockResolvedValue({
        _id: sessionId,
        userId: userId
      } as any);
      vi.mocked(signToken).mockReturnValue('mock-token');

      // Act
      await loginUser(loginData);

      // Validate
      expect(SessionModel.create).toHaveBeenCalledWith({
        userId: userId,
        userAgent: loginData.userAgent
      });
    });

    it('should return user (without password), accessToken, and refreshToken', async () => {
      // Setup
      const loginData = {
        email: 'test@example.com',
        password: 'password123',
        userAgent: 'Mozilla/5.0'
      };
      const userId = 'user123';
      const sessionId = 'session123';
      const mockAccessToken = 'mock-access-token';
      const mockRefreshToken = 'mock-refresh-token';

      const mockUser = {
        _id: userId,
        email: loginData.email,
        username: 'testuser',
        comparePassword: vi.fn().mockResolvedValue(true),
        omitPassword: vi.fn().mockReturnValue({
          _id: userId,
          email: loginData.email,
          username: 'testuser'
        })
      };

      vi.mocked(UserModel.findOne).mockResolvedValue(mockUser as any);
      vi.mocked(SessionModel.create).mockResolvedValue({ _id: sessionId } as any);
      vi.mocked(signToken)
        .mockReturnValueOnce(mockRefreshToken)
        .mockReturnValueOnce(mockAccessToken);

      // Act
      const result = await loginUser(loginData);

      // Validate
      expect(result).toHaveProperty('user');
      expect(result).toHaveProperty('accessToken', mockAccessToken);
      expect(result).toHaveProperty('refreshToken', mockRefreshToken);
      expect(result.user).not.toHaveProperty('password');
      expect(signToken).toHaveBeenCalledWith(
        { sessionId: sessionId },
        expect.anything()
      );
      expect(signToken).toHaveBeenCalledWith(
        { sessionId: sessionId, userId: userId }
      );
    });

    it('should throw UNAUTHORIZED error if user not found', async () => {
      // Setup
      const loginData = {
        email: 'nonexistent@example.com',
        password: 'password123',
        userAgent: 'Mozilla/5.0'
      };

      vi.mocked(UserModel.findOne).mockResolvedValue(null);

      // Act & Validate
      await expect(loginUser(loginData)).rejects.toThrow('No user found with that email/password');
    });

    it('should throw UNAUTHORIZED error if password is invalid', async () => {
      // Setup
      const loginData = {
        email: 'test@example.com',
        password: 'wrongpassword',
        userAgent: 'Mozilla/5.0'
      };
      const userId = 'user123';

      const mockUser = {
        _id: userId,
        email: loginData.email,
        username: 'testuser',
        comparePassword: vi.fn().mockResolvedValue(false),
        omitPassword: vi.fn().mockReturnValue({
          _id: userId,
          email: loginData.email,
          username: 'testuser'
        })
      };

      vi.mocked(UserModel.findOne).mockResolvedValue(mockUser as any);

      // Act & Validate
      await expect(loginUser(loginData)).rejects.toThrow('Invalid password');
    });

    it('should include userAgent in session when provided', async () => {
      // Setup
      const loginData = {
        email: 'test@example.com',
        password: 'password123',
        userAgent: 'Custom User Agent'
      };
      const userId = 'user123';

      const mockUser = {
        _id: userId,
        email: loginData.email,
        username: 'testuser',
        comparePassword: vi.fn().mockResolvedValue(true),
        omitPassword: vi.fn().mockReturnValue({
          _id: userId,
          email: loginData.email,
          username: 'testuser'
        })
      };

      vi.mocked(UserModel.findOne).mockResolvedValue(mockUser as any);
      vi.mocked(SessionModel.create).mockResolvedValue({ _id: 'session123' } as any);
      vi.mocked(signToken).mockReturnValue('mock-token');

      // Act
      await loginUser(loginData);

      // Validate
      expect(SessionModel.create).toHaveBeenCalledWith({
        userId: userId,
        userAgent: 'Custom User Agent'
      });
    });

    it('should handle missing userAgent gracefully', async () => {
      // Setup
      const loginData = {
        email: 'test@example.com',
        password: 'password123'
      };
      const userId = 'user123';

      const mockUser = {
        _id: userId,
        email: loginData.email,
        username: 'testuser',
        comparePassword: vi.fn().mockResolvedValue(true),
        omitPassword: vi.fn().mockReturnValue({
          _id: userId,
          email: loginData.email,
          username: 'testuser'
        })
      };

      vi.mocked(UserModel.findOne).mockResolvedValue(mockUser as any);
      vi.mocked(SessionModel.create).mockResolvedValue({ _id: 'session123' } as any);
      vi.mocked(signToken).mockReturnValue('mock-token');

      // Act
      await loginUser(loginData);

      // Validate
      expect(SessionModel.create).toHaveBeenCalledWith({
        userId: userId,
        userAgent: undefined
      });
    });
  });

  describe('logoutUser', () => {
    it('should delete the session when given valid access token', async () => {
      // Setup
      const accessToken = 'valid-access-token';
      const sessionId = 'session123';
      const payload = { sessionId: sessionId, userId: 'user123' };

      vi.mocked(verifyToken).mockReturnValue({ payload, error: null } as any);
      vi.mocked(SessionModel.findByIdAndDelete).mockResolvedValue({} as any);

      // Act
      await logoutUser(accessToken);

      // Validate
      expect(verifyToken).toHaveBeenCalledWith(accessToken);
      expect(SessionModel.findByIdAndDelete).toHaveBeenCalledWith(sessionId);
    });

    it('should handle invalid access token gracefully', async () => {
      // Setup
      const invalidToken = 'invalid-access-token';

      vi.mocked(verifyToken).mockReturnValue({ payload: null, error: { message: 'Invalid token' } } as any);

      // Act
      await logoutUser(invalidToken);

      // Validate
      expect(verifyToken).toHaveBeenCalledWith(invalidToken);
      expect(SessionModel.findByIdAndDelete).not.toHaveBeenCalled();
    });

    it('should handle expired access token gracefully', async () => {
      // Setup
      const expiredToken = 'expired-access-token';

      vi.mocked(verifyToken).mockReturnValue({ payload: null, error: { message: 'Token expired' } } as any);

      // Act
      await logoutUser(expiredToken);

      // Validate
      expect(verifyToken).toHaveBeenCalledWith(expiredToken);
      expect(SessionModel.findByIdAndDelete).not.toHaveBeenCalled();
    });

    it('should not throw error if session already deleted', async () => {
      // Setup
      const accessToken = 'valid-access-token';
      const sessionId = 'session123';
      const payload = { sessionId: sessionId, userId: 'user123' };

      vi.mocked(verifyToken).mockReturnValue({ payload, error: null } as any);
      vi.mocked(SessionModel.findByIdAndDelete).mockResolvedValue(null);

      // Act & Validate
      await expect(logoutUser(accessToken)).resolves.not.toThrow();
      expect(SessionModel.findByIdAndDelete).toHaveBeenCalledWith(sessionId);
    });
  });

  describe('refreshAccessToken', () => {
    it('should return new access token with valid refresh token', async () => {
      // Setup
      const refreshToken = 'valid-refresh-token';
      const sessionId = 'session123';
      const userId = 'user123';
      const payload = { sessionId: sessionId };
      const mockAccessToken = 'new-access-token';
      const futureDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days from now

      const mockSession = {
        _id: sessionId,
        userId: userId,
        expiresAt: futureDate,
        save: vi.fn().mockResolvedValue(true)
      };

      vi.mocked(verifyToken).mockReturnValue({ payload, error: null } as any);
      vi.mocked(SessionModel.findById).mockResolvedValue(mockSession as any);
      vi.mocked(signToken).mockReturnValue(mockAccessToken);

      // Act
      const result = await refreshAccessToken(refreshToken);

      // Validate
      expect(verifyToken).toHaveBeenCalledWith(refreshToken, expect.objectContaining({ secret: expect.anything() }));
      expect(SessionModel.findById).toHaveBeenCalledWith(sessionId);
      expect(result).toHaveProperty('accessToken', mockAccessToken);
      expect(signToken).toHaveBeenCalledWith({
        sessionId: sessionId,
        userId: userId
      });
    });

    it('should return new refresh token if session expires within 24 hours', async () => {
      // Setup
      const refreshToken = 'valid-refresh-token';
      const sessionId = 'session123';
      const userId = 'user123';
      const payload = { sessionId: sessionId };
      const mockAccessToken = 'new-access-token';
      const mockRefreshToken = 'new-refresh-token';
      const nearExpiryDate = new Date(Date.now() + 12 * 60 * 60 * 1000); // 12 hours from now

      const mockSession = {
        _id: sessionId,
        userId: userId,
        expiresAt: nearExpiryDate,
        save: vi.fn().mockResolvedValue(true)
      };

      vi.mocked(verifyToken).mockReturnValue({ payload, error: null } as any);
      vi.mocked(SessionModel.findById).mockResolvedValue(mockSession as any);
      vi.mocked(signToken)
        .mockReturnValueOnce(mockRefreshToken)
        .mockReturnValueOnce(mockAccessToken);

      // Act
      const result = await refreshAccessToken(refreshToken);

      // Validate
      expect(result).toHaveProperty('accessToken', mockAccessToken);
      expect(result).toHaveProperty('newRefreshToken', mockRefreshToken);
      expect(signToken).toHaveBeenCalledWith(
        { sessionId: sessionId },
        expect.anything()
      );
    });

    it('should not return new refresh token if session has more than 24 hours remaining', async () => {
      // Setup
      const refreshToken = 'valid-refresh-token';
      const sessionId = 'session123';
      const userId = 'user123';
      const payload = { sessionId: sessionId };
      const mockAccessToken = 'new-access-token';
      const futureDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days from now

      const mockSession = {
        _id: sessionId,
        userId: userId,
        expiresAt: futureDate,
        save: vi.fn().mockResolvedValue(true)
      };

      vi.mocked(verifyToken).mockReturnValue({ payload, error: null } as any);
      vi.mocked(SessionModel.findById).mockResolvedValue(mockSession as any);
      vi.mocked(signToken).mockReturnValue(mockAccessToken);

      // Act
      const result = await refreshAccessToken(refreshToken);

      // Validate
      expect(result).toHaveProperty('accessToken', mockAccessToken);
      expect(result).toHaveProperty('newRefreshToken', undefined);
      expect(mockSession.save).not.toHaveBeenCalled();
    });

    it('should extend session expiration when refreshing within 24 hours', async () => {
      // Setup
      const refreshToken = 'valid-refresh-token';
      const sessionId = 'session123';
      const userId = 'user123';
      const payload = { sessionId: sessionId };
      const nearExpiryDate = new Date(Date.now() + 12 * 60 * 60 * 1000); // 12 hours from now

      const mockSession = {
        _id: sessionId,
        userId: userId,
        expiresAt: nearExpiryDate,
        save: vi.fn().mockResolvedValue(true)
      };

      vi.mocked(verifyToken).mockReturnValue({ payload, error: null } as any);
      vi.mocked(SessionModel.findById).mockResolvedValue(mockSession as any);
      vi.mocked(signToken).mockReturnValue('mock-token');

      // Act
      await refreshAccessToken(refreshToken);

      // Validate
      expect(mockSession.save).toHaveBeenCalled();
      expect(mockSession.expiresAt.getTime()).toBeGreaterThan(nearExpiryDate.getTime());
    });

    it('should throw UNAUTHORIZED error if refresh token is invalid', async () => {
      // Setup
      const invalidToken = 'invalid-refresh-token';

      vi.mocked(verifyToken).mockReturnValue({ payload: null, error: { message: 'Invalid token' } } as any);

      // Act & Validate
      await expect(refreshAccessToken(invalidToken)).rejects.toThrow('Invalid token');
    });

    it('should throw UNAUTHORIZED error if refresh token is expired', async () => {
      // Setup
      const expiredToken = 'expired-refresh-token';

      vi.mocked(verifyToken).mockReturnValue({ payload: null, error: { message: 'Token expired' } } as any);

      // Act & Validate
      await expect(refreshAccessToken(expiredToken)).rejects.toThrow('Invalid token');
    });

    it('should throw UNAUTHORIZED error if session not found', async () => {
      // Setup
      const refreshToken = 'valid-refresh-token';
      const sessionId = 'session123';
      const payload = { sessionId: sessionId };

      vi.mocked(verifyToken).mockReturnValue({ payload, error: null } as any);
      vi.mocked(SessionModel.findById).mockResolvedValue(null);

      // Act & Validate
      await expect(refreshAccessToken(refreshToken)).rejects.toThrow('Session Expired');
    });

    it('should throw UNAUTHORIZED error if session is expired', async () => {
      // Setup
      const refreshToken = 'valid-refresh-token';
      const sessionId = 'session123';
      const userId = 'user123';
      const payload = { sessionId: sessionId };
      const pastDate = new Date(Date.now() - 1000); // 1 second ago

      const mockSession = {
        _id: sessionId,
        userId: userId,
        expiresAt: pastDate,
        save: vi.fn().mockResolvedValue(true)
      };

      vi.mocked(verifyToken).mockReturnValue({ payload, error: null } as any);
      vi.mocked(SessionModel.findById).mockResolvedValue(mockSession as any);

      // Act & Validate
      await expect(refreshAccessToken(refreshToken)).rejects.toThrow('Session Expired');
    });
  });

  describe('verifyEmail', () => {
    it('should verify email with valid verification code', async () => {
      // Setup
      const verificationCodeId = new mongoose.Types.ObjectId();
      const userId = 'user123';
      const futureDate = new Date(Date.now() + 1000 * 60 * 60); // 1 hour from now

      const mockCode = {
        _id: verificationCodeId,
        userId: userId,
        codeType: 'EMAIL_VERIFICATION',
        expiresAt: futureDate,
        deleteOne: vi.fn().mockResolvedValue(true)
      };

      const mockUser = {
        _id: userId,
        email: 'test@example.com',
        username: 'testuser',
        verified: false,
        save: vi.fn().mockResolvedValue(true),
        omitPassword: vi.fn().mockReturnValue({
          _id: userId,
          email: 'test@example.com',
          username: 'testuser',
          verified: true
        })
      };

      vi.mocked(VerificationCodeModel.findOne).mockResolvedValue(mockCode as any);
      vi.mocked(UserModel.findById).mockResolvedValue(mockUser as any);

      // Act
      const result = await verifyEmail(verificationCodeId);

      // Validate
      expect(VerificationCodeModel.findOne).toHaveBeenCalledWith({
        _id: verificationCodeId,
        codeType: expect.anything(),
        expiresAt: { $gt: expect.any(Date) }
      });
      expect(result.user).toBeDefined();
    });

    it('should mark user as verified in database', async () => {
      // Setup
      const verificationCodeId = new mongoose.Types.ObjectId();
      const userId = new mongoose.Types.ObjectId();
      const futureDate = new Date(Date.now() + 1000 * 60 * 60);

      const mockCode = {
        _id: verificationCodeId,
        userId: userId,
        codeType: 'EMAIL_VERIFICATION',
        expiresAt: futureDate,
        deleteOne: vi.fn().mockResolvedValue(true)
      };

      const mockUser = {
        _id: userId,
        email: 'test@example.com',
        username: 'testuser',
        verified: false,
        save: vi.fn().mockResolvedValue(true),
        omitPassword: vi.fn().mockReturnValue({
          _id: userId,
          email: 'test@example.com',
          username: 'testuser',
          verified: true
        })
      };

      vi.mocked(VerificationCodeModel.findOne).mockResolvedValue(mockCode as any);
      vi.mocked(UserModel.findById).mockResolvedValue(mockUser as any);

      // Act
      await verifyEmail(verificationCodeId);

      // Validate
      expect(mockUser.verified).toBe(true);
      expect(mockUser.save).toHaveBeenCalled();
    });

    it('should delete verification code after successful verification', async () => {
      // Setup
      const verificationCodeId = new mongoose.Types.ObjectId();
      const userId = new mongoose.Types.ObjectId();
      const futureDate = new Date(Date.now() + 1000 * 60 * 60);

      const mockCode = {
        _id: verificationCodeId,
        userId: userId,
        codeType: 'EMAIL_VERIFICATION',
        expiresAt: futureDate,
        deleteOne: vi.fn().mockResolvedValue(true)
      };

      const mockUser = {
        _id: userId,
        email: 'test@example.com',
        username: 'testuser',
        verified: false,
        save: vi.fn().mockResolvedValue(true),
        omitPassword: vi.fn().mockReturnValue({
          _id: userId,
          email: 'test@example.com',
          username: 'testuser',
          verified: true
        })
      };

      vi.mocked(VerificationCodeModel.findOne).mockResolvedValue(mockCode as any);
      vi.mocked(UserModel.findById).mockResolvedValue(mockUser as any);

      // Act
      await verifyEmail(verificationCodeId);

      // Validate
      expect(mockCode.deleteOne).toHaveBeenCalled();
    });

    it('should return user (without password)', async () => {
      // Setup
      const verificationCodeId = new mongoose.Types.ObjectId();
      const userId = new mongoose.Types.ObjectId();
      const futureDate = new Date(Date.now() + 1000 * 60 * 60);

      const mockCode = {
        _id: verificationCodeId,
        userId: userId,
        codeType: 'EMAIL_VERIFICATION',
        expiresAt: futureDate,
        deleteOne: vi.fn().mockResolvedValue(true)
      };

      const mockUser = {
        _id: userId,
        email: 'test@example.com',
        username: 'testuser',
        verified: false,
        save: vi.fn().mockResolvedValue(true),
        omitPassword: vi.fn().mockReturnValue({
          _id: userId,
          email: 'test@example.com',
          username: 'testuser',
          verified: true
        })
      };

      vi.mocked(VerificationCodeModel.findOne).mockResolvedValue(mockCode as any);
      vi.mocked(UserModel.findById).mockResolvedValue(mockUser as any);

      // Act
      const result = await verifyEmail(verificationCodeId);

      // Validate
      expect(result.user).not.toHaveProperty('password');
      expect(mockUser.omitPassword).toHaveBeenCalled();
    });

    it('should throw NOT_FOUND error if verification code not found', async () => {
      // Setup
      const verificationCodeId = new mongoose.Types.ObjectId();

      vi.mocked(VerificationCodeModel.findOne).mockResolvedValue(null);

      // Act & Validate
      await expect(verifyEmail(verificationCodeId)).rejects.toThrow('Invalid or expired code');
    });

    it('should throw NOT_FOUND error if verification code is expired', async () => {
      // Setup
      const verificationCodeId = new mongoose.Types.ObjectId();
      const pastDate = new Date(Date.now() - 1000); // 1 second ago

      vi.mocked(VerificationCodeModel.findOne).mockResolvedValue(null);

      // Act & Validate
      await expect(verifyEmail(verificationCodeId)).rejects.toThrow('Invalid or expired code');
    });

    it('should throw NOT_FOUND error if code type is not EMAIL_VERIFICATION', async () => {
      // Setup
      const verificationCodeId = new mongoose.Types.ObjectId();

      vi.mocked(VerificationCodeModel.findOne).mockResolvedValue(null);

      // Act & Validate
      await expect(verifyEmail(verificationCodeId)).rejects.toThrow('Invalid or expired code');
    });

    it('should throw UNAUTHORIZED error if user not found', async () => {
      // Setup
      const verificationCodeId = new mongoose.Types.ObjectId();
      const userId = new mongoose.Types.ObjectId();
      const futureDate = new Date(Date.now() + 1000 * 60 * 60);

      const mockCode = {
        _id: verificationCodeId,
        userId: userId,
        codeType: 'EMAIL_VERIFICATION',
        expiresAt: futureDate,
        deleteOne: vi.fn().mockResolvedValue(true)
      };

      vi.mocked(VerificationCodeModel.findOne).mockResolvedValue(mockCode as any);
      vi.mocked(UserModel.findById).mockResolvedValue(null);

      // Act & Validate
      await expect(verifyEmail(verificationCodeId)).rejects.toThrow('User not found');
    });
  });

  describe('resetPassword', () => {
    it('should reset password with valid verification code', async () => {
      // Setup
      const verificationCodeId = new mongoose.Types.ObjectId();
      const userId = new mongoose.Types.ObjectId();
      const newPassword = 'newPassword123';
      const futureDate = new Date(Date.now() + 1000 * 60 * 60); // 1 hour from now

      const mockCode = {
        _id: verificationCodeId,
        userId: userId,
        codeType: 'PASSWORD_RESET',
        expiresAt: futureDate,
        deleteOne: vi.fn().mockResolvedValue(true)
      };

      const mockUser = {
        _id: userId,
        email: 'test@example.com',
        username: 'testuser',
        password: 'oldPassword',
        save: vi.fn().mockResolvedValue(true),
        omitPassword: vi.fn().mockReturnValue({
          _id: userId,
          email: 'test@example.com',
          username: 'testuser'
        })
      };

      vi.mocked(VerificationCodeModel.findOne).mockResolvedValue(mockCode as any);
      vi.mocked(UserModel.findById).mockResolvedValue(mockUser as any);
      vi.mocked(SessionModel.deleteMany).mockResolvedValue({} as any);

      // Act
      const result = await resetPassword({ verificationCode: verificationCodeId, password: newPassword });

      // Validate
      expect(VerificationCodeModel.findOne).toHaveBeenCalledWith({
        _id: verificationCodeId,
        codeType: expect.anything(),
        expiresAt: { $gt: expect.any(Date) }
      });
      expect(result.user).toBeDefined();
    });

    it('should update user password in database', async () => {
      // Setup
      const verificationCodeId = new mongoose.Types.ObjectId();
      const userId = new mongoose.Types.ObjectId();
      const newPassword = 'newPassword123';
      const futureDate = new Date(Date.now() + 1000 * 60 * 60);

      const mockCode = {
        _id: verificationCodeId,
        userId: userId,
        codeType: 'PASSWORD_RESET',
        expiresAt: futureDate,
        deleteOne: vi.fn().mockResolvedValue(true)
      };

      const mockUser = {
        _id: userId,
        email: 'test@example.com',
        username: 'testuser',
        password: 'oldPassword',
        save: vi.fn().mockResolvedValue(true),
        omitPassword: vi.fn().mockReturnValue({
          _id: userId,
          email: 'test@example.com',
          username: 'testuser'
        })
      };

      vi.mocked(VerificationCodeModel.findOne).mockResolvedValue(mockCode as any);
      vi.mocked(UserModel.findById).mockResolvedValue(mockUser as any);
      vi.mocked(SessionModel.deleteMany).mockResolvedValue({} as any);

      // Act
      await resetPassword({ verificationCode: verificationCodeId, password: newPassword });

      // Validate
      expect(mockUser.password).toBe(newPassword);
      expect(mockUser.save).toHaveBeenCalled();
    });

    it('should delete verification code after password reset', async () => {
      // Setup
      const verificationCodeId = new mongoose.Types.ObjectId();
      const userId = new mongoose.Types.ObjectId();
      const newPassword = 'newPassword123';
      const futureDate = new Date(Date.now() + 1000 * 60 * 60);

      const mockCode = {
        _id: verificationCodeId,
        userId: userId,
        codeType: 'PASSWORD_RESET',
        expiresAt: futureDate,
        deleteOne: vi.fn().mockResolvedValue(true)
      };

      const mockUser = {
        _id: userId,
        email: 'test@example.com',
        username: 'testuser',
        password: 'oldPassword',
        save: vi.fn().mockResolvedValue(true),
        omitPassword: vi.fn().mockReturnValue({
          _id: userId,
          email: 'test@example.com',
          username: 'testuser'
        })
      };

      vi.mocked(VerificationCodeModel.findOne).mockResolvedValue(mockCode as any);
      vi.mocked(UserModel.findById).mockResolvedValue(mockUser as any);
      vi.mocked(SessionModel.deleteMany).mockResolvedValue({} as any);

      // Act
      await resetPassword({ verificationCode: verificationCodeId, password: newPassword });

      // Validate
      expect(mockCode.deleteOne).toHaveBeenCalled();
    });

    it('should delete all user sessions after password reset', async () => {
      // Setup
      const verificationCodeId = new mongoose.Types.ObjectId();
      const userId = new mongoose.Types.ObjectId();
      const newPassword = 'newPassword123';
      const futureDate = new Date(Date.now() + 1000 * 60 * 60);

      const mockCode = {
        _id: verificationCodeId,
        userId: userId,
        codeType: 'PASSWORD_RESET',
        expiresAt: futureDate,
        deleteOne: vi.fn().mockResolvedValue(true)
      };

      const mockUser = {
        _id: userId,
        email: 'test@example.com',
        username: 'testuser',
        password: 'oldPassword',
        save: vi.fn().mockResolvedValue(true),
        omitPassword: vi.fn().mockReturnValue({
          _id: userId,
          email: 'test@example.com',
          username: 'testuser'
        })
      };

      vi.mocked(VerificationCodeModel.findOne).mockResolvedValue(mockCode as any);
      vi.mocked(UserModel.findById).mockResolvedValue(mockUser as any);
      vi.mocked(SessionModel.deleteMany).mockResolvedValue({} as any);

      // Act
      await resetPassword({ verificationCode: verificationCodeId, password: newPassword });

      // Validate
      expect(SessionModel.deleteMany).toHaveBeenCalledWith({ userId: userId });
    });

    it('should return user (without password)', async () => {
      // Setup
      const verificationCodeId = new mongoose.Types.ObjectId();
      const userId = new mongoose.Types.ObjectId();
      const newPassword = 'newPassword123';
      const futureDate = new Date(Date.now() + 1000 * 60 * 60);

      const mockCode = {
        _id: verificationCodeId,
        userId: userId,
        codeType: 'PASSWORD_RESET',
        expiresAt: futureDate,
        deleteOne: vi.fn().mockResolvedValue(true)
      };

      const mockUser = {
        _id: userId,
        email: 'test@example.com',
        username: 'testuser',
        password: 'oldPassword',
        save: vi.fn().mockResolvedValue(true),
        omitPassword: vi.fn().mockReturnValue({
          _id: userId,
          email: 'test@example.com',
          username: 'testuser'
        })
      };

      vi.mocked(VerificationCodeModel.findOne).mockResolvedValue(mockCode as any);
      vi.mocked(UserModel.findById).mockResolvedValue(mockUser as any);
      vi.mocked(SessionModel.deleteMany).mockResolvedValue({} as any);

      // Act
      const result = await resetPassword({ verificationCode: verificationCodeId, password: newPassword });

      // Validate
      expect(result.user).not.toHaveProperty('password');
      expect(mockUser.omitPassword).toHaveBeenCalled();
    });

    it('should throw NOT_FOUND error if verification code not found', async () => {
      // Setup
      const verificationCodeId = new mongoose.Types.ObjectId();
      const newPassword = 'newPassword123';

      vi.mocked(VerificationCodeModel.findOne).mockResolvedValue(null);

      // Act & Validate
      await expect(resetPassword({ verificationCode: verificationCodeId, password: newPassword }))
        .rejects.toThrow('Invalid or expired code');
    });

    it('should throw NOT_FOUND error if verification code is expired', async () => {
      // Setup
      const verificationCodeId = new mongoose.Types.ObjectId();
      const newPassword = 'newPassword123';

      vi.mocked(VerificationCodeModel.findOne).mockResolvedValue(null);

      // Act & Validate
      await expect(resetPassword({ verificationCode: verificationCodeId, password: newPassword }))
        .rejects.toThrow('Invalid or expired code');
    });

    it('should throw NOT_FOUND error if code type is not PASSWORD_RESET', async () => {
      // Setup
      const verificationCodeId = new mongoose.Types.ObjectId();
      const newPassword = 'newPassword123';

      vi.mocked(VerificationCodeModel.findOne).mockResolvedValue(null);

      // Act & Validate
      await expect(resetPassword({ verificationCode: verificationCodeId, password: newPassword }))
        .rejects.toThrow('Invalid or expired code');
    });

    it('should throw NOT_FOUND error if user not found', async () => {
      // Setup
      const verificationCodeId = new mongoose.Types.ObjectId();
      const userId = new mongoose.Types.ObjectId();
      const newPassword = 'newPassword123';
      const futureDate = new Date(Date.now() + 1000 * 60 * 60);

      const mockCode = {
        _id: verificationCodeId,
        userId: userId,
        codeType: 'PASSWORD_RESET',
        expiresAt: futureDate,
        deleteOne: vi.fn().mockResolvedValue(true)
      };

      vi.mocked(VerificationCodeModel.findOne).mockResolvedValue(mockCode as any);
      vi.mocked(UserModel.findById).mockResolvedValue(null);

      // Act & Validate
      await expect(resetPassword({ verificationCode: verificationCodeId, password: newPassword }))
        .rejects.toThrow('User not found');
    });
  });

});
