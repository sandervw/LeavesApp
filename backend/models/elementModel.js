/*
Define an abstract schema with shared fields:
Name, Type, Text, and Timestamps
*/
import mongoose from 'mongoose';

// Discriminators are a way to have inheritance in a mongoose schema
const options = { discriminatorKey: 'kind', collection: 'elements', timestamps: true };

// Each schema maps to a MongoDB collection and defines the shape of the documents within that collection
const Schema = mongoose.Schema;

const elementSchema = new Schema({
    name: { type: String, required: true},
    type: {type: String, required: true },
    text: { type: String },
}, options);

// Convert schema into model; a model is a constructor compiled from the schema definition
// Models are responsible for creating/reading docs from MongoDB
const Element = mongoose.model('element', elementSchema);

export {Element};