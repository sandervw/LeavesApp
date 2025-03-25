// import mongoose from "mongoose";
// import elementController from "./elementController.js";
// import {Storynode} from "../models/models.js";
// import {readTxtAsJSON, writeArrayToFile} from "../services/fileService.js";
// import {
//     recursiveDelete,
//     recursiveGetBlobs,
//     recursiveUpdateWordLimits,
//     recursiveStorynodeFromTemplate ,
//     recursiveStorynodeFromJSON
// } from "../services/recursiveService.js";

// class storynodeController extends elementController {

//     constructor() {
//         super(Storynode);
//         this.postfromtemplate = this.postfromtemplate.bind(this);
//         this.generateblobs = this.generateblobs.bind(this);
//         this.generatestory = this.generatestory.bind(this);
//         this.delete = this.delete.bind(this);
//     }

//     // Creates a storynode from a template (or adds a template as a child)
//     async postfromtemplate(req, res){
//         try {
//             let result;
//             // Send an update
//             if (req.body.parentId){
//                 let newChild = await recursiveStorynodeFromTemplate(req.body.templateId, req.body.parentId);
//                 let parent = await Storynode.findById(req.body.parentId)
//                 if(parent){
//                     parent.children.push(newChild._id);
//                     await Storynode.findOneAndUpdate({_id: parent._id}, {children: parent.children}, {new: true});
//                 }
//                 result = newChild;
//             }
//             // Send a new storynode
//             else result = await recursiveStorynodeFromTemplate(req.body.templateId);
//             res.status(200).json(result);
//         } catch (err) {
//             console.log(err);
//             res.status(404).json(err);        
//         }
//     }

//     // Creates a storynode from a file
//     async postfromfile(req, res){
//         try {
//             const filename = req.body.filename;
//             const json = await readTxtAsJSON(filename);
//             let storynode = await Storynode.create({
//                 name: filename,
//                 type: 'story',
//                 text: `imported from ${filename}`,
//                 children: []
//             });
//             let children = await recursiveStorynodeFromJSON(json, storynode._id);
//             await Storynode.findOneAndUpdate({_id: storynode._id}, {children});
//             res.status(200).json(storynode);
//         } catch (err) {
//             console.log(err);
//             res.status(404).json(err);
//         }
//     }

//     // Save a storynode to a file
//     async posttofile(req, res){
//         try {
//             const id = req.body.id;
//             if(!id || !mongoose.Types.ObjectId.isValid(id)) res.status(404).json({error: 'Not a valid ID'});
            
//             // Recursively retrieve all the blobs of the given node
//             const storynode = await Storynode.findById(id);
//             let storyBlobs = await recursiveGetBlobs(storynode._id);

//             let result = await writeArrayToFile(storyBlobs.map((blob) => blob.content), `${storynode.name}.txt`);
//             res.status(200).json({success: result});
//         } catch (err) {
//             console.log(err);
//             res.status(404).json(err);
//         }
//     }
    
//     async delete(req, res){
//         try {
//             const id = req.params.id;
//             if(!id || !mongoose.Types.ObjectId.isValid(id)) res.status(404).json({error: 'Not a valid ID'});
//             const toDelete = await Storynode.findById(id);        
//             if(!toDelete) res.status(404).json({error: 'No such object found'});
//             // First, need to delete the reference to toDelete from its parent
//             const parent = await Storynode.findById(toDelete.parent);
//             if(parent){
//                 parent.children = parent.children.filter((child) => (child != id));
//                 await Storynode.updateOne({_id: parent._id}, {children: parent.children});
//             } 
//             // Next, recursively delete toDelete and all children of toDelete
//             const result = await recursiveDelete(toDelete._id);
//             res.status(200).json(result);
//         } catch (err) {
//             console.log(err);
//             res.status(404).json(err);        
//         }
//     }

//     async post(req, res){
//         try {
//             let result;
//             // Send an update
//             if (req.body._id){
//                 let filter = {_id: req.body._id};
//                 result = await Storynode.findByIdAndUpdate(req.body._id, req.body, {new: true});
//                 // If this element is a story and it's word limit had changed, update the limit of all children recursively
//                 if(result.type === 'story' && req.body.wordLimit){
//                     await recursiveUpdateWordLimits(result, req.body.wordLimit);
//                 }
//             }
//             // Send a new storynode
//             else result = await Storynode.create(req.body);
//             res.status(200).json(result);
//         } catch (err) {
//             console.log(err);
//             res.status(404).json(err);        
//         }
//     }

// }

// export default new storynodeController();