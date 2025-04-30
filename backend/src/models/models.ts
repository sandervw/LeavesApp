import mongoose from 'mongoose';
import { Tree } from './tree.model';
import { StorynodeDoc, TemplateDoc } from '../schemas/mongo.schema';

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

const Template = Tree.discriminator('template', templateSchema);
const Storynode = Tree.discriminator('storynode', storynodeSchema);

export {Template, Storynode};
