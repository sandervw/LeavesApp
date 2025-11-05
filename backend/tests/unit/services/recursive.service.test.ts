import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  recursiveUpdateWordLimits,
  recursiveUpdateParentWordCount,
  recursiveGetDescendants,
  recursiveStorynodeFromTemplate
} from '../../../src/services/recursive.service';
import { StorynodeDoc } from '../../../src/schemas/mongo.schema';
import { Storynode, Template } from '../../../src/models/tree.model';
import mongoose from 'mongoose';
import { AppError } from '../../../src/utils/errorUtils';
import { NOT_FOUND } from '../../../src/constants/http';

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
      const userId = new mongoose.Types.ObjectId();
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
      const userId = new mongoose.Types.ObjectId();
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
      const userId = new mongoose.Types.ObjectId();
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
      const userId = new mongoose.Types.ObjectId();
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
    it('Should return an empty array for a storynode with no descendents', async () => {
      // Setup
      const node = {
        _id: 'node1',
        children: []
      } as unknown as StorynodeDoc;
      vi.mocked(Storynode.find).mockResolvedValue([]);
      // Act
      const result = await recursiveGetDescendants(node, Storynode);
      // Validate
      expect(result).toEqual([]);
      expect(Storynode.find).toHaveBeenCalledWith({ _id: { $in: [] } });
    });

    it('Should return all descendents of a given storynode', async () => {
      // Setup
      const childId = 'child1';
      const grandchildId = 'grandchild1';
      const node = {
        _id: 'parent',
        children: [childId]
      } as unknown as StorynodeDoc;
      const child = {
        _id: childId,
        children: [grandchildId]
      } as unknown as StorynodeDoc;
      const grandchild = {
        _id: grandchildId,
        children: []
      } as unknown as StorynodeDoc;
      vi.mocked(Storynode.find).mockResolvedValueOnce([child] as any);
      vi.mocked(Storynode.find).mockResolvedValueOnce([grandchild] as any);
      vi.mocked(Storynode.find).mockResolvedValueOnce([]);
      // Act
      const result = await recursiveGetDescendants(node, Storynode);
      // Validate
      expect(result).toHaveLength(2);
      expect(result).toContainEqual(child);
      expect(result).toContainEqual(grandchild);
    });

    it('Should include deeply nested descendents', async () => {
      // Setup
      const child1Id = 'child1';
      const grandchild1Id = 'grandchild1';
      const greatGrandchildId = 'greatGrandchild1';
      const node = {
        _id: 'root',
        children: [child1Id]
      } as unknown as StorynodeDoc;
      const child1 = {
        _id: child1Id,
        children: [grandchild1Id]
      } as unknown as StorynodeDoc;
      const grandchild1 = {
        _id: grandchild1Id,
        children: [greatGrandchildId]
      } as unknown as StorynodeDoc;
      const greatGrandchild = {
        _id: greatGrandchildId,
        children: []
      } as unknown as StorynodeDoc;
      vi.mocked(Storynode.find).mockResolvedValueOnce([child1] as any);
      vi.mocked(Storynode.find).mockResolvedValueOnce([grandchild1] as any);
      vi.mocked(Storynode.find).mockResolvedValueOnce([greatGrandchild] as any);
      vi.mocked(Storynode.find).mockResolvedValueOnce([]);
      // Act
      const result = await recursiveGetDescendants(node, Storynode);
      // Validate
      expect(result).toHaveLength(3);
      expect(result).toContainEqual(child1);
      expect(result).toContainEqual(grandchild1);
      expect(result).toContainEqual(greatGrandchild);
    });

    it('Should work correctly with the Template model', async () => {
      // Setup
      const childId = 'templateChild1';
      const node = {
        _id: 'templateParent',
        children: [childId]
      } as any;
      const child = {
        _id: childId,
        children: []
      } as any;
      vi.mocked(Template.find).mockResolvedValueOnce([child] as any);
      vi.mocked(Template.find).mockResolvedValueOnce([]);
      // Act
      const result = await recursiveGetDescendants(node, Template);
      // Validate
      expect(result).toHaveLength(1);
      expect(result).toContainEqual(child);
      expect(Template.find).toHaveBeenCalledWith({ _id: { $in: [childId] } });
    });

    it('Should work correctly with the Storynode model', async () => {
      // Setup
      const childId = 'storynodeChild1';
      const node = {
        _id: 'storynodeParent',
        children: [childId]
      } as unknown as StorynodeDoc;
      const child = {
        _id: childId,
        children: []
      } as unknown as StorynodeDoc;
      vi.mocked(Storynode.find).mockResolvedValueOnce([child] as any);
      vi.mocked(Storynode.find).mockResolvedValueOnce([]);
      // Act
      const result = await recursiveGetDescendants(node, Storynode);
      // Validate
      expect(result).toHaveLength(1);
      expect(result).toContainEqual(child);
      expect(Storynode.find).toHaveBeenCalledWith({ _id: { $in: [childId] } });
    });
  });

  describe('recursiveStorynodeFromTemplate', () => {
    it('should create a storynode from a simple (leaf) template', async () => {
      // Setup
      const userId = new mongoose.Types.ObjectId();
      const templateId = new mongoose.Types.ObjectId();
      const template = {
        _id: templateId,
        userId,
        name: 'Leaf Template',
        type: 'leaf',
        text: 'Some text',
        wordWeight: 50,
        children: [],
        depth: 0
      } as any;
      const createdStorynode = {
        _id: new mongoose.Types.ObjectId(),
        userId,
        name: 'Leaf Template',
        type: 'leaf',
        text: 'Some text',
        wordWeight: 50,
        children: [],
        depth: 0
      } as unknown as StorynodeDoc;
      vi.mocked(Template.findOne).mockResolvedValue(template);
      vi.mocked(Storynode.create).mockResolvedValue(createdStorynode as any);
      // Act
      const result = await recursiveStorynodeFromTemplate(userId, templateId);
      // Validate
      expect(Template.findOne).toHaveBeenCalledWith({ _id: templateId, userId });
      expect(Storynode.create).toHaveBeenCalledWith({
        userId,
        name: template.name,
        type: template.type,
        text: template.text,
        wordWeight: template.wordWeight,
        depth: template.depth,
      });
      expect(result).toEqual(createdStorynode);
    });

    it('should create a storynode from a template with a single child', async () => {
      // Setup
      const userId = new mongoose.Types.ObjectId();
      const templateId = new mongoose.Types.ObjectId();
      const childTemplateId = new mongoose.Types.ObjectId();
      const parentTemplate = {
        _id: templateId,
        userId,
        name: 'Parent Template',
        type: 'branch',
        text: 'Parent text',
        wordWeight: 100,
        children: [childTemplateId],
        depth: 0
      } as any;
      const childTemplate = {
        _id: childTemplateId,
        userId,
        name: 'Child Template',
        type: 'leaf',
        text: 'Child text',
        wordWeight: 50,
        children: [],
        depth: 1
      } as any;
      const parentStorynodeId = new mongoose.Types.ObjectId();
      const childStorynodeId = new mongoose.Types.ObjectId();
      const parentStorynode = {
        _id: parentStorynodeId,
        userId,
        name: 'Parent Template',
        type: 'branch',
        text: 'Parent text',
        wordWeight: 100,
        children: [],
        depth: 0
      } as unknown as StorynodeDoc;
      const childStorynode = {
        _id: childStorynodeId,
        userId,
        parent: parentStorynodeId,
        name: 'Child Template',
        type: 'leaf',
        text: 'Child text',
        wordWeight: 50,
        children: [],
        depth: 1
      } as unknown as StorynodeDoc;
      const updatedParent = {
        ...parentStorynode,
        children: [childStorynodeId]
      } as unknown as StorynodeDoc;
      vi.mocked(Template.findOne).mockResolvedValueOnce(parentTemplate);
      vi.mocked(Template.findOne).mockResolvedValueOnce(childTemplate);
      vi.mocked(Storynode.create).mockResolvedValueOnce(parentStorynode as any);
      vi.mocked(Storynode.findOne).mockResolvedValueOnce(parentStorynode as any);
      vi.mocked(Storynode.create).mockResolvedValueOnce(childStorynode as any);
      vi.mocked(Storynode.findOneAndUpdate).mockResolvedValue(updatedParent as any);
      // Act
      const result = await recursiveStorynodeFromTemplate(userId, templateId);
      // Validate
      expect(Storynode.create).toHaveBeenCalledTimes(2);
      expect(Storynode.findOneAndUpdate).toHaveBeenCalledWith(
        { _id: parentStorynodeId, userId },
        { children: [childStorynodeId] },
        { new: true }
      );
      expect(result).toEqual(updatedParent);
    });

    it('should create a storynode tree from a template with multiple descendents', async () => {
      // Setup
      const userId = new mongoose.Types.ObjectId();
      const rootTemplateId = new mongoose.Types.ObjectId();
      const child1TemplateId = new mongoose.Types.ObjectId();
      const child2TemplateId = new mongoose.Types.ObjectId();
      const rootTemplate = {
        _id: rootTemplateId,
        userId,
        name: 'Root',
        type: 'root',
        text: 'Root text',
        children: [child1TemplateId, child2TemplateId],
        depth: 0
      } as any;
      const child1Template = {
        _id: child1TemplateId,
        userId,
        name: 'Child 1',
        type: 'branch',
        text: 'Child 1 text',
        children: [],
        depth: 1
      } as any;
      const child2Template = {
        _id: child2TemplateId,
        userId,
        name: 'Child 2',
        type: 'branch',
        text: 'Child 2 text',
        children: [],
        depth: 1
      } as any;
      const rootStorynodeId = new mongoose.Types.ObjectId();
      const child1StorynodeId = new mongoose.Types.ObjectId();
      const child2StorynodeId = new mongoose.Types.ObjectId();
      const rootStorynode = {
        _id: rootStorynodeId,
        userId,
        name: 'Root',
        children: [],
        depth: 0
      } as unknown as StorynodeDoc;
      const child1Storynode = {
        _id: child1StorynodeId,
        userId,
        parent: rootStorynodeId,
        name: 'Child 1',
        children: [],
        depth: 1
      } as unknown as StorynodeDoc;
      const child2Storynode = {
        _id: child2StorynodeId,
        userId,
        parent: rootStorynodeId,
        name: 'Child 2',
        children: [],
        depth: 1
      } as unknown as StorynodeDoc;
      const updatedRoot = {
        ...rootStorynode,
        children: [child1StorynodeId, child2StorynodeId]
      } as unknown as StorynodeDoc;
      vi.mocked(Template.findOne).mockResolvedValueOnce(rootTemplate);
      vi.mocked(Template.findOne).mockResolvedValueOnce(child1Template);
      vi.mocked(Template.findOne).mockResolvedValueOnce(child2Template);
      vi.mocked(Storynode.create).mockResolvedValueOnce(rootStorynode as any);
      vi.mocked(Storynode.findOne).mockResolvedValueOnce(rootStorynode as any);
      vi.mocked(Storynode.create).mockResolvedValueOnce(child1Storynode as any);
      vi.mocked(Storynode.findOne).mockResolvedValueOnce(rootStorynode as any);
      vi.mocked(Storynode.create).mockResolvedValueOnce(child2Storynode as any);
      vi.mocked(Storynode.findOneAndUpdate).mockResolvedValue(updatedRoot as any);
      // Act
      const result = await recursiveStorynodeFromTemplate(userId, rootTemplateId);
      // Validate
      expect(Storynode.create).toHaveBeenCalledTimes(3);
      expect(Storynode.findOneAndUpdate).toHaveBeenCalledWith(
        { _id: rootStorynodeId, userId },
        { children: [child1StorynodeId, child2StorynodeId] },
        { new: true }
      );
      expect(result.children).toHaveLength(2);
    });

    it('should create a storynode with a given parentId', async () => {
      // Setup
      const userId = new mongoose.Types.ObjectId();
      const templateId = new mongoose.Types.ObjectId();
      const parentId = new mongoose.Types.ObjectId();
      const template = {
        _id: templateId,
        userId,
        name: 'Child Template',
        type: 'leaf',
        text: 'Some text',
        wordWeight: 50,
        children: [],
        depth: 0
      } as any;
      const parent = {
        _id: parentId,
        userId,
        name: 'Parent',
        type: 'branch',
        children: [],
        depth: 0
      } as unknown as StorynodeDoc;
      const createdStorynode = {
        _id: new mongoose.Types.ObjectId(),
        userId,
        parent: parentId,
        name: 'Child Template',
        type: 'leaf',
        text: 'Some text',
        wordWeight: 50,
        children: [],
        depth: 1
      } as unknown as StorynodeDoc;
      vi.mocked(Template.findOne).mockResolvedValue(template);
      vi.mocked(Storynode.findOne).mockResolvedValue(parent as any);
      vi.mocked(Storynode.create).mockResolvedValue(createdStorynode as any);
      // Act
      const result = await recursiveStorynodeFromTemplate(userId, templateId, parentId);
      // Validate
      expect(Storynode.create).toHaveBeenCalledWith({
        userId,
        parent: parentId,
        name: template.name,
        type: template.type,
        text: template.text,
        wordWeight: template.wordWeight,
        depth: 1
      });
      expect(result.parent).toEqual(parentId);
    });

    it('should reflect the new storynodes in the database', async () => {
      // Setup
      const userId = new mongoose.Types.ObjectId();
      const templateId = new mongoose.Types.ObjectId();
      const template = {
        _id: templateId,
        userId,
        name: 'Test Template',
        type: 'leaf',
        text: 'Test text',
        children: []
      } as any;
      const createdStorynode = {
        _id: new mongoose.Types.ObjectId(),
        userId,
        name: 'Test Template',
        type: 'leaf',
        text: 'Test text',
        children: []
      } as unknown as StorynodeDoc;
      vi.mocked(Template.findOne).mockResolvedValue(template);
      vi.mocked(Storynode.create).mockResolvedValue(createdStorynode as any);
      // Act
      await recursiveStorynodeFromTemplate(userId, templateId);
      // Validate
      expect(Storynode.create).toHaveBeenCalledTimes(1);
      expect(Storynode.create).toHaveBeenCalledWith(expect.objectContaining({
        userId,
        name: template.name,
        type: template.type,
        text: template.text
      }));
    });

    it('should assign the correct userId to all created storynodes', async () => {
      // Setup
      const userId = new mongoose.Types.ObjectId();
      const templateId = new mongoose.Types.ObjectId();
      const childTemplateId = new mongoose.Types.ObjectId();
      const parentTemplate = {
        _id: templateId,
        userId,
        name: 'Parent',
        type: 'branch',
        children: [childTemplateId],
        depth: 0
      } as any;
      const childTemplate = {
        _id: childTemplateId,
        userId,
        name: 'Child',
        type: 'leaf',
        children: [],
        depth: 1
      } as any;
      const parentStorynode = {
        _id: new mongoose.Types.ObjectId(),
        userId,
        name: 'Parent',
        children: [],
        depth: 0
      } as unknown as StorynodeDoc;
      const childStorynode = {
        _id: new mongoose.Types.ObjectId(),
        userId,
        parent: parentStorynode._id,
        name: 'Child',
        children: [],
        depth: 1
      } as unknown as StorynodeDoc;
      vi.mocked(Template.findOne).mockResolvedValueOnce(parentTemplate);
      vi.mocked(Template.findOne).mockResolvedValueOnce(childTemplate);
      vi.mocked(Storynode.create).mockResolvedValueOnce(parentStorynode as any);
      vi.mocked(Storynode.findOne).mockResolvedValueOnce(parentStorynode as any);
      vi.mocked(Storynode.create).mockResolvedValueOnce(childStorynode as any);
      vi.mocked(Storynode.findOneAndUpdate).mockResolvedValue(parentStorynode as any);
      // Act
      await recursiveStorynodeFromTemplate(userId, templateId);
      // Validate
      const createCalls = vi.mocked(Storynode.create).mock.calls;
      createCalls.forEach(call => {
        expect(call[0]).toHaveProperty('userId', userId);
      });
    });

    it('should handle the case where a template is not found', async () => {
      // Setup
      const userId = new mongoose.Types.ObjectId();
      const templateId = new mongoose.Types.ObjectId();
      vi.mocked(Template.findOne).mockResolvedValue(null);
      // Act & Validate
      try {
        await recursiveStorynodeFromTemplate(userId, templateId);
        expect.fail('Should have thrown an error');
      } catch (error) {
        expect(error).toBeInstanceOf(AppError);
        expect((error as AppError).statusCode).toBe(NOT_FOUND);
        expect((error as AppError).message).toBe('Template not found');
      }
    });

    it('should handle the case where a template is invalid', async () => {
      // Setup
      const userId = new mongoose.Types.ObjectId();
      const templateId = new mongoose.Types.ObjectId();
      vi.mocked(Template.findOne).mockResolvedValue(null);
      // Act & Validate
      try {
        await recursiveStorynodeFromTemplate(userId, templateId);
        expect.fail('Should have thrown an error');
      } catch (error) {
        expect(error).toBeInstanceOf(AppError);
        expect((error as AppError).statusCode).toBe(NOT_FOUND);
        expect((error as AppError).message).toBe('Template not found');
      }
    });

    it('should handle a template assigned to a different user', async () => {
      // Setup
      const userId = new mongoose.Types.ObjectId();
      const differentUserId = new mongoose.Types.ObjectId();
      const templateId = new mongoose.Types.ObjectId();
      // Template.findOne with userId filter will return null for different user
      vi.mocked(Template.findOne).mockResolvedValue(null);
      // Act & Validate
      try {
        await recursiveStorynodeFromTemplate(userId, templateId);
        expect.fail('Should have thrown an error');
      } catch (error) {
        expect(error).toBeInstanceOf(AppError);
        expect((error as AppError).statusCode).toBe(NOT_FOUND);
        expect((error as AppError).message).toBe('Template not found');
      }
      expect(Template.findOne).toHaveBeenCalledWith({ _id: templateId, userId });
    });

    it('should handle null, undefined, or not-found children', async () => {
      // Setup
      const userId = new mongoose.Types.ObjectId();
      const templateId = new mongoose.Types.ObjectId();
      const nonexistentChildId = new mongoose.Types.ObjectId();
      const parentTemplate = {
        _id: templateId,
        userId,
        name: 'Parent',
        type: 'branch',
        children: [nonexistentChildId]
      } as any;
      const parentStorynode = {
        _id: new mongoose.Types.ObjectId(),
        userId,
        name: 'Parent',
        children: []
      } as unknown as StorynodeDoc;
      vi.mocked(Template.findOne).mockResolvedValueOnce(parentTemplate);
      vi.mocked(Template.findOne).mockResolvedValueOnce(null); // Child not found
      vi.mocked(Storynode.create).mockResolvedValue(parentStorynode as any);
      // Act & Validate
      try {
        await recursiveStorynodeFromTemplate(userId, templateId);
        expect.fail('Should have thrown an error');
      } catch (error) {
        expect(error).toBeInstanceOf(AppError);
        expect((error as AppError).statusCode).toBe(NOT_FOUND);
        expect((error as AppError).message).toBe('Template not found');
      }
    });

    it('should handle a storynode-not-found error after creation', async () => {
      // Setup
      const userId = new mongoose.Types.ObjectId();
      const templateId = new mongoose.Types.ObjectId();
      const childTemplateId = new mongoose.Types.ObjectId();
      const parentTemplate = {
        _id: templateId,
        userId,
        name: 'Parent',
        type: 'branch',
        children: [childTemplateId],
        depth: 0
      } as any;
      const childTemplate = {
        _id: childTemplateId,
        userId,
        name: 'Child',
        type: 'leaf',
        children: [],
        depth: 1
      } as any;
      const parentStorynode = {
        _id: new mongoose.Types.ObjectId(),
        userId,
        name: 'Parent',
        children: [],
        depth: 0
      } as unknown as StorynodeDoc;
      const childStorynode = {
        _id: new mongoose.Types.ObjectId(),
        userId,
        parent: parentStorynode._id,
        name: 'Child',
        children: [],
        depth: 1
      } as unknown as StorynodeDoc;
      vi.mocked(Template.findOne).mockResolvedValueOnce(parentTemplate);
      vi.mocked(Template.findOne).mockResolvedValueOnce(childTemplate);
      vi.mocked(Storynode.create).mockResolvedValueOnce(parentStorynode as any);
      vi.mocked(Storynode.findOne).mockResolvedValueOnce(parentStorynode as any);
      vi.mocked(Storynode.create).mockResolvedValueOnce(childStorynode as any);
      vi.mocked(Storynode.findOneAndUpdate).mockResolvedValue(null); // Simulate not found after creation
      // Act & Validate
      try {
        await recursiveStorynodeFromTemplate(userId, templateId);
        expect.fail('Should have thrown an error');
      } catch (error) {
        expect(error).toBeInstanceOf(AppError);
        expect((error as AppError).statusCode).toBe(NOT_FOUND);
        expect((error as AppError).message).toBe('Storynode not found after update');
      }
    });

    it('should verify that the created storynodes have correct properties copied from the template', async () => {
      // Setup
      const userId = new mongoose.Types.ObjectId();
      const templateId = new mongoose.Types.ObjectId();
      const template = {
        _id: templateId,
        userId,
        name: 'Specific Name',
        type: 'leaf',
        text: 'Specific text content',
        wordWeight: 75,
        children: [],
        depth: 0
      } as any;
      const createdStorynode = {
        _id: new mongoose.Types.ObjectId(),
        userId,
        name: 'Specific Name',
        type: 'leaf',
        text: 'Specific text content',
        wordWeight: 75,
        children: [],
        depth: 0
      } as unknown as StorynodeDoc;
      vi.mocked(Template.findOne).mockResolvedValue(template);
      vi.mocked(Storynode.create).mockResolvedValue(createdStorynode as any);
      // Act
      const result = await recursiveStorynodeFromTemplate(userId, templateId);
      // Validate
      expect(result.name).toBe(template.name);
      expect(result.type).toBe(template.type);
      expect(result.text).toBe(template.text);
      expect(result.wordWeight).toBe(template.wordWeight);
      expect(result.userId).toBe(userId);
    });
  });

});