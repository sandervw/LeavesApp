import mongoose from 'mongoose';
import { TreeDoc, mongoId } from '../schemas/mongo.schema';
import appAssert from '../utils/appAssert';
import { INTERNAL_SERVER_ERROR, NOT_FOUND } from '../constants/http';
import { MAX_TREE_DEPTH } from '../constants/env';
import { recursiveGetDescendants } from './recursive.service';

type QueryParam = {
  [key: string]: undefined | string | QueryParam | (string | QueryParam)[];
};
type UserParam = mongoose.Types.ObjectId;

export default class TreeService<T extends TreeDoc> {

  constructor(model: mongoose.Model<T>) {
    this.model = model;
    this.find = this.find.bind(this);
    this.findById = this.findById.bind(this);
    this.findChildren = this.findChildren.bind(this);
    this.upsert = this.upsert.bind(this);
    this.deleteById = this.deleteById.bind(this);
  }

  private model;

  /**
   * Returns all the user's elements (matching a query if provided).
   * @param userId - the userId to filter by
   * @param query - an optional query to filter
   */
  async find(userId: UserParam, query?: QueryParam) {
    const result = await this.model.find({ userId, ...query }).sort({ createdAt: -1 });
    appAssert(result, NOT_FOUND, 'No elements found');
    return result;
  }

  /**
   * Return a single element by ID
   * @param userId - the userId to filter by
   * @param id - the id of the element to find
   */
  async findById(userId: UserParam, id: mongoId) {
    const result = await this.model.findOne({ _id: id, userId });
    appAssert(result, NOT_FOUND, 'No such object exists');
    return result;
  }

  /**
   * Returns all the children of a given element
   * @param userId - the userId to filter by
   * @param id - the id of the parent element
   */
  async findChildren(userId: UserParam, id: mongoId) {
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
  async upsert(userId: UserParam, data: T) {
    data.userId = userId; // Ensure user_id is set in the data
    if (data._id) {
      if (data.children) {
        data.children = data.children.filter(Boolean); // Remove null/undefined
      }
      const result = await this.model.findOneAndUpdate({ _id: data._id, userId }, { $set: data }, { new: true });
      appAssert(result, NOT_FOUND, 'Element not found');
      return result as T;
    }
    // Before creating, set the depth, and ensure max depth is not exceeded
    const parent = await this.model.findOne({ _id: data.parent, userId });
    const depth = parent
      ? parent.depth + 1
      : 0;
    appAssert(depth < MAX_TREE_DEPTH, INTERNAL_SERVER_ERROR, `Maximum tree depth exceeded (limit: ${MAX_TREE_DEPTH})`);
    return await this.model.create({ ...data, depth });
  }

  /**
   * Deletes a tree element by ID, including all its children and references in the parent.
   * @param userId - the userId to filter by
   * @param id - the id of the element to delete
   */
  async deleteById(userId: UserParam, id: mongoId) {
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
      parent.save();
    }
    // Next, delete all descendents of this template
    const descendents = await recursiveGetDescendants<T>(toDelete, this.model);
    await this.model.deleteMany({ _id: { $in: descendents.map((descendent) => descendent._id) } });
    // Finally, delete this template
    return { 'Deleted': await this.model.findByIdAndDelete(id) };
  }

}