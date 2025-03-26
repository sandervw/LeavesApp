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

    async find(query){
        return query 
            ? await this.model.find(query).sort({ createdAt: 'desc' })
            : await this.model.find().sort({ createdAt: 'desc' });
    }

    async findById(id){
        if(!id || !mongoose.Types.ObjectId.isValid(id)) throw new Error('Not a valid ID');
        const element = await this.model.findById(id);
        if (!element) throw new Error('No objects found.');
        return element
    }

    async findChildren(id){
        if (!id || !mongoose.Types.ObjectId.isValid(id)) throw new Error('Not a valid ID');
        const element = await this.model.findById(id);
        if (!element) throw new Error('No parent object found.');
        const childIds = element.children;
        return await this.model.find({'_id': childIds});
    }

    async upsert(data){
        if (data._id) {
            return await this.model.findByIdAndUpdate(data._id, data, { new: true });
        }
        return await this.model.create(data);
    }

    async deleteById(id){
        if (!id || !mongoose.Types.ObjectId.isValid(id)) throw new Error('Not a valid ID');
        const result = await this.model.findByIdAndDelete(id);
        if (!result) throw new Error('No such object exists');
        return {"Deleted:": result};
    }

}