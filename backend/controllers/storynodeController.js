import mongoose from "mongoose";
import elementController from "./elementController.js";
import {Storynode} from "../models/models.js";
import {getConversation} from "../services/AIService.js";
import {readTxtAsJSON, writeArrayToFile} from "../services/fileService.js";
import {
    recursiveDelete,
    recursiveGetBlobs,
    recursiveUpdateWordLimits,
    recursiveStorynodeFromTemplate ,
    recursiveStorynodeFromJSON
} from "../services/recursiveService.js";

class storynodeController extends elementController {

    constructor() {
        super(Storynode);
        this.postfromtemplate = this.postfromtemplate.bind(this);
        this.generateblobs = this.generateblobs.bind(this);
        this.generatestory = this.generatestory.bind(this);
        this.delete = this.delete.bind(this);
    }

    // Creates a storynode from a template (or adds a template as a child)
    async postfromtemplate(req, res){
        try {
            let result;
            // Send an update
            if (req.body.parentId){
                let newChild = await recursiveStorynodeFromTemplate(req.body.templateId, req.body.parentId);
                let parent = await Storynode.findById(req.body.parentId)
                if(parent){
                    parent.children.push(newChild._id);
                    await Storynode.findOneAndUpdate({_id: parent._id}, {children: parent.children}, {new: true});
                }
                result = newChild;
            }
            // Send a new storynode
            else result = await recursiveStorynodeFromTemplate(req.body.templateId);
            res.status(200).json(result);
        } catch (err) {
            console.log(err);
            res.status(404).json(err);        
        }
    }

    // Creates a storynode from a file
    async postfromfile(req, res){
        try {
            const filename = req.body.filename;
            const json = await readTxtAsJSON(filename);
            let storynode = await Storynode.create({
                name: filename,
                type: 'story',
                text: `imported from ${filename}`,
                children: []
            });
            let children = await recursiveStorynodeFromJSON(json, storynode._id);
            await Storynode.findOneAndUpdate({_id: storynode._id}, {children});
            res.status(200).json(storynode);
        } catch (err) {
            console.log(err);
            res.status(404).json(err);
        }
    }

    // Save a storynode to a file
    async posttofile(req, res){
        try {
            const id = req.body.id;
            if(!id || !mongoose.Types.ObjectId.isValid(id)) res.status(404).json({error: 'Not a valid ID'});
            
            // Recursively retrieve all the blobs of the given node
            const storynode = await Storynode.findById(id);
            let storyBlobs = await recursiveGetBlobs(storynode._id);

            let result = await writeArrayToFile(storyBlobs.map((blob) => blob.content), `${storynode.name}.txt`);
            res.status(200).json({success: result});
        } catch (err) {
            console.log(err);
            res.status(404).json(err);
        }
    }
    
    async generateblobs(req, res){
        try {
            const id = req.body.id;
            if(!id || !mongoose.Types.ObjectId.isValid(id)) res.status(404).json({error: 'Not a valid ID'});
    
            // Recursively retrieve all the blobs of the given node
            const storynode = await Storynode.findById(id);
            let storyBlobs = await recursiveGetBlobs(storynode._id);
            // If there are overall style/filter chains, set them
            let storyFilter;
            let storyStyle;
            if(storynode.promptchains){
                for (const chain of storynode.promptchains) {
                    if (chain.type === 'filter') storyFilter = chain.prompts.flat();
                    if (chain.type === 'style') storyStyle = chain.prompts.flat();
                }
            }

            // Now create two lists: the main requests (text+structure), and filters to apply afterwards
            let mainRequests = [];
            let filters = [];
            for (const blob of storyBlobs){
                let firstRequest = blob.text;
                let structure = [];
                let style = [];
                let filter = [];
                // If there are overall style/filter chains, use them instead of the detailed ones
                if(storyFilter) filter = storyFilter;
                if(storyStyle) style = storyStyle;
                // Sort chains into filter and firstPrompt
                for (const chain of blob.promptchains) {
                    if(chain.type === 'style') style = chain.prompts.flat();
                    else if(chain.type === 'filter') filter = chain.prompts.flat();
                    else structure = chain.prompts.flat();
                };
                let firstPrompts = [...structure, ...style];
    
                // Concatenate the main text with any generic/structure/style chains
                for (const prompt of firstPrompts) {
                    firstRequest = `${firstRequest}. ${prompt}`;
                };

                mainRequests.push(firstRequest);
                filters.push(filter);
            };

            // Concatenate the main requests and their filters
            let messageArrays = [];
            for (const [index, request] of mainRequests.entries()){
                messageArrays.push([`I need you to write a blob. ${request}.`, ...filters[index]]);
            }

            // Get the results
            let finalResults = [];
            for (const messages of messageArrays){
                const results = await getConversation(messages);
                finalResults = [...finalResults, results[results.length-1]];
            }
            
            for (const [index, blob] of storyBlobs.entries()){
                blob.content = finalResults[index].content;
                blob.isComplete = true;
                await Storynode.findOneAndUpdate({_id: blob._id}, {content: blob.content, isComplete: blob.isComplete});
            }
            res.status(200).json(finalResults);
        } catch (err) {
            console.log(err);
            res.status(404).json(err);
        }
    }
    
