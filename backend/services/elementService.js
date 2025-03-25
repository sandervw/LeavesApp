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
        console.log(`Query = ${query}`);
        
        return query 
            ? await this.model.find(query).sort({ createdAt: 'desc' })
            : await this.model.find().sort({ createdAt: 'desc' });
    }

    async findById(args){

    }

    async findChildren(args){

    }

    async upsert(args){

    }

    async deleteById(args){

    }

}