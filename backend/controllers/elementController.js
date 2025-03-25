import mongoose from "mongoose";

export default class elementController {

    constructor(model) {
        this.model = model;

        this.find = this.find.bind(this);
        this.findById = this.findById.bind(this);
        this.findByName = this.findByName.bind(this);
        this.findChildren = this.findChildren.bind(this);
        this.post = this.post.bind(this);
        this.delete = this.delete.bind(this);
    }

    async find(req, res){
        try {
            let elements;
            if (req.query) elements = await this.model.find(req.query).sort({createdAt: 'desc'});
            else elements = await this.model.find().sort({createdAt: 'desc'});
            res.status(200).json(elements);
        } catch (err) {
            console.log(err);
            res.status(404).json(err);        
        }
    }

    async findById(req, res){
        try {
            const id = req.params.id;
            if(!id || !mongoose.Types.ObjectId.isValid(id)) res.status(404).json({error: 'Not a valid ID'});
            const element = await this.model.findById(id);
            if (!element) res.status(404).json({error: 'No objects found.'});
            return res.status(200).json(element);
        } catch (err) {
            console.log(err);
            res.status(404).json(err);        
        }
    }

    async findByName (req, res){
        try {
            const name = req.params.name;
            const elements = await this.model.find({name}).sort({createdAt: 'desc'});
            if(!elements) res.status(404).json({error: 'No objects found.'});
            res.status(200).json(elements);        
        } catch (err) {
            console.log(err);
            res.status(404).json(err);
        }
    }

    async findChildren(req, res){
        try {
            const id = req.params.id;
            if(!id || !mongoose.Types.ObjectId.isValid(id)) res.status(404).json({error: 'Not a valid ID'});
            const element = await this.model.findById(id);
            if (!element) res.status(404).json({error: 'No parent object found.'});
            const childIds = element.children;
            let childArr = await this.model.find({'_id': childIds});
            res.status(200).json(childArr);
        } catch (err) {
            console.log(err);
            res.status(404).json(err);        
        }
    }

    async post(req, res){
        try {
            let result;
            // Send an update
            if (req.body._id){
                let filter = {_id: req.body._id};
                result = await this.model.findByIdAndUpdate(req.body._id, req.body, {new: true});
            }
            // Send a new storynode
            else result = await this.model.create(req.body);
            res.status(200).json(result);
        } catch (err) {
            console.log(err);
            res.status(404).json(err);        
        }
    }

    async delete(req, res){
        try {
            const id = req.params.id;
            if(!id || !mongoose.Types.ObjectId.isValid(id)) res.status(404).json({error: 'Not a valid ID'});
            const result = await this.model.findByIdAndDelete(id);
            if(!result) res.status(404).json({error: 'No such promptchain exists'});
            res.status(200).json(result);
        } catch (err) {
            console.log(err);
            res.status(404).json(err);
        }
    }

}