import mongoose from 'mongoose';
import ElementService from './tree.service.js';
import { Template } from '../models/models.js';
import { recursiveDelete } from './recursiveService.js';

class templateService extends ElementService {

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
        // Next, recursively delete the template itself
        return {'Deleted:': await recursiveDelete(id)};
    }

}

export default new templateService();