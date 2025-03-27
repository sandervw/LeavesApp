import fs from 'fs';

// Function to build a JSON Storynode object from an array of strings
const buildJSON = async (arr) => {
    let storynode = {};
    // TODO implement this
    return storynode;
}

// Function to convert lines from a text file into a JSON object representing a storynode
const  readTxtAsJSON = async (fileName) => {
    try {
        // Read file contents synchronously (you can change this to async if needed)
        const fileContents = fs.readFileSync(`./docs/${fileName}`, 'utf-8');
        // Split the file contents by line
        const lines = fileContents.split(/\r?\n/);
        // Convert the lines to a storynode object
        const storynode = await buildJSON(lines);
        return storynode;
    } catch (err) {
        console.log(err);
    }
}

const readJSONFile = async (fileName) => {
    try {
        const data = fs.readFileSync(`./docs/${fileName}`);
        return JSON.parse(data);
    } catch (err) {
        console.log(err);
        return err;
    }
};

const readTxtAsArray = async (fileName) => {
    try {
        const data = fs.readFileSync(`./docs/${fileName}`, 'utf-8');
        return data.split(/\r?\n/);
    } catch (err) {
        console.log(err);
        return err;
    }
}

const writeJSONToFile = async (data, fileName) => {
    try {
        const jsonData = JSON.stringify(data, null, 2);
        fs.writeFileSync(`./docs/${fileName}`, jsonData);
        return true;
    } catch (err) {
        console.log(err);
        return err;
    }
}

const writeArrayToFile = async (arr, fileName) => {
    try {
        const data = arr.join('\n');
        fs.writeFileSync(`./docs/${fileName}`, data);
        return true;
    } catch (err) {
        console.log(err);
        return err;
    }
}

export {
    buildJSON,
    readJSONFile,
    readTxtAsJSON,
    readTxtAsArray,
    writeJSONToFile,
    writeArrayToFile
}