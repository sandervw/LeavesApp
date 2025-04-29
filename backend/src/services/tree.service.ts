import mongoose from 'mongoose';
import { TreeDoc } from '../models/tree.model';
import appAssert from '../utils/appAssert';
import { NOT_FOUND } from '../constants/http';



type findParams = {
    query: querystring.ParsedQs,
    userId: mongoose.Types.ObjectId
}

export default class elementService {

    constructor(model: mongoose.Model<TreeDoc>) {
        this.model = model;
        this.find = this.find.bind(this);
        this.findById = this.findById.bind(this);
        this.findChildren = this.findChildren.bind(this);
        this.upsert = this.upsert.bind(this);
        this.deleteById = this.deleteById.bind(this);
    }
    
    private model;

    /**
     * Finds all elements in the database that match the query and userId.
     * @param query - an optional query to filter
     * @param userId - the userId to filter by
     * @returns an array of elements that match the query and userId
     */
    async find({query, userId}: findParams){
        const userFilter = { userId };
        const result = await this.model.find({ ...query, ...userFilter }).sort({ createdAt: 'desc' });
        appAssert(result, NOT_FOUND, 'No elements found');
        return result;
    }

    async findById(id, user_id){
        if(!id || !mongoose.Types.ObjectId.isValid(id)) throw new Error('Not a valid ID');
        const element = await this.model.findOne({ _id: id, user_id });
        if (!element) throw new Error('No objects found.');
        return element;
    }

    async findChildren(id, user_id){
        if (!id || !mongoose.Types.ObjectId.isValid(id)) throw new Error('Not a valid ID');
        const element = await this.model.findOne({ _id: id, user_id });
        if (!element) throw new Error('No parent object found.');
        const childIds = element.children;
        return await this.model.find({ _id: { $in: childIds }, user_id });
    }

    async upsert(data, user_id){
        data.user_id = user_id; // Ensure user_id is set in the data
        if (data._id) {
            data.children = data.children.filter(child => child !== null);
            return await this.model.findOneAndUpdate({ _id: data._id, user_id }, data, { new: true });
        }
        return await this.model.create(data);
    }

    async deleteById(id, user_id){
        if (!id || !mongoose.Types.ObjectId.isValid(id)) throw new Error('Not a valid ID');
        const result = await this.model.findOneAndDelete({ _id: id, user_id });
        if (!result) throw new Error('No such object exists');
        return { 'Deleted': result };
    }

}