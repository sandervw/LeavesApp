import storynodeService from "../services/storynodeService.js";

class storynodeController {

    constructor() {
        this.get = this.get.bind(this);
        this.getById = this.getById.bind(this);
        this.getChildren = this.getChildren.bind(this);
        this.post = this.post.bind(this);
        this.deleteById = this.deleteById.bind(this);
        this.postFromTemplate = this.postFromTemplate.bind(this);
        this.postFromFile = this.postFromFile.bind(this);
        this.postToFile = this.postToFile.bind(this);
    }

    async get(req, res){
        try {
            console.log("get storynodes", req.query);
            
            const storynodes = await storynodeService.find(req.query);
            res.status(200).json(storynodes);
        } catch (err) {
            console.log(err);
            res.status(404).json(err);        
        }
    }

    async getById(req, res){
        try {
            const storynode = await storynodeService.findById(req.params.id);
            return res.status(200).json(storynode);
        } catch (err) {
            console.log(err);
            res.status(404).json(err);        
        }
    }
    
    async getChildren(req, res){
        try {
            const children = await storynodeService.findChildren(req.params.id);
            res.status(200).json(children);
        } catch (err) {
            console.error(err);
            res.status(404).json(err);
        }
    }
    
    async post(req, res){
        try {
            const result = await storynodeService.upsert(req.body);
            res.status(200).json(result);
        } catch (err) {
            console.error(err);
            res.status(404).json(err);
        }
    }
    
    async deleteById(req, res){
        try {
            const result = await storynodeService.deleteById(req.params.id);
            res.status(200).json(result);
        } catch (err) {
            console.error(err);
            res.status(404).json(err);
        }
    }

    async postFromTemplate(req, res){
        try {
            const result = await storynodeService.addFromTemplate(req.body);
            res.status(200).json(result);
        } catch (err) {
            console.error(err);
            res.status(404).json(err);
        }
    }

    async postFromFile(req, res){
        try {
            const result = await storynodeService.addFromFile(req.body.filename);
            res.status(200).json(result);
        } catch (err) {
            console.error(err);
            res.status(404).json(err);
        }
    }

    async postToFile(req, res){
        try {
            const result = await storynodeService.saveToFile(req.body);
            res.status(200).json(result);
        } catch (err) {
            console.error(err);
            res.status(404).json(err);
        }
    }

}

export default new storynodeController();