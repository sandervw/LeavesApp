import express from "express";
import elementController from "../controllers/elementController.js";

const router = express.Router();

// Get all storynodes
router.get('/', elementController.get);

// // Get storynode by id
// router.get('/:id', templateController.findById);

// // Get storynode children
// router.get('/getchildren/:id', templateController.findChildren);

// // Upsert a storynode
// router.post('/', templateController.post);

// // Delete a storynode
// router.delete('/:id', templateController.delete);

export default router;