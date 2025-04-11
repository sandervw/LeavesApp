import templateService from "../services/templateService.js";

class templateController {

    constructor() {
        this.get = this.get.bind(this);
        this.getById = this.getById.bind(this);
        this.getChildren = this.getChildren.bind(this);
        this.post = this.post.bind(this);
        this.deleteById = this.deleteById.bind(this);
    }

    async get(req, res){
        try {
            const user_id = req.user._id;
            const templates = await templateService.find(req.query, user_id);
            res.status(200).json(templates);
        } catch (err) {
            console.log(err);
            res.status(404).json({error: err.message}); 
        }
    }

    async getById(req, res){
        try {
            const user_id = req.user._id;
            const template = await templateService.findById(req.params.id, user_id);
            return res.status(200).json(template);
        } catch (err) {
            console.log(err);
            res.status(404).json({error: err.message}); 
        }
    }
    
    async getChildren(req, res){
        try {
            const user_id = req.user._id;
            const children = await templateService.findChildren(req.params.id, user_id);
            res.status(200).json(children);
        } catch (err) {
            console.log(err);
            res.status(404).json({error: err.message}); 
        }
    }
    
    async post(req, res){
        try {
            const user_id = req.user._id;
            const result = await templateService.upsert(req.body, user_id);
            res.status(200).json(result);
        } catch (err) {
            console.log(err);
            res.status(404).json({error: err.message}); 
        }
    }
    
    async deleteById(req, res){
        try {
            const user_id = req.user._id;
            const result = await templateService.deleteById(req.params.id, user_id);
            res.status(200).json(result);
        } catch (err) {
            console.log(err);
            res.status(404).json({error: err.message}); 
        }
    }  

}

export default new templateController();