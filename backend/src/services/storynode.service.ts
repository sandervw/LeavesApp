import TreeService from './tree.service';
import { Storynode } from '../models/tree.model';
import { StorynodeDoc, mongoId } from '../schemas/mongo.schema';
import appAssert from '../utils/appAssert';
import { NOT_FOUND } from '../constants/http';
import { recursiveStorynodeFromTemplate, recursiveUpdateWordLimits } from './recursive.service';

class StorynodeService extends TreeService<StorynodeDoc> {

  constructor() {
    super(Storynode);
    this.addFromTemplate = this.addFromTemplate.bind(this);
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
      data.wordCount = this.calculateChildrenWordCount(children);
    } else if (data.text?.length > 0) {
      data.wordCount = this.calculateWordCount(data.text);
    }

    // Perform upsert
    const storynode = await super.upsert(userId, data);

    // Post-save operations (common to both create and update)
    if (storynode.parent) {
      await this.updateParentWordCounts(storynode, userId);
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
   * @returns - the new storynode tree
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

  /**
   * Calculate word count from a text string
   * @param text - the text to count words in
   * @returns the number of words
   */
  private calculateWordCount(text: string): number {
    return text.trim().split(/\s+/).filter(word => word).length;
  }

  /**
   * Calculate total word count from an array of children nodes
   * @param children - array of storynode documents
   * @returns the sum of all children word counts
   */
  private calculateChildrenWordCount(children: StorynodeDoc[]): number {
    return children.reduce((acc, child) => acc + child.wordCount, 0);
  }

  /**
   * Collect all ancestors of a node in the tree
   * @param nodeId - the id of the starting node
   * @param userId - the userId to filter by
   * @returns array of ancestor nodes from parent to root
   */
  private async collectAncestors(
    nodeId: mongoId,
    userId: mongoId
  ): Promise<StorynodeDoc[]> {
    const ancestors: StorynodeDoc[] = [];
    let current = await Storynode.findOne({ _id: nodeId, userId });

    while (current?.parent) {
      current = await Storynode.findOne({ _id: current.parent, userId });
      if (current) ancestors.push(current);
    }

    return ancestors;
  }

  /**
   * Update word counts for all parent nodes up the tree
   * @param node - the storynode whose parents will be updated
   * @param userId - the userId to filter by
   */
  private async updateParentWordCounts(
    node: StorynodeDoc,
    userId: mongoId
  ): Promise<void> {
    if (!node.parent) return;

    const ancestors = await this.collectAncestors(node._id, userId);

    // Update word counts for each ancestor
    for (const ancestor of ancestors) {
      const siblings = await Storynode.find({ _id: { $in: ancestor.children }, userId });
      const newWordCount = this.calculateChildrenWordCount(siblings);

      await Storynode.findOneAndUpdate(
        { _id: ancestor._id, userId },
        { wordCount: newWordCount }
      );
    }
  }

}

export default new StorynodeService();