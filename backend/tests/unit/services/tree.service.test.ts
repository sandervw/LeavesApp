import { describe, it, expect, vi, beforeEach } from 'vitest';
import TreeService from '../../../src/services/tree.service';
import { TreeDoc } from '../../../src/schemas/mongo.schema';
import mongoose from 'mongoose';
import { AppError } from '../../../src/utils/errorUtils';
import { NOT_FOUND, INTERNAL_SERVER_ERROR } from '../../../src/constants/http';

/* eslint-disable */ // Disabling eslint for this file as it's a test file.

// Mock recursive service
vi.mock('../../../src/services/recursive.service', () => ({
  recursiveGetDescendants: vi.fn(),
  recursiveGetTreeDepth: vi.fn()
}));

// Mock environment constants
vi.mock('../../../src/constants/env', () => ({
  MAX_TREE_DEPTH: 25
}));

describe('Tree Service', () => {

  let mockModel: any;
  let treeService: TreeService<TreeDoc>;
  let userId: mongoose.Types.ObjectId;

  beforeEach(() => {
    vi.clearAllMocks();
    userId = new mongoose.Types.ObjectId();

    // Create mock model with all necessary methods
    mockModel = {
      find: vi.fn(),
      findOne: vi.fn(),
      findOneAndUpdate: vi.fn(),
      findByIdAndDelete: vi.fn(),
      create: vi.fn(),
      deleteMany: vi.fn()
    };

    treeService = new TreeService(mockModel);
  });

  describe('find', () => {
    it('should return all elements for a user', async () => {
      // Setup
      const elements = [
        { _id: 'elem1', userId, name: 'Element 1' },
        { _id: 'elem2', userId, name: 'Element 2' }
      ];
      mockModel.find.mockReturnValue({
        sort: vi.fn().mockResolvedValue(elements)
      });
      // Act
      const result = await treeService.find(userId);
      // Validate
      expect(mockModel.find).toHaveBeenCalledWith({ userId });
      expect(result).toEqual(elements);
    });

    it('should return elements matching optional query parameter', async () => {
      // Setup
      const query = { type: 'leaf' };
      const elements = [{ _id: 'elem1', userId, name: 'Leaf Element', type: 'leaf' }];
      mockModel.find.mockReturnValue({
        sort: vi.fn().mockResolvedValue(elements)
      });
      // Act
      const result = await treeService.find(userId, query);
      // Validate
      expect(mockModel.find).toHaveBeenCalledWith({ userId, ...query });
      expect(result).toEqual(elements);
    });

    it('should sort results by createdAt in descending order', async () => {
      // Setup
      const elements = [
        { _id: 'elem1', userId, createdAt: new Date('2024-01-02') },
        { _id: 'elem2', userId, createdAt: new Date('2024-01-01') }
      ];
      const sortMock = vi.fn().mockResolvedValue(elements);
      mockModel.find.mockReturnValue({ sort: sortMock });
      // Act
      await treeService.find(userId);
      // Validate
      expect(sortMock).toHaveBeenCalledWith({ createdAt: -1 });
    });

    it('should filter by userId', async () => {
      // Setup
      const elements = [{ _id: 'elem1', userId }];
      mockModel.find.mockReturnValue({
        sort: vi.fn().mockResolvedValue(elements)
      });
      // Act
      await treeService.find(userId);
      // Validate
      expect(mockModel.find).toHaveBeenCalledWith({ userId });
    });

    it('should throw NOT_FOUND error if no elements found', async () => {
      // Setup
      mockModel.find.mockReturnValue({
        sort: vi.fn().mockResolvedValue(null)
      });
      // Act & Validate
      try {
        await treeService.find(userId);
        expect.fail('Should have thrown an error');
      } catch (error) {
        expect(error).toBeInstanceOf(AppError);
        expect((error as AppError).statusCode).toBe(NOT_FOUND);
        expect((error as AppError).message).toBe('No elements found');
      }
    });
  });

  describe('findById', () => {
    it('should return a single element by ID', async () => {
      // Setup
      const elementId = new mongoose.Types.ObjectId();
      const element = { _id: elementId, userId, name: 'Test Element' };
      mockModel.findOne.mockResolvedValue(element);
      // Act
      const result = await treeService.findById(userId, elementId);
      // Validate
      expect(mockModel.findOne).toHaveBeenCalledWith({ _id: elementId, userId });
      expect(result).toEqual(element);
    });

    it('should filter by userId', async () => {
      // Setup
      const elementId = new mongoose.Types.ObjectId();
      const element = { _id: elementId, userId, name: 'Test Element' };
      mockModel.findOne.mockResolvedValue(element);
      // Act
      await treeService.findById(userId, elementId);
      // Validate
      expect(mockModel.findOne).toHaveBeenCalledWith({ _id: elementId, userId });
    });

    it('should throw NOT_FOUND error if element not found', async () => {
      // Setup
      const elementId = new mongoose.Types.ObjectId();
      mockModel.findOne.mockResolvedValue(null);
      // Act & Validate
      try {
        await treeService.findById(userId, elementId);
        expect.fail('Should have thrown an error');
      } catch (error) {
        expect(error).toBeInstanceOf(AppError);
        expect((error as AppError).statusCode).toBe(NOT_FOUND);
        expect((error as AppError).message).toBe('No such object exists');
      }
    });

    it('should throw NOT_FOUND error if element belongs to different user', async () => {
      // Setup
      const elementId = new mongoose.Types.ObjectId();
      const differentUserId = new mongoose.Types.ObjectId();
      mockModel.findOne.mockResolvedValue(null);
      // Act & Validate
      try {
        await treeService.findById(userId, elementId);
        expect.fail('Should have thrown an error');
      } catch (error) {
        expect(error).toBeInstanceOf(AppError);
        expect((error as AppError).statusCode).toBe(NOT_FOUND);
        expect((error as AppError).message).toBe('No such object exists');
      }
      expect(mockModel.findOne).toHaveBeenCalledWith({ _id: elementId, userId });
    });
  });

  describe('findChildren', () => {
    it('should return all children of a parent element', async () => {
      // Setup
      const parentId = new mongoose.Types.ObjectId();
      const child1Id = new mongoose.Types.ObjectId();
      const child2Id = new mongoose.Types.ObjectId();
      const parent = {
        _id: parentId,
        userId,
        children: [child1Id, child2Id]
      };
      const children = [
        { _id: child1Id, userId, name: 'Child 1' },
        { _id: child2Id, userId, name: 'Child 2' }
      ];
      mockModel.findOne.mockResolvedValue(parent);
      mockModel.find.mockResolvedValue(children);
      // Act
      const result = await treeService.findChildren(userId, parentId);
      // Validate
      expect(mockModel.findOne).toHaveBeenCalledWith({ _id: parentId, userId });
      expect(mockModel.find).toHaveBeenCalledWith({ _id: { $in: parent.children }, userId });
      expect(result).toEqual(children);
    });

    it('should filter children by userId', async () => {
      // Setup
      const parentId = new mongoose.Types.ObjectId();
      const childId = new mongoose.Types.ObjectId();
      const parent = {
        _id: parentId,
        userId,
        children: [childId]
      };
      const children = [{ _id: childId, userId, name: 'Child' }];
      mockModel.findOne.mockResolvedValue(parent);
      mockModel.find.mockResolvedValue(children);
      // Act
      await treeService.findChildren(userId, parentId);
      // Validate
      expect(mockModel.find).toHaveBeenCalledWith({ _id: { $in: parent.children }, userId });
    });

    it('should throw NOT_FOUND error if parent not found', async () => {
      // Setup
      const parentId = new mongoose.Types.ObjectId();
      mockModel.findOne.mockResolvedValue(null);
      // Act & Validate
      try {
        await treeService.findChildren(userId, parentId);
        expect.fail('Should have thrown an error');
      } catch (error) {
        expect(error).toBeInstanceOf(AppError);
        expect((error as AppError).statusCode).toBe(NOT_FOUND);
        expect((error as AppError).message).toBe('Parent element not found');
      }
    });

    it('should throw NOT_FOUND error if no children found', async () => {
      // Setup
      const parentId = new mongoose.Types.ObjectId();
      const parent = {
        _id: parentId,
        userId,
        children: [new mongoose.Types.ObjectId()]
      };
      mockModel.findOne.mockResolvedValue(parent);
      mockModel.find.mockResolvedValue(null);
      // Act & Validate
      try {
        await treeService.findChildren(userId, parentId);
        expect.fail('Should have thrown an error');
      } catch (error) {
        expect(error).toBeInstanceOf(AppError);
        expect((error as AppError).statusCode).toBe(NOT_FOUND);
        expect((error as AppError).message).toBe('No children found');
      }
    });

    it('should handle empty children array', async () => {
      // Setup
      const parentId = new mongoose.Types.ObjectId();
      const parent = {
        _id: parentId,
        userId,
        children: []
      };
      mockModel.findOne.mockResolvedValue(parent);
      mockModel.find.mockResolvedValue(null);
      // Act & Validate
      try {
        await treeService.findChildren(userId, parentId);
        expect.fail('Should have thrown an error');
      } catch (error) {
        expect(error).toBeInstanceOf(AppError);
        expect((error as AppError).statusCode).toBe(NOT_FOUND);
        expect((error as AppError).message).toBe('No children found');
      }
    });
  });

  describe('upsert', () => {
    it('should create a new element when _id is not provided', async () => {
      // Setup
      const { recursiveGetTreeDepth } = await import('../../../src/services/recursive.service');
      const data = {
        name: 'New Element',
        type: 'leaf',
        text: 'Some text'
      } as TreeDoc;
      const createdElement = {
        ...data
      };
      vi.mocked(recursiveGetTreeDepth).mockResolvedValue(5);
      mockModel.create.mockResolvedValue(createdElement);
      // Act
      const result = await treeService.upsert(userId, data);
      // Validate
      expect(recursiveGetTreeDepth).toHaveBeenCalledWith(data, mockModel, userId);
      expect(mockModel.create).toHaveBeenCalledWith({ ...data, userId });
      expect(result).toEqual(createdElement);
    });

    it('should update existing element when _id is provided', async () => {
      // Setup
      const elementId = new mongoose.Types.ObjectId();
      const data = {
        _id: elementId,
        name: 'Updated Element',
        type: 'branch',
        children: [new mongoose.Types.ObjectId()]
      } as TreeDoc;
      const updatedElement = { ...data, userId };
      mockModel.findOneAndUpdate.mockResolvedValue(updatedElement);
      // Act
      const result = await treeService.upsert(userId, data);
      // Validate
      expect(mockModel.findOneAndUpdate).toHaveBeenCalledWith(
        { _id: elementId, userId },
        { $set: data },
        { new: true }
      );
      expect(result).toEqual(updatedElement);
    });

    it('should ensure userId is set on create', async () => {
      // Setup
      const { recursiveGetTreeDepth } = await import('../../../src/services/recursive.service');
      const data = {
        name: 'New Element',
        type: 'leaf'
      } as TreeDoc;
      const createdElement = { ...data };
      vi.mocked(recursiveGetTreeDepth).mockResolvedValue(5);
      mockModel.create.mockResolvedValue(createdElement);
      // Act
      await treeService.upsert(userId, data);
      // Validate
      expect(data.userId).toEqual(userId);
      expect(mockModel.create).toHaveBeenCalledWith({ ...data, userId });
    });

    it('should filter null values from children array before update', async () => {
      // Setup
      const elementId = new mongoose.Types.ObjectId();
      const childId = new mongoose.Types.ObjectId();
      const data = {
        _id: elementId,
        name: 'Element',
        children: [childId, null, undefined]
      } as any;
      const updatedElement = { ...data, userId, children: [childId] };
      mockModel.findOneAndUpdate.mockResolvedValue(updatedElement);
      // Act
      await treeService.upsert(userId, data);
      // Validate
      expect(data.children).toEqual([childId]);
      expect(mockModel.findOneAndUpdate).toHaveBeenCalledWith(
        { _id: elementId, userId },
        { $set: data },
        { new: true }
      );
    });

    it('should check tree depth before creating new element', async () => {
      // Setup
      const { recursiveGetTreeDepth } = await import('../../../src/services/recursive.service');
      const data = {
        name: 'New Element',
        type: 'leaf',
        parent: new mongoose.Types.ObjectId()
      } as TreeDoc;
      const createdElement = { ...data };
      vi.mocked(recursiveGetTreeDepth).mockResolvedValue(10);
      mockModel.create.mockResolvedValue(createdElement);
      // Act
      await treeService.upsert(userId, data);
      // Validate
      expect(recursiveGetTreeDepth).toHaveBeenCalledWith(data, mockModel, userId);
    });

    it('should throw INTERNAL_SERVER_ERROR if tree depth exceeds MAX_TREE_DEPTH', async () => {
      // Setup
      const { recursiveGetTreeDepth } = await import('../../../src/services/recursive.service');
      const data = {
        name: 'New Element',
        type: 'leaf'
      } as TreeDoc;
      vi.mocked(recursiveGetTreeDepth).mockResolvedValue(26);
      // Act & Validate
      try {
        await treeService.upsert(userId, data);
        expect.fail('Should have thrown an error');
      } catch (error) {
        expect(error).toBeInstanceOf(AppError);
        expect((error as AppError).statusCode).toBe(INTERNAL_SERVER_ERROR);
        expect((error as AppError).message).toContain('Maximum tree depth exceeded');
        expect((error as AppError).message).toContain('limit: 25');
      }
    });

    it('should throw NOT_FOUND error if element to update not found', async () => {
      // Setup
      const elementId = new mongoose.Types.ObjectId();
      const data = {
        _id: elementId,
        name: 'Updated Element'
      } as TreeDoc;
      mockModel.findOneAndUpdate.mockResolvedValue(null);
      // Act & Validate
      try {
        await treeService.upsert(userId, data);
        expect.fail('Should have thrown an error');
      } catch (error) {
        expect(error).toBeInstanceOf(AppError);
        expect((error as AppError).statusCode).toBe(NOT_FOUND);
        expect((error as AppError).message).toBe('Element not found');
      }
    });

    it('should return the created/updated element', async () => {
      // Setup
      const { recursiveGetTreeDepth } = await import('../../../src/services/recursive.service');
      const data = {
        name: 'New Element',
        type: 'leaf'
      } as TreeDoc;
      const createdElement = { ...data };
      vi.mocked(recursiveGetTreeDepth).mockResolvedValue(5);
      mockModel.create.mockResolvedValue(createdElement);
      // Act
      const result = await treeService.upsert(userId, data);
      // Validate
      expect(result).toEqual(createdElement);
    });
  });

  describe('deleteById', () => {
    it('should delete an element by ID', async () => {
      // Setup
      const { recursiveGetDescendants } = await import('../../../src/services/recursive.service');
      const elementId = new mongoose.Types.ObjectId();
      const element = {
        _id: elementId,
        userId,
        name: 'Element to delete',
        children: []
      };
      const deletedElement = { ...element };
      mockModel.findOne.mockResolvedValue(element);
      vi.mocked(recursiveGetDescendants).mockResolvedValue([]);
      mockModel.deleteMany.mockResolvedValue({ deletedCount: 0 } as any);
      mockModel.findByIdAndDelete.mockResolvedValue(deletedElement);
      // Act
      const result = await treeService.deleteById(userId, elementId);
      // Validate
      expect(mockModel.findOne).toHaveBeenCalledWith({ _id: elementId, userId });
      expect(mockModel.findByIdAndDelete).toHaveBeenCalledWith(elementId);
      expect(result).toEqual({ 'Deleted': deletedElement });
    });

    it('should delete all descendants of the element', async () => {
      // Setup
      const { recursiveGetDescendants } = await import('../../../src/services/recursive.service');
      const elementId = new mongoose.Types.ObjectId();
      const child1Id = new mongoose.Types.ObjectId();
      const child2Id = new mongoose.Types.ObjectId();
      const element = {
        _id: elementId,
        userId,
        children: [child1Id, child2Id]
      };
      const descendants = [
        { _id: child1Id, userId },
        { _id: child2Id, userId }
      ];
      mockModel.findOne.mockResolvedValue(element);
      vi.mocked(recursiveGetDescendants).mockResolvedValue(descendants as any);
      mockModel.deleteMany.mockResolvedValue({ deletedCount: 2 } as any);
      mockModel.findByIdAndDelete.mockResolvedValue(element);
      // Act
      await treeService.deleteById(userId, elementId);
      // Validate
      expect(recursiveGetDescendants).toHaveBeenCalledWith(element, mockModel);
      expect(mockModel.deleteMany).toHaveBeenCalledWith({
        _id: { $in: [child1Id, child2Id] }
      });
    });

    it('should remove reference from parent element children array', async () => {
      // Setup
      const { recursiveGetDescendants } = await import('../../../src/services/recursive.service');
      const parentId = new mongoose.Types.ObjectId();
      const elementId = new mongoose.Types.ObjectId();
      const siblingId = new mongoose.Types.ObjectId();
      const element = {
        _id: elementId,
        userId,
        parent: parentId
      };
      const parent = {
        _id: parentId,
        userId,
        type: 'branch',
        children: [elementId, siblingId],
        save: vi.fn().mockResolvedValue(true)
      };
      mockModel.findOne.mockResolvedValueOnce(element);
      mockModel.findOne.mockResolvedValueOnce(parent);
      vi.mocked(recursiveGetDescendants).mockResolvedValue([]);
      mockModel.deleteMany.mockResolvedValue({ deletedCount: 0 } as any);
      mockModel.findByIdAndDelete.mockResolvedValue(element);
      // Act
      await treeService.deleteById(userId, elementId);
      // Validate
      expect(parent.children).toEqual([siblingId]);
      expect(parent.save).toHaveBeenCalled();
    });

    it('should change parent type to "leaf" if it becomes childless (and not root)', async () => {
      // Setup
      const { recursiveGetDescendants } = await import('../../../src/services/recursive.service');
      const parentId = new mongoose.Types.ObjectId();
      const elementId = new mongoose.Types.ObjectId();
      const element = {
        _id: elementId,
        userId,
        parent: parentId
      };
      const parent = {
        _id: parentId,
        userId,
        type: 'branch',
        children: [elementId],
        save: vi.fn().mockResolvedValue(true)
      };
      mockModel.findOne.mockResolvedValueOnce(element);
      mockModel.findOne.mockResolvedValueOnce(parent);
      vi.mocked(recursiveGetDescendants).mockResolvedValue([]);
      mockModel.deleteMany.mockResolvedValue({ deletedCount: 0 } as any);
      mockModel.findByIdAndDelete.mockResolvedValue(element);
      // Act
      await treeService.deleteById(userId, elementId);
      // Validate
      expect(parent.children).toEqual([]);
      expect(parent.type).toBe('leaf');
      expect(parent.save).toHaveBeenCalled();
    });

    it('should not change parent type to "leaf" if parent is type "root"', async () => {
      // Setup
      const { recursiveGetDescendants } = await import('../../../src/services/recursive.service');
      const parentId = new mongoose.Types.ObjectId();
      const elementId = new mongoose.Types.ObjectId();
      const element = {
        _id: elementId,
        userId,
        parent: parentId
      };
      const parent = {
        _id: parentId,
        userId,
        type: 'root',
        children: [elementId],
        save: vi.fn().mockResolvedValue(true)
      };
      mockModel.findOne.mockResolvedValueOnce(element);
      mockModel.findOne.mockResolvedValueOnce(parent);
      vi.mocked(recursiveGetDescendants).mockResolvedValue([]);
      mockModel.deleteMany.mockResolvedValue({ deletedCount: 0 } as any);
      mockModel.findByIdAndDelete.mockResolvedValue(element);
      // Act
      await treeService.deleteById(userId, elementId);
      // Validate
      expect(parent.children).toEqual([]);
      expect(parent.type).toBe('root');
      expect(parent.save).toHaveBeenCalled();
    });

    it('should throw NOT_FOUND error if element not found', async () => {
      // Setup
      const elementId = new mongoose.Types.ObjectId();
      mockModel.findOne.mockResolvedValue(null);
      // Act & Validate
      try {
        await treeService.deleteById(userId, elementId);
        expect.fail('Should have thrown an error');
      } catch (error) {
        expect(error).toBeInstanceOf(AppError);
        expect((error as AppError).statusCode).toBe(NOT_FOUND);
        expect((error as AppError).message).toBe('Element not found');
      }
    });

    it('should throw NOT_FOUND error if parent element not found', async () => {
      // Setup
      const { recursiveGetDescendants } = await import('../../../src/services/recursive.service');
      const parentId = new mongoose.Types.ObjectId();
      const elementId = new mongoose.Types.ObjectId();
      const element = {
        _id: elementId,
        userId,
        parent: parentId
      };
      mockModel.findOne.mockResolvedValueOnce(element);
      mockModel.findOne.mockResolvedValueOnce(null);
      vi.mocked(recursiveGetDescendants).mockResolvedValue([]);
      // Act & Validate
      try {
        await treeService.deleteById(userId, elementId);
        expect.fail('Should have thrown an error');
      } catch (error) {
        expect(error).toBeInstanceOf(AppError);
        expect((error as AppError).statusCode).toBe(NOT_FOUND);
        expect((error as AppError).message).toBe('Parent element not found');
      }
    });

    it('should filter by userId when finding element', async () => {
      // Setup
      const { recursiveGetDescendants } = await import('../../../src/services/recursive.service');
      const elementId = new mongoose.Types.ObjectId();
      const element = {
        _id: elementId,
        userId,
        children: []
      };
      mockModel.findOne.mockResolvedValue(element);
      vi.mocked(recursiveGetDescendants).mockResolvedValue([]);
      mockModel.deleteMany.mockResolvedValue({ deletedCount: 0 } as any);
      mockModel.findByIdAndDelete.mockResolvedValue(element);
      // Act
      await treeService.deleteById(userId, elementId);
      // Validate
      expect(mockModel.findOne).toHaveBeenCalledWith({ _id: elementId, userId });
    });

    it('should filter by userId when finding parent', async () => {
      // Setup
      const { recursiveGetDescendants } = await import('../../../src/services/recursive.service');
      const parentId = new mongoose.Types.ObjectId();
      const elementId = new mongoose.Types.ObjectId();
      const element = {
        _id: elementId,
        userId,
        parent: parentId
      };
      const parent = {
        _id: parentId,
        userId,
        type: 'branch',
        children: [elementId],
        save: vi.fn().mockResolvedValue(true)
      };
      mockModel.findOne.mockResolvedValueOnce(element);
      mockModel.findOne.mockResolvedValueOnce(parent);
      vi.mocked(recursiveGetDescendants).mockResolvedValue([]);
      mockModel.deleteMany.mockResolvedValue({ deletedCount: 0 } as any);
      mockModel.findByIdAndDelete.mockResolvedValue(element);
      // Act
      await treeService.deleteById(userId, elementId);
      // Validate
      expect(mockModel.findOne).toHaveBeenCalledWith({ _id: parentId, userId });
    });

    it('should handle element with no parent', async () => {
      // Setup
      const { recursiveGetDescendants } = await import('../../../src/services/recursive.service');
      const elementId = new mongoose.Types.ObjectId();
      const element = {
        _id: elementId,
        userId,
        children: []
      };
      mockModel.findOne.mockResolvedValue(element);
      vi.mocked(recursiveGetDescendants).mockResolvedValue([]);
      mockModel.deleteMany.mockResolvedValue({ deletedCount: 0 } as any);
      mockModel.findByIdAndDelete.mockResolvedValue(element);
      // Act
      await treeService.deleteById(userId, elementId);
      // Validate
      expect(mockModel.findOne).toHaveBeenCalledTimes(1);
      expect(mockModel.findByIdAndDelete).toHaveBeenCalledWith(elementId);
    });

    it('should return deleted element', async () => {
      // Setup
      const { recursiveGetDescendants } = await import('../../../src/services/recursive.service');
      const elementId = new mongoose.Types.ObjectId();
      const element = {
        _id: elementId,
        userId,
        name: 'Deleted Element',
        children: []
      };
      mockModel.findOne.mockResolvedValue(element);
      vi.mocked(recursiveGetDescendants).mockResolvedValue([]);
      mockModel.deleteMany.mockResolvedValue({ deletedCount: 0 } as any);
      mockModel.findByIdAndDelete.mockResolvedValue(element);
      // Act
      const result = await treeService.deleteById(userId, elementId);
      // Validate
      expect(result).toEqual({ 'Deleted': element });
    });
  });

});
