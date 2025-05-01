import mongoose from 'mongoose';
import { TreeDoc } from '../schemas/mongo.schema';

// Each schema maps to a MongoDB collection and defines the shape of the documents within that collection
const treeSchema = new mongoose.Schema<TreeDoc>({
    name: { type: String, required: true},
    type: {type: String, required: true },
    text: { type: String, default: '' },
    children: { type: [String], default: [] },
    parent: { type: String, default: null },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true }, 
}, {
    discriminatorKey: 'kind', // Discriminators are a way to have inheritance in a mongoose schema
    collection: 'trees',
    timestamps: true });

// Convert schema into model; a model is a constructor compiled from the schema definition
// Models are responsible for creating/reading docs from MongoDB
export const Tree = mongoose.model('tree', treeSchema);