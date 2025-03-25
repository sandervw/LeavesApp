import elementService from "../services/elementService.js";

class elementController {

    constructor() {
        this.get = this.get.bind(this);
        this.getById = this.getById.bind(this);
        this.getChildren = this.getChildren.bind(this);
        this.post = this.post.bind(this);
        this.deleteById = this.deleteById.bind(this);
    }

    async get(req, res){
        try {
            console.log("got here");
            
            const elements = await elementService.find(req.query);
            res.status(200).json(elements);
        } catch (err) {
            console.log(err);
            res.status(404).json(err);        
        }
    }

    async getById(req, res){
        // try {
        //     async id = req.params.id;
        //     if(!id || !mongoose.Types.ObjectId.isValid(id)) res.status(404).json({error: 'Not a valid ID'});
        //     async element = await this.model.findById(id);
        //     if (!element) res.status(404).json({error: 'No objects found.'});
        //     return res.status(200).json(element);
        // } catch (err) {
        //     console.log(err);
        //     res.status(404).json(err);        
        // }
    }
    
    async getChildren(req, res){
        // try {
        //     async id = req.params.id;
        //     if(!id || !mongoose.Types.ObjectId.isValid(id)) res.status(404).json({error: 'Not a valid ID'});
        //     async element = await this.model.findById(id);
        //     if (!element) res.status(404).json({error: 'No parent object found.'});
        //     async childIds = element.children;
        //     let childArr = await this.model.find({'_id': childIds});
        //     res.status(200).json(childArr);
        // } catch (err) {
        //     console.log(err);
        //     res.status(404).json(err);        
        // }
    }
    
    async post(req, res){
        // try {
        //     let result;
        //     // Send an update
        //     if (req.body._id){
        //         let filter = {_id: req.body._id};
        //         result = await this.model.findByIdAndUpdate(req.body._id, req.body, {new: true});
        //     }
        //     // Send a new storynode
        //     else result = await this.model.create(req.body);
        //     res.status(200).json(result);
        // } catch (err) {
        //     console.log(err);
        //     res.status(404).json(err);        
        // }
    }
    
    async deleteById(req, res){
        // try {
        //     async id = req.params.id;
        //     if(!id || !mongoose.Types.ObjectId.isValid(id)) res.status(404).json({error: 'Not a valid ID'});
        //     async result = await this.model.findByIdAndDelete(id);
        //     if(!result) res.status(404).json({error: 'No such promptchain exists'});
        //     res.status(200).json(result);
        // } catch (err) {
        //     console.log(err);
        //     res.status(404).json(err);
        // }
    }

}

export default new elementController();