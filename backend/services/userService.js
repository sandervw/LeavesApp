import mongoose from "mongoose";
import { User } from "../models/userModel.js";

class userService {

    constructor() {
        this.model = User;
        this.signupUser = this.signupUser.bind(this);
        this.loginUser = this.loginUser.bind(this);
    }

    async signupUser(userData) {
        const { email, username, password } = userData;
        return await this.model.signup(email, username, password);
        
    }

    async loginUser(userData) {
        //const user = await this.model.findOne({ email: userData.email });
        //TODO
        return {mssg: "User logged in"};
        
    }

}

export default new userService();