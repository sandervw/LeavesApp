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
            const user_id = req.user._id;
            const storynodes = await storynodeService.find(req.query, user_id);
            res.status(200).json(storynodes);
        } catch (err) {
            console.log(err);
            res.status(404).json({error: err.message}); 
        }
    }

    async getById(req, res){
        try {
            const user_id = req.user._id;
            const storynode = await storynodeService.findById(req.params.id, user_id);
            return res.status(200).json(storynode);
        } catch (err) {
            console.log(err);
            res.status(404).json({error: err.message}); 
        }
    }
    
    async getChildren(req, res){
        try {
            const user_id = req.user._id;
            const children = await storynodeService.findChildren(req.params.id, user_id);
            res.status(200).json(children);
        } catch (err) {
            console.log(err);
            res.status(404).json({error: err.message}); 
        }
    }
    
    async post(req, res){
        try {
            const user_id = req.user._id;
            const result = await storynodeService.upsert(req.body, user_id);
            res.status(200).json(result);
        } catch (err) {
            console.log(err);
            res.status(404).json({error: err.message}); 
        }
    }
    
    async deleteById(req, res){
        try {
            const user_id = req.user._id;
            const result = await storynodeService.deleteById(req.params.id, user_id);
            res.status(200).json(result);
        } catch (err) {
            console.log(err);
            res.status(404).json({error: err.message}); 
        }
    }

    async postFromTemplate(req, res){
        try {
            const user_id = req.user._id;
            const result = await storynodeService.addFromTemplate(req.body, user_id);
            res.status(200).json(result);
        } catch (err) {
            console.log(err);
            res.status(404).json({error: err.message}); 
        }
    }

    async postFromFile(req, res){
        try {
            const user_id = req.user._id;
            const result = await storynodeService.addFromFile(req.body.filename, user_id);
            res.status(200).json(result);
        } catch (err) {
            console.log(err);
            res.status(404).json({error: err.message}); 
        }
    }

    async postToFile(req, res){
        try {
            const user_id = req.user._id;
            const result = await storynodeService.saveToFile(req.body, user_id);
            res.status(200).json(result);
        } catch (err) {
            console.log(err);
            res.status(404).json({error: err.message}); 
        }
    }

}

export default new storynodeController();