    async generatestory(req, res){
        try {
            const id = req.body.id;
            if(!id || !mongoose.Types.ObjectId.isValid(id)) res.status(404).json({error: 'Not a valid ID'});
    
            // Recursively retrieve all the blobs of the given node
            const storynode = await Storynode.findById(id);
            let storyBlobs = await recursiveGetBlobs(storynode._id);
            // If there are overall style/filter chains, set them
            let storyFilter;
            let storyStyle;
            if(storynode.promptchains){
                for (const chain of storynode.promptchains) {
                    if (chain.type === 'filter') storyFilter = chain.prompts.flat();
                    if (chain.type === 'style') storyStyle = chain.prompts.flat();
                }
            }
            
            // Now create two lists: the main requests (text+structure), and filters to apply afterwards
            let mainRequests = [];
            for (const blob of storyBlobs){
                let firstRequest = blob.text;
                let structure = [];
                let style = [];
                
                for (const chain of blob.promptchains) {
                    if(chain.type === 'style') style = chain.prompts.flat();
                    else if(chain.type === 'structure' || chain.type === 'generic') structure = chain.prompts.flat();
                };
                if(storyStyle) style = storyStyle; // If there are overall style, use that instead
                let firstPrompts = [...structure, ...style];
    
                // Concatenate the main text with any generic/structure/style chains
                for (const prompt of firstPrompts) {
                    firstRequest = `${firstRequest}. ${prompt}`;
                };

                mainRequests.push(firstRequest);
            };
            // Now, for each of the main requests, generate its response
            mainRequests = mainRequests.map((request, index) => {
                if (index===0) return `I need you to write something. ${request}.`
                else return `Now write the next part. ${request}.`;
            });
            const finalResults = await getConversation(mainRequests);
            console.log(finalResults);
            
            // Update the blob storynode content with the final results
            for (const [index, blob] of storyBlobs.entries()){
                blob.content = finalResults[index*2+1].content;
                blob.isComplete = true;
                await Storynode.findOneAndUpdate({_id: blob._id}, {content: blob.content, isComplete: blob.isComplete});
            }
            res.status(200).json(finalResults);
        } catch (err) {
            console.log(err);
            res.status(404).json(err);
        }
    }

