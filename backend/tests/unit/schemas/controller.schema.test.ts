import { describe, it, expect } from 'vitest';
import { Types } from 'mongoose';
import { mongoIdSchema, optionalMongoIdSchema, postSchema } from '../../../src/schemas/controller.schema';

/* eslint-disable */ // Disabling eslint for this file as it's a test file.

describe('Controller Schemas', () => {
  describe('mongoIdSchema', () => {
    it('should transform valid string to Types.ObjectId instance', () => {
      // Setup
      const validId = new Types.ObjectId();
      const validIdString = validId.toString();
      // Act
      const result = mongoIdSchema.safeParse(validIdString);
      // Validate
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toBeInstanceOf(Types.ObjectId);
        expect(result.data.toString()).toBe(validIdString);
      }
    });

    it('should reject empty string', () => {
      // Setup
      const emptyString = '';
      // Act
      const result = mongoIdSchema.safeParse(emptyString);
      // Validate
      expect(result.success).toBe(false);
    });

    it('should reject null', () => {
      // Setup
      const nullValue = null;
      // Act
      const result = mongoIdSchema.safeParse(nullValue);
      // Validate
      expect(result.success).toBe(false);
    });

    it('should reject undefined', () => {
      // Setup
      const undefinedValue = undefined;
      // Act
      const result = mongoIdSchema.safeParse(undefinedValue);
      // Validate
      expect(result.success).toBe(false);
    });
  });

  describe('optionalMongoIdSchema', () => {
    it('should transform valid string to Types.ObjectId instance', () => {
      // Setup
      const validId = new Types.ObjectId();
      const validIdString = validId.toString();
      // Act
      const result = optionalMongoIdSchema.safeParse(validIdString);
      // Validate
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toBeInstanceOf(Types.ObjectId);
        expect(result).not.toBeNull();
        expect(result.data).not.toBeNull();
        expect(result.data.toString()).toBe(validIdString);
      }
    });

    it('should accept null and transform to null', () => {
      // Setup
      const nullValue = null;
      // Act
      const result = optionalMongoIdSchema.safeParse(nullValue);
      // Validate
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toBeNull();
      }
    });

    it('should accept undefined and transform to null', () => {
      // Setup
      const undefinedValue = undefined;
      // Act
      const result = optionalMongoIdSchema.safeParse(undefinedValue);
      // Validate
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toBeNull();
      }
    });

    it('should reject empty string', () => {
      // Setup
      const emptyString = '';
      // Act
      const result = optionalMongoIdSchema.safeParse(emptyString);
      // Validate
      expect(result.success).toBe(false);
    });
  });

  describe('postSchema', () => {
    it('should accept object with all required fields', () => {
      // Setup
      const validPost = {
        name: 'Test Post',
        type: 'root',
        text: 'This is test text',
        parent: null
      };
      // Act
      const result = postSchema.safeParse(validPost);
      // Validate
      expect(result.success).toBe(true);
    });

    it('should accept object with required fields and optional fields', () => {
      // Setup
      const userId = new Types.ObjectId();
      const validPost = {
        _id: userId.toString(),
        kind: 'storynode',
        userId: userId.toString(),
        name: 'Test Post',
        type: 'branch',
        text: 'This is test text',
        children: [],
        parent: null,
        wordWeight: 100,
        wordLimit: 500,
        wordCount: 250,
        isComplete: false,
        archived: false
      };
      // Act
      const result = postSchema.safeParse(validPost);
      // Validate
      expect(result.success).toBe(true);
    });

    it('should transform ObjectId strings to Types.ObjectId instances', () => {
      // Setup
      const userId = new Types.ObjectId();
      const parentId = new Types.ObjectId();
      const validPost = {
        userId: userId.toString(),
        name: 'Test Post',
        type: 'leaf',
        text: 'This is test text',
        parent: parentId.toString()
      };
      // Act
      const result = postSchema.safeParse(validPost);
      // Validate
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.userId).toBeInstanceOf(Types.ObjectId);
        expect(result.data.userId?.toString()).toBe(userId.toString());
        expect(result.data.parent).toBeInstanceOf(Types.ObjectId);
        expect(result.data.parent?.toString()).toBe(parentId.toString());
      }
    });

    it('should accept empty children array', () => {
      // Setup
      const validPost = {
        name: 'Test Post',
        type: 'root',
        text: 'This is test text',
        parent: null,
        children: []
      };
      // Act
      const result = postSchema.safeParse(validPost);
      // Validate
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.children).toEqual([]);
      }
    });

    it('should accept children array with valid ObjectIds', () => {
      // Setup
      const child1 = new Types.ObjectId();
      const child2 = new Types.ObjectId();
      const validPost = {
        name: 'Test Post',
        type: 'branch',
        text: 'This is test text',
        parent: null,
        children: [child1.toString(), child2.toString()]
      };
      // Act
      const result = postSchema.safeParse(validPost);
      // Validate
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.children).toHaveLength(2);
        expect(result.data.children?.[0]).toBeInstanceOf(Types.ObjectId);
        expect(result.data.children?.[1]).toBeInstanceOf(Types.ObjectId);
      }
    });

    it('should reject object missing name field', () => {
      // Setup
      const invalidPost = {
        type: 'root',
        text: 'This is test text',
        parent: null
      };
      // Act
      const result = postSchema.safeParse(invalidPost);
      // Validate
      expect(result.success).toBe(false);
    });

    it('should reject object missing text field', () => {
      // Setup
      const invalidPost = {
        name: 'Test Post',
        type: 'root',
        parent: null
      };
      // Act
      const result = postSchema.safeParse(invalidPost);
      // Validate
      expect(result.success).toBe(false);
    });

    it('should accept object missing parent field', () => {
      // Setup
      const validPost = {
        name: 'Test Post',
        type: 'root',
        text: 'This is test text'
      };
      // Act
      const result = postSchema.safeParse(validPost);
      // Validate
      expect(result.success).toBe(true);
    });

    it('should reject invalid type enum value', () => {
      // Setup
      const invalidPost = {
        name: 'Test Post',
        type: 'invalid_type',
        text: 'This is test text',
        parent: null
      };
      // Act
      const result = postSchema.safeParse(invalidPost);
      // Validate
      expect(result.success).toBe(false);
    });

    it('should reject invalid kind enum value', () => {
      // Setup
      const invalidPost = {
        name: 'Test Post',
        kind: 'invalid_kind',
        type: 'root',
        text: 'This is test text',
        parent: null
      };
      // Act
      const result = postSchema.safeParse(invalidPost);
      // Validate
      expect(result.success).toBe(false);
    });

    it('should reject name exceeding 255 characters', () => {
      // Setup
      const longName = 'a'.repeat(256);
      const invalidPost = {
        name: longName,
        type: 'root',
        text: 'This is test text',
        parent: null
      };
      // Act
      const result = postSchema.safeParse(invalidPost);
      // Validate
      expect(result.success).toBe(false);
    });

    it('should reject text exceeding 100000 characters', () => {
      // Setup
      const longText = 'a'.repeat(100001);
      const invalidPost = {
        name: 'Test Post',
        type: 'root',
        text: longText,
        parent: null
      };
      // Act
      const result = postSchema.safeParse(invalidPost);
      // Validate
      expect(result.success).toBe(false);
    });

    it('should reject empty name string', () => {
      // Setup
      const invalidPost = {
        name: '',
        type: 'root',
        text: 'This is test text',
        parent: null
      };
      // Act
      const result = postSchema.safeParse(invalidPost);
      // Validate
      expect(result.success).toBe(false);
    });

    it('should reject children array with invalid ObjectIds', () => {
      // Setup
      const invalidPost = {
        name: 'Test Post',
        type: 'branch',
        text: 'This is test text',
        parent: null,
        children: ['invalid_id', 'another_invalid']
      };
      // Act
      const result = postSchema.safeParse(invalidPost);
      // Validate
      expect(result.success).toBe(false);
    });

    it('should reject wordWeight as non-number', () => {
      // Setup
      const invalidPost = {
        name: 'Test Post',
        type: 'root',
        text: 'This is test text',
        parent: null,
        wordWeight: 'not_a_number'
      };
      // Act
      const result = postSchema.safeParse(invalidPost);
      // Validate
      expect(result.success).toBe(false);
    });

    it('should reject isComplete as non-boolean', () => {
      // Setup
      const invalidPost = {
        name: 'Test Post',
        type: 'root',
        text: 'This is test text',
        parent: null,
        isComplete: 'not_a_boolean'
      };
      // Act
      const result = postSchema.safeParse(invalidPost);
      // Validate
      expect(result.success).toBe(false);
    });
  });
});