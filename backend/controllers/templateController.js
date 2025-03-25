import mongoose from "mongoose";
import elementController from "./elementController.js";
import {Template} from "../models/models.js";

class templateController extends elementController {

    constructor() {
        super(Template);
        this.delete = this.delete.bind(this);
    }

    async delete (req, res){
        try {
            const id = req.params.id;
            if(!id || !mongoose.Types.ObjectId.isValid(id)) res.status(404).json({error: 'Not a valid ID'});
            // First, need to delete all references to this template from parent templates
            const allTemplates = await Template.find();
            allTemplates.forEach(async (object) => {
                object.children = object.children.filter((child) => (child !== id && child !== null));
                await Template.updateOne({_id: object._id}, {children: object.children});
            })
            // Then, delete template itself
            const result = await Template.findByIdAndDelete(id);
            if(!result) res.status(404).json({error: 'No such object found'});
            else res.status(200).json(result);
        } catch (err) {
            console.log(err);
            res.status(404).json(err);
        }
    }
    

}


export default new templateController();