    async applyfilters(req, res){
        try {
            const id = req.body.id;
            if(!id || !mongoose.Types.ObjectId.isValid(id)) res.status(404).json({error: 'Not a valid ID'});
    
            // Recursively retrieve all the blobs of the given node
            const storynode = await Storynode.findById(id);
            let storyBlobs = await recursiveGetBlobs(storynode._id);
            // If there is an overall story filter chain, set it
            let storyFilter;
            if(storynode.promptchains){
                for (const chain of storynode.promptchains) {
                    if (chain.type === 'filter') storyFilter = chain.prompts.flat();
                }
            }
            
            // Now create the filters list
            let filters = [];
            for (const blob of storyBlobs){
                let filter = [];
                for (const chain of blob.promptchains) {
                    if(chain.type === 'filter') filter = chain.prompts.flat();
                };
                // If there's a story filter, use it instead
                if(storyFilter) filter = storyFilter;
                filters.push(filter);
            };

            // Now, for each blob, apply the filters
            let filterPrompts = [];
            for (const [index, filter] of filters.entries()){
                let firstFilter = `I need you to modify some writing. ${filter[0]} The writing is: ${storyBlobs[index].content}. Remove any pre- or post-text.`;
                filterPrompts.push([firstFilter, ...filter.slice(1)]);
            }
            
            let finalResults = [];
            for (const filter of filterPrompts){
                const filterResults = await getConversation(filter);
                finalResults = [...finalResults, filterResults[filterResults.length-1]];
            }
            console.log(finalResults);
            
            // Update the blob storynode content with the final results
            for (const [index, blob] of storyBlobs.entries()){
                blob.content = finalResults[index].content;
                blob.isComplete = true;
                await Storynode.findOneAndUpdate({_id: blob._id}, {content: blob.content, isComplete: blob.isComplete});
            }
            res.status(200).json(finalResults);       
        } catch (err) {
            console.log(err);
            res.status(404).json(err);
        }
    }

    async generateprompts(req, res){
        try {
            const id = req.body.id;
            if(!id || !mongoose.Types.ObjectId.isValid(id)) res.status(404).json({error: 'Not a valid ID'});
    
            // Recursively retrieve all the blobs of the given node
            const storynode = await Storynode.findById(id);
            let storyBlobs = await recursiveGetBlobs(storynode._id);
            
            // Now create a list of the blob contents for which we want prompts
            let requests = [];
            requests = storyBlobs.map((blob, index) => {
                if (index===0) return `What Prompt could I give you to produce a blob like the following: "${blob.content}"? Return only the main response. Remove pre-text and post-text.`
                else return `What could I follow-up with for the next blob like this: "${blob.content}"? Return only the main response. Remove pre-text and post-text.`;
            });
            
            const results = await getConversation(requests);
            const finalResults = results.filter((result, index) => (index%2===1));
            console.log(finalResults);
            
            // Update the blob storynode content with the final results
            for (const [index, blob] of storyBlobs.entries()){
                blob.text = finalResults[index].content;
                await Storynode.findOneAndUpdate({_id: blob._id}, {text: blob.text, isComplete: blob.isComplete});
            }
            res.status(200).json(finalResults);
        } catch (err) {
            console.log(err);
            res.status(404).json(err);
        }
    }
    
    async delete(req, res){
        try {
            const id = req.params.id;
            if(!id || !mongoose.Types.ObjectId.isValid(id)) res.status(404).json({error: 'Not a valid ID'});
            const toDelete = await Storynode.findById(id);        
            if(!toDelete) res.status(404).json({error: 'No such object found'});
            // First, need to delete the reference to toDelete from its parent
            const parent = await Storynode.findById(toDelete.parent);
            if(parent){
                parent.children = parent.children.filter((child) => (child != id));
                await Storynode.updateOne({_id: parent._id}, {children: parent.children});
            } 
            // Next, recursively delete toDelete and all children of toDelete
            const result = await recursiveDelete(toDelete._id);
            res.status(200).json(result);
        } catch (err) {
            console.log(err);
            res.status(404).json(err);        
        }
    }

    async post(req, res){
        try {
            let result;
            // Send an update
            if (req.body._id){
                let filter = {_id: req.body._id};
                result = await Storynode.findByIdAndUpdate(req.body._id, req.body, {new: true});
                // If this element is a story and it's word limit had changed, update the limit of all children recursively
                if(result.type === 'story' && req.body.wordLimit){
                    await recursiveUpdateWordLimits(result, req.body.wordLimit);
                }
            }
            // Send a new storynode
            else result = await Storynode.create(req.body);
            res.status(200).json(result);
        } catch (err) {
            console.log(err);
            res.status(404).json(err);        
        }
    }

}

export default new storynodeController();