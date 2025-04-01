import mongoose from 'mongoose';
import bcrypt from 'bcrypt';

// Discriminators are a way to have inheritance in a mongoose schema
const options = { collection: 'users', timestamps: true };

// Each schema maps to a MongoDB collection and defines the shape of the documents within that collection
const Schema = mongoose.Schema;

//Schema for Users
const userSchema = new Schema({
    email: { type: String, required: true, unique: true },
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
}, options);

// static signup method
userSchema.statics.signup = async function(email, username, password) {
    // validation
    if (!email || !username || !password) {
        throw Error('All fields must be filled');
    }
    if (!email.includes('@')) {
        throw Error('Email is not valid');
    }
    if (password.length < 6) {
        throw Error('Password must be at least 6 characters long');
    }
    const emailExists = await User.findOne({ email });
    if (emailExists) {
        throw Error('Email already in use');
    }
    const userExists = await User.findOne({ username });
    if (userExists) {
        throw Error('Username already in use');
    }

    const salt = await bcrypt.genSalt(10); // takes time to complete by design
    const hash = await bcrypt.hash(password, salt);
    const user = await User.create({ email, username, password: hash });
    return user;
}

const User = mongoose.model('user', userSchema);

export {User};