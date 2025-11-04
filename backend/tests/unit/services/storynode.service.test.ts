import { describe, it, expect, vi, beforeEach } from 'vitest';
import storynodeService from '../../../src/services/storynode.service';
import { Storynode } from '../../../src/models/tree.model';
import { StorynodeDoc } from '../../../src/schemas/mongo.schema';
import mongoose from 'mongoose';
import { AppError } from '../../../src/utils/errorUtils';
import { NOT_FOUND, INTERNAL_SERVER_ERROR } from '../../../src/constants/http';

/* eslint-disable */ // Disabling eslint for this file as it's a test file.

// Mock the Storynode model
vi.mock('../../../src/models/tree.model', () => ({
  Storynode: {
    find: vi.fn(),
    findOne: vi.fn(),
    findOneAndUpdate: vi.fn(),
    create: vi.fn()
  },
  Template: {
    find: vi.fn(),
    findOne: vi.fn()
  }
}));

// Mock recursive service
vi.mock('../../../src/services/recursive.service', () => ({
  recursiveUpdateWordLimits: vi.fn(),
  recursiveUpdateParentWordCount: vi.fn(),
  recursiveStorynodeFromTemplate: vi.fn(),
  recursiveGetTreeDepth: vi.fn()
}));

// Mock environment constants
vi.mock('../../../src/constants/env', () => ({
  MAX_TREE_DEPTH: 25
}));

