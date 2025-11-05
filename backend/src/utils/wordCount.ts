import { StorynodeDoc, mongoId } from '../schemas/mongo.schema';
import { Storynode } from '../models/tree.model';

/**
 * Calculate word count from a text string
 * @param text - the text to count words in
 * @returns the number of words
 */
export const calculateWordCount = (text: string): number => {
  return text.trim().split(/\s+/).filter(word => word).length;
};

/**
 * Calculate total word count from an array of children nodes
 * @param children - array of storynode documents
 * @returns the sum of all children word counts
 */
export const calculateChildrenWordCount = (children: StorynodeDoc[]): number => {
  return children.reduce((acc, child) => acc + child.wordCount, 0);
};

/**
 * Collect all ancestors of a node in the tree
 * @param nodeId - the id of the starting node
 * @param userId - the userId to filter by
 * @returns array of ancestor nodes from parent to root
 */
export const collectAncestors = async (
  nodeId: mongoId,
  userId: mongoId
): Promise<StorynodeDoc[]> => {
  const ancestors: StorynodeDoc[] = [];
  let current = await Storynode.findOne({ _id: nodeId, userId });

  while (current?.parent) {
    current = await Storynode.findOne({ _id: current.parent, userId });
    if (current) ancestors.push(current);
  }

  return ancestors;
};

/**
 * Recursively update word counts for all parent nodes up the tree
 * @param node - the storynode whose parents will be updated
 * @param userId - the userId to filter by
 */
export const updateParentWordCounts = async (
  node: StorynodeDoc,
  userId: mongoId
): Promise<void> => {
  if (!node.parent) return;

  const ancestors = await collectAncestors(node._id, userId);

  // Update word counts for each ancestor
  for (const ancestor of ancestors) {
    const siblings = await Storynode.find({ _id: { $in: ancestor.children }, userId });
    const newWordCount = calculateChildrenWordCount(siblings);

    await Storynode.findOneAndUpdate(
      { _id: ancestor._id, userId },
      { wordCount: newWordCount }
    );
  }
};
