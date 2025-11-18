import TreeService from './tree.service';
import { Storynode, Template } from '../models/tree.model';
import { StorynodeDoc, mongoId } from '../schemas/mongo.schema';
import appAssert from '../utils/appAssert';
import { INTERNAL_SERVER_ERROR, NOT_FOUND } from '../constants/http';
import { MAX_TREE_DEPTH } from '../constants/env';

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
      await this.updateWordLimits(storynode);
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
      return await this.createFromTemplate(userId, templateId);
    }

    const parent = await Storynode.findOne({ _id: parentId, userId });
    appAssert(parent, NOT_FOUND, 'Parent not found');

    const newChild = await this.createFromTemplate(userId, templateId, parentId);
    parent.children.push(newChild._id);
    await Storynode.findOneAndUpdate(
      { _id: parent._id, userId },
      { children: parent.children },
      { new: true }
    );

    return newChild;
  }

  /**
   * Get the complete story text from a storynode tree.
   * Collects all leaf nodes in depth-first order and joins their text.
   * @param userId - the userId to filter by
   * @param storynodeId - the id of the storynode (typically a root)
   * @returns - the complete story as a single string
   */
  async getStoryFile(userId: mongoId, storynodeId: mongoId): Promise<string> {
    const storynode = await Storynode.findOne({ _id: storynodeId, userId });
    appAssert(storynode, NOT_FOUND, 'Storynode not found');

    const leaves = await this.getLeaves(storynode);
    const storyText = leaves.map(leaf => leaf.text).join('\n');

    return storyText;
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

  /**
   * Given a storynode, recursively update the word limits of all its children (based on their wordWeights).
   * Uses bulkWrite for batch updates and Promise.all for parallel child processing.
   * @param node - the storynode whose children will be updated
   */
  private async updateWordLimits(node: Readonly<StorynodeDoc>): Promise<void> {
    if (!node.children?.length) return;

    const children = await Storynode.find({ _id: { $in: node.children } });
    const updates = children.map(child => {
      // wordWeight is expressed as a percentage (0-100), so divide by 100 to calculate child's limit
      const newLimit = child.wordWeight ? Math.floor(node.wordLimit * child.wordWeight / 100) : node.wordLimit;
      child.wordLimit = newLimit; // Update in-place for recursive calls
      return { updateOne: { filter: { _id: child._id }, update: { wordLimit: newLimit } } };
    });

    await Storynode.bulkWrite(updates);
    await Promise.all(children.map(child => this.updateWordLimits(child)));
  }

  /**
   * Given a templateId (and optionally a parentId), recursively create a storynode tree from the template tree.
   * Uses Promise.all to create sibling nodes in parallel for better performance.
   * @param userId - the userId to assign to the new storynodes
   * @param templateId - the id of the template to create the storynode tree from
   * @param parentId - the id of the parent storynode (if any)
   * @returns - the new storynode tree
   */
  private async createFromTemplate(
    userId: mongoId,
    templateId: mongoId,
    parentId?: mongoId
  ): Promise<StorynodeDoc> {
    const templateData = await Template.findOne({ _id: templateId, userId });
    appAssert(templateData, NOT_FOUND, `Template not found (ID: ${templateId})`);

    let depth = 0;
    if (parentId) {
      const parent = await Storynode.findOne({ _id: parentId, userId });
      appAssert(parent, NOT_FOUND, 'Parent not found');
      depth = parent.depth + 1;
      appAssert(depth < MAX_TREE_DEPTH, INTERNAL_SERVER_ERROR, `Maximum tree depth exceeded (limit: ${MAX_TREE_DEPTH})`);
    }

    const storynode = await Storynode.create({
      userId, parent: parentId, depth,
      name: templateData.name, type: templateData.type, text: templateData.text, wordWeight: templateData.wordWeight
    });

    if (templateData.children?.length) {
      const children = await Promise.all(templateData.children.map(id => this.createFromTemplate(userId, id, storynode._id)));
      const updated = await Storynode.findOneAndUpdate({ _id: storynode._id, userId }, { children: children.map(c => c._id) }, { new: true });
      appAssert(updated, NOT_FOUND, 'Storynode not found after update');
      return updated;
    }

    return storynode;
  }

}

export default new StorynodeService();