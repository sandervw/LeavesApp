import mongoose from 'mongoose';
import { TreeDoc } from '../models/tree.model';
import appAssert from '../utils/appAssert';
import { NOT_FOUND } from '../constants/http';

interface QueryParam {
    [key: string]: undefined | string | QueryParam | (string | QueryParam)[];
}
interface UserParam {
    userId: mongoose.Types.ObjectId
}
interface FindParams extends UserParam {
    query: QueryParam;
}

export default class ElementService {

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
     * Finds all the user's elements (matching a query if provided).
     * @param userId - the userId to filter by
     * @param query - an optional query to filter
     * @returns an array of elements that match the query and userId
     */
    async find({ userId, query }: FindParams){
        const userFilter = { userId };
        const result = await this.model.find({ ...query, ...userFilter }).sort({ createdAt: 'desc' });
        appAssert(result, NOT_FOUND, 'No elements found');
        return result;
    }

    async findById({ userId, id }: UserParam & { id: string }){
        if(!id || !mongoose.Types.ObjectId.isValid(id)) throw new Error('Not a valid ID');
        const element = await this.model.findOne({ _id: id, userId });
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