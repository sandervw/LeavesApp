import mongoose from 'mongoose';

// Discriminators are a way to have inheritance in a mongoose schema
const options = { collection: 'users', timestamps: true };

// Each schema maps to a MongoDB collection and defines the shape of the documents within that collection
const Schema = mongoose.Schema;

//Schema for Users
const userSchema = new Schema({
    auth0Id: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
}, options);
const User = mongoose.model('user', userSchema);

export {User};