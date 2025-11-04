import { describe, it, expect, vi, beforeEach } from 'vitest';
import { 
  recursiveUpdateWordLimits,
  recursiveUpdateParentWordCount,
  recursiveGetDescendants,
  recursiveStorynodeFromTemplate } from '../../../src/services/recursive.service';
import { StorynodeDoc } from '../../../src/schemas/mongo.schema';
import { Storynode, Template } from '../../../src/models/tree.model';
import mongoose from 'mongoose';

/* eslint-disable */ // Disabling eslint for this file as it's a test file.

// Mock the Mongoose models
vi.mock('../../../src/models/tree.model', () => ({
  Storynode: {
    create: vi.fn(),
    find: vi.fn(),
    findOne: vi.fn(),
    findOneAndUpdate: vi.fn()
  },
  Template: {
    create: vi.fn(),
    find: vi.fn(),
    findOne: vi.fn(),
    findOneAndUpdate: vi.fn()
  }
}));

// Mock environment constants
vi.mock('../../../src/constants/env', () => ({
  MAX_TREE_DEPTH: 25
}));

describe('Recursive Service', () => {

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('recursiveUpdateWordLimits', () => {
    it('should handle a storynode with no or empty children', async () => {
      // Setup
      const node = {
        _id: '123',
        children: [],
        wordLimit: 1000
      } as unknown as StorynodeDoc;
      // Act
      await recursiveUpdateWordLimits(node);
      // Validate
      expect(Storynode.find).not.toHaveBeenCalled();
      expect(Storynode.findOneAndUpdate).not.toHaveBeenCalled();
    });

    it('should update direct children word limits', async () => {
      // Setup
      const childId = 'child1';
      const parent = {
        _id: 'parent',
        children: [childId],
        wordLimit: 1000
      } as unknown as StorynodeDoc;
      const child = {
        _id: childId,
        children: [],
        wordWeight: 50,
        wordLimit: 0
      } as unknown as StorynodeDoc;
      vi.mocked(Storynode.find).mockResolvedValue([child] as any);
      vi.mocked(Storynode.findOneAndUpdate).mockResolvedValue(child as any);
      // Act
      await recursiveUpdateWordLimits(parent);
      // Validate
      expect(Storynode.find).toHaveBeenCalledWith({ _id: { $in: [childId] } });
      expect(Storynode.findOneAndUpdate).toHaveBeenCalledWith(
        { _id: childId },
        { wordLimit: 500 },
        { new: true }
      );
    });

    it('should recursively call itself to update deep nesting', async () => {
      // Setup
      const grandchildId = 'grandchild';
      const childId = 'child';
      const parent = {
        _id: 'parent',
        children: [childId],
        wordLimit: 1000
      } as unknown as StorynodeDoc;
      const child = {
        _id: childId,
        children: [grandchildId],
        wordWeight: 50,
        wordLimit: 0
      } as unknown as StorynodeDoc;
      const grandchild = {
        _id: grandchildId,
        children: [],
        wordWeight: 60,
        wordLimit: 0
      } as unknown as StorynodeDoc;
      vi.mocked(Storynode.find).mockResolvedValueOnce([child] as any);
      vi.mocked(Storynode.find).mockResolvedValueOnce([grandchild] as any);
      vi.mocked(Storynode.findOneAndUpdate).mockResolvedValue({} as any);
      // Act
      await recursiveUpdateWordLimits(parent);
      // Validate
      expect(Storynode.find).toHaveBeenCalledTimes(2);
      expect(Storynode.findOneAndUpdate).toHaveBeenCalledTimes(2);
      // Child should get 50% of 1000 = 500
      expect(Storynode.findOneAndUpdate).toHaveBeenCalledWith(
        { _id: childId },
        { wordLimit: 500 },
        { new: true }
      );
      // Grandchild should get 60% of 500 = 300
      expect(Storynode.findOneAndUpdate).toHaveBeenCalledWith(
        { _id: grandchildId },
        { wordLimit: 300 },
        { new: true }
      );
    });

    it('should calculate child limit using wordWeight percentage', async () => {
      // Setup
      const childId = 'child1';
      const parent = {
        _id: 'parent',
        children: [childId],
        wordLimit: 2000
      } as unknown as StorynodeDoc;
      const child = {
        _id: childId,
        children: [],
        wordWeight: 25,
        wordLimit: 0
      } as unknown as StorynodeDoc;
      vi.mocked(Storynode.find).mockResolvedValue([child] as any);
      vi.mocked(Storynode.findOneAndUpdate).mockResolvedValue(child as any);
      // Act
      await recursiveUpdateWordLimits(parent);
      // Validate
      expect(Storynode.findOneAndUpdate).toHaveBeenCalledWith(
        { _id: childId },
        { wordLimit: 500 }, // 2000 * 25 / 100 = 500
        { new: true }
      );
    });

    it('should inherit full parent limit when child has no wordWeight', async () => {
      // Setup
      const childId = 'child1';
      const parent = {
        _id: 'parent',
        children: [childId],
        wordLimit: 1000
      } as unknown as StorynodeDoc;
      const child = {
        _id: childId,
        children: [],
        wordLimit: 0
      } as unknown as StorynodeDoc;
      vi.mocked(Storynode.find).mockResolvedValue([child] as any);
      vi.mocked(Storynode.findOneAndUpdate).mockResolvedValue(child as any);
      // Act
      await recursiveUpdateWordLimits(parent);
      // Validate
      expect(Storynode.findOneAndUpdate).toHaveBeenCalledWith(
        { _id: childId },
        { wordLimit: 1000 }, // Inherits full parent limit
        { new: true }
      );
    });

    it('should handle multiple children with different weights', async () => {
      // Setup
      const child1Id = 'child1';
      const child2Id = 'child2';
      const child3Id = 'child3';
      const parent = {
        _id: 'parent',
        children: [child1Id, child2Id, child3Id],
        wordLimit: 1000
      } as unknown as StorynodeDoc;
      const child1 = {
        _id: child1Id,
        children: [],
        wordWeight: 50,
        wordLimit: 0
      } as unknown as StorynodeDoc;
      const child2 = {
        _id: child2Id,
        children: [],
        wordWeight: 30,
        wordLimit: 0
      } as unknown as StorynodeDoc;
      const child3 = {
        _id: child3Id,
        children: [],
        wordLimit: 0
      } as unknown as StorynodeDoc;
      vi.mocked(Storynode.find).mockResolvedValue([child1, child2, child3] as any);
      vi.mocked(Storynode.findOneAndUpdate).mockResolvedValue({} as any);
      // Act
      await recursiveUpdateWordLimits(parent);
      // Validate
      expect(Storynode.findOneAndUpdate).toHaveBeenCalledTimes(3);
      expect(Storynode.findOneAndUpdate).toHaveBeenCalledWith(
        { _id: child1Id },
        { wordLimit: 500 }, // 50%
        { new: true }
      );
      expect(Storynode.findOneAndUpdate).toHaveBeenCalledWith(
        { _id: child2Id },
        { wordLimit: 300 }, // 30%
        { new: true }
      );
      expect(Storynode.findOneAndUpdate).toHaveBeenCalledWith(
        { _id: child3Id },
        { wordLimit: 1000 }, // No weight, inherits full
        { new: true }
      );
    });

    it('should call findOneAndUpdate for each child with correct params', async () => {
      // Setup
      const childId = 'child1';
      const parent = {
        _id: 'parent',
        children: [childId],
        wordLimit: 1000
      } as unknown as StorynodeDoc;
      const child = {
        _id: childId,
        children: [],
        wordWeight: 75,
        wordLimit: 0
      } as unknown as StorynodeDoc;
      vi.mocked(Storynode.find).mockResolvedValue([child] as any);
      vi.mocked(Storynode.findOneAndUpdate).mockResolvedValue(child as any);
      // Act
      await recursiveUpdateWordLimits(parent);
      // Validate
      expect(Storynode.findOneAndUpdate).toHaveBeenCalledTimes(1);
      expect(Storynode.findOneAndUpdate).toHaveBeenCalledWith(
        { _id: childId },
        { wordLimit: 750 },
        { new: true }
      );
    });

    it('should not modify the parent node itself', async () => {
      // Setup
      const childId = 'child1';
      const originalWordLimit = 1000;
      const parent = {
        _id: 'parent',
        children: [childId],
        wordLimit: originalWordLimit
      } as unknown as StorynodeDoc;
      const child = {
        _id: childId,
        children: [],
        wordWeight: 50,
        wordLimit: 0
      } as unknown as StorynodeDoc;
      vi.mocked(Storynode.find).mockResolvedValue([child] as any);
      vi.mocked(Storynode.findOneAndUpdate).mockResolvedValue(child as any);
      // Act
      await recursiveUpdateWordLimits(parent);
      // Validate
      expect(parent.wordLimit).toBe(originalWordLimit);
      expect(Storynode.findOneAndUpdate).not.toHaveBeenCalledWith(
        { _id: parent._id },
        expect.anything(),
        expect.anything()
      );
    });

    it('should reflect the child updates in the database', async () => {
      // Setup
      const childId = 'child1';
      const parent = {
        _id: 'parent',
        children: [childId],
        wordLimit: 1000
      } as unknown as StorynodeDoc;
      const child = {
        _id: childId,
        children: [],
        wordWeight: 40,
        wordLimit: 0
      } as unknown as StorynodeDoc;
      const updatedChild = {
        ...child,
        wordLimit: 400
      };
      vi.mocked(Storynode.find).mockResolvedValue([child] as any);
      vi.mocked(Storynode.findOneAndUpdate).mockResolvedValue(updatedChild as any);
      // Act
      await recursiveUpdateWordLimits(parent);
      // Validate
      expect(Storynode.findOneAndUpdate).toHaveBeenCalledWith(
        { _id: childId },
        { wordLimit: 400 },
        { new: true }
      );
      const result = await Storynode.findOneAndUpdate({ _id: childId }, { wordLimit: 400 }, { new: true });
      expect(result).toEqual(updatedChild);
    });
  });

  describe('recursiveUpdateParentWordCount', () => {
    it('should handle a storynode with no parent', async () => {
      // Setup
      const userId = 'user123';
      const node = {
        _id: 'node1',
        wordCount: 100
      } as unknown as StorynodeDoc;
      // Act
      await recursiveUpdateParentWordCount(node, userId);
      // Validate
      expect(Storynode.findOne).not.toHaveBeenCalled();
      expect(Storynode.find).not.toHaveBeenCalled();
      expect(Storynode.findOneAndUpdate).not.toHaveBeenCalled();
    });

    it('should handle cases where Storynode.findOne returns null (parent not found)', async () => {
      // Setup
      const userId = 'user123';
      const node = {
        _id: 'node1',
        parent: 'parent1',
        wordCount: 100
      } as unknown as StorynodeDoc;
      vi.mocked(Storynode.findOne).mockResolvedValue(null);
      // Act
      await recursiveUpdateParentWordCount(node, userId);
      // Validate
      expect(Storynode.findOne).toHaveBeenCalledWith({ _id: 'parent1', userId });
      expect(Storynode.find).not.toHaveBeenCalled();
      expect(Storynode.findOneAndUpdate).not.toHaveBeenCalled();
    });

    it('should handle cases where finding the parent\'s children (siblings) returns empty array and filter by userId', async () => {
      // Setup
      const userId = 'user123';
      const parentId = 'parent1';
      const node = {
        _id: 'node1',
        parent: parentId,
        wordCount: 100
      } as unknown as StorynodeDoc;
      const parent = {
        _id: parentId,
        children: ['node1', 'node2'],
        wordCount: 200
      } as unknown as StorynodeDoc;
      vi.mocked(Storynode.findOne).mockResolvedValue(parent as any);
      vi.mocked(Storynode.find).mockResolvedValue([]);
      vi.mocked(Storynode.findOneAndUpdate).mockResolvedValue(parent as any);
      // Act
      await recursiveUpdateParentWordCount(node, userId);
      // Validate
      expect(Storynode.find).toHaveBeenCalledWith({ _id: { $in: parent.children }, userId });
      expect(Storynode.findOneAndUpdate).toHaveBeenCalledWith(
        { _id: parentId, userId },
        { wordCount: 0 }
      );
    });

    it('should not update a parent belonging to a different userId', async () => {
      // Setup
      const userId= new mongoose.Types.ObjectId();
      const differentUserId = new mongoose.Types.ObjectId();
      const node = {
        _id: 'node1',
        parent: 'parent1',
        wordCount: 100
      } as unknown as StorynodeDoc;
      vi.mocked(Storynode.findOne).mockResolvedValue(null);
      // Act
      await recursiveUpdateParentWordCount(node, userId);
      // Validate
      expect(Storynode.findOne).toHaveBeenCalledWith({ _id: 'parent1', userId });
      expect(Storynode.findOneAndUpdate).not.toHaveBeenCalled();
    });

    it('should update the parent\'s word count to be the sum of its children\'s word counts', async () => {
      // Setup
      const userId = new mongoose.Types.ObjectId();
      const parentId = 'parent1';
      const child1Id = 'child1';
      const child2Id = 'child2';
      const child3Id = 'child3';
      const node = {
        _id: child1Id,
        parent: parentId,
        wordCount: 100
      } as unknown as StorynodeDoc;
      const parent = {
        _id: parentId,
        children: [child1Id, child2Id, child3Id],
        wordCount: 0
      } as unknown as StorynodeDoc;
      const child1 = { _id: child1Id, wordCount: 100 } as unknown as StorynodeDoc;
      const child2 = { _id: child2Id, wordCount: 150 } as unknown as StorynodeDoc;
      const child3 = { _id: child3Id, wordCount: 250 } as unknown as StorynodeDoc;
      vi.mocked(Storynode.findOne).mockResolvedValue(parent as any);
      vi.mocked(Storynode.find).mockResolvedValue([child1, child2, child3] as any);
      vi.mocked(Storynode.findOneAndUpdate).mockResolvedValue(parent as any);
      // Act
      await recursiveUpdateParentWordCount(node, userId);
      // Validate
      expect(Storynode.findOneAndUpdate).toHaveBeenCalledWith(
        { _id: parentId, userId },
        { wordCount: 500 } // 100 + 150 + 250 = 500
      );
    });

    it('should update deeply nested parents/ancestors', async () => {
      // Setup
      const userId = new mongoose.Types.ObjectId();
      const grandparentId = 'grandparent';
      const parentId = 'parent';
      const childId = 'child';
      const node = {
        _id: childId,
        parent: parentId,
        wordCount: 100
      } as unknown as StorynodeDoc;
      const parent = {
        _id: parentId,
        parent: grandparentId,
        children: [childId],
        wordCount: 0
      } as unknown as StorynodeDoc;
      const grandparent = {
        _id: grandparentId,
        children: [parentId],
        wordCount: 0
      } as unknown as StorynodeDoc;
      const child = { _id: childId, wordCount: 100 } as unknown as StorynodeDoc;
      // First call: get parent
      vi.mocked(Storynode.findOne).mockResolvedValueOnce(parent as any);
      // Second call: get grandparent
      vi.mocked(Storynode.findOne).mockResolvedValueOnce(grandparent as any);
      // Third call: no more parents
      vi.mocked(Storynode.findOne).mockResolvedValueOnce(null);
      // First find: get children of parent
      vi.mocked(Storynode.find).mockResolvedValueOnce([child] as any);
      // Second find: get children of grandparent (which includes parent after update)
      vi.mocked(Storynode.find).mockResolvedValueOnce([{ ...parent, wordCount: 100 }] as any);
      vi.mocked(Storynode.findOneAndUpdate).mockResolvedValue({} as any);
      // Act
      await recursiveUpdateParentWordCount(node, userId);
      // Validate
      expect(Storynode.findOneAndUpdate).toHaveBeenCalledTimes(2);
      // Parent should be updated to child's word count
      expect(Storynode.findOneAndUpdate).toHaveBeenCalledWith(
        { _id: parentId, userId },
        { wordCount: 100 }
      );
      // Grandparent should be updated to parent's word count
      expect(Storynode.findOneAndUpdate).toHaveBeenCalledWith(
        { _id: grandparentId, userId },
        { wordCount: 100 }
      );
    });

    it('should reflect the parent updates in the database', async () => {
      // Setup
      const userId = new mongoose.Types.ObjectId();
      const parentId = 'parent';
      const child1Id = 'child1';
      const child2Id = 'child2';
      const child3Id = 'child3';
      const node = {
        _id: child1Id,
        parent: parentId,
        wordCount: 100
      } as unknown as StorynodeDoc;
      const parent = {
        _id: parentId,
        children: [child1Id, child2Id, child3Id],
        wordCount: 0
      } as unknown as StorynodeDoc;
      const updatedParent = {
        ...parent,
        wordCount: 500
      };
      const child1 = { _id: child1Id, wordCount: 100 } as unknown as StorynodeDoc;
      const child2 = { _id: child2Id, wordCount: 150 } as unknown as StorynodeDoc;
      const child3 = { _id: child3Id, wordCount: 250 } as unknown as StorynodeDoc;
      vi.mocked(Storynode.findOne).mockResolvedValue(parent as any);
      vi.mocked(Storynode.find).mockResolvedValue([child1, child2, child3] as any);
      vi.mocked(Storynode.findOneAndUpdate).mockResolvedValue(updatedParent as any);
      // Act
      await recursiveUpdateParentWordCount(node, userId);
      // Validate
      const result = await Storynode.findOneAndUpdate({ _id: parentId, userId }, { wordCount: 500 });
      expect(result).toEqual(updatedParent);
    });
  });

  describe('recursiveGetDescendants', () => {
    it('Should return an empty array for a storynode with no descendents', () => { });

    it('Should return all descendents of a given storynode', () => { });

    it('Should include deeply nested descendents', () => { });

    it('Should work correctly with the Template model', () => { });

    it('Should work correctly with the Storynode model', () => { });
  });

  describe('recursiveGetTreeDepth', () => {
    it('should return 0 for a root node (no parent)', async () => { });

    it('should return 1 for a direct child of root', async () => { });

    it('should return correct depth for deeply nested nodes', async () => { });

    it('should filter by userId when finding parents', async () => { });

    it('should handle cases where parent is not found (returns null)', async () => { });

    it('should throw an error when depth exceeds MAX_TREE_DEPTH', async () => { });

    it('should work correctly with the Template model', async () => { });

    it('should work correctly with the Storynode model', async () => { });
  });

  describe('recursiveStorynodeFromTemplate', () => {
    it('should create a storynode from a simple (leaf) template', async () => { });

    it('should create a storynode from a template with a single child', async () => { });

    it('should create a storynode tree from a template with multiple descendents', async () => { });

    it('should create a storynode with a given parentId', async () => { });

    it('should reflect the new storynodes in the database', async () => { });

    it('should assign the correct userId to all created storynodes', async () => { });

    it('should handle the case where a template is not found', async () => { });

    it('should handle the case where a template is invalid', async () => { });

    it('should handle a template assigned to a different user', async () => { });

    it('should handle null, undefined, or not-found children', async () => { });

    it('should handle a storynode-not-found error after creation', async () => { });

    it('should verify that the created storynodes have correct properties copied from the template', async () => { });
  });

});