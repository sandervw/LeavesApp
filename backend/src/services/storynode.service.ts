import mongoose from 'mongoose';
import TreeService from './tree.service';
import { Storynode } from '../models/models';
import { StorynodeDoc } from '../schemas/mongo.schema';
import appAssert from '../utils/appAssert';
import { NOT_FOUND } from '../constants/http';
import { recursiveGetDescendants, recursiveUpdateWordLimits } from './recursive.service';

type UserParam = mongoose.Types.ObjectId;

class storynodeService extends TreeService<StorynodeDoc> {

    constructor() {
        super(Storynode);
        this.upsert = this.upsert.bind(this);
        this.addFromTemplate = this.addFromTemplate.bind(this);
        this.addFromFile = this.addFromFile.bind(this);
        this.saveToFile = this.saveToFile.bind(this);
    }

    /**
     * Upserts a storynode (creates or updates it).
     * Note: this also updates the word count (of storynode) and word limits of childrne (roots only).
     * @param userId - the userId to filter by
     * @param data - the data to upsert
     */
    async upsert(userId: UserParam, data: StorynodeDoc){
        // UPDATE STORYNODE
        if (data._id){
            // Check if the storynode exists
            // Set the word count (based on children or text)
            if (data.children && data.children.length > 0) {
                data.children = data.children.filter(child => child !== null); // Clean up from frontend
                let children = await Storynode.find({ _id: { $in: data.children }, userId });
                appAssert(children.length === data.children.length, NOT_FOUND, 'Some children not found');
                data.wordCount = children.reduce((acc: number, child: StorynodeDoc) => acc + child.wordCount, 0);
            }
            else data.wordCount = data.text.trim().split(/\s+/).filter(word => word).length; 
            // If the storynode is a root, set the word limit for its children
            if(data.type === 'root' && data.wordLimit){
                await recursiveUpdateWordLimits(data);
            }
            const result = await Storynode.findOneAndUpdate({ _id: data._id, userId }, data, { new: true });
            appAssert(result, NOT_FOUND, 'Storynode not found');
            return result;
        }
        // CREATE STORYNODE
        else{
            data.userId = userId; // Ensure user_id is set in the data
            return await Storynode.create(data);
        }
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