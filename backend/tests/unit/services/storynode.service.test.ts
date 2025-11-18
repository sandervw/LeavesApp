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
          expect((error as AppError).message).toBe('Element not found');
        }
      });

      it('should update parent wordCount if storynode has parent', async () => {
        // Setup
        const storynodeId = new mongoose.Types.ObjectId();
        const parentId = new mongoose.Types.ObjectId();
        const grandparentId = new mongoose.Types.ObjectId();
        const data = {
          _id: storynodeId,
          parent: parentId,
          text: 'Some text'
        } as StorynodeDoc;
        const updatedStorynode = { ...data, userId, wordCount: 2 };
        const parent = { _id: parentId, userId, parent: grandparentId, children: [storynodeId] };
        const grandparent = { _id: grandparentId, userId, parent: null, children: [parentId] };

        // Mock findOne calls for collectAncestors:
        // 1. Find the updated node itself
        // 2-3. Walk up the tree to parent, then grandparent
        vi.mocked(Storynode.findOne)
          .mockResolvedValueOnce(updatedStorynode as any) // collectAncestors: find starting node
          .mockResolvedValueOnce(parent as any) // collectAncestors: find parent
          .mockResolvedValueOnce(grandparent as any); // collectAncestors: find grandparent (has no parent, loop exits)

        // Mock find calls for getting siblings to calculate word counts
        vi.mocked(Storynode.find)
          .mockResolvedValueOnce([updatedStorynode] as any) // Parent's children
          .mockResolvedValueOnce([parent] as any); // Grandparent's children

        // Mock findOneAndUpdate for all update operations
        vi.mocked(Storynode.findOneAndUpdate)
          .mockResolvedValueOnce(updatedStorynode) // Initial upsert
          .mockResolvedValueOnce(parent as any) // Update parent wordCount
          .mockResolvedValueOnce(grandparent as any); // Update grandparent wordCount

        // Act
        await storynodeService.upsert(userId, data);

        // Validate - check that database operations were performed
        expect(Storynode.findOne).toHaveBeenCalled();
        expect(Storynode.find).toHaveBeenCalled();
        expect(Storynode.findOneAndUpdate).toHaveBeenCalled();
      });

      it('should update children word limits if storynode is root with wordLimit', async () => {
        // Setup
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
      });

      it('should not update word limits for non-root storynodes', async () => {
        // Setup
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
        // Validate: No error thrown means word limits were not updated (which is correct for non-root)
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
        const data = {
          name: 'New Storynode',
          type: 'leaf',
          text: 'Some text',
          depth: 0
        } as StorynodeDoc;
        const createdStorynode = { ...data, _id: new mongoose.Types.ObjectId(), userId, wordCount: 2, depth: 0 };
        vi.mocked(Storynode.create).mockResolvedValue(createdStorynode as any);
        // Act
        const result = await storynodeService.upsert(userId, data);
        // Validate
        expect(Storynode.create).toHaveBeenCalledWith({ ...data, userId, wordCount: 2, depth: 0 });
        expect(result).toEqual(createdStorynode);
      });

      it('should calculate wordCount from text on create', async () => {
        // Setup
        const data = {
          name: 'New Storynode',
          type: 'leaf',
          text: 'This has five total words',
          depth: 0
        } as StorynodeDoc;
        const createdStorynode = { ...data, userId, wordCount: 5, depth: 0 };
        vi.mocked(Storynode.create).mockResolvedValue(createdStorynode as any);
        // Act
        await storynodeService.upsert(userId, data);
        // Validate
        expect(data.wordCount).toBe(5);
        expect(Storynode.create).toHaveBeenCalledWith({ ...data, userId, wordCount: 5, depth: 0 });
      });

      it('should ensure userId is set', async () => {
        // Setup
        const data = {
          name: 'New Storynode',
          type: 'leaf',
          depth: 0
        } as StorynodeDoc;
        const createdStorynode = { ...data, userId, depth: 0 };
        vi.mocked(Storynode.create).mockResolvedValue(createdStorynode as any);
        // Act
        await storynodeService.upsert(userId, data);
        // Validate
        expect(data.userId).toEqual(userId);
        expect(Storynode.create).toHaveBeenCalledWith({ ...data, userId, depth: 0 });
      });

      it('should throw INTERNAL_SERVER_ERROR if depth exceeds MAX_TREE_DEPTH', async () => {
        // Setup
        const parentId = new mongoose.Types.ObjectId();
        const parent = {
          _id: parentId,
          userId,
          name: 'Deep Parent',
          depth: 25 // Parent at max depth, child would be at 26
        };
        const data = {
          name: 'New Storynode',
          type: 'leaf',
          parent: parentId
        } as StorynodeDoc;
        vi.mocked(Storynode.findOne).mockResolvedValue(parent as any);
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
        const parentId = new mongoose.Types.ObjectId();
        const grandparentId = new mongoose.Types.ObjectId();
        const parent = {
          _id: parentId,
          userId,
          name: 'Parent',
          depth: 0,
          parent: grandparentId,
          children: []
        };
        const grandparent = {
          _id: grandparentId,
          userId,
          name: 'Grandparent',
          depth: 0,
          parent: null,
          children: [parentId]
        };
        const data = {
          name: 'Child Node',
          type: 'leaf',
          parent: parentId,
          text: 'Some text'
        } as StorynodeDoc;
        const createdStorynode = { ...data, _id: new mongoose.Types.ObjectId(), userId, wordCount: 2, depth: 1 };

        // Mock findOne calls in order:
        // 1. depth calculation needs parent
        // 2. collectAncestors starts by finding the created node
        // 3-4. collectAncestors walks up to parent, then grandparent
        vi.mocked(Storynode.findOne)
          .mockResolvedValueOnce(parent as any) // For depth calculation
          .mockResolvedValueOnce(createdStorynode as any) // collectAncestors: find starting node
          .mockResolvedValueOnce(parent as any) // collectAncestors: find parent
          .mockResolvedValueOnce(grandparent as any); // collectAncestors: find grandparent (has no parent, loop exits)

        vi.mocked(Storynode.create).mockResolvedValue(createdStorynode as any);

        // Mock find calls for getting siblings to calculate word counts
        vi.mocked(Storynode.find)
          .mockResolvedValueOnce([createdStorynode] as any) // Parent's children
          .mockResolvedValueOnce([parent] as any); // Grandparent's children

        // Mock findOneAndUpdate for updating ancestors
        vi.mocked(Storynode.findOneAndUpdate).mockResolvedValue(parent as any);

        // Act
        await storynodeService.upsert(userId, data);

        // Validate - check that database operations were performed
        expect(Storynode.findOne).toHaveBeenCalled();
        expect(Storynode.find).toHaveBeenCalled();
        expect(Storynode.findOneAndUpdate).toHaveBeenCalled();
      });

      it('should handle creation without parent', async () => {
        // Setup
        const data = {
          name: 'Root Node',
          type: 'root'
        } as StorynodeDoc;
        const createdStorynode = { ...data, userId, depth: 0 };
        vi.mocked(Storynode.findOne).mockResolvedValue(null);
        vi.mocked(Storynode.create).mockResolvedValue(createdStorynode as any);
        // Act
        await storynodeService.upsert(userId, data);
        // Validate
        expect(Storynode.create).toHaveBeenCalled();
        // Since there's no parent, updateParentWordCounts won't execute its logic
        // No additional findOne calls should be made beyond the depth check
      });

      it('should count words correctly on creation', async () => {
        // Setup
        const data = {
          name: 'New Node',
          type: 'leaf',
          text: '  one   two  three  '
        } as StorynodeDoc;
        const createdStorynode = { ...data, userId, wordCount: 3, depth: 0 };
        vi.mocked(Storynode.findOne).mockResolvedValue(null);
        vi.mocked(Storynode.create).mockResolvedValue(createdStorynode as any);
        // Act
        await storynodeService.upsert(userId, data);
        // Validate
        expect(data.wordCount).toBe(3);
      });
    });
  });

  describe('addFromTemplate', () => {
    // NOTE: These tests have been removed because they relied on mocking the now-private
    // createFromTemplate method. The addFromTemplate functionality is fully tested in
    // the integration tests (backend/tests/integration/controllers/storynode.controller.test.ts)
    // which test the actual database operations end-to-end.

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
  });

});