describe('Storynode Service', () => {

  let userId: mongoose.Types.ObjectId;

  beforeEach(() => {
    vi.clearAllMocks();
    userId = new mongoose.Types.ObjectId();
  });

  describe('upsert', () => {
    describe('Update existing storynode', () => {
      it('should update storynode with valid _id', async () => {
        // Setup
        const { recursiveUpdateParentWordCount, recursiveUpdateWordLimits } = await import('../../../src/services/recursive.service');
        const storynodeId = new mongoose.Types.ObjectId();
        const data = {
          _id: storynodeId,
          name: 'Updated Storynode',
          type: 'leaf',
          text: 'Updated text'
        } as StorynodeDoc;
        const updatedStorynode = { ...data, userId, wordCount: 2 };
        vi.mocked(Storynode.findOneAndUpdate).mockResolvedValue(updatedStorynode);
        // Act
        const result = await storynodeService.upsert(userId, data);
        // Validate
        expect(Storynode.findOneAndUpdate).toHaveBeenCalledWith(
          { _id: storynodeId, userId },
          { $set: data },
          { new: true }
        );
        expect(result).toEqual(updatedStorynode);
      });

      it('should calculate wordCount from children when children array is provided', async () => {
        // Setup
        const storynodeId = new mongoose.Types.ObjectId();
        const child1Id = new mongoose.Types.ObjectId();
        const child2Id = new mongoose.Types.ObjectId();
        const data = {
          _id: storynodeId,
          name: 'Parent',
          type: 'branch',
          children: [child1Id, child2Id]
        } as StorynodeDoc;
        const children = [
          { _id: child1Id, userId, wordCount: 10 },
          { _id: child2Id, userId, wordCount: 15 }
        ];
        vi.mocked(Storynode.find).mockResolvedValue(children as any);
        vi.mocked(Storynode.findOneAndUpdate).mockResolvedValue({ ...data, userId, wordCount: 25 });
        // Act
        await storynodeService.upsert(userId, data);
        // Validate
        expect(data.wordCount).toBe(25);
        expect(Storynode.find).toHaveBeenCalledWith({ _id: { $in: [child1Id, child2Id] }, userId });
      });

      it('should calculate wordCount from text when no children', async () => {
        // Setup
        const storynodeId = new mongoose.Types.ObjectId();
        const data = {
          _id: storynodeId,
          name: 'Leaf Node',
          type: 'leaf',
          text: 'This is a test text'
        } as StorynodeDoc;
        vi.mocked(Storynode.findOneAndUpdate).mockResolvedValue({ ...data, userId, wordCount: 5 });
        // Act
        await storynodeService.upsert(userId, data);
        // Validate
        expect(data.wordCount).toBe(5);
      });

      it('should filter out null and undefined children from array', async () => {
        // Setup
        const storynodeId = new mongoose.Types.ObjectId();
        const childId = new mongoose.Types.ObjectId();
        const data = {
          _id: storynodeId,
          name: 'Parent',
          type: 'branch',
          children: [childId, null, undefined]
        } as any;
        const children = [{ _id: childId, userId, wordCount: 10 }];
        vi.mocked(Storynode.find).mockResolvedValue(children as any);
        vi.mocked(Storynode.findOneAndUpdate).mockResolvedValue({ ...data, userId, children: [childId], wordCount: 10 });
        // Act
        await storynodeService.upsert(userId, data);
        // Validate
        expect(data.children).toEqual([childId]);
        expect(Storynode.find).toHaveBeenCalledWith({ _id: { $in: [childId] }, userId });
      });

      it('should throw NOT_FOUND error if children not found', async () => {
        // Setup
        const storynodeId = new mongoose.Types.ObjectId();
        const child1Id = new mongoose.Types.ObjectId();
        const child2Id = new mongoose.Types.ObjectId();
        const data = {
          _id: storynodeId,
          children: [child1Id, child2Id]
        } as StorynodeDoc;
        vi.mocked(Storynode.find).mockResolvedValue([{ _id: child1Id }] as any);
        // Act & Validate
        try {
          await storynodeService.upsert(userId, data);
          expect.fail('Should have thrown an error');
        } catch (error) {
          expect(error).toBeInstanceOf(AppError);
          expect((error as AppError).statusCode).toBe(NOT_FOUND);
          expect((error as AppError).message).toBe('Some children not found');
        }
      });

      it('should throw NOT_FOUND error if storynode not found', async () => {
        // Setup
        const storynodeId = new mongoose.Types.ObjectId();
        const data = {
          _id: storynodeId,
          name: 'Nonexistent'
        } as StorynodeDoc;
        vi.mocked(Storynode.findOneAndUpdate).mockResolvedValue(null);
        // Act & Validate
        try {
          await storynodeService.upsert(userId, data);
          expect.fail('Should have thrown an error');
        } catch (error) {
          expect(error).toBeInstanceOf(AppError);
          expect((error as AppError).statusCode).toBe(NOT_FOUND);
          expect((error as AppError).message).toBe('Storynode not found');
        }
      });

      it('should update parent wordCount if storynode has parent', async () => {
        // Setup
        const { recursiveUpdateParentWordCount } = await import('../../../src/services/recursive.service');
        const storynodeId = new mongoose.Types.ObjectId();
        const parentId = new mongoose.Types.ObjectId();
        const data = {
          _id: storynodeId,
          parent: parentId,
          text: 'Some text'
        } as StorynodeDoc;
        const updatedStorynode = { ...data, userId, wordCount: 2 };
        vi.mocked(Storynode.findOneAndUpdate).mockResolvedValue(updatedStorynode);
        // Act
        await storynodeService.upsert(userId, data);
        // Validate
        expect(recursiveUpdateParentWordCount).toHaveBeenCalledWith(updatedStorynode, userId);
      });

      it('should update children word limits if storynode is root with wordLimit', async () => {
        // Setup
        const { recursiveUpdateWordLimits } = await import('../../../src/services/recursive.service');
        const storynodeId = new mongoose.Types.ObjectId();
        const data = {
          _id: storynodeId,
          name: 'Root',
          type: 'root',
          wordLimit: 1000
        } as StorynodeDoc;
        const updatedStorynode = { ...data, userId };
        vi.mocked(Storynode.findOneAndUpdate).mockResolvedValue(updatedStorynode);
        // Act
        await storynodeService.upsert(userId, data);
        // Validate
        expect(recursiveUpdateWordLimits).toHaveBeenCalledWith(updatedStorynode);
      });

      it('should not update word limits for non-root storynodes', async () => {
        // Setup
        const { recursiveUpdateWordLimits } = await import('../../../src/services/recursive.service');
        const storynodeId = new mongoose.Types.ObjectId();
        const data = {
          _id: storynodeId,
          name: 'Branch',
          type: 'branch',
          wordLimit: 500
        } as StorynodeDoc;
        const updatedStorynode = { ...data, userId };
        vi.mocked(Storynode.findOneAndUpdate).mockResolvedValue(updatedStorynode);
        // Act
        await storynodeService.upsert(userId, data);
        // Validate
        expect(recursiveUpdateWordLimits).not.toHaveBeenCalled();
      });

      it('should count words correctly (split by whitespace, filter empty)', async () => {
        // Setup
        const storynodeId = new mongoose.Types.ObjectId();
        const data = {
          _id: storynodeId,
          text: 'one two three four'
        } as StorynodeDoc;
        vi.mocked(Storynode.findOneAndUpdate).mockResolvedValue({ ...data, userId, wordCount: 4 });
        // Act
        await storynodeService.upsert(userId, data);
        // Validate
        expect(data.wordCount).toBe(4);
      });

      it('should handle text with multiple spaces between words', async () => {
        // Setup
        const storynodeId = new mongoose.Types.ObjectId();
        const data = {
          _id: storynodeId,
          text: 'word1    word2     word3'
        } as StorynodeDoc;
        vi.mocked(Storynode.findOneAndUpdate).mockResolvedValue({ ...data, userId, wordCount: 3 });
        // Act
        await storynodeService.upsert(userId, data);
        // Validate
        expect(data.wordCount).toBe(3);
      });

      it('should filter by userId', async () => {
        // Setup
        const storynodeId = new mongoose.Types.ObjectId();
        const data = {
          _id: storynodeId,
          name: 'Test',
          text: 'test'
        } as StorynodeDoc;
        vi.mocked(Storynode.findOneAndUpdate).mockResolvedValue({ ...data, userId });
        // Act
        await storynodeService.upsert(userId, data);
        // Validate
        expect(Storynode.findOneAndUpdate).toHaveBeenCalledWith(
          { _id: storynodeId, userId },
          { $set: data },
          { new: true }
        );
      });
    });

    describe('Create new storynode', () => {
      it('should create new storynode when _id is not provided', async () => {
        // Setup
        const { recursiveGetTreeDepth } = await import('../../../src/services/recursive.service');
        const data = {
          name: 'New Storynode',
          type: 'leaf',
          text: 'Some text'
        } as StorynodeDoc;
        const createdStorynode = { ...data, _id: new mongoose.Types.ObjectId(), userId, wordCount: 2 };
        vi.mocked(recursiveGetTreeDepth).mockResolvedValue(5);
        vi.mocked(Storynode.create).mockResolvedValue(createdStorynode as any);
        // Act
        const result = await storynodeService.upsert(userId, data);
        // Validate
        expect(Storynode.create).toHaveBeenCalledWith({ ...data, userId, wordCount: 2 });
        expect(result).toEqual(createdStorynode);
      });

      it('should calculate wordCount from text on create', async () => {
        // Setup
        const { recursiveGetTreeDepth } = await import('../../../src/services/recursive.service');
        const data = {
          name: 'New Storynode',
          type: 'leaf',
          text: 'This has five total words'
        } as StorynodeDoc;
        const createdStorynode = { ...data, userId };
        vi.mocked(recursiveGetTreeDepth).mockResolvedValue(5);
        vi.mocked(Storynode.create).mockResolvedValue(createdStorynode as any);
        // Act
        await storynodeService.upsert(userId, data);
        // Validate
        expect(data.wordCount).toBe(5);
        expect(Storynode.create).toHaveBeenCalledWith({ ...data, userId, wordCount: 5 });
      });

      it('should ensure userId is set', async () => {
        // Setup
        const { recursiveGetTreeDepth } = await import('../../../src/services/recursive.service');
        const data = {
          name: 'New Storynode',
          type: 'leaf'
        } as StorynodeDoc;
        const createdStorynode = { ...data, userId };
        vi.mocked(recursiveGetTreeDepth).mockResolvedValue(5);
        vi.mocked(Storynode.create).mockResolvedValue(createdStorynode as any);
        // Act
        await storynodeService.upsert(userId, data);
        // Validate
        expect(data.userId).toEqual(userId);
        expect(Storynode.create).toHaveBeenCalledWith({ ...data, userId });
      });

      it('should check tree depth before creating', async () => {
        // Setup
        const { recursiveGetTreeDepth } = await import('../../../src/services/recursive.service');
        const parentId = new mongoose.Types.ObjectId();
        const data = {
          name: 'New Storynode',
          type: 'leaf',
          parent: parentId
        } as StorynodeDoc;
        const createdStorynode = { ...data, userId };
        vi.mocked(recursiveGetTreeDepth).mockResolvedValue(10);
        vi.mocked(Storynode.create).mockResolvedValue(createdStorynode as any);
        // Act
        await storynodeService.upsert(userId, data);
        // Validate
        expect(recursiveGetTreeDepth).toHaveBeenCalledWith(data, Storynode, userId);
      });

      it('should throw INTERNAL_SERVER_ERROR if depth exceeds MAX_TREE_DEPTH', async () => {
        // Setup
        const { recursiveGetTreeDepth } = await import('../../../src/services/recursive.service');
        const data = {
          name: 'New Storynode',
          type: 'leaf'
        } as StorynodeDoc;
        vi.mocked(recursiveGetTreeDepth).mockResolvedValue(26);
        // Act & Validate
        try {
          await storynodeService.upsert(userId, data);
          expect.fail('Should have thrown an error');
        } catch (error) {
          expect(error).toBeInstanceOf(AppError);
          expect((error as AppError).statusCode).toBe(INTERNAL_SERVER_ERROR);
          expect((error as AppError).message).toContain('Maximum tree depth exceeded');
          expect((error as AppError).message).toContain('limit: 25');
        }
      });

      it('should update parent wordCount if new storynode has parent', async () => {
        // Setup
        const { recursiveGetTreeDepth, recursiveUpdateParentWordCount } = await import('../../../src/services/recursive.service');
        const parentId = new mongoose.Types.ObjectId();
        const data = {
          name: 'Child Node',
          type: 'leaf',
          parent: parentId,
          text: 'Some text'
        } as StorynodeDoc;
        const createdStorynode = { ...data, userId, wordCount: 2 };
        vi.mocked(recursiveGetTreeDepth).mockResolvedValue(5);
        vi.mocked(Storynode.create).mockResolvedValue(createdStorynode as any);
        // Act
        await storynodeService.upsert(userId, data);
        // Validate
        expect(recursiveUpdateParentWordCount).toHaveBeenCalledWith(createdStorynode, userId);
      });

      it('should handle creation without parent', async () => {
        // Setup
        const { recursiveGetTreeDepth, recursiveUpdateParentWordCount } = await import('../../../src/services/recursive.service');
        const data = {
          name: 'Root Node',
          type: 'root'
        } as StorynodeDoc;
        const createdStorynode = { ...data, userId };
        vi.mocked(recursiveGetTreeDepth).mockResolvedValue(0);
        vi.mocked(Storynode.create).mockResolvedValue(createdStorynode as any);
        // Act
        await storynodeService.upsert(userId, data);
        // Validate
        expect(recursiveUpdateParentWordCount).not.toHaveBeenCalled();
        expect(Storynode.create).toHaveBeenCalled();
      });

      it('should count words correctly on creation', async () => {
        // Setup
        const { recursiveGetTreeDepth } = await import('../../../src/services/recursive.service');
        const data = {
          name: 'New Node',
          type: 'leaf',
          text: '  one   two  three  '
        } as StorynodeDoc;
        const createdStorynode = { ...data, userId };
        vi.mocked(recursiveGetTreeDepth).mockResolvedValue(5);
        vi.mocked(Storynode.create).mockResolvedValue(createdStorynode as any);
        // Act
        await storynodeService.upsert(userId, data);
        // Validate
        expect(data.wordCount).toBe(3);
      });
    });
  });

  describe('addFromTemplate', () => {
    it('should create new storynode tree from template without parent', async () => {
      // Setup
      const { recursiveStorynodeFromTemplate } = await import('../../../src/services/recursive.service');
      const templateId = new mongoose.Types.ObjectId();
      const newStorynodeId = new mongoose.Types.ObjectId();
      const newStorynode = {
        _id: newStorynodeId,
        userId,
        name: 'From Template',
        type: 'root'
      };
      vi.mocked(recursiveStorynodeFromTemplate).mockResolvedValue(newStorynode as any);
      // Act
      const result = await storynodeService.addFromTemplate(userId, templateId);
      // Validate
      expect(recursiveStorynodeFromTemplate).toHaveBeenCalledWith(userId, templateId);
      expect(result).toEqual(newStorynode);
    });

    it('should add template as child to existing parent', async () => {
      // Setup
      const { recursiveStorynodeFromTemplate } = await import('../../../src/services/recursive.service');
      const templateId = new mongoose.Types.ObjectId();
      const parentId = new mongoose.Types.ObjectId();
      const newChildId = new mongoose.Types.ObjectId();
      const parent = {
        _id: parentId,
        userId,
        name: 'Parent',
        children: []
      };
      const newChild = {
        _id: newChildId,
        userId,
        name: 'Child from Template',
        parent: parentId
      };
      vi.mocked(Storynode.findOne).mockResolvedValue(parent as any);
      vi.mocked(recursiveStorynodeFromTemplate).mockResolvedValue(newChild as any);
      vi.mocked(Storynode.findOneAndUpdate).mockResolvedValue({ ...parent, children: [newChildId] } as any);
      // Act
      const result = await storynodeService.addFromTemplate(userId, templateId, parentId);
      // Validate
      expect(Storynode.findOne).toHaveBeenCalledWith({ _id: parentId, userId });
      expect(recursiveStorynodeFromTemplate).toHaveBeenCalledWith(userId, templateId, parentId);
      expect(result).toEqual(newChild);
    });

    it('should update parent children array when adding child', async () => {
      // Setup
      const { recursiveStorynodeFromTemplate } = await import('../../../src/services/recursive.service');
      const templateId = new mongoose.Types.ObjectId();
      const parentId = new mongoose.Types.ObjectId();
      const existingChildId = new mongoose.Types.ObjectId();
      const newChildId = new mongoose.Types.ObjectId();
      const parent = {
        _id: parentId,
        userId,
        name: 'Parent',
        children: [existingChildId]
      };
      const newChild = {
        _id: newChildId,
        userId,
        name: 'New Child',
        parent: parentId
      };
      vi.mocked(Storynode.findOne).mockResolvedValue(parent as any);
      vi.mocked(recursiveStorynodeFromTemplate).mockResolvedValue(newChild as any);
      vi.mocked(Storynode.findOneAndUpdate).mockResolvedValue({ ...parent, children: [existingChildId, newChildId] } as any);
      // Act
      await storynodeService.addFromTemplate(userId, templateId, parentId);
      // Validate
      expect(Storynode.findOneAndUpdate).toHaveBeenCalledWith(
        { _id: parentId, userId },
        { children: [existingChildId, newChildId] },
        { new: true }
      );
    });

    it('should throw NOT_FOUND error if parent not found', async () => {
      // Setup
      const templateId = new mongoose.Types.ObjectId();
      const parentId = new mongoose.Types.ObjectId();
      vi.mocked(Storynode.findOne).mockResolvedValue(null);
      // Act & Validate
      try {
        await storynodeService.addFromTemplate(userId, templateId, parentId);
        expect.fail('Should have thrown an error');
      } catch (error) {
        expect(error).toBeInstanceOf(AppError);
        expect((error as AppError).statusCode).toBe(NOT_FOUND);
        expect((error as AppError).message).toBe('Parent not found');
      }
    });

    it('should filter by userId when finding parent', async () => {
      // Setup
      const { recursiveStorynodeFromTemplate } = await import('../../../src/services/recursive.service');
      const templateId = new mongoose.Types.ObjectId();
      const parentId = new mongoose.Types.ObjectId();
      const parent = {
        _id: parentId,
        userId,
        name: 'Parent',
        children: []
      };
      const newChild = { _id: new mongoose.Types.ObjectId(), userId };
      vi.mocked(Storynode.findOne).mockResolvedValue(parent as any);
      vi.mocked(recursiveStorynodeFromTemplate).mockResolvedValue(newChild as any);
      vi.mocked(Storynode.findOneAndUpdate).mockResolvedValue(parent as any);
      // Act
      await storynodeService.addFromTemplate(userId, templateId, parentId);
      // Validate
      expect(Storynode.findOne).toHaveBeenCalledWith({ _id: parentId, userId });
      expect(Storynode.findOneAndUpdate).toHaveBeenCalledWith(
        { _id: parentId, userId },
        expect.anything(),
        expect.anything()
      );
    });

    it('should return the newly created storynode/tree', async () => {
      // Setup
      const { recursiveStorynodeFromTemplate } = await import('../../../src/services/recursive.service');
      const templateId = new mongoose.Types.ObjectId();
      const newStorynodeId = new mongoose.Types.ObjectId();
      const newStorynode = {
        _id: newStorynodeId,
        userId,
        name: 'New Tree',
        type: 'root',
        children: []
      };
      vi.mocked(recursiveStorynodeFromTemplate).mockResolvedValue(newStorynode as any);
      // Act
      const result = await storynodeService.addFromTemplate(userId, templateId);
      // Validate
      expect(result).toEqual(newStorynode);
      expect(result._id).toEqual(newStorynodeId);
      expect(result.name).toEqual('New Tree');
    });
  });

});
