import mongoose from 'mongoose';
import { TreeDoc, mongoId } from '../schemas/mongo.schema';
import appAssert from '../utils/appAssert';
import { INTERNAL_SERVER_ERROR, NOT_FOUND } from '../constants/http';
import { MAX_TREE_DEPTH } from '../constants/env';

type QueryParam = {
  [key: string]: undefined | string | QueryParam | (string | QueryParam)[];
};

export default class TreeService<T extends TreeDoc> {

  constructor(model: mongoose.Model<T>) {
    this.model = model;
    this.find = this.find.bind(this);
    this.findById = this.findById.bind(this);
    this.findChildren = this.findChildren.bind(this);
    this.upsert = this.upsert.bind(this);
    this.deleteById = this.deleteById.bind(this);
  }

  private model: mongoose.Model<T>;

  /**
   * Returns all the user's elements (matching a query if provided).
   * @param userId - the userId to filter by
   * @param query - an optional query to filter
   */
  async find(userId: mongoId, query?: QueryParam) {
    const result = await this.model.find({ userId, ...query }).sort({ createdAt: -1 });
    appAssert(result, NOT_FOUND, 'No elements found');
    return result;
  }

  /**
   * Return a single element by ID
   * @param userId - the userId to filter by
   * @param id - the id of the element to find
   */
  async findById(userId: mongoId, id: mongoId) {
    const result = await this.model.findOne({ _id: id, userId });
    appAssert(result, NOT_FOUND, 'No such object exists');
    return result;
  }

  /**
   * Returns all the children of a given element
   * @param userId - the userId to filter by
   * @param id - the id of the parent element
   */
  async findChildren(userId: mongoId, id: mongoId) {
    const parent = await this.model.findOne({ _id: id, userId });
    appAssert(parent, NOT_FOUND, 'Parent element not found');
    const children = await this.model.find({ _id: { $in: parent.children }, userId });
    appAssert(children, NOT_FOUND, 'No children found');
    return children;
  }

  /**
   * Returns an element after upserting.
   * @param userId - the user to associate the element with
   * @param data - the element to create or update
   */
  async upsert(userId: mongoId, data: T) {
    // Ensure userId is always set to prevent accidental data leakage to other users
    data.userId = userId;

    // Clean children array (common operation)
    if (data.children) {
      data.children = data.children.filter(Boolean); // Remove null/undefined
    }

    if (data._id) {
      const result = await this.model.findOneAndUpdate({ _id: data._id, userId }, { $set: data }, { new: true });
      appAssert(result, NOT_FOUND, 'Element not found');
      return result;
    }

    // Before creating, set the depth, and ensure max depth is not exceeded
    const depth = await this.calculateDepth(userId, data.parent || undefined);
    return await this.model.create({ ...data, depth });
  }

  /**
   * Calculate the depth for a new node based on its parent
   * @param userId - the userId to filter by
   * @param parentId - the id of the parent node (if any)
   * @returns the depth value for the new node
   */
  private async calculateDepth(userId: mongoId, parentId?: mongoId): Promise<number> {
    if (!parentId) return 0;

    const parent = await this.model.findOne({ _id: parentId, userId });
    const depth = parent ? parent.depth + 1 : 0;
    appAssert(
      depth < MAX_TREE_DEPTH,
      INTERNAL_SERVER_ERROR,
      `Maximum tree depth exceeded (limit: ${MAX_TREE_DEPTH})`
    );
    return depth;
  }

  /**
   * Given a tree element, iteratively get all descendants of that tree.
   * Uses queue-based approach to avoid recursion and array spreading overhead.
   * @param tree - the tree element
   * @returns - an array of all descendants of the element (not including the element itself)
   */
  protected async getDescendants(tree: T): Promise<T[]> {
    const descendants: T[] = [];
    // Initialize queue with tree's children (copy to avoid mutation)
    const nodesToProcessQueue: mongoId[] = [...tree.children];

    while (nodesToProcessQueue.length > 0) {
      const currentLevel = await this.model.find({ _id: { $in: nodesToProcessQueue } });
      descendants.push(...currentLevel);
      nodesToProcessQueue.length = 0;
      currentLevel.forEach(node => nodesToProcessQueue.push(...node.children));
    }

    return descendants;
  }

  /**
   * Given a tree element, recursively get all leaf nodes of that tree in depth-first order.
   * Uses recursion to maintain proper narrative sequence.
   * @param tree - the tree element
   * @returns - an array of all leaf nodes (nodes with type='leaf') in DFS order (not including the input node)
   */
  protected async getLeaves(tree: T): Promise<T[]> {
    const leaves: T[] = [];

    // Process children in order (depth-first)
    for (const childId of tree.children) {
      const child = await this.model.findById(childId);
      if (!child) continue;

      if (child.type === 'leaf') {
        leaves.push(child);
      } else {
        // Recursively get leaves from this child
        const childLeaves = await this.getLeaves(child);
        leaves.push(...childLeaves);
      }
    }

    return leaves;
  }

  /**
   * Deletes a tree element by ID, including all its children and references in the parent.
   * @param userId - the userId to filter by
   * @param id - the id of the element to delete
   */
  async deleteById(userId: mongoId, id: mongoId) {
    const toDelete = await this.model.findOne({ _id: id, userId });
    appAssert(toDelete, NOT_FOUND, 'Element not found');
    // First, delete reference to this template from parent template
    if (toDelete.parent) {
      const parent = await this.model.findOne({ _id: toDelete.parent, userId });
      appAssert(parent, NOT_FOUND, 'Parent element not found');
      parent.children = parent.children.filter((child: mongoId) => child && !id.equals(child));
      if (parent.children.length === 0 && parent.type !== 'root') {
        // If the parent is branch and has no children, set type to 'leaf'
        parent.type = 'leaf';
      }
      await parent.save();
    }
    // Next, delete all descendants of this template
    const descendants = await this.getDescendants(toDelete);
    await this.model.deleteMany({ _id: { $in: descendants.map((descendant) => descendant._id) } });
    // Finally, delete this template
    return { 'Deleted': await this.model.findByIdAndDelete(id) };
  }

}