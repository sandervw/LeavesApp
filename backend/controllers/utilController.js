import {Promptchain, Prompt} from "../models/models.js";
import { writeJSONToFile, readJSONFile, readTxtAsArray, writeArrayToFile } from "../services/fileService.js";
import { getResponse } from "../services/AIService.js";

// Utility functions based around AI and filesystem operations
class UtilController {

    constructor(model) {
        this.model = model;
    }

        // Function to export all structure prompts to a json file
    // Allows for reloading later
    async exportStructures(req, res) {
        try {
            const filename = req.body.filename;
            const prompts = await Prompt.find({type: "structure"});
            writeJSONToFile(prompts, filename);
            res.status(200).json(prompts);
        } catch (err) {
            console.log(err);
            res.status(404).json(err);
        }
    }

    // Function to import structure prompts from a json file
    async importStructures(req, res) {
        try {
            const filename = req.body.filename;
            const data = await readJSONFile(filename);
            console.log(data);
            
            for (const prompt of data) {
                const newPrompt = new Prompt({...prompt, type: "structure"});
                await newPrompt.save();
                
            }
            res.status(200).json(data);
        } catch (err) {
            console.log(err);
            res.status(404).json(err);
        }
    }

    // Function to convert all current structure prompts to promptchains
    // Allows for easy conversion of existing prompts
    async convertPrompts(req, res) {
        try {
            const prompts = await Prompt.find({type: "structure"});
            for (const prompt of prompts) {
                //console.log({name: prompt.name, text: prompt.text, type: "structure", prompts: [prompt.text]});
                
                const newPromptchain = new Promptchain({name: prompt.name, text: prompt.text, type: "structure", prompts: [prompt.text]});
                await newPromptchain.save();
            }
            res.status(200).json(prompts);
        } catch (err) {
            console.log(err);
            res.status(404).json(err);
        }
    }

    // Function that, given a GPT conversation as a precursor, and a seperate file,
    // goes through the file and sends each blob to the gpt model,
    // applying the precursor conversation first, and writes the
    // AI responses only to a txt file
    async precursorAIResponses(req, res) {
        try {
            const model = req.body.model;
            const precursor = await readJSONFile(req.body.precursorFile);
            console.log(precursor);
            const blobs = await readTxtAsArray(req.body.blobFile);
            console.log(blobs);

            let results = [];
            
            let conversation = precursor;
             for (const blob of blobs) {
                 const message = {role: 'system', content: blob};
                 let prompt = [...conversation, message];
                 const response = await getResponse(prompt, model);
                 results = [...results, response.content.split("\n")].flat();
             }
             writeArrayToFile(results, req.body.outputFile);
            res.status(200).json(results);
        } catch (err) {
            console.log(err);
            res.status(404).json(err);
        }
    }

}

export default new UtilController();