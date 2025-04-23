import { User } from '../models/userModel.js';
import jwt from 'jsonwebtoken';

export const signupUser = async (userData) => {
    const { email, username, password } = userData;
    const user = await this.model.signup(email, username, password);
    const token = await this.createToken(user._id);
    return { email, username, token }; //returning the user data and token
}

// Username can be email or username
export const loginUser = async (userData) => {
    const { email, username, password } = userData;
    // Check if username is email or username
    let query = email ? email : username;
    const user = await this.model.login(query, password);
    const token = await this.createToken(user._id);
    return { email: user.email, username: user.username, token };
}

// Generate JWT Token
async createToken(_id) {
    return jwt.sign({ _id }, process.env.JWT_SECRET, { expiresIn: '3d' });
}