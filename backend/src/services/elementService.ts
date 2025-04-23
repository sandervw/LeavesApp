import mongoose from "mongoose";

export default class elementService {

    constructor(model) {
        this.model = model;
        this.find = this.find.bind(this);
        this.findById = this.findById.bind(this);
        this.findChildren = this.findChildren.bind(this);
        this.upsert = this.upsert.bind(this);
        this.deleteById = this.deleteById.bind(this);
    }

    async find(query, user_id){
        const userFilter = { user_id };
        return query 
            ? await this.model.find({ ...query, ...userFilter }).sort({ createdAt: 'desc' })
            : await this.model.find(userFilter).sort({ createdAt: 'desc' });
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
        return { "Deleted": result };
    }

}