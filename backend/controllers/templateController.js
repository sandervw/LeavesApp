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
            const templates = await templateService.find(req.query);
            res.status(200).json(templates);
        } catch (err) {
            console.log(err);
            res.status(404).json(err);        
        }
    }

    async getById(req, res){
        try {
            const template = await templateService.findById(req.params.id);
            return res.status(200).json(template);
        } catch (err) {
            console.log(err);
            res.status(404).json(err);        
        }
    }
    
    async getChildren(req, res){
        try {
            const children = await templateService.findChildren(req.params.id);
            res.status(200).json(children);
        } catch (err) {
            console.error(err);
            res.status(404).json(err);
        }
    }
    
    async post(req, res){
        try {
            const result = await templateService.upsert(req.body);
            res.status(200).json(result);
        } catch (err) {
            console.error(err);
            res.status(404).json(err);
        }
    }
    
    async deleteById(req, res){
        try {
            const result = await templateService.deleteById(req.params.id);
            res.status(200).json(result);
        } catch (err) {
            console.error(err);
            res.status(404).json(err);
        }
    }  

}

export default new templateController();