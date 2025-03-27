import mongoose from 'mongoose';
import { Element } from './elementModel.js';

const Schema = mongoose.Schema;

// Schema for Templates
const templateSchema = new Schema({
    children: { type: [String] }, // String array containing the child element IDs
    wordWeight: { type: Number, default: 100 }, // Used to store the percentage of the word count that this element should take up
});

// Schema for Storynodes
// Types: root, branch, leaf
const storynodeSchema = new Schema ({
    content: { type: String }, // Used in leaf nodes; contains actual leaf, instead of outline data
    isComplete: { type: Boolean, default: false, required: true }, // Used for rendering a finished vs unfinished element
    parent: { type: String }, // String containing parent node
    children: { type: [String] }, // String array containing the child node IDs
    wordWeight: { type: Number }, // Used to store the percentage of the word count that this element should take up
    wordLimit: { type: Number }, // Used to store the maximum number of words for this node
    wordCount: { type: Number }, // Used to store the current word count for this node
    archived: { type: Boolean, default: false }, // Used to store whether a story is archived or not
});

const Template = Element.discriminator('template', templateSchema);
const Storynode = Element.discriminator('storynode', storynodeSchema);

export {Template, Storynode};
