import { Element } from '../models/elementModel.js';
import { Storynode, Template} from '../models/models.js';

// Function to recursively delete elements
const recursiveDelete = async (id) => {
    let toDelete = await Element.findById(id); 
    if(toDelete && toDelete.children){
        let childArr = toDelete.children;
        for (const child of childArr){
            recursiveDelete(child);
        };
    }
    return await Element.findByIdAndDelete(id);
}

// Function to recursively get all nodes of a story/template, given a start Id (inclusive)
const recursiveGet = async (id) => {
    let toGet = await Element.findById(id);
    let nodeArr = [];
    if(toGet) nodeArr.push(toGet);
    if(toGet && toGet.children){
        let childArr = toGet.children;
        for (const child of childArr){
            let childNode = await Element.findById(child);
            nodeArr.push(childNode);
            nodeArr = [...nodeArr, ...await recursiveGet(child)];
        };
    }
    return nodeArr;
}

// Function to recursively get only the base nodes (leaves) of a story, given a start Id (inclusive)
const recursiveGetLeafs = async (id) => {
    let toGet = await Element.findById(id);
    let blobArr = [];
    if(toGet && toGet.type == 'leaf') blobArr.push(toGet);
    if(toGet && toGet.children){
        let childArr = toGet.children;
        for (const child of childArr){
            let childNode = await Element.findById(child);
            if(childNode.type == 'leaf') blobArr.push(childNode);
            else blobArr = [...blobArr, ...await recursiveGetBlobs(child)];
        };
    }
    return blobArr;
}

// Function to recursively update the word limits of a storynode
const recursiveUpdateWordLimits = async (node, wordLimit) => {
    let currentElement = node;
    if(currentElement && currentElement.children){
        let childArr = currentElement.children;
        for (const childId of childArr){
            let child = await Storynode.findById(childId);
            child.wordWeight ? child.wordLimit = Math.floor(wordLimit * child.wordWeight/100.00) : child.wordLimit = wordLimit;
            await Storynode.findOneAndUpdate({_id: child._id}, {wordLimit: child.wordLimit});
            await recursiveUpdateWordLimits(child, child.wordLimit);
        };
    }
    return;
}

// Function to recursively convert a template tree to a storynode
const recursiveStorynodeFromTemplate = async (user_id, templateId, parentId) => {
    // Create a new storynode with the template's data, making sure to give it a parent if supplied
    const template = await Template.findOne({_id: templateId, user_id});
    const storyData = (parentId
        ? {user_id, name: template.name, type: template.type, text: template.text, parent: parentId}
        : {user_id, name: template.name, type: template.type, text: template.text});
    // If the template has a wordWeight, add that to the storynode
    if(template.wordWeight) storyData.wordWeight = template.wordWeight;
    console.log(storyData);
    const storynode = await Storynode.create(storyData);
    // Then recursively add any children of the template
    if(template && template.children){
        let storyNodeArr = [];
        let childArr = template.children;
        for (const child of childArr){
            let result = await recursiveStorynodeFromTemplate(user_id, child, storynode._id);
            // Add the child to the parent's children array
            storyNodeArr.push(result._id);
        };
        // Update the parent with the new children
        await Storynode.findOneAndUpdate({_id: storynode._id, user_id}, {children: storyNodeArr});
    }
    // base case: return the new storynode
    return storynode;
}

// Function to recursively convert a JSON object to a storynode
const recursiveStorynodeFromJSON = async (json, parentid) => {
    console.log(json, parentid);
    // TODO - implement this
}

export {
    recursiveDelete,
    recursiveGet,
    recursiveGetLeafs,
    recursiveUpdateWordLimits,
    recursiveStorynodeFromTemplate,
    recursiveStorynodeFromJSON
};