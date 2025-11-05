import mongoose from 'mongoose';
import { StorynodeDoc, TemplateDoc, TreeDoc } from '../schemas/mongo.schema';

// Each schema maps to a MongoDB collection and defines the shape of the documents within that collection
const treeSchema = new mongoose.Schema<TreeDoc>({
  name: { type: String, required: true },
  type: { type: String, required: true },
  text: { type: String, default: '' },
  children: { type: [String], default: [] },
  parent: { type: String, default: null },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true },
  depth: { type: Number, default: 0 },
}, {
  discriminatorKey: 'kind', // Discriminators are a way to have inheritance in a mongoose schema
  collection: 'trees',
  timestamps: true
});

// Schema for Templates
const templateSchema = new mongoose.Schema<TemplateDoc>({
  wordWeight: { type: Number, default: 100 },
});

// Schema for Storynodes
const storynodeSchema = new mongoose.Schema<StorynodeDoc>({
  isComplete: { type: Boolean, default: false, required: true },
  wordWeight: { type: Number },
  wordLimit: { type: Number },
  wordCount: { type: Number, default: 0 },
  archived: { type: Boolean, default: false },
});

// Convert schema into model; a model is a constructor compiled from the schema definition
// Models are responsible for creating/reading docs from MongoDB
export const Tree = mongoose.model('tree', treeSchema);
export const Template = Tree.discriminator('template', templateSchema);
export const Storynode = Tree.discriminator('storynode', storynodeSchema);

