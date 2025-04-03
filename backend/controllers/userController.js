import userService from "../services/userService.js";

class userController {

    constructor() {
        this.signup = this.signup.bind(this);
        this.login = this.login.bind(this);
    }

    async signup(req, res){
        try {
            const result = await userService.signupUser(req.body);
            res.status(200).json(result);
        } catch (err) {
            console.log(err);
            res.status(400).json({error: err.message});        
        }
    }

    async login(req, res){
        try {
            const result = await userService.loginUser(req.body);
            res.status(200).json(result);
        } catch (err) {
            console.log(err);
            res.status(400).json({error: err.message}); 
        }
    }

}

export default new userController();