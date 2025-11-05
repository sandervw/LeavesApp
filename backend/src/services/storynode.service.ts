import TreeService from './tree.service';
import { Storynode } from '../models/tree.model';
import { StorynodeDoc, mongoId } from '../schemas/mongo.schema';
import appAssert from '../utils/appAssert';
import { INTERNAL_SERVER_ERROR, NOT_FOUND } from '../constants/http';
import { recursiveStorynodeFromTemplate, recursiveUpdateWordLimits, recursiveUpdateParentWordCount } from './recursive.service';
import { MAX_TREE_DEPTH } from '../constants/env';

class storynodeService extends TreeService<StorynodeDoc> {

  constructor() {
    super(Storynode);
    this.upsert = this.upsert.bind(this);
    this.addFromTemplate = this.addFromTemplate.bind(this);
    // this.addFromFile = this.addFromFile.bind(this);
    // this.saveToFile = this.saveToFile.bind(this);
  }

  /**
   * Upserts a storynode (creates or updates it).
   * Note: this also updates the word count (of storynode) and word limits of children (roots only).
   * @param userId - the userId to filter by
   * @param data - the data to upsert
   */
  async upsert(userId: mongoId, data: StorynodeDoc) {
    // UPDATE STORYNODE
    if (data._id) {
      // If element has children, set the word count (based on children or text)
      if (data.children && data.children.length > 0) {
        data.children = data.children.filter(Boolean); // Clean up null/undefined from frontend
        const children = await Storynode.find({ _id: { $in: data.children }, userId });
        appAssert(children.length === data.children.length, NOT_FOUND, 'Some children not found');
        data.wordCount = children.reduce((acc: number, child: StorynodeDoc) => acc + child.wordCount, 0);
      }
      // Else, update child wordCount
      else if (data.text && data.text.length > 0) data.wordCount = data.text.trim().split(/\s+/).filter(word => word).length;
      const storynode = await Storynode.findOneAndUpdate({ _id: data._id, userId }, { $set: data }, { new: true });
      appAssert(storynode, NOT_FOUND, 'Storynode not found');
      // If the storynode has a parent, update the parent word count
      if (storynode.parent) {
        await recursiveUpdateParentWordCount(storynode, userId);
      }
      // If the storynode is a root, set the word limit for its children
      if (storynode.type === 'root' && storynode.wordLimit) {
        await recursiveUpdateWordLimits(storynode);
      }
      return storynode as StorynodeDoc; // Assert return type here; we know its a doc because of appAssert
    }
    // CREATE STORYNODE
    else {
      data.userId = userId; // Ensure user_id is set in the data
      if (data.text && data.text.length > 0) {
        data.wordCount = data.text.trim().split(/\s+/).filter(word => word).length;
      }
      // Before creating, set the depth, and ensure max depth is not exceeded
      const parent = await Storynode.findOne({ _id: data.parent, userId });
      const depth = parent
        ? parent.depth + 1
        : 0;
      appAssert(depth < MAX_TREE_DEPTH, INTERNAL_SERVER_ERROR, `Maximum tree depth exceeded (limit: ${MAX_TREE_DEPTH})`);
      const newStorynode = await Storynode.create({ ...data, depth });
      if (newStorynode.parent) {
        await recursiveUpdateParentWordCount(newStorynode, userId);
      }
      return newStorynode;
    }
  }

  // TODO: overwrite delete, need to update the parent word count

  /**
   * Creates a storynode from a template (or adds a template as a child)
   * @param userId - the userId to assign to the new storynodes
   * @param templateId - the id of the template to create the storynode tree from
   * @param parentId - the id of the parent storynode (if any)
   * @return - the new storynode tree
   */
  async addFromTemplate(userId: mongoId, templateId: mongoId, parentId?: mongoId | null) {
    // ADD NEW CHILD
    if (parentId) {
      const parent = await Storynode.findOne({ _id: parentId, userId });
      appAssert(parent, NOT_FOUND, 'Parent not found');
      const newChild = await recursiveStorynodeFromTemplate(userId, templateId, parentId);
      if (parent) {
        parent.children.push(newChild._id);
        await Storynode.findOneAndUpdate({ _id: parent._id, userId }, { children: parent.children }, { new: true });
      }
      return newChild;
    }
    // Or, send a new storynode
    else return await recursiveStorynodeFromTemplate(userId, templateId);
  }

  // // Save a storynode to a file
  // async saveToFile(id, user_id){
  //     if(!id || !mongoose.Types.ObjectId.isValid(id)) throw new Error('Not a valid ID');
  //     // Recursively retrieve all the nodes
  //     const storynode = await Storynode.findOne({ _id: id, user_id });
  //     let storyLeafs = await recursiveGetLeafs(storynode._id);
  //     let result = await writeArrayToFile(storyLeafs.map((leaf) => leaf.text), `${storynode.name}.txt`);
  //     res.status(200).json({success: result});
  // }

}

export default new storynodeService();