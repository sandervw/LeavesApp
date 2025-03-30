import userService from "../services/userService.js";

class userController {

    constructor() {
        this.sync = this.post.bind(this);
    }

    async post(req, res){
        try {
            console.log("got here");
            const user = await userService.syncUser(req.body);
            res.status(200).json(user);
        } catch (err) {
            console.log(err);
            res.status(404).json(err);        
        }
    }

}

export default new userController();