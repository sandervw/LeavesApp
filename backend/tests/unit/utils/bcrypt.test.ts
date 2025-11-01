import { describe, it, expect } from 'vitest';
import { hashValue, compareValue } from '../../../src/utils/bcrypt';

/**
 * Tests use REAL bcrypt library (not mocked).
 * Technically "integration tests" but placed in the unit folder.
 * (They test isolated utility functions).
 * Tests are slower than mocked tests (bcrypt hashing is intentionally slow for security)
 */

describe('bcrypt utils', () => {
	describe('hashValue', () => {
		it('should hash a password', async () => {
			const password = 'mySecurePassword123';
			const hash = await hashValue(password);
			// Bcrypt hashes always start with $2b$ or $2a$
			expect(hash).toMatch(/^\$2[ab]\$/);
			// Bcrypt hashes are 60 characters long
			expect(hash).toHaveLength(60);
			// The hash should not equal the original password
			expect(hash).not.toBe(password);
		});

		it('should create different hashes for the same password', async () => {
			const password = 'samePassword';
			// Hash the same password twice
			const hash1 = await hashValue(password);
			const hash2 = await hashValue(password);
			// The hashes should be different (bcrypt uses a random salt)
			expect(hash1).not.toBe(hash2);
			// But both should be valid bcrypt hashes
			expect(hash1).toMatch(/^\$2[ab]\$/);
			expect(hash2).toMatch(/^\$2[ab]\$/);
		});

		it('should use default salt rounds of 10', async () => {
			const password = 'testPassword';
			const hash = await hashValue(password);
			// The salt rounds are embedded in the hash (4th-5th characters after $2b$)
			// $2b$10$ means 10 salt rounds
			expect(hash).toMatch(/^\$2[ab]\$10\$/);
		});

		it('should allow custom salt rounds', async () => {
			const password = 'testPassword';
			const customRounds = 6; // Lower rounds = faster (for testing)
			const hash = await hashValue(password, customRounds);
			// Should use 6 rounds (formatted as "06")
			expect(hash).toMatch(/^\$2[ab]\$06\$/);
		});

		it('should hash empty strings', async () => {
			const emptyString = '';
			const hash = await hashValue(emptyString);
			expect(hash).toMatch(/^\$2[ab]\$/);
			expect(hash).toHaveLength(60);
		});

		it('should hash long strings', async () => {
			const longPassword = 'a'.repeat(100);
			const hash = await hashValue(longPassword);
			expect(hash).toMatch(/^\$2[ab]\$/);
			expect(hash).toHaveLength(60);
		});
	});

	describe('compareValue', () => {
		it('should return true for matching password and hash', async () => {
			const password = 'correctPassword123';
			// First hash the password
			const hash = await hashValue(password);
			// Then compare it
			const isMatch = await compareValue(password, hash);
			expect(isMatch).toBe(true);
		});

		it('should return false for non-matching password and hash', async () => {
			const correctPassword = 'correctPassword';
			const wrongPassword = 'wrongPassword';
			const hash = await hashValue(correctPassword);
			const isMatch = await compareValue(wrongPassword, hash);
			expect(isMatch).toBe(false);
		});

		it('should return false for empty password against hash', async () => {
			const password = 'actualPassword';
			const hash = await hashValue(password);
			const isMatch = await compareValue('', hash);
			expect(isMatch).toBe(false);
		});

		it('should return false for invalid hash format', async () => {
			const password = 'password123';
			const invalidHash = 'not-a-real-hash';
			const isMatch = await compareValue(password, invalidHash);
			expect(isMatch).toBe(false);
		});

		it('should return false for malformed bcrypt hash', async () => {
			const password = 'password';
			const malformedHash = '$2b$10$invalid';
			const isMatch = await compareValue(password, malformedHash);
			expect(isMatch).toBe(false);
		});

		it('should handle case-sensitive passwords correctly', async () => {
			const password = 'Password123';
			const hash = await hashValue(password);
			// Exact match should work
			expect(await compareValue('Password123', hash)).toBe(true);
			// Different case should NOT work (case-sensitive)
			expect(await compareValue('password123', hash)).toBe(false);
			expect(await compareValue('PASSWORD123', hash)).toBe(false);
		});
	});

	describe('real-world authentication flow', () => {
		it('should demonstrate signup and login flow', async () => {
			// Simulate user signup - storing hashed password
			const userPassword = 'mySecurePassword!123';
			const storedHash = await hashValue(userPassword);
			// Simulate user login - comparing entered password
			const loginAttempt1 = 'mySecurePassword!123'; // Correct
			const isValidLogin1 = await compareValue(loginAttempt1, storedHash);
			expect(isValidLogin1).toBe(true);
			// Simulate failed login attempt
			const loginAttempt2 = 'wrongPassword'; // Wrong
			const isValidLogin2 = await compareValue(loginAttempt2, storedHash);
			expect(isValidLogin2).toBe(false);
		});

		it('should work with different passwords for different users', async () => {
			const user1Password = 'user1Pass';
			const user2Password = 'user2Pass';
			const user1Hash = await hashValue(user1Password);
			const user2Hash = await hashValue(user2Password);
			// User 1 login
			expect(await compareValue(user1Password, user1Hash)).toBe(true);
			expect(await compareValue(user2Password, user1Hash)).toBe(false);
			// User 2 login
			expect(await compareValue(user2Password, user2Hash)).toBe(true);
			expect(await compareValue(user1Password, user2Hash)).toBe(false);
		});

		it('should prevent timing attacks with consistent false returns', async () => {
			// compareValue should return false consistently for any error
			const validHash = await hashValue('password');
			// All these should return false (not throw errors)
			expect(await compareValue('wrong', validHash)).toBe(false);
			expect(await compareValue('', validHash)).toBe(false);
			expect(await compareValue('password', 'invalid-hash')).toBe(false);
		});
	});
});
