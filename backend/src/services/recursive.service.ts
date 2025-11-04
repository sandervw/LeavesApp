import mongoose from 'mongoose';
import { StorynodeDoc, TreeDoc, mongoId } from "../schemas/mongo.schema";
import { Storynode, Template } from '../models/tree.model';
import appAssert from '../utils/appAssert';
import { INTERNAL_SERVER_ERROR, NOT_FOUND } from '../constants/http';
import { MAX_TREE_DEPTH } from '../constants/env';

/**
 * Given a storynode, recursively update the word limits of all its children (based on their wordWeights).
 * * @param node - the storynode whose children will be updated
 */
export const recursiveUpdateWordLimits = async (node: Readonly<StorynodeDoc>): Promise<void> => {
  if (node.children && node.children.length > 0) {
    const children: StorynodeDoc[] = await Storynode.find({ _id: { $in: node.children } });
    for (const child of children) {
      if (child.wordWeight) child.wordLimit = Math.floor(node.wordLimit * child.wordWeight / 100.00);
      else child.wordLimit = node.wordLimit;
      await Storynode.findOneAndUpdate({ _id: child._id }, { wordLimit: child.wordLimit }, { new: true });
      await recursiveUpdateWordLimits(child);
    }
  }
};

/**
 * Given a storynode, recursively update the word count of all its parents.
 * @param node - the storynode whose parents will be updated
 * @param userId - the userId to filter by
 */
export const recursiveUpdateParentWordCount = async (node: Readonly<StorynodeDoc>, userId: mongoId): Promise<void> => {
  if (node.parent) {
    const parent = await Storynode.findOne({ _id: node.parent, userId });
    if (parent) {
      const siblings = await Storynode.find({ _id: { $in: parent.children }, userId });
      parent.wordCount = siblings.reduce((acc: number, sibling: StorynodeDoc) => acc + sibling.wordCount, 0);
      await Storynode.findOneAndUpdate({ _id: parent._id, userId }, { wordCount: parent.wordCount });
      await recursiveUpdateParentWordCount(parent, userId);
    }
  }
};

/**
 * Given a template or storynode id, recursively get all descendants of that tree.
 * @param id - the id of the element
 * @returns - an array of all descendants of the element (not including the element itself)
 */
export const recursiveGetDescendants = async <T extends TreeDoc>(tree: T, model: mongoose.Model<T>) => {
  let descendents = await model.find({ _id: { $in: tree.children } });
  for (const child of descendents) {
    const childDescendents = await recursiveGetDescendants<T>(child, model);
    descendents = [...descendents, ...childDescendents];
  }
  return descendents;
};

/**
 * Given a templateId (and optionally a parentId), recursively create a storynode tree from the template tree.
 * @param userId - the userId to assign to the new storynodes
 * @param templateId - the id of the template to create the storynode tree from
 * @param parentId - the id of the parent storynode (if any)
 * @return - the new storynode tree
 */
export const recursiveStorynodeFromTemplate = async (
  userId: mongoId,
  templateId: mongoId,
  parentId?: mongoId)
  : Promise<StorynodeDoc> => {
  // Create a new storynode with the template's data, making sure to give it a parent if supplied
  const templateData = await Template.findOne({ _id: templateId, userId });
  appAssert(templateData, NOT_FOUND, 'Template not found');
  const storyData = (parentId
    ? { userId, parent: parentId, name: templateData.name, type: templateData.type, text: templateData.text, wordWeight: templateData.wordWeight }
    : { userId, name: templateData.name, type: templateData.type, text: templateData.text, wordWeight: templateData.wordWeight });
  let storynode: StorynodeDoc = await Storynode.create(storyData);
  // Then recursively add any children of the template
  if (templateData.children && templateData.children.length > 0) {
    const children: StorynodeDoc[] = [];
    for (const child of templateData.children) {
      children.push(await recursiveStorynodeFromTemplate(userId, child, storynode._id));
    };
    // Update the parent with the new children
    const updatedStorynode = await Storynode.findOneAndUpdate(
      { _id: storynode._id, userId },
      { children: children.map(child => child._id) },
      { new: true }
    );
    appAssert(updatedStorynode, NOT_FOUND, 'Storynode not found after update');
    storynode = updatedStorynode;
  }
  // base case: return the new storynode
  return storynode;
};

/**
 * Given a tree node, recursively calculate its depth in the tree by traversing up to the root.
 * @param tree - the tree node to calculate depth for
 * @param model - the mongoose model to use for queries
 * @param userId - the userId to filter by
 * @param currentDepth - the current depth (defaults to 0)
 * @returns - the depth of the tree node (0 for root, 1 for children of root, etc.)
 * @throws - Error if depth exceeds 25 (potential circular reference or excessive nesting)
 */
export const recursiveGetTreeDepth = async <T extends TreeDoc>(
  tree: T,
  model: mongoose.Model<T>,
  userId: mongoId,
  currentDepth: number = 0
): Promise<number> => {
  appAssert(currentDepth < MAX_TREE_DEPTH, INTERNAL_SERVER_ERROR, `Maximum tree depth exceeded (limit: ${MAX_TREE_DEPTH})`);
  if (tree.parent) {
    const parent = await model.findOne({ _id: tree.parent, userId });
    if (parent) {
      return await recursiveGetTreeDepth<T>(parent, model, userId, currentDepth + 1);
    }
  }
  return currentDepth;
};

// // Function to recursively get only the base nodes (leaves) of a story, given a start Id (inclusive)
// const recursiveGetLeafs = async (id) => {
//     let toGet = await Element.findById(id);
//     let blobArr = [];
//     if(toGet && toGet.type == 'leaf') blobArr.push(toGet);
//     if(toGet && toGet.children){
//         let childArr = toGet.children;
//         for (const child of childArr){
//             let childNode = await Element.findById(child);
//             if(childNode.type == 'leaf') blobArr.push(childNode);
//             else blobArr = [...blobArr, ...await recursiveGetBlobs(child)];
//         };
//     }
//     return blobArr;
// }

// // Function to recursively convert a JSON object to a storynode
// const recursiveStorynodeFromJSON = async (json, parentid) => {
//     // TODO - implement this
// }