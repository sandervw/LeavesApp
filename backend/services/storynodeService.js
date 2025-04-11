import mongoose from "mongoose";
import elementService from "./elementService.js";
import {Storynode} from "../models/models.js";
import {readTxtAsJSON, writeArrayToFile} from "../services/fileService.js";
import {
    recursiveDelete,
    recursiveGetLeafs,
    recursiveUpdateWordLimits,
    recursiveStorynodeFromTemplate ,
    recursiveStorynodeFromJSON
} from "../services/recursiveService.js";

class storynodeService extends elementService {

    constructor() {
        super(Storynode);
        this.upsert = this.upsert.bind(this);
        this.deleteById = this.deleteById.bind(this);
        this.addFromTemplate = this.addFromTemplate.bind(this);
        this.addFromFile = this.addFromFile.bind(this);
        this.saveToFile = this.saveToFile.bind(this);
    }

    async upsert(data, user_id){
        data.user_id = user_id; // Ensure user_id is set in the data
        if (data._id){ // Send an update
            let result = await Storynode.findOneAndUpdate({ _id: data._id, user_id }, data, {new: true});
            // If this is a root node and it's word limit changed, update the limit of all children recursively
            if(result.type === 'root' && data.wordLimit){
                await recursiveUpdateWordLimits(result, data.wordLimit);
            }
            return result;
        }
        // Send a new storynode
        return await Storynode.create(data);
    }

    async deleteById(id, user_id){
        if(!id || !mongoose.Types.ObjectId.isValid(id)) throw new Error('Not a valid ID');
        const toDelete = await Storynode.findOne({ _id: id, user_id });        
        if(!toDelete) throw new Error('No such object found');
        // First, delete the reference to toDelete from its parent
        const parent = await Storynode.findById(toDelete.parent);
        if(parent){
            parent.children = parent.children.filter((child) => (child != id));
            await Storynode.updateOne({_id: parent._id}, {children: parent.children});
        } 
        // Next, recursively delete toDelete and all children
        return {"Deleted:": await recursiveDelete(toDelete._id)};
    }

    // Creates a storynode from a template (or adds a template as a child)
    async addFromTemplate(data, user_id){
        // Add a child
        if (data.parentId){
            let newChild = await recursiveStorynodeFromTemplate(user_id, data.templateId, data.parentId);
            let parent = await Storynode.findById(data.parentId)
            if(parent){
                parent.children.push(newChild._id);
                await Storynode.findOneAndUpdate({_id: parent._id, user_id}, {children: parent.children}, {new: true});
            }
            return newChild;
        }
        // Or, send a new storynode
        else return await recursiveStorynodeFromTemplate(user_id, data.templateId);
    }

    // Creates a storynode from a file
    async addFromFile(filename, user_id){
        const json = await readTxtAsJSON(filename);
        let storynode = await Storynode.create({
            user_id,
            name: filename,
            type: 'root',
            text: `imported from ${filename}`,
            children: []
        });
        let children = await recursiveStorynodeFromJSON(json, storynode._id);
        await Storynode.findOneAndUpdate({_id: storynode._id, user_id}, {children});
        return storynode;
    }

    // Save a storynode to a file
    async saveToFile(id, user_id){
        if(!id || !mongoose.Types.ObjectId.isValid(id)) throw new Error('Not a valid ID');
        // Recursively retrieve all the nodes
        const storynode = await Storynode.findOne({ _id: id, user_id });
        let storyLeafs = await recursiveGetLeafs(storynode._id);
        let result = await writeArrayToFile(storyLeafs.map((leaf) => leaf.text), `${storynode.name}.txt`);
        res.status(200).json({success: result});
    }

}

export default new storynodeService();