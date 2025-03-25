import mongoose from 'mongoose';
import { Element } from './elementModel.js';

const Schema = mongoose.Schema;

// Schema for Prompts
const promptSchema = new Schema ({});

// Schema for Promptchains
const promptchainSchema = new Schema({
    type: { type: String, default: 'generic' }, // Structure, Style, Filter; generic if blank
    prompts: { type: [String] }, // String array containing the prompts to use
}, {timestamps: true});

// Schema for Templates
const templateSchema = new Schema({
    children: { type: [String] }, // String array containing the child element IDs
    wordWeight: { type: Number }, // Used to store the percentage of the word count that this element should take up
});

// Schema for Storynodes
// Types: Story, Act, Chapter, Scene, Blob
const storynodeSchema = new Schema ({
    content: { type: String }, // Used in blob nodes; contains actual blob, instead of outline data
    promptchains: { type: [promptchainSchema] }, // Contains prompt chains for AI generation
    isComplete: { type: Boolean, default: false, required: true }, // Used for rendering a finished vs unfinished element
    parent: { type: String }, // String containing parent node
    children: { type: [String] }, // String array containing the child node IDs
    wordWeight: { type: Number }, // Used to store the percentage of the word count that this element should take up
    wordLimit: { type: Number }, // Used to store the maximum number of words for this node
    wordCount: { type: Number }, // Used to store the current word count for this node
    archived: { type: Boolean, default: false }, // Used to store whether a story is archived or not
});

const Prompt = Element.discriminator('prompt', promptSchema);
const Promptchain = Element.discriminator('promptchain', promptchainSchema);
const Template = Element.discriminator('template', templateSchema);
const Storynode = Element.discriminator('storynode', storynodeSchema);

export {Prompt, Promptchain, Template, Storynode};
