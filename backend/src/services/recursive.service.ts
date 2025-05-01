import mongoose from 'mongoose';
import { StorynodeDoc, TreeDoc } from "../schemas/mongo.schema";
import { Storynode, Template } from '../models/tree.model';
import appAssert from '../utils/appAssert';
import { NOT_FOUND } from '../constants/http';

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
}

/**
 * Given a storynode, recursively update the word limits of all its children (based on their wordWeights).
 * * @param node - the storynode whose children will be updated
 */
export const recursiveUpdateWordLimits = async (node: StorynodeDoc): Promise<void> => {
    if(node.children && node.children.length > 0){
        const children: StorynodeDoc[] = await Storynode.find({ _id: { $in: node.children } });
        for (const child of children) {
            if(child.wordWeight) child.wordLimit = Math.floor(node.wordLimit * child.wordWeight / 100.00);
            else child.wordLimit = node.wordLimit;
            await Storynode.findOneAndUpdate({ _id: child._id }, { wordLimit: child.wordLimit }, { new: true });
            await recursiveUpdateWordLimits(child);
        }
    }
}

/**
 * Given a templateId (and optionally a parentId), recursively create a storynode tree from the template tree.
 * @param userId - the userId to assign to the new storynodes
 * @param templateId - the id of the template to create the storynode tree from
 * @param parentId - the id of the parent storynode (if any)
 * @return - the new storynode tree
 */
export const recursiveStorynodeFromTemplate = async (userId: mongoose.Types.ObjectId, templateId: string, parentId?: string): Promise<StorynodeDoc> => {
    // Create a new storynode with the template's data, making sure to give it a parent if supplied
    const templateData = await Template.findOne({ _id: templateId, userId }).getDataFields();
    appAssert(templateData, NOT_FOUND, 'Template not found');
    const storyData = (parentId
        ? { userId, ...templateData, parent: parentId }
        : { userId, ...templateData });
    let storynode: StorynodeDoc = await Storynode.create(storyData);
    // Then recursively add any children of the template
    if (templateData.children) {
        const children: StorynodeDoc[] = [];
        for (const child of templateData.children) {
            children.push(await recursiveStorynodeFromTemplate(userId, child, storynode._id.toString()));
        };
        // Update the parent with the new children
        storynode = await Storynode.findOneAndUpdate({ _id: storynode._id, userId }, { children: children.map(child => child._id) });
    }
    // base case: return the new storynode
    return storynode;
}

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

// // Function to recursively convert a template tree to a storynode
// const recursiveStorynodeFromTemplate = async (user_id, templateId, parentId) => {
//     // Create a new storynode with the template's data, making sure to give it a parent if supplied
//     const template = await Template.findOne({_id: templateId, user_id});
//     const storyData = (parentId
//         ? {user_id, name: template.name, type: template.type, text: template.text, parent: parentId}
//         : {user_id, name: template.name, type: template.type, text: template.text});
//     // If the template has a wordWeight, add that to the storynode
//     if(template.wordWeight) storyData.wordWeight = template.wordWeight;
//     console.log(storyData);
//     const storynode = await Storynode.create(storyData);
//     // Then recursively add any children of the template
//     if(template && template.children){
//         let storyNodeArr = [];
//         let childArr = template.children;
//         for (const child of childArr){
//             let result = await recursiveStorynodeFromTemplate(user_id, child, storynode._id);
//             // Add the child to the parent's children array
//             storyNodeArr.push(result._id);
//         };
//         // Update the parent with the new children
//         await Storynode.findOneAndUpdate({_id: storynode._id, user_id}, {children: storyNodeArr});
//     }
//     // base case: return the new storynode
//     return storynode;
// }

// // Function to recursively convert a JSON object to a storynode
// const recursiveStorynodeFromJSON = async (json, parentid) => {
//     console.log(json, parentid);
//     // TODO - implement this
// }