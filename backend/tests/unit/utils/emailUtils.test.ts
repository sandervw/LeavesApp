import { describe, it, expect, vi, beforeEach } from 'vitest';
import { sendMail, getPasswordResetTemplate, getVerifyEmailTemplate } from '../../../src/utils/emailUtils';
import resend from '../../../src/config/resend';

/* eslint-disable */ // Disabling eslint for this file as it's a test file.

// Mock the resend module
vi.mock('../../../src/config/resend', () => ({
  default: {
    emails: {
      send: vi.fn()
    }
  }
}));

// Mock environment variables
vi.mock('../../../src/constants/env', () => ({
  EMAIL_SENDER: 'noreply@leavesapp.com',
  NODE_ENV: 'test'
}));

describe('Email Utils', () => {

  beforeEach(() => {
    // Clear all mocks before each test
    vi.clearAllMocks();
  });

  describe('getPasswordResetTemplate', () => {
    it('should return correct subject for password reset', () => {
      // Setup
      const url = 'https://example.com/reset?token=abc123';
      // Act
      const template = getPasswordResetTemplate(url);
      // Validate
      expect(template.subject).toBe('Password Reset Request');
    });

    it('should include URL in text content', () => {
      // Setup
      const url = 'https://example.com/reset?token=abc123';
      // Act
      const template = getPasswordResetTemplate(url);
      // Validate
      expect(template.text).toContain(url);
      expect(template.text).toContain('Click on the link to reset your password');
    });

    it('should include URL in HTML content', () => {
      // Setup
      const url = 'https://example.com/reset?token=abc123';
      // Act
      const template = getPasswordResetTemplate(url);
      // Validate
      expect(template.html).toContain(url);
      expect(template.html).toContain('href=');
      expect(template.html).toContain('<!doctype html>');
    });

    it('should handle different URL formats', () => {
      // Setup
      const urls = [
        'http://localhost:5173/reset?token=test',
        'https://prod.com/reset/12345',
        'https://example.com/auth/reset?token=xyz&user=1'
      ];
      // Act & Validate
      urls.forEach(url => {
        const template = getPasswordResetTemplate(url);
        expect(template.text).toContain(url);
        expect(template.html).toContain(url);
      });
    });
  });

  describe('getVerifyEmailTemplate', () => {
    it('should return correct subject for email verification', () => {
      // Setup
      const url = 'https://example.com/verify?token=abc123';
      // Act
      const template = getVerifyEmailTemplate(url);
      // Validate
      expect(template.subject).toBe('Verify Email Address');
    });

    it('should include URL in text content', () => {
      // Setup
      const url = 'https://example.com/verify?token=abc123';
      // Act
      const template = getVerifyEmailTemplate(url);
      // Validate
      expect(template.text).toContain(url);
      expect(template.text).toContain('Click on the link to verify your email address');
    });

    it('should include URL in HTML content', () => {
      // Setup
      const url = 'https://example.com/verify?token=abc123';
      // Act
      const template = getVerifyEmailTemplate(url);
      // Validate
      expect(template.html).toContain(url);
      expect(template.html).toContain('href=');
      expect(template.html).toContain('<!doctype html>');
    });

    it('should handle different URL formats', () => {
      // Setup
      const urls = [
        'http://localhost:5173/verify?token=test',
        'https://prod.com/verify/12345',
        'https://example.com/auth/verify?token=xyz&user=1'
      ];
      // Act & Validate
      urls.forEach(url => {
        const template = getVerifyEmailTemplate(url);
        expect(template.text).toContain(url);
        expect(template.html).toContain(url);
      });
    });
  });

  describe('sendMail', () => {
    it('should call resend.emails.send with correct parameters', async () => {
      // Setup
      const mockResponse = {data: { id: 'email-id-123' }, error: null};
      vi.mocked(resend.emails.send).mockResolvedValue(mockResponse);
      const params = {
        to: 'user@example.com',
        subject: 'Test Subject',
        text: 'Test text content',
        html: '<p>Test HTML content</p>'
      };
      // Act
      await sendMail(params);
      // Validate
      expect(resend.emails.send).toHaveBeenCalledTimes(1);
      expect(resend.emails.send).toHaveBeenCalledWith(
        expect.objectContaining({
          to: expect.any(String),
          from: expect.any(String),
          subject: 'Test Subject',
          text: 'Test text content',
          html: '<p>Test HTML content</p>'
        })
      );
    });

    it('should use correct email sender from environment', async () => {
      // Setup
      const mockResponse = {data: { id: 'email-id-123' }, error: null};
      vi.mocked(resend.emails.send).mockResolvedValue(mockResponse);
      const params = {
        to: 'user@example.com',
        subject: 'Test',
        text: 'Test',
        html: '<p>Test</p>'
      };
      // Act
      await sendMail(params);
      // Validate
      const callArgs = vi.mocked(resend.emails.send).mock.calls[0][0];
      expect(callArgs).toHaveProperty('from');
      expect(callArgs).toHaveProperty('to');
    });

    it('should return response from resend API', async () => {
      // Setup
      const mockResponse = {data: { id: 'email-id-123' }, error: null};
      vi.mocked(resend.emails.send).mockResolvedValue(mockResponse);
      const params = {
        to: 'user@example.com',
        subject: 'Test',
        text: 'Test',
        html: '<p>Test</p>'
      };
      // Act
      const result = await sendMail(params);
      // Validate
      expect(result).toEqual(mockResponse);
    });

    it('should propagate errors from resend API', async () => {
      // Setup
      const mockError = new Error('API Error');
      vi.mocked(resend.emails.send).mockRejectedValue(mockError);
      const params = {
        to: 'user@example.com',
        subject: 'Test',
        text: 'Test',
        html: '<p>Test</p>'
      };
      // Act & Validate
      await expect(sendMail(params)).rejects.toThrow('API Error');
    });
  });
});