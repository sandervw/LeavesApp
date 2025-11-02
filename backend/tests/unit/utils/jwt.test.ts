import { describe, it, expect } from 'vitest';
import { AccessTokenPayload, RefreshTokenPayload, signToken, verifyToken } from '../../../src/utils/jwt';
import { decode } from 'jsonwebtoken';
import { JWT_REFRESH_SECRET, JWT_SECRET } from '../../../src/constants/env';
import mongoose from 'mongoose';

/* eslint-disable */ // Disabling eslint for this file as it's a test file.

describe('JWT utils', () => {

  describe('signToken', () => {
    it('Should return a signed JWT given valid access token payload and secret', () => {
      // Setup
      const payload: AccessTokenPayload = {
        sessionId: new mongoose.Types.ObjectId(),
        userId: new mongoose.Types.ObjectId()
      };
      const secret = JWT_SECRET;
      // Act
      const token = signToken(payload, { secret });
      // { complete: true } to get header (alg and type) and payload
      const decoded = decode(token, { complete: true });
      // Validate
      expect(decoded).toBeDefined();
      expect(decoded!.payload).toMatchObject({
        sessionId: payload.sessionId.toString(),
        userId: payload.userId.toString(),
        aud: ['user'] // Verify default audience is applied
      });
      expect(decoded!.header.alg).toBe('HS256'); // Default JWT algorithm
    });

    it('Should sign the access token with 15 minutes expiry', () => {
      // Setup
      const payload: AccessTokenPayload = {
        sessionId: new mongoose.Types.ObjectId(),
        userId: new mongoose.Types.ObjectId()
      };
      const secret = JWT_SECRET;
      const expiresIn = 15 * 60; // 15 minutes in seconds
      // Act
      const token = signToken(payload, { secret, expiresIn });
      const decoded = decode(token, { complete: true });
      // Validate
      expect(decoded).toBeDefined();
      const exp = (decoded!.payload as any).exp; // When the token expires
      const iat = (decoded!.payload as any).iat; // When the token was issued
      expect(exp - iat).toBe(15 * 60); // Exactly 15 minutes in seconds
    });

    it('Should return a signed JWT given valid refresh token payload and secret', () => {
      // Setup
      const payload: RefreshTokenPayload = {
        sessionId: new mongoose.Types.ObjectId()
      };
      const secret = JWT_REFRESH_SECRET;
      // Act
      const token = signToken(payload, { secret });
      const decoded = decode(token, { complete: true });
      // Validate
      expect(decoded).toBeDefined();
      expect(decoded!.payload).toMatchObject({
        sessionId: payload.sessionId.toString(),
        aud: ['user']
      });
      expect(decoded!.header.alg).toBe('HS256');
    });

    it('Should sign the refresh token with 30 days expiry', () => {
      // Setup
      const payload: RefreshTokenPayload = {
        sessionId: new mongoose.Types.ObjectId()
      };
      const secret = JWT_REFRESH_SECRET;
      const expiresIn = 30 * 24 * 60 * 60; // 30 days in seconds
      // Act
      const token = signToken(payload, { secret, expiresIn });
      const decoded = decode(token, { complete: true });
      // Validate
      expect(decoded).toBeDefined();
      const exp = (decoded!.payload as any).exp; // When the token expires
      const iat = (decoded!.payload as any).iat; // When the token was issued
      expect(exp - iat).toBe(30 * 24 * 60 * 60); // Exactly 30 days in seconds
    });

    it('Should default to access token options when no options are provided', () => {
      // Setup
      const payload: AccessTokenPayload = {
        sessionId: new mongoose.Types.ObjectId(),
        userId: new mongoose.Types.ObjectId()
      };
      // Act
      const token = signToken(payload);
      const decoded = decode(token, { complete: true });
      // Validate
      expect(decoded).toBeDefined();
      const exp = (decoded!.payload as any).exp;
      const iat = (decoded!.payload as any).iat;
      expect(exp - iat).toBe(15 * 60); // 15 minutes - access token default
    });

    it('Should match a custom expiration date if provided', () => {
      // Setup
      const payload: AccessTokenPayload = {
        sessionId: new mongoose.Types.ObjectId(),
        userId: new mongoose.Types.ObjectId()
      };
      const secret = JWT_SECRET;
      const options = { expiresIn: 1 * 60 * 60 }; // 1 hour in seconds
      // Act
      const token = signToken(payload, { secret, ...options });
      const decoded = decode(token, { complete: true });
      // Validate
      expect(decoded).toBeDefined();
      const exp = (decoded!.payload as any).exp; // When the token expires
      const iat = (decoded!.payload as any).iat; // When the token was issued
      expect(exp - iat).toBe(60 * 60); // Exactly 1 hour in seconds
    });
  });

  describe('verifyToken', () => {
    it('Should verify token signed with correct secret', () => {
      // Setup
      const payload: AccessTokenPayload = {
        sessionId: new mongoose.Types.ObjectId(),
        userId: new mongoose.Types.ObjectId()
      };
      const token = signToken(payload, { secret: JWT_SECRET });
      // Act
      const verified = verifyToken<AccessTokenPayload>(token, { secret: JWT_SECRET });
      // Validate
      expect(verified.error).toBeUndefined();
      expect(verified.payload).toBeDefined();
      // JWT converts ObjectIds to strings, so compare string representations
      expect(verified.payload?.sessionId).toBe(payload.sessionId.toString());
      expect(verified.payload?.userId).toBe(payload.userId.toString());
    });

    it('Should fail to verify token with incorrect secret', () => {
      // Setup
      const payload: AccessTokenPayload = {
        sessionId: new mongoose.Types.ObjectId(),
        userId: new mongoose.Types.ObjectId()
      };
      const token = signToken(payload, { secret: JWT_SECRET });
      // Act
      const verified = verifyToken<AccessTokenPayload>(token, { secret: 'wrong-secret' });
      // Validate
      expect(verified.error).toBeDefined();
      expect(verified.payload).toBeUndefined();
    });

    it('Should fail to verify token with expired token', () => {
      // Setup
      const payload: AccessTokenPayload = {
        sessionId: new mongoose.Types.ObjectId(),
        userId: new mongoose.Types.ObjectId()
      };
      const token = signToken(payload, { secret: JWT_SECRET, expiresIn: -1 }); // Expired token
      // Act
      const verified = verifyToken<AccessTokenPayload>(token, { secret: JWT_SECRET });
      // Validate
      expect(verified.error).toBeDefined();
      expect(verified.payload).toBeUndefined();
    });

    it('Should fail to verify token with incorrect audience', () => {
      // Setup
      const payload: AccessTokenPayload = {
        sessionId: new mongoose.Types.ObjectId(),
        userId: new mongoose.Types.ObjectId()
      };
      const token = signToken(payload, { secret: JWT_SECRET });
      // Act
      const verified = verifyToken<AccessTokenPayload>(token, { secret: JWT_SECRET, audience: 'wrong-audience' });
      // Validate
      expect(verified.error).toBeDefined();
      expect(verified.payload).toBeUndefined();
    });

    it('Should fail to verify a malformed token', () => {
      // Setup
      const malformedToken = 'this.is.not.a.valid.token';
      // Act
      const verified = verifyToken<AccessTokenPayload>(malformedToken, { secret: JWT_SECRET });
      // Validate
      expect(verified.error).toBeDefined();
      expect(verified.payload).toBeUndefined();
    });

    it('Should fail to verify an empty token', () => {
      // Setup
      const emptyToken = '';
      // Act
      const verified = verifyToken<AccessTokenPayload>(emptyToken, { secret: JWT_SECRET });
      // Validate
      expect(verified.error).toBeDefined();
      expect(verified.payload).toBeUndefined();
    });

    it('Should use JWT_SECRET as default secret', () => {
      // Setup
      const payload: AccessTokenPayload = {
        sessionId: new mongoose.Types.ObjectId(),
        userId: new mongoose.Types.ObjectId()
      };
      const token = signToken(payload); // Uses default secret
      // Act
      const verified = verifyToken<AccessTokenPayload>(token); // Matches AccessToken default
      // Validate
      expect(verified.error).toBeUndefined();
      expect(verified.payload).toBeDefined();
    });

    it('Should verify a refresh token with the correct type', () => {
      // Setup
      const payload: RefreshTokenPayload = {
        sessionId: new mongoose.Types.ObjectId()
      };
      const token = signToken(payload, { secret: JWT_REFRESH_SECRET });
      // Act
      const verified = verifyToken<RefreshTokenPayload>(token, { secret: JWT_REFRESH_SECRET });
      // Validate
      expect(verified.error).toBeUndefined();
      expect(verified.payload).toBeDefined();
      // JWT converts ObjectIds to strings, so compare string representations
      expect(verified.payload?.sessionId).toBe(payload.sessionId.toString());
      expect((verified.payload as any).userId).toBeUndefined(); // Refresh tokens don't have userId
    });
  });
});