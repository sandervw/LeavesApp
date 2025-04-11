import mongoose from "mongoose";
import elementService from "./elementService.js";
import { Template } from "../models/models.js";

class templateService extends elementService {

    constructor() {
        super(Template);
        this.deleteById = this.deleteById.bind(this);
    }

    async deleteById(id, user_id){
        if(!id || !mongoose.Types.ObjectId.isValid(id)) throw new Error('Not a valid ID');
        // First, need to delete all references to this template from parent templates
        const allUserTemplates = await Template.find({user_id});
        allUserTemplates.forEach(async (object) => {
            object.children = object.children.filter((child) => (child !== id && child !== null));
            await Template.updateOne({_id: object._id}, {children: object.children});
        })
        // Then, delete template itself
        const result = await Template.findOneAndDelete({ _id: id, user_id });
        if(!result) throw new Error('No such object exists');
        return {"Deleted:": result};
    }

}

export default new templateService();