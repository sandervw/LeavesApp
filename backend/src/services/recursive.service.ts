import mongoose from 'mongoose';
import { StorynodeDoc, TreeDoc, mongoId } from "../schemas/mongo.schema";
import { Storynode, Template } from '../models/tree.model';
import appAssert from '../utils/appAssert';
import { INTERNAL_SERVER_ERROR, NOT_FOUND } from '../constants/http';
import { MAX_TREE_DEPTH } from '../constants/env';

/**
 * Given a storynode, recursively update the word limits of all its children (based on their wordWeights).
 * Uses bulkWrite for batch updates and Promise.all for parallel child processing.
 * @param node - the storynode whose children will be updated
 */
export const recursiveUpdateWordLimits = async (node: Readonly<StorynodeDoc>): Promise<void> => {
  if (!node.children?.length) return;

  const children = await Storynode.find({ _id: { $in: node.children } });
  const updates = children.map(child => {
    // wordWeight is expressed as a percentage (0-100), so divide by 100 to calculate child's limit
    const newLimit = child.wordWeight ? Math.floor(node.wordLimit * child.wordWeight / 100) : node.wordLimit;
    child.wordLimit = newLimit; // Update in-place for recursive calls
    return { updateOne: { filter: { _id: child._id }, update: { wordLimit: newLimit } } };
  });

  await Storynode.bulkWrite(updates);
  await Promise.all(children.map(child => recursiveUpdateWordLimits(child)));
};

/**
 * Given a template or storynode, iteratively get all descendants of that tree.
 * Uses queue-based approach to avoid recursion and array spreading overhead.
 * @param tree - the tree element
 * @param model - the mongoose model
 * @returns - an array of all descendants of the element (not including the element itself)
 */
export const recursiveGetDescendants = async <T extends TreeDoc>(tree: T, model: mongoose.Model<T>) => {
  const descendants: T[] = [];
  // Initialize queue with tree's children (copy to avoid mutation)
  const nodesToProcessQueue: mongoId[] = [...tree.children];

  while (nodesToProcessQueue.length > 0) {
    const currentLevel = await model.find({ _id: { $in: nodesToProcessQueue } });
    descendants.push(...currentLevel);
    nodesToProcessQueue.length = 0;
    currentLevel.forEach(node => nodesToProcessQueue.push(...node.children));
  }

  return descendants;
};

/**
 * Given a template or storynode, recursively get all leaf nodes of that tree in depth-first order.
 * Uses recursion to maintain proper narrative sequence.
 * @param tree - the tree element
 * @param model - the mongoose model
 * @returns - an array of all leaf nodes (nodes with type='leaf') in DFS order (not including the input node)
 */
export const recursiveGetLeaves = async <T extends TreeDoc>(tree: T, model: mongoose.Model<T>): Promise<T[]> => {
  const leaves: T[] = [];

  // Process children in order (depth-first)
  for (const childId of tree.children) {
    const child = await model.findById(childId);
    if (!child) continue;

    if (child.type === 'leaf') {
      leaves.push(child);
    } else {
      // Recursively get leaves from this child
      const childLeaves = await recursiveGetLeaves(child, model);
      leaves.push(...childLeaves);
    }
  }

  return leaves;
};

/**
 * Given a templateId (and optionally a parentId), recursively create a storynode tree from the template tree.
 * Uses Promise.all to create sibling nodes in parallel for better performance.
 * @param userId - the userId to assign to the new storynodes
 * @param templateId - the id of the template to create the storynode tree from
 * @param parentId - the id of the parent storynode (if any)
 * @returns - the new storynode tree
 */
export const recursiveStorynodeFromTemplate = async (
  userId: mongoId,
  templateId: mongoId,
  parentId?: mongoId
): Promise<StorynodeDoc> => {
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
    const children = await Promise.all(templateData.children.map(id => recursiveStorynodeFromTemplate(userId, id, storynode._id)));
    const updated = await Storynode.findOneAndUpdate({ _id: storynode._id, userId }, { children: children.map(c => c._id) }, { new: true });
    appAssert(updated, NOT_FOUND, 'Storynode not found after update');
    return updated;
  }

  return storynode;
};