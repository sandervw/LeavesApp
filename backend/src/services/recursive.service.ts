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
    const newLimit = child.wordWeight ? Math.floor(node.wordLimit * child.wordWeight / 100) : node.wordLimit;
    child.wordLimit = newLimit; // Update in-place for recursive calls
    return { updateOne: { filter: { _id: child._id }, update: { wordLimit: newLimit } } };
  });

  await Storynode.bulkWrite(updates);
  await Promise.all(children.map(child => recursiveUpdateWordLimits(child)));
};

/**
 * Given a template or storynode id, iteratively get all descendants of that tree.
 * Uses queue-based approach to avoid recursion and array spreading overhead.
 * @param tree - the tree element
 * @param model - the mongoose model
 * @returns - an array of all descendants of the element (not including the element itself)
 */
export const recursiveGetDescendants = async <T extends TreeDoc>(tree: T, model: mongoose.Model<T>) => {
  const descendants: T[] = [];
  const queue: mongoId[] = [...tree.children];

  while (queue.length > 0) {
    const currentLevel = await model.find({ _id: { $in: queue } });
    descendants.push(...currentLevel);
    queue.length = 0;
    currentLevel.forEach(node => queue.push(...node.children));
  }

  return descendants;
};

/**
 * Given a templateId (and optionally a parentId), recursively create a storynode tree from the template tree.
 * Uses Promise.all to create sibling nodes in parallel for better performance.
 * @param userId - the userId to assign to the new storynodes
 * @param templateId - the id of the template to create the storynode tree from
 * @param parentId - the id of the parent storynode (if any)
 * @return - the new storynode tree
 */
export const recursiveStorynodeFromTemplate = async (
  userId: mongoId,
  templateId: mongoId,
  parentId?: mongoId
): Promise<StorynodeDoc> => {
  const templateData = await Template.findOne({ _id: templateId, userId });
  appAssert(templateData, NOT_FOUND, 'Template not found');

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

// /**
//  * Given a storynode id, recursively update the depth of that storynode and all its descendants.
//  * @param storynodeId - the id of the storynode to update
//  * @param depth - the depth value to set
//  */
// export const recursiveUpdateDepth = async (storynodeId: mongoId, depth: number): Promise<void> => {
//   const storynode = await Storynode.findOne({ _id: storynodeId });
//   if (!storynode) return;

//   await Storynode.findOneAndUpdate({ _id: storynodeId }, { depth });

//   if (storynode.children && storynode.children.length > 0) {
//     for (const childId of storynode.children) {
//       await recursiveUpdateDepth(childId, depth + 1);
//     }
//   }
// };

// // Function to recursively convert a JSON object to a storynode
// const recursiveStorynodeFromJSON = async (json, parentid) => {
//     // TODO - implement this
// }