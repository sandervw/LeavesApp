import mongoose from 'mongoose';

// Gives us methods and typing for props on mongoDB document
export interface TreeDoc extends mongoose.Document<mongoose.Types.ObjectId> {
    name: string;
    type: string; // root, branch, or leaf
    text: string;
    children: string[]; // Array of ObjectIds referencing child nodes
    parent: string | null; // ObjectId referencing the parent node
    userId: mongoose.Types.ObjectId; // User ID to associate with the tree element
}

// Each schema maps to a MongoDB collection and defines the shape of the documents within that collection
// Discriminators are a way to have inheritance in a mongoose schema
const treeSchema = new mongoose.Schema<TreeDoc>({
    name: { type: String, required: true},
    type: {type: String, required: true },
    text: { type: String, default: '' },
    children: { type: [String], default: [] }, // Array of ObjectIds referencing child nodes
    parent: { type: String, default: null }, // ObjectId referencing the parent node
    userId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'User', index: true }, 
}, { discriminatorKey: 'kind', collection: 'trees', timestamps: true });

// Convert schema into model; a model is a constructor compiled from the schema definition
// Models are responsible for creating/reading docs from MongoDB
export const Tree = mongoose.model('element', treeSchema);