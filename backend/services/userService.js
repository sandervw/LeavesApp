import mongoose from "mongoose";
import { User } from "../models/userModel.js";

class userService {

    constructor() {
        this.model = User;
        this.syncUser = this.syncUser.bind(this);
    }

    async syncUser(userData) {
        const { auth0Id, name, email } = userData;
        let user = await this.model.findOne({ auth0Id });
        if (!user) {
            user = await this.model.create({ auth0Id, name, email });
        } else {
            user.name = name;
            user.email = email;
            await user.save();
        }
        return user;
    }

}

export default new userService();