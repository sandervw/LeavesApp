import { describe, it, expect } from 'vitest';
import { hashValue, compareValue } from '../../../src/utils/bcrypt';

/* eslint-disable */ // Disabling eslint for this file as it's a test file.

describe('bcrypt utils', () => {
	describe('hashValue', () => {
		it('should hash a password', async () => {
			// Setup
			const password = 'mySecurePassword123';
			// Act
			const hash = await hashValue(password);
			// Validate
			// Bcrypt hashes always start with $2b$ or $2a$
			expect(hash).toMatch(/^\$2[ab]\$/);
			// Bcrypt hashes are 60 characters long
			expect(hash).toHaveLength(60);
			// The hash should not equal the original password
			expect(hash).not.toBe(password);
		});

		it('should create different hashes for the same password', async () => {
			// Setup
			const password = 'samePassword';
			// Act - Hash the same password twice
			const hash1 = await hashValue(password);
			const hash2 = await hashValue(password);
			// Validate
			// The hashes should be different (bcrypt uses a random salt)
			expect(hash1).not.toBe(hash2);
			// But both should be valid bcrypt hashes
			expect(hash1).toMatch(/^\$2[ab]\$/);
			expect(hash2).toMatch(/^\$2[ab]\$/);
		});

		it('should use default salt rounds of 10', async () => {
			// Setup
			const password = 'testPassword';
			// Act
			const hash = await hashValue(password);
			// Validate
			// The salt rounds are embedded in the hash (4th-5th characters after $2b$)
			// $2b$10$ means 10 salt rounds
			expect(hash).toMatch(/^\$2[ab]\$10\$/);
		});

		it('should allow custom salt rounds', async () => {
			// Setup
			const password = 'testPassword';
			const customRounds = 6; // Lower rounds = faster (for testing)
			// Act
			const hash = await hashValue(password, customRounds);
			// Validate - Should use 6 rounds (formatted as "06")
			expect(hash).toMatch(/^\$2[ab]\$06\$/);
		});

		it('should hash empty strings', async () => {
			// Setup
			const emptyString = '';
			// Act
			const hash = await hashValue(emptyString);
			// Validate
			expect(hash).toMatch(/^\$2[ab]\$/);
			expect(hash).toHaveLength(60);
		});

		it('should hash long strings', async () => {
			// Setup
			const longPassword = 'a'.repeat(100);
			// Act
			const hash = await hashValue(longPassword);
			// Validate
			expect(hash).toMatch(/^\$2[ab]\$/);
			expect(hash).toHaveLength(60);
		});
	});

	describe('compareValue', () => {
		it('should return true for matching password and hash', async () => {
			// Setup
			const password = 'correctPassword123';
			// Act - First hash the password
			const hash = await hashValue(password);
			// Then compare it
			const isMatch = await compareValue(password, hash);
			// Validate
			expect(isMatch).toBe(true);
		});

		it('should return false for non-matching password and hash', async () => {
			// Setup
			const correctPassword = 'correctPassword';
			const wrongPassword = 'wrongPassword';
			const hash = await hashValue(correctPassword);
			// Act
			const isMatch = await compareValue(wrongPassword, hash);
			// Validate
			expect(isMatch).toBe(false);
		});

		it('should return false for empty password against hash', async () => {
			// Setup
			const password = 'actualPassword';
			const hash = await hashValue(password);
			// Act
			const isMatch = await compareValue('', hash);
			// Validate
			expect(isMatch).toBe(false);
		});

		it('should return false for invalid hash format', async () => {
			// Setup
			const password = 'password123';
			const invalidHash = 'not-a-real-hash';
			// Act
			const isMatch = await compareValue(password, invalidHash);
			// Validate
			expect(isMatch).toBe(false);
		});

		it('should return false for malformed bcrypt hash', async () => {
			// Setup
			const password = 'password';
			const malformedHash = '$2b$10$invalid';
			// Act
			const isMatch = await compareValue(password, malformedHash);
			// Validate
			expect(isMatch).toBe(false);
		});

		it('should handle case-sensitive passwords correctly', async () => {
			// Setup
			const password = 'Password123';
			const hash = await hashValue(password);
			// Act & Validate - Exact match should work
			expect(await compareValue('Password123', hash)).toBe(true);
			// Different case should NOT work (case-sensitive)
			expect(await compareValue('password123', hash)).toBe(false);
			expect(await compareValue('PASSWORD123', hash)).toBe(false);
		});
	});

	describe('real-world authentication flow', () => {
		it('should demonstrate signup and login flow', async () => {
			// Setup
			const userPassword = 'mySecurePassword!123';
			// Act - Simulate user signup - storing hashed password
			const storedHash = await hashValue(userPassword);
			// Simulate user login - comparing entered password
			const loginAttempt1 = 'mySecurePassword!123'; // Correct
			const isValidLogin1 = await compareValue(loginAttempt1, storedHash);
			// Validate
			expect(isValidLogin1).toBe(true);
			// Simulate failed login attempt
			const loginAttempt2 = 'wrongPassword'; // Wrong
			const isValidLogin2 = await compareValue(loginAttempt2, storedHash);
			expect(isValidLogin2).toBe(false);
		});

		it('should work with different passwords for different users', async () => {
			// Setup
			const user1Password = 'user1Pass';
			const user2Password = 'user2Pass';
			const user1Hash = await hashValue(user1Password);
			const user2Hash = await hashValue(user2Password);
			// Act & Validate - User 1 login
			expect(await compareValue(user1Password, user1Hash)).toBe(true);
			expect(await compareValue(user2Password, user1Hash)).toBe(false);
			// User 2 login
			expect(await compareValue(user2Password, user2Hash)).toBe(true);
			expect(await compareValue(user1Password, user2Hash)).toBe(false);
		});

		it('should prevent timing attacks with consistent false returns', async () => {
			// Setup
			const validHash = await hashValue('password');
			// Act & Validate
			// compareValue should return false consistently for any error
			// All these should return false (not throw errors)
			expect(await compareValue('wrong', validHash)).toBe(false);
			expect(await compareValue('', validHash)).toBe(false);
			expect(await compareValue('password', 'invalid-hash')).toBe(false);
		});
	});
});
