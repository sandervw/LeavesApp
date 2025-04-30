import mongoose from 'mongoose';
import TreeService from './tree.service';
import { Template } from '../models/models';
import { TemplateDoc } from '../schemas/mongo.schema';
import appAssert from '../utils/appAssert';
import { NOT_FOUND } from '../constants/http';
import { recursiveGetDescendants } from './recursive.service';


type UserParam = mongoose.Types.ObjectId;

class templateService extends TreeService<TemplateDoc> {

    constructor() {
        super(Template);
        this.deleteById = this.deleteById.bind(this);
    }

    async deleteById(userId: UserParam, id: string){
        const toDelete = await Template.findOne({ _id: id, userId });
        appAssert(toDelete, NOT_FOUND, 'Element not found');
        // First, delete reference to this template from parent template
        if (toDelete.parent) {
            const parent = await Template.findOne({ _id: toDelete.parent, userId });
            parent.children = parent.children.filter((child: string) => (child !== id && child !== null));
            parent.save();
        }
        // Next, delete all descendents of this template
        const descendents = await recursiveGetDescendants(toDelete, Template);
        await Template.deleteMany({ _id: { $in: descendents.map((descendent) => descendent._id) } });
        // Finally, delete this template
        return { 'Deleted': await Template.findByIdAndDelete(id) };
    }

}

export default new templateService();