import mongoose from 'mongoose';
import { TreeDoc } from '../schemas/mongo.schema';
import appAssert from '../utils/appAssert';
import { NOT_FOUND } from '../constants/http';

type QueryParam = {
    [key: string]: undefined | string | QueryParam | (string | QueryParam)[];
}
type UserParam = mongoose.Types.ObjectId;

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
     * Returns all the user's elements (matching a query if provided).
     * @param userId - the userId to filter by
     * @param query - an optional query to filter
     */
    async find({ userId, query }: { userId: UserParam, query?: QueryParam }) {
        const result = await this.model.find({ userId, ...query }).sort({ createdAt: -1 });
        appAssert(result, NOT_FOUND, 'No elements found');
        return result;
    }

    /**
     * Return a single element by ID
     * @param userId - the userId to filter by
     * @param id - the id of the element to find
     */
    async findById({ userId, id }: { userId: UserParam, id: string }) {
        const result = await this.model.findOne({ _id: id, userId });
        appAssert(result, NOT_FOUND, 'No such object exists');
        return result;
    }

    /**
     * Returns all the children of a given element
     * @param userId - the userId to filter by
     * @param id - the id of the parent element
     */
    async findChildren({ userId, id }: { userId: UserParam, id: string }) {
        const parent = await this.model.findOne({ _id: id, userId });
        appAssert(parent, NOT_FOUND, 'Parent element not found');
        const children = await this.model.find({ _id: { $in: parent.children }, userId });
        appAssert(children, NOT_FOUND, 'No children found');
        return children;
    }

    async upsert({ userId, data }: { userId: UserParam, data: TreeDoc }) {
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