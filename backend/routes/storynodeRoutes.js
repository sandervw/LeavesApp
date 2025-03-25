import express from "express";
import storynodeController from "../controllers/storynodeController.js";

const router = express.Router();

// Get all storynodes
router.get('/', storynodeController.find);

// Get storynode by id
router.get('/:id', storynodeController.findById);

// Get storynode children
router.get('/getchildren/:id', storynodeController.findChildren);

// Upsert a storynode
router.post('/', storynodeController.post);

// Upsert a storynode from a template
router.post('/postfromtemplate/', storynodeController.postfromtemplate);

// Delete a storynode
router.delete('/:id', storynodeController.delete);

// Post a new story to the DB from a text file
router.post('/postfromfile/', storynodeController.postfromfile);

// Post a story to a text file
router.post('/posttofile/', storynodeController.posttofile);

export default router;