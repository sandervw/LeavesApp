import { describe, it, expect, vi } from 'vitest';
import { AccessTokenPayload, signToken, verifyToken } from '../../../src/utils/jwt';
import { decode } from 'jsonwebtoken';
import { JWT_REFRESH_SECRET, JWT_SECRET } from '../../../src/constants/env';
import mongoose from 'mongoose';

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
        sessionId: payload.sessionId,
        userId: payload.userId,
        aud: ['user'] // Verify default audience is applied
      });
      expect(decoded!.header.alg).toBe('HS256'); // Default JWT algorithm
    });

    it ('Should sign the token with 15 minutes expiry for access tokens', () => {
      // Setup
      const payload: AccessTokenPayload = {
        sessionId: new mongoose.Types.ObjectId(),
        userId: new mongoose.Types.ObjectId()
      };
      const secret = JWT_SECRET;
      // Act
      const nowInSeconds = Math.floor(Date.now() / 1000);
      const token = signToken(payload, { secret });
      const laterInSeconds = Math.floor(Date.now() / 1000);
      // { complete: true } to get header (alg and type) and payload
      const decoded = decode(token, { complete: true });
      // Validate
      expect(decoded).toBeDefined();
    });

    it('Should return a signed JWT given valid refresh token payload and secret', () => {
      // Setup
      const payload = { sessionId: new ObjectId().toString() };
      const secret = JWT_REFRESH_SECRET;
      // Act
      const token = signToken(payload, { secret });
      // Validate
      expect(typeof token).toBe('string');
      expect(token.split('.').length).toBe(3); // JWTs have three parts separated by dots
    });

    it('TODO', () => {
      // Setup

      // Act

      // Validate
    });
  });

  describe('verifyToken', () => {
    it('TODO', () => {
      // Setup

      // Act

      // Validate
    });

    it('TODO', () => {
      // Setup

      // Act

      // Validate
    });

    it('TODO', () => {
      // Setup

      // Act

      // Validate
    });
  });
});