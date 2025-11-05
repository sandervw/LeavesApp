import TreeService from './tree.service';
import { Storynode } from '../models/tree.model';
import { StorynodeDoc, mongoId } from '../schemas/mongo.schema';
import appAssert from '../utils/appAssert';
import { NOT_FOUND } from '../constants/http';
import { recursiveStorynodeFromTemplate, recursiveUpdateWordLimits } from './recursive.service';
import { calculateWordCount, calculateChildrenWordCount, updateParentWordCounts } from '../utils/wordCount';

class storynodeService extends TreeService<StorynodeDoc> {

  constructor() {
    super(Storynode);
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
    // Calculate word count before save (for both create and update)
    if (data.children?.length > 0) {
      data.children = data.children.filter(Boolean); // Clean up null/undefined from frontend
      const children = await Storynode.find({ _id: { $in: data.children }, userId });
      appAssert(children.length === data.children.length, NOT_FOUND, 'Some children not found');
      data.wordCount = calculateChildrenWordCount(children);
    } else if (data.text?.length > 0) {
      data.wordCount = calculateWordCount(data.text);
    }

    // Perform upsert
    const storynode = await super.upsert(userId, data);

    // Post-save operations (common to both create and update)
    if (storynode.parent) {
      await updateParentWordCounts(storynode, userId);
    }

    if (storynode.type === 'root' && storynode.wordLimit) {
      await recursiveUpdateWordLimits(storynode);
    }

    return storynode;
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
    if (!parentId) {
      return await recursiveStorynodeFromTemplate(userId, templateId);
    }

    const parent = await Storynode.findOne({ _id: parentId, userId });
    appAssert(parent, NOT_FOUND, 'Parent not found');

    const newChild = await recursiveStorynodeFromTemplate(userId, templateId, parentId);
    parent.children.push(newChild._id);
    await Storynode.findOneAndUpdate(
      { _id: parent._id, userId },
      { children: parent.children },
      { new: true }
    );

    return newChild;
  }

  // /**
  //  * Updates the depths of all root storynodes and their descendants.
  //  * @param userId - the userId to filter by
  //  */
  // async updateDepth(userId: mongoId) {
  //   const storynodes = await Storynode.find({ kind: 'storynode', type: 'root', userId });
  //   appAssert(storynodes, NOT_FOUND, 'Storynodes not found');
  //   await Promise.all(storynodes.map(storynode => recursiveUpdateDepth(storynode._id, storynode.depth)));
  //   return { success: true };
  // }

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