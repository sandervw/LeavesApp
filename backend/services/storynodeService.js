import mongoose from "mongoose";
import elementService from "./elementService.js";
import {Storynode} from "../models/models.js";
import {readTxtAsJSON, writeArrayToFile} from "../services/fileService.js";
import {
    recursiveDelete,
    recursiveGetBlobs,
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

    async upsert(data){
        let result;
        if (data._id){ // Send an update
            result = await Storynode.findByIdAndUpdate(data._id, data, {new: true});
            // If this is a root node and it's word limit changed, update the limit of all children recursively
            if(result.type === 'root' && data.wordLimit){
                await recursiveUpdateWordLimits(result, data.wordLimit);
            }
        }
        // Send a new storynode
        else result = await Storynode.create(data);
        return result;
    }

    async deleteById(id){
        if(!id || !mongoose.Types.ObjectId.isValid(id)) throw new Error('Not a valid ID');
        const toDelete = await Storynode.findById(id);        
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
    async addFromTemplate(data){
        // Add a child
        if (data.parentId){
            let newChild = await recursiveStorynodeFromTemplate(data.templateId, data.parentId);
            let parent = await Storynode.findById(data.parentId)
            if(parent){
                parent.children.push(newChild._id);
                await Storynode.findOneAndUpdate({_id: parent._id}, {children: parent.children}, {new: true});
            }
            return newChild;
        }
        // Or, send a new storynode
        else return await recursiveStorynodeFromTemplate(data.templateId);
    }

    // Creates a storynode from a file
    async addFromFile(filename){
        const json = await readTxtAsJSON(filename);
        let storynode = await Storynode.create({
            name: filename,
            type: 'story',
            text: `imported from ${filename}`,
            children: []
        });
        let children = await recursiveStorynodeFromJSON(json, storynode._id);
        await Storynode.findOneAndUpdate({_id: storynode._id}, {children});
        return storynode;
    }

    // Save a storynode to a file
    async saveToFile(id){
        if(!id || !mongoose.Types.ObjectId.isValid(id)) throw new Error('Not a valid ID');
        // Recursively retrieve all the nodes
        const storynode = await Storynode.findById(id);
        let storyBlobs = await recursiveGetBlobs(storynode._id);
        let result = await writeArrayToFile(storyBlobs.map((blob) => blob.content), `${storynode.name}.txt`);
        res.status(200).json({success: result});
    }

}

export default new storynodeService();